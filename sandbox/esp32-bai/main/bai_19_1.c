// 19.1 Encoder 2 bánh: khe quang trái GPIO11, phải GPIO13, đếm cả 2 cạnh (đĩa 20 lỗ → 40 xung/vòng).
// Lệnh: "Z" xoá số đếm · "BT" chỉ chạy bánh trái 3s · "BP" chỉ bánh phải 3s (kiểm cắm đúng bên).
// Đẩy tay robot đi đúng 1m → số xung mỗi bánh → mm/xung = 1000 / số xung.
#include <stdio.h>
#include <string.h>
#include "robot.h"

void bai_19_1(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    char lenh[32];
    int chay_con = 0;   // số vòng 20ms còn lại của lệnh BT/BP
    for (int i = 0;; i++) {
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'Z') { robot_dat_lai(); tram_gui("S da xoa so dem"); }
            else if (!strncmp(lenh, "BT", 2)) { robot_duty(40, 0); chay_con = 150; tram_gui("S chay banh TRAI 3s"); }
            else if (!strncmp(lenh, "BP", 2)) { robot_duty(0, 40); chay_con = 150; tram_gui("S chay banh PHAI 3s"); }
        }
        if (chay_con && --chay_con == 0) robot_dung();
        if (i % 5 == 0) {
            robot_tt_t r;
            robot_doc(&r);
            float tb = (r.nT_tuyet_doi + r.nP_tuyet_doi) / 2.0f;
            tram_gui("T nT=%lu nP=%lu mm_moi_xung_neu_1m=%.3f", (unsigned long)r.nT_tuyet_doi, (unsigned long)r.nP_tuyet_doi, tb > 0 ? 1000.0f / tb : 0);
            if (i % 50 == 0) printf("xung trai %lu, phai %lu\n", (unsigned long)r.nT_tuyet_doi, (unsigned long)r.nP_tuyet_doi);
        }
        cho_ms(20);
    }
}
