#!/bin/sh
# Cài server web tự học chạy nền bằng launchd: tự bật khi đăng nhập, chết thì tự dậy.
# Gỡ: launchctl bootout gui/$(id -u)/dev.robotics.hoc && rm ~/Library/LaunchAgents/dev.robotics.hoc.plist
set -e
HOC="$(cd "$(dirname "$0")" && pwd)"
PLIST="$HOME/Library/LaunchAgents/dev.robotics.hoc.plist"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>dev.robotics.hoc</string>
  <key>ProgramArguments</key>
  <array><string>/usr/bin/python3</string><string>$HOC/server.py</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>/tmp/robotics-hoc.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/dev.robotics.hoc" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Đã chạy: http://localhost:4300"
