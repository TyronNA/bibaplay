// 20.1 Bám vạch: 2 TCRT5000 úp xuống sàn, AO trái → GPIO4, AO phải → GPIO5. Vạch băng keo đen trên sàn sáng.
// "HC": robot quay chậm qua lại trên vạch 4s, ghi mức thấp nhất / cao nhất của từng mắt để quy về 0..1 (0 = sàn, 1 = vạch).
// "CHAY" (hoặc nhấn công tắc va chạm): bám vạch bằng PD trên hiệu 2 mắt. Mất vạch 0.5s → dừng.
#include <math.h>
#include <stdio.h>
#include <string.h>
#include "robot.h"

#define V_BAM  120.0f   // mm/s
#define KP     3.0f     // rad/s cho mỗi đơn vị lệch (−1..1)
#define KD     0.15f

static int s_min[2] = { 4000, 4000 }, s_max[2] = { 0, 0 };

static float den(int mv, int k)
{
    if (s_max[k] - s_min[k] < 100) return 0;   // chưa hiệu chuẩn / 2 mức gần như nhau
    float v = (float)(mv - s_min[k]) / (s_max[k] - s_min[k]);
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

void bai_20_1(void)
{
    robot_mo();
    robot_cam_bien_mo();
    robot_mang_mo();
    char lenh[32];
    int hc = 0, bam = 0, mat = 0;
    bool va_truoc = false;
    float e_truoc = 0;
    for (int i = 0;; i++) {
        robot_cb_t c = robot_cam_bien();
        int aT = robot_adc_mv(KENH_TCRT_T), aP = robot_adc_mv(KENH_TCRT_P);
        while (tram_nhan(lenh, sizeof lenh)) {
            if (!strncmp(lenh, "HC", 2)) { hc = 200; s_min[0] = s_min[1] = 4000; s_max[0] = s_max[1] = 0; tram_gui("S hieu chuan 4s"); }
            else if (!strncmp(lenh, "CHAY", 4)) bam = 1;
            else if (lenh[0] == 'X') { bam = 0; hc = 0; }
        }
        if (c.va && !va_truoc && !hc) bam = !bam;
        va_truoc = c.va;
        if (hc) {
            int a[2] = { aT, aP };
            for (int k = 0; k < 2; k++) { if (a[k] < s_min[k]) s_min[k] = a[k]; if (a[k] > s_max[k]) s_max[k] = a[k]; }
            int pha = (200 - hc) / 50;                          // 4 pha 1s: trái, phải, phải, trái → về gần chỗ cũ
            robot_vw(0, (pha == 0 || pha == 3) ? 0.8f : -0.8f);
            if (--hc == 0) { robot_dung(); tram_gui("S xong: trai %d..%d mV, phai %d..%d mV", s_min[0], s_max[0], s_min[1], s_max[1]); }
        } else if (bam) {
            float dT = den(aT, 0), dP = den(aP, 1), e = dT - dP;   // vạch lệch sang trái → e > 0 → quay trái
            mat = (dT < 0.2f && dP < 0.2f) ? mat + 1 : 0;
            if (mat > 25 || (c.cm > 0 && c.cm < 15)) { bam = 0; tram_gui(mat > 25 ? "S mat vach: dung" : "S co vat: dung"); }
            robot_vw(V_BAM, KP * e + KD * (e - e_truoc) / 0.02f);
            e_truoc = e;
        } else robot_dung();
        if (!bam && !hc) e_truoc = 0;
        if (i % 5 == 0) tram_gui("T aT=%d aP=%d denT=%.2f denP=%.2f bam=%d", aT, aP, den(aT, 0), den(aP, 1), bam);
        cho_ms(20);
    }
}
