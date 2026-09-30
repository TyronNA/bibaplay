// 20.4 Đi phủ kín kiểu robot hút bụi: "PHU dai rong" (mm) — đi các luống song song dọc trục x, cách nhau
// BUOC_LUONG, quay đầu ở cuối luống (luống cày). Gặp vật: lùi 10cm, bỏ phần còn lại của luống, sang luống kế.
// Robot đặt ở góc dưới-trái của vùng, mũi hướng theo cạnh "dai".
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "robot.h"

#define BUOC_LUONG 120.0f   // mm: nhỏ hơn bề ngang robot để 2 luống chồng lên nhau một chút

bool toi_diem(float x, float y);
bool co_vat(void);

void bai_20_4(void)
{
    robot_mo();
    robot_cam_bien_mo();
    if (!robot_mang_mo()) { printf("Bai nay can WiFi.\n"); return; }
    if (robot_imu_mo()) tram_gui("S co gyro");
    char lenh[40];
    float dai = 0, rong = 0;
    int luong = -1, dau = 0, so_luong = 0;   // dau: 0 = đang tới đầu luống, 1 = đang chạy hết luống
    int lui = 0;
    for (int i = 0;; i++) {
        while (tram_nhan(lenh, sizeof lenh)) {
            if (!strncmp(lenh, "PHU", 3)) {
                char *q;
                dai = strtof(lenh + 3, &q);
                rong = strtof(q, NULL);
                so_luong = (int)(rong / BUOC_LUONG) + 1;
                robot_dat_lai();
                luong = 0; dau = 1;
                tram_gui("S phu %.0f x %.0f mm: %d luong", dai, rong, so_luong);
            } else if (lenh[0] == 'X') { luong = -1; robot_dung(); }
        }
        if (luong >= 0) {
            float y = luong * BUOC_LUONG, x_cuoi = (luong % 2) ? 0 : dai;   // luống chẵn đi sang phải, lẻ đi về
            if (lui) {
                robot_toc_do(-120, -120);
                if (--lui == 0) { dau = 0; if (++luong >= so_luong) luong = so_luong; }
            } else if (co_vat()) {
                robot_tt_t r;
                robot_doc(&r);
                tram_gui("S vat can o (%.0f, %.0f): bo luong %d", r.x, r.y, luong);
                lui = 20;   // 20 × 40ms × 120mm/s ≈ 10cm
            } else if (dau == 1 ? toi_diem(x_cuoi, y) : toi_diem((luong % 2) ? dai : 0, y)) {
                if (dau == 0) dau = 1;
                else { dau = 0; luong++; }
            }
            if (luong >= so_luong) { robot_dung(); luong = -1; tram_gui("S xong phu"); }
        }
        if (i % 2 == 0) {
            robot_tt_t r;
            robot_doc(&r);
            tram_gui("T x=%.0f y=%.0f th=%.1f luong=%d", r.x, r.y, r.th * 57.29578f, luong);
        }
        cho_ms(40);
    }
}
