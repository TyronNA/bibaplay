#!/usr/bin/env python3
"""Cầu nối ROS 2 ↔ robot Phần 4 (firmware bài 21) qua UDP.

  robot "T x y th v w" (mm, độ, mm/s, rad/s)  →  /odom (nav_msgs/Odometry) + TF odom → base_link
  byte thô LD19 (UDP 4212)                    →  /scan (sensor_msgs/LaserScan) + TF tĩnh base_link → laser
  /cmd_vel (geometry_msgs/Twist, m/s, rad/s)  →  robot "V v w" (mm/s, rad/s), 20 lần/giây
Không có /cmd_vel mới trong 0.5s thì gửi "V 0 0": robot vẫn thấy trạm nhưng đứng yên.

Phần giải gói LD19 và dòng T không cần ROS (test: python3 cau_robot.py --tu-kiem).
"""
import math
import socket
import sys
import time

CONG_TRAM, CONG_ROBOT, CONG_LIDAR = 4210, 4211, 4212
SO_O = 450   # LD19: 4500 điểm/s ÷ 10 vòng/s ≈ 450 điểm/vòng → mỗi ô 0.8°


def crc8(b):
    # CRC-8 đa thức 0x4D, khởi đầu 0: chính là bảng CrcTable trong tài liệu LD19
    c = 0
    for x in b:
        c ^= x
        for _ in range(8):
            c = ((c << 1) ^ 0x4D) & 0xFF if c & 0x80 else (c << 1) & 0xFF
    return c


class DocLD19:
    """Nạp byte thô, trả về các gói đúng CRC: (tốc độ °/s, góc đầu °, góc cuối °, [(mm, cường độ)] × 12)."""

    def __init__(self):
        self.dem = bytearray()
        self.tot = self.hong = 0

    def nap(self, b):
        self.dem += b
        ra = []
        while len(self.dem) >= 47:
            i = self.dem.find(b"\x54\x2c")
            if i < 0:
                del self.dem[:-1]
                break
            if i:
                del self.dem[:i]
            if len(self.dem) < 47:
                break
            g = bytes(self.dem[:47])
            if crc8(g[:46]) != g[46]:
                self.hong += 1
                del self.dem[:1]   # có thể là 0x54 0x2C lạc giữa dữ liệu: dò tiếp từ byte sau
                continue
            del self.dem[:47]
            self.tot += 1
            u16 = lambda k: g[k] | (g[k + 1] << 8)
            diem = [(u16(6 + 3 * j), g[8 + 3 * j]) for j in range(12)]
            ra.append((u16(2), u16(4) / 100, u16(42) / 100, diem))
        return ra


def goc_diem(dau, cuoi):
    """12 góc (°) nội suy đều từ góc đầu tới góc cuối; qua mốc 360° thì cộng 360 cho góc cuối."""
    if cuoi < dau:
        cuoi += 360
    buoc = (cuoi - dau) / 11
    return [(dau + buoc * j) % 360 for j in range(12)]


def doc_T(dong):
    kv = dict(x.split("=", 1) for x in dong.split()[1:] if "=" in x)
    return {k: float(v) for k, v in kv.items()}


def tu_kiem():
    mau = bytes.fromhex("542C6808AB7EE000E4DC00E2D900E5D500E3D300E4D000E9CD00E4CA00E2C700E9C500E5C200E5C000E5BE823A1A50")
    d = DocLD19()
    goi = d.nap(b"\x00\x54\x11" + mau[:20]) + d.nap(mau[20:] + mau)
    assert crc8(mau[:46]) == 0x50, hex(crc8(mau[:46]))
    assert len(goi) == 2 and goi[0][0] == 2152 and goi[0][1] == 324.27 and goi[0][2] == 334.7, goi[:1]
    assert goi[0][3][0] == (224, 228) and goi[0][3][11] == (192, 229)
    g = goc_diem(355.0, 5.0)
    assert abs(g[0] - 355) < 1e-9 and abs(g[11] - 5) < 1e-9 and abs(g[6] - (355 + 60 / 11) % 360) < 1e-9, g
    assert doc_T("T x=12.5 y=-3 th=90.00 v=0 w=0.100") == {"x": 12.5, "y": -3.0, "th": 90.0, "v": 0.0, "w": 0.1}
    print("OK")


def main():
    import rclpy
    from rclpy.node import Node
    from geometry_msgs.msg import Twist, TransformStamped
    from nav_msgs.msg import Odometry
    from sensor_msgs.msg import LaserScan
    from tf2_ros import TransformBroadcaster, StaticTransformBroadcaster

    def quat_yaw(y):
        return (0.0, 0.0, math.sin(y / 2), math.cos(y / 2))

    class Cau(Node):
        def __init__(self):
            super().__init__("cau_robot")
            # LiDAR gắn trên robot: lệch trước tâm bánh bao nhiêu mét, và mũi tên ▵ trên nắp quay lệch mũi robot bao nhiêu độ
            self.lidar_x = self.declare_parameter("lidar_x", 0.0).value
            self.lidar_yaw = math.radians(self.declare_parameter("lidar_yaw_do", 0.0).value)
            self.robot = None
            self.lenh, self.lan_lenh = (0.0, 0.0), 0.0
            self.s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.s.bind(("", CONG_TRAM))
            self.s.setblocking(False)
            self.l = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.l.bind(("", CONG_LIDAR))
            self.l.setblocking(False)
            self.ld = DocLD19()
            self.vong = [math.inf] * SO_O
            self.cd = [0.0] * SO_O
            self.goc_truoc = None
            self.odom = self.create_publisher(Odometry, "odom", 10)
            self.scan = self.create_publisher(LaserScan, "scan", 10)
            self.tf = TransformBroadcaster(self)
            st = StaticTransformBroadcaster(self)
            t = TransformStamped()
            t.header.stamp = self.get_clock().now().to_msg()
            t.header.frame_id, t.child_frame_id = "base_link", "laser"
            t.transform.translation.x = self.lidar_x
            t.transform.translation.z = 0.1
            (t.transform.rotation.x, t.transform.rotation.y, t.transform.rotation.z, t.transform.rotation.w) = quat_yaw(self.lidar_yaw)
            st.sendTransform(t)
            self.create_subscription(Twist, "cmd_vel", self.nhan_lenh, 10)
            self.create_timer(0.005, self.doc_udp)
            self.create_timer(0.05, self.gui_lenh)
            self.get_logger().info(f"nghe robot o UDP {CONG_TRAM}, LiDAR o {CONG_LIDAR}")

        def nhan_lenh(self, m):
            self.lenh, self.lan_lenh = (m.linear.x, m.angular.z), time.time()

        def gui_lenh(self):
            if not self.robot:
                return
            v, w = self.lenh if time.time() - self.lan_lenh < 0.5 else (0.0, 0.0)
            self.s.sendto(f"V {v * 1000:.0f} {w:.3f}".encode(), (self.robot, CONG_ROBOT))

        def doc_udp(self):
            for _ in range(50):
                try:
                    b, (ip, _) = self.s.recvfrom(512)
                except BlockingIOError:
                    break
                if self.robot != ip:
                    self.robot = ip
                    self.s.sendto(b"H", (ip, CONG_ROBOT))
                    self.get_logger().info(f"thay robot o {ip}")
                d = b.decode("utf-8", "replace").strip()
                if d.startswith("T "):
                    self.phat_odom(doc_T(d))
                elif d.startswith("S "):
                    self.get_logger().info("robot: " + d[2:])
            for _ in range(50):
                try:
                    b = self.l.recv(2048)
                except BlockingIOError:
                    break
                for toc, dau, cuoi, diem in self.ld.nap(b):
                    if self.goc_truoc is not None and dau < self.goc_truoc:   # qua mốc 0°: đủ 1 vòng
                        self.phat_scan(toc)
                    self.goc_truoc = dau
                    for g, (mm, cd) in zip(goc_diem(dau, cuoi), diem):
                        # LD19 tăng góc theo chiều kim đồng hồ, ROS tăng ngược chiều: đổi dấu
                        k = int(((-g) % 360) / 360 * SO_O) % SO_O
                        r = mm / 1000 if mm > 0 else math.inf
                        if r < self.vong[k]:
                            self.vong[k], self.cd[k] = r, float(cd)

        def phat_odom(self, t):
            if not {"x", "y", "th"} <= t.keys():
                return
            now = self.get_clock().now().to_msg()
            th = math.radians(t["th"])
            q = quat_yaw(th)
            o = Odometry()
            o.header.stamp, o.header.frame_id, o.child_frame_id = now, "odom", "base_link"
            o.pose.pose.position.x, o.pose.pose.position.y = t["x"] / 1000, t["y"] / 1000
            (o.pose.pose.orientation.x, o.pose.pose.orientation.y, o.pose.pose.orientation.z, o.pose.pose.orientation.w) = q
            o.twist.twist.linear.x = t.get("v", 0.0) / 1000
            o.twist.twist.angular.z = t.get("w", 0.0)
            self.odom.publish(o)
            tf = TransformStamped()
            tf.header.stamp, tf.header.frame_id, tf.child_frame_id = now, "odom", "base_link"
            tf.transform.translation.x, tf.transform.translation.y = o.pose.pose.position.x, o.pose.pose.position.y
            tf.transform.rotation = o.pose.pose.orientation
            self.tf.sendTransform(tf)

        def phat_scan(self, toc_do):
            m = LaserScan()
            m.header.stamp, m.header.frame_id = self.get_clock().now().to_msg(), "laser"
            m.angle_min, m.angle_increment = 0.0, 2 * math.pi / SO_O
            m.angle_max = m.angle_min + m.angle_increment * (SO_O - 1)
            m.scan_time = 360.0 / toc_do if toc_do else 0.1
            m.time_increment = m.scan_time / SO_O
            m.range_min, m.range_max = 0.02, 12.0
            m.ranges, m.intensities = self.vong, self.cd
            self.scan.publish(m)
            self.vong, self.cd = [math.inf] * SO_O, [0.0] * SO_O

    rclpy.init()
    n = Cau()
    try:
        rclpy.spin(n)
    except KeyboardInterrupt:
        pass
    finally:
        # dừng robot trước khi thoát: 0.5s sau robot cũng tự dừng, nhưng đừng để nó chạy nốt nửa giây đó
        if n.robot:
            n.s.sendto(b"X", (n.robot, CONG_ROBOT))


if __name__ == "__main__":
    tu_kiem() if "--tu-kiem" in sys.argv else main()
