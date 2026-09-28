// 13.1: driver 2 chân IN mỗi motor (kiểu DRV8833 / MX1508 / L9110S). Mỗi trạng thái 3s.
#include <stdio.h>
#include "chung.h"

void bai_13_1(void)
{
    ra(CHAN_IN1);
    ra(CHAN_IN2);
    const struct { int in1, in2; const char *ten; } tt[] = {
        { 1, 0, "IN1=1 IN2=0: quay chieu A" }, { 0, 0, "IN1=0 IN2=0: tha troi (dung tu tu)" },
        { 0, 1, "IN1=0 IN2=1: quay chieu B" }, { 0, 0, "IN1=0 IN2=0: tha troi" },
    };
    for (;;) {
        for (int i = 0; i < 4; i++) {
            gpio_set_level(CHAN_IN1, tt[i].in1);
            gpio_set_level(CHAN_IN2, tt[i].in2);
            printf("%s\n", tt[i].ten);
            cho_ms(3000);
        }
    }
}
