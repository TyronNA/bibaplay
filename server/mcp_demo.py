"""MCP server nhỏ để test mcp_hub.py mà không cần tài khoản Gmail/Jira thật.

  "demo": {"command": ".venv/bin/python", "args": ["mcp_demo.py"]}
"""
from datetime import datetime
from typing import Literal
from zoneinfo import ZoneInfo

from pydantic import BaseModel

from mcp.server.mcpserver import MCPServer

server = MCPServer("demo")


class Filter(BaseModel):
    status: Literal["open", "done"] | None = None
    limit: int = 5


@server.tool()
def get_time(tz: str = "Asia/Ho_Chi_Minh") -> str:
    """Giờ hiện tại ở một múi giờ."""
    return datetime.now(ZoneInfo(tz)).strftime("%Y-%m-%d %H:%M")


@server.tool()
def list_tasks(filter: Filter | None = None) -> str:
    """Việc giả lập, để thử schema lồng nhau ($ref, anyOf, enum)."""
    f = filter or Filter()
    return f"{f.limit} việc, trạng thái {f.status or 'mọi'}"


@server.tool()
def fail() -> str:
    """Luôn lỗi, để thử đường báo lỗi."""
    raise RuntimeError("cố ý lỗi")


if __name__ == "__main__":
    server.run()
