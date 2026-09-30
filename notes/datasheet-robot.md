# Số liệu linh kiện Phần 3–4 (robot) — đã đối chiếu nguồn gốc 2026-09-28 (LD19: 2026-09-30)

Số trong `hoc/bai/14.*–21.*` và `hoc/linhkien.js` lấy từ đây. Nguồn gốc (datasheet hãng) thắng bài viết/shop.
Module rời (FC-51, TCRT5000, GY-521, khe quang…) không có datasheet hãng: số lấy theo sơ đồ mạch đã đọc, còn lại **đo mới biết**.

| Linh kiện | Số đã kiểm | Nguồn |
|---|---|---|
| HC-SR04 | 5V, 15mA; Trig ≥ 10µs mức cao; đo 2–400cm, góc 15°; `µs / 58 = cm`; chu kỳ đo ≥ 60ms; Echo ra mức TTL (5V) | [Elecfreaks HCSR04.pdf](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf) |
| FC-51 (IR tránh vật) | LM393 cực góp hở, **OUT kéo lên VCC qua 10k** → VCC = 5V thì OUT = 5V; LED IR nối tiếp 100Ω; OUT thấp khi có vật; biến trở chỉnh tầm (quảng cáo 2–30cm) | [FC51.pdf (sơ đồ mạch)](https://www.dmf.unisalento.it/~denunzio/allow_listing/ARDUINO/FC51.pdf) |
| TCRT5000 (cảm biến) | LED IR: IF tối đa 60mA, VF 1.25V @60mA; phototransistor: IC 1mA @ IF 10mA, D 12mm; tầm tốt nhất 2.5mm, dùng được 0.2–15mm; có lọc ánh sáng ngày | [Vishay 83760](https://www.vishay.com/docs/83760/tcrt5000.pdf) |
| Module TCRT5000 | 4 chân VCC GND DO AO, LM393 như FC-51 (DO thấp khi thấy mặt phản xạ), 3.3–5V — theo shop, chưa có sơ đồ gốc | shop/blog, **đo mới biết** |
| DRV8833 | VM 2.7–10.8V (tuyệt đối 11.8V); 1.5A RMS/kênh vỏ HTSSOP (PWP)/WQFN, **chỉ 500mA RMS vỏ TSSOP (PW)**; đỉnh 2A; logic cao ≥ 2V (nSLEEP ≥ 2.5V); chân IN kéo xuống 150k, **nSLEEP kéo xuống 500k → phải kéo lên mới chạy**; OCP ≥ 2A; UVLO 2.6V; bảng: 10 tiến, 01 lùi, 00 thả trôi, 11 phanh; VM cần tụ ≥ 10µF | [TI SLVSAR1E](https://www.ti.com/lit/gpn/DRV8833) |
| SG90 | 4.8–6V; xung 1–2ms, chu kỳ 20ms (50Hz); 1.5ms = giữa; ~180°; dây cam = tín hiệu, đỏ = +, nâu = −; **dòng kẹt không ghi** | [SG90 datasheet](http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf) |
| Motor TT 1:48 | 3–6V; không tải 150mA ±10%; kẹt 1.1A @3V, 1.2A @4.5V, 1.5A @6V; 120 / 185 / 250 vòng/phút @3 / 4.5 / 6V | [Adafruit 3777](https://www.adafruit.com/product/3777) (motor TT khác shop: **đo mới biết**) |
| MPU-6050 | VDD 2.375–3.46V; I2C 400kHz; địa chỉ 0x68 (AD0 = 0) / 0x69; gyro ±250°/s = 131 LSB/(°/s); PWR_MGMT_1 (0x6B) bật nguồn = 0x40 (**đang ngủ**, ghi 0 để dậy); WHO_AM_I (0x75) = 0x68; GYRO_ZOUT 0x47–0x48 | [PS-MPU-6000A](https://cdn.sparkfun.com/datasheets/Components/General%20IC/PS-MPU-6000A.pdf), [RM-MPU-6000A](https://cdn.sparkfun.com/datasheets/Sensors/Accelerometers/RM-MPU-6000A.pdf) |
| GY-521 | có ổn áp 3.3V trên board → VCC 3.3–5V; điện trở kéo lên SDA/SCL 2.2k hoặc 10k tuỳ bản; AD0 kéo xuống 4.7k | [ProtoSupplies](https://protosupplies.com/product/mpu-6050-gy-521-3-axis-accel-gryo-sensor-module/) (shop, không phải hãng) |
| TP4056 | VCC 4.0–8V (tuyệt đối 8V); sạc 4.2V ±1.5% (4.137–4.263V); RPROG 1.2k → 1000mA (950–1050); sạc nhỏ giọt 130mA khi pin < 2.9V; ngắt khi dòng xuống 1/10; LED đỏ = đang sạc, xanh = đầy; **chỉ 1 cell, không tự bảo vệ xả** | [TP4056 NanJing Top Power](https://dlnmh9ip6v2uc.cloudfront.net/datasheets/Prototyping/TP4056.pdf) |
| DW01A (bảo vệ trên module TP4056 6 chân) | ngắt sạc 4.30V ±0.05, mở lại 4.10V; ngắt xả **2.50V ±0.1**, mở lại 2.90V; quá dòng 150mV ±20mV trên MOSFET; bản clone khác hãng lệch vài chục mV | [DW01A Fortune](https://components101.com/sites/default/files/component_datasheet/DW01A-Datasheet.pdf) |
| Cell 18650 (ví dụ Samsung 25R) | danh nghĩa 3.6V, sạc 4.2V, cắt xả 2.5V, sạc chuẩn 1.25A, xả liên tục 20A; **cell không rõ hãng: dung lượng/dòng ghi trên vỏ thường sai** | [Samsung INR18650-25R](https://www.dnkpower.com/wp-content/uploads/2018/04/Samsung-INR18650-25R-Datasheet.pdf) |
| LM2596 | vào 4.5–40V (tuyệt đối 45V); 3A; 150kHz; bản chỉnh được: tham chiếu 1.23V; sụt trên công tắc 1.16–1.4V @3A → áp vào phải cao hơn áp ra ≳ 1.5V; bản 5V: hiệu suất 80% @12V→5V 3A | [TI SNVS124G](https://www.ti.com/lit/ds/symlink/lm2596.pdf) |
| LDROBOT LD19 (LiDAR, Phần 4) | P5V 4.5–5.5V, ~180mA (0.9W); Tx 0–3.3V typ, tối đa 3.5V; UART 230400 8N1 một chiều; **PWM nối GND khi không điều tốc ngoài** (tự giữ 10±0.1 vòng/s); 4500 điểm/s, 0.02–12m; gói 47 byte: 54 2C, tốc độ (°/s), góc đầu/cuối (0.01°), 12 × (mm u16, cường độ u8), mốc ms, CRC-8 đa thức 0x4D; góc tăng theo chiều kim đồng hồ; laser Class 1 (FDA). Gói mẫu mục 3.3: bảng giải thích ghi điểm 12 = B0H nhưng chuỗi byte là C0 00 (192mm), tin chuỗi byte | [LD19 Development Manual V2.3 (Elecrow)](https://www.elecrow.com/download/product/SLD06360F/LD19_Development%20Manual_V2.3.pdf), [Waveshare wiki](https://www.waveshare.com/wiki/DTOF_LIDAR_LD19) |
| ESP32-S3-DevKitC-1 | 3 cách cấp nguồn **loại trừ nhau**: USB / chân 5V+G / chân 3V3+G — không cấp 2 đường cùng lúc | [Espressif user guide v1.1](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html) |

Không lấy được datasheet gốc: MP1584 (link MPS hỏng) → giáo trình dùng LM2596. Module khe quang (FC-03 / HC-020K):
shop ghi khác nhau (HC-020K chỉ 5V, ra 5V) → bài 15.2 bắt **đo chân OUT trước khi nối GPIO**.

## Linh kiện Phần 1–2 + "nên có"

| Linh kiện | Số đã kiểm | Nguồn |
|---|---|---|
| DW01A | xem bảng trên (4.30V / 2.50V) — đọc lại từ PDF, khớp | [DW01A Fortune](https://components101.com/sites/default/files/component_datasheet/DW01A-Datasheet.pdf) |
| IRLZ44N | 55V; VGS ±16V; RDS(on) 0.022Ω @10V, 0.025Ω @5V, 0.035Ω @4V; VGS(th) 1–2V | [Infineon](https://www.infineon.com/dgdl/irlz44npbf.pdf?fileId=5546d462533600a40153567217c32725) |
| 1N4728A | 3.3V @ IZT 76mA; ZZK 400Ω @1mA; Ptot 1.3W (Vishay; hãng khác 1W) | [Vishay 85816](https://www.vishay.com/docs/85816/1n4728a.pdf) |
| 1N5819 | 40V, 1A; VF ≤ 0.6V @1A; **IR tối đa 1mA @25°C, 10mA @100°C** | [Vishay 88525](https://www.vishay.com/docs/88525/1n5817.pdf) |
| 1N4148 | VRRM 100V, VR 75V; IF(AV) 150mA (Vishay; onsemi 200mA) | [Vishay 81857](https://www.vishay.com/docs/81857/1n4148.pdf) |
| 1N4007 | 1000V, 1A | [Vishay 88503](https://www.vishay.com/docs/88503/1n4001.pdf) |
| NE555 | VCC 4.5–16V; IO ±200mA (khuyến nghị) | [TI](https://www.ti.com/lit/ds/symlink/ne555.pdf) |
| LM358 | VS 3–30V (TI bản hiện tại; LM358B 3–36V); đầu vào/ra tới (V+) − 1.5V | [TI](https://www.ti.com/lit/ds/symlink/lm358.pdf) |
| AMS1117 | sụt ~1.1V điển hình, **tối đa 1.3V** ở tải lớn | [AMS ds1117](http://www.advanced-monolithic.com/pdf/ds1117.pdf) (tải trực tiếp lỗi SSL; số qua nhiều bản mirror) |
| ESP32-S3 | chân ≤ VDD + 0.3V (3.6V); drive mặc định 20mA, GPIO17/18 10mA, GPIO19/20 40mA; ADC ATTEN3 0–2900mV | [Espressif datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf) |
| MAX98357A | 2.5–5.5V; 3.2W vào 4Ω @5V | [ADI](https://www.analog.com/media/en/technical-documentation/data-sheets/max98357a-max98357b.pdf) |
| INMP441 | VDD 1.8–3.3V; **L/R thấp = kênh trái**, cao = kênh phải (xiaozhi đọc `I2S_STD_SLOT_LEFT`) | [Digi-Key bản HTML datasheet](https://www.digikey.com/htmldatasheets/production/1431884/0/0/1/inmp441-datasheet.html) |
| Relay SRD-05VDC-SL-C | cuộn 71.4mA / 70Ω (bản 0.36W); đóng ≤ 10ms, nhả ≤ 5ms; tiếp điểm 10A | [Songle](https://www.circuitbasics.com/wp-content/uploads/2015/11/SRD-05VDC-SL-C-Datasheet.pdf) |
| S8050 | VCEO 25V, IC 0.5A (bản Changjiang/JCET) | shop/mirror — nhiều hãng khác nhau |
| SS12D00 / KW11-3Z / GL5528 | 0.5A 50VDC / 5A 250VAC / 8–20k @10lux, ≥1MΩ tối, ≤150V, 100mW | trang shop / mirror (không có PDF hãng) |
