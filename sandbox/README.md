# sandbox — thử nghiệm nhỏ

| Thư mục | Nội dung |
|---|---|
| `esp32-bai/` | Code ESP-IDF các bài Phần 2 — xem README trong đó |
| `robot-face/` | Mặt robot OLED 128×64 chạy trong cửa sổ SDL. Dùng chung `firmware/boards/ares-bread/robot_face.c` với firmware |
| `sensor-panel/` | Màn 800×480 hiện thông số máy (CPU/GPU/RAM/ổ/quạt/mạng) — bài tập LVGL, giả lập trên Mac |

Cả hai bản giả lập build bằng `cc` + Makefile, không cần cmake. Chưa chạy trên ESP32.

## Chuẩn bị (một lần)

```sh
brew install sdl2
git clone --depth 1 -b v9.6.0 https://github.com/lvgl/lvgl.git sandbox/sensor-panel/lvgl   # gitignored; robot-face dùng chung bản này
```

## robot-face

```sh
cd sandbox/robot-face && make -j8
./face                      # cửa sổ, click để đổi nét mặt
./face --sheet a.bmp        # ghép 9 nét mặt thành 1 ảnh (make sheet → sheet.png)
./face --udp 9999           # nhận lệnh từ server/mac_device.py
# thêm --device ở cuối: bố cục + bảng màu như trên chip (chừa 16 px thanh trạng thái, màu đảo)
```

## sensor-panel

```sh
cd sandbox/sensor-panel && make -j8
./panel                     # cửa sổ, bấm được tab bar
./panel --shot out.bmp      # chụp màn (make shot → shot.png)
./panel --bench 10          # đo heap LVGL + lượng pixel vẽ lại
# thêm --demo ở cuối: số giả thay vì cảm biến Mac
```

`sensors_mac.c` đọc cảm biến Mac Apple Silicon qua IOKit/SMC (không cần sudo) nên Makefile chỉ build trên macOS.
Chạy trên ESP32 thật thì PC phải gửi số sang (chưa làm).
