/*
 * Sensor panel 800x480 — bản giả lập LVGL trên máy tính.
 * Cùng code UI này chạy được trên ESP32-S3; chỉ phần tạo display/indev ở main() là khác.
 *
 *   ./panel                 mở cửa sổ SDL (bấm được tab bar bằng chuột)
 *   ./panel --shot out.bmp  chạy ~1.5s không cửa sổ rồi chụp màn hình ra BMP
 *   ./panel --bench 10 [nofan]  chạy 10s không cửa sổ, in heap LVGL + lượng pixel phải vẽ lại
 *   thêm --demo ở cuối để dùng số giả thay vì đọc máy Mac đang chạy
 */
#include "lvgl/lvgl.h"
#include "sensors.h"
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define W 800
#define H 480

/* ---------- bảng màu ---------- */
#define C_BG        lv_color_hex(0x070d1a)
#define C_PANEL     lv_color_hex(0x0c1830)
#define C_LINE      lv_color_hex(0x1d3358)
#define C_TEXT      lv_color_hex(0xe6ecf5)
#define C_DIM       lv_color_hex(0x7f93b3)
#define C_BLUE      lv_color_hex(0x2f8cff)
#define C_CYAN      lv_color_hex(0x3cf0ff)
#define C_ORANGE    lv_color_hex(0xff7a1a)
#define C_RED       lv_color_hex(0xff3b4e)
#define C_YELLOW    lv_color_hex(0xffc21a)
#define C_ARMOR     lv_color_hex(0xd8dde6)
#define C_SHADE     lv_color_hex(0x9aa3b3)
#define C_FRAME     lv_color_hex(0x2a3345)

/* ---------- dữ liệu ---------- */
static sensors_t S;
static int live;

static void sensors_demo_init(void)
{
    S = (sensors_t){
        .source = "DEMO", .cpu_name = "RYZEN 9 9950X", .gpu_name = "RTX 5070 Ti", .ram_name = "32 GB DDR5",
        .disk_name = "C:", .cpu_power_key = "POWER", .fan_name = { "CPU FAN", "AIO PUMP", "CASE FAN" },
        .cpu_temp = 52, .cpu_usage = 24, .cpu_clock = 5.1f, .cpu_power = 85,
        .gpu_temp = 57, .gpu_usage = 60, .gpu_clock = 2750, .gpu_power = 210, .vram = 7.4f, .vram_total = 16,
        .ram_used = 13.2f, .ram_total = 32, .disk_used = 612, .disk_total = 2000,
        .fan_rpm = { 980, 2450, 860 }, .net_up = 12.4f, .net_down = 86.7f, .room_temp = 28,
    };
}

static float walk(float v, float lo, float hi, float step)
{
    v += ((float)rand() / RAND_MAX - 0.5f) * 2 * step;
    return v < lo ? lo : v > hi ? hi : v;
}

static void sensors_tick(void)
{
    if(live) {
        sensors_mac_read(&S);
        return;
    }
    S.cpu_usage = walk(S.cpu_usage, 5, 100, 8);
    S.cpu_temp  = walk(S.cpu_temp + (35 + S.cpu_usage * 0.5f - S.cpu_temp) * 0.2f, 30, 95, 1);
    S.cpu_clock = walk(S.cpu_clock, 3.6f, 5.7f, 0.15f);
    S.cpu_power = 30 + S.cpu_usage * 1.4f;
    S.gpu_usage = walk(S.gpu_usage, 0, 100, 10);
    S.gpu_temp  = walk(S.gpu_temp + (38 + S.gpu_usage * 0.4f - S.gpu_temp) * 0.2f, 30, 90, 1);
    S.gpu_clock = walk(S.gpu_clock, 2200, 2900, 40);
    S.gpu_power = 40 + S.gpu_usage * 2.5f;
    S.vram      = walk(S.vram, 2, 15.5f, 0.3f);
    S.ram_used  = walk(S.ram_used, 8, 30, 0.4f);
    S.fan_rpm[0] = 600 + S.cpu_temp * 8;
    S.fan_rpm[1] = walk(S.fan_rpm[1], 2300, 2600, 30);
    S.fan_rpm[2] = 500 + S.gpu_temp * 6;
    S.net_up    = walk(S.net_up, 0.1f, 40, 3);
    S.net_down  = walk(S.net_down, 1, 300, 20);
    S.room_temp = walk(S.room_temp, 26, 31, 0.1f);
}

/* ---------- helper vẽ ---------- */
typedef struct { int16_t x, y; } pt_t;

/* Đa giác lồi -> cắt thành tam giác hình quạt. Chỉ đúng với đa giác LỒI. */
static void fill_poly(lv_layer_t * layer, const lv_area_t * o, const pt_t * p, int n, lv_color_t c)
{
    lv_draw_triangle_dsc_t d;
    lv_draw_triangle_dsc_init(&d);
    d.color = c;
    for(int i = 1; i + 1 < n; i++) {
        d.p[0].x = o->x1 + p[0].x;     d.p[0].y = o->y1 + p[0].y;
        d.p[1].x = o->x1 + p[i].x;     d.p[1].y = o->y1 + p[i].y;
        d.p[2].x = o->x1 + p[i + 1].x; d.p[2].y = o->y1 + p[i + 1].y;
        lv_draw_triangle(layer, &d);
    }
    /* Mỗi tam giác tự khử răng cưa mép, nên đường chéo chung giữa 2 tam giác lộ thành vệt mảnh:
     * kẻ đè một đường cùng màu lên các đường chéo đó. */
    lv_draw_line_dsc_t l;
    lv_draw_line_dsc_init(&l);
    l.color = c;
    l.width = 2;
    for(int i = 2; i + 1 < n; i++) {
        l.p1.x = o->x1 + p[0].x; l.p1.y = o->y1 + p[0].y;
        l.p2.x = o->x1 + p[i].x; l.p2.y = o->y1 + p[i].y;
        lv_draw_line(layer, &l);
    }
}

static void fill_rect(lv_layer_t * layer, const lv_area_t * o, int x1, int y1, int x2, int y2,
                      lv_color_t c, int radius, int glow)
{
    lv_draw_rect_dsc_t d;
    lv_draw_rect_dsc_init(&d);
    d.bg_color = c;
    d.radius = radius;
    if(glow) {
        d.shadow_color = c;
        d.shadow_width = glow;
        d.shadow_opa = LV_OPA_80;
    }
    lv_area_t a = { o->x1 + x1, o->y1 + y1, o->x1 + x2, o->y1 + y2 };
    lv_draw_rect(layer, &d, &a);
}

static void line(lv_layer_t * layer, const lv_area_t * o, int x1, int y1, int x2, int y2,
                 lv_color_t c, int w, lv_opa_t opa)
{
    lv_draw_line_dsc_t d;
    lv_draw_line_dsc_init(&d);
    d.color = c;
    d.width = w;
    d.opa = opa;
    d.p1.x = o->x1 + x1; d.p1.y = o->y1 + y1;
    d.p2.x = o->x1 + x2; d.p2.y = o->y1 + y2;
    lv_draw_line(layer, &d);
}

/* ---------- robot (thiết kế nguyên bản, nhìn chéo 3/4, nằm sau các card) ----------
 * Ghép từ các khối 3 mặt (trước / bên phải / trên) theo một vector chiều sâu cố định, cho hợp style khối đúc.
 * Toạ độ vẽ trong khung gốc ~420x446 rồi phóng qua G(): đổi cỡ/vị trí robot chỉ cần sửa 5 hằng dưới.
 * Trên sản phẩm thật phần tĩnh nên là ảnh nền, chỉ mắt + lõi ngực mới vẽ lại mỗi khung. */
#define G_AX 215.0f   /* điểm neo trong khung gốc (giữa đầu) */
#define G_AY 120.0f
#define G_TX 404.0f   /* điểm neo đặt ở đâu trên màn hình */
#define G_TY 170.0f
#define G_S  1.38f
#define DX 16         /* vector chiều sâu: lùi về sau = sang phải + lên trên */
#define DY (-9)

typedef struct { float x, y; } fp_t;
typedef struct { float px, py, ang, s; } xf_t;   /* xoay quanh (px,py) góc ang (rad), phóng s lần */

static fp_t G(fp_t p) { return (fp_t){ (p.x - G_AX) * G_S + G_TX, (p.y - G_AY) * G_S + G_TY }; }

static fp_t xf(fp_t p, xf_t t)
{
    float dx = (p.x - t.px) * t.s, dy = (p.y - t.py) * t.s, c = cosf(t.ang), s = sinf(t.ang);
    return (fp_t){ t.px + dx * c - dy * s, t.py + dx * s + dy * c };
}

static void face(lv_layer_t * L, const lv_area_t * o, const fp_t * f, int n, lv_color_t c)
{
    pt_t p[16];
    for(int i = 0; i < n; i++) {
        fp_t g = G(f[i]);
        p[i] = (pt_t){ (int16_t)lroundf(g.x), (int16_t)lroundf(g.y) };
    }
    fill_poly(L, o, p, n, c);
}

static void rrect(lv_layer_t * L, const lv_area_t * o, float x1, float y1, float x2, float y2,
                  lv_color_t c, int radius, int glow)
{
    fp_t a = G((fp_t){ x1, y1 }), b = G((fp_t){ x2, y2 });
    fill_rect(L, o, (int)a.x, (int)a.y, (int)b.x, (int)b.y, c, (int)(radius * G_S), (int)(glow * G_S));
}

static void rline(lv_layer_t * L, const lv_area_t * o, float x1, float y1, float x2, float y2,
                  lv_color_t c, int w, lv_opa_t opa)
{
    fp_t a = G((fp_t){ x1, y1 }), b = G((fp_t){ x2, y2 });
    line(L, o, (int)a.x, (int)a.y, (int)b.x, (int)b.y, c, (int)(w * G_S + 0.5f), opa);
}

/* f = 4 đỉnh mặt trước theo chiều kim đồng hồ bắt đầu từ trên-trái */
static void box3d(lv_layer_t * L, const lv_area_t * o, const fp_t f[4], lv_color_t c, float dx, float dy)
{
    fp_t side[4] = { f[1], { f[1].x + dx, f[1].y + dy }, { f[2].x + dx, f[2].y + dy }, f[2] };
    fp_t top[4] = { f[0], { f[0].x + dx, f[0].y + dy }, { f[1].x + dx, f[1].y + dy }, f[1] };
    face(L, o, side, 4, lv_color_darken(c, LV_OPA_40));
    face(L, o, top, 4, lv_color_lighten(c, LV_OPA_30));
    face(L, o, f, 4, c);
}

static void box3(lv_layer_t * L, const lv_area_t * o, const fp_t f[4], lv_color_t c) { box3d(L, o, f, c, DX, DY); }

#define Q(x1, y1, x2, y2, x3, y3, x4, y4) (const fp_t[4]){ { x1, y1 }, { x2, y2 }, { x3, y3 }, { x4, y4 } }
#define T(x1, y1, x2, y2, x3, y3) (const fp_t[3]){ { x1, y1 }, { x2, y2 }, { x3, y3 } }

static void box3x(lv_layer_t * L, const lv_area_t * o, const fp_t f[4], lv_color_t c, const xf_t * t, int nt)
{
    fp_t g[4];
    for(int i = 0; i < 4; i++) {
        g[i] = f[i];
        for(int k = 0; k < nt; k++) g[i] = xf(g[i], t[k]);
    }
    box3(L, o, g, c);
}

#define C_NAVY   lv_color_hex(0x1f5fd6)
#define C_STEEL  lv_color_hex(0xb8c0cc)
#define C_GUN    lv_color_hex(0x3a4356)

/* trạng thái chuyển động, tính từ thời gian */
static struct { float blink, pulse; } R;

static void robot_pose(uint32_t ms)
{
    uint32_t b = ms % 4200;
    R.blink = b < 90 ? 1 - b / 90.0f : b < 180 ? (b - 90) / 90.0f : 1;   /* 1 = mở, 0 = nhắm */
    R.pulse = 0.5f + 0.5f * sinf(ms / 1000.0f * 3.0f);
}

/* mắt: khe xếch mảnh, đầu trong thấp hơn đầu ngoài; chớp = ép độ dày về 0 */
static void eye(lv_layer_t * L, const lv_area_t * o, float xo, float yo, float xi, float yi)
{
    if(R.blink < 0.15f) {
        rline(L, o, xo, yo, xi, yi, C_CYAN, 1, LV_OPA_COVER);
        return;
    }
    float h = 2.6f * R.blink;
    float x1 = xo < xi ? xo : xi, x2 = xo < xi ? xi : xo;
    rrect(L, o, x1 + 3, (yo + yi) / 2 - 1, x2 - 3, (yo + yi) / 2 + 1, C_CYAN, 2, 10);
    fp_t p[4];
    if(xo < xi) { p[0] = (fp_t){ xo, yo - h }; p[1] = (fp_t){ xi, yi - h }; p[2] = (fp_t){ xi, yi + h }; p[3] = (fp_t){ xo, yo + h }; }
    else        { p[0] = (fp_t){ xi, yi - h }; p[1] = (fp_t){ xo, yo - h }; p[2] = (fp_t){ xo, yo + h }; p[3] = (fp_t){ xi, yi + h }; }
    face(L, o, p, 4, lv_color_hex(0xbffcff));
}

static void robot_draw_cb(lv_event_t * e)
{
    lv_obj_t * obj = lv_event_get_current_target(e);
    lv_layer_t * L = lv_event_get_layer(e);
    lv_area_t o;
    lv_obj_get_coords(obj, &o);

    /* lưới kỹ thuật (toạ độ màn hình, không phóng) */
    for(int y = 16; y < H; y += 30) line(L, &o, 0, y, W, y, C_LINE, 1, LV_OPA_40);
    for(int x = 10; x < W; x += 30) line(L, &o, x, 0, x, H, C_LINE, 1, LV_OPA_40);

    /* Mặt bên của mọi khối lộ ra phía PHẢI màn hình => robot xoay cho nửa phải tiến về người xem:
     * tay/vai bên phải màn hình là phía GẦN (vẽ sau thân), bên trái là phía XA (vẽ trước thân, bị thân che). */
    /* tay + vai xa (trái màn hình), buông dọc sau thân */
    box3(L, &o, Q(98, 228, 134, 228, 132, 310, 100, 310), C_STEEL);
    box3(L, &o, Q(90, 310, 140, 310, 144, 392, 86, 392), C_NAVY);
    box3(L, &o, Q(88, 336, 142, 336, 142, 350, 88, 350), C_YELLOW);
    box3(L, &o, Q(84, 392, 146, 392, 148, 436, 82, 436), C_ARMOR);
    box3(L, &o, Q(84, 164, 148, 160, 150, 228, 86, 232), C_ARMOR);
    face(L, &o, Q(84, 178, 148, 174, 148, 186, 84, 190), 4, C_RED);

    /* hông + váy giáp */
    box3(L, &o, Q(150, 382, 282, 382, 276, 446, 156, 446), C_ARMOR);
    face(L, &o, Q(150, 390, 200, 390, 196, 446, 150, 446), 4, C_RED);
    box3(L, &o, Q(166, 334, 268, 334, 262, 382, 172, 382), C_FRAME);
    face(L, &o, Q(200, 340, 234, 340, 230, 378, 204, 378), 4, C_YELLOW);
    /* bụng */
    box3(L, &o, Q(172, 296, 262, 296, 258, 336, 176, 336), C_GUN);
    for(int i = 0; i < 3; i++) rline(L, &o, 180, 306 + i * 10, 254, 306 + i * 10, C_SHADE, 2, LV_OPA_COVER);

    /* ngực */
    box3(L, &o, Q(124, 170, 304, 170, 288, 300, 140, 300), C_NAVY);
    face(L, &o, Q(142, 186, 230, 186, 224, 262, 152, 268), 4, C_ARMOR);
    face(L, &o, Q(238, 186, 294, 186, 284, 262, 234, 262), 4, C_STEEL);
    face(L, &o, Q(142, 186, 170, 186, 160, 204, 142, 204), 4, C_RED);
    for(int i = 0; i < 4; i++) face(L, &o, Q(170, 206 + i * 12, 216, 206 + i * 12, 215, 212 + i * 12, 170, 212 + i * 12), 4, C_FRAME);
    for(int i = 0; i < 3; i++) face(L, &o, Q(244, 200 + i * 16, 282, 200 + i * 16, 279, 210 + i * 16, 242, 210 + i * 16), 4, C_YELLOW);
    rline(L, &o, 144, 272, 230, 266, C_CYAN, 1, LV_OPA_70);
    rline(L, &o, 234, 266, 284, 266, C_CYAN, 1, LV_OPA_70);
    rrect(L, &o, 200, 274, 222, 292, C_CYAN, 4, 6 + (int)(R.pulse * 14));
    face(L, &o, Q(211, 268, 226, 283, 211, 298, 196, 283), 4, C_FRAME);
    face(L, &o, Q(211, 273, 221, 283, 211, 293, 201, 283), 4, C_CYAN);

    /* cổ (sẽ bị cổ giáp che gần hết) */
    box3(L, &o, Q(196, 138, 232, 138, 232, 162, 196, 162), C_FRAME);

    /* đầu: mũ to, ngồi thấp vào cổ giáp */
    box3(L, &o, Q(160, 96, 170, 96, 170, 128, 160, 128), C_GUN);              /* tai gần */
    rrect(L, &o, 162, 106, 168, 116, C_ORANGE, 2, 5);
    face(L, &o, Q(207, 70, 221, 70, 219, 16, 213, 14), 4, C_RED);             /* mào giữa */
    face(L, &o, Q(215, 70, 221, 70, 219, 16, 216, 15), 4, lv_color_darken(C_RED, LV_OPA_40));
    face(L, &o, T(174, 72, 188, 70, 166, 48), 3, C_YELLOW);                   /* vây cảm biến */
    face(L, &o, T(240, 70, 254, 72, 262, 46), 3, C_YELLOW);
    box3(L, &o, Q(170, 68, 256, 68, 258, 140, 172, 144), C_ARMOR);
    face(L, &o, Q(202, 72, 226, 72, 222, 84, 206, 84), 4, C_RED);             /* chevron trán */
    /* hốc mắt tối + gờ trán cùng màu mũ, nhọn xuống giữa */
    face(L, &o, Q(178, 94, 250, 92, 250, 124, 178, 126), 4, lv_color_hex(0x0b0f18));
    face(L, &o, Q(176, 88, 214, 108, 184, 102, 176, 98), 4, C_ARMOR);
    face(L, &o, Q(214, 108, 252, 86, 252, 96, 244, 100), 4, C_ARMOR);
    face(L, &o, Q(176, 84, 252, 82, 252, 88, 176, 90), 4, C_ARMOR);
    eye(L, &o, 186, 108, 209, 115);
    eye(L, &o, 244, 106, 220, 115);
    /* miếng che má + mặt nạ khe ngang */
    face(L, &o, Q(170, 118, 188, 120, 192, 156, 176, 152), 4, C_STEEL);
    face(L, &o, Q(238, 120, 258, 116, 254, 150, 234, 156), 4, C_STEEL);
    face(L, &o, Q(188, 126, 240, 126, 232, 158, 196, 158), 4, C_STEEL);
    face(L, &o, Q(188, 126, 240, 126, 238, 130, 190, 130), 4, C_SHADE);
    for(int i = 0; i < 3; i++) {
        face(L, &o, Q(196 + i * 2, 134 + i * 7, 211, 134 + i * 7, 211, 138 + i * 7, 197 + i * 2, 138 + i * 7), 4, C_FRAME);
        face(L, &o, Q(217, 134 + i * 7, 232 - i * 2, 134 + i * 7, 231 - i * 2, 138 + i * 7, 217, 138 + i * 7), 4, C_FRAME);
    }

    /* cổ giáp: đè lên chân hàm để đầu "ngồi" vào thân */
    box3(L, &o, Q(170, 150, 258, 150, 250, 176, 178, 176), C_ARMOR);
    face(L, &o, Q(206, 150, 222, 150, 220, 176, 208, 176), 4, C_RED);


    /* tay + vai gần (phải màn hình): vẽ sau cùng, to hơn, mặt bên dày chĩa ra ngoài */
    box3(L, &o, Q(300, 236, 334, 236, 332, 318, 302, 318), C_STEEL);
    box3(L, &o, Q(294, 318, 340, 318, 342, 398, 292, 398), C_NAVY);
    box3(L, &o, Q(292, 344, 342, 344, 342, 358, 292, 358), C_YELLOW);
    box3(L, &o, Q(290, 398, 344, 398, 342, 438, 292, 438), C_ARMOR);
    box3d(L, &o, Q(270, 154, 342, 156, 344, 232, 272, 236), C_ARMOR, 22, -13);
    face(L, &o, Q(270, 170, 342, 172, 342, 184, 270, 182), 4, C_RED);
    face(L, &o, Q(282, 204, 332, 206, 332, 212, 282, 210), 4, C_FRAME);
    face(L, &o, Q(282, 214, 332, 216, 332, 222, 282, 220), 4, C_FRAME);
}

static lv_obj_t * robot;
static uint32_t robot_t0;   /* nhịp chớp tính từ lúc tạo robot, để --shot chụp trúng pha mong muốn */

/* Chỉ invalidate vùng có chuyển động (toạ độ khung gốc, qua G) — không vẽ lại cả robot và các card đè lên. */
static void robot_anim_cb(lv_timer_t * t)
{
    LV_UNUSED(t);
    robot_pose(lv_tick_elaps(robot_t0));
    static const lv_area_t moving[] = {
        { 176, 98, 252, 124 },   /* mắt */
        { 188, 262, 236, 304 },  /* lõi ngực (tính cả quầng sáng) */
    };
    for(unsigned i = 0; i < sizeof(moving) / sizeof(moving[0]); i++) {
        fp_t a = G((fp_t){ moving[i].x1, moving[i].y1 }), b = G((fp_t){ moving[i].x2, moving[i].y2 });
        lv_area_t r = { (int32_t)a.x - 2, (int32_t)a.y - 2, (int32_t)b.x + 2, (int32_t)b.y + 2 };
        lv_obj_invalidate_area(robot, &r);
    }
}

/* ---------- quạt quay ---------- */
typedef struct { lv_obj_t * obj; float angle; int idx; lv_obj_t * rpm_label; } fan_t;
static fan_t fans[3];
static int fan_anim = 1;

static void fan_draw_cb(lv_event_t * e)
{
    lv_obj_t * obj = lv_event_get_current_target(e);
    fan_t * f = lv_obj_get_user_data(obj);
    lv_layer_t * L = lv_event_get_layer(e);
    lv_area_t o;
    lv_obj_get_coords(obj, &o);
    int cx = lv_area_get_width(&o) / 2, cy = lv_area_get_height(&o) / 2, r = cx - 3;
    lv_color_t col = f->idx == 2 ? C_RED : f->idx == 1 ? C_TEXT : C_BLUE;

    lv_draw_arc_dsc_t a;
    lv_draw_arc_dsc_init(&a);
    a.center.x = o.x1 + cx; a.center.y = o.y1 + cy;
    a.radius = r; a.width = 3; a.start_angle = 0; a.end_angle = 360; a.color = col;
    lv_draw_arc(L, &a);

    for(int b = 0; b < 5; b++) {
        float t = (f->angle + b * 72) * (float)M_PI / 180;
        float t2 = t + 0.9f;
        int rr = r - 6;
        pt_t p[3] = {
            { cx, cy },
            { (int16_t)(cx + cosf(t) * rr), (int16_t)(cy + sinf(t) * rr) },
            { (int16_t)(cx + cosf(t2) * rr * 0.8f), (int16_t)(cy + sinf(t2) * rr * 0.8f) },
        };
        fill_poly(L, &o, p, 3, col);
    }
    fill_rect(L, &o, cx - 5, cy - 5, cx + 5, cy + 5, C_PANEL, 5, 0);
}

static void fan_anim_cb(lv_timer_t * t)
{
    LV_UNUSED(t);
    for(int i = 0; i < 3; i++) {
        if(!isnan(S.fan_rpm[i])) fans[i].angle = fmodf(fans[i].angle + S.fan_rpm[i] / 100.0f, 360);
        lv_obj_invalidate(fans[i].obj);
    }
}

/* ---------- khung khối đúc, góc cắt chéo ---------- */
#define DEPTH  5   /* độ dày mặt bên của khối, lệch xuống-phải */
#define BORDER 3

typedef struct { lv_color_t accent; int16_t plate_w; uint8_t tab; } block_t;
static block_t blocks[24];
static int nblocks;

/* Bát giác cắt chéo 45°: s = góc trên-trái & dưới-phải, b = góc trên-phải & dưới-trái (so le cho khỏi đều đều). */
static void chamfer(pt_t * p, int x1, int y1, int x2, int y2, int s, int b)
{
    const pt_t q[8] = { { x1 + s, y1 }, { x2 - b, y1 }, { x2, y1 + b }, { x2, y2 - s },
                        { x2 - s, y2 }, { x1 + b, y2 }, { x1, y2 - b }, { x1, y1 + s } };
    memcpy(p, q, sizeof(q));
}

/* vạch gạch chéo "////" */
static void stripes(lv_layer_t * L, const lv_area_t * o, int x, int y, int n, int hgt, lv_color_t c)
{
    for(int i = 0; i < n; i++) {
        int x0 = x + i * 9;
        pt_t p[4] = { { x0 + hgt / 2 + 1, y }, { x0 + hgt / 2 + 5, y }, { x0 + 4, y + hgt }, { x0, y + hgt } };
        fill_poly(L, o, p, 4, c);
    }
}

static void block_draw_cb(lv_event_t * e)
{
    lv_obj_t * obj = lv_event_get_current_target(e);
    block_t * b = lv_event_get_user_data(e);
    lv_layer_t * L = lv_event_get_layer(e);
    lv_area_t o;
    lv_obj_get_coords(obj, &o);
    int w = lv_area_get_width(&o) - 1 - DEPTH, h = lv_area_get_height(&o) - 1 - DEPTH;
    int sc = b->tab ? 6 : 8, bc = b->tab ? 12 : 18;
    int on = b->tab && lv_obj_has_state(obj, LV_STATE_CHECKED);
    pt_t p[8];

    /* mặt bên: xếp chồng DEPTH lớp lệch dần, lấp kín cả chỗ góc cắt */
    lv_color_t side = lv_color_darken(b->accent, LV_OPA_60);
    for(int k = DEPTH; k >= 1; k--) {
        chamfer(p, k, k, w + k, h + k, sc, bc);
        fill_poly(L, &o, p, 8, side);
    }
    chamfer(p, 0, 0, w, h, sc, bc);
    fill_poly(L, &o, p, 8, b->accent);
    chamfer(p, BORDER, BORDER, w - BORDER, h - BORDER, sc - 1, bc - 1);
    fill_poly(L, &o, p, 8, on ? lv_color_darken(b->accent, LV_OPA_30) : C_PANEL);
    /* gờ sáng mép trên cho cảm giác khối nổi */
    line(L, &o, sc + 1, 1, w - bc - 1, 1, lv_color_lighten(b->accent, LV_OPA_60), 2, LV_OPA_COVER);

    if(b->plate_w) {
        int pw = b->plate_w, ph = 22;
        pt_t plate[5] = { { BORDER + sc - 1, BORDER }, { pw, BORDER }, { pw - ph / 2, BORDER + ph },
                          { BORDER, BORDER + ph }, { BORDER, BORDER + sc - 1 } };
        fill_poly(L, &o, plate, 5, b->accent);
        int room = (w - bc - 8 - (pw + 2)) / 9;
        stripes(L, &o, pw + 2, BORDER + 4, room < 3 ? (room > 0 ? room : 0) : 3, ph - 8, b->accent);
    }
    if(!b->tab) stripes(L, &o, w - sc - 40, h - BORDER - 10, 3, 6, side);
}

static block_t * block_style(lv_obj_t * o, lv_color_t accent, int tab)
{
    block_t * b = &blocks[nblocks++];
    LV_ASSERT(nblocks <= (int)(sizeof(blocks) / sizeof(blocks[0])));
    b->accent = accent;
    b->tab = tab;
    b->plate_w = 0;
    lv_obj_add_event_cb(o, block_draw_cb, LV_EVENT_DRAW_MAIN, b);
    return b;
}

/* chữ trên nền màu: sáng thì chữ tối, tối thì chữ trắng */
static lv_color_t ink_on(lv_color_t c) { return lv_color_luminance(c) > 160 ? C_BG : C_TEXT; }

static lv_obj_t * card(lv_obj_t * parent, int x, int y, int w, int h, lv_color_t accent, const char * title)
{
    lv_obj_t * c = lv_obj_create(parent);
    lv_obj_remove_style_all(c);
    lv_obj_set_pos(c, x, y);
    lv_obj_set_size(c, w, h);
    lv_obj_remove_flag(c, LV_OBJ_FLAG_SCROLLABLE);
    block_t * b = block_style(c, accent, 0);

    if(title) {
        lv_obj_t * t = lv_label_create(c);
        lv_label_set_text(t, title);
        lv_obj_set_style_text_font(t, &lv_font_montserrat_16, 0);
        lv_obj_set_style_text_color(t, ink_on(accent), 0);
        lv_obj_set_pos(t, BORDER + 9, BORDER + 3);
        lv_point_t sz;
        lv_text_get_size(&sz, title, &lv_font_montserrat_16, 0, 0, LV_COORD_MAX, LV_TEXT_FLAG_NONE);
        b->plate_w = BORDER + 9 + sz.x + 20;
    }
    return c;
}

/* dòng chữ nhỏ góc trên-phải của card (tên linh kiện) */
static lv_obj_t * card_sub(lv_obj_t * c, const char * s)
{
    lv_obj_t * l = lv_label_create(c);
    lv_label_set_text(l, s);
    lv_obj_set_style_text_font(l, &lv_font_montserrat_12, 0);
    lv_obj_set_style_text_color(l, C_DIM, 0);
    lv_obj_align(l, LV_ALIGN_TOP_RIGHT, -(DEPTH + 22), BORDER + 7);
    return l;
}

static lv_obj_t * text(lv_obj_t * parent, int x, int y, const lv_font_t * font, lv_color_t col, const char * s)
{
    lv_obj_t * l = lv_label_create(parent);
    lv_label_set_text(l, s);
    lv_obj_set_style_text_font(l, font, 0);
    lv_obj_set_style_text_color(l, col, 0);
    lv_obj_set_pos(l, x, y);
    return l;
}

typedef struct { lv_obj_t * arc, * center; } gauge_t;

static gauge_t gauge(lv_obj_t * parent, int x, int y, int size, lv_color_t col)
{
    gauge_t g;
    g.arc = lv_arc_create(parent);
    lv_obj_set_size(g.arc, size, size);
    lv_obj_set_pos(g.arc, x, y);
    lv_arc_set_rotation(g.arc, 135);
    lv_arc_set_bg_angles(g.arc, 0, 270);
    lv_arc_set_range(g.arc, 0, 100);
    lv_obj_remove_style(g.arc, NULL, LV_PART_KNOB);
    lv_obj_remove_flag(g.arc, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_set_style_arc_width(g.arc, 8, LV_PART_MAIN);
    lv_obj_set_style_arc_width(g.arc, 8, LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(g.arc, C_LINE, LV_PART_MAIN);
    lv_obj_set_style_arc_color(g.arc, col, LV_PART_INDICATOR);
    lv_obj_set_style_arc_rounded(g.arc, false, LV_PART_MAIN);
    lv_obj_set_style_arc_rounded(g.arc, false, LV_PART_INDICATOR);

    g.center = lv_label_create(g.arc);
    lv_obj_set_style_text_font(g.center, &lv_font_montserrat_20, 0);
    lv_obj_set_style_text_color(g.center, C_TEXT, 0);
    lv_obj_center(g.center);
    return g;
}

/* hàng "KEY   value" bên phải gauge */
static lv_obj_t * kv(lv_obj_t * parent, int x, int y, const char * key)
{
    lv_obj_t * k = text(parent, x, y + 2, &lv_font_montserrat_12, C_DIM, key);
    lv_obj_t * v = text(parent, x + 56, y, &lv_font_montserrat_16, C_TEXT, "");
    lv_obj_set_user_data(v, k);
    return v;
}

/* ---------- widget cần cập nhật ---------- */
static gauge_t g_cpu, g_gpu, g_ram;
static lv_obj_t * l_cpu_use, * l_cpu_clk, * l_cpu_pw;
static lv_obj_t * l_gpu_use, * l_gpu_clk, * l_gpu_vram, * l_gpu_pw;
static lv_obj_t * l_ram_used, * l_ram_speed;
static lv_obj_t * l_date, * l_clock, * l_disk, * b_disk, * l_disk_pct;
static lv_obj_t * l_up, * l_down, * l_room;

static lv_color_t temp_color(float t, lv_color_t normal)
{
    return t >= 85 ? C_RED : t >= 75 ? C_ORANGE : normal;
}

static void num(lv_obj_t * l, const char * fmt, float v)
{
    if(isnan(v)) lv_label_set_text(l, "--");
    else lv_label_set_text_fmt(l, fmt, v);
}

static void temp_gauge(gauge_t * g, float t, lv_color_t normal)
{
    lv_arc_set_value(g->arc, isnan(t) ? 0 : (int)t);
    lv_obj_set_style_arc_color(g->arc, temp_color(t, normal), LV_PART_INDICATOR);
    num(g->center, "%.0f°C", t);
}

static void update_cb(lv_timer_t * t)
{
    LV_UNUSED(t);
    sensors_tick();

    temp_gauge(&g_cpu, S.cpu_temp, C_BLUE);
    num(l_cpu_use, "%.0f %%", S.cpu_usage);
    num(l_cpu_clk, "%.1f GHz", S.cpu_clock);
    num(l_cpu_pw, S.cpu_power < 10 ? "%.1f W" : "%.0f W", S.cpu_power);   /* Apple Silicon hay dưới 10 W */
    lv_obj_t * pw_key = lv_obj_get_user_data(l_cpu_pw);
    if(strcmp(lv_label_get_text(pw_key), S.cpu_power_key)) lv_label_set_text(pw_key, S.cpu_power_key);

    temp_gauge(&g_gpu, S.gpu_temp, C_RED);
    num(l_gpu_use, "%.0f %%", S.gpu_usage);
    num(l_gpu_clk, "%.0f MHz", S.gpu_clock);
    if(isnan(S.vram)) lv_label_set_text(l_gpu_vram, "--");
    else lv_label_set_text_fmt(l_gpu_vram, "%.1f / %.0f GB", S.vram, S.vram_total);
    num(l_gpu_pw, S.gpu_power < 10 ? "%.1f W" : "%.0f W", S.gpu_power);

    int ram_pct = S.ram_total > 0 ? (int)(S.ram_used * 100 / S.ram_total) : 0;
    lv_arc_set_value(g_ram.arc, ram_pct);
    lv_label_set_text_fmt(g_ram.center, "%d%%", ram_pct);
    lv_label_set_text_fmt(l_ram_used, "%.1f / %.0f GB", S.ram_used, S.ram_total);
    num(l_ram_speed, "%.0f MHz", live ? NAN : 6000);

    int disk_pct = S.disk_total > 0 ? (int)(S.disk_used * 100 / S.disk_total) : 0;
    lv_label_set_text_fmt(l_disk, "%s  %.0f / %.0f GB", S.disk_name, S.disk_used, S.disk_total);
    lv_bar_set_value(b_disk, disk_pct, LV_ANIM_ON);
    lv_label_set_text_fmt(l_disk_pct, "%d%%", disk_pct);

    for(int i = 0; i < 3; i++) {
        if(isnan(S.fan_rpm[i])) lv_label_set_text(fans[i].rpm_label, "N/A");
        else lv_label_set_text_fmt(fans[i].rpm_label, "%.0f RPM", S.fan_rpm[i]);
    }
    lv_label_set_text_fmt(l_up, LV_SYMBOL_UP " %.1f Mbps", S.net_up);
    lv_label_set_text_fmt(l_down, LV_SYMBOL_DOWN " %.1f Mbps", S.net_down);
    num(l_room, "%.0f°C", S.room_temp);

    time_t now = time(NULL);
    struct tm * tm = localtime(&now);
    static const char * wd[] = { "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT" };
    lv_label_set_text_fmt(l_date, "%04d/%02d/%02d  %s", tm->tm_year + 1900, tm->tm_mon + 1, tm->tm_mday, wd[tm->tm_wday]);
    lv_label_set_text_fmt(l_clock, "%02d:%02d", tm->tm_hour, tm->tm_min);
}

/* ---------- tab bar ---------- */
static lv_obj_t * tabs[6];
static lv_obj_t * toast;

static void tab_click_cb(lv_event_t * e)
{
    lv_obj_t * btn = lv_event_get_current_target(e);
    for(int i = 0; i < 6; i++) {
        lv_obj_remove_state(tabs[i], LV_STATE_CHECKED);
        lv_obj_invalidate(tabs[i]);   /* đã bỏ style, đổi state không tự vẽ lại */
    }
    lv_obj_add_state(btn, LV_STATE_CHECKED);
    int idx = (int)(intptr_t)lv_event_get_user_data(e);
    if(idx == 0) lv_obj_add_flag(toast, LV_OBJ_FLAG_HIDDEN);
    else lv_obj_remove_flag(toast, LV_OBJ_FLAG_HIDDEN);
}

static void build_ui(void)
{
    lv_obj_t * scr = lv_screen_active();
    lv_obj_set_style_bg_color(scr, C_BG, 0);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, 0);
    lv_obj_remove_flag(scr, LV_OBJ_FLAG_SCROLLABLE);

    /* robot giữa màn hình, vẽ trước để các card đè lên */
    robot = lv_obj_create(scr);
    lv_obj_remove_style_all(robot);
    lv_obj_set_size(robot, W, H);
    lv_obj_set_pos(robot, 0, 0);
    robot_t0 = lv_tick_get();
    robot_pose(0);
    lv_obj_add_event_cb(robot, robot_draw_cb, LV_EVENT_DRAW_MAIN, NULL);

    /* header */
    text(scr, 14, 8, &lv_font_montserrat_28, C_TEXT, "O.D.C.");
    text(scr, 14, 40, &lv_font_montserrat_12, C_DIM, "ORBITAL DEFENSE CORPS");
    text(scr, 288, 8, &lv_font_montserrat_28, C_TEXT, "ARES-07");
    text(scr, 290, 40, &lv_font_montserrat_12, C_DIM, "HEAVY RECON FRAME");

    /* CPU */
    lv_obj_t * c = card(scr, 8, 62, 262, 118, C_BLUE, "CPU");
    card_sub(c, S.cpu_name);
    g_cpu = gauge(c, 8, 32, 80, C_BLUE);
    l_cpu_use = kv(c, 100, 34, "USAGE");
    l_cpu_clk = kv(c, 100, 60, "CLOCK");
    l_cpu_pw  = kv(c, 100, 86, S.cpu_power_key);

    /* GPU */
    c = card(scr, 8, 186, 262, 124, C_RED, "GPU");
    card_sub(c, S.gpu_name);
    g_gpu = gauge(c, 8, 34, 80, C_RED);
    l_gpu_use  = kv(c, 100, 26, "USAGE");
    l_gpu_clk  = kv(c, 100, 49, "CLOCK");
    l_gpu_vram = kv(c, 100, 72, "VRAM");
    l_gpu_pw   = kv(c, 100, 95, "POWER");

    /* RAM */
    c = card(scr, 8, 316, 262, 104, C_YELLOW, "RAM");
    card_sub(c, S.ram_name);
    g_ram = gauge(c, 10, 28, 70, C_YELLOW);
    l_ram_used  = kv(c, 100, 38, "USED");
    l_ram_speed = kv(c, 100, 66, "SPEED");

    /* đồng hồ */
    c = card(scr, 530, 8, 262, 92, C_RED, NULL);
    l_date  = text(c, 14, 10, &lv_font_montserrat_16, C_TEXT, "");
    l_clock = text(c, 12, 30, &lv_font_montserrat_48, C_TEXT, "");
    lv_obj_t * st = text(c, 166, 38, &lv_font_montserrat_16, C_BG, "");
    lv_label_set_text_fmt(st, " %s ", S.source);
    lv_obj_set_style_bg_color(st, live ? C_YELLOW : C_ORANGE, 0);
    lv_obj_set_style_bg_opa(st, LV_OPA_COVER, 0);
    text(c, 150, 62, &lv_font_montserrat_12, C_DIM, "SYSTEM ONLINE");

    /* ổ đĩa */
    c = card(scr, 530, 106, 262, 78, C_BLUE, "STORAGE");
    l_disk = text(c, 12, 32, &lv_font_montserrat_16, C_TEXT, "");
    b_disk = lv_bar_create(c);
    lv_obj_set_size(b_disk, 186, 10);
    lv_obj_set_pos(b_disk, 12, 58);
    lv_obj_set_style_bg_color(b_disk, C_LINE, 0);
    lv_obj_set_style_bg_opa(b_disk, LV_OPA_COVER, 0);
    lv_obj_set_style_bg_color(b_disk, C_BLUE, LV_PART_INDICATOR);
    lv_obj_set_style_radius(b_disk, 0, 0);
    lv_obj_set_style_radius(b_disk, 0, LV_PART_INDICATOR);
    l_disk_pct = text(c, 206, 50, &lv_font_montserrat_16, C_TEXT, "");

    /* quạt */
    c = card(scr, 530, 190, 262, 120, C_YELLOW, "FAN");
    for(int i = 0; i < 3; i++) {
        fans[i].idx = i;
        fans[i].obj = lv_obj_create(c);
        lv_obj_remove_style_all(fans[i].obj);
        lv_obj_set_size(fans[i].obj, 50, 50);
        lv_obj_set_pos(fans[i].obj, 22 + i * 78, 30);
        lv_obj_set_user_data(fans[i].obj, &fans[i]);
        lv_obj_add_event_cb(fans[i].obj, fan_draw_cb, LV_EVENT_DRAW_MAIN, NULL);
        text(c, 18 + i * 78, 82, &lv_font_montserrat_12, C_DIM, S.fan_name[i][0] ? S.fan_name[i] : "--");
        fans[i].rpm_label = text(c, 18 + i * 78, 96, &lv_font_montserrat_12, C_TEXT, "");
    }

    /* mạng + nhiệt độ phòng */
    c = card(scr, 530, 316, 150, 104, C_BLUE, "NETWORK");
    text(c, 12, 44, &lv_font_montserrat_28, C_CYAN, LV_SYMBOL_WIFI);
    l_up   = text(c, 52, 42, &lv_font_montserrat_12, C_TEXT, "");
    l_down = text(c, 52, 62, &lv_font_montserrat_12, C_TEXT, "");
    c = card(scr, 686, 316, 106, 104, C_RED, "ROOM");
    text(c, 12, 32, &lv_font_montserrat_12, C_DIM, "TEMP");
    l_room = text(c, 12, 48, &lv_font_montserrat_28, C_TEXT, "");

    /* tab bar */
    static const char * names[] = {
        LV_SYMBOL_HOME "\nHOME", LV_SYMBOL_LIST "\nSYSTEM", LV_SYMBOL_REFRESH "\nFAN",
        LV_SYMBOL_IMAGE "\nRGB", LV_SYMBOL_PLAY "\nGAME", LV_SYMBOL_SETTINGS "\nSETTING",
    };
    for(int i = 0; i < 6; i++) {
        lv_obj_t * b = lv_button_create(scr);
        tabs[i] = b;
        lv_obj_remove_style_all(b);
        lv_obj_set_size(b, 126, 50);
        lv_obj_set_pos(b, 8 + i * 131, 426);
        block_style(b, C_BLUE, 1);
        lv_obj_t * l = lv_label_create(b);
        lv_label_set_text(l, names[i]);
        lv_obj_set_style_text_align(l, LV_TEXT_ALIGN_CENTER, 0);
        lv_obj_set_style_text_font(l, &lv_font_montserrat_12, 0);
        lv_obj_set_style_text_color(l, C_TEXT, 0);
        lv_obj_align(l, LV_ALIGN_CENTER, -DEPTH / 2, -DEPTH / 2);
        lv_obj_add_event_cb(b, tab_click_cb, LV_EVENT_CLICKED, (void *)(intptr_t)i);
    }
    lv_obj_add_state(tabs[0], LV_STATE_CHECKED);

    toast = text(scr, 0, 0, &lv_font_montserrat_16, C_TEXT, "  Tab nay chua lam - demo chi co HOME  ");
    lv_obj_set_style_bg_color(toast, C_ORANGE, 0);
    lv_obj_set_style_bg_opa(toast, LV_OPA_COVER, 0);
    lv_obj_set_style_pad_ver(toast, 6, 0);
    lv_obj_align(toast, LV_ALIGN_BOTTOM_MID, 0, -62);
    lv_obj_add_flag(toast, LV_OBJ_FLAG_HIDDEN);

    update_cb(NULL);
    lv_timer_create(update_cb, 500, NULL);
    if(fan_anim) {
        lv_timer_create(fan_anim_cb, 33, NULL);
        lv_timer_create(robot_anim_cb, 40, NULL);
    }
}

/* ---------- chế độ chụp màn hình (không cần cửa sổ) ---------- */
static uint32_t now_ms(void)
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint32_t)(ts.tv_sec * 1000 + ts.tv_nsec / 1000000);
}

static uint64_t now_us(void)
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint64_t)ts.tv_sec * 1000000 + ts.tv_nsec / 1000;
}

static struct {
    uint64_t px, render_us, t0;
    uint32_t frames, render_max_us, flushes;
} st;

static void dummy_flush(lv_display_t * d, const lv_area_t * a, uint8_t * px)
{
    LV_UNUSED(px);
    st.px += (uint64_t)lv_area_get_size(a);
    st.flushes++;
    lv_display_flush_ready(d);
}

static void render_evt_cb(lv_event_t * e)
{
    if(lv_event_get_code(e) == LV_EVENT_RENDER_START) {
        st.t0 = now_us();
        return;
    }
    uint32_t dt = (uint32_t)(now_us() - st.t0);
    st.frames++;
    st.render_us += dt;
    if(dt > st.render_max_us) st.render_max_us = dt;
}

/* LVGL RGB888 lưu theo thứ tự byte B,G,R — trùng với BMP 24-bit, ghi thẳng được. */
static int write_bmp(const char * path, lv_draw_buf_t * buf)
{
    uint32_t w = buf->header.w, h = buf->header.h, row = w * 3, pad = (4 - row % 4) % 4;
    uint32_t data_sz = (row + pad) * h, file_sz = 54 + data_sz;
    uint8_t hdr[54] = { 'B', 'M' };
    #define PUT32(o, v) do { hdr[o] = (v) & 0xff; hdr[o+1] = ((v) >> 8) & 0xff; hdr[o+2] = ((v) >> 16) & 0xff; hdr[o+3] = ((v) >> 24) & 0xff; } while(0)
    PUT32(2, file_sz); PUT32(10, 54); PUT32(14, 40); PUT32(18, w); PUT32(22, h);
    hdr[26] = 1; hdr[28] = 24; PUT32(34, data_sz);
    FILE * f = fopen(path, "wb");
    if(!f) return -1;
    fwrite(hdr, 1, 54, f);
    static const uint8_t zero[3] = { 0 };
    for(int y = (int)h - 1; y >= 0; y--) {
        fwrite(buf->data + y * buf->header.stride, 1, row, f);
        fwrite(zero, 1, pad, f);
    }
    fclose(f);
    return 0;
}

int main(int argc, char ** argv)
{
    const char * shot = (argc >= 3 && strcmp(argv[1], "--shot") == 0) ? argv[2] : NULL;
    int bench_s = (argc >= 3 && strcmp(argv[1], "--bench") == 0) ? atoi(argv[2]) : 0;
    if(bench_s && argc >= 4 && strcmp(argv[3], "nofan") == 0) fan_anim = 0;
    srand(42);
    live = strcmp(argv[argc - 1], "--demo") != 0;
#ifdef __APPLE__
    if(live) live = sensors_mac_init(&S) == 0;
#else
    live = 0;
#endif
    if(!live) sensors_demo_init();
    lv_init();

    /* Bộ đệm vẽ 40 dòng, nằm ngoài heap LVGL. Phải căn lề theo LV_DRAW_BUF_ALIGN: lệch thì
     * lv_display_set_buffers() bỏ qua im lặng (log tắt) và màn hình không bao giờ được vẽ. */
    static uint8_t buf[W * 40 * 2] __attribute__((aligned(64)));
    if(shot || bench_s) {
        lv_tick_set_cb(now_ms);
        lv_display_t * d = lv_display_create(W, H);
        lv_display_set_buffers(d, buf, NULL, sizeof(buf), LV_DISPLAY_RENDER_MODE_PARTIAL);
        lv_display_set_flush_cb(d, dummy_flush);
        lv_display_add_event_cb(d, render_evt_cb, LV_EVENT_RENDER_START, NULL);
        lv_display_add_event_cb(d, render_evt_cb, LV_EVENT_RENDER_READY, NULL);
    } else {
        lv_sdl_window_create(W, H);
        lv_sdl_mouse_create();
    }

    build_ui();

    uint32_t limit = shot ? (argc >= 4 && argv[3][0] != '-' ? (uint32_t)atoi(argv[3]) : 1500) : (uint32_t)bench_s * 1000;
    uint32_t start = now_ms();
    uint64_t first_px = 0;
    uint32_t first_frames = 0;
    while(1) {
        uint32_t ms = lv_timer_handler();
        /* khung đầu vẽ cả màn hình, tách riêng để số trung bình phản ánh lúc chạy ổn định */
        if(!first_frames && st.frames) { first_px = st.px; first_frames = st.frames; st.px = 0; st.frames = 0; st.render_us = 0; st.render_max_us = 0; start = now_ms(); }
        if((shot || bench_s) && now_ms() - start > limit) break;
        lv_sleep_ms(ms < 5 ? ms : 5);
    }

    if(bench_s) {
        lv_mem_monitor_t m;
        lv_mem_monitor(&m);
        double secs = (now_ms() - start) / 1000.0;
        printf("fan animation      : %s\n", fan_anim ? "on" : "off");
        printf("first frame        : %llu px (full screen = %d)\n", (unsigned long long)first_px, W * H);
        printf("frames rendered    : %u in %.1fs (%.1f/s)\n", st.frames, secs, st.frames / secs);
        printf("pixels redrawn     : %.0f px/s = %.2f screens/s = %.2f MB/s @RGB565\n",
               st.px / secs, st.px / secs / (W * H), st.px / secs * 2 / 1e6);
        printf("render time (Mac)  : avg %.2f ms, max %.2f ms\n",
               st.frames ? st.render_us / 1000.0 / st.frames : 0, st.render_max_us / 1000.0);
        printf("LVGL heap          : used %zu B, peak %zu B, frag %u%%\n",
               m.total_size - m.free_size, m.max_used, m.frag_pct);
        printf("draw buffer        : %zu B (static)\n", sizeof(buf));
        return 0;
    }

    /* --robot-only: chụp riêng robot, không có card đè lên — để soi hình */
    int robot_only = 0;
    for(int i = 1; i < argc; i++) robot_only |= strcmp(argv[i], "--robot-only") == 0;
    lv_draw_buf_t * img = lv_snapshot_take(robot_only ? robot : lv_screen_active(), LV_COLOR_FORMAT_RGB888);
    if(!img || write_bmp(shot, img) != 0) {
        fprintf(stderr, "snapshot failed\n");
        return 1;
    }
    lv_draw_buf_destroy(img);
    printf("wrote %s (robot t=%u ms, blink=%.2f)\n", shot, lv_tick_elaps(robot_t0), R.blink);
    return 0;
}
