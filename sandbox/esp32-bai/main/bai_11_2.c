// 11.2: giữ duty 25 / 50 / 75% mỗi mức 10s để kịp đo bằng đồng hồ DCV.
#include <stdio.h>
#include "chung.h"

void bai_11_2(void)
{
    const int muc[] = { 25, 50, 75 };
    pwm_bat(CHAN_LED, 0, 5000);
    for (;;) {
        for (int i = 0; i < 3; i++) {
            pwm_dat(0, muc[i]);
            printf("duty %d%%  -> dong ho phai ra ~%d mV\n", muc[i], muc[i] * 33);
            cho_ms(10000);
        }
    }
}
