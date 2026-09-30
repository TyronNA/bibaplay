// 20.3 Vẽ bản đồ: lái tay ("B t p", như 18.4) hoặc "D x y" (19.5), dừng lại rồi "QUET" để radar quét 1 lượt
// −80..80°. Trạm ghép mỗi điểm radar với vị trí robot lúc đo thành bản đồ lưới. "Z" đặt lại gốc bản đồ.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "robot.h"

void lai_an_toan(int t, int p, robot_cb_t c);   // bai_18_4.c
bool toi_diem(float x, float y);                // bai_19_5.c
bool co_vat(void);
void quet_radar(int a, int b, int buoc);        // bai_20_2.c

void bai_20_3(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_servo_mo();
    if (!robot_mang_mo()) { printf("Bai nay can WiFi.\n"); return; }
    if (robot_imu_mo()) tram_gui("S co gyro");
    char lenh[40];
    int t = 0, p = 0;
    bool di_diem = false;
    float dx = 0, dy = 0;
    for (int i = 0;; i++) {
        bool quet = false;
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'B') { char *q; t = strtol(lenh + 1, &q, 10); p = strtol(q, NULL, 10); di_diem = false; }
            else if (lenh[0] == 'D') { char *q; dx = strtof(lenh + 1, &q); dy = strtof(q, NULL); di_diem = true; }
            else if (!strncmp(lenh, "QUET", 4)) quet = true;
            else if (lenh[0] == 'Z') robot_dat_lai();
            else if (lenh[0] == 'X') { t = p = 0; di_diem = false; }
        }
        if (quet) {
            robot_dung();
            cho_ms(300);   // đứng hẳn rồi mới quét: đang chạy thì mỗi điểm một vị trí, bản đồ nhoè
            tram_gui("S quet");
            quet_radar(-80, 80, 5);
            robot_servo_goc(0);
            tram_gui("S xong quet");
            continue;
        }
        if (di_diem) {
            if (co_vat()) { di_diem = false; robot_dung(); tram_gui("S co vat: huy D"); }
            else if (toi_diem(dx, dy)) { di_diem = false; tram_gui("S toi diem"); }
        } else {
            if (tram_im_lang_ms() > 500) t = p = 0;
            lai_an_toan(t, p, robot_cam_bien());
        }
        if (i % 4 == 0) {
            robot_tt_t r;
            robot_doc(&r);
            tram_gui("T x=%.0f y=%.0f th=%.1f cm=%d", r.x, r.y, r.th * 57.29578f, robot_cam_bien().cm);
        }
        cho_ms(25);
    }
}
