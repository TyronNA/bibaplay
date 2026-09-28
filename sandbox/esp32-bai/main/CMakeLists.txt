idf_component_register(
    SRCS "main.c" "chung.c" "bai_8_3.c" "bai_8_4.c" "bai_9_1.c" "bai_9_3.c" "bai_9_4.c" "bai_9_6.c"
         "bai_10_1.c" "bai_10_2.c" "bai_10_3.c" "bai_11_1.c" "bai_11_2.c" "bai_11_3.c"
         "bai_12_1.c" "bai_12_2.c" "bai_12_3.c" "bai_13_1.c" "bai_13_2.c" "bai_13_3.c"
    INCLUDE_DIRS "."
    REQUIRES esp_driver_gpio esp_adc esp_driver_ledc esp_driver_i2c esp_driver_i2s esp_lcd esp_wifi esp_netif esp_event nvs_flash esp_timer)
