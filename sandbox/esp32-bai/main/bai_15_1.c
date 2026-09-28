// 15.1: servo SG90, tín hiệu GPIO14 (qua 1k). 50Hz, xung 1000 / 1500 / 2000µs mỗi mức 2s (datasheet: 1–2ms).
// Dùng timer/kênh LEDC số 2 riêng, 14 bit: 20000µs chia 16384 mức ≈ 1.2µs mỗi mức.
#include <stdio.h>
#include "chung.h"
#include "driver/ledc.h"

static void dat_xung(int us)
{
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_2, (uint32_t)us * 16384 / 20000);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_2);
}

void bai_15_1(void)
{
    ledc_timer_config_t t = {
        .speed_mode = LEDC_LOW_SPEED_MODE, .duty_resolution = LEDC_TIMER_14_BIT,
        .timer_num = LEDC_TIMER_2, .freq_hz = 50, .clk_cfg = LEDC_AUTO_CLK,
    };
    ESP_ERROR_CHECK(ledc_timer_config(&t));
    ledc_channel_config_t c = {
        .gpio_num = CHAN_SERVO, .speed_mode = LEDC_LOW_SPEED_MODE, .channel = LEDC_CHANNEL_2,
        .timer_sel = LEDC_TIMER_2, .duty = 0, .hpoint = 0,
    };
    ESP_ERROR_CHECK(ledc_channel_config(&c));
    const int muc[] = { 1000, 1500, 2000, 1500 };
    for (;;) {
        for (int i = 0; i < 4; i++) {
            dat_xung(muc[i]);
            printf("xung %dus\n", muc[i]);
            cho_ms(2000);
        }
    }
}
