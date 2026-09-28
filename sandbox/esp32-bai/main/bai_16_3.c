// 16.3: đo pack 2S qua cầu 20k/10k vào GPIO1 (pin = mV × 3). LED GPIO13: nháy 1 lần/s nếu pin ổn, nháy nhanh nếu < 6.6V.
#include <stdio.h>
#include "chung.h"
#include "adc_chung.h"

#define PIN_YEU_MV 6600   // 3.3V/cell: còn dư xa ngưỡng cắt 2.5V của mạch bảo vệ, và LM2596 vẫn giữ được 5V

void bai_16_3(void)
{
    adc_t a = adc_mo(ADC_CHANNEL_0);
    ra(CHAN_LED);
    for (;;) {
        int tho, mv;
        adc_doc(&a, ADC_CHANNEL_0, &tho, &mv);
        int pin = mv * 3;
        int yeu = pin < PIN_YEU_MV;
        printf("GPIO1 = %4d mV  ->  pin = %4d mV%s\n", mv, pin, yeu ? "   PIN YEU" : "");
        int nua = yeu ? 100 : 500;
        for (int t = 0; t < 1000; t += 2 * nua) {
            gpio_set_level(CHAN_LED, 1); cho_ms(nua);
            gpio_set_level(CHAN_LED, 0); cho_ms(nua);
        }
    }
}
