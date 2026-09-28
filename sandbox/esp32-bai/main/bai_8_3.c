// 8.3 GND chung: GPIO14 → 4.7k → chân B của S8050; LED + 220Ω ăn điện từ hộp pin.
#include <stdio.h>
#include "chung.h"

void bai_8_3(void)
{
    ra(CHAN_B);
    for (int muc = 1;; muc = !muc) {
        gpio_set_level(CHAN_B, muc);
        printf("GPIO14 = %d\n", muc);
        cho_ms(1000);
    }
}
