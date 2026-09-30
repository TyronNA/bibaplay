// 18.3 Máy trạng thái: hành vi né vật của 17.1 viết lại thành các trạng thái, không còn cho_ms() chặn cả vòng.
// Vòng 20ms: đọc cảm biến → xét chuyển trạng thái → ra motor. Mỗi lần đổi trạng thái gửi 1 dòng "S" lên trạm.
// Bắt đầu ở CHO: nhấn công tắc va chạm (hoặc lệnh CHAY từ trạm) thì 2s sau mới chạy; lệnh X về CHO.
#include <stdio.h>
#include <string.h>
#include "robot.h"
#include "esp_timer.h"

#define DUTY_DI 50
#define GAN_CM  20

typedef enum { CHO, SAP_CHAY, DI, DUNG, LUI, QUAY, PIN_YEU } tt_t;
static const char *TEN[] = { "CHO", "SAP_CHAY", "DI", "DUNG", "LUI", "QUAY", "PIN_YEU" };

static tt_t s_tt = CHO;
static int64_t s_vao_ms;   // lúc vào trạng thái hiện tại

static int64_t bay_gio_ms(void) { return esp_timer_get_time() / 1000; }

static void sang(tt_t moi, const char *ly_do)
{
    tram_gui("S %s -> %s (%s)", TEN[s_tt], TEN[moi], ly_do);
    printf("%s -> %s (%s)\n", TEN[s_tt], TEN[moi], ly_do);
    s_tt = moi;
    s_vao_ms = bay_gio_ms();
}

void bai_18_3(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    char lenh[32];
    bool va_truoc = false;
    int quay_chieu = 1;
    for (int i = 0;; i++) {
        robot_cb_t c = robot_cam_bien();
        int64_t o_lai = bay_gio_ms() - s_vao_ms;   // đã ở trạng thái này bao lâu (ms)
        bool co_lenh_chay = false;
        while (tram_nhan(lenh, sizeof lenh)) {
            if (!strncmp(lenh, "CHAY", 4)) co_lenh_chay = true;
            else if (lenh[0] == 'X' && s_tt != CHO) sang(CHO, "lenh X");
        }
        bool nhan_va = c.va && !va_truoc;           // cạnh xuống của công tắc: 1 lần nhấn = 1 sự kiện
        va_truoc = c.va;

        if (s_tt != PIN_YEU && c.pin_mv > CO_PIN_MV && c.pin_mv < PIN_YEU_MV) sang(PIN_YEU, "pin < 6.6V");
        const char *vat = c.va ? "va cham" : c.ir ? "hong ngoai" : (c.cm > 0 && c.cm < GAN_CM) ? "sieu am" : NULL;

        switch (s_tt) {
        case CHO:      if (nhan_va || co_lenh_chay) sang(SAP_CHAY, nhan_va ? "nhan cong tac" : "lenh CHAY"); break;
        case SAP_CHAY: if (o_lai > 2000) sang(DI, "het 2s"); break;
        case DI:       if (vat) sang(DUNG, vat); break;
        case DUNG:     if (o_lai > 100) sang(LUI, "het 0.1s"); break;
        case LUI:      if (o_lai > 400) { sang(QUAY, "het 0.4s"); quay_chieu = -quay_chieu; } break;
        case QUAY:     if (o_lai > 350) sang(vat ? DUNG : DI, vat ? vat : "het 0.35s"); break;
        case PIN_YEU:  break;   // dừng hẳn tới khi rút P+
        }

        switch (s_tt) {
        case DI:   robot_duty(DUTY_DI, DUTY_DI); break;
        case LUI:  robot_duty(-DUTY_DI, -DUTY_DI); break;
        case QUAY: robot_duty(DUTY_DI * quay_chieu, -DUTY_DI * quay_chieu); break;   // đổi chiều quay mỗi lần né
        default:   robot_duty(0, 0); break;
        }
        if (i % 10 == 0) tram_gui("T tt=%d cm=%d ir=%d va=%d pin=%d", s_tt, c.cm, c.ir, c.va, c.pin_mv);
        cho_ms(20);
    }
}
