/*
 * Đọc cảm biến thật của máy Mac (Apple Silicon), không cần sudo.
 * Trên sản phẩm thật phần này là chương trình chạy trên PC (Windows: HWiNFO/LibreHardwareMonitor)
 * rồi gửi sang ESP32; ở đây simulator chạy cùng máy nên đọc thẳng.
 */
#ifdef __APPLE__
#include "sensors.h"
#include <CoreFoundation/CoreFoundation.h>
#include <IOKit/IOKitLib.h>
#include <ifaddrs.h>
#include <mach/mach.h>
#include <math.h>
#include <net/if.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mount.h>
#include <sys/sysctl.h>
#include <time.h>

/* ---------- SMC (nhiệt độ, quạt, công suất) ----------
 * Giao thức AppleSMC không có tài liệu chính thức; layout struct phải khớp từng byte với kernel,
 * đây là layout mà các tool mã nguồn mở (smcFanControl, Stats) dùng. */
typedef struct { char major, minor, build, reserved; uint16_t release; } smc_vers_t;
typedef struct { uint16_t version, length; uint32_t cpu, gpu, mem; } smc_plimit_t;
typedef struct { uint32_t size, type; char attr; } smc_keyinfo_t;
typedef struct {
    uint32_t key;
    smc_vers_t vers;
    smc_plimit_t plimit;
    smc_keyinfo_t info;
    char result, status, cmd;
    uint32_t data32;
    uint8_t bytes[32];
} smc_msg_t;

enum { SMC_KERNEL_INDEX = 2, SMC_CMD_READ_BYTES = 5, SMC_CMD_READ_KEYINFO = 9 };
static io_connect_t smc;

static uint32_t fourcc(const char * k) { return (uint32_t)k[0] << 24 | k[1] << 16 | k[2] << 8 | k[3]; }

/* Chỉ đọc key kiểu 'flt ' (float 4 byte, little-endian) — kiểu Apple Silicon dùng cho nhiệt/quạt/công suất. */
static float smc_float(const char * key)
{
    smc_msg_t in = { 0 }, out = { 0 };
    size_t sz = sizeof(out);
    in.key = fourcc(key);
    in.cmd = SMC_CMD_READ_KEYINFO;
    if(IOConnectCallStructMethod(smc, SMC_KERNEL_INDEX, &in, sizeof(in), &out, &sz) != kIOReturnSuccess || out.result)
        return NAN;
    if(out.info.type != fourcc("flt ") || out.info.size != 4) return NAN;
    in.info.size = out.info.size;
    in.cmd = SMC_CMD_READ_BYTES;
    memset(&out, 0, sizeof(out));
    if(IOConnectCallStructMethod(smc, SMC_KERNEL_INDEX, &in, sizeof(in), &out, &sz) != kIOReturnSuccess || out.result)
        return NAN;
    float f;
    memcpy(&f, out.bytes, 4);
    return f;
}

static float smc_avg(const char * const * keys, int n)
{
    float sum = 0;
    int cnt = 0;
    for(int i = 0; i < n; i++) {
        float v = smc_float(keys[i]);
        if(!isnan(v) && v > 0 && v < 150) { sum += v; cnt++; }
    }
    return cnt ? sum / cnt : NAN;
}

/* Key nhiệt độ theo đời chip: đã thử trên M1 Pro (MacBookPro18,3). Chip khác có thể ra NAN -> "--". */
static const char * const CPU_T_KEYS[] = { "Tp01", "Tp05", "Tp09", "Tp0D", "Tp0H", "Tp0L", "Tp0P", "Tp0X", "Tp0b", "Tp0T" };
static const char * const GPU_T_KEYS[] = { "Tg05", "Tg0D", "Tg0L", "Tg0T" };

/* ---------- GPU (IOAccelerator) ---------- */
static io_service_t gpu_svc;

static double dict_num(CFDictionaryRef d, const char * key)
{
    CFStringRef k = CFStringCreateWithCString(NULL, key, kCFStringEncodingUTF8);
    CFNumberRef n = CFDictionaryGetValue(d, k);
    CFRelease(k);
    double v = NAN;
    if(n) CFNumberGetValue(n, kCFNumberDoubleType, &v);
    return v;
}

/* ---------- powermetrics (xung nhịp, công suất CPU/GPU) ----------
 * Chỉ có qua powermetrics, mà nó cần root. Dùng `sudo -n` để KHÔNG bao giờ hỏi mật khẩu:
 * chạy `sudo -v` trong cùng terminal trước khi mở ./panel thì có số, không thì các ô này giữ "--".
 * Parse output dạng text; format không có tài liệu chính thức nên dòng lạ thì bỏ qua. */
static pthread_mutex_t pm_lock = PTHREAD_MUTEX_INITIALIZER;
static float pm_cpu_mhz = NAN, pm_gpu_mhz = NAN, pm_cpu_w = NAN, pm_gpu_w = NAN;

static float after_colon(const char * line)
{
    const char * c = strchr(line, ':');
    float v;
    return c && sscanf(c + 1, "%f", &v) == 1 ? v : NAN;
}

static void * pm_thread(void * arg)
{
    (void)arg;
    /* PANEL_PM_CMD: thay lệnh nguồn (vd `cat mẫu.txt`) để test phần parse mà không cần sudo */
    const char * cmd = getenv("PANEL_PM_CMD");
    FILE * f = popen(cmd ? cmd : "sudo -n /usr/bin/powermetrics --samplers cpu_power,gpu_power -i 1000 2>/dev/null", "r");
    if(!f) return NULL;
    char line[256];
    float pmax = NAN;   /* xung cao nhất trong các cụm P-core của mẫu hiện tại */
    while(fgets(line, sizeof(line), f)) {
        float v = after_colon(line);
        if(isnan(v)) continue;
        pthread_mutex_lock(&pm_lock);
        if(line[0] == 'P' && strstr(line, "Cluster HW active frequency:")) {
            if(isnan(pmax) || v > pmax) pmax = v;
        }
        else if(strncmp(line, "CPU Power:", 10) == 0) {
            pm_cpu_w = v / 1000;       /* mW */
            pm_cpu_mhz = pmax;
            pmax = NAN;
        }
        else if(strncmp(line, "GPU Power:", 10) == 0) pm_gpu_w = v / 1000;
        else if(strncmp(line, "GPU", 3) == 0 && strstr(line, "active frequency:")) pm_gpu_mhz = v;
        pthread_mutex_unlock(&pm_lock);
    }
    pclose(f);
    return NULL;
}

/* ---------- delta giữa 2 lần đọc ---------- */
static uint64_t prev_busy, prev_total;
static uint32_t prev_ib, prev_ob;   /* if_data là bộ đếm 32-bit: trừ kiểu uint32 để tự xử lý tràn vòng */
static double prev_t;

static double now_s(void)
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec / 1e9;
}

static void cpu_ticks(uint64_t * busy, uint64_t * total)
{
    natural_t ncpu;
    processor_info_array_t info;
    mach_msg_type_number_t cnt;
    *busy = *total = 0;
    if(host_processor_info(mach_host_self(), PROCESSOR_CPU_LOAD_INFO, &ncpu, &info, &cnt) != KERN_SUCCESS) return;
    processor_cpu_load_info_t load = (processor_cpu_load_info_t)info;
    for(natural_t i = 0; i < ncpu; i++) {
        uint64_t b = load[i].cpu_ticks[CPU_STATE_USER] + load[i].cpu_ticks[CPU_STATE_SYSTEM] + load[i].cpu_ticks[CPU_STATE_NICE];
        *busy += b;
        *total += b + load[i].cpu_ticks[CPU_STATE_IDLE];
    }
    vm_deallocate(mach_task_self(), (vm_address_t)info, cnt * sizeof(integer_t));
}

static void net_bytes(uint32_t * ib, uint32_t * ob)
{
    struct ifaddrs * ifa, * p;
    *ib = *ob = 0;
    if(getifaddrs(&ifa) != 0) return;
    for(p = ifa; p; p = p->ifa_next) {
        if(!p->ifa_addr || p->ifa_addr->sa_family != AF_LINK || !p->ifa_data) continue;
        if(p->ifa_flags & IFF_LOOPBACK) continue;
        struct if_data * d = p->ifa_data;
        *ib += d->ifi_ibytes;
        *ob += d->ifi_obytes;
    }
    freeifaddrs(ifa);
}

int sensors_mac_init(sensors_t * s)
{
    memset(s, 0, sizeof(*s));
    s->source = "LIVE";

    size_t len = sizeof(s->cpu_name);
    if(sysctlbyname("machdep.cpu.brand_string", s->cpu_name, &len, NULL, 0) != 0) strcpy(s->cpu_name, "CPU");
    int cores = 0;
    len = sizeof(cores);
    sysctlbyname("hw.ncpu", &cores, &len, NULL, 0);
    snprintf(s->cpu_name + strlen(s->cpu_name), sizeof(s->cpu_name) - strlen(s->cpu_name), " %dC", cores);

    uint64_t mem = 0;
    len = sizeof(mem);
    sysctlbyname("hw.memsize", &mem, &len, NULL, 0);
    s->ram_total = mem / 1073741824.0f;
    snprintf(s->ram_name, sizeof(s->ram_name), "%.0f GB UNIFIED", s->ram_total);
    s->vram_total = s->ram_total;   /* Apple Silicon: GPU dùng chung RAM */

    gpu_svc = IOServiceGetMatchingService(kIOMainPortDefault, IOServiceMatching("IOAccelerator"));
    strcpy(s->gpu_name, "GPU");
    if(gpu_svc) {
        CFStringRef m = IORegistryEntryCreateCFProperty(gpu_svc, CFSTR("model"), NULL, 0);
        if(m) {
            CFStringGetCString(m, s->gpu_name, sizeof(s->gpu_name), kCFStringEncodingUTF8);
            CFRelease(m);
        }
    }

    io_service_t svc = IOServiceGetMatchingService(kIOMainPortDefault, IOServiceMatching("AppleSMC"));
    if(!svc || IOServiceOpen(svc, mach_task_self(), 0, &smc) != kIOReturnSuccess) smc = 0;
    if(svc) IOObjectRelease(svc);

    strcpy(s->cpu_power_key, "SYSTEM");   /* SMC PSTR = công suất cả máy, không tách riêng CPU */
    strcpy(s->disk_name, "SSD");
    for(int i = 0; i < 3; i++) s->fan_rpm[i] = NAN;
    s->room_temp = NAN;   /* chỗ này về sau là cảm biến gắn trên ESP32 */
    s->cpu_clock = s->gpu_clock = s->gpu_power = NAN;

    pthread_t th;
    if(pthread_create(&th, NULL, pm_thread, NULL) == 0) pthread_detach(th);

    cpu_ticks(&prev_busy, &prev_total);
    net_bytes(&prev_ib, &prev_ob);
    prev_t = now_s();
    sensors_mac_read(s);
    return 0;
}

void sensors_mac_read(sensors_t * s)
{
    /* CPU */
    uint64_t busy, total;
    cpu_ticks(&busy, &total);
    if(total > prev_total) s->cpu_usage = 100.0f * (busy - prev_busy) / (total - prev_total);
    prev_busy = busy;
    prev_total = total;

    /* RAM: cùng công thức "Memory Used" của Activity Monitor */
    vm_statistics64_data_t vm;
    mach_msg_type_number_t cnt = HOST_VM_INFO64_COUNT;
    if(host_statistics64(mach_host_self(), HOST_VM_INFO64, (host_info64_t)&vm, &cnt) == KERN_SUCCESS) {
        uint64_t pages = vm.internal_page_count - vm.purgeable_count + vm.wire_count + vm.compressor_page_count;
        s->ram_used = pages * (double)vm_kernel_page_size / 1073741824.0;
    }

    /* Ổ đĩa: volume dữ liệu (/ trên macOS là volume hệ thống chỉ đọc) */
    struct statfs fs;
    if(statfs("/System/Volumes/Data", &fs) == 0) {
        s->disk_total = (double)fs.f_blocks * fs.f_bsize / 1e9;
        s->disk_used = s->disk_total - (double)fs.f_bavail * fs.f_bsize / 1e9;
    }

    /* Mạng */
    double t = now_s(), dt = t - prev_t;
    uint32_t ib, ob;
    net_bytes(&ib, &ob);
    if(dt > 0.05) {
        s->net_down = (uint32_t)(ib - prev_ib) * 8 / dt / 1e6;
        s->net_up = (uint32_t)(ob - prev_ob) * 8 / dt / 1e6;
    }
    prev_ib = ib;
    prev_ob = ob;
    prev_t = t;

    /* GPU */
    if(gpu_svc) {
        CFDictionaryRef st = IORegistryEntryCreateCFProperty(gpu_svc, CFSTR("PerformanceStatistics"), NULL, 0);
        if(st) {
            s->gpu_usage = dict_num(st, "Device Utilization %");
            s->vram = dict_num(st, "In use system memory") / 1073741824.0;
            CFRelease(st);
        }
    }

    /* SMC */
    if(smc) {
        s->cpu_temp = smc_avg(CPU_T_KEYS, sizeof(CPU_T_KEYS) / sizeof(*CPU_T_KEYS));
        s->gpu_temp = smc_avg(GPU_T_KEYS, sizeof(GPU_T_KEYS) / sizeof(*GPU_T_KEYS));
        s->cpu_power = smc_float("PSTR");
        strcpy(s->cpu_power_key, "SYSTEM");
        /* Không đọc FNum (kiểu ui8): thử F0Ac..F2Ac, key nào không có thì coi là không có quạt đó. */
        for(int i = 0; i < 3; i++) {
            char k[5] = { 'F', (char)('0' + i), 'A', 'c', 0 };
            s->fan_rpm[i] = smc_float(k);
            if(isnan(s->fan_rpm[i])) s->fan_name[i][0] = 0;
            else snprintf(s->fan_name[i], sizeof(s->fan_name[i]), "FAN %d", i + 1);
        }
    }

    pthread_mutex_lock(&pm_lock);
    s->cpu_clock = pm_cpu_mhz / 1000;   /* NAN / 1000 vẫn là NAN */
    s->gpu_clock = pm_gpu_mhz;
    s->gpu_power = pm_gpu_w;
    if(!isnan(pm_cpu_w)) {
        s->cpu_power = pm_cpu_w;
        strcpy(s->cpu_power_key, "POWER");
    }
    pthread_mutex_unlock(&pm_lock);
}
#endif
