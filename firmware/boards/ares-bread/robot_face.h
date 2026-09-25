/* Mặt robot đơn sắc cho OLED 128x64 — chỉ phụ thuộc LVGL, dùng chung cho firmware và
 * bản giả lập sandbox/robot-face. Một mặt duy nhất (state tĩnh), không thread-safe:
 * trên firmware gọi trong DisplayLockGuard. */
#pragma once

#ifdef ESP_PLATFORM
#include <lvgl.h>
#else
#include "lvgl/lvgl.h"
#endif
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Tạo object mặt w x h (thiết kế cho 128 x 48..64; mắt tự canh giữa theo h). */
lv_obj_t * robot_face_create(lv_obj_t * parent, int32_t w, int32_t h);
/* Tên theo chuỗi server gửi (neutral, happy, sad...). Tên lạ -> neutral, trả false. */
bool robot_face_set_emotion(const char * name);
/* instant: nhảy thẳng tới hình đích, không trôi — dùng khi chụp ảnh. */
void robot_face_set_index(int i, bool instant);
void robot_face_set_blink(bool on);
/* Màu điểm sáng / nền. Mặc định trắng / đen. Gọi trước robot_face_create. */
void robot_face_set_colors(lv_color_t lit, lv_color_t off);
int robot_face_count(void);
const char * robot_face_name(int i);
int robot_face_index(void);
float robot_face_blink_level(void);

#ifdef __cplusplus
}
#endif
