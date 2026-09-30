// 18.4 Lái từ máy tính + an toàn khi mất kết nối.
// Lệnh từ trạm: "B trái phải" (duty %, −70..70), "X" dừng. Trạm gửi lại lệnh (hoặc "H") mỗi 100ms khi đang lái.
// Quá 500ms không nghe gì từ trạm → dừng (WiFi rớt, máy tính treo, ra ngoài tầm sóng).
// Có vật trước mặt thì chặn phần đi tới, vẫn cho lùi và quay tại chỗ.
#include <stdio.h>
#include <stdlib.h>
#include "robot.h"

#define MAT_KET_NOI_MS 500
#define GAN_CM         15

// Dùng lại ở 20.3: lọc lệnh lái qua cảm biến trước khi ra motor.
void lai_an_toan(int t, int p, robot_cb_t c)
{
    bool vuong = c.va || c.ir || (c.cm > 0 && c.cm < GAN_CM);
    if (vuong && t + p > 0) {                // đang muốn tiến: bỏ phần tiến, giữ phần quay
        int quay = (t - p) / 2;
        t = quay;
        p = -quay;
    }
    robot_duty(t, p);
}

void bai_18_4(void)
{
    robot_mo();
    robot_cam_bien_mo();
    if (!robot_mang_mo()) { printf("Bai nay can WiFi.\n"); return; }
    char lenh[48];
    int t = 0, p = 0;
    bool da_bao = false;
    for (int i = 0;; i++) {
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'B') { char *q; t = strtol(lenh + 1, &q, 10); p = strtol(q, NULL, 10); }
            else if (lenh[0] == 'X') t = p = 0;
            da_bao = false;
        }
        robot_cb_t c = robot_cam_bien();
        if (tram_im_lang_ms() > MAT_KET_NOI_MS) {
            t = p = 0;
            if (!da_bao && tram_da_biet()) { tram_gui("S mat ket noi > %dms: dung", MAT_KET_NOI_MS); da_bao = true; }
        }
        lai_an_toan(t, p, c);
        if (i % 5 == 0) {
            robot_tt_t r;
            robot_doc(&r);
            tram_gui("T dT=%d dP=%d cm=%d va=%d ir=%d pin=%d im_ms=%d", r.dutyT, r.dutyP, c.cm, c.va, c.ir, c.pin_mv, tram_im_lang_ms());
        }
        cho_ms(20);
    }
}
