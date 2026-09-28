// 12.2: mic INMP441 qua I2S, WS=4 SCK=5 SD=6, L/R nối GND → kênh trái. In mức âm dạng thanh ngang.
#include <stdio.h>
#include <math.h>
#include "chung.h"
#include "freertos/FreeRTOS.h"
#include "driver/i2s_std.h"

void bai_12_2(void)
{
    i2s_chan_handle_t rx;
    i2s_chan_config_t cc = I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_0, I2S_ROLE_MASTER);
    ESP_ERROR_CHECK(i2s_new_channel(&cc, NULL, &rx));
    i2s_std_config_t sc = {
        .clk_cfg = I2S_STD_CLK_DEFAULT_CONFIG(16000),
        .slot_cfg = I2S_STD_PHILIPS_SLOT_DEFAULT_CONFIG(I2S_DATA_BIT_WIDTH_32BIT, I2S_SLOT_MODE_MONO),
        .gpio_cfg = { .mclk = I2S_GPIO_UNUSED, .bclk = GPIO_NUM_5, .ws = GPIO_NUM_4, .dout = I2S_GPIO_UNUSED, .din = GPIO_NUM_6 },
    };
    sc.slot_cfg.slot_mask = I2S_STD_SLOT_LEFT;
    ESP_ERROR_CHECK(i2s_channel_init_std_mode(rx, &sc));
    ESP_ERROR_CHECK(i2s_channel_enable(rx));

    static int32_t mau[1600];   // 0.1s
    for (;;) {
        size_t n = 0;
        i2s_channel_read(rx, mau, sizeof mau, &n, portMAX_DELAY);
        double tong = 0;
        int so = n / 4;
        for (int i = 0; i < so; i++) { double x = (mau[i] >> 8) / 8388608.0; tong += x * x; }   // 24 bit nằm ở phần cao
        double db = 20 * log10(sqrt(tong / (so ? so : 1)) + 1e-9);
        int thanh = (int)((db + 90) / 2);
        printf("%6.1f dBFS |", db);
        for (int i = 0; i < thanh && i < 45; i++) putchar('#');
        printf("\n");
    }
}
