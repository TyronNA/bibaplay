// Chương 21: robot làm "chân tay" cho ROS 2 chạy trên máy Linux. Robot chỉ làm 3 việc gần phần cứng:
//   · nhận "V v w" (mm/s, rad/s) → PI 2 bánh; quá 500ms không có lệnh → dừng
//   · gửi "T x y th v w" 20 lần/giây (mm, độ, mm/s, rad/s) (odometry, góc đã trộn gyro nếu có GY-521)
//   · chuyển nguyên byte của LiDAR LD19 (UART1 RX = GPIO16, 230400 baud) lên máy qua UDP cổng 4212
// Bản đồ, định vị, tìm đường đều do máy Linux làm: ESP32 không đủ RAM/CPU cho SLAM.
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "robot.h"
#include "ld19.h"
#include "driver/uart.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define V_MAX 300.0f   // mm/s — Nav2 đòi nhanh hơn thì robot vẫn kẹp ở đây
#define W_MAX 2.0f

static ld19_doc_t s_ld;
static volatile uint16_t s_toc_do_lidar;

static void chuyen_lidar(void *arg)
{
    uart_config_t u = { .baud_rate = 230400, .data_bits = UART_DATA_8_BITS, .parity = UART_PARITY_DISABLE,
                        .stop_bits = UART_STOP_BITS_1, .flow_ctrl = UART_HW_FLOWCTRL_DISABLE, .source_clk = UART_SCLK_DEFAULT };
    ESP_ERROR_CHECK(uart_driver_install(UART_NUM_1, 4096, 0, 0, NULL, 0));
    ESP_ERROR_CHECK(uart_param_config(UART_NUM_1, &u));
    ESP_ERROR_CHECK(uart_set_pin(UART_NUM_1, UART_PIN_NO_CHANGE, CHAN_LIDAR_RX, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));
    static uint8_t b[LD19_GOI * 10];   // 10 gói/UDP: ~37 gói UDP mỗi giây thay vì 375
    ld19_goi_t g;
    for (;;) {
        int n = uart_read_bytes(UART_NUM_1, b, sizeof b, pdMS_TO_TICKS(30));
        if (n <= 0) continue;
        for (int i = 0; i < n; i++) if (ld19_nap(&s_ld, b[i], &g)) s_toc_do_lidar = g.toc_do;
        tram_gui_lidar(b, n);
    }
}

void bai_21(void)
{
    robot_mo();
    robot_cam_bien_mo();
    if (!robot_mang_mo()) { printf("Bai nay can WiFi.\n"); return; }
    bool imu = robot_imu_mo();
    xTaskCreate(chuyen_lidar, "lidar", 4096, NULL, 6, NULL);
    char lenh[48];
    float v = 0, w = 0;
    uint32_t tot_truoc = 0, hong_truoc = 0;
    for (int i = 0;; i++) {
        while (tram_nhan(lenh, sizeof lenh)) {
            if (lenh[0] == 'V') { char *q; v = strtof(lenh + 1, &q); w = strtof(q, NULL); }
            else if (lenh[0] == 'X') v = w = 0;
            else if (lenh[0] == 'Z') robot_dat_lai();
        }
        if (tram_im_lang_ms() > 500) v = w = 0;
        robot_cb_t c = robot_cam_bien();
        if (c.va && v > 0) v = 0;   // cản va trước bị đè: không cho tiến nữa, Nav2 tự lùi/tìm đường khác
        v = fmaxf(-V_MAX, fminf(V_MAX, v));
        w = fmaxf(-W_MAX, fminf(W_MAX, w));
        if (v == 0 && w == 0) robot_dung(); else robot_vw(v, w);
        robot_tt_t r;
        robot_doc(&r);
        float kb = robot_khoang_banh_mm();
        tram_gui("T x=%.1f y=%.1f th=%.2f v=%.0f w=%.3f", r.x, r.y, r.th * 57.29578f, (r.vT + r.vP) / 2, (r.vP - r.vT) / kb);
        if (i % 40 == 0) {   // 2 giây một lần
            uint32_t tot = s_ld.tot, hong = s_ld.hong;
            tram_gui("S lidar %.1f goi/s (hong %.1f), %.1f vong/s | gyro %s | pin %d mV", (tot - tot_truoc) / 2.0f,
                     (hong - hong_truoc) / 2.0f, s_toc_do_lidar / 360.0f, imu ? "co" : "khong", c.pin_mv);
            tot_truoc = tot;
            hong_truoc = hong;
        }
        cho_ms(50);
    }
}
