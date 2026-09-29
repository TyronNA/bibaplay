#!/usr/bin/env python3
"""In cả giáo trình ra 1 file PDF từ bản tĩnh của xuat-web.py.

    python3 hoc/xuat-pdf.py <thư mục bản tĩnh> <file pdf ra>

Chrome headless in từng trang (trang đầu, từng bài, linh kiện, đồ) rồi pypdf ghép lại, mỗi bài một
bookmark. In từ bản web nên không dính số đo / tiến độ / đồ của ai: localStorage của Chrome headless rỗng.
Cần Google Chrome ở /Applications và `pip install pypdf`.
File ra ~50MB (hình breadboard là vector, mỗi lỗ một nét) → vượt 25 MiB/file của Workers Static Assets,
nên không ghi vào thư mục bản tĩnh; deploy-web.sh đẩy nó lên R2, hoc/worker.js phát ra ở /ban-rap.pdf.
"""
import os
import re
import signal
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from pypdf.generic import ArrayObject, DecodedStreamObject, DictionaryObject, NameObject

WEB = "https://bibaplay.com"  # trùng WEB trong xuat-web.py

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


class ImLang(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def muc_luc(gt):
    """[(tiêu đề bookmark, route, cấp)] theo đúng thứ tự trong giáo trình."""
    ds, chuong = [("Bàn Ráp · danh sách bài + an toàn chung", "", 0)], None
    for l in gt.splitlines():
        h = re.match(r"^## (\d+)\. (.+)$", l)
        if h:
            chuong = f"{h[1]}. {h[2]}"
            ds.append((chuong, None, 0))
            continue
        m = re.match(r"^\|\s*(\d+\.\d+)[^|]*\|([^|]+)\|", l)
        if m and chuong:
            ten = re.sub(r"←.*$", "", m[2]).replace("**", "").strip()
            ds.append((f"{m[1]} {ten}", f"bai/{m[1]}", 1))
    ds += [("Thư viện linh kiện", "linh-kien", 0), ("Đồ đang có · bộ kit gốc", "do", 0)]
    return ds


def in_trang(goc, tam, i_route):
    i, route = i_route
    ra = Path(tam) / f"{i:03d}.pdf"
    # Mỗi lần in một profile riêng: Chrome không cho 2 tiến trình dùng chung user-data-dir.
    # Chrome trên máy này in xong vẫn không tự thoát → chờ file PDF đứng kích thước rồi tự kill cả nhóm tiến trình.
    pr = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--disable-background-networking",
                           "--disable-component-update", "--no-pdf-header-footer", "--hide-scrollbars",
                           f"--user-data-dir={tam}/p{i}", f"--print-to-pdf={ra}", "--virtual-time-budget=15000",
                           # trang tĩnh xuat-web.py đã render sẵn ở <route>/index.html
                           f"{goc}/{route + '/' if route else ''}"],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        truoc, het = -1, time.time() + 180
        while time.time() < het:
            time.sleep(1)
            co = ra.stat().st_size if ra.exists() else 0
            if co and co == truoc:
                return ra
            truoc = co
        raise RuntimeError(f"in {route} quá 180s không ra PDF")
    finally:
        try:
            os.killpg(pr.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        pr.wait()


def chan_trang(w, trang_cua):
    """Mỗi trang một dòng xám nhỏ ở lề dưới (@page margin 11mm trong style.css) ghi link về đúng bài + số trang:
    file hay bị chuyển tiếp qua chat, người nhận vẫn biết nguồn. Không phủ hình chìm lên nội dung — che mất lỗ
    breadboard / nhãn chân. Chữ ASCII + Helvetica chuẩn của PDF để khỏi nhúng font tiếng Việt."""
    font = DictionaryObject({NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type1"),
                             NameObject("/BaseFont"): NameObject("/Helvetica"),
                             NameObject("/Encoding"): NameObject("/WinAnsiEncoding")})
    ref, n = w._add_object(font), len(w.pages)
    for i, (p, route) in enumerate(zip(w.pages, trang_cua)):
        url = f"{WEB}/{route + '/' if route else ''}"
        chu = f"{url.removeprefix('https://')}   \xb7   {i + 1} / {n}"
        co, x0, y = 7, float(p.mediabox.left) + 28, float(p.mediabox.bottom) + 14
        rong = co * 0.52 * len(chu)  # ước chừng bề rộng Helvetica, chỉ để khoanh vùng bấm
        res = p.setdefault(NameObject("/Resources"), DictionaryObject())
        fonts = res.setdefault(NameObject("/Font"), DictionaryObject())
        fonts[NameObject("/FBibaplay")] = ref
        # Nối thêm stream, không viết lại stream gốc (mỗi trang vài trăm KB vector). Bọc gốc trong q…Q để ma trận /
        # màu Chrome để lại cuối trang không lệch dòng chữ.
        cu = p[NameObject("/Contents")]
        cu = list(cu.get_object()) if isinstance(cu.get_object(), ArrayObject) else [cu]
        dau, cuoi = DecodedStreamObject(), DecodedStreamObject()
        dau.set_data(b"q\n")
        cuoi.set_data(f"\nQ q BT 0.55 g /FBibaplay {co} Tf {x0:.2f} {y:.2f} Td ({chu}) Tj ET Q".encode("latin-1"))
        p[NameObject("/Contents")] = ArrayObject([w._add_object(dau), *cu, w._add_object(cuoi)])
        w.add_annotation(i, Link(rect=(x0, y - 2, x0 + rong, y + co), url=url))


def main(web, ra):
    gt = (web / "notes/giao-trinh-dien.md").read_text()
    ds = muc_luc(gt)
    trang = [r for _, r, _ in ds if r is not None]
    srv = ThreadingHTTPServer(("127.0.0.1", 0), partial(ImLang, directory=str(web)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    goc = f"http://127.0.0.1:{srv.server_address[1]}"
    with tempfile.TemporaryDirectory() as tam:
        with ThreadPoolExecutor(2) as ex:
            pdf = dict(zip(trang, ex.map(partial(in_trang, goc, tam), enumerate(trang))))
        srv.shutdown()
        w, cha, trang_cua = PdfWriter(), None, []
        for ten, route, cap in ds:
            if route is None:  # tiêu đề chương: bookmark trỏ vào bài đầu tiên của chương
                cha = ("cho", ten)
                continue
            dau = len(w.pages)
            for p in PdfReader(pdf[route]).pages:
                w.add_page(p)
                trang_cua.append(route)
            if cap and isinstance(cha, tuple):
                cha = w.add_outline_item(cha[1], dau)
            w.add_outline_item(ten, dau, parent=cha if cap else None)
            if not cap:
                cha = None
        chan_trang(w, trang_cua)
        w.add_metadata({"/Title": "Bàn Ráp · giáo trình điện trên breadboard", "/Author": "Soạn bởi AI (Claude)"})
        # 58 file Chrome in riêng mang font/hình trùng nhau → gộp lại, bớt ~25%
        for p in w.pages:
            p.compress_content_streams(level=9)
        w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
        with open(ra, "wb") as f:
            w.write(f)
    print(f"{ra}: {len(w.pages)} trang, {len(trang)} mục, {ra.stat().st_size // 2**20} MB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve())
