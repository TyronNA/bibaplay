#!/usr/bin/env python3
"""Lấy file tham số Nav2 mặc định, đổi vài con số cho robot 2WD nhỏ chạy chậm, ghi ra file mới.

    python3 sua_nav2.py <nav2_params.yaml gốc> <file ra>

Sửa theo tên khoá ở bất kỳ tầng nào, nên không phụ thuộc bộ điều khiển mặc định là MPPI hay DWB.
"""
import sys
import yaml

DOI = {
    "robot_radius": 0.10,        # m: khung 2WD ~ 20cm bề ngang
    "inflation_radius": 0.25,
    "vx_max": 0.20, "vx_min": -0.10, "vy_max": 0.0, "wz_max": 1.5,          # MPPI
    "max_vel_x": 0.20, "min_vel_x": -0.10, "max_vel_theta": 1.5,            # DWB
    "max_speed_xy": 0.20, "max_vel_y": 0.0, "min_vel_y": 0.0,
    "max_velocity": [0.20, 0.0, 1.5], "min_velocity": [-0.10, 0.0, -1.5],   # velocity_smoother
    "max_accel": [0.8, 0.0, 2.0], "max_decel": [-0.8, 0.0, -2.0],
}


def sua(o, dem):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in DOI and not isinstance(v, (dict, list)) or k in ("max_velocity", "min_velocity", "max_accel", "max_decel") and isinstance(v, list):
                o[k] = DOI[k]
                dem[k] = dem.get(k, 0) + 1
            else:
                sua(v, dem)
    elif isinstance(o, list):
        for v in o:
            sua(v, dem)


def main():
    goc, ra = sys.argv[1], sys.argv[2]
    d = yaml.safe_load(open(goc))
    dem = {}
    sua(d, dem)
    yaml.safe_dump(d, open(ra, "w"), sort_keys=False)
    print("da sua:", ", ".join(f"{k}×{n}" for k, n in sorted(dem.items())))
    for k in ("robot_radius", "max_velocity"):
        if k not in dem:
            print(f"CANH BAO: khong thay khoa {k} — file Nav2 goc da doi cau truc, kiem tay")


if __name__ == "__main__":
    main()
