#!/bin/sh
# Đẩy server lên mini-pc và (khởi động lại) service. Chạy lại được nhiều lần.
set -e
cd "$(dirname "$0")"
HOST=${1:-mini-pc}
ssh "$HOST" 'sudo -n mkdir -p /opt/ares-server && sudo -n chown tyron: /opt/ares-server'
rsync -a --delete --exclude .venv --exclude __pycache__ --exclude '*.wav' ./ "$HOST":/opt/ares-server/
ssh "$HOST" 'set -e
cd /opt/ares-server
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q -r requirements.txt
# file key để trống sẵn, quyền 600: chỉ user tyron đọc được
mkdir -p ~/.config/ares && chmod 700 ~/.config/ares
[ -f ~/.config/ares/gemini.env ] || { printf "# Dán key từ https://aistudio.google.com/apikey rồi: sudo systemctl restart ares-server\nGEMINI_API_KEY=\n" > ~/.config/ares/gemini.env; }
chmod 600 ~/.config/ares/gemini.env
sudo -n cp ares-server.service /etc/systemd/system/
sudo -n systemctl daemon-reload
sudo -n systemctl enable ares-server >/dev/null 2>&1
sudo -n systemctl restart ares-server
sleep 1
systemctl is-active ares-server
journalctl -u ares-server -n 4 --no-pager -o cat'
