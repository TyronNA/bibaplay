#include "wifi_board.h"
#include "codecs/no_audio_codec.h"
#include "robot_face_display.h"
#include "system_reset.h"
#include "application.h"
#include "button.h"
#include "config.h"
#include "mcp_server.h"
#include "led/single_led.h"
#include "assets/lang_config.h"

#include <esp_log.h>
#include <driver/i2c_master.h>
#include <esp_lcd_panel_ops.h>
#include <esp_lcd_panel_vendor.h>
#include <driver/ledc.h>
#include <esp_timer.h>
#include <cstdlib>


// Bread-compact-wifi 128x64 + mặt robot (RobotFaceDisplay). Đi dây giống hệt board gốc.
#define TAG "AresBreadBoard"

class AresBreadBoard : public WifiBoard {
private:
    i2c_master_bus_handle_t display_i2c_bus_;
    esp_lcd_panel_io_handle_t panel_io_ = nullptr;
    esp_lcd_panel_handle_t panel_ = nullptr;
    Display* display_ = nullptr;
    Button boot_button_;
    Button touch_button_;
    Button volume_up_button_;
    Button volume_down_button_;
    esp_timer_handle_t motor_stop_timer_ = nullptr;

    void InitializeDisplayI2c() {
        i2c_master_bus_config_t bus_config = {
            .i2c_port = (i2c_port_t)0,
            .sda_io_num = DISPLAY_SDA_PIN,
            .scl_io_num = DISPLAY_SCL_PIN,
            .clk_source = I2C_CLK_SRC_DEFAULT,
            .glitch_ignore_cnt = 7,
            .intr_priority = 0,
            .trans_queue_depth = 0,
            .flags = {
                .enable_internal_pullup = 1,
            },
        };
        ESP_ERROR_CHECK(i2c_new_master_bus(&bus_config, &display_i2c_bus_));
    }

    void InitializeSsd1306Display() {
        // SSD1306 config
        esp_lcd_panel_io_i2c_config_t io_config = {
            .dev_addr = 0x3C,
            .scl_speed_hz = 400 * 1000,
            .control_phase_bytes = 1,
            .dc_bit_offset = 6,
            .lcd_cmd_bits = 8,
            .lcd_param_bits = 8,
            .on_color_trans_done = nullptr,
            .user_ctx = nullptr,
            .flags = {
                .dc_low_on_data = 0,
                .disable_control_phase = 0,
            },
        };

        ESP_ERROR_CHECK(esp_lcd_new_panel_io_i2c(display_i2c_bus_, &io_config, &panel_io_));

        ESP_LOGI(TAG, "Install SSD1306 driver");
        esp_lcd_panel_dev_config_t panel_config = {};
        panel_config.reset_gpio_num = GPIO_NUM_NC;
        panel_config.bits_per_pixel = 1;

        esp_lcd_panel_ssd1306_config_t ssd1306_config = {
            .height = static_cast<uint8_t>(DISPLAY_HEIGHT),
        };
        panel_config.vendor_config = &ssd1306_config;

        ESP_ERROR_CHECK(esp_lcd_new_panel_ssd1306(panel_io_, &panel_config, &panel_));
        ESP_LOGI(TAG, "SSD1306 driver installed");

        // Reset the display
        ESP_ERROR_CHECK(esp_lcd_panel_reset(panel_));
        if (esp_lcd_panel_init(panel_) != ESP_OK) {
            ESP_LOGE(TAG, "Failed to initialize display");
            display_ = new NoDisplay();
            return;
        }
        ESP_ERROR_CHECK(esp_lcd_panel_invert_color(panel_, false));

        // Set the display to on
        ESP_LOGI(TAG, "Turning display on");
        ESP_ERROR_CHECK(esp_lcd_panel_disp_on_off(panel_, true));

        display_ = new RobotFaceDisplay(panel_io_, panel_, DISPLAY_WIDTH, DISPLAY_HEIGHT, DISPLAY_MIRROR_X, DISPLAY_MIRROR_Y);
    }

    void InitializeButtons() {
        boot_button_.OnClick([this]() {
            auto& app = Application::GetInstance();
            if (app.GetDeviceState() == kDeviceStateStarting) {
                EnterWifiConfigMode();
                return;
            }
            app.ToggleChatState();
        });
        touch_button_.OnPressDown([this]() {
            Application::GetInstance().StartListening();
        });
        touch_button_.OnPressUp([this]() {
            Application::GetInstance().StopListening();
        });

        volume_up_button_.OnClick([this]() {
            auto codec = GetAudioCodec();
            auto volume = codec->output_volume() + 10;
            if (volume > 100) {
                volume = 100;
            }
            codec->SetOutputVolume(volume);
            GetDisplay()->ShowNotification(Lang::Strings::VOLUME + std::to_string(volume));
        });

        volume_up_button_.OnLongPress([this]() {
            GetAudioCodec()->SetOutputVolume(100);
            GetDisplay()->ShowNotification(Lang::Strings::MAX_VOLUME);
        });

        volume_down_button_.OnClick([this]() {
            auto codec = GetAudioCodec();
            auto volume = codec->output_volume() - 10;
            if (volume < 0) {
                volume = 0;
            }
            codec->SetOutputVolume(volume);
            GetDisplay()->ShowNotification(Lang::Strings::VOLUME + std::to_string(volume));
        });

        volume_down_button_.OnLongPress([this]() {
            GetAudioCodec()->SetOutputVolume(0);
            GetDisplay()->ShowNotification(Lang::Strings::MUTED);
        });
    }

    // Bánh xe (bài 17.2): DRV8833 đi dây như bài 17.1 — motor A IN1/IN2, motor B IN1/IN2 (config.h).
    // PWM 20kHz (trên ngưỡng nghe), LEDC timer 3 + kênh 4–7 để khỏi đụng phần khác của xiaozhi.
    // Chiều quay: xung ở IN1 + IN2 = 0 là tiến (bảng DRV8833, fast decay); đổi vai 2 chân là lùi.
    void InitializeMotors() {
        ledc_timer_config_t t = {};
        t.speed_mode = LEDC_LOW_SPEED_MODE;
        t.duty_resolution = LEDC_TIMER_10_BIT;
        t.timer_num = LEDC_TIMER_3;
        t.freq_hz = 20000;
        t.clk_cfg = LEDC_AUTO_CLK;
        ESP_ERROR_CHECK(ledc_timer_config(&t));
        const gpio_num_t chan[4] = {MOTOR_A_IN1_GPIO, MOTOR_A_IN2_GPIO, MOTOR_B_IN1_GPIO, MOTOR_B_IN2_GPIO};
        for (int i = 0; i < 4; i++) {
            ledc_channel_config_t c = {};
            c.gpio_num = chan[i];
            c.speed_mode = LEDC_LOW_SPEED_MODE;
            c.channel = (ledc_channel_t)(LEDC_CHANNEL_4 + i);
            c.timer_sel = LEDC_TIMER_3;
            c.duty = 0;
            ESP_ERROR_CHECK(ledc_channel_config(&c));
        }
        esp_timer_create_args_t args = {};
        args.callback = [](void*) { SetMotors(0, 0); };
        args.name = "motor_stop";
        ESP_ERROR_CHECK(esp_timer_create(&args, &motor_stop_timer_));
    }

    // a, b: −100..100 (%, âm = lùi). Chạy được từ callback esp_timer: chỉ đổi duty, không cấp phát gì.
    static void SetMotors(int a, int b) {
        const int v[2] = {a, b};
        for (int m = 0; m < 2; m++) {
            uint32_t duty = (uint32_t)(abs(v[m]) * 1023 / 100);
            ledc_channel_t in1 = (ledc_channel_t)(LEDC_CHANNEL_4 + 2 * m), in2 = (ledc_channel_t)(LEDC_CHANNEL_5 + 2 * m);
            ledc_set_duty(LEDC_LOW_SPEED_MODE, in1, v[m] > 0 ? duty : 0);
            ledc_set_duty(LEDC_LOW_SPEED_MODE, in2, v[m] < 0 ? duty : 0);
            ledc_update_duty(LEDC_LOW_SPEED_MODE, in1);
            ledc_update_duty(LEDC_LOW_SPEED_MODE, in2);
        }
    }

    // Tool chạy trên luồng chính của xiaozhi (McpServer gọi qua Schedule): không được chờ hết đoạn chạy,
    // nên bật motor rồi hẹn esp_timer tự tắt. Giới hạn 70% (pack 8.4V → ~5.9V, motor TT định mức 6V) và 3 giây:
    // model nghe nhầm thì robot cũng chỉ đi một đoạn ngắn.
    void InitializeTools() {
        auto& mcp = McpServer::GetInstance();
        mcp.AddTool("self.robot.move",
            "Cho robot bánh xe chạy một đoạn ngắn rồi tự dừng. huong: tien | lui | trai | phai (trai/phai = quay tại chỗ). "
            "toc_do: phần trăm 0-70. thoi_gian_ms: 100-3000. Chỉ gọi khi người dùng yêu cầu di chuyển rõ ràng.",
            PropertyList({
                Property("huong", kPropertyTypeString),
                Property("toc_do", kPropertyTypeInteger, 50, 0, 70),
                Property("thoi_gian_ms", kPropertyTypeInteger, 800, 100, 3000),
            }),
            [this](const PropertyList& p) -> ToolResult {
                std::string h = p["huong"].value<std::string>();
                int v = p["toc_do"].value<int>(), ms = p["thoi_gian_ms"].value<int>();
                int a, b;
                if (h == "tien") { a = v; b = v; }
                else if (h == "lui") { a = -v; b = -v; }
                else if (h == "trai") { a = -v; b = v; }
                else if (h == "phai") { a = v; b = -v; }
                else return std::unexpected("huong phai la tien, lui, trai hoac phai");
                esp_timer_stop(motor_stop_timer_);   // lệnh mới thay lệnh cũ; timer chưa chạy thì trả lỗi, bỏ qua
                SetMotors(a, b);
                esp_timer_start_once(motor_stop_timer_, (uint64_t)ms * 1000);
                ESP_LOGI(TAG, "move %s %d%% %dms", h.c_str(), v, ms);
                return true;
            });
        mcp.AddTool("self.robot.stop", "Dừng bánh xe ngay lập tức.", PropertyList(),
            [this](const PropertyList&) -> ToolResult {
                esp_timer_stop(motor_stop_timer_);
                SetMotors(0, 0);
                return true;
            });
    }

public:
    AresBreadBoard() :
        boot_button_(BOOT_BUTTON_GPIO),
        touch_button_(TOUCH_BUTTON_GPIO),
        volume_up_button_(VOLUME_UP_BUTTON_GPIO),
        volume_down_button_(VOLUME_DOWN_BUTTON_GPIO) {
        InitializeDisplayI2c();
        InitializeSsd1306Display();
        InitializeButtons();
        InitializeMotors();
        InitializeTools();
    }

    virtual Led* GetLed() override {
        static SingleLed led(BUILTIN_LED_GPIO);
        return &led;
    }

    virtual AudioCodec* GetAudioCodec() override {
        static NoAudioCodecSimplex audio_codec(AUDIO_INPUT_SAMPLE_RATE, AUDIO_OUTPUT_SAMPLE_RATE,
            AUDIO_I2S_SPK_GPIO_BCLK, AUDIO_I2S_SPK_GPIO_LRCK, AUDIO_I2S_SPK_GPIO_DOUT, AUDIO_I2S_MIC_GPIO_SCK, AUDIO_I2S_MIC_GPIO_WS, AUDIO_I2S_MIC_GPIO_DIN);
        return &audio_codec;
    }

    virtual Display* GetDisplay() override {
        return display_;
    }
};

DECLARE_BOARD(AresBreadBoard);
