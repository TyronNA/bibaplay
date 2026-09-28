#!/bin/sh
# Đẩy server lên một máy Linux có systemd và (khởi động lại) service. Chạy lại được nhiều lần.
#   server/deploy.sh <ssh-host>        # host trong ~/.ssh/config hoặc user@ip; user đó cần sudo không hỏi mật khẩu
# Service chạy dưới đúng user SSH vào; key + cấu hình nằm trong ~/.config/ares/ của user đó, không nằm trong repo.
set -e
[ -n "$1" ] || { echo "cách dùng: $0 <ssh-host>" >&2; exit 2; }
HOST=$1
cd "$(dirname "$0")"
ssh "$HOST" 'sudo -n mkdir -p /opt/ares-server && sudo -n chown "$(id -un):" /opt/ares-server'
rsync -a --delete --exclude .venv --exclude __pycache__ --exclude '*.wav' ./ "$HOST":/opt/ares-server/
ssh "$HOST" 'set -e
cd /opt/ares-server
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q -r requirements.txt
# file key để trống sẵn, quyền 600: chỉ user này đọc được
mkdir -p ~/.config/ares && chmod 700 ~/.config/ares
[ -f ~/.config/ares/gemini.env ] || { printf "# Dán key từ https://aistudio.google.com/apikey rồi: sudo systemctl restart ares-server\nGEMINI_API_KEY=\n# MAC của chip được phép, cách nhau dấu phẩy (log server in ra MAC bị từ chối)\nARES_DEVICES=\n" > ~/.config/ares/gemini.env; }
chmod 600 ~/.config/ares/gemini.env
# cấu hình MCP chứa token dịch vụ -> cũng 600; rỗng = không có tool MCP
[ -f ~/.config/ares/mcp.json ] || printf "{\"mcpServers\": {}}\n" > ~/.config/ares/mcp.json
chmod 600 ~/.config/ares/mcp.json
# ares-server.service là mẫu: điền user + HOME của máy đích
sed -e "s|@USER@|$(id -un)|" -e "s|@HOME@|$HOME|" ares-server.service | sudo -n tee /etc/systemd/system/ares-server.service >/dev/null
sudo -n systemctl daemon-reload
sudo -n systemctl enable ares-server >/dev/null 2>&1
sudo -n systemctl restart ares-server
sleep 1
systemctl is-active ares-server
journalctl -u ares-server -n 4 --no-pager -o cat'
