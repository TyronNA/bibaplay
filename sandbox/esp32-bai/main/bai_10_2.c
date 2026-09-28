// 10.2: quang trở trên + 10k dưới vào GPIO2 (ADC1 kênh 1). Tối → áp thấp → bật LED GPIO13.
#include <stdio.h>
#include "chung.h"
#include "adc_chung.h"

#define NGUONG_MV 1000   // đổi theo số đọc được lúc che tay / lúc sáng phòng
#define TRE_MV    100    // trễ: bật dưới NGUONG, tắt trên NGUONG + TRE, để LED không chập chờn ở sát ngưỡng

void bai_10_2(void)
{
    adc_t a = adc_mo(ADC_CHANNEL_1);
    ra(CHAN_LED);
    int bat = 0;
    for (;;) {
        int tho, mv;
        adc_doc(&a, ADC_CHANNEL_1, &tho, &mv);
        if (!bat && mv < NGUONG_MV) bat = 1;
        else if (bat && mv > NGUONG_MV + TRE_MV) bat = 0;
        gpio_set_level(CHAN_LED, bat);
        printf("%4d mV  LED %s\n", mv, bat ? "SANG" : "tat");
        cho_ms(300);
    }
}
