// 9.4 Chống dội phím: đếm cạnh xuống bằng ngắt (thô) và đếm có chờ 20ms (chống dội) cùng lúc.
#include <stdio.h>
#include "chung.h"
#include "esp_attr.h"

static volatile int s_tho;

static void IRAM_ATTR khi_xuong(void *arg) { s_tho++; }

void bai_9_4(void)
{
    gpio_config_t c = {
        .pin_bit_mask = 1ULL << CHAN_NUT, .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE, .intr_type = GPIO_INTR_NEGEDGE,
    };
    gpio_config(&c);
    gpio_install_isr_service(0);
    gpio_isr_handler_add(CHAN_NUT, khi_xuong, NULL);

    int on_dinh = 1, dem = 0, in_tho = 0;
    for (;;) {
        int muc = gpio_get_level(CHAN_NUT);
        if (muc != on_dinh) {
            cho_ms(20);   // tiếp điểm nảy vài ms; qua 20ms mà vẫn khác thì mới là nhấn/nhả thật
            if (gpio_get_level(CHAN_NUT) == muc) {
                on_dinh = muc;
                if (muc == 0) dem++;
            }
        }
        if (s_tho != in_tho || (muc == 0 && on_dinh == 0 && dem == 0)) {
            in_tho = s_tho;
            printf("tho (ngat) = %d   chong doi = %d\n", s_tho, dem);
        }
        cho_ms(2);
    }
}
