// 19.5 Đi tới điểm: mỗi 50ms tính khoảng cách + góc lệch tới điểm đích, ra (v, w) cho 2 bánh.
// Lệnh: "D x y" (mm) · "VUONG c" đi hình vuông cạnh c mm ngược chiều kim đồng hồ rồi về (0,0) · "Z" · "X".
// toi_diem() dùng lại ở 20.3, 20.4.
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "robot.h"

#define V_MAX   200.0f   // mm/s
#define K_V     1.0f     // (mm/s) cho mỗi mm còn lại
#define K_W     2.0f     // (rad/s) cho mỗi rad lệch
#define W_MAX   2.0f
#define TOI_MM  30.0f

static float goc_gon(float a) { while (a > M_PI) a -= 2 * M_PI; while (a < -M_PI) a += 2 * M_PI; return a; }

// Một bước điều khiển; true khi đã tới (cách đích < 3cm).
bool toi_diem(float x, float y)
{
    robot_tt_t r;
    robot_doc(&r);
    float dx = x - r.x, dy = y - r.y, con = hypotf(dx, dy);
    if (con < TOI_MM) { robot_dung(); return true; }
    float lech = goc_gon(atan2f(dy, dx) - r.th);
    float w = fmaxf(-W_MAX, fminf(W_MAX, K_W * lech));
    // lệch nhiều thì quay tại chỗ trước: cos(lệch) ≤ 0 khi đích ở sau lưng
    float v = fminf(V_MAX, K_V * con) * fmaxf(0, cosf(lech));
    robot_vw(v, w);
    return false;
}

bool co_vat(void)
{
    robot_cb_t c = robot_cam_bien();
    return c.va || c.ir || (c.cm > 0 && c.cm < 15);
}

void bai_19_5(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    if (robot_imu_mo()) tram_gui("S co gyro: goc da tron");
    char lenh[40];
    float diem[5][2];
    int n = 0, k = 0;
    for (int i = 0;; i++) {
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'D') { char *q; diem[0][0] = strtof(lenh + 1, &q); diem[0][1] = strtof(q, NULL); n = 1; k = 0; }
            else if (!strncmp(lenh, "VUONG", 5)) {
                float c = atof(lenh + 5);
                float v[5][2] = { { c, 0 }, { c, c }, { 0, c }, { 0, 0 }, { 0, 0 } };
                memcpy(diem, v, sizeof v);
                n = 4; k = 0;
                tram_gui("S hinh vuong canh %.0fmm", c);
            }
            else if (lenh[0] == 'Z') robot_dat_lai();
            else if (lenh[0] == 'X') { n = 0; robot_dung(); }
        }
        if (k < n) {
            if (co_vat()) { robot_dung(); n = 0; tram_gui("S co vat: huy"); }
            else if (toi_diem(diem[k][0], diem[k][1]) && ++k == n) {
                robot_tt_t r;
                robot_doc(&r);
                tram_gui("S xong: odometry noi dang o (%.0f, %.0f) th=%.1f do. Do vi tri that bang thuoc.", r.x, r.y, r.th * 180 / (float)M_PI);
            }
        }
        if (i % 2 == 0) {
            robot_tt_t r;
            robot_doc(&r);
            tram_gui("T x=%.0f y=%.0f th=%.1f diem=%d", r.x, r.y, r.th * 180 / (float)M_PI, k);
        }
        cho_ms(50);
    }
}
