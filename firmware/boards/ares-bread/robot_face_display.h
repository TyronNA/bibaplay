#ifndef ROBOT_FACE_DISPLAY_H
#define ROBOT_FACE_DISPLAY_H

#include "display/oled_display.h"
#include "robot_face.h"

// Giữ nguyên UI OLED của xiaozhi (thanh trạng thái 16 px trên cùng: wifi, "Standby", thông báo)
// và phủ mặt robot lên vùng nội dung 48 px bên dưới, thay cho icon emoji.
class RobotFaceDisplay : public OledDisplay {
public:
    using OledDisplay::OledDisplay;

    void SetupUI() override {
        if (face_ != nullptr) {
            return;
        }
        OledDisplay::SetupUI();
        DisplayLockGuard lock(this);
        // esp_lvgl_port (_lvgl_port_transform_monochrome) bật điểm OLED khi màu TỐI, tắt khi sáng —
        // nên trên chip phải vẽ mắt màu đen trên nền trắng thì mới ra mắt sáng trên nền tắt.
        robot_face_set_colors(lv_color_black(), lv_color_white());
        face_ = robot_face_create(lv_screen_active(), width_, height_ - kStatusBarHeight);
        lv_obj_set_y(face_, kStatusBarHeight);
        // Ngay trên container nội dung (index 0), dưới thanh trạng thái và popup pin yếu —
        // chúng được OledDisplay tạo sau nên phải đẩy mặt xuống, không thì mặt che mất.
        lv_obj_move_to_index(face_, 1);
    }

    // Gọi từ nhiều task (xử lý JSON từ server, state machine) -> phải khoá LVGL.
    void SetEmotion(const char* emotion) override {
        DisplayLockGuard lock(this);
        if (face_ != nullptr) {
            robot_face_set_emotion(emotion);
        }
    }

private:
    static constexpr int kStatusBarHeight = 16;  // chiều cao top_bar_ trong OledDisplay::SetupUI_128x64
    lv_obj_t* face_ = nullptr;
};

#endif  // ROBOT_FACE_DISPLAY_H
