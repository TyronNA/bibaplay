// 19.2 Đi thẳng 1.5m, 3 cách (mỗi lần nhấn công tắc va chạm chạy cách kế tiếp, hoặc lệnh "M 0|1|2" rồi "CHAY"):
//   0  vòng hở: 2 bánh cùng duty
//   1  vòng kín: PI tốc độ từng bánh, cùng đích 200mm/s
//   2  như 1 + bù lệch: bánh nào đã đi xa hơn thì đích của nó giảm, bánh kia tăng
// Vật trước mặt / va chạm / lệnh X → dừng ngay.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "robot.h"
#include "sdkconfig.h"

#define V0      200.0f   // mm/s
#define DUTY_HO 40
#define K_LECH  2.0f     // (mm/s) cho mỗi mm hai bánh lệch nhau
#define QUANG   1500.0f  // mm

void bai_19_2(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    const char *TEN[] = { "vong ho", "PI tung banh", "PI + bu lech" };
    char lenh[32];
    int cach = 0, chay = 0;
    bool va_truoc = false;
    for (int i = 0;; i++) {
        robot_cb_t c = robot_cam_bien();
        bool bat_dau = false;
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'M') cach = atoi(lenh + 1) % 3;
            else if (!strncmp(lenh, "CHAY", 4)) bat_dau = true;
            else if (lenh[0] == 'X') chay = 0;
        }
        if (!chay && c.va && !va_truoc) bat_dau = true;
        va_truoc = c.va;
        if (bat_dau && !chay) {
            robot_dat_lai();
            chay = 1;
            tram_gui("S chay cach %d: %s", cach, TEN[cach]);
            cho_ms(1000);   // kịp rút tay khỏi công tắc
            continue;
        }
        robot_tt_t r;
        robot_doc(&r);
        const float MM = CONFIG_ROBOT_UM_MOI_XUNG / 1000.0f;
        float sT = r.nT * MM, sP = r.nP * MM, di = (sT + sP) / 2;   // mm mỗi bánh đã đi
        bool vuong = c.va || c.ir || (c.cm > 0 && c.cm < 15);
        if (chay && (di >= QUANG || vuong)) {
            robot_dung();
            chay = 0;
            tram_gui("S dung sau %.0fmm%s. Lech xung T-P = %ld. Do do lech ngang bang thuoc.", di, vuong ? " (co vat)" : "", (long)(r.nT - r.nP));
            cach = (cach + 1) % 3;
        }
        if (chay) {
            if (cach == 0) robot_duty(DUTY_HO, DUTY_HO);
            else {
                float lech = sT - sP;   // mm: dương = bánh trái đi xa hơn → robot đang quẹo phải
                float bu = cach == 2 ? K_LECH * lech / 2 : 0;
                robot_toc_do(V0 - bu, V0 + bu);
            }
        }
        if (i % 5 == 0) tram_gui("T vT=%.0f vP=%.0f dT=%d dP=%d lech_mm=%.1f di=%.0f", r.vT, r.vP, r.dutyT, r.dutyP, sT - sP, di);
        cho_ms(20);
    }
}
