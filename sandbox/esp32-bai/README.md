# esp32-bai

Code cho các bài Phần 2, 3, 4 của `notes/giao-trinh-dien.md` (chương 8–21). Một project, mỗi bài một file `main/bai_X_Y.c`;
web tự học hiện thẳng file đó trong trang bài.

```sh
source firmware/idf-env.sh
cd sandbox/esp32-bai
idf.py menuconfig                       # Bai hoc → chọn bài (mặc định 9.1)
idf.py -p /dev/cu.usbmodem* flash monitor
```

Chân dùng chung ở `main/chung.h` (LED 13, nút 12, ADC 1/2, chân B transistor 14, driver motor 9/10) — né chân xiaozhi,
chân strapping, chân flash/PSRAM và USB (bài 9.6).

Phần 3 thêm: FC-51 8, khe quang 11, HC-SR04 17/18, TCRT5000 21 + ADC 2, servo 14, motor B robot 14/21
(`chung.h`; 14 và 21 dùng lại ở bài khác nhau). Bài 14.1 chạy lại code 9.4.

Đã build + link với IDF v6.1 (các bài 8.4, 9.1, 10.2, 12.1, 12.2, 13.3, 14.3, 15.2, 15.3, 17.1; mọi file `bai_*.c` đều biên dịch
không cảnh báo). **Chưa chạy trên chip** (chưa có board).

Phần 4 (chương 18–21): nền chung ở `main/robot.c` / `robot.h` (motor + encoder + odometry + PI tốc độ bánh ở task 50Hz, IMU,
ADC, servo, WiFi/UDP tới trạm `../robot-may/tram.py`). Chân thêm: khe quang 11/13, I2C 41/42, TCRT 4/5, servo 15, LiDAR 16.
Tên/mật khẩu WiFi, mm/xung, khoảng cách bánh, hệ số trộn gyro: `idf.py menuconfig` → **Robot (Phan 4)** (lưu trong `sdkconfig`,
file này đã gitignore). `main/ld19.c` thử được trên máy tính: `cc -Imain main/ld19.c test/test_ld19.c -o /tmp/t && /tmp/t`.
Đã build + link với IDF v6.1 (thử link riêng 20.3, 20.4, 21), không cảnh báo. **Chưa chạy trên chip.**
