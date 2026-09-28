// Chân dùng chung cho các bài: né chân xiaozhi (4-7, 15, 16, 39-42, 47), chân strapping (0, 3, 45, 46),
// flash/PSRAM octal (26-37), USB (19, 20) và LED RGB trên board (38 hoặc 48 tuỳ bản).
#pragma once
#include "driver/gpio.h"

#define CHAN_LED      GPIO_NUM_13
#define CHAN_NUT      GPIO_NUM_12
#define CHAN_B        GPIO_NUM_14   // chân B của S8050 (qua điện trở)
#define CHAN_IN1      GPIO_NUM_9    // driver motor
#define CHAN_IN2      GPIO_NUM_10

// Phần 3 (chương 14–17). Mỗi bài dùng một nhóm; 14 và 21 được dùng lại ở bài khác nhau (servo 15.1 /
// motor B 17.1, TCRT DO 14.4 / motor B 17.1) — không bài nào dùng cả hai vai cùng lúc.
#define CHAN_IR       GPIO_NUM_8    // FC-51 OUT, thấp = có vật
#define CHAN_ENC      GPIO_NUM_11   // khe quang OUT
#define CHAN_TRIG     GPIO_NUM_17   // HC-SR04
#define CHAN_ECHO     GPIO_NUM_18   // HC-SR04, qua cầu 10k/20k
#define CHAN_TCRT     GPIO_NUM_21   // TCRT5000 DO; AO ở GPIO2 = ADC1 kênh 1
#define CHAN_SERVO    GPIO_NUM_14
#define CHAN_BIN1     GPIO_NUM_14   // motor B robot 17.1
#define CHAN_BIN2     GPIO_NUM_21

void ra(gpio_num_t chan);                 // cấu hình chân output, mức 0
void pwm_bat(gpio_num_t chan, int kenh, uint32_t hz);
void pwm_dat(int kenh, int phan_tram);    // 0..100
void cho_ms(int ms);
void sieu_am_mo(void);
int sieu_am_us(void);                     // độ rộng xung Echo (µs), -1 nếu hết giờ (không có vật / không nối)
