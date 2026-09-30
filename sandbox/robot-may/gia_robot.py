#!/usr/bin/env python3
"""Robot giả cho trạm (và cầu ROS 2 ở chương 21): nói cùng giao thức UDP với firmware Phần 4, chạy trong một
căn phòng ảo 3m × 2.5m có một cái hộp. Dùng để làm quen trạm / thử code máy tính khi chưa có robot thật.

Hiểu các lệnh: H, B trái phải, V v w, D x y, VUONG c, F mm, Q n, Z, X, QUET.
Không mô phỏng trượt bánh, nhiễu siêu âm hay LiDAR: số đẹp hơn robot thật nhiều.
"""
import math
import socket
import time

TRAM = ("127.0.0.1", 4210)
KB = 135.0                                   # mm, khoảng cách 2 bánh
TUONG = [((-500, -1000), (2500, -1000)), ((2500, -1000), (2500, 1500)), ((2500, 1500), (-500, 1500)), ((-500, 1500), (-500, -1000)),
         ((1200, 200), (1600, 200)), ((1600, 200), (1600, 600)), ((1600, 600), (1200, 600)), ((1200, 600), (1200, 200))]


def cat_tia(x, y, g):
    """Khoảng cách (mm) từ (x, y) theo hướng g tới bức tường gần nhất, None nếu > 4m."""
    best = None
    dx, dy = math.cos(g), math.sin(g)
    for (x1, y1), (x2, y2) in TUONG:
        ex, ey = x2 - x1, y2 - y1
        den = dx * ey - dy * ex
        if abs(den) < 1e-9:
            continue
        t = ((x1 - x) * ey - (y1 - y) * ex) / den
        u = ((x1 - x) * dy - (y1 - y) * dx) / den
        if t > 0 and 0 <= u <= 1 and (best is None or t < best):
            best = t
    return best if best is not None and best < 4000 else None


def main():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("127.0.0.1", 4211))
    s.setblocking(False)
    x = y = th = 0.0
    vT = vP = 0.0
    viec, diem, lan_lenh = None, [], 0.0
    quet, quet_goc = False, -80
    t0 = time.time()
    k = 0
    gui = lambda d: s.sendto(d.encode(), TRAM)
    gui("S [gia] robot gia san sang")
    while True:
        try:
            while True:
                b, _ = s.recvfrom(256)
                l = b.decode().split()
                if not l:
                    continue
                lan_lenh = time.time()
                c = l[0]
                if c == "B":
                    vT, vP, viec = float(l[1]) * 10, float(l[2]) * 10, "B"
                elif c == "V":
                    v, w = float(l[1]), float(l[2])
                    vT, vP, viec = v - w * KB / 2, v + w * KB / 2, "V"
                elif c == "D":
                    diem, viec = [(float(l[1]), float(l[2]))], "D"
                elif c == "VUONG":
                    a = float(l[1])
                    diem, viec = [(a, 0), (a, a), (0, a), (0, 0)], "D"
                elif c == "F":
                    d = float(l[1])
                    diem, viec = [(x + d * math.cos(th), y + d * math.sin(th))], "D"
                elif c == "Z":
                    x = y = th = 0.0
                elif c == "X":
                    viec, vT, vP = None, 0, 0
                elif c == "QUET":
                    viec, vT, vP, quet, quet_goc = None, 0, 0, True, -80
        except BlockingIOError:
            pass
        if viec in ("B", "V") and time.time() - lan_lenh > 0.5:   # như firmware: mất lệnh 500ms → dừng
            viec, vT, vP = None, 0, 0
            gui("S mat ket noi > 500ms: dung")
        if viec == "D":
            if not diem:
                viec, vT, vP = None, 0, 0
                gui(f"S xong: odometry noi dang o ({x:.0f}, {y:.0f})")
            else:
                dx, dy = diem[0][0] - x, diem[0][1] - y
                con = math.hypot(dx, dy)
                if con < 30:
                    diem.pop(0)
                else:
                    lech = (math.atan2(dy, dx) - th + math.pi) % (2 * math.pi) - math.pi
                    w = max(-2, min(2, 2 * lech))
                    v = min(200, con) * max(0, math.cos(lech))
                    vT, vP = v - w * KB / 2, v + w * KB / 2
        if not viec:
            vT = vP = 0
        dt = 0.02
        d, dth = (vT + vP) / 2 * dt, (vP - vT) / KB * dt
        nx, ny = x + d * math.cos(th + dth / 2), y + d * math.sin(th + dth / 2)
        if (cat_tia(x, y, math.atan2(ny - y, nx - x)) or 1e9) > 90 or d <= 0:   # đụng tường thì đứng lại
            x, y = nx, ny
        th = (th + dth + math.pi) % (2 * math.pi) - math.pi
        sx, sy = x + 60 * math.cos(th), y + 60 * math.sin(th)
        if quet and k % 4 == 0:
            r = cat_tia(sx, sy, th + math.radians(quet_goc))
            gui(f"R goc={quet_goc} cm={int(r / 10) if r else -1} x={x:.0f} y={y:.0f} th={math.degrees(th):.1f}")
            quet_goc += 5
            if quet_goc > 80:
                quet = False
                gui("S xong quet")
        if k % 2 == 0:
            r = cat_tia(sx, sy, th)
            gui(f"T x={x:.1f} y={y:.1f} th={math.degrees(th):.2f} v={(vT + vP) / 2:.0f} w={(vP - vT) / KB:.3f} cm={int(r / 10) if r else -1} t={time.time() - t0:.1f}")
        k += 1
        time.sleep(dt)


if __name__ == "__main__":
    main()
