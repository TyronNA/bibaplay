# ares-bread

Board riêng: phần cứng và đi dây y hệt `bread-compact-wifi` biến thể 128x64
(ESP32-S3 N16R8, INMP441, MAX98357A, OLED SSD1306 0.96" I2C). Có 2 điểm khác:

- Màn hình dùng `RobotFaceDisplay`: giữ thanh trạng thái 16 px của xiaozhi, còn vùng 48 px bên dưới
  hiện mặt robot (`robot_face.c`, dùng chung với bản giả lập `sandbox/robot-face`).
- `CONFIG_OTA_URL` trỏ về server riêng (`server/app.py`) thay vì xiaozhi.me.

Board type riêng (`ares-bread`) để OTA của upstream không bao giờ đè firmware này bằng bản gốc.

## Build

```sh
firmware/setup.sh                      # symlink board + áp patch Kconfig/CMake vào xiaozhi-esp32
source firmware/idf-env.sh
cd xiaozhi-esp32 && python3 scripts/build.py ares-bread --name ares-bread --language vi-VN
idf.py -p /dev/cu.usbmodem* flash monitor
```

## Bẫy

- **IP trong `config.json`** (`CONFIG_OTA_URL`) là IP LAN của mini-pc (server chạy ở đó, `server/deploy-mini-pc.sh`). DHCP đổi IP
  thì chip không gọi được server nữa: đặt IP tĩnh cho máy đó, hoặc build lại.
- **Màu trên OLED ngược với LVGL:** `esp_lvgl_port` bật điểm khi màu *tối*. Vì vậy
  `RobotFaceDisplay` vẽ mắt màu đen trên nền trắng. Xem trước đúng như trên chip bằng
  `./face --sheet a.bmp --device`.
