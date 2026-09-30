// Nền chung Phần 4: motor + encoder + odometry + PI tốc độ bánh (task 50Hz), IMU, ADC, servo, WiFi/UDP.
#include <math.h>
#include <stdarg.h>
#include <stdio.h>
#include <string.h>
#include "robot.h"
#include "sdkconfig.h"
#include "driver/ledc.h"
#include "driver/pulse_cnt.h"
#include "driver/i2c_master.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include "esp_timer.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/event_groups.h"
#include "lwip/sockets.h"

#define NHIP_MS  20
#define CUA_SO   10                  // tốc độ = tổng xung 10 nhịp gần nhất (200ms) — đĩa 20 lỗ quá thưa để đo mỗi 20ms
#define NEN      20.0f               // % duty vừa đủ thắng ma sát hộp số (đoán; bài 19.2 chỉnh theo số đo)
#define K_FF     0.07f               // % duty cho mỗi mm/s (đoán: 70% ≈ 700mm/s)
#define KP       0.05f
#define KI       0.15f

static portMUX_TYPE s_khoa = portMUX_INITIALIZER_UNLOCKED;
static robot_tt_t s_tt;
static bool s_vong_kin;
static float s_tich_T, s_tich_P;
static int s_dauT = 1, s_dauP = 1;   // chiều quay theo lệnh gần nhất: encoder 1 kênh không tự biết chiều
static pcnt_unit_handle_t s_encT, s_encP;
static int s_cua_T[CUA_SO], s_cua_P[CUA_SO], s_cua_i;
static float s_mm_moi_xung, s_khoang_banh;
static float s_tron = CONFIG_ROBOT_TRON_GYRO_PHAN_NGHIN / 1000.0f;

static i2c_master_dev_handle_t s_imu;
static bool s_co_imu;
static float s_lech_gyro;

static int kep(int x, int lo, int hi) { return x < lo ? lo : x > hi ? hi : x; }

static void ra_driver(int t, int p)
{
    t = kep(t, -DUTY_TOI_DA, DUTY_TOI_DA);
    p = kep(p, -DUTY_TOI_DA, DUTY_TOI_DA);
    // PWM vào 1 chân, chân kia 0 (TI DRV8833 bảng 2: fast decay), như 17.1
    pwm_dat(0, t > 0 ? t : 0);
    pwm_dat(1, t < 0 ? -t : 0);
    pwm_dat(2, p > 0 ? p : 0);
    pwm_dat(3, p < 0 ? -p : 0);
    if (t) s_dauT = t > 0 ? 1 : -1;
    if (p) s_dauP = p > 0 ? 1 : -1;
    s_tt.dutyT = t;
    s_tt.dutyP = p;
}

// pwm_bat (chung.c) cho mỗi kênh một timer; S3 chỉ có 4 timer LEDC nên 4 kênh motor phải chung timer 0,
// chừa timer 1 cho servo 50Hz. Độ phân giải 10 bit như pwm_bat để pwm_dat dùng lại được.
static void mo_pwm_motor(void)
{
    ledc_timer_config_t t = {
        .speed_mode = LEDC_LOW_SPEED_MODE, .duty_resolution = LEDC_TIMER_10_BIT,
        .timer_num = LEDC_TIMER_0, .freq_hz = 1000, .clk_cfg = LEDC_AUTO_CLK,
    };
    ESP_ERROR_CHECK(ledc_timer_config(&t));
    const gpio_num_t chan[4] = { CHAN_IN1, CHAN_IN2, CHAN_BIN1, CHAN_BIN2 };
    for (int k = 0; k < 4; k++) {
        ledc_channel_config_t c = {
            .gpio_num = chan[k], .speed_mode = LEDC_LOW_SPEED_MODE, .channel = (ledc_channel_t)k,
            .timer_sel = LEDC_TIMER_0, .duty = 0, .hpoint = 0,
        };
        ESP_ERROR_CHECK(ledc_channel_config(&c));
    }
}

static pcnt_unit_handle_t mo_enc(gpio_num_t chan)
{
    pcnt_unit_config_t uc = { .low_limit = -1, .high_limit = 30000 };
    pcnt_unit_handle_t u;
    ESP_ERROR_CHECK(pcnt_new_unit(&uc, &u));
    pcnt_glitch_filter_config_t loc = { .max_glitch_ns = 1000 };
    ESP_ERROR_CHECK(pcnt_unit_set_glitch_filter(u, &loc));
    pcnt_chan_config_t cc = { .edge_gpio_num = chan, .level_gpio_num = -1 };
    pcnt_channel_handle_t ch;
    ESP_ERROR_CHECK(pcnt_new_channel(u, &cc, &ch));
    // đếm cả 2 cạnh: 20 lỗ → 40 xung/vòng
    ESP_ERROR_CHECK(pcnt_channel_set_edge_action(ch, PCNT_CHANNEL_EDGE_ACTION_INCREASE, PCNT_CHANNEL_EDGE_ACTION_INCREASE));
    gpio_set_pull_mode(chan, GPIO_PULLUP_ONLY);   // chưa cắm khe quang thì chân không thả nổi đếm bậy
    ESP_ERROR_CHECK(pcnt_unit_enable(u));
    ESP_ERROR_CHECK(pcnt_unit_clear_count(u));
    ESP_ERROR_CHECK(pcnt_unit_start(u));
    return u;
}

static int lay_xung(pcnt_unit_handle_t u)
{
    int n = 0;
    pcnt_unit_get_count(u, &n);
    pcnt_unit_clear_count(u);
    return n;
}

static float gyro_z_rad_s(void)
{
    uint8_t reg = 0x47, b[2];
    if (i2c_master_transmit_receive(s_imu, &reg, 1, b, 2, 10) != ESP_OK) return 0;
    int16_t z = (int16_t)((b[0] << 8) | b[1]);
    return (z - s_lech_gyro) / 131.0f * (float)M_PI / 180.0f;   // ±250°/s: 131 đơn vị = 1°/s
}

static float pi_banh(float dich, float do_, float *tich, float dt)
{
    if (dich == 0) { *tich = 0; return 0; }   // đích 0 thì nhả hẳn, không để phần I giữ motor rì rì
    float ff = (dich > 0 ? 1 : -1) * NEN + K_FF * dich, sai = dich - do_;
    float duty = ff + KP * sai + KI * *tich;
    // chống tích phân tràn (15.4): đã kẹp ở biên mà sai còn đẩy ra ngoài thì không cộng
    if (!((duty >= DUTY_TOI_DA && sai > 0) || (duty <= -DUTY_TOI_DA && sai < 0))) *tich += sai * dt;
    return duty;
}

static void vong_dieu_khien(void *arg)
{
    TickType_t moc = xTaskGetTickCount();
    int64_t truoc = esp_timer_get_time();
    for (;;) {
        vTaskDelayUntil(&moc, pdMS_TO_TICKS(NHIP_MS));   // đúng nhịp, không cộng dồn trễ (bài 18.2)
        int64_t bay_gio = esp_timer_get_time();
        float dt = (bay_gio - truoc) / 1e6f;
        truoc = bay_gio;
        int xT = lay_xung(s_encT), xP = lay_xung(s_encP);
        float gz = s_co_imu ? gyro_z_rad_s() : 0;

        taskENTER_CRITICAL(&s_khoa);
        robot_tt_t *t = &s_tt;
        if (dt * 1000 > t->dt_ms_max) t->dt_ms_max = dt * 1000;
        t->nT_tuyet_doi += xT;
        t->nP_tuyet_doi += xP;
        int sT = xT * s_dauT, sP = xP * s_dauP;
        t->nT += sT;
        t->nP += sP;
        s_cua_T[s_cua_i] = sT;
        s_cua_P[s_cua_i] = sP;
        s_cua_i = (s_cua_i + 1) % CUA_SO;
        int tongT = 0, tongP = 0;
        for (int i = 0; i < CUA_SO; i++) { tongT += s_cua_T[i]; tongP += s_cua_P[i]; }
        t->vT = tongT * s_mm_moi_xung / (CUA_SO * NHIP_MS / 1000.0f);
        t->vP = tongP * s_mm_moi_xung / (CUA_SO * NHIP_MS / 1000.0f);

        // Odometry: quãng tâm robot = trung bình 2 bánh, góc quay = hiệu 2 bánh / khoảng cách bánh.
        float dT = sT * s_mm_moi_xung, dP = sP * s_mm_moi_xung, d = (dT + dP) / 2;
        float dth_enc = (dP - dT) / s_khoang_banh;
        t->th_enc += dth_enc;
        t->th_gyro += gz * dt;
        float th_moi = t->th + dth_enc;
        // Bộ lọc bù (19.4): tin gyro trong ngắn hạn, kéo dần về góc encoder với hằng số thời gian ≈ dt·a/(1−a).
        if (s_co_imu) th_moi = s_tron * (t->th + gz * dt) + (1 - s_tron) * t->th_enc;
        float giua = (t->th + th_moi) / 2;
        t->x += d * cosf(giua);
        t->y += d * sinf(giua);
        t->th = th_moi;

        bool kin = s_vong_kin;
        float dichT = t->dichT, dichP = t->dichP, vT = t->vT, vP = t->vP;
        taskEXIT_CRITICAL(&s_khoa);

        if (kin) ra_driver((int)pi_banh(dichT, vT, &s_tich_T, dt), (int)pi_banh(dichP, vP, &s_tich_P, dt));
    }
}

void robot_mo(void)
{
    s_mm_moi_xung = CONFIG_ROBOT_UM_MOI_XUNG / 1000.0f;
    s_khoang_banh = CONFIG_ROBOT_KHOANG_BANH_MM;
    mo_pwm_motor();
    ra_driver(0, 0);
    s_encT = mo_enc(CHAN_ENC_T);
    s_encP = mo_enc(CHAN_ENC_P);
    xTaskCreate(vong_dieu_khien, "dieu_khien", 4096, NULL, 10, NULL);
}

void robot_duty(int trai, int phai)
{
    taskENTER_CRITICAL(&s_khoa);
    s_vong_kin = false;
    s_tt.dichT = s_tt.dichP = 0;
    taskEXIT_CRITICAL(&s_khoa);
    ra_driver(trai, phai);
}

void robot_toc_do(float trai, float phai)
{
    taskENTER_CRITICAL(&s_khoa);
    s_vong_kin = true;
    s_tt.dichT = trai;
    s_tt.dichP = phai;
    taskEXIT_CRITICAL(&s_khoa);
}

// Bánh trái đi chậm hơn tâm một nửa khoảng cách bánh × w, bánh phải nhanh hơn chừng đó (w > 0 = quay trái).
void robot_vw(float v, float w) { robot_toc_do(v - w * s_khoang_banh / 2, v + w * s_khoang_banh / 2); }

void robot_dung(void) { robot_duty(0, 0); }

void robot_doc(robot_tt_t *tt)
{
    taskENTER_CRITICAL(&s_khoa);
    *tt = s_tt;
    taskEXIT_CRITICAL(&s_khoa);
}

void robot_dat_lai(void)
{
    taskENTER_CRITICAL(&s_khoa);
    s_tt.x = s_tt.y = s_tt.th = s_tt.th_enc = s_tt.th_gyro = 0;
    s_tt.nT = s_tt.nP = 0;
    s_tt.nT_tuyet_doi = s_tt.nP_tuyet_doi = 0;
    s_tt.dt_ms_max = 0;
    taskEXIT_CRITICAL(&s_khoa);
}

float robot_khoang_banh_mm(void) { return s_khoang_banh; }

void robot_tron_gyro(int phan_nghin) { s_tron = kep(phan_nghin, 0, 1000) / 1000.0f; }

bool robot_imu_mo(void)
{
    i2c_master_bus_config_t bc = {
        .i2c_port = I2C_NUM_0, .sda_io_num = CHAN_SDA, .scl_io_num = CHAN_SCL,
        .clk_source = I2C_CLK_SRC_DEFAULT, .glitch_ignore_cnt = 7, .flags.enable_internal_pullup = true,
    };
    i2c_master_bus_handle_t bus;
    ESP_ERROR_CHECK(i2c_new_master_bus(&bc, &bus));
    if (i2c_master_probe(bus, 0x68, 50) != ESP_OK) return false;
    i2c_device_config_t dc = { .dev_addr_length = I2C_ADDR_BIT_LEN_7, .device_address = 0x68, .scl_speed_hz = 400000 };
    ESP_ERROR_CHECK(i2c_master_bus_add_device(bus, &dc, &s_imu));
    uint8_t danh_thuc[2] = { 0x6B, 0x00 }, thang[2] = { 0x1B, 0x00 };   // thức dậy; gyro ±250°/s
    ESP_ERROR_CHECK(i2c_master_transmit(s_imu, danh_thuc, 2, 100));
    ESP_ERROR_CHECK(i2c_master_transmit(s_imu, thang, 2, 100));
    cho_ms(100);
    // Sai lệch khi đứng yên (15.3): robot phải nằm im 2 giây lúc bật.
    long tong = 0;
    for (int i = 0; i < 200; i++) {
        uint8_t reg = 0x47, b[2];
        i2c_master_transmit_receive(s_imu, &reg, 1, b, 2, 10);
        tong += (int16_t)((b[0] << 8) | b[1]);
        cho_ms(10);
    }
    s_lech_gyro = tong / 200.0f;
    robot_dat_lai();
    s_co_imu = true;
    return true;
}

// ── ADC ──
static adc_oneshot_unit_handle_t s_adc;
static adc_cali_handle_t s_cali[10];

void robot_adc_mo(void)
{
    adc_oneshot_unit_init_cfg_t u = { .unit_id = ADC_UNIT_1 };
    ESP_ERROR_CHECK(adc_oneshot_new_unit(&u, &s_adc));
    const adc_channel_t kenh[] = { KENH_PIN, KENH_TCRT_T, KENH_TCRT_P };
    for (int i = 0; i < 3; i++) {
        adc_oneshot_chan_cfg_t c = { .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_12 };
        ESP_ERROR_CHECK(adc_oneshot_config_channel(s_adc, kenh[i], &c));
        adc_cali_curve_fitting_config_t k = { .unit_id = ADC_UNIT_1, .chan = kenh[i], .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_12 };
        ESP_ERROR_CHECK(adc_cali_create_scheme_curve_fitting(&k, &s_cali[kenh[i]]));
    }
}

int robot_adc_mv(adc_channel_t kenh)
{
    int tong = 0, x, mv = 0;
    for (int i = 0; i < 16; i++) { adc_oneshot_read(s_adc, kenh, &x); tong += x; }
    adc_cali_raw_to_voltage(s_cali[kenh], tong / 16, &mv);
    return mv;
}

int robot_pin_mv(void) { return robot_adc_mv(KENH_PIN) * 3; }

// ── Servo ──
// Kênh 4 trên timer 1 riêng ở 50Hz; 4 kênh motor chung timer 0 (1kHz) — xem mo_pwm_motor.
void robot_servo_mo(void)
{
    ledc_timer_config_t t = {
        .speed_mode = LEDC_LOW_SPEED_MODE, .duty_resolution = LEDC_TIMER_14_BIT,
        .timer_num = LEDC_TIMER_1, .freq_hz = 50, .clk_cfg = LEDC_AUTO_CLK,
    };
    ESP_ERROR_CHECK(ledc_timer_config(&t));
    ledc_channel_config_t c = {
        .gpio_num = CHAN_SERVO_R, .speed_mode = LEDC_LOW_SPEED_MODE, .channel = LEDC_CHANNEL_4,
        .timer_sel = LEDC_TIMER_1, .duty = 0, .hpoint = 0,
    };
    ESP_ERROR_CHECK(ledc_channel_config(&c));
    robot_servo_goc(0);
}

// 1.5ms = giữa, ±0.5ms ≈ ±90° (15.1). Kẹp ±80° để không ép servo vào chặn cơ khí.
void robot_servo_goc(int do_)
{
    int g = kep(do_, -80, 80);
#if CONFIG_ROBOT_SERVO_DAO
    g = -g;
#endif
    int us = 1500 + g * 500 / 90;
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_4, (uint32_t)us * 16384 / 20000);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_4);
}

// ── Mạng ──
static EventGroupHandle_t s_ev;
static int s_sock = -1;
static SemaphoreHandle_t s_khoa_gui;
static struct sockaddr_in s_tram;
static bool s_biet_tram;
static int64_t s_lan_nhan_us;

static void su_kien_wifi(void *arg, esp_event_base_t base, int32_t id, void *data)
{
    if (base == WIFI_EVENT && (id == WIFI_EVENT_STA_START || id == WIFI_EVENT_STA_DISCONNECTED)) esp_wifi_connect();
    else if (base == IP_EVENT && id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *e = data;
        printf("WiFi: co IP " IPSTR "\n", IP2STR(&e->ip_info.ip));
        xEventGroupSetBits(s_ev, 1);
    }
}

bool robot_mang_mo(void)
{
    if (!CONFIG_ROBOT_WIFI_SSID[0]) {
        printf("Chua dat ten WiFi: idf.py menuconfig -> Robot (Phan 4) -> WiFi SSID / mat khau\n");
        return false;
    }
    esp_err_t e = nvs_flash_init();
    if (e == ESP_ERR_NVS_NO_FREE_PAGES || e == ESP_ERR_NVS_NEW_VERSION_FOUND) { nvs_flash_erase(); e = nvs_flash_init(); }
    ESP_ERROR_CHECK(e);
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    s_ev = xEventGroupCreate();
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, su_kien_wifi, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, su_kien_wifi, NULL));
    wifi_config_t wc = { 0 };
    strncpy((char *)wc.sta.ssid, CONFIG_ROBOT_WIFI_SSID, sizeof wc.sta.ssid);
    strncpy((char *)wc.sta.password, CONFIG_ROBOT_WIFI_PASS, sizeof wc.sta.password);
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wc));
    ESP_ERROR_CHECK(esp_wifi_start());
    // Tiết kiệm điện của WiFi làm gói đi trễ từng đợt ~100ms: tắt đi cho lệnh lái tới đều.
    esp_wifi_set_ps(WIFI_PS_NONE);
    if (!(xEventGroupWaitBits(s_ev, 1, false, true, pdMS_TO_TICKS(15000)) & 1)) {
        printf("WiFi: 15s chua vao duoc mang '%s'\n", CONFIG_ROBOT_WIFI_SSID);
        return false;
    }
    s_khoa_gui = xSemaphoreCreateMutex();
    s_sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    int co = 1;
    setsockopt(s_sock, SOL_SOCKET, SO_BROADCAST, &co, sizeof co);
    struct sockaddr_in a = { .sin_family = AF_INET, .sin_port = htons(CONG_ROBOT), .sin_addr.s_addr = htonl(INADDR_ANY) };
    bind(s_sock, (struct sockaddr *)&a, sizeof a);
    return true;
}

static void gui_toi(uint16_t cong, bool quang_ba, const void *b, int n)
{
    if (s_sock < 0) return;
    struct sockaddr_in d = s_tram;
    d.sin_port = htons(cong);
    if (quang_ba) { d.sin_family = AF_INET; d.sin_addr.s_addr = htonl(INADDR_BROADCAST); }
    xSemaphoreTake(s_khoa_gui, portMAX_DELAY);
    sendto(s_sock, b, n, 0, (struct sockaddr *)&d, sizeof d);
    xSemaphoreGive(s_khoa_gui);
}

// Chưa biết trạm thì phát quảng bá cả mạng; trạm gửi gói đầu tiên xong thì gửi thẳng tới trạm.
void tram_gui(const char *fmt, ...)
{
    char b[256];
    va_list ap;
    va_start(ap, fmt);
    int n = vsnprintf(b, sizeof b, fmt, ap);
    va_end(ap);
    if (n < 0) return;
    if (n >= (int)sizeof b) n = sizeof b - 1;
    gui_toi(CONG_TRAM, !s_biet_tram, b, n);
}

int tram_nhan(char *buf, int n)
{
    if (s_sock < 0) return 0;
    struct sockaddr_in tu;
    socklen_t l = sizeof tu;
    int r = recvfrom(s_sock, buf, n - 1, MSG_DONTWAIT, (struct sockaddr *)&tu, &l);
    if (r <= 0) return 0;
    buf[r] = 0;
    s_tram = tu;
    s_biet_tram = true;
    s_lan_nhan_us = esp_timer_get_time();
    return r;
}

int tram_im_lang_ms(void) { return s_biet_tram ? (int)((esp_timer_get_time() - s_lan_nhan_us) / 1000) : INT32_MAX; }
bool tram_da_biet(void) { return s_biet_tram; }

void tram_gui_lidar(const uint8_t *b, int n) { if (s_biet_tram) gui_toi(CONG_LIDAR, false, b, n); }

// ── Cảm biến của robot 17.1, đọc nền ──
static robot_cb_t s_cb = { .cm = -1 };
static SemaphoreHandle_t s_khoa_sa;

static void doc_cam_bien(void *arg)
{
    for (int i = 0;; i++) {
        xSemaphoreTake(s_khoa_sa, portMAX_DELAY);
        int us = sieu_am_us();
        xSemaphoreGive(s_khoa_sa);
        robot_cb_t c = s_cb;
        c.cm = us > 0 ? us / 58 : -1;
        c.va = gpio_get_level(CHAN_NUT) == 0;
        c.ir = gpio_get_level(CHAN_IR) == 0;
        if (i % 15 == 0) c.pin_mv = robot_pin_mv();
        s_cb = c;
        cho_ms(70);   // + thời gian đo: mỗi lần đo siêu âm cách nhau ≥ 60ms (14.3)
    }
}

void robot_cam_bien_mo(void)
{
    robot_adc_mo();
    sieu_am_mo();
    gpio_config_t vao = { .pin_bit_mask = 1ULL << CHAN_IR, .mode = GPIO_MODE_INPUT };
    gpio_config(&vao);
    gpio_config_t va = { .pin_bit_mask = 1ULL << CHAN_NUT, .mode = GPIO_MODE_INPUT, .pull_up_en = GPIO_PULLUP_ENABLE };
    gpio_config(&va);
    s_khoa_sa = xSemaphoreCreateMutex();
    s_cb.pin_mv = robot_pin_mv();
    xTaskCreate(doc_cam_bien, "cam_bien", 3072, NULL, 5, NULL);
}

robot_cb_t robot_cam_bien(void) { return s_cb; }

int robot_sieu_am_ngay(void)
{
    xSemaphoreTake(s_khoa_sa, portMAX_DELAY);
    cho_ms(60);                 // tiếng vọng của lần đo nền trước phải tắt hẳn
    int us = sieu_am_us();
    xSemaphoreGive(s_khoa_sa);
    return us > 0 ? us / 58 : -1;
}
