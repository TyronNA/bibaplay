// 14.3: HC-SR04, Trig ← GPIO17, Echo → cầu 10k/20k → GPIO18. Đo mỗi 100ms (datasheet: cách nhau ≥ 60ms).
#include <stdio.h>
#include "chung.h"

void bai_14_3(void)
{
    sieu_am_mo();
    for (;;) {
        int us = sieu_am_us();
        if (us < 0) printf("het gio (khong co vat trong ~5m, hoac Trig/Echo chua noi)\n");
        else printf("xung %5d us  ->  %3d cm\n", us, us / 58);   // datasheet: µs / 58 = cm
        cho_ms(100);
    }
}
