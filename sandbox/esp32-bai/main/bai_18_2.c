// 18.2 Vòng điều khiển đúng nhịp: một task 50Hz (20ms) làm "việc" 12ms mỗi vòng, chạy 3 cách, mỗi cách 500 vòng:
//   A  vTaskDelay(20ms) sau khi làm việc   → chờ 20ms tính từ lúc làm xong: nhịp ≈ 30ms (tick FreeRTOS 10ms)
//   B  vTaskDelayUntil(20ms)               → chờ tới mốc kế tiếp: nhịp đúng 20ms, không cộng dồn
//   C  như B nhưng mỗi vòng printf ~300 ký tự → UART 115200 baud truyền mất ~26ms/dòng, lâu hơn cả nhịp
//      (128 ký tự đầu vào FIFO ngay, phần còn lại printf phải đứng chờ FIFO rút bớt)
// Mỗi giây gửi nhịp ngắn nhất / dài nhất / trung bình và tổng lệch so với đồng hồ lên trạm.
#include <stdio.h>
#include "robot.h"
#include "esp_timer.h"
#include "esp_rom_sys.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char CHAM[] = "............................................................................................................................................................................................................................................................................................................";

static void lam_viec(void) { esp_rom_delay_us(12000); }   // giả việc tính toán: đọc cảm biến, PI…

void bai_18_2(void)
{
    robot_mo();
    bool mang = robot_mang_mo();
    const char *ten[] = { "A vTaskDelay", "B vTaskDelayUntil", "C DelayUntil + printf" };
    char lenh[32];
    for (;;) {
        for (int cach = 0; cach < 3; cach++) {
            printf("=== cach %s ===\n", ten[cach]);
            if (mang) tram_gui("S cach %s", ten[cach]);
            TickType_t moc = xTaskGetTickCount();
            int64_t bat_dau = esp_timer_get_time(), truoc = bat_dau;
            float dmin = 1e9f, dmax = 0, tong = 0;
            int n = 0;
            for (int k = 1; k <= 500; k++) {                      // 500 × 20ms = 10s nếu đúng nhịp
                if (cach == 0) vTaskDelay(pdMS_TO_TICKS(20));
                else vTaskDelayUntil(&moc, pdMS_TO_TICKS(20));
                int64_t bay_gio = esp_timer_get_time();
                float dt = (bay_gio - truoc) / 1000.0f;
                truoc = bay_gio;
                if (dt < dmin) dmin = dt;
                if (dt > dmax) dmax = dt;
                tong += dt;
                n++;
                lam_viec();
                if (cach == 2) printf("k=%03d dt=%6.2fms %.*s\n", k, dt, 280, CHAM);
                if (k % 50 == 0) {
                    float lech = (bay_gio - bat_dau) / 1000.0f - k * 20.0f;   // so với k nhịp lý tưởng
                    if (mang) tram_gui("T cach=%d dt_min=%.2f dt_max=%.2f dt_tb=%.2f lech_ms=%.1f", cach, dmin, dmax, tong / n, lech);
                    if (cach != 2) printf("dt min %.2f max %.2f tb %.2f ms, lech tong %.1f ms\n", dmin, dmax, tong / n, lech);
                    dmin = 1e9f; dmax = 0; tong = 0; n = 0;
                    while (tram_nhan(lenh, sizeof lenh)) {}
                }
            }
        }
    }
}
