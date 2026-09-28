// 13.3: chạy không cáp USB nên không có Serial. Mỗi lần chip khởi động LED GPIO13 nháy nhanh 5 lần:
// thấy lại 5 nháy lúc motor vừa quay = chip vừa reset (brownout). Lần cắm USB sau, lý do reset được in ra.
#include <stdio.h>
#include "chung.h"
#include "esp_system.h"

const char *ten_reset(esp_reset_reason_t r);

void bai_13_3(void)
{
    printf("ly do reset lan truoc: %s\n", ten_reset(esp_reset_reason()));
    ra(CHAN_LED);
    for (int i = 0; i < 5; i++) { gpio_set_level(CHAN_LED, 1); cho_ms(80); gpio_set_level(CHAN_LED, 0); cho_ms(80); }
    gpio_set_level(CHAN_LED, 1);   // sáng đều = đang chạy bình thường
    pwm_bat(CHAN_IN1, 0, 1000);
    ra(CHAN_IN2);
    for (;;) {
        cho_ms(3000);
        printf("motor khoi dong 100%%\n");
        pwm_dat(0, 100);   // khởi động đột ngột: dòng lớn nhất
        cho_ms(2000);
        pwm_dat(0, 0);
    }
}
