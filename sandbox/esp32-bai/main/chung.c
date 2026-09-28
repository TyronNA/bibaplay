#include "chung.h"
#include "driver/ledc.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_rom_sys.h"
#include "esp_timer.h"

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

void sieu_am_mo(void)
{
    ra(CHAN_TRIG);
    gpio_config_t c = { .pin_bit_mask = 1ULL << CHAN_ECHO, .mode = GPIO_MODE_INPUT };
    gpio_config(&c);
}

// Chờ bận (busy-wait) tối đa ~60ms: đủ cho bài học; ngắt xen vào chỉ làm lệch vài µs (≈ 1mm).
// 30ms hết giờ ≈ 5m, xa hơn tầm 4m của module.
int sieu_am_us(void)
{
    gpio_set_level(CHAN_TRIG, 1);
    esp_rom_delay_us(10);                  // datasheet: Trig mức cao ≥ 10µs
    gpio_set_level(CHAN_TRIG, 0);
    int64_t t0 = esp_timer_get_time();
    while (!gpio_get_level(CHAN_ECHO)) if (esp_timer_get_time() - t0 > 30000) return -1;
    int64_t t1 = esp_timer_get_time();
    while (gpio_get_level(CHAN_ECHO)) if (esp_timer_get_time() - t1 > 30000) return -1;
    return (int)(esp_timer_get_time() - t1);
}
