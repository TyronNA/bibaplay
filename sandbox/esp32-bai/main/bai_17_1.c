// 17.1: robot tránh vật. DRV8833: A = GPIO9/10, B = GPIO14/21 (PWM kênh 0–3). Siêu âm 17/18, FC-51 GPIO8,
// công tắc va chạm GPIO12 (pull-up nội), pin qua cầu 20k/10k ở GPIO1.
#include <stdio.h>
#include "chung.h"
#include "adc_chung.h"

#define DUTY_DI     50     // %: pack 2S đầy 8.4V × 50% ≈ 4.2V trung bình
#define DUTY_TOI_DA 70     // motor TT định mức 6V: 8.4V × 70% ≈ 5.9V
#define GAN_CM      20
#define PIN_YEU_MV  6600   // 3.3V/cell
#define CO_PIN_MV   1000   // dưới mức này = chưa nối pin (đang thử bằng USB): bỏ qua kiểm pin yếu

static void banh(int trai, int phai)   // -100..100, âm = lùi
{
    if (trai > DUTY_TOI_DA) trai = DUTY_TOI_DA;
    if (trai < -DUTY_TOI_DA) trai = -DUTY_TOI_DA;
    if (phai > DUTY_TOI_DA) phai = DUTY_TOI_DA;
    if (phai < -DUTY_TOI_DA) phai = -DUTY_TOI_DA;
    // PWM vào 1 chân, chân kia 0 (TI DRV8833 bảng 2: fast decay)
    pwm_dat(0, trai > 0 ? trai : 0);
    pwm_dat(1, trai < 0 ? -trai : 0);
    pwm_dat(2, phai > 0 ? phai : 0);
    pwm_dat(3, phai < 0 ? -phai : 0);
}

void bai_17_1(void)
{
    pwm_bat(CHAN_IN1, 0, 1000);
    pwm_bat(CHAN_IN2, 1, 1000);
    pwm_bat(CHAN_BIN1, 2, 1000);
    pwm_bat(CHAN_BIN2, 3, 1000);
    banh(0, 0);
    sieu_am_mo();
    gpio_config_t vao = { .pin_bit_mask = 1ULL << CHAN_IR, .mode = GPIO_MODE_INPUT };
    gpio_config(&vao);
    gpio_config_t va = { .pin_bit_mask = 1ULL << CHAN_NUT, .mode = GPIO_MODE_INPUT, .pull_up_en = GPIO_PULLUP_ENABLE };
    gpio_config(&va);
    adc_t a = adc_mo(ADC_CHANNEL_0);

    for (int i = 0;; i++) {
        if (i % 15 == 0) {   // ~1 lần/giây
            int tho, mv;
            adc_doc(&a, ADC_CHANNEL_0, &tho, &mv);
            int pin = mv * 3;
            printf("pin = %d mV\n", pin);
            if (pin > CO_PIN_MV && pin < PIN_YEU_MV) {
                banh(0, 0);
                printf("PIN YEU: dung han. Rut P+, sac lai tung cell (16.1).\n");
                for (;;) cho_ms(1000);
            }
        }
        int us = sieu_am_us();
        const char *ly_do = NULL;
        if (gpio_get_level(CHAN_NUT) == 0) ly_do = "va cham";
        else if (gpio_get_level(CHAN_IR) == 0) ly_do = "hong ngoai";
        else if (us > 0 && us / 58 < GAN_CM) ly_do = "sieu am";

        if (ly_do) {
            printf("ne: %s\n", ly_do);
            banh(0, 0);          cho_ms(100);
            banh(-DUTY_DI, -DUTY_DI); cho_ms(400);
            banh(DUTY_DI, -DUTY_DI);  cho_ms(350);   // quay tại chỗ: 2 bánh ngược chiều
        } else {
            banh(DUTY_DI, DUTY_DI);
        }
        cho_ms(70);   // + thời gian đo siêu âm: mỗi lần đo cách nhau ≥ 60ms
    }
}
