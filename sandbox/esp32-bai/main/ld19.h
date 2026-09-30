// Đọc gói tin LiDAR LDROBOT LD19 (tài liệu "LD19 Development Manual V2.3", mục 3): 47 byte/gói, 12 điểm.
// Không phụ thuộc ESP-IDF để thử được trên máy tính (test_ld19.c).
#pragma once
#include <stdbool.h>
#include <stdint.h>

#define LD19_GOI 47

typedef struct {
    uint16_t toc_do;          // °/s (10 vòng/s ≈ 3600)
    uint16_t goc_dau, goc_cuoi; // 0.01° — góc tăng theo chiều kim đồng hồ nhìn từ trên
    uint16_t xa_mm[12];
    uint8_t cuong_do[12];
    uint16_t moc_ms;
} ld19_goi_t;

typedef struct { uint8_t b[LD19_GOI]; int n; uint32_t tot, hong; } ld19_doc_t;

uint8_t ld19_crc(const uint8_t *p, int n);
// Nạp từng byte; trả về true khi vừa đủ 1 gói đúng CRC (điền vào *g).
bool ld19_nap(ld19_doc_t *d, uint8_t c, ld19_goi_t *g);
