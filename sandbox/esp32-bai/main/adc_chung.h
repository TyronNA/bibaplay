#pragma once
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"

typedef struct { adc_oneshot_unit_handle_t adc; adc_cali_handle_t cali; } adc_t;
adc_t adc_mo(adc_channel_t kenh);                                  // ADC1, suy hao 12dB, hiệu chuẩn curve fitting
void adc_doc(adc_t *a, adc_channel_t kenh, int *tho, int *mv);    // trung bình 32 lần
