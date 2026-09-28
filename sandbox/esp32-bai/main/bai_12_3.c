// 12.3: ampli MAX98357A qua I2S, DIN=7 BCLK=15 LRC=16. Tone 440Hz biên độ nhỏ: 2s kêu, 2s nghỉ.
#include <stdio.h>
#include <math.h>
#include "chung.h"
#include "freertos/FreeRTOS.h"
#include "driver/i2s_std.h"

#define BIEN_DO 3000   // /32767 ≈ 9%: loa điện thoại chịu công suất nhỏ, tăng dần nếu quá nhỏ

void bai_12_3(void)
{
    i2s_chan_handle_t tx;
    i2s_chan_config_t cc = I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_1, I2S_ROLE_MASTER);
    ESP_ERROR_CHECK(i2s_new_channel(&cc, &tx, NULL));
    i2s_std_config_t sc = {
        .clk_cfg = I2S_STD_CLK_DEFAULT_CONFIG(16000),
        .slot_cfg = I2S_STD_PHILIPS_SLOT_DEFAULT_CONFIG(I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_MONO),
        .gpio_cfg = { .mclk = I2S_GPIO_UNUSED, .bclk = GPIO_NUM_15, .ws = GPIO_NUM_16, .dout = GPIO_NUM_7, .din = I2S_GPIO_UNUSED },
    };
    ESP_ERROR_CHECK(i2s_channel_init_std_mode(tx, &sc));
    ESP_ERROR_CHECK(i2s_channel_enable(tx));

    static int16_t mau[1600];   // 0.1s ở 16kHz, 440Hz không chia hết nên tính pha liên tục
    static int16_t lang[1600];
    double pha = 0;
    for (;;) {
        printf("keu 440Hz\n");
        for (int k = 0; k < 20; k++) {
            for (int i = 0; i < 1600; i++) { mau[i] = (int16_t)(BIEN_DO * sin(pha)); pha += 2 * M_PI * 440 / 16000; }
            size_t n;
            i2s_channel_write(tx, mau, sizeof mau, &n, portMAX_DELAY);
        }
        printf("nghi\n");
        for (int k = 0; k < 20; k++) { size_t n; i2s_channel_write(tx, lang, sizeof lang, &n, portMAX_DELAY); }
    }
}
