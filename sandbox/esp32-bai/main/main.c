// Mỗi bài một hàm; chọn bài bằng `idf.py menuconfig` → Bai hoc (hoặc sửa sdkconfig.defaults).
#include "sdkconfig.h"

void bai_8_3(void); void bai_8_4(void); void bai_9_1(void); void bai_9_3(void); void bai_9_4(void); void bai_9_6(void);
void bai_10_1(void); void bai_10_2(void); void bai_10_3(void); void bai_11_1(void); void bai_11_2(void); void bai_11_3(void);
void bai_12_1(void); void bai_12_2(void); void bai_12_3(void); void bai_13_1(void); void bai_13_2(void); void bai_13_3(void);
void bai_14_2(void); void bai_14_3(void); void bai_14_4(void); void bai_15_1(void); void bai_15_2(void); void bai_15_3(void);
void bai_16_3(void); void bai_17_1(void); void bai_9_7(void); void bai_9_8(void); void bai_11_4(void); void bai_15_4(void);
void bai_18_1(void); void bai_18_2(void); void bai_18_3(void); void bai_18_4(void); void bai_19_1(void); void bai_19_2(void); void bai_19_3(void); void bai_19_4(void); void bai_19_5(void); void bai_20_1(void); void bai_20_2(void); void bai_20_3(void); void bai_20_4(void); void bai_21(void);

void app_main(void)
{
#if CONFIG_BAI_8_3
    bai_8_3();
#elif CONFIG_BAI_8_4
    bai_8_4();
#elif CONFIG_BAI_9_1
    bai_9_1();
#elif CONFIG_BAI_9_3
    bai_9_3();
#elif CONFIG_BAI_9_4
    bai_9_4();
#elif CONFIG_BAI_9_6
    bai_9_6();
#elif CONFIG_BAI_10_1
    bai_10_1();
#elif CONFIG_BAI_10_2
    bai_10_2();
#elif CONFIG_BAI_10_3
    bai_10_3();
#elif CONFIG_BAI_11_1
    bai_11_1();
#elif CONFIG_BAI_11_2
    bai_11_2();
#elif CONFIG_BAI_11_3
    bai_11_3();
#elif CONFIG_BAI_12_1
    bai_12_1();
#elif CONFIG_BAI_12_2
    bai_12_2();
#elif CONFIG_BAI_12_3
    bai_12_3();
#elif CONFIG_BAI_13_1
    bai_13_1();
#elif CONFIG_BAI_13_2
    bai_13_2();
#elif CONFIG_BAI_13_3
    bai_13_3();
#elif CONFIG_BAI_14_2
    bai_14_2();
#elif CONFIG_BAI_14_3
    bai_14_3();
#elif CONFIG_BAI_14_4
    bai_14_4();
#elif CONFIG_BAI_15_1
    bai_15_1();
#elif CONFIG_BAI_15_2
    bai_15_2();
#elif CONFIG_BAI_15_3
    bai_15_3();
#elif CONFIG_BAI_16_3
    bai_16_3();
#elif CONFIG_BAI_17_1
    bai_17_1();
#elif CONFIG_BAI_9_7
    bai_9_7();
#elif CONFIG_BAI_9_8
    bai_9_8();
#elif CONFIG_BAI_11_4
    bai_11_4();
#elif CONFIG_BAI_15_4
    bai_15_4();
#elif CONFIG_BAI_18_1
    bai_18_1();
#elif CONFIG_BAI_18_2
    bai_18_2();
#elif CONFIG_BAI_18_3
    bai_18_3();
#elif CONFIG_BAI_18_4
    bai_18_4();
#elif CONFIG_BAI_19_1
    bai_19_1();
#elif CONFIG_BAI_19_2
    bai_19_2();
#elif CONFIG_BAI_19_3
    bai_19_3();
#elif CONFIG_BAI_19_4
    bai_19_4();
#elif CONFIG_BAI_19_5
    bai_19_5();
#elif CONFIG_BAI_20_1
    bai_20_1();
#elif CONFIG_BAI_20_2
    bai_20_2();
#elif CONFIG_BAI_20_3
    bai_20_3();
#elif CONFIG_BAI_20_4
    bai_20_4();
#elif CONFIG_BAI_21
    bai_21();
#endif
}
