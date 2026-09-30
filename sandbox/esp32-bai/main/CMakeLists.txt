idf_component_register(
    SRCS "main.c" "chung.c" "bai_8_3.c" "bai_8_4.c" "bai_9_1.c" "bai_9_3.c" "bai_9_4.c" "bai_9_6.c"
         "bai_10_1.c" "bai_10_2.c" "bai_10_3.c" "bai_11_1.c" "bai_11_2.c" "bai_11_3.c"
         "bai_12_1.c" "bai_12_2.c" "bai_12_3.c" "bai_13_1.c" "bai_13_2.c" "bai_13_3.c"
         "bai_14_2.c" "bai_14_3.c" "bai_14_4.c" "bai_15_1.c" "bai_15_2.c" "bai_15_3.c" "bai_16_3.c" "bai_17_1.c"
         "bai_9_7.c" "bai_9_8.c" "bai_11_4.c" "bai_15_4.c"
         "robot.c" "ld19.c" "bai_18_1.c" "bai_18_2.c" "bai_18_3.c" "bai_18_4.c" "bai_19_1.c" "bai_19_2.c" "bai_19_3.c"
         "bai_19_4.c" "bai_19_5.c" "bai_20_1.c" "bai_20_2.c" "bai_20_3.c" "bai_20_4.c" "bai_21.c"
    INCLUDE_DIRS "."
    REQUIRES esp_driver_gpio esp_adc esp_driver_ledc esp_driver_i2c esp_driver_i2s esp_driver_pcnt esp_driver_uart esp_driver_gptimer esp_lcd esp_wifi esp_netif esp_event nvs_flash esp_timer lwip)
