// Chạy trên máy tính: cc -I../main ../main/ld19.c test_ld19.c -o /tmp/t && /tmp/t
// Gói mẫu lấy nguyên từ mục 3.3 tài liệu LD19 (CRC 0x50, tốc độ 2152°/s, góc 324.27° → 334.70°).
// Điểm 12: chuỗi byte ghi C0 00 = 192mm; bảng giải thích cạnh đó ghi B0H là lỗi đánh máy của tài liệu.
#include <stdio.h>
#include "ld19.h"

int main(void)
{
    const uint8_t mau[] = { 0x54, 0x2C, 0x68, 0x08, 0xAB, 0x7E, 0xE0, 0x00, 0xE4, 0xDC, 0x00, 0xE2, 0xD9, 0x00, 0xE5, 0xD5, 0x00,
        0xE3, 0xD3, 0x00, 0xE4, 0xD0, 0x00, 0xE9, 0xCD, 0x00, 0xE4, 0xCA, 0x00, 0xE2, 0xC7, 0x00, 0xE9, 0xC5, 0x00, 0xE5, 0xC2,
        0x00, 0xE5, 0xC0, 0x00, 0xE5, 0xBE, 0x82, 0x3A, 0x1A, 0x50 };
    int loi = 0;
    if (sizeof mau != LD19_GOI) { printf("sai do dai mau %zu\n", sizeof mau); return 1; }
    if (ld19_crc(mau, LD19_GOI - 1) != 0x50) { printf("CRC sai: %02X\n", ld19_crc(mau, LD19_GOI - 1)); loi++; }
    ld19_doc_t d = { 0 };
    ld19_goi_t g;
    int du = 0;
    // rác + 1 gói hỏng CRC + 1 gói tốt: phải bắt lại nhịp
    const uint8_t rac[] = { 0x00, 0x54, 0x11, 0x2C };
    for (unsigned i = 0; i < sizeof rac; i++) du += ld19_nap(&d, rac[i], &g);
    uint8_t hong[LD19_GOI];
    for (int i = 0; i < LD19_GOI; i++) hong[i] = mau[i];
    hong[10] ^= 1;
    for (int i = 0; i < LD19_GOI; i++) du += ld19_nap(&d, hong[i], &g);
    for (int i = 0; i < LD19_GOI; i++) du += ld19_nap(&d, mau[i], &g);
    if (du != 1 || d.tot != 1 || d.hong != 1) { printf("dem goi sai: du=%d tot=%u hong=%u\n", du, d.tot, d.hong); loi++; }
    if (g.toc_do != 2152 || g.goc_dau != 32427 || g.goc_cuoi != 33470 || g.xa_mm[0] != 224 || g.cuong_do[0] != 228 || g.xa_mm[11] != 192) {
        printf("giai sai: toc=%u dau=%u cuoi=%u xa0=%u cd0=%u xa11=%u\n", g.toc_do, g.goc_dau, g.goc_cuoi, g.xa_mm[0], g.cuong_do[0], g.xa_mm[11]);
        loi++;
    }
    printf(loi ? "HONG %d\n" : "OK\n", loi);
    return loi != 0;
}
