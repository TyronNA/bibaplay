#!/usr/bin/env python3
"""Xuất web tự học thành bản tĩnh để publish (không có server.py).

    python3 hoc/xuat-web.py <thư mục ra>

Khác bản local: dùng luu-web.js (số đo, tiến độ, đồ đang có nằm trong localStorage của người xem),
danh sách bài lấy từ bai/ds.json sinh ở đây. Không chép hoc/ket-qua/ — đó là số đo của riêng mình.
Deploy: hoc/deploy-web.sh.
"""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOC = ROOT / "hoc"
JS = ["md.js", "board.js", "linhkien.js", "bai-chung.js", "luu-web.js", "app.js"]
NOTES = ["notes/giao-trinh-dien.md", "notes/do-dang-co.md"]
# Bản chia sẻ cho người khác: nói rõ ai soạn và mức đã kiểm, vì hướng dẫn ráp sai là cháy đồ thật.
GHI_AI = """<footer class="ghi-ai to">
<p><b>Chia sẻ miễn phí, không bán.</b> Nội dung, hình vẽ và code do AI (Claude của Anthropic) soạn theo yêu cầu của một người đang tự học điện tử.</p>
<p>Phần lớn bài <b>chưa được ráp thử để kiểm</b>, code Phần 2 đã build nhưng chưa chạy trên chip, nên có thể sai. Luôn đo Ω trước khi cấp điện, đối chiếu datasheet trước khi tin số trong bài. Thấy khói, mùi khét hoặc linh kiện nóng thì rút nguồn ngay.</p>
</footer>"""


def main(ra):
    if ra.exists():
        shutil.rmtree(ra)
    (ra / "bai").mkdir(parents=True)
    files = ["style.css", *JS]
    for f in files:
        shutil.copy(HOC / f, ra / f)

    bai = sorted(p.stem for p in (HOC / "bai").glob("*.js"))
    for b in bai:
        shutil.copy(HOC / "bai" / f"{b}.js", ra / "bai" / f"{b}.js")
        files.append(f"bai/{b}.js")
    (ra / "bai" / "ds.json").write_text(json.dumps(bai))
    files.append("bai/ds.json")

    # Code các bài Phần 2 mà trang bài tải về hiển thị (trường `code:` trong bai/*.js).
    code = sorted({m for b in bai for m in re.findall(r"code: *'([^']+)'", (HOC / "bai" / f"{b}.js").read_text())})
    for f in NOTES + code:
        (ra / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(ROOT / f, ra / f)
        files.append(f)

    goc = (HOC / "index.html").read_text()
    assert '<script src="luu-server.js"></script>' in goc
    nav = '<a href="#/linh-kien" data-r="linh-kien">Linh kiện</a>'
    assert nav in goc
    # ban-rap.pdf: xuat-pdf.py in từ chính thư mục này, nằm trên R2, hoc/worker.js phát ra (deploy-web.sh).
    web = goc.replace('<script src="luu-server.js"></script>', '<script src="luu-web.js"></script>') \
        .replace(nav, nav + '<a href="ban-rap.pdf" download>Tải PDF</a>')
    assert "</main>" in web
    web = web.replace("</main>", "</main>\n" + GHI_AI, 1)
    (ra / "index.html").write_text(web)

    json.dump(files, sys.stdout, ensure_ascii=False)
    print()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]).resolve())
