// 15.2: motor TT qua DRV8833 (IN1 = GPIO9 PWM, IN2 = GPIO10 giữ 0), khe quang OUT → GPIO11 đếm bằng PCNT.
// Đĩa 20 lỗ: vòng/phút = xung mỗi giây × 60 / 20.
#include <stdio.h>
#include "chung.h"
#include "driver/pulse_cnt.h"

void bai_15_2(void)
{
    pcnt_unit_config_t uc = { .low_limit = -1, .high_limit = 30000 };
    pcnt_unit_handle_t u;
    ESP_ERROR_CHECK(pcnt_new_unit(&uc, &u));
    pcnt_glitch_filter_config_t loc = { .max_glitch_ns = 1000 };   // bỏ gai < 1µs (nhiễu motor); xung thật dài hàng ms
    ESP_ERROR_CHECK(pcnt_unit_set_glitch_filter(u, &loc));
    pcnt_chan_config_t cc = { .edge_gpio_num = CHAN_ENC, .level_gpio_num = -1 };
    pcnt_channel_handle_t ch;
    ESP_ERROR_CHECK(pcnt_new_channel(u, &cc, &ch));
    // chỉ đếm cạnh lên: mỗi lỗ 1 xung (đếm cả 2 cạnh thì ra 40/vòng)
    ESP_ERROR_CHECK(pcnt_channel_set_edge_action(ch, PCNT_CHANNEL_EDGE_ACTION_INCREASE, PCNT_CHANNEL_EDGE_ACTION_HOLD));
    ESP_ERROR_CHECK(pcnt_unit_enable(u));
    ESP_ERROR_CHECK(pcnt_unit_clear_count(u));
    ESP_ERROR_CHECK(pcnt_unit_start(u));

    pwm_bat(CHAN_IN1, 0, 1000);
    ra(CHAN_IN2);
    const struct { int duty, giay; } pha[] = { { 60, 5 }, { 100, 5 }, { 0, 3 } };
    int tong = 0;
    for (;;) {
        for (int p = 0; p < 3; p++) {
            pwm_dat(0, pha[p].duty);
            for (int s = 0; s < pha[p].giay; s++) {
                cho_ms(1000);
                int n;
                pcnt_unit_get_count(u, &n);
                pcnt_unit_clear_count(u);
                tong += n;
                printf("duty %3d%%  %3d xung/s  %4d vong/phut  (tong %d)\n", pha[p].duty, n, n * 60 / 20, tong);
            }
        }
    }
}
