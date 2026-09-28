# Poster "30 bài học điện tử cơ bản" + bài 2.3 biến trở

Nguồn: 5 ảnh ChatGPT trong `~/Desktop/Robotis/` (2026-09-23). Ảnh do AI vẽ nên **hình ráp không đáng tin**:
dùng làm bản đồ tổng quan, còn cách ráp và con số thì theo `giao-trinh-dien.md` + tự đo.

## Bài 2.3 — Biến trở (học tiếp)

### Biến trở là gì
Một dải than 10k, hai đầu nối ra 2 chân; chân thứ 3 là **con trượt** (wiper) tì lên dải than, vặn thì nó chạy
dọc dải. Nên luôn có: `R(đầu1–trượt) + R(trượt–đầu2) = 10k`.
RM065 `103` = 10·10³ = 10kΩ, tuyến tính (vặn nửa đường ≈ 5k). Vặn khoảng dưới 1 vòng, có chặn hai đầu — tới
chặn thì dừng, vặn cố là gãy.

### Bước 0 — đo khi chưa cắm nguồn (thang Ω)
1. Đo từng cặp chân. Cặp nào vặn mà số **không đổi** (~10k) là 2 đầu; chân còn lại là con trượt.
2. Đặt 1 vị trí bất kỳ, đo `R(1–trượt)` và `R(trượt–2)` → cộng lại phải ≈ số ở bước 1.
3. Vặn hết về một phía: một cặp về ~0Ω (vài Ω tiếp xúc), cặp kia ~10k. Ghi lại **chiều vặn nào làm R nào tăng** — cần cho bước sau.

### Kiểu A — 2 chân (biến trở làm điện trở chỉnh được)
Mạch: `+ → biến trở (đầu1 + trượt) → 220Ω → LED → −`. **220Ω không được bỏ**: vặn về 0Ω thì nó là thứ duy nhất giữ dòng.

Đoán trước, `I = (U − U_LED)/(220 + R)` với U = 4.5V, LED đỏ ~1.9V:

| R biến trở | I dự đoán | Thấy |
|---|---|---|
| 0 | ~12 mA | sáng nhất |
| 1k | ~2.1 mA | vẫn sáng rõ |
| 5k | ~0.5 mA | mờ |
| 10k | ~0.25 mA | le lói |

Để ý: R tăng đều nhưng độ sáng tụt gần hết trong **đoạn vặn đầu tiên** — mắt nhìn theo kiểu log, dòng lại tỉ lệ
nghịch với R. Đo dòng (bài 1.2) ở vài vị trí để so với bảng.
Mẹo thực tế: nối luôn đầu2 vào con trượt. Nếu con trượt mất tiếp xúc, mạch còn 10k chứ không bị hở.

### Kiểu B — 3 chân (chia áp)
Hình breadboard từng bước + cổng kiểm: web tự học, http://localhost:4300/hoc/#/bai/2.3
Mạch: đầu1 → `+`, đầu2 → `−`, đồng hồ DCV đo con trượt so với `−`. Không có LED.

- Đoán: `U_trượt = U · R(trượt–đầu2)/10k` → chạy liên tục từ 0 tới U (≈4.5V). Nửa vòng ≈ U/2.
- Dòng qua biến trở cố định `U/10k ≈ 0.45 mA` dù vặn đâu — đo được bằng đồng hồ nối tiếp.
- Đối chiếu với bước 0: số Ω đo được ở cùng vị trí phải khớp với số V theo công thức trên.

⚠️ Bẫy: ở kiểu B **không** nối con trượt thẳng vào `+` hay `−`. Vặn tới đầu kia là nối tắt pin qua một đoạn dải
than cỡ vài Ω → biến trở nóng/cháy chỗ đó. **Đã cháy 1 con thật** (2026-09-28) khi chuyển từ kiểu A sang B.

Chống lại bẫy đó — làm trước khi cắm pin, **mọi mạch**:
1. Chuyển kiểu A → B thì rút biến trở ra, cắm lại từ đầu; đừng giữ dây cũ rồi chỉ bỏ LED + 220Ω — sẽ còn lại
   đúng cặp (đầu + con trượt) vắt thẳng qua pin.
2. 3 chân nằm ở 3 cột số khác nhau (2 chân chung cột = nối tắt sẵn).
3. Chưa cắm pin, đo Ω giữa 2 điểm sẽ nối `+` và `−`: kiểu B phải ra ~10k và **vặn không đổi**. Ra gần 0, hoặc
   vặn mà đổi → nối nhầm con trượt, sửa trước khi cấp điện.

### Kiểu C — chia áp rồi cấp cho tải (nối sang 2.5)
Mạch: kiểu B, thêm `con trượt → 220Ω → LED → −`. Đoán trước khi ráp:

- LED chỉ sáng khi áp con trượt vượt ~1.8V → **vùng chết** ~40% vòng vặn đầu, rồi sáng vọt lên ở cuối. Khác hẳn kiểu A.
- Áp con trượt khi có LED **thấp hơn** lúc không có LED: nhìn từ con trượt, biến trở như một nguồn `U·x` nối
  tiếp điện trở `x·(1−x)·10k` (x = vị trí 0→1, lớn nhất 2.5k ở giữa). Ví dụ x = 0.7: không tải 3.15V; có LED ≈ 2.0V.
  Đo cả hai để thấy — đây chính là bài 2.5 "cầu phân áp dùng để đo, không dùng làm nguồn".
- Bỏ 220Ω ở đây thì vặn hết cỡ = LED cắm thẳng 4.5V → cháy.

### Dùng ở đâu trong robot
- ADC ESP32 đọc con trượt = núm xoay/cần điều khiển (chương 10). Joystick module = 2 biến trở.
  Lúc đó cấp biến trở bằng **3.3V**, không phải 5V: chân ADC không chịu quá áp nguồn chip.
- Servo (vd otto-robot) có biến trở bên trong nối vào trục để biết mình đang ở góc nào.

## Đánh giá poster — từng bài

✅ đúng, ⚠️ đúng nhưng số liệu/cách vẽ dễ hiểu sai, ❌ sai — đừng làm theo.

| # | Bài | | Nhận xét | Giáo trình |
|---|---|---|---|---|
| 1 | Khám phá breadboard | ❌ | Tô 6 lỗ theo **hàng chữ** là sai. Nhóm 5 lỗ thông nhau là cùng **một số cột** (A–E hoặc F–J), vuông góc với thanh nguồn. Đo thông mạch để tự thấy | 1.1 ✅ |
| 2 | Cấp nguồn | ✅ | Pin mới đo ~4.7V chứ không đúng 4.5V | 1.1 |
| 3 | LED + 220Ω | ✅ | | 1.2 |
| 4 | Đổi điện trở | ✅ | 10k vẫn thấy le lói (~0.25mA) | 1.4 |
| 5 | Đo áp các điểm | ✅ | 2.30 + 2.20 = 4.50: đúng Kirchhoff áp (2.2) | 1.1, 2.2 |
| 6 | Tính dòng | ⚠️ | Ghi `V(nguồn) = 4.5V` nhưng thế `2.2V` (áp **LED**). Đúng là áp **trên điện trở**: `(4.5 − 2.2)/220 ≈ 10.5mA`. Kết quả trùng số là do may | 1.2, 1.4 |
| 7 | Đo dòng | ✅ | Vẽ pin 9V dán nhãn 5V — bỏ qua, dùng hộp 3×AAA | 1.2 |
| 8 | 2 LED nối tiếp | ⚠️ | Poster tính với 5V. Với 4.5V: 2 LED đỏ chỉ còn ~0.7V cho 220Ω → ~3mA, mờ. Xanh dương/trắng nối tiếp (~6V) thì **không sáng** | 2.1 ✅ |
| 9 | 2 LED song song | ✅ | | 2.1 ✅ |
| 10 | So màu LED | ⚠️ | LED xanh lá đời mới hay là loại ~3V chứ không 2.0–2.4V. Đo ở 4.1 mới biết của mình | 4.1 |
| 11 | Biến trở 10k | ⚠️ | Đúng ý. Hình cắm cả 3 chân không rõ nối chân nào — làm theo **kiểu A** ở trên | 2.3 |
| 12 | Biến trở chia áp | ✅ | Đúng khi không tải; có tải thì xem **kiểu C** | 2.3 |
| 13 | Nút nhấn | ✅ | Nút 4 chân: 2 cặp luôn thông, đặt vắt qua rãnh giữa | — |
| 14 | Pull-up/pull-down | ✅ | | 6.1 |
| 15 | Đo LDR | ✅ | GL5528: sáng phòng cỡ 5–20k, tối ≥ 1MΩ | 2.4 |
| 16 | LDR chia áp | ❌ | Hình vẽ LDR ở **trên** (nối +): sáng → LDR giảm → Vout **tăng**, poster ghi ngược. Quy tắc: `Vout = U·R_dưới/(R_trên+R_dưới)` — con nào ở dưới tăng thì Vout tăng | 2.4 |
| 17 | Thử LDR | ⚠️ | Số đo (sáng 1.24V, tối 3.86V) chỉ đúng khi LDR ở **dưới** — mâu thuẫn với bài 16 | 2.4 |
| 18 | Diode 1N4148 | ✅ | | 4.1 |
| 19 | Đo diode | ✅ | | 4.1 |
| 20 | 1N4148 vs 1N4007 | ✅ | | 4.1 |
| 21 | Tụ 10µF nạp/xả | ⚠️ | `τ = 220Ω × 10µF = 2.2ms` → không thấy tắt dần. Cần R to hơn/tụ to hơn | 3.2 |
| 22 | 10µF vs 100µF | ⚠️ | 100µF × 220Ω = 22ms, vẫn chỉ nháy. Ý đúng, số không | 3.2 |
| 23 | RC delay | ⚠️ | `τ = 100k × 10µF = 1s` đúng. Nhưng LED nối thẳng lên tụ thì qua 100k chỉ có ≤ 45µA, LED gần như không sáng — cần transistor đệm | 3.1, 5.x |
| 24 | S8050 bật LED | ❌ | Ghi chân **B C E**. S8050 TO-92 thông dụng là **E B C** (mặt phẳng hướng về mình, chân chúc xuống) — chưa tra datasheet lô của mình, **dò lại bằng bài 5.1** | 5.1 |
| 25 | Điện trở base | ✅ | | 5.3 |
| 26 | Nút → transistor | ⚠️ | Nhả nút thì chân B thả nổi; thêm 10k–100k từ B xuống GND (bài 14) cho chắc | 5.3, 6.1 |
| 27 | LDR → transistor | ❌ | LDR vẽ ở trên → trời tối áp B **giảm** → LED **tắt**, ngược lời ghi. Muốn tối thì sáng: LDR ở dưới. "Chỉnh độ nhạy" thì thay 10k bằng **biến trở 10k** | 5.4 |
| 28 | Transistor + motor | ❌ | **Không có diode chống xung ngược** — chính là cái bài 29 và 7.4 cảnh báo. Thêm nữa 1k từ 3.3V chỉ cho Ib ~2.6mA, không đủ bão hoà motor ~300mA → transistor nóng | 7.4 |
| 29 | Motor + diode | ✅ | Diode 1N4007 song song motor, vạch (cathode) về +V | 7.4 |
| 30 | Đèn/motor tự động | ❌ | Cùng lỗi LDR của bài 27 | 5.4, 7.4 |

Chung cho cả poster: tính theo 5V (nguồn MB102) — mình dùng 3×AAA nên số đo sẽ thấp hơn một chút.
Không có bài nào mới so với giáo trình; phần giáo trình có mà poster thiếu: Kirchhoff, công suất, nội trở pin, cầu phân áp bị tải, cổng logic, mạch nháy/nhớ.
