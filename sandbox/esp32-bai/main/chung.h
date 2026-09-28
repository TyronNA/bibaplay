// Chân dùng chung cho các bài: né chân xiaozhi (4-7, 15, 16, 39-42, 47), chân strapping (0, 3, 45, 46),
// flash/PSRAM octal (26-37), USB (19, 20) và LED RGB trên board (38 hoặc 48 tuỳ bản).
#pragma once
#include "driver/gpio.h"

#define CHAN_LED      GPIO_NUM_13
#define CHAN_NUT      GPIO_NUM_12
#define CHAN_B        GPIO_NUM_14   // chân B của S8050 (qua điện trở)
#define CHAN_IN1      GPIO_NUM_9    // driver motor
#define CHAN_IN2      GPIO_NUM_10

void ra(gpio_num_t chan);                 // cấu hình chân output, mức 0
void pwm_bat(gpio_num_t chan, int kenh, uint32_t hz);
void pwm_dat(int kenh, int phan_tram);    // 0..100
void cho_ms(int ms);
