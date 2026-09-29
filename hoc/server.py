#!/usr/bin/env python3
"""Web tự học điện: http://localhost:4300

Phục vụ tĩnh cả repo (trang web đọc thẳng notes/*.md, không chép nội dung sang) và lưu số đo
của từng bài vào hoc/ket-qua/<id>.json để Claude đọc lại được.
Chỉ nghe 127.0.0.1. Chạy bằng /usr/bin/python3 (3.9) qua launchd — giữ cú pháp tương thích 3.9.
"""
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOC = ROOT / "hoc"
KET_QUA = HOC / "ket-qua"
PORT = 4300
MA_BAI = re.compile(r"^/api/ket-qua/(\d+\.\d+)$")
# Route của app.js (đường dẫn thật, không hash) — không có file tương ứng → trả index.html cho app.js tự vẽ.
ROUTE = re.compile(r"^/hoc/(do|bai/\d+\.\d+|linh-kien(/[\w-]+)?|mo-phong(/.*)?|(en/)?xiaozhi|gioi-thieu|chinh-sach-rieng-tu)/?$")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def end_headers(self):
        # Sửa bài xong F5 là thấy, không phải xoá cache.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False, indent=1).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/":
            self.send_response(302)
            self.send_header("Location", "/hoc/")
            self.end_headers()
            return
        if path == "/api/bai":
            return self._json(200, sorted(p.stem for p in (HOC / "bai").glob("*.js")))
        m = MA_BAI.match(path)
        if m:
            f = KET_QUA / (m.group(1) + ".json")
            return self._json(200, json.loads(f.read_text()) if f.exists() else {})
        if ROUTE.match(path):
            self.path = "/hoc/index.html"
        super().do_GET()

    def do_POST(self):
        m = MA_BAI.match(self.path)
        n = int(self.headers.get("Content-Length") or 0)
        if not m or n > 64 * 1024:
            return self._json(400, {"loi": "sai đường dẫn hoặc quá lớn"})
        try:
            data = json.loads(self.rfile.read(n))
        except ValueError:
            return self._json(400, {"loi": "không phải JSON"})
        if not isinstance(data, dict):
            return self._json(400, {"loi": "phải là object"})
        KET_QUA.mkdir(exist_ok=True)
        (KET_QUA / (m.group(1) + ".json")).write_text(
            json.dumps(data, ensure_ascii=False, indent=1) + "\n")
        self._json(200, {"ok": True})


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
