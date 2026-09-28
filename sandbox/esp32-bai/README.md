# esp32-bai

Code cho các bài Phần 2 của `notes/giao-trinh-dien.md` (chương 8–13). Một project, mỗi bài một file `main/bai_X_Y.c`;
web tự học hiện thẳng file đó trong trang bài.

```sh
source firmware/idf-env.sh
cd sandbox/esp32-bai
idf.py menuconfig                       # Bai hoc → chọn bài (mặc định 9.1)
idf.py -p /dev/cu.usbmodem* flash monitor
```

Chân dùng chung ở `main/chung.h` (LED 13, nút 12, ADC 1/2, chân B transistor 14, driver motor 9/10) — né chân xiaozhi,
chân strapping, chân flash/PSRAM và USB (bài 9.6).

Đã build + link với IDF v6.1 (các bài 8.4, 9.1, 10.2, 12.1, 12.2, 13.3). **Chưa chạy trên chip** (chưa có board).
