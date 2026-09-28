// 15.4 Giữ tốc độ bánh bằng vòng kín: mạch 15.2 (DRV8833 IN1 = GPIO9 PWM, IN2 = GPIO10 = 0, khe quang → GPIO11).
// Đếm cả 2 cạnh (đĩa 20 lỗ → 40 xung/vòng) mỗi 200ms → tốc độ v (xung/s).
//   duty = NEN + KP·sai            (pha P)
//   duty = NEN + KP·sai + KI·∫sai  (pha PI)       sai = dich − v, duty kẹp 0..100%
// NEN là duty đoán trước để motor vừa quay (feedforward); KP, KI là số khởi đầu — bài hướng dẫn chỉnh theo số in ra.
#include <stdio.h>
#include "chung.h"
#include "driver/pulse_cnt.h"

#define DT_MS 200
static const float NEN = 35, KP = 0.3f, KI = 0.8f;

static pcnt_unit_handle_t mo_dem(void)
{
    pcnt_unit_config_t uc = { .low_limit = -1, .high_limit = 30000 };
    pcnt_unit_handle_t u;
    ESP_ERROR_CHECK(pcnt_new_unit(&uc, &u));
    pcnt_glitch_filter_config_t loc = { .max_glitch_ns = 1000 };
    ESP_ERROR_CHECK(pcnt_unit_set_glitch_filter(u, &loc));
    pcnt_chan_config_t cc = { .edge_gpio_num = CHAN_ENC, .level_gpio_num = -1 };
    pcnt_channel_handle_t ch;
    ESP_ERROR_CHECK(pcnt_new_channel(u, &cc, &ch));
    ESP_ERROR_CHECK(pcnt_channel_set_edge_action(ch, PCNT_CHANNEL_EDGE_ACTION_INCREASE, PCNT_CHANNEL_EDGE_ACTION_INCREASE));
    ESP_ERROR_CHECK(pcnt_unit_enable(u));
    ESP_ERROR_CHECK(pcnt_unit_clear_count(u));
    ESP_ERROR_CHECK(pcnt_unit_start(u));
    return u;
}

void bai_15_4(void)
{
    pcnt_unit_handle_t u = mo_dem();
    pwm_bat(CHAN_IN1, 0, 1000);
    ra(CHAN_IN2);
    for (;;) {
        for (int pi = 0; pi < 2; pi++) {
            printf("=== pha %s (KP=%.2f KI=%.2f) ===\n", pi ? "PI" : "P", KP, pi ? KI : 0.0f);
            float tich = 0;
            for (int k = 0; k < 100; k++) {                 // 100 × 200ms = 20s; đổi đích ở giây thứ 10
                int dich = k < 50 ? 60 : 100;
                cho_ms(DT_MS);
                int n;
                pcnt_unit_get_count(u, &n);
                pcnt_unit_clear_count(u);
                float v = n * 1000.0f / DT_MS, sai = dich - v;
                float duty = NEN + KP * sai + (pi ? KI * tich : 0);
                // chống "tích phân tràn": duty đã kẹp ở biên mà sai còn đẩy ra ngoài thì không cộng thêm
                if (pi && !((duty >= 100 && sai > 0) || (duty <= 0 && sai < 0))) tich += sai * DT_MS / 1000.0f;
                if (duty > 100) duty = 100;
                if (duty < 0) duty = 0;
                pwm_dat(0, (int)duty);
                printf("t=%4.1fs dich=%3d do=%5.1f sai=%6.1f duty=%3d%%\n", k * DT_MS / 1000.0f, dich, v, sai, (int)duty);
            }
            pwm_dat(0, 0);
            cho_ms(3000);
        }
    }
}
