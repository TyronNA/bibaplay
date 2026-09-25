/* Giả lập mặt robot trên Mac (LVGL + SDL). Phần vẽ nằm ở firmware/boards/ares-bread/robot_face.c —
 * chung một file với firmware, sửa ở đó là cả hai cùng đổi.
 *   ./face                        cửa sổ phóng to x5, tự đổi cảm xúc mỗi 3 s, bấm chuột để đổi ngay
 *   ./face --shot a.bmp happy 400 chụp cảm xúc `happy` sau 400 ms chuyển từ neutral (ảnh phóng x4)
 *   ./face --sheet a.bmp          ghép tất cả cảm xúc thành 1 ảnh
 *   ./face --udp 9999             cửa sổ nhận lệnh qua UDP 127.0.0.1 (server/mac_device.py gửi):
 *                                 "emo <tên>" đổi cảm xúc, "title <chữ>" đổi tiêu đề cửa sổ
 *   thêm --device                 bố cục như trên chip: chừa 16 px trên cho thanh trạng thái xiaozhi */
#include "robot_face.h"
#include <arpa/inet.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define W 128
#define H 64

/* Khi chụp ảnh dùng đồng hồ giả (tăng tay) để mọi lần chạy ra cùng một hình. */
static int fake_clock;
static uint32_t fake_ms;
static uint32_t tick_cb(void)
{
    if(fake_clock) return fake_ms;
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint32_t)(ts.tv_sec * 1000 + ts.tv_nsec / 1000000);
}

/* ---------- xuất ảnh ---------- */

/* src = snapshot RGB888 (thứ tự byte B,G,R — trùng BMP). Phóng `s` lần kiểu nearest để thấy rõ từng điểm. */
static int device;          /* --device: bố cục + bảng màu như firmware */
static void blit(uint8_t * dst, int dst_w, int dx, int dy, lv_draw_buf_t * src, int s)
{
    for(int y = 0; y < H * s; y++)
        for(int x = 0; x < W * s; x++) {
            const uint8_t * p = src->data + (y / s) * src->header.stride + (x / s) * 3;
            uint8_t * o = dst + ((dy + y) * dst_w + dx + x) * 3;
            if(device) {       /* đúng luật esp_lvgl_port: kênh blue > 16 (RGB565) -> điểm OLED tắt */
                uint8_t on = (p[0] >> 3) > 16 ? 0 : 255;
                o[0] = o[1] = o[2] = on;
            } else memcpy(o, p, 3);
        }
}
static int count_gray(lv_draw_buf_t * b)
{
    int n = 0;
    for(int y = 0; y < H; y++)
        for(int x = 0; x < W * 3; x += 3) {
            const uint8_t * p = b->data + y * b->header.stride + x;
            n += !((p[0] == 0 && p[1] == 0 && p[2] == 0) || (p[0] == 255 && p[1] == 255 && p[2] == 255));
        }
    return n;
}
static int write_bmp(const char * path, const uint8_t * bgr, int w, int h)
{
    uint32_t row = w * 3, pad = (4 - row % 4) % 4, data_sz = (row + pad) * h;
    uint8_t hdr[54] = { 'B', 'M' };
    #define PUT32(o, v) do { hdr[o] = (v) & 0xff; hdr[o+1] = ((v) >> 8) & 0xff; hdr[o+2] = ((v) >> 16) & 0xff; hdr[o+3] = ((v) >> 24) & 0xff; } while(0)
    PUT32(2, 54 + data_sz); PUT32(10, 54); PUT32(14, 40); PUT32(18, w); PUT32(22, h);
    hdr[26] = 1; hdr[28] = 24; PUT32(34, data_sz);
    FILE * f = fopen(path, "wb");
    if(!f) return -1;
    fwrite(hdr, 1, 54, f);
    static const uint8_t zero[3] = { 0 };
    for(int y = h - 1; y >= 0; y--) {
        fwrite(bgr + y * row, 1, row, f);
        fwrite(zero, 1, pad, f);
    }
    fclose(f);
    return 0;
}
static void run_for(uint32_t ms)
{
    for(uint32_t end = fake_ms + ms; fake_ms < end; fake_ms += 10) lv_timer_handler();
    lv_refr_now(NULL);
}
static lv_draw_buf_t * snap(void)
{
    return lv_snapshot_take(lv_screen_active(), LV_COLOR_FORMAT_RGB888);
}

/* ---------- main ---------- */

static void dummy_flush(lv_display_t * d, const lv_area_t * a, uint8_t * px)
{
    LV_UNUSED(a); LV_UNUSED(px);
    lv_display_flush_ready(d);
}
static void next_emotion(void) { robot_face_set_index((robot_face_index() + 1) % robot_face_count(), false); }
static void click_cb(lv_event_t * e) { LV_UNUSED(e); next_emotion(); }
static void cycle_cb(lv_timer_t * t)
{
    next_emotion();
    lv_sdl_window_set_title(lv_timer_get_user_data(t), robot_face_name(robot_face_index()));
}
static int find_emo(const char * name)
{
    for(int i = 0; i < robot_face_count(); i++) if(strcmp(robot_face_name(i), name) == 0) return i;
    return -1;
}

int main(int argc, char ** argv)
{
    int sheet = argc >= 3 && strcmp(argv[1], "--sheet") == 0;
    int shot = argc >= 4 && strcmp(argv[1], "--shot") == 0;
    int udp_port = argc >= 3 && strcmp(argv[1], "--udp") == 0 ? atoi(argv[2]) : 0;
    device = strcmp(argv[argc - 1], "--device") == 0;
    if(device) argc--;
    srand(7);
    lv_init();

    lv_display_t * disp;
    static uint8_t buf[W * H * 2] __attribute__((aligned(64)));   /* lệch lề thì LVGL bỏ buffer im lặng */
    if(sheet || shot) {
        fake_clock = 1;
        lv_tick_set_cb(tick_cb);
        disp = lv_display_create(W, H);
        lv_display_set_buffers(disp, buf, NULL, sizeof(buf), LV_DISPLAY_RENDER_MODE_FULL);
        lv_display_set_flush_cb(disp, dummy_flush);
    } else {
        disp = lv_sdl_window_create(W, H);
        lv_sdl_window_set_zoom(disp, 5);
        lv_sdl_mouse_create();
    }
    /* OLED chỉ có điểm sáng/tắt: tắt khử răng cưa để giả lập không vẽ ra điểm xám "không có thật" */
    lv_display_set_antialiasing(disp, false);

    lv_obj_t * scr = lv_screen_active();
    /* firmware: nền màn trắng = điểm tắt (xem blit) */
    lv_obj_set_style_bg_color(scr, device ? lv_color_white() : lv_color_black(), 0);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, 0);
    /* trên chip 16 px trên cùng là thanh trạng thái của OledDisplay (wifi, "Standby"...) */
    if(device) robot_face_set_colors(lv_color_black(), lv_color_white());
    lv_obj_t * face = robot_face_create(scr, W, device ? H - 16 : H);
    lv_obj_set_y(face, device ? 16 : 0);
    lv_obj_add_event_cb(face, click_cb, LV_EVENT_CLICKED, NULL);

    if(sheet) {                            /* lưới 3 cột, mỗi ô phóng x3, viền xám 6 px */
        robot_face_set_blink(false);
        const int n = robot_face_count(), s = 3, g = 6, cols = 3, rows = (n + cols - 1) / cols;
        int sw = cols * (W * s + g) + g, sh = rows * (H * s + g) + g;
        uint8_t * out = malloc(sw * sh * 3);
        memset(out, 0x40, sw * sh * 3);
        int gray = 0;
        for(int i = 0; i < n; i++) {
            robot_face_set_index(i, true);
            fake_ms = 1100;                /* pha hoạt ảnh cố định: 3 chấm / 2 chữ Z đều đang hiện */
            run_for(10);
            lv_draw_buf_t * b = snap();
            int ng = count_gray(b);
            gray += ng;
            blit(out, sw, g + (i % cols) * (W * s + g), g + (i / cols) * (H * s + g), b, s);
            lv_draw_buf_destroy(b);
            printf("%d:%s(%d) ", i + 1, robot_face_name(i), ng);
        }
        printf("\nnon black/white px: %d\n", gray);
        return write_bmp(argv[2], out, sw, sh);
    }
    if(shot) {
        int i = find_emo(argv[3]);
        if(i < 0) { fprintf(stderr, "unknown emotion %s\n", argv[3]); return 1; }
        run_for(300);                      /* đứng yên ở neutral trước, rồi mới chuyển */
        robot_face_set_index(i, false);
        run_for(argc >= 5 ? atoi(argv[4]) : 600);
        lv_draw_buf_t * b = snap();
        uint8_t * out = malloc(W * 4 * H * 4 * 3);
        blit(out, W * 4, 0, 0, b, 4);
        printf("%s t=%u ms blink=%.2f non black/white px: %d\n", robot_face_name(i), fake_ms, robot_face_blink_level(), count_gray(b));
        return write_bmp(argv[2], out, W * 4, H * 4);
    }

    int sock = -1;
    if(udp_port) {
        sock = socket(AF_INET, SOCK_DGRAM, 0);
        struct sockaddr_in a = { .sin_family = AF_INET, .sin_port = htons(udp_port),
                                 .sin_addr.s_addr = htonl(INADDR_LOOPBACK) };
        if(sock < 0 || bind(sock, (struct sockaddr *)&a, sizeof(a)) != 0) {
            perror("udp bind");
            return 1;
        }
        fcntl(sock, F_SETFL, O_NONBLOCK);  /* đọc trong vòng lặp LVGL, không được chặn */
        lv_sdl_window_set_title(disp, "ARES");
    } else {
        lv_sdl_window_set_title(disp, robot_face_name(robot_face_index()));
        lv_timer_create(cycle_cb, 3000, disp);
    }
    while(1) {
        char msg[256];
        ssize_t n;
        while(sock >= 0 && (n = recv(sock, msg, sizeof(msg) - 1, 0)) > 0) {
            msg[n] = 0;
            if(strncmp(msg, "emo ", 4) == 0) robot_face_set_emotion(msg + 4);
            else if(strncmp(msg, "title ", 6) == 0) lv_sdl_window_set_title(disp, msg + 6);
        }
        uint32_t ms = lv_timer_handler();
        lv_sleep_ms(ms < 5 ? ms : 5);
    }
}
