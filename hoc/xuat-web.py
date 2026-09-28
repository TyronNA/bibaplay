#!/usr/bin/env python3
"""Xuất web tự học thành bản tĩnh để publish (không có server.py).

    python3 hoc/xuat-web.py <thư mục ra>

Khác bản local: dùng luu-web.js (số đo, tiến độ, đồ đang có nằm trong localStorage của người xem),
danh sách bài lấy từ bai/ds.json sinh ở đây. Không chép hoc/ket-qua/ — đó là số đo của riêng mình.
Mỗi route được Chrome headless render sẵn thành <route>/index.html (Google đọc được nội dung, không phải
trang "Đang tải…"), kèm sitemap.xml + robots.txt. Link donate / mã analytics / xác minh Search Console: cau-hinh-web.json.
Deploy: hoc/deploy-web.sh.
"""
import html
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOC = ROOT / "hoc"
WEB = "https://bibaplay.com"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
JS = ["md.js", "board.js", "linhkien.js", "bai-chung.js", "mua.js", "mo-phong.js", "mo-phong-ui.js", "xiaozhi.js", "luu-web.js", "dau-trang.js", "tim-nhanh.js", "app.js"]
NOTES = ["notes/giao-trinh-dien.md", "notes/do-dang-co.md"]
# Ảnh trang /xiaozhi/ (xiaozhi.js), giữ nguyên đường dẫn trong repo như NOTES.
ANH = ["sandbox/robot-face/sheet.png", "sandbox/sensor-panel/shot.png"]
# Bản chia sẻ cho người khác: nói rõ ai soạn và mức đã kiểm, vì hướng dẫn ráp sai là cháy đồ thật.
GHI_AI = """<footer class="ghi-ai to">
<p><b>Chia sẻ miễn phí.</b> Nội dung, hình vẽ và code do AI (Claude của Anthropic) soạn theo yêu cầu của một người đang tự học điện tử.</p>
<p>Phần lớn bài <b>chưa được ráp thử để kiểm</b>, code Phần 2 đã build nhưng chưa chạy trên chip, nên có thể sai. Luôn đo Ω trước khi cấp điện, đối chiếu datasheet trước khi tin số trong bài. Thấy khói, mùi khét hoặc linh kiện nóng thì rút nguồn ngay.</p>
<p>Mã nguồn mở (MIT): <a href="https://github.com/TyronNA/bibaplay" target="_blank" rel="noopener">github.com/TyronNA/bibaplay ↗</a> — web, bài, firmware, server. Thấy sai thì mở issue.</p>
</footer>"""
# Chỉ chèn khi mua.js có ít nhất một link: chưa gắn link thì không nhắc tới affiliate.
GHI_AFFILIATE = '''<p>Nút <b>"Mua trên Shopee"</b> là <b>link affiliate</b>: bạn mua qua đó thì người soạn nhận hoa hồng từ Shopee, giá bạn trả không đổi. Không có hãng nào trả tiền để được nhắc tên trong bài.</p>'''

# Hộp hỏi lại trước khi tải PDF (dau-trang.js mở nó khi bấm link có data-hoi): file ~57 MB, bấm nhầm trên 4G là tốn.
HOI_PDF = """<dialog id="hoi-pdf" class="hoi to" aria-labelledby="hoi-pdf-ten"><form method="dialog">
<h2 id="hoi-pdf-ten">Tải cả bộ PDF?</h2>
<p>File <b>khoảng {mb} MB</b> (mọi bài, hình breadboard từng bước). Đang dùng 4G thì nên chờ có Wi-Fi.</p>
<p class="mo">Đọc trên web không cần tải: mỗi bài đã có đủ hình.</p>
<p class="do-nut"><button value="tai" class="chinh">Tải PDF</button> <button value="" autofocus>Thôi</button></p>
</form></dialog>"""

# Chỉ chèn khi cau-hinh-web.json có ung_ho.link hoặc ung_ho.qr.
GHI_UNG_HO = """<p class="ung-ho"><b>Ủng hộ.</b> {chu}{link}</p>{qr}"""


def main(ra):
    if ra.exists():
        shutil.rmtree(ra)
    (ra / "bai").mkdir(parents=True)
    cfg = json.loads((HOC / "cau-hinh-web.json").read_text())
    files = ["style.css", *JS]
    for f in files:
        shutil.copy(HOC / f, ra / f)
    if (HOC / "og.png").exists():
        shutil.copy(HOC / "og.png", ra / "og.png")
        files.append("og.png")

    bai = sorted(p.stem for p in (HOC / "bai").glob("*.js"))
    for b in bai:
        shutil.copy(HOC / "bai" / f"{b}.js", ra / "bai" / f"{b}.js")
        files.append(f"bai/{b}.js")
    (ra / "bai" / "ds.json").write_text(json.dumps(bai))
    files.append("bai/ds.json")

    # Code các bài Phần 2 mà trang bài tải về hiển thị (trường `code:` trong bai/*.js).
    code = sorted({m for b in bai for m in re.findall(r"code: *'([^']+)'", (HOC / "bai" / f"{b}.js").read_text())})
    for f in NOTES + ANH + code:
        (ra / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(ROOT / f, ra / f)
        files.append(f)

    # worker.js đọc file này để chuyển /mua/<id> sang Shopee (và đếm click); id không có link → về trang linh kiện.
    mua = dict(re.findall(r"^\s*'([\w-]+)':\s*'(https?://[^']+)'", (HOC / "mua.js").read_text(), re.M))
    (ra / "mua.json").write_text(json.dumps(mua, ensure_ascii=False))
    files.append("mua.json")

    goc = (HOC / "index.html").read_text()
    assert '<script src="luu-server.js"></script>' in goc and '<base href="/hoc/">' in goc
    nav = '<a href="xiaozhi/" data-r="xiaozhi">Robot AI</a>'
    assert nav in goc
    # ban-rap.pdf: xuat-pdf.py in từ chính thư mục này, nằm trên R2, hoc/worker.js phát ra (deploy-web.sh).
    web = goc.replace('<script src="luu-server.js"></script>', '<script src="luu-web.js"></script>') \
        .replace('<base href="/hoc/">', '<base href="/">') \
        .replace(nav, nav + '<a href="ban-rap.pdf" class="nav-pdf" download data-hoi>Tải PDF</a>') \
        .replace("</body>", HOI_PDF.format(mb=co_pdf()) + "\n</body>", 1)
    them_dau = ""
    if cfg.get("gsc"):
        them_dau += f'<meta name="google-site-verification" content="{html.escape(cfg["gsc"])}">\n'
    if cfg.get("cf_beacon"):
        them_dau += ("<script defer src=\"https://static.cloudflareinsights.com/beacon.min.js\" "
                     f"data-cf-beacon='{{\"token\": \"{html.escape(cfg['cf_beacon'])}\"}}'></script>\n")
    web = web.replace("</head>", them_dau + "</head>", 1)
    assert "</main>" in web
    ghi = GHI_AI
    if mua:
        ghi = ghi.replace("</footer>", GHI_AFFILIATE + "\n</footer>")
    uh = cfg.get("ung_ho") or {}
    if uh.get("link") or uh.get("qr"):
        if uh.get("qr"):
            shutil.copy(HOC / uh["qr"], ra / Path(uh["qr"]).name)
            files.append(Path(uh["qr"]).name)
        ghi = ghi.replace("</footer>", GHI_UNG_HO.format(
            chu=html.escape(uh.get("chu") or "Thấy có ích thì mời mình ly cà phê:"),
            link=f' <a href="{html.escape(uh["link"])}" target="_blank" rel="noopener">{html.escape(uh.get("nhan") or "Ủng hộ")} ↗</a>' if uh.get("link") else "",
            qr=f'<img class="qr-ung-ho" src="{html.escape(Path(uh["qr"]).name)}" alt="Mã QR ủng hộ" width="140" height="140" loading="lazy">' if uh.get("qr") else "",
        ) + "\n</footer>")
    web = web.replace("</main>", "</main>\n" + ghi, 1)
    (ra / "index.html").write_text(web)

    trang = render_tinh(ra, web, routes(ra))
    files += trang
    # 404.html: Workers Static Assets trả trang này (mã 404) cho đường dẫn lạ — xem not_found_handling trong wrangler.jsonc.
    (ra / "404.html").write_text(re.sub(r'<main id="app">.*</main>', '<main id="app"><section class="dau"><h1>Không có trang này</h1>'
        '<p class="lede">Link có thể đã đổi. Xem <a href="/">danh sách bài</a> hoặc <a href="/linh-kien/">thư viện linh kiện</a>.</p></section></main>',
        web, count=1, flags=re.S).replace('<script src="app.js"></script>', ''))
    files.append("404.html")
    ngay = date.today().isoformat()
    (ra / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"<url><loc>{WEB}/{r + '/' if r else ''}</loc><lastmod>{ngay}</lastmod></url>\n" for r in trang_sitemap(trang))
        + "</urlset>\n")
    (ra / "robots.txt").write_text(f"User-agent: *\nDisallow: /api/\nDisallow: /mua/\nSitemap: {WEB}/sitemap.xml\n")
    files += ["sitemap.xml", "robots.txt"]

    json.dump(files, sys.stdout, ensure_ascii=False)
    print()


def co_pdf():
    """Cỡ PDF ghi trong hộp hỏi: lấy từ bản in lần trước (deploy-web.sh in lại ngay sau), chưa có thì số ước."""
    f = ROOT / "build" / "ban-rap.pdf"
    return round(f.stat().st_size / 2**20) if f.exists() else 57


def routes(ra):
    """Mọi route có trang tĩnh: trang chủ, từng bài trong giáo trình, thư viện + từng linh kiện, đồ, mô phỏng, robot AI."""
    gt = (ra / "notes/giao-trinh-dien.md").read_text()
    bai = re.findall(r"^\|\s*(\d+\.\d+)[^|]*\|", gt, re.M)
    lk = re.findall(r"\{ id: '([\w-]+)', nhom:", (HOC / "linhkien.js").read_text())
    return ["", "do", "linh-kien", "mo-phong", "xiaozhi", *(f"bai/{b}" for b in bai), *(f"linh-kien/{x}" for x in lk)]


def trang_sitemap(trang):
    # "do" là danh sách tick của từng người (localStorage) — trang tĩnh chỉ là bảng trống, không đưa vào sitemap.
    return [t[:-len("/index.html")] if t != "index.html" else "" for t in trang if t != "do/index.html"]


class DuongDan(SimpleHTTPRequestHandler):
    """Phục vụ bản tĩnh cho Chrome chụp: route chưa có file → index.html (app.js tự vẽ theo đường dẫn)."""
    def log_message(self, *a):
        pass

    def do_GET(self):
        p = self.path.split("?", 1)[0]
        if not Path(self.directory, p.lstrip("/")).is_file() and not p.startswith("/api/"):
            self.path = "/index.html"
        super().do_GET()


def chup(goc, tam, i_route):
    """Chrome headless mở route, chờ app.js vẽ xong, trả DOM. Chrome máy này dump xong không tự thoát
    (giống xuat-pdf.py) → chờ tới </html> rồi kill cả nhóm tiến trình."""
    i, route = i_route
    ra = Path(tam) / f"{i:03d}.html"
    with open(ra, "wb") as out:
        pr = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--disable-background-networking",
                               "--disable-component-update", f"--user-data-dir={tam}/p{i}", "--virtual-time-budget=10000",
                               "--dump-dom", f"{goc}/{route + '/' if route else ''}"],
                              stdout=out, stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        het = time.time() + 120
        while time.time() < het:
            time.sleep(0.5)
            t = ra.read_text(errors="replace")
            if t.rstrip().endswith("</html>"):
                return t
        raise RuntimeError(f"chụp {route or '/'} quá 120s")
    finally:
        try:
            os.killpg(pr.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        pr.wait()


def render_tinh(ra, web, ds):
    """Mỗi route một file <route>/index.html: nội dung <main> + khối meta do app.js vẽ, ráp vào khung index.html.
    Chỉ lấy 2 khúc đó từ DOM chụp được: phần còn lại (script bai/*.js app.js tự chèn vào <head>, số lượt xem) phải giữ như khung gốc."""
    srv = ThreadingHTTPServer(("127.0.0.1", 0), partial(DuongDan, directory=str(ra)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    goc = f"http://127.0.0.1:{srv.server_address[1]}"
    ket = []
    with tempfile.TemporaryDirectory() as tam:
        with ThreadPoolExecutor(6) as ex:
            doms = list(ex.map(partial(chup, goc, tam), enumerate(ds)))
    srv.shutdown()
    for route, dom in zip(ds, doms):
        main = re.search(r'<main id="app">.*</main>', dom, re.S)
        meta = re.search(r"<!--meta:.*?<!--/meta-->", dom, re.S)
        if not main or not meta or "Lỗi tải trang" in main[0] or "Đang tải…" in main[0]:
            raise RuntimeError(f"chụp {route or '/'} không ra nội dung")
        # thay bằng hàm chứ không bằng chuỗi: nội dung có \\ (công thức, code) mà re.sub sẽ hiểu là escape
        t = re.sub(r"<!--meta:.*?<!--/meta-->", lambda _: meta[0], web, count=1, flags=re.S)
        t = re.sub(r'<main id="app">.*</main>', lambda _: main[0], t, count=1, flags=re.S)
        f = Path(route) / "index.html"
        (ra / f).parent.mkdir(parents=True, exist_ok=True)
        (ra / f).write_text(t)
        ket.append(str(f))
    return ket


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]).resolve())
