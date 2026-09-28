// 9.8 Ngắt: nút GPIO12 (pull-up nội, nhấn = 0) + LED GPIO13 (qua 330Ω). Hai chế độ luân phiên mỗi 10s:
//   HOI VONG: vòng lặp chỉ nhìn nút mỗi 250ms → bấm nhanh bị sót, LED đổi trễ.
//   NGAT: cạnh xuống gọi hàm ngắt ngay; hàm ngắt ghi thời điểm vào hàng đợi, task đảo LED và in độ trễ.
// Thêm timer phần cứng 1kHz: hàm ngắt của nó chỉ đếm nhịp, mỗi giây in ra phải ≈ 1000.
#include <stdio.h>
#include "chung.h"
#include "driver/gptimer.h"
#include "esp_attr.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"

static QueueHandle_t s_hang;
static volatile uint32_t s_nhip;
static volatile int64_t s_lan_cuoi;

// Hàm ngắt: ngắn, không printf, không chờ. Chống dội bằng thời gian: cạnh cách lần trước < 30ms là nảy.
static void IRAM_ATTR khi_nhan(void *arg)
{
    int64_t t = esp_timer_get_time();
    if (t - s_lan_cuoi < 30000) return;
    s_lan_cuoi = t;
    BaseType_t day = pdFALSE;
    xQueueSendFromISR(s_hang, &t, &day);
    if (day) portYIELD_FROM_ISR();
}

static bool IRAM_ATTR khi_nhip(gptimer_handle_t tm, const gptimer_alarm_event_data_t *e, void *u)
{
    s_nhip++;
    return false;
}

void bai_9_8(void)
{
    ra(CHAN_LED);
    s_hang = xQueueCreate(8, sizeof(int64_t));
    gpio_config_t c = {
        .pin_bit_mask = 1ULL << CHAN_NUT, .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE, .intr_type = GPIO_INTR_NEGEDGE,
    };
    gpio_config(&c);
    gpio_install_isr_service(0);
    gpio_isr_handler_add(CHAN_NUT, khi_nhan, NULL);

    gptimer_handle_t tm;
    gptimer_config_t tc = { .clk_src = GPTIMER_CLK_SRC_DEFAULT, .direction = GPTIMER_COUNT_UP, .resolution_hz = 1000000 };
    ESP_ERROR_CHECK(gptimer_new_timer(&tc, &tm));
    gptimer_event_callbacks_t cb = { .on_alarm = khi_nhip };
    ESP_ERROR_CHECK(gptimer_register_event_callbacks(tm, &cb, NULL));
    gptimer_alarm_config_t ac = { .alarm_count = 1000, .reload_count = 0, .flags.auto_reload_on_alarm = true };
    ESP_ERROR_CHECK(gptimer_set_alarm_action(tm, &ac));
    ESP_ERROR_CHECK(gptimer_enable(tm));
    ESP_ERROR_CHECK(gptimer_start(tm));

    int led = 0;
    uint32_t nhip_cu = 0;
    for (;;) {
        // --- 10s hỏi vòng ---
        gpio_intr_disable(CHAN_NUT);
        printf("=== HOI VONG: moi 250ms moi nhin nut mot lan ===\n");
        int truoc = 1, dem = 0;
        for (int i = 0; i < 40; i++) {
            int muc = gpio_get_level(CHAN_NUT);
            if (muc == 0 && truoc == 1) { led = !led; gpio_set_level(CHAN_LED, led); dem++; }
            truoc = muc;
            cho_ms(250);
            if (i % 4 == 3) { uint32_t n = s_nhip; printf("  nhan %d lan | timer %lu nhip/s\n", dem, (unsigned long)(n - nhip_cu)); nhip_cu = n; }
        }
        // --- 10s ngắt ---
        xQueueReset(s_hang);
        gpio_intr_enable(CHAN_NUT);
        printf("=== NGAT: canh xuong goi ham ngat ngay ===\n");
        int64_t het = esp_timer_get_time() + 10000000;
        dem = 0;
        while (esp_timer_get_time() < het) {
            int64_t t;
            if (xQueueReceive(s_hang, &t, pdMS_TO_TICKS(1000)) == pdTRUE) {
                led = !led;
                gpio_set_level(CHAN_LED, led);
                printf("  nhan lan %d: tu ngat toi task %lld us\n", ++dem, (long long)(esp_timer_get_time() - t));
            } else {
                uint32_t n = s_nhip;
                printf("  timer %lu nhip/s\n", (unsigned long)(n - nhip_cu));
                nhip_cu = n;
            }
        }
    }
}
