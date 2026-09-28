#include "chung.h"
#include "driver/ledc.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void ra(gpio_num_t chan)
{
    gpio_config_t c = { .pin_bit_mask = 1ULL << chan, .mode = GPIO_MODE_OUTPUT };
    gpio_config(&c);
    gpio_set_level(chan, 0);
}

// Mỗi kênh một timer riêng để 2 kênh chạy được 2 tần số khác nhau.
void pwm_bat(gpio_num_t chan, int kenh, uint32_t hz)
{
    ledc_timer_config_t t = {
        .speed_mode = LEDC_LOW_SPEED_MODE, .duty_resolution = LEDC_TIMER_10_BIT,
        .timer_num = (ledc_timer_t)kenh, .freq_hz = hz, .clk_cfg = LEDC_AUTO_CLK,
    };
    ESP_ERROR_CHECK(ledc_timer_config(&t));
    ledc_channel_config_t c = {
        .gpio_num = chan, .speed_mode = LEDC_LOW_SPEED_MODE, .channel = (ledc_channel_t)kenh,
        .timer_sel = (ledc_timer_t)kenh, .duty = 0, .hpoint = 0,
    };
    ESP_ERROR_CHECK(ledc_channel_config(&c));
}

void pwm_dat(int kenh, int phan_tram)
{
    uint32_t duty = (uint32_t)phan_tram * 1023 / 100;
    ledc_set_duty(LEDC_LOW_SPEED_MODE, (ledc_channel_t)kenh, duty);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, (ledc_channel_t)kenh);
}

void cho_ms(int ms) { vTaskDelay(pdMS_TO_TICKS(ms)); }
