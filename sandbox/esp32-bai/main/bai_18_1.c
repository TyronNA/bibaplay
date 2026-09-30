// 18.1 Số liệu qua WiFi: robot 17.1 đứng yên, gửi cảm biến lên trạm trên máy tính 10 lần/giây (UDP cổng 4210).
// Mỗi dòng: "T khoá=giá_trị …" — trạm tự vẽ mỗi khoá thành một đường.
#include <stdio.h>
#include "robot.h"
#include "esp_timer.h"

void bai_18_1(void)
{
    robot_mo();            // chỉ để 4 chân IN của driver ở mức 0: bài này motor đứng yên
    robot_cam_bien_mo();
    bool mang = robot_mang_mo();
    char lenh[64];
    for (int i = 0;; i++) {
        robot_cb_t c = robot_cam_bien();
        float t = esp_timer_get_time() / 1e6f;
        if (mang) tram_gui("T t=%.1f pin=%d cm=%d ir=%d va=%d", t, c.pin_mv, c.cm, c.ir, c.va);
        if (i % 10 == 0) printf("t=%.1f pin=%d mV cm=%d ir=%d va=%d %s\n", t, c.pin_mv, c.cm, c.ir, c.va,
                                mang ? (tram_da_biet() ? "(tram da ket noi)" : "(dang quang ba, chua co tram)") : "(khong WiFi)");
        while (tram_nhan(lenh, sizeof lenh)) {}   // gói "H" của trạm: chỉ để robot biết địa chỉ trạm
        cho_ms(100);
    }
}
