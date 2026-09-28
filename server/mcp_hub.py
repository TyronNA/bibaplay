"""Server làm MCP client: nối vào các MCP server (Gmail, Jira, Slack…) rồi đưa tool của chúng cho Gemini.

Cấu hình ~/.config/ares/mcp.json (ARES_MCP_CONFIG để đổi), cùng dạng với Claude Desktop:

  {"mcpServers": {
     "jira":  {"url": "https://.../mcp", "headers": {"Authorization": "Bearer ..."}},
     "gmail": {"command": "npx", "args": ["-y", "..."], "env": {"...": "..."}},
     "slack": {"command": "...", "exclude": ["post_message"]},   // giấu tool khỏi model
     "demo":  {"command": "python", "args": ["mcp_demo.py"], "tools": ["get_time"]},  // chỉ lấy các tool này
     "tat":   {"command": "...", "disabled": true}
  }}

Tên tool đưa cho Gemini là "<server>__<tool>". Không có file cấu hình thì hub rỗng, server chạy như cũ.
"""
import asyncio
import json
import logging
import os
import re

log = logging.getLogger("server")

CONFIG_PATH = os.environ.get("ARES_MCP_CONFIG", os.path.expanduser("~/.config/ares/mcp.json"))
START_TIMEOUT = 90      # npx lần đầu phải tải package
CALL_TIMEOUT = 30
RETRY_AFTER = 30        # MCP server chết thì chờ bấy lâu rồi mở lại


def gemini_schema(s, defs: dict | None = None, depth: int = 0) -> dict:
    """JSON Schema (MCP inputSchema) -> Schema của Gemini (tập con OpenAPI, type viết hoa).
    Gemini từ chối field lạ ($schema, additionalProperties, default…) nên chỉ chép field nó hiểu."""
    if not isinstance(s, dict) or depth > 12:
        return {"type": "STRING"}
    defs = defs if defs is not None else s.get("$defs") or s.get("definitions") or {}
    if "$ref" in s:
        target = defs.get(s["$ref"].rsplit("/", 1)[-1], {})
        return gemini_schema({**target, **{k: v for k, v in s.items() if k != "$ref"}}, defs, depth + 1)
    for key in ("anyOf", "oneOf"):
        if key in s:
            opts = [o for o in s[key] if isinstance(o, dict) and o.get("type") != "null"]
            rest = {k: v for k, v in s.items() if k != key}
            out = gemini_schema({**(opts[0] if opts else {"type": "string"}), **rest}, defs, depth + 1)
            if len(opts) < len(s[key]):
                out["nullable"] = True
            return out
    if "allOf" in s and s["allOf"]:
        merged = {k: v for k, v in s.items() if k != "allOf"}
        for part in s["allOf"]:
            merged = {**part, **merged}
        return gemini_schema(merged, defs, depth + 1)

    t = s.get("type")
    nullable = False
    if isinstance(t, list):
        nullable = "null" in t
        t = next((x for x in t if x != "null"), "string")
    if t is None:
        t = "object" if "properties" in s else "array" if "items" in s else "string"
    out = {"type": str(t).upper()}
    if nullable:
        out["nullable"] = True
    if isinstance(s.get("description"), str):
        out["description"] = s["description"][:1000]
    if t == "string" and isinstance(s.get("enum"), list):
        out["enum"] = [str(v) for v in s["enum"]]
    if t == "object":
        props = {k: gemini_schema(v, defs, depth + 1) for k, v in (s.get("properties") or {}).items()}
        if props:
            out["properties"] = props
            req = [r for r in s.get("required") or [] if r in props]
            if req:
                out["required"] = req
    elif t == "array":
        out["items"] = gemini_schema(s.get("items") or {"type": "string"}, defs, depth + 1)
    return out


def gemini_name(server: str, tool: str) -> str:
    return re.sub(r"[^A-Za-z0-9_]", "_", f"{server}__{tool}")[:64]


def result_text(res) -> str:
    parts = []
    for c in res.content or []:
        if getattr(c, "type", None) == "text":
            parts.append(c.text)
        else:
            parts.append(f"[{getattr(c, 'type', 'content')}]")
    if not parts and res.structured_content is not None:
        parts.append(json.dumps(res.structured_content, ensure_ascii=False))
    return "\n".join(parts)


class McpServer:
    def __init__(self, name: str, cfg: dict):
        self.name, self.cfg = name, cfg
        self.client = None
        self.tools: dict[str, tuple[str, dict]] = {}   # tên Gemini -> (tên gốc, declaration)
        self.stop = asyncio.Event()
        self.task: asyncio.Task | None = None
        self.http = None                # httpx2 client của transport HTTP; mình tạo thì mình đóng

    def target(self):
        # import muộn: server vẫn chạy được (không có tool) khi chưa cài gói mcp
        from mcp import StdioServerParameters
        if "url" in self.cfg:
            import httpx2
            from mcp.client.streamable_http import streamable_http_client
            self.http = httpx2.AsyncClient(headers=self.cfg.get("headers") or {}, timeout=CALL_TIMEOUT)
            return streamable_http_client(self.cfg["url"], http_client=self.http)
        return StdioServerParameters(command=self.cfg["command"], args=self.cfg.get("args") or [],
                                     env=self.cfg.get("env"), cwd=self.cfg.get("cwd"))

    def pick(self, tools) -> dict:
        only, exclude = self.cfg.get("tools"), set(self.cfg.get("exclude") or [])
        out = {}
        for t in tools:
            if (only is not None and t.name not in only) or t.name in exclude:
                continue
            decl = {"name": gemini_name(self.name, t.name),
                    "description": (t.description or t.title or t.name)[:2000]}
            params = gemini_schema(t.input_schema or {})
            if params.get("properties"):
                decl["parameters"] = params
            ro = getattr(t.annotations, "read_only_hint", None) if t.annotations else None
            log.info("MCP %s: tool %s (%s)", self.name, t.name,
                     "chỉ đọc" if ro else "CÓ THỂ GHI" if ro is False else "không rõ đọc/ghi")
            out[decl["name"]] = (t.name, decl)
        return out

    async def run(self, ready: asyncio.Event):
        """Giữ kết nối trong đúng một task: context của anyio phải vào và ra cùng task."""
        from mcp import Client
        while not self.stop.is_set():
            try:
                async with Client(self.target(), read_timeout_seconds=CALL_TIMEOUT) as c:
                    tools, cursor = [], None
                    while True:
                        page = await c.list_tools(cursor=cursor)
                        tools += page.tools
                        cursor = page.next_cursor
                        if not cursor:
                            break
                    self.tools = self.pick(tools)
                    self.client = c
                    log.info("MCP %s sẵn sàng: %d tool", self.name, len(self.tools))
                    ready.set()
                    await self.stop.wait()
            except asyncio.CancelledError:
                raise
            except Exception as e:
                log.error("MCP %s lỗi: %s", self.name, e)
            finally:
                self.client, self.tools = None, {}
                if self.http is not None:
                    await self.http.aclose()
                    self.http = None
            ready.set()                 # lỗi cũng tính là xong lượt khởi động
            if not self.stop.is_set():
                try:
                    await asyncio.wait_for(self.stop.wait(), RETRY_AFTER)
                except asyncio.TimeoutError:
                    pass


class McpHub:
    def __init__(self, path: str = CONFIG_PATH):
        self.servers: dict[str, McpServer] = {}
        try:
            with open(path) as f:
                cfg = json.load(f).get("mcpServers") or {}
        except FileNotFoundError:
            cfg = {}
        except (OSError, json.JSONDecodeError) as e:
            log.error("đọc %s lỗi: %s — chạy không có tool MCP", path, e)
            cfg = {}
        for name, c in cfg.items():
            if c.get("disabled"):
                continue
            if "url" not in c and "command" not in c:
                log.error("MCP %s: thiếu 'url' hoặc 'command', bỏ qua", name)
                continue
            self.servers[name] = McpServer(name, c)

    async def start(self, wait: float = 0):
        """Chạy nền; `wait` > 0 thì chờ tối đa bấy lâu cho mọi server báo sẵn sàng (dùng khi test)."""
        if not self.servers:
            return
        try:
            import mcp  # noqa: F401
        except ImportError:
            log.error("chưa cài gói mcp (pip install -r requirements.txt) — bỏ qua %d MCP server",
                      len(self.servers))
            self.servers = {}
            return
        events = []
        for s in self.servers.values():
            ev = asyncio.Event()
            events.append(ev)
            s.task = asyncio.create_task(s.run(ev))
        if wait:
            try:
                await asyncio.wait_for(asyncio.gather(*(e.wait() for e in events)), wait)
            except asyncio.TimeoutError:
                log.warning("MCP: còn server chưa sẵn sàng sau %.0f s", wait)

    async def close(self):
        for s in self.servers.values():
            s.stop.set()
        tasks = [s.task for s in self.servers.values() if s.task]
        if tasks:
            await asyncio.wait(tasks, timeout=10)

    def declarations(self) -> list[dict]:
        """Chụp danh sách tool lúc mở phiên Gemini; server lên muộn thì phiên sau mới có."""
        return [d for s in self.servers.values() for _, d in s.tools.values()]

    def owns(self, name: str) -> bool:
        return any(name in s.tools for s in self.servers.values())

    async def call(self, name: str, args: dict) -> tuple[str, bool]:
        """Trả (text, is_error). Không ném lỗi: lỗi cũng là câu trả lời cho model."""
        for s in self.servers.values():
            if name in s.tools and s.client is not None:
                orig = s.tools[name][0]
                try:
                    res = await asyncio.wait_for(s.client.call_tool(orig, args or {}), CALL_TIMEOUT)
                except asyncio.TimeoutError:
                    return f"tool {orig} quá {CALL_TIMEOUT} s không trả lời", True
                except Exception as e:
                    return f"tool {orig} lỗi: {e}", True
                return result_text(res), bool(res.is_error)
        return f"không có tool {name} (MCP server đang tắt?)", True
