// Phần 4 (chương 18–21): robot 17.1 + encoder 2 bánh, IMU, TCRT, servo, LiDAR. Mọi bài Phần 4 dùng chung file này.
// Chân thêm so với 17.1 lấy từ nhóm chân của xiaozhi (4, 5, 15, 16, 41, 42): robot Phần 4 chạy firmware bài học,
// không chạy xiaozhi, nên không trùng. Muốn gộp xiaozhi lên robot này thì phải dời chân.
#pragma once
#include <stdbool.h>
#include <stdint.h>
#include "chung.h"
#include "hal/adc_types.h"

#define CHAN_ENC_T    CHAN_ENC      // GPIO11: khe quang bánh trái
#define CHAN_ENC_P    GPIO_NUM_13   // khe quang bánh phải (chỗ của LED 9.1 — robot không cắm LED)
#define CHAN_SDA      GPIO_NUM_41   // GY-521, như bài 15.3
#define CHAN_SCL      GPIO_NUM_42
#define KENH_PIN      ADC_CHANNEL_0 // GPIO1: cầu 20k/10k đo pack 2S (17.1)
#define KENH_TCRT_T   ADC_CHANNEL_3 // GPIO4: AO TCRT5000 trái
#define KENH_TCRT_P   ADC_CHANNEL_4 // GPIO5: AO TCRT5000 phải
#define CHAN_SERVO_R  GPIO_NUM_15   // servo quay HC-SR04 (radar 20.2)
#define CHAN_LIDAR_RX GPIO_NUM_16   // Tx của LD19 → UART1 RX

#define DUTY_TOI_DA   70            // motor TT định mức 6V, pack đầy 8.4V: 8.4 × 70% ≈ 5.9V (17.1)
#define CONG_TRAM     4210          // robot → máy tính (số liệu)
#define CONG_ROBOT    4211          // máy tính → robot (lệnh)
#define CONG_LIDAR    4212          // robot → máy tính (byte thô của LD19)

typedef struct {
    float x, y, th;          // mm, mm, rad — vị trí ước lượng (odometry, θ đã trộn gyro nếu có IMU)
    float th_enc, th_gyro;   // rad — góc chỉ theo encoder / chỉ theo gyro, để so ở bài 19.4
    float vT, vP;            // mm/s — tốc độ đo của từng bánh (trung bình 200ms gần nhất)
    float dichT, dichP;      // mm/s — tốc độ đích (chế độ vòng kín)
    int dutyT, dutyP;        // % đang ra driver, âm = lùi
    int32_t nT, nP;          // tổng xung có dấu từ lúc bật
    uint32_t nT_tuyet_doi, nP_tuyet_doi; // tổng xung không dấu (bài 19.1 đẩy tay: không biết chiều)
    float dt_ms_max;         // nhịp vòng điều khiển dài nhất từ lần đặt lại (bài 18.2)
} robot_tt_t;

// Chạy vòng điều khiển 50Hz (task riêng): đọc encoder, cập nhật vị trí, PI tốc độ bánh, ra PWM.
void robot_mo(void);
void robot_duty(int trai, int phai);                 // vòng hở, % −100..100 (kẹp ±DUTY_TOI_DA)
void robot_toc_do(float trai_mm_s, float phai_mm_s); // vòng kín PI từng bánh
void robot_vw(float v_mm_s, float w_rad_s);           // tốc độ thẳng + tốc độ quay → 2 bánh
void robot_dung(void);
void robot_doc(robot_tt_t *tt);
void robot_dat_lai(void);                            // x = y = θ = 0, xoá số xung và dt_ms_max
bool robot_imu_mo(void);                             // GY-521 trên 41/42; false nếu không thấy 0x68
void robot_tron_gyro(int phan_nghin);                // hệ số a của bộ lọc bù ×1000: 0 = chỉ encoder, 1000 = chỉ gyro
float robot_khoang_banh_mm(void);

// Cảm biến của robot 17.1 đọc nền mỗi ~70ms: siêu âm, FC-51, công tắc va chạm, pin (mỗi ~1s).
typedef struct { int cm; bool va, ir; int pin_mv; } robot_cb_t;   // cm = -1: không có tiếng vọng
void robot_cam_bien_mo(void);                        // mở cả ADC (robot_adc_mo)
robot_cb_t robot_cam_bien(void);
int robot_sieu_am_ngay(void);                        // đo 1 lần ngay (radar), chen giữa các lần đo nền
#define PIN_YEU_MV 6600                              // 3.3V/cell (17.1)
#define CO_PIN_MV  1000                              // dưới mức này = đang chạy bằng USB, chưa nối pack

// ADC1: pin (kênh 0) và 2 TCRT (kênh 3, 4). Mở một lần, đọc kênh nào cũng được.
void robot_adc_mo(void);
int robot_adc_mv(adc_channel_t kenh);                // trung bình 16 lần, mV đã hiệu chuẩn
int robot_pin_mv(void);                              // áp pack = mV GPIO1 × 3

// Servo radar: góc −80..80° (0 = thẳng trước mặt, dương = sang trái).
void robot_servo_mo(void);
void robot_servo_goc(int do_);

// Mạng: WiFi (ssid/mật khẩu trong menuconfig), UDP tới trạm trên máy tính.
bool robot_mang_mo(void);                            // chờ tối đa 15s có IP; false nếu chưa cấu hình / không vào được
void tram_gui(const char *fmt, ...) __attribute__((format(printf, 1, 2))); // 1 dòng chữ, không cần '\n'
int tram_nhan(char *buf, int n);                     // không chờ; trả về số byte, 0 nếu chưa có gói
int tram_im_lang_ms(void);                           // bao lâu rồi chưa nhận gói nào từ trạm (INT32_MAX nếu chưa từng)
bool tram_da_biet(void);                             // đã biết địa chỉ trạm (nhận ít nhất 1 gói)
void tram_gui_lidar(const uint8_t *b, int n);        // byte thô LD19 → trạm, cổng CONG_LIDAR
