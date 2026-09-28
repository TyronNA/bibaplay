// 10.1 / 10.4: đọc GPIO1 (ADC1 kênh 0). Suy hao 12dB đo đúng tới ~2.9V (datasheet); trên đó số đứng ở 4095.
#include <stdio.h>
#include "chung.h"
#include "adc_chung.h"
#include "esp_adc/adc_cali_scheme.h"

adc_t adc_mo(adc_channel_t kenh)
{
    adc_t a;
    adc_oneshot_unit_init_cfg_t u = { .unit_id = ADC_UNIT_1 };
    ESP_ERROR_CHECK(adc_oneshot_new_unit(&u, &a.adc));
    adc_oneshot_chan_cfg_t c = { .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_12 };
    ESP_ERROR_CHECK(adc_oneshot_config_channel(a.adc, kenh, &c));
    adc_cali_curve_fitting_config_t k = { .unit_id = ADC_UNIT_1, .chan = kenh, .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_12 };
    ESP_ERROR_CHECK(adc_cali_create_scheme_curve_fitting(&k, &a.cali));
    return a;
}

// Trung bình 32 lần đọc: ADC nhiễu vài LSB mỗi lần (datasheet: DNL ±4, INL ±8 LSB).
void adc_doc(adc_t *a, adc_channel_t kenh, int *tho, int *mv)
{
    int tong = 0, x;
    for (int i = 0; i < 32; i++) { adc_oneshot_read(a->adc, kenh, &x); tong += x; }
    *tho = tong / 32;
    adc_cali_raw_to_voltage(a->cali, *tho, mv);
}

void bai_10_1(void)
{
    adc_t a = adc_mo(ADC_CHANNEL_0);
    for (;;) {
        int tho, mv;
        adc_doc(&a, ADC_CHANNEL_0, &tho, &mv);
        printf("tho = %4d / 4095   ~ %4d mV (da hieu chuan)   %4d mV (tinh thang tho*3300/4095)\n", tho, mv, tho * 3300 / 4095);
        cho_ms(500);
    }
}
