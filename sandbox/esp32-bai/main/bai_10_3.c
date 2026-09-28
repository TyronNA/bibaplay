// 10.3: cầu 10k + 10k chia đôi áp hộp pin vào GPIO1. Áp pin = 2 × áp ở chân.
#include <stdio.h>
#include "chung.h"
#include "adc_chung.h"

#define PIN_YEU_MV 3600   // 3 viên AAA ~1.2V/viên là gần hết

void bai_10_3(void)
{
    adc_t a = adc_mo(ADC_CHANNEL_0);
    for (;;) {
        int tho, mv;
        adc_doc(&a, ADC_CHANNEL_0, &tho, &mv);
        int pin = mv * 2;
        printf("chan GPIO1 = %4d mV  ->  pin = %4d mV%s\n", mv, pin, pin < PIN_YEU_MV ? "   PIN YEU" : "");
        cho_ms(1000);
    }
}
