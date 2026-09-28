// 11.1: PWM 5kHz trên GPIO13 (mạch LED 9.1), duty 0 → 100% → 0 lặp lại.
#include <stdio.h>
#include "chung.h"

void bai_11_1(void)
{
    pwm_bat(CHAN_LED, 0, 5000);
    for (;;) {
        for (int d = 0; d <= 100; d += 5) { pwm_dat(0, d); printf("duty %3d%%\n", d); cho_ms(150); }
        for (int d = 100; d >= 0; d -= 5) { pwm_dat(0, d); cho_ms(150); }
    }
}
