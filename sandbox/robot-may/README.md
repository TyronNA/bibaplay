# robot-may

Phần chạy trên máy tính của Phần 4 (chương 18–20). Chỉ cần Python 3, không cài thêm gói nào.

```sh
python3 tram.py          # trạm: http://localhost:8008, chờ robot thật (UDP 4210)
python3 tram.py --gia    # kèm robot giả trong phòng ảo 3m × 2.5m
```

- `tram.py` — nhận dòng số liệu của robot (`T`, `R`, `S`), đẩy lên trình duyệt; chuyển lệnh từ trình duyệt xuống robot (UDP 4211).
  Mọi dòng nhận được ghi vào `tram-<giờ>.log`. Trang web chỉ nghe 127.0.0.1 (có nút lái robot).
- `tram.html` — giao diện: đồ thị từng khoá của dòng T, bản đồ (đường đi, radar, lưới chiếm chỗ, vệt phủ), lái bằng W A S D.
- `gia_robot.py` — robot giả nói cùng giao thức (lệnh H, B, V, D, VUONG, F, Q, Z, X, QUET). Cũng dùng được với cầu ROS 2 (`../ros2-cau`).

Giao thức và firmware: `../esp32-bai/main/robot.h`.
