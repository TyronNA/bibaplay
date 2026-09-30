#include "ld19.h"

// Bảng CRC trong tài liệu chính là CRC-8 đa thức 0x4D, không đảo bit, khởi đầu 0: tính lại thay vì chép 256 số.
uint8_t ld19_crc(const uint8_t *p, int n)
{
    uint8_t crc = 0;
    while (n--) {
        crc ^= *p++;
        for (int i = 0; i < 8; i++) crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x4D) : (uint8_t)(crc << 1);
    }
    return crc;
}

static uint16_t u16(const uint8_t *p) { return (uint16_t)(p[0] | (p[1] << 8)); }

bool ld19_nap(ld19_doc_t *d, uint8_t c, ld19_goi_t *g)
{
    // Đầu gói: 0x54 rồi 0x2C (loại 1, 12 điểm). Lệch nhịp thì bỏ byte tới khi gặp lại đầu gói.
    if (d->n == 0 && c != 0x54) return false;
    if (d->n == 1 && c != 0x2C) { d->n = c == 0x54; return false; }
    d->b[d->n++] = c;
    if (d->n < LD19_GOI) return false;
    d->n = 0;
    if (ld19_crc(d->b, LD19_GOI - 1) != d->b[LD19_GOI - 1]) { d->hong++; return false; }
    d->tot++;
    g->toc_do = u16(d->b + 2);
    g->goc_dau = u16(d->b + 4);
    for (int i = 0; i < 12; i++) { g->xa_mm[i] = u16(d->b + 6 + 3 * i); g->cuong_do[i] = d->b[8 + 3 * i]; }
    g->goc_cuoi = u16(d->b + 42);
    g->moc_ms = u16(d->b + 44);
    return true;
}
