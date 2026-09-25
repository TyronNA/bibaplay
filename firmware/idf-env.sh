# source firmware/idf-env.sh — nạp ESP-IDF v6.1.
# Phải có /opt/homebrew/bin đứng trước: venv của IDF được cài bằng Python 3.13 của brew, còn
# python3 mặc định của máy (/usr/local/bin, 3.10) làm export.sh đi tìm venv py3.10 không tồn tại.
export PATH="/opt/homebrew/bin:$PATH"
export IDF_PATH="$HOME/esp/esp-idf"
. "$IDF_PATH/export.sh" >/dev/null 2>&1 || echo "idf-env: export.sh lỗi, chạy tay để xem" >&2
