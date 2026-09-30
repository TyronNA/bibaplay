#!/bin/sh
# Chạy trên máy Linux cùng mạng WiFi với robot. --net=host: container dùng thẳng mạng của máy, để nhận được
# gói UDP quảng bá của robot và để các node ROS 2 thấy nhau.
set -e
cd "$(dirname "$0")"
ANH=ares-ros2
chay() { docker run --rm -it --net=host -v "$PWD/ban-do:/ares/ban-do" "$ANH" bash -c ". /opt/ros/jazzy/setup.sh && $1"; }
case "$1" in
  dung)     docker build -t "$ANH" . ;;
  cau)      chay "python3 cau_robot.py --ros-args -p lidar_x:=${LIDAR_X:-0.0} -p lidar_yaw_do:=${LIDAR_YAW:-0}" ;;
  xem)      chay "ros2 launch foxglove_bridge foxglove_bridge_launch.xml port:=8765" ;;
  lai)      chay "ros2 run teleop_twist_keyboard teleop_twist_keyboard" ;;
  slam)     chay "ros2 launch slam_toolbox online_async_launch.py slam_params_file:=/ares/slam.yaml use_sim_time:=false" ;;
  luu)      mkdir -p ban-do && chay "ros2 run nav2_map_server map_saver_cli -f /ares/ban-do/phong" ;;
  nav2)     chay "ros2 launch nav2_bringup navigation_launch.py params_file:=/ares/nav2.yaml use_sim_time:=false" ;;
  lenh)     shift; chay "$*" ;;
  *) echo "dung | cau | xem | lai | slam | luu | nav2 | lenh <lệnh ros2>"; exit 1 ;;
esac
