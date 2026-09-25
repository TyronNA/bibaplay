#pragma once
/* Dữ liệu một lần đọc. NAN = nguồn này không đọc được -> UI hiện "--".
 * Trên sản phẩm thật struct này là nội dung gói tin PC gửi sang ESP32. */
typedef struct {
    const char * source;            /* "LIVE" / "DEMO" — hiện trên badge để không lẫn số giả với số thật */
    char cpu_name[40], gpu_name[40], ram_name[24], disk_name[16];
    char cpu_power_key[8];          /* "POWER" hoặc "SYSTEM" khi chỉ đọc được công suất cả máy */
    char fan_name[3][12];
    float cpu_temp, cpu_usage, cpu_clock, cpu_power;
    float gpu_temp, gpu_usage, gpu_clock, gpu_power, vram, vram_total;
    float ram_used, ram_total, disk_used, disk_total;
    float fan_rpm[3];
    float net_up, net_down, room_temp;
} sensors_t;

/* 0 = ok. Gọi init một lần, read mỗi chu kỳ cập nhật. */
int sensors_mac_init(sensors_t * s);
void sensors_mac_read(sensors_t * s);
