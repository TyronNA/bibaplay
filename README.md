# Bàn ráp — tự học điện tử → ESP32 → robot

Giáo trình tự học điện tử cho dân phần mềm: từ pin + điện trở trên breadboard, qua ESP32-S3, tới robot 2 bánh.
Mỗi bài có hình breadboard từng bước (chân nào cắm lỗ nào), bước đo Ω trước khi cấp nguồn, và chỗ dễ chập/cháy.

- Web: https://bibaplay.com — PDF cả bộ: https://bibaplay.com/ban-rap.pdf
- Mô phỏng ghép mạch ngay trên web: https://bibaplay.com/mo-phong/ — cắm linh kiện, lắp pin, cầm que đo;
  nối sai thì báo nóng / bốc khói. Mô hình gần đúng, chưa có ESP32 (dùng [Wokwi](https://wokwi.com) cho phần đó).
- Chia sẻ miễn phí.

> **Do AI soạn.** Nội dung, hình vẽ và code do AI (Claude của Anthropic) soạn theo datasheet (nguồn ở
> `notes/datasheet-robot.md`). Phần lớn bài **chưa được ráp thử**. Luôn đo trước khi cấp nguồn; pin lithium cháy thật.

## Bố cục

| Thư mục | Nội dung |
|---|---|
| `notes/giao-trinh-dien.md` | Danh sách bài (web đọc thẳng file này) |
| `hoc/` | Web tự học: `bai/<id>.js` từng bài, `linhkien.js` thư viện linh kiện, `board.js` vẽ breadboard |
| `sandbox/esp32-bai/` | Code ESP-IDF các bài ESP32, chọn bài bằng `idf.py menuconfig` |
| `firmware/` | Board `ares-bread` cho [xiaozhi-esp32](https://github.com/78/xiaozhi-esp32) (clone riêng, không nằm trong repo) |
| `server/` | Server thay xiaozhi.me: giao thức xiaozhi ↔ Gemini Live |

## Chạy web ở máy

```sh
python3 hoc/server.py        # http://localhost:4300 — số đo lưu vào hoc/ket-qua/
node hoc/test/mo-phong.test.js   # test lõi mô phỏng
```

Bản công khai (số đo lưu localStorage của người xem): `hoc/deploy-web.sh` (xuất web + PDF, đẩy lên Cloudflare Workers + R2).

## License

MIT — xem `LICENSE`.
