// 12.1 / 12.4: I2C trên SDA=41, SCL=42 (chân của bread-compact-wifi). Quét địa chỉ, rồi vẽ chữ lên SSD1306 128×64.
// Bài 12.4: vòng lặp cuối gửi lại 1 gói thăm dò mỗi 50ms để logic analyzer bắt được.
#include <stdio.h>
#include <string.h>
#include "chung.h"
#include "driver/i2c_master.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_panel_ssd1306.h"
#include "font5x7.h"

#define SDA GPIO_NUM_41
#define SCL GPIO_NUM_42

static uint8_t s_khung[128 * 64 / 8];

static void viet(int x, int dong, const char *s)
{
    for (; *s; s++, x += 6) {
        const uint8_t *g = NULL;
        if (*s >= '0' && *s <= '9') g = FONT_SO[*s - '0'];
        else if (*s == ':') g = FONT_SO[10];
        else if (*s >= 'A' && *s <= 'Z') g = FONT_CHU[*s - 'A'];
        if (g && x + 5 <= 128) memcpy(&s_khung[dong * 128 + x], g, 5);
    }
}

void bai_12_1(void)
{
    i2c_master_bus_config_t bc = {
        .i2c_port = I2C_NUM_0, .sda_io_num = SDA, .scl_io_num = SCL, .clk_source = I2C_CLK_SRC_DEFAULT,
        .glitch_ignore_cnt = 7,
        .flags.enable_internal_pullup = true,   // ~45k, yếu; module OLED thường có sẵn điện trở kéo lên trên board
    };
    i2c_master_bus_handle_t bus;
    ESP_ERROR_CHECK(i2c_new_master_bus(&bc, &bus));

    int thay = -1;
    printf("quet I2C:\n");
    for (int a = 0x08; a < 0x78; a++) {
        if (i2c_master_probe(bus, a, 50) == ESP_OK) { printf("  co thiet bi o 0x%02X\n", a); if (thay < 0) thay = a; }
    }
    if (thay < 0) { printf("khong thay gi: kiem day SDA/SCL, VCC, GND\n"); return; }

    esp_lcd_panel_io_i2c_config_t ioc = {
        .dev_addr = thay, .scl_speed_hz = 400000, .control_phase_bytes = 1,
        .dc_bit_offset = 6, .lcd_cmd_bits = 8, .lcd_param_bits = 8,
    };
    esp_lcd_panel_io_handle_t io;
    ESP_ERROR_CHECK(esp_lcd_new_panel_io_i2c(bus, &ioc, &io));
    esp_lcd_panel_ssd1306_config_t sc = { .height = 64 };
    esp_lcd_panel_dev_config_t pc = { .bits_per_pixel = 1, .reset_gpio_num = -1, .vendor_config = &sc };
    esp_lcd_panel_handle_t man;
    ESP_ERROR_CHECK(esp_lcd_new_panel_ssd1306(io, &pc, &man));
    ESP_ERROR_CHECK(esp_lcd_panel_reset(man));
    ESP_ERROR_CHECK(esp_lcd_panel_init(man));
    ESP_ERROR_CHECK(esp_lcd_panel_disp_on_off(man, true));

    char dia_chi[24];
    snprintf(dia_chi, sizeof dia_chi, "DIA CHI %02X", thay);
    viet(0, 0, "XIN CHAO");
    viet(0, 2, dia_chi);
    for (int dem = 0;; dem++) {
        char s[24];
        snprintf(s, sizeof s, "DEM %d", dem);
        memset(&s_khung[5 * 128], 0, 128);
        viet(0, 5, s);
        esp_lcd_panel_draw_bitmap(man, 0, 0, 128, 64, s_khung);
        i2c_master_probe(bus, thay, 50);
        cho_ms(50);
    }
}
