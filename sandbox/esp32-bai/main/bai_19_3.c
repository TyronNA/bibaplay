// 19.3 Odometry: vị trí (x, y, θ) cộng dồn từ 2 encoder, gửi 20 lần/giây để trạm vẽ đường đi.
// Lệnh: "F mm" đi thẳng mm · "Q n" quay tại chỗ n vòng sang trái · "Z" đặt lại x=y=θ=0 · "X" dừng.
// Hiệu chuẩn: "Q 5" rồi đếm robot thật quay mấy vòng → khoảng cách bánh mới = cũ × 5 / số vòng thật.
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "robot.h"

#define V_THANG 150.0f   // mm/s
#define W_QUAY  1.5f     // rad/s

typedef enum { NGHI, THANG, QUAY } viec_t;

void bai_19_3(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    char lenh[32];
    viec_t viec = NGHI;
    float dich = 0, goc0 = 0, x0 = 0, y0 = 0;
    for (int i = 0;; i++) {
        robot_tt_t r;
        robot_doc(&r);
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'F') { dich = atof(lenh + 1); x0 = r.x; y0 = r.y; viec = THANG; tram_gui("S di thang %.0fmm", dich); }
            else if (lenh[0] == 'Q') { dich = atof(lenh + 1) * 2 * (float)M_PI; goc0 = r.th_enc; viec = QUAY; tram_gui("S quay %.1f vong", dich / 2 / (float)M_PI); }
            else if (lenh[0] == 'Z') { robot_dat_lai(); tram_gui("S dat lai vi tri"); }
            else if (lenh[0] == 'X') viec = NGHI;
        }
        robot_cb_t c = robot_cam_bien();
        if (viec == THANG && (hypotf(r.x - x0, r.y - y0) >= fabsf(dich) || c.va || c.ir || (c.cm > 0 && c.cm < 15))) viec = NGHI;
        if (viec == QUAY && fabsf(r.th_enc - goc0) >= fabsf(dich)) viec = NGHI;
        if (viec == THANG) robot_toc_do(dich > 0 ? V_THANG : -V_THANG, dich > 0 ? V_THANG : -V_THANG);
        else if (viec == QUAY) robot_vw(0, dich > 0 ? W_QUAY : -W_QUAY);
        else robot_dung();
        if (viec == NGHI && (r.dichT || r.dichP)) tram_gui("S xong: x=%.0f y=%.0f th=%.1f do", r.x, r.y, r.th * 180 / (float)M_PI);
        if (i % 2 == 0) tram_gui("T x=%.0f y=%.0f th=%.1f vT=%.0f vP=%.0f", r.x, r.y, r.th * 180 / (float)M_PI, r.vT, r.vP);
        cho_ms(20);
    }
}
