// 11.3: PWM 1kHz trên GPIO14 → 470Ω → chân B S8050 → motor. Mỗi mức 5s, rồi dừng 5s.
#include <stdio.h>
#include "chung.h"

void bai_11_3(void)
{
    const int muc[] = { 30, 60, 100, 0 };
    pwm_bat(CHAN_B, 0, 1000);
    for (;;) {
        for (int i = 0; i < 4; i++) {
            pwm_dat(0, muc[i]);
            printf("motor duty %d%%\n", muc[i]);
            cho_ms(5000);
        }
    }
}
