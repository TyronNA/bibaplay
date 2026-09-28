// 9.6: in mức các chân strapping, và lý do reset lần trước.
#include <stdio.h>
#include "chung.h"
#include "esp_system.h"

const char *ten_reset(esp_reset_reason_t r)
{
    switch (r) {
    case ESP_RST_POWERON: return "cap dien";
    case ESP_RST_SW: return "reset mem";
    case ESP_RST_PANIC: return "code loi (panic)";
    case ESP_RST_BROWNOUT: return "BROWNOUT: ap nguon tut";
    case ESP_RST_USB: return "reset qua USB";
    default: return "khac";
    }
}

void bai_9_6(void)
{
    const gpio_num_t chan[] = { GPIO_NUM_0, GPIO_NUM_3, GPIO_NUM_45, GPIO_NUM_46 };
    for (int i = 0; i < 4; i++) gpio_input_enable(chan[i]);
    esp_reset_reason_t r = esp_reset_reason();
    printf("ly do reset: %d = %s\n", r, ten_reset(r));
    for (;;) {
        for (int i = 0; i < 4; i++) printf("GPIO%d=%d  ", chan[i], gpio_get_level(chan[i]));
        printf("\n");
        cho_ms(1000);
    }
}
