// 9.7 UART vòng lặp: UART1 TX = GPIO10 → 1k → RX = GPIO11 (cùng một board, tự gửi tự nhận).
// Log in ra monitor đi đường USB riêng, không dính UART1. Rút dây 1k ra là thấy HẾT GIỜ.
#include <stdio.h>
#include <string.h>
#include "chung.h"
#include "driver/uart.h"
#include "esp_timer.h"

#define CHAN_TX GPIO_NUM_10
#define CHAN_RX GPIO_NUM_11

void bai_9_7(void)
{
    uart_config_t c = {
        .baud_rate = 115200, .data_bits = UART_DATA_8_BITS, .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1, .flow_ctrl = UART_HW_FLOWCTRL_DISABLE, .source_clk = UART_SCLK_DEFAULT,
    };
    ESP_ERROR_CHECK(uart_driver_install(UART_NUM_1, 256, 0, 0, NULL, 0));
    ESP_ERROR_CHECK(uart_param_config(UART_NUM_1, &c));
    ESP_ERROR_CHECK(uart_set_pin(UART_NUM_1, CHAN_TX, CHAN_RX, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));

    char gui[32], nhan[32];
    for (int n = 1;; n++) {
        int len = snprintf(gui, sizeof gui, "xin chao %d\n", n);
        uart_flush_input(UART_NUM_1);
        int64_t t0 = esp_timer_get_time();
        uart_write_bytes(UART_NUM_1, gui, len);
        // mỗi byte 10 bit (start + 8 + stop) ở 115200 baud ≈ 87µs → 12 byte ≈ 1ms
        int got = uart_read_bytes(UART_NUM_1, nhan, len, pdMS_TO_TICKS(100));
        long long us = (long long)(esp_timer_get_time() - t0);
        if (got == len && memcmp(gui, nhan, len) == 0)
            printf("gui %d byte, nhan lai DUNG sau %lld us: %.*s\n", len, us, len - 1, nhan);
        else
            printf("HET GIO / SAI: nhan duoc %d/%d byte\n", got < 0 ? 0 : got, len);
        cho_ms(1000);
    }
}
