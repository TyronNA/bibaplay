"""Trace mọi lượt nói chuyện vào SQLite: kiểu Langfuse rút gọn.

  sessions   một kết nối thiết bị + tổng phút audio gửi/nhận Gemini
  turns      một lượt hỏi-đáp: câu người nói, câu robot nói, bị ngắt lời không, phút audio
  llm_calls  mỗi usageMetadata Gemini gửi về: token theo modality + chi phí USD lúc ghi
  tool_calls mỗi lần model gọi tool: tên, args, kết quả, lỗi, thời gian chạy

DB mặc định nằm ngoài /opt/ares-server vì deploy-mini-pc.sh rsync --delete thư mục đó.
Xem: .venv/bin/python trace_report.py
"""
import json
import logging
import os
import sqlite3
import time

log = logging.getLogger("server")

DB_PATH = os.environ.get("ARES_DB", os.path.expanduser("~/.local/share/ares/trace.db"))

# Giá paid tier, theo https://ai.google.dev/gemini-api/docs/pricing (kiểm 2026-09-26).
# Free tier không tốn tiền; số tính ra là ước tính NẾU trả phí. Paid tier audio tính theo token
# HOẶC theo phút (trang giá không nói khi nào áp cách nào) nên ghi cả hai.
#   in/out: USD / 1M token      min: USD / phút audio
# Thiếu model ở đây thì cost = NULL, token và phút vẫn được ghi để tính lại sau.
PRICES = {
    "gemini-3.8-live": {"in": {"TEXT": 0.75, "AUDIO": 3.00, "IMAGE": 1.00, "VIDEO": 1.00},
                        "out": {"TEXT": 4.50, "AUDIO": 12.00},
                        "min": {"in": 0.005, "out": 0.018}},
    "gemini-2.5-flash-native-audio-preview-12-2025": {
        "in": {"TEXT": 0.50, "AUDIO": 3.00, "IMAGE": 3.00, "VIDEO": 3.00},
        "out": {"TEXT": 2.00, "AUDIO": 12.00}},
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, device_id TEXT, mode TEXT, model TEXT,
    started_at REAL NOT NULL, ended_at REAL,
    in_audio_ms INTEGER, out_audio_ms INTEGER, cost_min_usd REAL);
CREATE TABLE IF NOT EXISTS turns (
    id INTEGER PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id),
    started_at REAL NOT NULL, ended_at REAL,
    user_text TEXT, model_text TEXT, interrupted INTEGER NOT NULL DEFAULT 0,
    in_audio_ms INTEGER, out_audio_ms INTEGER, cost_min_usd REAL);
CREATE TABLE IF NOT EXISTS llm_calls (
    id INTEGER PRIMARY KEY, session_id TEXT NOT NULL, turn_id INTEGER,
    conn INTEGER NOT NULL,          -- phiên WebSocket Gemini thứ mấy trong kết nối thiết bị
    at REAL NOT NULL, model TEXT,
    prompt_tokens INTEGER, response_tokens INTEGER, thoughts_tokens INTEGER,
    tool_prompt_tokens INTEGER, cached_tokens INTEGER, total_tokens INTEGER,
    in_audio INTEGER, in_text INTEGER, out_audio INTEGER, out_text INTEGER,
    cost_usd REAL, raw TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tool_calls (
    id INTEGER PRIMARY KEY, session_id TEXT NOT NULL, turn_id INTEGER,
    call_id TEXT, name TEXT NOT NULL, args TEXT, result TEXT,
    is_error INTEGER NOT NULL DEFAULT 0, started_at REAL NOT NULL, duration_ms INTEGER);
CREATE INDEX IF NOT EXISTS turns_session ON turns(session_id);
CREATE INDEX IF NOT EXISTS llm_calls_at ON llm_calls(at);
CREATE INDEX IF NOT EXISTS tool_calls_turn ON tool_calls(turn_id);
"""

RESULT_MAX = 100_000    # kết quả tool dài hơn thì cắt khi lưu


def by_modality(details) -> dict:
    out = {}
    for d in details or []:
        m = d.get("modality", "TEXT")
        out[m] = out.get(m, 0) + int(d.get("tokenCount", 0))
    return out


def cost_of(model: str, usage: dict) -> float | None:
    p = PRICES.get(model)
    if not p:
        return None
    ins = by_modality(usage.get("promptTokensDetails")) or {"TEXT": usage.get("promptTokenCount", 0)}
    outs = by_modality(usage.get("responseTokensDetails")) or {"TEXT": usage.get("responseTokenCount", 0)}
    # thinking và phần prompt do tool sinh ra tính giá text
    outs["TEXT"] = outs.get("TEXT", 0) + usage.get("thoughtsTokenCount", 0)
    ins["TEXT"] = ins.get("TEXT", 0) + usage.get("toolUsePromptTokenCount", 0)
    usd = sum(n * p["in"].get(m, p["in"]["TEXT"]) for m, n in ins.items())
    usd += sum(n * p["out"].get(m, p["out"]["TEXT"]) for m, n in outs.items())
    return usd / 1e6


def cost_per_min(model: str | None, in_ms: int, out_ms: int) -> float | None:
    m = (PRICES.get(model) or {}).get("min")
    if not m:
        return None
    return in_ms / 60000 * m["in"] + out_ms / 60000 * m["out"]


class Tracer:
    """Ghi đồng bộ trên event loop: mỗi lần ghi là một INSERT nhỏ trên WAL, vài trăm µs."""

    def __init__(self, path: str = DB_PATH):
        if path != ":memory:":
            os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        self.db = sqlite3.connect(path, isolation_level=None)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript(SCHEMA)
        self.path = path

    def _exec(self, sql: str, args=()) -> int | None:
        try:
            return self.db.execute(sql, args).lastrowid
        except sqlite3.Error:            # trace hỏng không được làm rớt cuộc nói chuyện
            log.exception("ghi trace lỗi: %s", sql.split("(")[0])
            return None

    def session_start(self, sid: str, device_id: str | None, mode: str, model: str | None):
        self._exec("INSERT INTO sessions(id, device_id, mode, model, started_at) VALUES (?,?,?,?,?)",
                   (sid, device_id, mode, model, time.time()))

    def session_end(self, sid: str, model: str | None = None, in_ms: int = 0, out_ms: int = 0):
        """in_ms/out_ms: tổng cả phiên, gồm cả audio im lặng ngoài mọi lượt (vẫn bị tính phút)."""
        self._exec("UPDATE sessions SET ended_at=?, in_audio_ms=?, out_audio_ms=?, cost_min_usd=? WHERE id=?",
                   (time.time(), in_ms, out_ms, cost_per_min(model, in_ms, out_ms), sid))

    def turn_start(self, sid: str) -> int | None:
        return self._exec("INSERT INTO turns(session_id, started_at) VALUES (?,?)", (sid, time.time()))

    def turn_end(self, turn_id: int | None, user_text: str, model_text: str, interrupted: bool,
                 model: str | None = None, in_ms: int = 0, out_ms: int = 0):
        if turn_id is None:
            return
        self._exec("UPDATE turns SET ended_at=?, user_text=?, model_text=?, interrupted=?,"
                   " in_audio_ms=?, out_audio_ms=?, cost_min_usd=? WHERE id=?",
                   (time.time(), user_text.strip() or None, model_text.strip() or None, int(interrupted),
                    in_ms, out_ms, cost_per_min(model, in_ms, out_ms), turn_id))

    def llm_usage(self, sid: str, turn_id: int | None, conn: int, model: str, usage: dict):
        ins = by_modality(usage.get("promptTokensDetails"))
        outs = by_modality(usage.get("responseTokensDetails"))
        self._exec(
            "INSERT INTO llm_calls(session_id, turn_id, conn, at, model, prompt_tokens, response_tokens,"
            " thoughts_tokens, tool_prompt_tokens, cached_tokens, total_tokens,"
            " in_audio, in_text, out_audio, out_text, cost_usd, raw)"
            " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (sid, turn_id, conn, time.time(), model, usage.get("promptTokenCount"),
             usage.get("responseTokenCount"), usage.get("thoughtsTokenCount"),
             usage.get("toolUsePromptTokenCount"), usage.get("cachedContentTokenCount"),
             usage.get("totalTokenCount"), ins.get("AUDIO"), ins.get("TEXT"),
             outs.get("AUDIO"), outs.get("TEXT"), cost_of(model, usage), json.dumps(usage)))

    def tool_call(self, sid: str, turn_id: int | None, call_id: str | None, name: str, args,
                  result: str, is_error: bool, started_at: float):
        self._exec(
            "INSERT INTO tool_calls(session_id, turn_id, call_id, name, args, result, is_error,"
            " started_at, duration_ms) VALUES (?,?,?,?,?,?,?,?,?)",
            (sid, turn_id, call_id, name, json.dumps(args, ensure_ascii=False), result[:RESULT_MAX],
             int(is_error), started_at, int((time.time() - started_at) * 1000)))
