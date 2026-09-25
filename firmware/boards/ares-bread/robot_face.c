#include "robot_face.h"

#include <math.h>
#include <stdlib.h>
#include <string.h>

/* Một mắt = khối sáng bo góc, bị 2 "mí" màu nền gọt bớt:
 *   lid_in / lid_out: mí trên che xuống bao nhiêu px ở góc phía mũi / phía ngoài (nghiêng = giận, buồn)
 *   lid_bot: mí dưới hình vòm khoét lên bao nhiêu px (khoét sâu = mắt cười ^ ^)
 * Toạ độ y trong bảng thiết kế cho vùng cao 64; vùng thấp hơn thì dịch cả mặt lên (DESIGN_H). */
typedef struct { float x, y, w, h, r, lid_in, lid_out, lid_bot; } eye_t;
typedef struct { eye_t e[2]; float lx, ly; } face_t;
enum { X_NONE, X_THINK, X_SLEEP };
typedef struct { const char * name; face_t f; int extra, saccade, blink; } emo_t;

#define DESIGN_H 64
#define EYE(x, y, w, h, r, li, lo, lb) { x, y, w, h, r, li, lo, lb }
#define L_(...) EYE(40, __VA_ARGS__)
#define R_(...) EYE(88, __VA_ARGS__)

static const emo_t EMO[] = {
    { "neutral",   { { L_(32, 30, 34,  8,  0,  0,  0), R_(32, 30, 34,  8,  0,  0,  0) },  0,  0 }, X_NONE,  1, 1 },
    { "happy",     { { L_(30, 32, 30, 12,  0,  0, 17), R_(30, 32, 30, 12,  0,  0, 17) },  0, -2 }, X_NONE,  0, 0 },
    { "sad",       { { L_(34, 30, 26,  8,  2, 14,  0), R_(34, 30, 26,  8,  2, 14,  0) },  0,  3 }, X_NONE,  0, 1 },
    { "angry",     { { L_(33, 30, 30,  6, 15,  2,  0), R_(33, 30, 30,  6, 15,  2,  0) },  0,  0 }, X_NONE,  0, 1 },
    { "surprised", { { L_(31, 34, 38, 17,  0,  0,  0), R_(31, 34, 38, 17,  0,  0,  0) },  0, -1 }, X_NONE,  0, 0 },
    { "thinking",  { { L_(32, 28, 30,  8,  6,  6,  0), R_(32, 28, 30,  8,  6,  6,  0) },  8, -7 }, X_THINK, 0, 1 },
    { "sleepy",    { { L_(34, 30, 28,  8, 18, 18,  0), R_(34, 30, 28,  8, 18, 18,  0) },  0,  2 }, X_SLEEP, 0, 0 },
    { "winking",   { { L_(32, 30, 34,  8,  0,  0,  0), R_(30, 32, 30, 12,  0,  0, 17) },  0,  0 }, X_NONE,  0, 0 },
    { "confused",  { { L_(33, 26, 26,  8,  0,  0,  0), R_(31, 30, 34,  8, 12,  0,  0) }, -4,  0 }, X_NONE,  0, 1 },
};
#define N_EMO ((int)(sizeof(EMO) / sizeof(EMO[0])))

static lv_obj_t * face_obj;
static face_t cur;          /* đang vẽ — trôi dần về EMO[emo].f mỗi khung */
static int emo;
static float blink = 1;     /* 1 = mở, 0 = nhắm */
static float sx, sy, sx_t, sy_t;       /* liếc mắt (saccade): vị trí hiện tại / đích */
static uint32_t next_blink, next_saccade, blink_t0;
static bool blink_on = true;

static uint32_t rnd(uint32_t lo, uint32_t hi) { return lo + (uint32_t)rand() % (hi - lo + 1); }

/* ---------- vẽ (1-bit) ---------- */

static lv_color_t LIT = { 0xff, 0xff, 0xff }, OFF = { 0, 0, 0 };
static int32_t X0, Y0;      /* góc trên-trái object, cộng vào mọi toạ độ khi vẽ */

static void rect(lv_layer_t * L, float x1, float y1, float x2, float y2, lv_color_t c)
{
    lv_draw_rect_dsc_t d;
    lv_draw_rect_dsc_init(&d);
    d.bg_color = c;
    lv_area_t a = { X0 + lroundf(x1), Y0 + lroundf(y1), X0 + lroundf(x2), Y0 + lroundf(y2) };
    lv_draw_rect(L, &d, &a);
}
/* Khối bo góc 1-bit: tô từng hàng, góc tính bằng hình tròn bán kính r. Không dùng d.radius vì
 * LVGL luôn khử răng cưa góc bo (bỏ qua lv_display_set_antialiasing) -> ra điểm xám. */
static void rrect(lv_layer_t * L, float x1, float y1, float x2, float y2, float r, lv_color_t c)
{
    int ya = lroundf(y1), yb = lroundf(y2);
    float hw = (x2 - x1 + 1) / 2, hh = (yb - ya + 1) / 2.0f;
    if(r > hw) r = hw;
    if(r > hh) r = hh;
    for(int y = ya; y <= yb; y++) {
        float dy = 0, yc = y + 0.5f;
        if(yc < ya + r) dy = ya + r - yc;
        else if(yc > yb + 1 - r) dy = yc - (yb + 1 - r);
        float in = dy > 0 ? r - sqrtf(r * r - dy * dy) : 0;
        rect(L, x1 + in, y, x2 - in, y, c);
    }
}
/* Bresenham: lv_draw_line khử răng cưa đường chéo, OLED 1-bit không hiện được */
static void line(lv_layer_t * L, int x1, int y1, int x2, int y2)
{
    int dx = abs(x2 - x1), dy = -abs(y2 - y1), sx_ = x1 < x2 ? 1 : -1, sy_ = y1 < y2 ? 1 : -1, err = dx + dy;
    for(;;) {
        rect(L, x1, y1, x1, y1, LIT);
        if(x1 == x2 && y1 == y2) break;
        int e2 = 2 * err;
        if(e2 >= dy) { err += dy; x1 += sx_; }
        if(e2 <= dx) { err += dx; y1 += sy_; }
    }
}

/* inner_right: góc phía mũi nằm bên phải (mắt trái màn hình) hay bên trái */
static void draw_eye(lv_layer_t * L, const eye_t * e, float ox, float oy, float k, int inner_right)
{
    float h = e->h * k;
    if(h < 2) h = 2;                       /* nhắm hẳn vẫn còn vạch 2 px, nhìn như mí mắt */
    float cx = e->x + ox, cy = e->y + oy;
    float x1 = cx - e->w / 2, x2 = cx + e->w / 2 - 1, y1 = cy - h / 2, y2 = cy + h / 2 - 1;
    float r = e->r < h / 2 ? e->r : h / 2;
    rrect(L, x1, y1, x2, y2, r, LIT);

    float li = e->lid_in * k, lo = e->lid_out * k;
    if(li > 0.5f || lo > 0.5f) {
        /* mí trên cạnh nghiêng: tô từng cột 1 px. lv_draw_triangle vẫn khử răng cưa dù đã tắt
         * ở display -> ra điểm xám. */
        float dl = inner_right ? lo : li, dr = inner_right ? li : lo;
        for(int x = lroundf(x1); x <= lroundf(x2); x++) {
            float d = dl + (dr - dl) * (x - x1) / (x2 - x1);
            if(d > 0.5f) rect(L, x, y1 - 1, x, y1 + d - 1, OFF);
        }
    }
    if(e->lid_bot > 0.5f)                  /* elip màu nền từ dưới lên, khoét mắt thành hình vòm */
        rrect(L, x1 - 4, y2 + 1 - e->lid_bot * k, x2 + 4, y2 + 1 - e->lid_bot * k + e->h * 1.3f,
              1e9f, OFF);
}

static void draw_z(lv_layer_t * L, int x, int y, int s)
{
    line(L, x, y, x + s, y);
    line(L, x + s, y, x, y + s);
    line(L, x, y + s, x + s, y + s);
}

static void draw_cb(lv_event_t * ev)
{
    lv_layer_t * L = lv_event_get_layer(ev);
    lv_area_t a;
    lv_obj_get_coords(face_obj, &a);
    X0 = a.x1;
    Y0 = a.y1 + (lv_area_get_height(&a) - DESIGN_H) / 2;
    uint32_t t = lv_tick_get();
    float ox = cur.lx + sx, oy = cur.ly + sy;
    for(int i = 0; i < 2; i++) draw_eye(L, &cur.e[i], ox, oy, blink, i == 0);

    /* phụ kiện đặt ở y >= 8 theo toạ độ thiết kế: vùng 48 px (dưới thanh trạng thái) vẫn không cắt */
    switch(EMO[emo].extra) {
        case X_THINK: {                    /* 3 chấm hiện dần ở góc mắt đang nhìn */
            int n = (t / 350) % 4;
            for(int i = 0; i < n; i++) rect(L, 114 + i * 5, 14 - i * 3, 115 + i * 5, 15 - i * 3, LIT);
            break;
        }
        case X_SLEEP: {                    /* 2 chữ Z bay lên, lệch pha nhau */
            for(int i = 0; i < 2; i++) {
                int p = (t + i * 1000) % 2000;
                draw_z(L, 106 + i * 8, 22 - i * 6 - p * 8 / 2000, 4 + i * 2);
            }
            break;
        }
    }
}

/* ---------- hoạt ảnh ---------- */

static void lerp_face(face_t * a, const face_t * b, float k)
{
    float * pa = (float *)a;
    const float * pb = (const float *)b;
    for(size_t i = 0; i < sizeof(face_t) / sizeof(float); i++) pa[i] += (pb[i] - pa[i]) * k;
}

static void anim_cb(lv_timer_t * tm)
{
    LV_UNUSED(tm);
    uint32_t t = lv_tick_get();
    const emo_t * E = &EMO[emo];
    lerp_face(&cur, &E->f, 0.25f);

    if(E->saccade && t >= next_saccade) {  /* liếc ngẫu nhiên, lâu lâu quay về giữa */
        int centre = rand() % 3 == 0;
        sx_t = centre ? 0 : (float)((int)rnd(0, 20) - 10);
        sy_t = centre ? 0 : (float)((int)rnd(0, 8) - 4);
        next_saccade = t + rnd(900, 2600);
    }
    if(!E->saccade) sx_t = sy_t = 0;
    /* liếc nhanh hơn chuyển cảm xúc: mắt thật giật tới đích chứ không trôi */
    sx += (sx_t - sx) * 0.5f;
    sy += (sy_t - sy) * 0.5f;

    blink = 1;
    if(blink_on && E->blink) {
        if(t >= next_blink && !blink_t0) blink_t0 = t;
        if(blink_t0) {
            float p = (t - blink_t0) / 180.0f;   /* 180 ms cho 1 lần nhắm-mở */
            if(p >= 1) { blink_t0 = 0; next_blink = t + rnd(2200, 5000); }
            else blink = fabsf(1 - 2 * p);
        }
    }
    lv_obj_invalidate(face_obj);           /* 128x64 1-bit = 1 KB, vẽ lại cả vùng rẻ hơn tính vùng bẩn */
}

/* ---------- API ---------- */

lv_obj_t * robot_face_create(lv_obj_t * parent, int32_t w, int32_t h)
{
    face_obj = lv_obj_create(parent);
    lv_obj_remove_style_all(face_obj);
    lv_obj_set_size(face_obj, w, h);
    lv_obj_set_style_bg_color(face_obj, OFF, 0);
    lv_obj_set_style_bg_opa(face_obj, LV_OPA_COVER, 0);
    lv_obj_remove_flag(face_obj, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_add_event_cb(face_obj, draw_cb, LV_EVENT_DRAW_MAIN, NULL);
    lv_timer_create(anim_cb, 20, NULL);
    robot_face_set_index(0, true);
    uint32_t t = lv_tick_get();
    next_blink = t + 1500;
    next_saccade = t + 800;
    return face_obj;
}

void robot_face_set_index(int i, bool instant)
{
    if(i < 0 || i >= N_EMO) i = 0;
    emo = i;
    if(instant) cur = EMO[i].f;
    sx_t = sy_t = 0;
}

bool robot_face_set_emotion(const char * name)
{
    for(int i = 0; i < N_EMO; i++)
        if(name && strcmp(EMO[i].name, name) == 0) {
            robot_face_set_index(i, false);
            return true;
        }
    robot_face_set_index(0, false);
    return false;
}

void robot_face_set_blink(bool on) { blink_on = on; }
void robot_face_set_colors(lv_color_t lit, lv_color_t off) { LIT = lit; OFF = off; }
int robot_face_count(void) { return N_EMO; }
const char * robot_face_name(int i) { return (i >= 0 && i < N_EMO) ? EMO[i].name : NULL; }
int robot_face_index(void) { return emo; }
float robot_face_blink_level(void) { return blink; }
