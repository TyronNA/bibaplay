"""Xem trace: chi phí theo ngày, phiên gần đây, chi tiết một phiên.

  .venv/bin/python trace_report.py                 # chi phí theo ngày + 10 phiên gần nhất
  .venv/bin/python trace_report.py --session ID    # từng lượt: người nói, tool, robot nói, token
  .venv/bin/python trace_report.py --sql "SELECT …"  # truy vấn tự do

Free tier không tốn tiền: mọi số $ là ƯỚC TÍNH NẾU TRẢ PHÍ, tính hai kiểu vì paid tier audio
tính theo token hoặc theo phút ("$token" từ llm_calls.cost_usd, "$phút" từ cost_min_usd), giá lúc ghi.
Phút audio vào gồm cả lúc im lặng: mic gửi liên tục trong khi nghe. Giả định với $token: mỗi usageMetadata của Live API là số của
riêng message đó, không cộng dồn cả phiên — docs không nói rõ. Nếu total_tokens trong một
(session, conn) chỉ tăng dần thì giả định sai: phải lấy hiệu giữa các dòng.
"""
import argparse
import datetime as dt
import sqlite3

from tracing import DB_PATH


def ts(t) -> str:
    return dt.datetime.fromtimestamp(t).strftime("%m-%d %H:%M:%S") if t else "-"


def table(rows, headers):
    rows = [["" if v is None else str(v) for v in r] for r in rows]
    w = [max(len(h), *(len(r[i]) for r in rows)) if rows else len(h) for i, h in enumerate(headers)]
    print("  ".join(h.ljust(w[i]) for i, h in enumerate(headers)))
    for r in rows:
        print("  ".join(v.ljust(w[i]) for i, v in enumerate(r)))


def usd(v) -> str:
    return "-" if v is None else f"${v:.4f}"


def mins(ms) -> str:
    return "-" if ms is None else f"{ms / 60000:.2f}"


def summary(db, days: int, n: int):
    print(f"== {days} ngày gần nhất (ước tính nếu trả phí) ==")
    since = "strftime('%s','now') - ?*86400"
    tok = {d: r for d, *r in db.execute(f"""
        SELECT date(at, 'unixepoch', 'localtime') d, SUM(prompt_tokens), SUM(response_tokens), SUM(cost_usd)
        FROM llm_calls WHERE at >= {since} GROUP BY d""", (days,))}
    # phút tính theo phiên: gồm cả audio im lặng ngoài mọi lượt
    per_min = {d: r for d, *r in db.execute(f"""
        SELECT date(started_at, 'unixepoch', 'localtime') d, COUNT(*), SUM(in_audio_ms), SUM(out_audio_ms),
               SUM(cost_min_usd)
        FROM sessions WHERE started_at >= {since} GROUP BY d""", (days,))}
    rows = []
    for d in sorted(set(tok) | set(per_min), reverse=True):
        i, o, ut = tok.get(d, (None, None, None))
        n, im, om, um = per_min.get(d, (0, None, None, None))
        rows.append((d, n, i, o, usd(ut), mins(im), mins(om), usd(um)))
    table(rows, ["ngày", "phiên", "token vào", "token ra", "$token", "phút vào", "phút ra", "$phút"])
    print(f"\n== {n} phiên gần nhất ==")
    rows = db.execute("""
        SELECT s.id, s.device_id, s.mode, s.started_at, s.ended_at,
               (SELECT COUNT(*) FROM turns t WHERE t.session_id = s.id),
               (SELECT COUNT(*) FROM tool_calls c WHERE c.session_id = s.id),
               (SELECT SUM(cost_usd) FROM llm_calls l WHERE l.session_id = s.id),
               s.in_audio_ms, s.out_audio_ms, s.cost_min_usd
        FROM sessions s ORDER BY s.started_at DESC LIMIT ?""", (n,)).fetchall()
    table([(i, dev, m, ts(a), ts(b), t, c, usd(u), mins(im), mins(om), usd(um))
           for i, dev, m, a, b, t, c, u, im, om, um in rows],
          ["session", "device", "mode", "bắt đầu", "kết thúc", "lượt", "tool", "$token",
           "phút vào", "phút ra", "$phút"])


def session(db, sid: str):
    s = db.execute("SELECT id, device_id, mode, model, started_at, ended_at, in_audio_ms, out_audio_ms,"
                   " cost_min_usd FROM sessions WHERE id LIKE ?",
                   (sid + "%",)).fetchone()
    if not s:
        raise SystemExit(f"không có session {sid}")
    print(f"session {s[0]} device={s[1]} {s[2]} {s[3] or ''} {ts(s[4])} -> {ts(s[5])}\n")
    for tid, a, b, user, model, intr, im, om, um in db.execute(
            "SELECT id, started_at, ended_at, user_text, model_text, interrupted,"
            " in_audio_ms, out_audio_ms, cost_min_usd FROM turns "
            "WHERE session_id=? ORDER BY id", (s[0],)):
        dur = f"{b - a:.1f}s" if b else "chưa xong"
        print(f"#{tid} {ts(a)} ({dur}){'  [bị ngắt lời]' if intr else ''}")
        if user:
            print(f"  người: {user}")
        for name, args, res, err, ms in db.execute(
                "SELECT name, args, result, is_error, duration_ms FROM tool_calls WHERE turn_id=? ORDER BY id",
                (tid,)):
            res = (res or "").replace("\n", " ")
            print(f"  tool {name} {args} -> {'LỖI ' if err else ''}{res[:120]} ({ms} ms)")
        if model:
            print(f"  robot: {model}")
        for i, o, u in db.execute("SELECT prompt_tokens, response_tokens, cost_usd FROM llm_calls "
                                  "WHERE turn_id=? ORDER BY id", (tid,)):
            print(f"  usage: vào {i} / ra {o} token, {usd(u)}")
        if im is not None:
            print(f"  audio: vào {mins(im)} / ra {mins(om)} phút, {usd(um)}")
    total = db.execute("SELECT SUM(cost_usd) FROM llm_calls WHERE session_id=?", (s[0],)).fetchone()[0]
    print(f"\ntổng (ước tính nếu trả phí): {usd(total)} theo token | "
          f"{mins(s[6])} phút vào, {mins(s[7])} phút ra = {usd(s[8])} theo phút")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--db", default=DB_PATH)
    p.add_argument("--days", type=int, default=14)
    p.add_argument("-n", type=int, default=10)
    p.add_argument("--session")
    p.add_argument("--sql")
    a = p.parse_args()
    db = sqlite3.connect(f"file:{a.db}?mode=ro", uri=True)
    if a.sql:
        cur = db.execute(a.sql)
        table(cur.fetchall(), [c[0] for c in cur.description])
    elif a.session:
        session(db, a.session)
    else:
        summary(db, a.days, a.n)
