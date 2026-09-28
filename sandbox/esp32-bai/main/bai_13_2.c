// 13.2: PWM vào 1 chân IN, chân kia giữ 0 → 2 chiều × 3 tốc độ. Đổi chiều luôn qua dừng 1s.
#include <stdio.h>
#include "chung.h"

void bai_13_2(void)
{
    pwm_bat(CHAN_IN1, 0, 1000);
    pwm_bat(CHAN_IN2, 1, 1000);
    const int toc[] = { 40, 70, 100 };
    for (;;) {
        for (int chieu = 0; chieu < 2; chieu++) {
            for (int i = 0; i < 3; i++) {
                pwm_dat(chieu ? 1 : 0, toc[i]);
                pwm_dat(chieu ? 0 : 1, 0);
                printf("chieu %c  duty %d%%\n", chieu ? 'B' : 'A', toc[i]);
                cho_ms(3000);
            }
            pwm_dat(0, 0);
            pwm_dat(1, 0);
            printf("dung\n");
            cho_ms(1000);
        }
    }
}
