# server — thay xiaozhi.me

Server cho firmware [xiaozhi-esp32](https://github.com/78/xiaozhi-esp32): chip gọi `POST /xiaozhi/ota/`, nhận địa chỉ
WebSocket + token, rồi nói chuyện qua `GET /xiaozhi/v1/` (giao thức `xiaozhi-esp32/docs/websocket.md`).
Có `GEMINI_API_KEY` thì mỗi kết nối là một phiên Gemini Live (nghe + nghĩ + nói); không có thì **echo** (phát lại câu vừa nói).

Mỗi file có docstring đầu file ghi cách chạy. Chưa có board: `fake_device.py` (tự kiểm) hoặc `mac_device.py`
(mic + loa Mac). `deploy.sh <ssh-host>` đẩy lên máy Linux chạy 24/7 bằng systemd (service chạy dưới user SSH vào,
key ở `~/.config/ares/gemini.env` của user đó).

## Chạy

Cần Python ≥ 3.10 và libopus (`brew install opus` / `sudo apt install libopus0`).

```sh
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
GEMINI_API_KEY=... ARES_DEVICES=<MAC chip> .venv/bin/python app.py  # in ra OTA URL cho firmware
.venv/bin/python fake_device.py                                     # terminal khác: tự kiểm
```

Key miễn phí: https://aistudio.google.com/apikey. `ARES_DEVICES`: MAC các chip được phép, cách nhau dấu phẩy — chip
lạ bị từ chối và log in MAC của nó ra, chép vào đây. Biến khác: `ARES_TOKEN` (mặc định sinh mới mỗi lần chạy), `GEMINI_MODEL`, `GEMINI_VOICE`, `ARES_PROMPT`,
`ARES_MCP_CONFIG`, `ARES_DB`, `ARES_DEBUG`, `GEMINI_WS_URL` (trỏ sang `mock_gemini.py`).

## Bẫy

- **Chỉ chạy trong LAN.** Token phát qua `/xiaozhi/ota/` (firmware cần vậy để tự kết nối) nên không chặn được người lạ;
  cái chặn là `ARES_DEVICES`, mà MAC thì giả được. Chip ↔ server là `ws://` không mã hoá. Mở cổng ra Internet = rủi ro
  người khác xài key Gemini.
- Key miễn phí: Google được dùng dữ liệu. Đừng nối MCP vào mail/Jira công ty khi dùng key free.
- `mac_device.py` nửa song công (tắt mic lúc robot nói): Mac không khử vọng như chip, mở mic thì Gemini tự trả lời chính nó.
