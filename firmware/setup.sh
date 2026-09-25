#!/bin/sh
# Gắn board ares-bread vào bản clone xiaozhi-esp32. Chạy lại bao nhiêu lần cũng được
# (sau `git pull` upstream thì chạy lại; patch lệch thì git apply báo lỗi, sửa patch).
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
X="$ROOT/xiaozhi-esp32"
PATCH="$ROOT/firmware/xiaozhi-ares.patch"

# Thư mục thật + symlink từng file: scripts/build.py dò board bằng Path.rglob, mà rglob không
# đi vào thư mục symlink -> symlink cả thư mục thì build.py báo "Variant not found".
B="$X/main/boards/ares-bread"
[ -L "$B" ] && rm "$B"
mkdir -p "$B"
for f in "$ROOT"/firmware/boards/ares-bread/*; do
    ln -sfn "../../../../firmware/boards/ares-bread/$(basename "$f")" "$B/$(basename "$f")"
done
cd "$X"
if git apply --check --reverse "$PATCH" 2>/dev/null; then
    echo "patch đã áp sẵn"
else
    git apply "$PATCH"
    echo "đã áp patch"
fi
