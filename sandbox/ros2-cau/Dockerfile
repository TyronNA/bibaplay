# ROS 2 Jazzy (bản cho Ubuntu 24.04) + các gói chương 21. Build một lần: ./chay.sh dung
FROM ros:jazzy-ros-base
RUN apt-get update && apt-get install -y --no-install-recommends \
      ros-jazzy-slam-toolbox ros-jazzy-navigation2 ros-jazzy-nav2-bringup \
      ros-jazzy-foxglove-bridge ros-jazzy-teleop-twist-keyboard python3-yaml \
    && rm -rf /var/lib/apt/lists/*
COPY cau_robot.py slam.yaml sua_nav2.py /ares/
RUN python3 /ares/sua_nav2.py /opt/ros/jazzy/share/nav2_bringup/params/nav2_params.yaml /ares/nav2.yaml
WORKDIR /ares
