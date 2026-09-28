// 9.3 / 9.5: đọc GPIO12. Cứ 10s đổi pull-up nội bật ↔ tắt để thấy chân thả nổi khi không có 10k ngoài.
#include <stdio.h>
#include "chung.h"

void bai_9_3(void)
{
    gpio_config_t c = { .pin_bit_mask = 1ULL << CHAN_NUT, .mode = GPIO_MODE_INPUT };
    gpio_config(&c);
    for (int noi = 0;; noi = !noi) {
        gpio_set_pull_mode(CHAN_NUT, noi ? GPIO_PULLUP_ONLY : GPIO_FLOATING);
        printf("--- pull-up noi: %s ---\n", noi ? "BAT" : "TAT");
        for (int i = 0; i < 50; i++) {
            printf("%d", gpio_get_level(CHAN_NUT));
            fflush(stdout);
            cho_ms(200);
        }
        printf("\n");
    }
}
