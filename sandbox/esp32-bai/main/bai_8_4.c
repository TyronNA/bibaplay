// 8.4 Tụ lọc: quét WiFi liên tục để chip kéo dòng thành từng đợt, rồi nghỉ 10s để so.
#include <stdio.h>
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "nvs_flash.h"
#include "chung.h"

void bai_8_4(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    for (;;) {
        printf("WiFi BAT: quet 10s\n");
        ESP_ERROR_CHECK(esp_wifi_start());
        for (int i = 0; i < 5; i++) {
            esp_wifi_scan_start(NULL, true);
            uint16_t n = 0;
            esp_wifi_scan_get_ap_num(&n);
            esp_wifi_clear_ap_list();
            printf("  thay %u mang\n", n);
        }
        ESP_ERROR_CHECK(esp_wifi_stop());
        printf("WiFi TAT: nghi 10s\n");
        cho_ms(10000);
    }
}
