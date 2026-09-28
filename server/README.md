# server — thay xiaozhi.me

Server cho firmware [xiaozhi-esp32](https://github.com/78/xiaozhi-esp32): chip gọi `POST /xiaozhi/ota/`, nhận địa chỉ
WebSocket + token, rồi nói chuyện qua `GET /xiaozhi/v1/` (giao thức `xiaozhi-esp32/docs/websocket.md`).
Có `GEMINI_API_KEY` thì mỗi kết nối là một phiên Gemini Live (nghe + nghĩ + nói); không có thì **echo** (phát lại câu vừa nói).

Mỗi file có docstring đầu file ghi cách chạy. Chưa có board: `fake_device.py` (tự kiểm) hoặc `mac_device.py`
(mic + loa Mac). `deploy-mini-pc.sh` + `ares-server.service` đẩy lên máy Linux chạy 24/7 bằng systemd — đang ghi cứng
user `tyron` và host `mini-pc`, sửa trước khi dùng.

## Chạy

Cần Python ≥ 3.10 và libopus (`brew install opus` / `sudo apt install libopus0`).

```sh
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
GEMINI_API_KEY=... ARES_TOKEN=chuoi-bi-mat .venv/bin/python app.py   # in ra OTA URL cho firmware
.venv/bin/python fake_device.py                                     # terminal khác: tự kiểm
```

Key miễn phí: https://aistudio.google.com/apikey. Biến khác: `GEMINI_MODEL`, `GEMINI_VOICE`, `ARES_PROMPT`,
`ARES_MCP_CONFIG`, `ARES_DB`, `ARES_DEBUG`, `GEMINI_WS_URL` (trỏ sang `mock_gemini.py`).

## Bẫy

- **Chỉ chạy trong LAN.** `/xiaozhi/ota/` trả token cho bất kỳ ai gọi (firmware cần vậy để tự kết nối), nên token
  không chặn người lạ; chip ↔ server là `ws://` không mã hoá. Mở cổng ra Internet = cho người khác xài key Gemini.
- Key miễn phí: Google được dùng dữ liệu. Đừng nối MCP vào mail/Jira công ty khi dùng key free.
- `mac_device.py` nửa song công (tắt mic lúc robot nói): Mac không khử vọng như chip, mở mic thì Gemini tự trả lời chính nó.
