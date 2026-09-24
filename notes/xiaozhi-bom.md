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
