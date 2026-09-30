// 20.2 Radar siêu âm: servo SG90 (GPIO15) quay HC-SR04 từ −60° tới +60°, bước 5°, đo ở mỗi góc rồi gửi
// "R goc=… cm=… x=… y=… th=…" (góc so với mũi robot, dương = bên trái; x, y, th = vị trí robot lúc đo, góc tính bằng độ).
#include <stdio.h>
#include <string.h>
#include "robot.h"

// Quét 1 lượt từ a tới b; dùng lại ở 20.3. Mỗi góc: chờ servo tới nơi rồi đo 2 lần, lấy lần gần hơn
// (tiếng vọng lạc thường làm số đo xa ra chứ ít khi gần lại).
void quet_radar(int a, int b, int buoc)
{
    for (int g = a; buoc > 0 ? g <= b : g >= b; g += buoc) {
        robot_servo_goc(g);
        cho_ms(g == a ? 400 : 80);   // SG90 ~0.1s/60° (datasheet): 5° cần ~10ms; góc đầu có thể phải quay xa
        int c1 = robot_sieu_am_ngay(), c2 = robot_sieu_am_ngay();
        int cm = c1 < 0 ? c2 : c2 < 0 ? c1 : c1 < c2 ? c1 : c2;
        robot_tt_t r;
        robot_doc(&r);
        tram_gui("R goc=%d cm=%d x=%.0f y=%.0f th=%.1f", g, cm, r.x, r.y, r.th * 57.29578f);
    }
}

// Lúc đầu servo đứng ở 0° để lắp tay quay cho HC-SR04 nhìn thẳng trước mặt; nhấn công tắc va chạm
// (hoặc lệnh CHAY) thì bắt đầu quét, lệnh X thì về 0° và đứng chờ.
void bai_20_2(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_servo_mo();
    robot_mang_mo();
    char lenh[16];
    bool quet = false;
    tram_gui("S servo o 0 do: lap tay quay cho HC-SR04 nhin thang, roi nhan cong tac de quet");
    for (;;) {
        while (tram_nhan(lenh, sizeof lenh)) {
            if (!strncmp(lenh, "CHAY", 4)) quet = true;
            else if (lenh[0] == 'X') quet = false;
        }
        if (!quet) {
            robot_servo_goc(0);
            if (robot_cam_bien().va) { quet = true; cho_ms(1000); }
            cho_ms(50);
            continue;
        }
        quet_radar(-60, 60, 5);
        quet_radar(60, -60, -5);
    }
}
