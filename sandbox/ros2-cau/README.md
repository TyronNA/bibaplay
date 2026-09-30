# ros2-cau

Chương 21: ROS 2 Jazzy trong Docker trên máy Linux cùng mạng WiFi với robot (firmware bài "21.x").

```sh
./chay.sh dung     # build image một lần (ROS 2 + slam_toolbox + Nav2 + foxglove_bridge + teleop)
./chay.sh cau      # cầu nối robot ↔ ROS 2  (LIDAR_X=0.05 LIDAR_YAW=0 ./chay.sh cau nếu LiDAR lệch tâm)
./chay.sh xem      # foxglove_bridge, cổng 8765
./chay.sh lai      # lái bằng bàn phím (/cmd_vel)
./chay.sh slam     # slam_toolbox (slam.yaml)
./chay.sh luu      # lưu bản đồ vào ./ban-do/phong.{pgm,yaml}
./chay.sh nav2     # Nav2 với nav2.yaml (sinh từ tham số mặc định bằng sua_nav2.py lúc build)
```

`python3 cau_robot.py --tu-kiem` kiểm phần giải gói LD19 / dòng T mà không cần ROS.

Đã kiểm: `--tu-kiem` (gói mẫu của tài liệu LD19), `sua_nav2.py` trên file giả cùng cấu trúc.
**Chưa chạy**: build Docker, cả chuỗi ROS 2 với robot thật.
