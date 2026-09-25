# Đồ cần mua cho xiaozhi bản breadboard

Pin lấy từ `xiaozhi-esp32/main/boards/bread-compact-wifi/config.h` (chế độ I2S simplex, mặc định).

| Linh kiện | Gợi ý | Chân ESP32-S3 |
|---|---|---|
| Board | ESP32-S3 DevKitC-1 **N16R8** (16MB flash, 8MB PSRAM) | — |
| Mic I2S | INMP441 *(phổ biến, chưa đối chiếu với tutorial Feishu)* | WS=4, SCK=5, SD=6 |
| Ampli I2S | MAX98357A *(như trên)* + loa 4Ω/8Ω 2–3W | DIN=7, BCLK=15, LRC=16 |
| OLED I2C | SSD1306 0.91" 128x32 (mặc định) hoặc 0.96" 128x64 | SDA=41, SCL=42 |
| Nút | nút nhấn nhỏ (touch / vol+ / vol−) | 47 / 40 / 39 (BOOT=0 có sẵn trên board) |
| Khác | cáp USB-C **có truyền data**, dây cắm đực-cái | — |

PSRAM: `sdkconfig.defaults.esp32s3` tính cho board có PSRAM (comment nói tối thiểu 2MB, 8MB thêm pool) → mua bản có PSRAM, N16R8 là an toàn.

## Giỏ đã chốt (2026-09-25, Shopee)

| | Món | Giá | Ghi chú |
|---|---|---|---|
| ✅ | ESP32-S3-WROOM-1 N16R8 44 pin Type-C | 160.000₫ | Board to, 1 breadboard chỉ chừa 1 hàng lỗ mỗi bên → ghép 2 breadboard |
| ✅ | INMP441 (MH-ET LIVE) | 39.553₫ | |
| ✅ | OLED 0.96" 128x64 I2C 4 pin | 57.750₫ | Build `bread-compact-wifi-128x64` (có trong `config.json`) |
| ✅ | MAX98357A | 34.845₫ | |
| ✅ | Loa ngoài điện thoại Samsung (A30s/A12…) | | Chịu ~0.5–1W (chưa kiểm) → để volume ~60–70%; phải hàn 2 dây |
| ➕ | Đồ nghề hàn | | Hàn header cho INMP441/MAX98357A/OLED — xem `can-mua.md` |
| ❓ | Cáp USB-C có data | | Kiểm cáp đang có |
| ❌ | ESP32-S3 SuperMini | | Dư; không ra GPIO 15/16/41/42 mà config dùng (theo trí nhớ, chưa kiểm pinout) |
| ❌ | TP4057 sạc 1 cell | | Chưa cần pin; quạt dự phòng đã có mạch sạc Type-C |

Linh kiện cơ bản đã có: `do-dang-co.md`.

## Tham khảo: bản bỏ túi Huy Vector
https://www.huyvector.org/robots-kinetic/pocket-ai-assistant — ESP32-C3 SuperMini + INMP441 + MAX98357A + OLED 0.96" +
loa Samsung A03. Firmware chỉ là `pocket-esp-ai.bin` đóng (không source). Upstream không có board C3 nào dùng mic + ampli I2S rời
(các board C3 dùng ES8311 hoặc ADC/PDM) → muốn làm bản C3 từ source phải tự tạo board mới theo `xiaozhi-esp32/AGENTS.md`.
