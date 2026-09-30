#!/usr/bin/env python3
"""Trạm cho Phần 4: nhận số liệu robot qua UDP, vẽ lên trình duyệt, chuyển lệnh từ trình duyệt xuống robot.

    python3 tram.py            → mở http://localhost:8008
    python3 tram.py --gia      → kèm robot giả (gia_robot.py) để thử khi chưa có robot

Giao thức (chữ thường, mỗi gói UDP một dòng):
  robot → trạm, cổng 4210:  "T k=v k=v …" số liệu · "R goc= cm= x= y= th=" điểm radar · "S …" sự kiện
  trạm → robot, cổng 4211:  "H" chào (để robot biết địa chỉ trạm) · "B trái phải" · "X" · lệnh riêng từng bài
Chỉ dùng thư viện chuẩn của Python. Mọi dòng nhận được ghi thêm vào tram-<giờ>.log để xem lại.
"""
import argparse
import json
import queue
import socket
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

CONG_TRAM, CONG_ROBOT = 4210, 4211
TRANG = Path(__file__).with_name("tram.html")

robot = {"dia_chi": None, "lan_cuoi": 0.0}
nguoi_nghe: list[queue.Queue] = []
khoa = threading.Lock()


def nhan_udp(sock, ghi):
    while True:
        b, (ip, _) = sock.recvfrom(4096)
        dong = b.decode("utf-8", "replace").strip()
        if not dong:
            continue
        moi = robot["dia_chi"] != ip
        robot["dia_chi"], robot["lan_cuoi"] = ip, time.time()
        if moi:
            # robot đang quảng bá: chào lại để nó chuyển sang gửi thẳng tới trạm
            sock.sendto(b"H", (ip, CONG_ROBOT))
            phat(f"S [tram] thay robot o {ip}")
        ghi.write(f"{time.time():.3f} {dong}\n")
        phat(dong)


def phat(dong):
    with khoa:
        for q in nguoi_nghe:
            if q.qsize() < 2000:   # trình duyệt treo thì bỏ bớt, không để RAM phình
                q.put(dong)


def chao_dinh_ky(sock):
    # 2s một lần: đủ để robot nhớ địa chỉ trạm, nhưng thưa hơn ngưỡng 500ms của 18.4 nên KHÔNG giữ được robot
    # chạy tiếp khi trình duyệt ngừng gửi lệnh lái.
    while True:
        time.sleep(2)
        if robot["dia_chi"]:
            sock.sendto(b"H", (robot["dia_chi"], CONG_ROBOT))


def lam_web(sock):
    class Web(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_GET(self):
            if self.path == "/":
                b = TRANG.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(b)))
                self.end_headers()
                self.wfile.write(b)
            elif self.path == "/su-kien":
                q = queue.Queue()
                with khoa:
                    nguoi_nghe.append(q)
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                try:
                    while True:
                        try:
                            dong = q.get(timeout=5)
                            gom = [dong]
                            while not q.empty() and len(gom) < 200:
                                gom.append(q.get_nowait())
                            self.wfile.write("".join(f"data: {d}\n\n" for d in gom).encode())
                        except queue.Empty:
                            self.wfile.write(b": giu\n\n")
                        self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    pass
                finally:
                    with khoa:
                        nguoi_nghe.remove(q)
            elif self.path == "/trang-thai":
                b = json.dumps({"robot": robot["dia_chi"], "im_s": round(time.time() - robot["lan_cuoi"], 1) if robot["dia_chi"] else None}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b)
            else:
                self.send_error(404)

        def do_POST(self):
            if self.path != "/lenh":
                return self.send_error(404)
            lenh = self.rfile.read(int(self.headers.get("Content-Length", 0)))[:200]
            ok = bool(robot["dia_chi"])
            if ok:
                sock.sendto(lenh, (robot["dia_chi"], CONG_ROBOT))
            self.send_response(200 if ok else 409)
            self.end_headers()

    return Web


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cong-web", type=int, default=8008)
    ap.add_argument("--gia", action="store_true", help="chạy kèm robot giả trên máy này")
    a = ap.parse_args()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.bind(("", CONG_TRAM))
    ghi = open(time.strftime("tram-%Y%m%d-%H%M%S.log"), "a", buffering=1)
    threading.Thread(target=nhan_udp, args=(sock, ghi), daemon=True).start()
    threading.Thread(target=chao_dinh_ky, args=(sock,), daemon=True).start()
    gia = subprocess.Popen([sys.executable, str(Path(__file__).with_name("gia_robot.py"))]) if a.gia else None
    # chỉ nghe trên máy này: trang có nút lái robot, không mở cho cả mạng
    web = ThreadingHTTPServer(("127.0.0.1", a.cong_web), lam_web(sock))
    print(f"Tram: http://localhost:{a.cong_web}  (nghe robot o cong UDP {CONG_TRAM}, ghi {ghi.name})")
    try:
        web.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if gia:
            gia.terminate()


if __name__ == "__main__":
    main()
