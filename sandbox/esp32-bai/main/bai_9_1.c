// 9.1 / 9.2: GPIO13 → 330Ω → LED → GND, nháy 1s. Bài 9.2 đo lúc LED đang sáng.
#include <stdio.h>
#include "chung.h"

void bai_9_1(void)
{
    ra(CHAN_LED);
    // mức mặc định của chip (20mA theo datasheet); ghi rõ để thấy chỗ chỉnh
    gpio_set_drive_capability(CHAN_LED, GPIO_DRIVE_CAP_2);
    for (int muc = 1;; muc = !muc) {
        gpio_set_level(CHAN_LED, muc);
        printf("LED %s\n", muc ? "SANG" : "tat");
        cho_ms(1000);
    }
}
