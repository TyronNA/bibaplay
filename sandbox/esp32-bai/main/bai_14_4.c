// 14.4: TCRT5000, DO → GPIO21, AO → GPIO2 (ADC1 kênh 1). DO = 0 khi thấy mặt phản xạ.
#include <stdio.h>
#include "chung.h"
#include "adc_chung.h"

void bai_14_4(void)
{
    gpio_config_t c = { .pin_bit_mask = 1ULL << CHAN_TCRT, .mode = GPIO_MODE_INPUT };
    gpio_config(&c);
    adc_t a = adc_mo(ADC_CHANNEL_1);
    for (;;) {
        int tho, mv;
        adc_doc(&a, ADC_CHANNEL_1, &tho, &mv);
        int d = gpio_get_level(CHAN_TCRT);
        printf("DO = %d  AO = %4d mV (tho %4d)  %s\n", d, mv, tho, d ? "MEP VUC / khong thay san" : "SAN");
        cho_ms(300);
    }
}
