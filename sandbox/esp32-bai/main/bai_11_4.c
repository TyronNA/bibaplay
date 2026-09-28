// 11.4 Còi thụ động qua S8050: GPIO14 → 1k → B; còi + 100Ω từ 3V3 xuống C; 1N4148 ngược song song còi.
// PWM duty 50%, đổi TẦN SỐ để đổi nốt (khác chương 11 trước: đổi duty để đổi độ sáng).
#include <stdio.h>
#include "chung.h"
#include "driver/ledc.h"

static void not_nhac(int hz, int ms)
{
    if (hz > 0) {
        ledc_set_freq(LEDC_LOW_SPEED_MODE, LEDC_TIMER_0, hz);
        pwm_dat(0, 50);
    } else {
        pwm_dat(0, 0);
    }
    cho_ms(ms);
}

void bai_11_4(void)
{
    static const struct { const char *ten; int hz; } NOT[] = {
        { "Do", 523 }, { "Re", 587 }, { "Mi", 659 }, { "Fa", 698 }, { "Sol", 784 }, { "La", 880 }, { "Si", 988 }, { "Do'", 1047 },
    };
    pwm_bat(CHAN_B, 0, 1000);
    pwm_dat(0, 0);
    for (;;) {
        printf("gam Do truong (octave 5)\n");
        for (int i = 0; i < 8; i++) {
            printf("  %-4s %4d Hz\n", NOT[i].ten, NOT[i].hz);
            not_nhac(NOT[i].hz, 400);
            not_nhac(0, 80);
        }
        // còi thụ động kêu to nhất quanh tần số cộng hưởng của màng (thường 2–4kHz)
        const int thu[] = { 1000, 2000, 2700, 4000 };
        for (int i = 0; i < 4; i++) {
            printf("  %d Hz\n", thu[i]);
            not_nhac(thu[i], 500);
            not_nhac(0, 200);
        }
        printf("quet 500 -> 4000 Hz\n");
        for (int hz = 500; hz <= 4000; hz += 50) not_nhac(hz, 20);
        not_nhac(0, 3000);
    }
}
