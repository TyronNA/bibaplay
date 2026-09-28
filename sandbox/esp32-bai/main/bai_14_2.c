// 14.2: FC-51 OUT → GPIO8. Module đã có điện trở 10k kéo lên VCC (3V3) nên không bật pull-up nội.
#include <stdio.h>
#include "chung.h"

void bai_14_2(void)
{
    gpio_config_t c = { .pin_bit_mask = 1ULL << CHAN_IR, .mode = GPIO_MODE_INPUT };
    gpio_config(&c);
    int truoc = -1;
    for (int i = 0;; i++) {
        int muc = gpio_get_level(CHAN_IR);
        if (muc != truoc || i % 10 == 0) printf("OUT = %d  %s\n", muc, muc ? "trong" : "CO VAT");
        truoc = muc;
        cho_ms(100);
    }
}
