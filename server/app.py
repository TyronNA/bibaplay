"""Server riêng cho firmware xiaozhi — thay xiaozhi.me.

Hai endpoint trên cùng một cổng:
  POST /xiaozhi/ota/  thiết bị gọi lúc khởi động (CONFIG_OTA_URL); trả về địa chỉ WebSocket
  GET  /xiaozhi/v1/   WebSocket nói chuyện, giao thức theo xiaozhi-esp32/docs/websocket.md

Có GEMINI_API_KEY: mỗi kết nối thiết bị = một phiên Gemini Live (nghe + nghĩ + nói trong một model).
Không có key: chế độ ECHO — thu câu bạn nói, hết câu thì phát lại (để test đường truyền).
Tool MCP (mail, Jira, Slack…): mcp_hub.py. Trace lượt/tool/token/chi phí vào SQLite: tracing.py.

  GEMINI_API_KEY=... ARES_DEVICES=aa:bb:cc:dd:ee:ff .venv/bin/python app.py [--port 8000]
"""
import argparse
import asyncio
import base64
import json
import logging
import os
import re
import secrets
import socket
import time
import uuid

import aiohttp
import opuslib
from aiohttp import WSMsgType, web

from mcp_hub import McpHub, gemini_name, gemini_schema
from tracing import Tracer

log = logging.getLogger("server")

IN_RATE = 16000         # thiết bị luôn gửi 16 kHz mono (GetHelloMessage)
FRAME_MS = 60           # OPUS_FRAME_DURATION_MS
IN_SAMPLES = IN_RATE * FRAME_MS // 1000
GEMINI_RATE = 24000     # Live API luôn trả PCM 24 kHz

# VAD kiểu năng lượng cho chế độ echo; Gemini tự có VAD
SPEECH_RMS = 500        # biên độ int16; tiếng ồn phòng thường < 200
END_SILENCE_MS = 700    # im lặng bấy lâu sau khi đã có tiếng nói = hết câu
MAX_UTTERANCE_MS = 15000
RESULT_MAX = 6000       # ký tự kết quả tool gửi lại Gemini; dài hơn chỉ tốn token, robot đọc không hết
DEVICE_TIMEOUT = 5      # s chờ chip trả lời MCP (initialize, tools/list, tools/call)

GEMINI_WS = ("wss://generativelanguage.googleapis.com/ws/"
             "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-live")
GEMINI_VOICE = os.environ.get("GEMINI_VOICE", "Kore")
# Tính cách robot. Dặn nói ngắn vì loa nhỏ và người nghe phải chờ.
SYSTEM_PROMPT = os.environ.get("ARES_PROMPT", (
    "Bạn là ARES, một robot trợ lý nhỏ trên bàn làm việc. Luôn trả lời bằng tiếng Việt, "
    "ngắn gọn 1-3 câu, giọng thân thiện, hơi tinh nghịch. "
    "Mỗi lượt trả lời, gọi hàm set_emotion MỘT lần để đổi nét mặt cho hợp với câu trả lời."))
# Chỉ nối vào prompt khi có tool MCP. Model không phân biệt được tool đọc hay ghi nên phải dặn.
TOOL_RULES = (
    "Bạn có các tool nối vào mail, Jira, Slack… của chủ nhân. Khi được hỏi, gọi tool để lấy dữ liệu thật, "
    "rồi chỉ nói lại ý chính (vài mục quan trọng nhất), không đọc nguyên danh sách. "
    "Trước khi gọi tool làm thay đổi dữ liệu (gửi, trả lời, comment, tạo, sửa, xoá), phải đọc lại "
    "nội dung sẽ làm và chờ chủ nhân nói đồng ý rõ ràng. Tool báo lỗi thì nói thật là lỗi.")
# Chỉ nối vào prompt khi chip có tool (MCP phía thiết bị, vd motor ở bài 17.2). Robot chạy thật trên sàn nên phải dặn.
DEVICE_RULES = (
    "Các tool tên bắt đầu bằng chip__ điều khiển chính thân robot (bánh xe, âm lượng…). "
    "Chỉ cho robot di chuyển khi chủ nhân yêu cầu rõ ràng, mỗi lần một đoạn ngắn; nghe không rõ thì hỏi lại. "
    "Chủ nhân nói dừng thì gọi tool dừng ngay.")
# phải khớp tên trong firmware/boards/ares-bread/robot_face.c
EMOTIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking", "sleepy", "winking", "confused"]


def lan_ip() -> str:
    """IP LAN của máy này — thiết bị phải gọi được địa chỉ này, không phải 127.0.0.1."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))   # UDP connect không gửi gói, chỉ để OS chọn card mạng
        return s.getsockname()[0]
    finally:
        s.close()


def rms(pcm: bytes) -> float:
    n = len(pcm) // 2
    if not n:
        return 0.0
    total = 0
    for i in range(0, n * 2, 2):
        v = int.from_bytes(pcm[i:i + 2], "little", signed=True)
        total += v * v
    return (total / n) ** 0.5


def allowed(request: web.Request) -> bool:
    """OTA phát token cho ai gọi tới, nên token không chặn được người lạ: chặn bằng Device-Id (MAC chip) ở
    ARES_DEVICES. Gọi từ chính máy này (fake_device.py, mac_device.py) thì luôn cho qua."""
    dev = (request.headers.get("Device-Id") or "").strip().lower()
    # Tunnel/reverse proxy (cloudflared…) chạy trên cùng máy cũng tới từ 127.0.0.1: mang header proxy thì là
    # người ngoài Internet, không phải script local.
    proxied = any(h in request.headers for h in ("X-Forwarded-For", "CF-Connecting-IP", "Forwarded", "X-Real-IP"))
    return dev in request.app["devices"] or (request.remote in ("127.0.0.1", "::1") and not proxied)


def refuse(request: web.Request):
    log.warning("từ chối Device-Id=%s từ %s — là chip của bạn thì thêm vào ARES_DEVICES",
                request.headers.get("Device-Id"), request.remote)
    raise web.HTTPForbidden(text="device not allowed")


async def ota(request: web.Request) -> web.Response:
    if not allowed(request):
        refuse(request)
    body = await request.text()
    info = {}
    try:
        info = json.loads(body) if body else {}
    except json.JSONDecodeError:
        pass
    log.info("OTA check device=%s client=%s board=%s",
             request.headers.get("Device-Id"), request.headers.get("Client-Id"),
             (info.get("board") or {}).get("type"))
    host = request.app["public_host"]
    # Không trả "activation" -> firmware bỏ qua bước nhập mã kích hoạt.
    # Không trả "mqtt" -> firmware chọn WebsocketProtocol (application.cc).
    # Không trả "firmware" -> không OTA; chưa có server phát firmware.
    return web.json_response({
        "websocket": {"url": f"ws://{host}/xiaozhi/v1/", "token": request.app["token"], "version": 1},
        "server_time": {"timestamp": int(time.time() * 1000), "timezone_offset": 7 * 60},
    })


class Session:
    """Một kết nối thiết bị. Lớp con quyết định trả lời thế nào."""
    out_rate = IN_RATE

    def __init__(self, ws: web.WebSocketResponse):
        self.ws = ws
        self.id = uuid.uuid4().hex[:12]
        self.decoder = opuslib.Decoder(IN_RATE, 1)
        self.listening = False
        # MCP phía thiết bị: server là client, chip là server (xiaozhi-esp32/docs/mcp-protocol.md)
        self.dev_tools: dict[str, tuple[str, dict]] = {}   # tên đưa Gemini -> (tên tool trên chip, declaration)
        self.dev_ready = asyncio.Event()
        self.rpc_id = 0
        self.rpc_wait: dict[int, asyncio.Future] = {}
        self.mcp_task = None

    async def send(self, **msg):
        msg.setdefault("session_id", self.id)
        if not self.ws.closed:
            await self.ws.send_str(json.dumps(msg, ensure_ascii=False))

    async def on_text(self, msg: dict):
        t = msg.get("type")
        if t == "hello":
            # sample_rate ở đây là tốc độ server GỬI xuống; chip giải mã theo số này
            await self.send(type="hello", transport="websocket",
                            audio_params={"format": "opus", "sample_rate": self.out_rate,
                                          "channels": 1, "frame_duration": FRAME_MS})
            if (msg.get("features") or {}).get("mcp") and self.mcp_task is None:
                self.mcp_task = asyncio.create_task(self.load_device_tools())
            else:
                self.dev_ready.set()
        elif t == "listen":
            state = msg.get("state")
            log.info("[%s] listen %s mode=%s", self.id, state, msg.get("mode"))
            if state == "start":
                self.listening = True
                await self.on_listen_start()
            elif state == "stop":           # chế độ manual: người dùng nhả nút = hết câu
                self.listening = False
                await self.on_listen_stop()
        elif t == "abort":
            log.info("[%s] abort %s", self.id, msg.get("reason"))
            await self.on_abort()
        else:
            log.info("[%s] <- %s", self.id, msg)

    # ---- MCP với chip ----
    # Tin "mcp" được websocket() giao thẳng cho on_mcp lúc vừa đọc, không qua hàng đợi: chip gửi hello rồi
    # listen start liền nhau, và xử lý listen start (mở Gemini) phải chờ được danh sách tool mà không chặn việc đọc.

    async def rpc(self, method: str, params: dict, timeout: float = DEVICE_TIMEOUT) -> dict:
        self.rpc_id += 1
        rid = self.rpc_id
        fut = asyncio.get_running_loop().create_future()
        self.rpc_wait[rid] = fut
        try:
            await self.send(type="mcp", payload={"jsonrpc": "2.0", "method": method, "params": params, "id": rid})
            return await asyncio.wait_for(fut, timeout)
        finally:
            self.rpc_wait.pop(rid, None)

    def on_mcp(self, p: dict):
        fut = self.rpc_wait.get(p.get("id"))
        if fut is not None and not fut.done():
            fut.set_result(p)
        else:                               # thông báo từ chip (notifications/...) hoặc trả lời đã quá hạn
            log.info("[%s] mcp <- %s", self.id, json.dumps(p, ensure_ascii=False)[:300])

    async def load_device_tools(self):
        try:
            await self.rpc("initialize", {"capabilities": {}})
            tools, cursor = [], ""
            while True:
                res = (await self.rpc("tools/list", {"cursor": cursor})).get("result") or {}
                tools += res.get("tools") or []
                cursor = res.get("nextCursor") or ""
                if not cursor:
                    break
            for t in tools:
                if not t.get("name"):
                    continue
                decl = {"name": gemini_name("chip", t["name"]), "description": (t.get("description") or t["name"])[:2000]}
                params = gemini_schema(t.get("inputSchema") or {})
                if params.get("properties"):
                    decl["parameters"] = params
                self.dev_tools[decl["name"]] = (t["name"], decl)
            log.info("[%s] chip có %d tool: %s", self.id, len(tools), [t.get("name") for t in tools])
        except asyncio.CancelledError:
            raise
        except Exception as e:              # chip cũ / không trả lời: chạy tiếp không có tool của chip
            log.warning("[%s] không lấy được tool của chip: %r", self.id, e)
        finally:
            self.dev_ready.set()

    async def call_device(self, name: str, args: dict) -> tuple[str, bool]:
        """Trả (text, is_error) như McpHub.call."""
        orig = self.dev_tools[name][0]
        try:
            r = await self.rpc("tools/call", {"name": orig, "arguments": args or {}})
        except asyncio.TimeoutError:
            return f"chip không trả lời tool {orig} sau {DEVICE_TIMEOUT} s", True
        if "error" in r:
            e = r["error"] or {}
            return str(e.get("message") if isinstance(e, dict) else e), True
        res = r.get("result") or {}
        text = "\n".join(c.get("text", f"[{c.get('type')}]") for c in res.get("content") or [])
        return text, bool(res.get("isError"))

    def close_mcp(self):
        if self.mcp_task is not None:
            self.mcp_task.cancel()
        for fut in self.rpc_wait.values():
            if not fut.done():
                fut.cancel()

    async def on_listen_start(self): ...
    async def on_listen_stop(self): ...
    async def on_abort(self): ...
    async def on_audio(self, frame: bytes): ...
    async def close(self):
        self.close_mcp()


class EchoSession(Session):
    def __init__(self, ws):
        super().__init__(ws)
        self.reset()

    def reset(self):
        self.frames: list[bytes] = []
        self.heard_speech = False
        self.silence_ms = 0

    async def on_listen_start(self):
        self.reset()

    async def on_listen_stop(self):
        await self.end_of_utterance()

    async def on_audio(self, frame: bytes):
        if not self.listening:
            return
        self.frames.append(frame)
        loud = rms(self.decoder.decode(frame, IN_SAMPLES)) >= SPEECH_RMS
        if loud:
            self.heard_speech, self.silence_ms = True, 0
        elif self.heard_speech:
            self.silence_ms += FRAME_MS
        too_long = len(self.frames) * FRAME_MS >= MAX_UTTERANCE_MS
        if (self.heard_speech and self.silence_ms >= END_SILENCE_MS) or too_long:
            self.listening = False          # frame tới trong lúc nói bị bỏ, như thiết bị làm
            await self.end_of_utterance()

    async def end_of_utterance(self):
        frames, spoke = self.frames, self.heard_speech
        self.reset()
        if not spoke:
            log.info("[%s] không nghe thấy tiếng nói, bỏ qua", self.id)
            return
        tail = END_SILENCE_MS // FRAME_MS   # cắt đuôi im lặng để phát lại cho gọn
        frames = frames[:-tail] if len(frames) > tail else frames
        log.info("[%s] hết câu: %d frame = %.1f s", self.id, len(frames), len(frames) * FRAME_MS / 1000)
        await self.send(type="stt", text=f"(echo {len(frames) * FRAME_MS / 1000:.1f}s)")
        await self.send(type="llm", emotion="happy", text="😀")
        await self.send(type="tts", state="start")
        await self.send(type="tts", state="sentence_start", text="Phát lại câu vừa nói")
        # Gửi nhanh hơn thời gian thực một chút; gửi dồn một lần thì hàng đợi phát trên chip có giới hạn.
        for f in frames:
            await self.ws.send_bytes(f)
            await asyncio.sleep(FRAME_MS / 1000 * 0.9)
        await self.send(type="tts", state="stop")


class GeminiSession(Session):
    """Cầu nối thiết bị <-> Gemini Live. Một phiên Gemini sống suốt kết nối để nhớ ngữ cảnh."""
    out_rate = GEMINI_RATE
    OUT_SAMPLES = GEMINI_RATE * FRAME_MS // 1000

    def __init__(self, ws, http: aiohttp.ClientSession, key: str, url: str, hub: McpHub, tracer: Tracer):
        super().__init__(ws)
        self.http, self.key, self.url = http, key, url
        self.hub, self.tracer = hub, tracer
        self.conn = 0                       # số lần đã mở phiên Gemini (goAway -> mở lại)
        self.turn_id = None                 # lượt đang trace; mở lười khi có sự kiện đầu tiên
        self.last_turn = None               # usageMetadata có thể tới sau turnComplete
        self.t_user = self.t_model = ""     # transcript đủ của lượt, khác heard/said là bộ đệm hiển thị
        self.tool_tasks: dict[asyncio.Task, set] = {}   # task tool đang chạy -> id các call trong đó
        # ms audio đã gửi lên / nhận về Gemini: cả phiên, và phần chưa gán cho lượt nào.
        # Mic gửi liên tục cả lúc im lặng, nên phần im lặng trước một lượt tính vào lượt đó.
        self.in_ms = self.out_ms = 0
        self.turn_in_ms = self.turn_out_ms = 0
        self.encoder = opuslib.Encoder(GEMINI_RATE, 1, opuslib.APPLICATION_VOIP)
        self.gws = None                     # WebSocket tới Gemini
        self.reader = None
        self.opening = asyncio.Lock()
        self.pcm = bytearray()              # PCM 24k chưa đủ 1 frame Opus
        self.out: asyncio.Queue = asyncio.Queue()   # việc chờ gửi xuống chip, xem send_loop
        self.sender = asyncio.create_task(self.send_loop())
        self.speaking = False               # đã gửi tts start, chưa gửi tts stop
        self.turn_open = False              # Gemini đang trả lời lượt này
        self.heard = ""                     # transcript câu người nói
        self.said = ""                      # transcript câu robot nói, chưa đủ câu để hiện

    async def ensure_gemini(self):
        async with self.opening:
            if self.gws is not None and not self.gws.closed:
                return
            self.gws = await self.http.ws_connect(f"{self.url}?key={self.key}", heartbeat=20)
            self.conn += 1
            mcp_tools = self.hub.declarations()
            try:                            # tool của chip lấy song song từ lúc hello; thường đã xong
                await asyncio.wait_for(self.dev_ready.wait(), DEVICE_TIMEOUT)
            except asyncio.TimeoutError:
                pass
            dev_tools = [d for _, d in self.dev_tools.values()]
            prompt = SYSTEM_PROMPT + ("\n" + TOOL_RULES if mcp_tools else "") + ("\n" + DEVICE_RULES if dev_tools else "")
            await self.gws.send_str(json.dumps({"setup": {
                "model": f"models/{GEMINI_MODEL}",
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": GEMINI_VOICE}}},
                },
                "systemInstruction": {"parts": [{"text": prompt}]},
                "inputAudioTranscription": {},
                "outputAudioTranscription": {},
                "tools": [{"functionDeclarations": [{
                    "name": "set_emotion",
                    "description": "Đổi nét mặt robot trên màn hình.",
                    "parameters": {"type": "OBJECT", "properties": {
                        "emotion": {"type": "STRING", "enum": EMOTIONS}}, "required": ["emotion"]},
                }] + mcp_tools + dev_tools}],
            }}))
            first = await asyncio.wait_for(self.gws.receive(), 15)
            msg = {}
            if first.type in (WSMsgType.TEXT, WSMsgType.BINARY):
                msg = json.loads(first.data)
            if "setupComplete" not in msg:
                why = first.data if first.type != WSMsgType.CLOSE else f"close {self.gws.close_code} {first.extra}"
                await self.gws.close()
                self.gws = None
                raise RuntimeError(f"Gemini setup thất bại: {str(why)[:300]}")
            log.info("[%s] Gemini Live sẵn sàng (%s, giọng %s, %d tool MCP, %d tool chip)", self.id, GEMINI_MODEL,
                     GEMINI_VOICE, len(mcp_tools), len(dev_tools))
            self.reader = asyncio.create_task(self.read_loop(self.gws))

    async def on_listen_start(self):
        try:
            await self.ensure_gemini()
        except Exception as e:              # để chip báo lỗi thay vì treo ở "đang nghe"
            log.error("[%s] %s", self.id, e)
            await self.send(type="alert", status="Lỗi", message="Không nối được Gemini", emotion="sad")

    async def on_listen_stop(self):
        if self.gws is not None and not self.gws.closed:
            await self.gws.send_str(json.dumps({"realtimeInput": {"audioStreamEnd": True}}))

    async def on_abort(self):
        await self.cut_speech()

    async def on_audio(self, frame: bytes):
        if not self.listening or self.gws is None or self.gws.closed:
            return
        pcm = self.decoder.decode(frame, IN_SAMPLES)
        self.in_ms += FRAME_MS
        self.turn_in_ms += FRAME_MS
        await self.gws.send_str(json.dumps({"realtimeInput": {"audio": {
            "data": base64.b64encode(pcm).decode(), "mimeType": f"audio/pcm;rate={IN_RATE}"}}}))

    # ---- Gemini -> thiết bị ----

    async def read_loop(self, gws):
        try:
            async for m in gws:
                if m.type in (WSMsgType.TEXT, WSMsgType.BINARY):
                    await self.on_gemini(json.loads(m.data))
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("[%s] đọc Gemini lỗi", self.id)
        # phiên Gemini có giới hạn thời lượng; lần listen start sau sẽ mở phiên mới
        log.info("[%s] Gemini đóng kết nối (code=%s)", self.id, gws.close_code)
        self.turn_open = False
        await self.out.put(("stop", None))

    async def on_gemini(self, msg: dict):
        if log.isEnabledFor(logging.DEBUG):
            sc = msg.get("serverContent") or {}
            log.debug("[%s] gemini <- %s %s", self.id, list(msg), list(sc) if sc else "")
        if "usageMetadata" in msg:
            self.tracer.llm_usage(self.id, self.turn_id or self.last_turn, self.conn, GEMINI_MODEL,
                                  msg["usageMetadata"])
        if "toolCall" in msg:
            # chạy riêng task: read_loop phải đọc tiếp được toolCallCancellation khi người nói chen ngang
            calls = msg["toolCall"].get("functionCalls", [])
            self.begin_turn()
            task = asyncio.create_task(self.on_tool_call(calls, self.turn_id))
            self.tool_tasks[task] = {fc.get("id") for fc in calls}
            task.add_done_callback(self.tool_tasks.pop)
        if "toolCallCancellation" in msg:
            ids = set(msg["toolCallCancellation"].get("ids") or [])
            for task, own in list(self.tool_tasks.items()):
                if own & ids:
                    log.info("[%s] huỷ tool call %s", self.id, own & ids)
                    task.cancel()
        if "goAway" in msg:
            log.info("[%s] Gemini sắp đóng phiên: %s", self.id, msg["goAway"])
        sc = msg.get("serverContent")
        if not sc:
            return
        if "inputTranscription" in sc:
            text = sc["inputTranscription"].get("text", "")
            self.heard += text
            self.begin_turn()
            self.t_user += text
        if sc.get("interrupted"):           # người nói chen ngang: bỏ phần chưa phát
            log.info("[%s] bị ngắt lời", self.id)
            self.end_turn(interrupted=True)
            await self.cut_speech()
            return
        if sc.get("modelTurn"):
            self.begin_turn()
        for part in (sc.get("modelTurn") or {}).get("parts", []):
            data = (part.get("inlineData") or {}).get("data")
            if data:
                await self.on_model_audio(base64.b64decode(data))
        if "outputTranscription" in sc:
            text = sc["outputTranscription"].get("text", "")
            self.said += text
            self.t_model += text
            await self.flush_sentences(final=False)
        if sc.get("turnComplete"):
            self.end_turn(interrupted=False)
            await self.flush_sentences(final=True)
            self.flush_pcm(pad=True)
            self.turn_open = False
            await self.out.put(("stop", None))

    def begin_turn(self):
        if self.turn_id is None:
            self.turn_id = self.tracer.turn_start(self.id)

    def end_turn(self, interrupted: bool):
        if self.turn_id is not None:
            self.tracer.turn_end(self.turn_id, self.t_user, self.t_model, interrupted,
                                 GEMINI_MODEL, self.turn_in_ms, self.turn_out_ms)
            self.last_turn, self.turn_id = self.turn_id, None
            self.turn_in_ms = self.turn_out_ms = 0
        self.t_user = self.t_model = ""

    async def on_tool_call(self, calls: list[dict], turn_id):
        async def one(fc: dict) -> dict:
            name, args, t0 = fc.get("name", ""), fc.get("args") or {}, time.time()
            if name == "set_emotion":
                emo = args.get("emotion", "neutral")
                ok = emo in EMOTIONS
                log.info("[%s] set_emotion %s", self.id, emo)
                await self.send(type="llm", emotion=emo if ok else "neutral")
                text, err = ("ok" if ok else "unknown"), not ok
                response = {"result": text}
            elif name in self.dev_tools:
                log.info("[%s] tool chip %s %s", self.id, name, json.dumps(args, ensure_ascii=False)[:200])
                try:
                    text, err = await self.call_device(name, args)
                except asyncio.CancelledError:
                    self.tracer.tool_call(self.id, turn_id, fc.get("id"), name, args, "(bị huỷ)", True, t0)
                    raise
                response = {"error": text[:RESULT_MAX]} if err else {"result": text[:RESULT_MAX]}
            elif self.hub.owns(name):
                log.info("[%s] tool %s %s", self.id, name, json.dumps(args, ensure_ascii=False)[:200])
                try:
                    text, err = await self.hub.call(name, args)
                except asyncio.CancelledError:
                    self.tracer.tool_call(self.id, turn_id, fc.get("id"), name, args, "(bị huỷ)", True, t0)
                    raise
                log.info("[%s] tool %s -> %s%d ký tự", self.id, name, "LỖI " if err else "", len(text))
                clipped = text[:RESULT_MAX] + ("\n…(đã cắt)" if len(text) > RESULT_MAX else "")
                response = {"error": clipped} if err else {"result": clipped}
            else:
                text, err = f"không có tool {name}", True
                response = {"error": text}
            self.tracer.tool_call(self.id, turn_id, fc.get("id"), name, args, text, err, t0)
            return {"id": fc.get("id"), "name": name, "response": response}

        # gửi chung một toolResponse cho mọi call của cùng một toolCall
        responses = await asyncio.gather(*(one(fc) for fc in calls))
        if responses and self.gws is not None and not self.gws.closed:
            await self.gws.send_str(json.dumps({"toolResponse": {"functionResponses": list(responses)}}))

    async def on_model_audio(self, pcm: bytes):
        ms = len(pcm) * 1000 // (2 * GEMINI_RATE)   # tính cả phần sau này bị cắt vì ngắt lời: Gemini đã sinh ra
        self.out_ms += ms
        self.turn_out_ms += ms
        if not self.turn_open:
            self.turn_open = True
            if self.heard.strip():
                await self.send(type="stt", text=self.heard.strip())
            self.heard = ""
            # tts start phải tới chip trước frame đầu: ở trạng thái listening chip bỏ mọi frame nhận
            await self.out.put(("start", None))
        self.pcm += pcm
        self.flush_pcm(pad=False)

    def flush_pcm(self, pad: bool):
        n = self.OUT_SAMPLES * 2
        if pad and len(self.pcm) % n:
            self.pcm += bytes(n - len(self.pcm) % n)
        while len(self.pcm) >= n:
            chunk, self.pcm = bytes(self.pcm[:n]), self.pcm[n:]
            self.out.put_nowait(("audio", self.encoder.encode(chunk, self.OUT_SAMPLES)))

    async def flush_sentences(self, final: bool):
        """Phụ đề: gửi từng câu hoàn chỉnh (hoặc phần còn lại khi hết lượt)."""
        while True:
            m = re.search(r"[.!?…](\s|$)", self.said) if not final else re.search(r"[.!?…]\s", self.said)
            if not m and not (final and self.said.strip()):
                return
            cut = m.end() if m else len(self.said)
            text, self.said = self.said[:cut].strip(), self.said[cut:]
            if text:
                await self.out.put(("sentence", text))

    async def cut_speech(self):
        """Bỏ mọi thứ chưa phát rồi kết thúc lượt nói trên chip."""
        self.pcm.clear()
        self.said = ""
        self.turn_open = False
        while not self.out.empty():
            self.out.get_nowait()
        await self.out.put(("stop", None))

    async def send_loop(self):
        """Task duy nhất ghi xuống chip: giữ đúng thứ tự start -> audio/phụ đề -> stop và nhịp
        ~thời gian thực (Gemini trả audio nhanh hơn thời gian thực; dồn một lần thì hàng đợi
        phát trên chip có giới hạn)."""
        try:
            while True:
                kind, val = await self.out.get()
                if self.ws.closed:
                    return
                if kind == "start" and not self.speaking:
                    self.speaking = True
                    await self.send(type="tts", state="start")
                elif kind == "sentence" and self.speaking:
                    await self.send(type="tts", state="sentence_start", text=val)
                elif kind == "audio" and self.speaking:
                    await self.ws.send_bytes(val)
                    await asyncio.sleep(FRAME_MS / 1000 * 0.9)
                elif kind == "stop" and self.speaking:
                    self.speaking = False
                    await self.send(type="tts", state="stop")
        except asyncio.CancelledError:
            pass
        except Exception:
            log.exception("[%s] gửi xuống chip lỗi", self.id)

    async def close(self):
        self.close_mcp()
        self.end_turn(interrupted=self.speaking)
        for task in list(self.tool_tasks):
            task.cancel()
        self.sender.cancel()
        if self.gws is not None:
            await self.gws.close()
        if self.reader is not None:
            self.reader.cancel()


async def websocket(request: web.Request) -> web.WebSocketResponse:
    app = request.app
    if not allowed(request):
        refuse(request)
    want = app["token"]
    auth = request.headers.get("Authorization", "")
    if want and auth != f"Bearer {want}":
        log.warning("sai token: %r", auth)
        raise web.HTTPUnauthorized()
    ws = web.WebSocketResponse(heartbeat=30)
    await ws.prepare(request)
    if app["gemini_key"]:
        s = GeminiSession(ws, app["http"], app["gemini_key"], app["gemini_url"], app["hub"], app["tracer"])
    else:
        s = EchoSession(ws)
    app["tracer"].session_start(s.id, request.headers.get("Device-Id"), type(s).__name__,
                                GEMINI_MODEL if app["gemini_key"] else None)
    log.info("[%s] connect device=%s protocol=%s mode=%s", s.id, request.headers.get("Device-Id"),
             request.headers.get("Protocol-Version"), type(s).__name__)
    # Đọc và xử lý tách 2 task: tin "mcp" (trả lời của chip) giải quyết ngay lúc đọc, còn lại xếp hàng giữ thứ tự.
    # Xử lý một tin có thể chờ lâu (listen start mở Gemini, chờ tool của chip) mà vẫn đọc được trả lời MCP.
    q: asyncio.Queue = asyncio.Queue()

    async def xu_ly():
        while (item := await q.get()) is not None:
            kind, data = item
            if kind == "text":
                await s.on_text(data)
            else:
                await s.on_audio(data)

    worker = asyncio.create_task(xu_ly())
    try:
        async for m in ws:
            if worker.done():               # xử lý lỗi: đóng kết nối, chip sẽ tự nối lại
                break
            if m.type == WSMsgType.TEXT:
                try:
                    msg = json.loads(m.data)
                except json.JSONDecodeError:
                    log.warning("[%s] JSON hỏng: %r", s.id, m.data[:200])
                    continue
                if msg.get("type") == "mcp":
                    s.on_mcp(msg.get("payload") or {})
                else:
                    await q.put(("text", msg))
            elif m.type == WSMsgType.BINARY:
                await q.put(("audio", m.data))
    finally:
        await q.put(None)
        try:
            await asyncio.wait_for(worker, 5)
        except Exception:
            log.exception("[%s] xử lý tin lỗi", s.id)
            worker.cancel()
        await s.close()
        if isinstance(s, GeminiSession):
            app["tracer"].session_end(s.id, GEMINI_MODEL, s.in_ms, s.out_ms)
        else:
            app["tracer"].session_end(s.id)
        log.info("[%s] disconnect", s.id)
    return ws


def make_app(public_host: str, token: str, gemini_key: str = "", gemini_url: str = GEMINI_WS,
             devices: set[str] = frozenset()) -> web.Application:
    app = web.Application()
    app["public_host"], app["token"] = public_host, token
    app["devices"] = {d.lower() for d in devices}
    app["gemini_key"], app["gemini_url"] = gemini_key, gemini_url

    async def http_ctx(app):
        app["http"] = aiohttp.ClientSession()
        app["tracer"] = Tracer()
        log.info("trace -> %s", app["tracer"].path)
        app["hub"] = McpHub()
        await app["hub"].start(wait=float(os.environ.get("ARES_MCP_WAIT", "0")))
        yield
        await app["hub"].close()
        await app["http"].close()
    app.cleanup_ctx.append(http_ctx)
    app.router.add_post("/xiaozhi/ota/", ota)
    app.router.add_get("/xiaozhi/ota/", ota)
    app.router.add_get("/xiaozhi/v1/", websocket)
    return app


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=8000)
    p.add_argument("--host", default=None, help="IP/host thiết bị dùng để gọi lại (mặc định: IP LAN)")
    # mặc định sinh mới mỗi lần chạy: chip lấy token qua OTA lúc khởi động, không cần cố định
    p.add_argument("--token", default=os.environ.get("ARES_TOKEN") or secrets.token_urlsafe(16))
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S")
    if os.environ.get("ARES_DEBUG"):         # chỉ logger của mình, không kéo theo debug của aiohttp
        log.setLevel(logging.DEBUG)
    public = f"{a.host or lan_ip()}:{a.port}"
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    url = os.environ.get("GEMINI_WS_URL", GEMINI_WS)   # trỏ sang mock_gemini.py khi test
    log.info("OTA URL cho firmware: http://%s/xiaozhi/ota/", public)
    log.info("chế độ: %s", f"Gemini Live ({GEMINI_MODEL})" if key else "ECHO (chưa có GEMINI_API_KEY)")
    devices = {d.strip() for d in os.environ.get("ARES_DEVICES", "").split(",") if d.strip()}
    log.info("chip được phép: %s", ", ".join(sorted(devices)) or "chưa có (ARES_DEVICES) — chỉ nhận kết nối từ máy này")
    web.run_app(make_app(public, a.token, key, url, devices), host="0.0.0.0", port=a.port, print=None)
