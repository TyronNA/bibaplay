// 19.4 Trộn gyro vào góc: GY-521 trên 41/42 (15.3), gửi cả 3 góc để so: chỉ encoder, chỉ gyro, đã trộn.
// Lệnh: "A n" hệ số trộn ×1000 (0 = chỉ encoder, 1000 = chỉ gyro, mặc định trong menuconfig) · "Q n" · "Z" · "X".
// Robot phải nằm yên 2 giây lúc bật để đo sai lệch gyro.
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "robot.h"

void bai_19_4(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    tram_gui("S dang do sai lech gyro, de yen 2s...");
    if (!robot_imu_mo()) {
        for (;;) { tram_gui("S khong thay GY-521 (0x68): kiem 41/42, VCC, GND"); printf("khong thay 0x68\n"); cho_ms(2000); }
    }
    tram_gui("S gyro san sang");
    char lenh[32];
    float dich = 0, goc0 = 0;
    bool quay = false;
    for (int i = 0;; i++) {
        robot_tt_t r;
        robot_doc(&r);
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'A') { robot_tron_gyro(atoi(lenh + 1)); tram_gui("S he so tron = %d/1000", atoi(lenh + 1)); }
            else if (lenh[0] == 'Q') { dich = atof(lenh + 1) * 2 * (float)M_PI; goc0 = r.th_gyro; quay = true; }
            else if (lenh[0] == 'Z') robot_dat_lai();
            else if (lenh[0] == 'X') quay = false;
        }
        // quay theo gyro (không theo encoder): bánh trượt thì vẫn quay đủ góc thật
        if (quay && fabsf(r.th_gyro - goc0) >= fabsf(dich)) { quay = false; tram_gui("S xong quay"); }
        if (quay) robot_vw(0, dich > 0 ? 1.5f : -1.5f); else robot_dung();
        const float D = 180 / (float)M_PI;
        if (i % 5 == 0) tram_gui("T enc=%.1f gyro=%.1f tron=%.1f x=%.0f y=%.0f th=%.1f", r.th_enc * D, r.th_gyro * D, r.th * D, r.x, r.y, r.th * D);
        cho_ms(20);
    }
}
