// 15.3: MPU-6050 (GY-521) trên I2C SDA=41, SCL=42 (chung bus với OLED 12.1), địa chỉ 0x68.
// Thanh ghi theo RM-MPU-6000A: 0x6B PWR_MGMT_1 (bật lên = 0x40, đang ngủ), 0x1B GYRO_CONFIG, 0x47 GYRO_ZOUT_H, 0x75 WHO_AM_I.
#include <stdio.h>
#include "chung.h"
#include "driver/i2c_master.h"
#include "esp_timer.h"

static i2c_master_dev_handle_t s_imu;

static void ghi(uint8_t reg, uint8_t v)
{
    uint8_t b[2] = { reg, v };
    ESP_ERROR_CHECK(i2c_master_transmit(s_imu, b, 2, 100));
}

static uint8_t doc1(uint8_t reg)
{
    uint8_t v = 0;
    ESP_ERROR_CHECK(i2c_master_transmit_receive(s_imu, &reg, 1, &v, 1, 100));
    return v;
}

static int16_t gyro_z(void)
{
    uint8_t reg = 0x47, b[2];
    ESP_ERROR_CHECK(i2c_master_transmit_receive(s_imu, &reg, 1, b, 2, 100));
    return (int16_t)((b[0] << 8) | b[1]);
}

void bai_15_3(void)
{
    i2c_master_bus_config_t bc = {
        .i2c_port = I2C_NUM_0, .sda_io_num = GPIO_NUM_41, .scl_io_num = GPIO_NUM_42,
        .clk_source = I2C_CLK_SRC_DEFAULT, .glitch_ignore_cnt = 7, .flags.enable_internal_pullup = true,
    };
    i2c_master_bus_handle_t bus;
    ESP_ERROR_CHECK(i2c_new_master_bus(&bc, &bus));
    if (i2c_master_probe(bus, 0x68, 50) != ESP_OK) { printf("khong thay 0x68: kiem SDA/SCL, VCC, GND\n"); return; }
    i2c_device_config_t dc = { .dev_addr_length = I2C_ADDR_BIT_LEN_7, .device_address = 0x68, .scl_speed_hz = 400000 };
    ESP_ERROR_CHECK(i2c_master_bus_add_device(bus, &dc, &s_imu));

    printf("WHO_AM_I = 0x%02X (phai la 0x68)\n", doc1(0x75));
    ghi(0x6B, 0x00);   // đánh thức
    ghi(0x1B, 0x00);   // gyro ±250°/s → 131 đơn vị = 1°/s
    cho_ms(100);

    printf("dang do sai lech, dung cham board 2 giay...\n");
    long tong = 0;
    for (int i = 0; i < 200; i++) { tong += gyro_z(); cho_ms(10); }
    float lech = tong / 200.0f;
    printf("sai lech = %.1f don vi (%.2f do/s)\n", lech, lech / 131.0f);

    float goc = 0;
    int64_t truoc = esp_timer_get_time();
    for (int i = 0;; i++) {
        cho_ms(10);
        int64_t bay_gio = esp_timer_get_time();
        float dt = (bay_gio - truoc) / 1e6f;   // đo thời gian thật, không tin cho_ms đúng 10ms
        truoc = bay_gio;
        goc += (gyro_z() - lech) / 131.0f * dt;
        if (i % 20 == 0) printf("goc = %7.1f do\n", goc);
    }
}
