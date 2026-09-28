# Giáo trình điện cơ bản

Mục tiêu: nắm chắc điện, **nghiêng về robot + nhúng**. Bài nào không dẫn tới mạch nhúng/robot thì không vào đây
(vd thí nghiệm vật lý thuần như motor đồng cực).
Chỉ dùng đồ trong danh sách Đồ đang có. Nguồn: 1 hộp 3×AAA (~4.5V) — tính theo áp **đo thực tế**, không theo số danh nghĩa.
Mỗi bài: **đoán trước** kết quả bằng công thức → ráp → đo → so. Lệch nhiều thì dừng lại tìm vì sao, đó mới là bài học.

Tiến độ đánh dấu ngay trong bảng (✅ xong). Web tự học đọc thẳng bảng này: http://localhost:4300 (`hoc/`).

## 1. Đo đạc & định luật Ohm

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 1.1 ✅ | Đo áp | Thang DCV, cổng COM/V, cắm ngược → số âm; đo thông mạch | |
| 1.2 | Đo dòng | Que đỏ sang cổng **mA**, đồng hồ cắm **nối tiếp** vào mạch LED + điện trở. Xong trả que về cổng V | Dòng đo vs `(U − U_LED)/R`. **Cấm** chạm 2 que ở cổng mA vào 2 cực nguồn = nối tắt, cháy cầu chì đồng hồ |
| 1.3 | Đo điện trở | Thang Ω, đo khi điện trở **đã rút khỏi mạch**; đọc vòng màu rồi đo đối chiếu | Sai số thực vs dung sai ghi (vòng vàng kim = ±5%). Cầm 2 que bằng 2 tay → điện trở cơ thể (MΩ, đổi khi tay ướt) |
| 1.4 | Định luật Ohm | 1 điện trở vào nguồn: đo U (song song), đo I (nối tiếp), tính `R = U/I`, so với bài 1.3. Làm với 3–4 giá trị | U/I là hằng số với điện trở; **không** hằng số với LED (bài 4.1 giải thích) |
| 1.5 | Công suất | `P = U·I = I²·R`. Tính: điện trở 1/4W nhỏ nhất dám cắm thẳng vào pin 4.78V là ~91Ω. Cắm 100Ω (~0.23W), chạm nhanh | Điện trở ấm lên — năng lượng thành nhiệt. Dưới 91Ω là quá 1/4W → nóng, cháy |
| 1.6 | Nội trở pin | Đo áp hộp pin không tải; rồi mắc 5 con 100Ω **song song** (~20Ω, mỗi con ~0.2W), đo lại — đo nhanh rồi rút | Áp tụt → tính nội trở `r = (U_hở − U_tải)/I`. Đây là lý do ESP32 reset khi pin yếu |

## 2. Mạch điện trở

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 2.1 ✅ | Nối tiếp, song song | Bài 1–10 của kit | |
| 2.2 | Định luật Kirchhoff | **Áp**: 3 điện trở khác giá trị nối tiếp, đo áp từng con. **Dòng**: 2 điện trở song song, đo dòng từng nhánh và dòng tổng | Tổng áp các con = áp nguồn; dòng vào nút = tổng dòng ra. Hai định luật này giải được mọi mạch |
| 2.3 | Biến trở ← **đang ở đây** | RM065 (vặn bằng tua vít). 2 chân: nối tiếp LED, vặn đổi sáng. 3 chân: 2 đầu vào nguồn/GND, chân giữa ra | Áp chân giữa chạy 0 → áp nguồn. Hướng dẫn từng bước: web tự học |
| 2.4 | Cầu phân áp | 10k + 10k; 10k + 20k; thay 1 con bằng **quang trở**, lấy tay che | Áp giữa vs `U·R2/(R1+R2)`. Quang trở: cảm biến = điện trở đổi theo thế giới thật |
| 2.5 | Cầu phân áp bị tải | Cầu 10k + 10k, mắc thêm 1 điện trở song song phía dưới: lần lượt 100k, 10k, 1k | Áp giữa tụt dần (10k → còn 1/3). Cầu phân áp dùng để **đo**, không dùng làm **nguồn** |

## 3. Tụ điện

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 3.1 | Nạp tụ chậm | 100k + tụ 100µF nối tiếp vào nguồn, đồng hồ đo áp trên tụ. **Chân dài tụ hoá = +, cắm ngược có thể phồng/nổ** | `τ = R·C` = 10s: sau 10s tụ lên ~63%, sau ~50s gần đầy. Rút nguồn → áp tụt từ từ |
| 3.2 | Tụ + LED | Tụ 100µF + 1k + LED: nạp rồi rút nguồn. 1 tụ tắt nhanh quá (~0.1s) → ghép **song song** 3–5 tụ | Song song: điện dung cộng lại → LED tắt chậm hơn |
| 3.3 | Tụ nối tiếp | Làm lại 3.1 với 2 tụ 100µF **nối tiếp** | τ còn một nửa: nối tiếp thì điện dung **giảm** (ngược với điện trở) |
| 3.4 | Tụ gốm vs tụ hoá | Làm lại 3.1 với tụ gốm 100nF (`104`) | τ = 10ms, nhanh không kịp nhìn → tụ gốm không để trữ điện, để lọc nhiễu nhanh |

## 4. Diode

Bài 4.3, 4.4 cần mua thêm: diode zener 3.3V (1N4728A), LED RGB 5mm chung cathode, 1 điện trở 150Ω nếu kit thiếu.

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 4.1 | Chiều dẫn & sụt áp | Thang diode: 1N4148, 1N4007, 5 màu LED, cắm thuận rồi ngược | Silicon ~0.6–0.7V; LED đỏ/vàng ~2V, xanh dương/trắng ~3V. Áp gần như cố định dù dòng đổi → vì thế U/I không hằng số (bài 1.4) |
| 4.2 | Chống cắm ngược nguồn | 1N4007 nối tiếp nguồn vào mạch LED; đảo chiều hộp pin | Đảo pin → mạch không sao; cái giá: mất ~0.7V |
| 4.3 | Zener giữ áp | 100Ω + zener 3.3V mắc **ngược** (vạch về phía +); thêm tải 1k, 330Ω, 100Ω | Áp zener gần như đứng yên khi tải nhẹ; tải nặng quá thì zener "đói", áp sập về cầu phân áp |
| 4.4 | LED RGB trộn màu | Dò chân chung bằng thang diode; mỗi màu một điện trở riêng; bật đỏ → + xanh lá → + xanh dương | Đỏ + lục = vàng, cả 3 = trắng: trộn màu cộng. Chung 1 điện trở thì màu đỏ giành hết dòng |

## 5. Transistor

Bài 5.6 cần mua thêm: transistor S8550 (PNP).

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 5.1 | Tìm chân | Thang diode dò S8050 (NPN): chân B dẫn sang cả E lẫn C | B–E ~0.7V, B–C ~0.7V. Đối chiếu datasheet S8050 |
| 5.2 | Khuếch đại | Biến trở nối 3 chân làm chia áp, chân giữa → 100k → chân B (Ib chỉnh được 0 → ~41µA), LED + 220Ω ở chân C, đồng hồ đo dòng C. Dòng B tính từ áp trên điện trở 100k (Ohm) | `Ic ≈ hFE·Ib` (hFE ~100–300); trần ~12.6mA là **bão hoà** — Ib tối đa chỉ ~41µA nên chỉ con hFE ≳ 310 mới chạm |
| 5.3 | Công tắc | Tính điện trở chân B để transistor bão hoà chắc chắn (Ib dư 3–5 lần) | Áp C–E ~0.1–0.2V khi dẫn. GPIO chỉ ra vài chục mA → cần transistor cho tải lớn |
| 5.4 | Đèn tự bật khi tối | Quang trở ở **dưới**; phía trên 47k nối tiếp biến trở 10k (chỉnh ngưỡng) → chân B → LED ở chân C | Áp chân B qua ngưỡng ~0.7V thì LED bật. 47k giữ chân B không bao giờ nối thẳng + |
| 5.5 | Công tắc chạm tay | 2 S8050 Darlington (C chung, E con 1 → B con 2), ngón tay nối nguồn ↔ B con 1 qua 100k | hFE nhân nhau → dòng µA qua da đủ bật LED |
| 5.6 | PNP phía trên tải | S8550: E lên +, tải ở C xuống −; kéo B xuống (qua 10k) thì bật. Rồi đưa B lên 3.2V (giả GPIO mức 1) | B ở 3.2V mà E ở 4.78V: PNP **vẫn bật**. GPIO 3.3V không tắt được PNP nối nguồn cao hơn |

## 6. Logic & mạch có trạng thái

Bài 6.5 cần mua thêm: IC LM358 (vỏ DIP-8).

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 6.1 | Pull-up / pull-down | Nút + 10k kéo lên nguồn; đo điểm giữa khi nhấn/nhả. Rồi **bỏ** điện trở | Nhả: nguồn / nhấn: 0V; bỏ điện trở → số nhảy lung tung ("chân thả nổi") |
| 6.2 | Cổng logic | OR: 2 diode 1N4148 chung cathode + 10k kéo xuống. AND: chung anode + 10k kéo lên. NOT: 1 S8050 | Bảng chân trị bằng đồng hồ: 0/1 thực chất là áp |
| 6.3 | Mạch nháy (astable) | 2 S8050 + 2 tụ 10µF + 2 × 47k (chân B) + 2 LED kèm 470Ω–1k (chân C). **Chân + tụ hướng về chân C** | Mỗi nửa chu kỳ ≈ `0.69·R·C` (~0.3s); đổi R/C → nháy nhanh/chậm. Đây là "clock" |
| 6.4 | Mạch nhớ 1 bit (bistable) | Như 6.3 nhưng thay 2 tụ bằng 10k; 2 nút kéo chân B xuống GND | Nhấn → đổi trạng thái, nhả vẫn **giữ**: flip-flop, ô nhớ dạng thô nhất |
| 6.5 | Bộ so sánh LM358 | Quang trở chia áp vào IN−, biến trở đặt ngưỡng vào IN+, OUT → 470Ω → LED; rồi thêm 100k từ OUT về IN+ | Che tay → LED bật hẳn, không sáng lưng chừng như 5.4. Thêm 100k: hết chập chờn ở ngưỡng (trễ). Đây là con LM393 trên module FC-51 |

## 7. Cuộn dây & motor

Cần mua thêm: dây đồng emay, nam châm, đinh sắt.
Bài 7.1–7.2 là **nối tắt pin có chủ đích** (cuộn dây gần như 0Ω): chỉ dùng pin AAA kiềm, chạm vài giây rồi nhả vì dây và pin nóng nhanh.
**Không bao giờ làm với pin lithium (18650, pin quạt)**: nối tắt kéo hàng chục ampe → cháy.

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 7.1 | Nam châm điện | Quấn 30 vòng emay quanh đinh sắt (cạo men 2 đầu), nối 1 viên AAA, hút kẹp giấy; thử 60 vòng. Đặt gần la bàn (app điện thoại cũng được) | Có dòng là có từ trường; nhiều vòng → mạnh hơn. Đây là ruột của relay, loa, motor — và là **cuộn cảm** |
| 7.2 | Motor cuộn dây tự quấn | Cuộn 15 vòng emay làm rotor, 2 đầu làm trục; 1 đầu cạo hết men, đầu kia cạo **một nửa** chu vi. 2 kẹp giấy làm giá nối pin, nam châm đặt dưới | Mồi nhẹ là quay. Nửa men còn lại ngắt dòng mỗi nửa vòng = **cổ góp**, đúng cơ chế motor DC chổi than của robot |
| 7.3 | Motor phát điện | Tháo motor quạt dự phòng, đồng hồ DCV vào 2 cực, xoay trục bằng tay | Có áp → khi motor chạy, áp này **chống lại** nguồn. Vì thế motor đứng yên/bị kẹt (khởi động, bánh kẹt) kéo dòng lớn nhất |
| 7.4 | Chạy motor bằng transistor | Đo dòng motor trước (1.2). S8050 chịu ~0.5A → lớn hơn thì dừng, chờ driver. 1N4007 **ngược chiều** song song motor | Áp C–E khi chạy; không diode → cuộn dây bị ngắt đột ngột tạo xung áp cao, có thể giết transistor |

## 0. Hàn chân cắm

Module mic/ampli/OLED hay giao kèm hàng rào chân rời: phải hàn trước khi cắm breadboard. Cần đồ nghề hàn (mỏ hàn chỉnh nhiệt, thiếc, đế, búi đồng), kính bảo hộ, thảm silicon, bo đục lỗ.
Mỏ hàn cắm điện 220V và nóng ~330°C: luôn gác lên đế, rút điện khi rời bàn. Không hàn gì đang nối pin.

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 0.1 | Mối hàn đầu tiên | Hàn 4 điện trở 1k thành chuỗi trên bo đục lỗ, uốn chân làm dây nối | Mối đạt bóng, hình nón. Đo 2 đầu chuỗi ≈ 4k; 2 pad cạnh nhau không thông |
| 0.2 | Hàn header lên module | Cắm header vào breadboard làm đồ gá, đặt module lên, hàn 2 chân đầu, kiểm thẳng rồi hàn nốt | Header vuông góc; thông mạch từng chân ↔ pad, 2 chân cạnh nhau không thông |
| 0.3 | Gỡ mối hàn | Gỡ 1 điện trở khỏi chuỗi 0.1 bằng bơm hút / bấc, hàn con mới vào | Gỡ xong: chuỗi hở (1). Hàn lại: về ≈ 4k |
| 0.4 | Chuyển mạch lên bo | Mạch 4.2 (1N4007 + 220Ω + LED) hàn lên bo đục lỗ, cấp pin qua 2 chân header | Đo Ω trước khi cấp pin; LED sáng như trên breadboard, lắc bo không chập chờn |

## Xuyên suốt
- **Trước khi cấp nguồn, mọi mạch**: ráp khi chưa có pin → đo Ω giữa `+` và `−` → phải ra đúng con số đã tính
  (không bao giờ gần 0Ω). Sửa mạch = rút pin, ráp lại, đo lại. Đã cháy 1 biến trở vì bỏ bước này (2.3).
- **Khói / mùi khét / linh kiện nóng đỏ**: rút pin ngay — không sờ linh kiện đó tới khi nguội. Linh kiện đã bốc khói
  thì bỏ, kể cả khi còn chạy.
- **Đọc datasheet**: mỗi linh kiện mới tra 3 số — áp tối đa, dòng tối đa, công suất tối đa.
- **Điện 220V trong nhà: không đụng.** Mọi bài ở đây ≤ 4.5V, chạm tay vô hại; 220V qua người là chết người.

## Phần 2 — Điện cho mạch nhúng (khi có ESP32 + mic, ampli, OLED của xiaozhi)

Nguồn đổi: USB 5V từ máy tính cấp cho board, board tự hạ xuống 3.3V. Chân GPIO của ESP32-S3 là **3.3V, không chịu 5V**.
Mọi bài: rút USB rồi mới cắm/rút dây; chưa cắm USB thì đo Ω `3V3`–`GND` và `5V`–`GND` — không bao giờ gần 0Ω.
Số liệu chip đã đối chiếu datasheet ESP32-S3 v2.2 + ESP-IDF docs (2026-09-28): mọi chân chịu tối đa 3.6V; mức 1 ≥ 2.48V, mức 0 ≤ 0.83V;
mặc định 20mA/chân (GPIO17/18: 10mA); ADC suy hao 12dB đo đúng 0–2.9V. Code các bài: `sandbox/esp32-bai/` (đã build, chưa chạy trên chip).
Chân của mic/ampli/OLED/nút lấy theo board `bread-compact-wifi` của xiaozhi.

## 8. Nguồn

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 8.1 | Nhận board ESP32-S3 | Chưa cắm gì: đọc chữ in cạnh từng chân (3V3, 5V, GND, số GPIO), chụp lại. Đo Ω 3V3–GND, 5V–GND. Cắm USB, đo DCV 5V–GND và 3V3–GND | 5V ≈ 4.8–5.1V (áp USB), 3V3 ≈ 3.3V: ổn áp trên board hạ 5V → 3.3V. Ghi lại làm mốc |
| 8.2 | Ổn áp AMS1117 | Module AMS1117-3.3 cấp từ hộp 3×AAA, đo đầu ra; so khi pin mới và pin yếu | Cần áp vào ≳ 4.4V (sụt ~1.1V) mới ra đủ 3.3V → hộp 4.5V chỉ vừa sát ngưỡng: ổn áp tuyến tính cần "dư áp" |
| 8.3 | GND chung | LED ở mạch hộp pin, bật bằng GPIO qua S8050. Thử chưa nối GND hộp pin với GND board, rồi nối | Chưa chung GND: LED không bật — áp chân B "so với cái gì" không xác định. Mọi nguồn trong một mạch phải chung GND |
| 8.4 | Tụ lọc sát chân nguồn | Tụ gốm 100nF + tụ hoá 10µF sát chân nguồn module; đo 3V3 khi WiFi bật/tắt | Đồng hồ chỉ thấy áp trung bình; xung sụt cỡ ms phải xem bằng máy hiện sóng. Tụ là kho điện nhỏ bù chỗ sụt đó |

## 9. GPIO & mức logic

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 9.1 | Nháy LED ngoài | GPIO → 330Ω → LED → GND, code nháy 1s | Tính trước `I = (3.3 − 1.9)/330 ≈ 4mA`; đo dòng (1.2) cho khớp |
| 9.2 | Dòng tối đa mỗi chân | Tra datasheet dòng mỗi chân + tổng; tính điện trở nhỏ nhất cho LED từ GPIO | Giữ mỗi chân ≲ 20mA. Motor/loa/relay không bao giờ nối thẳng GPIO → transistor/driver (5.3) |
| 9.3 | Đọc nút | Làm lại 6.1: nút + 10k kéo lên 3V3 vào GPIO, in 0/1 ra Serial; rồi bỏ 10k, bật pull-up nội | Nhả = 1, nhấn = 0. Bỏ điện trở mà chưa bật pull-up nội → đọc lung tung (chân thả nổi) |
| 9.4 | Chống dội phím | Đếm số lần nhấn: nhấn 1 lần đếm ra nhiều lần. Sửa bằng code (chờ ~20ms), rồi thử tụ 100nF song song nút | Tiếp điểm kim loại nảy vài ms → bật/tắt nhiều lần. Nút xiaozhi (47/40/39) cần xử lý này |
| 9.5 | 5V vs 3.3V | Cầu phân áp 10k/20k hạ 5V → ~3.3V, **đo bằng đồng hồ trước** rồi mới nối vào GPIO | GPIO không chịu 5V. Tín hiệu 5V → hạ áp hoặc module chuyển mức |
| 9.6 | Chân không được đụng | Đọc bảng chân: strapping (GPIO0, 3, 45, 46), flash/PSRAM (26–37 trên bản N16R8), USB (19, 20) | Cắm nhầm: board không khởi động hoặc không nạp code được. Config xiaozhi đã né các chân này |
| 9.7 | UART | UART1: TX GPIO10 → 1k → RX GPIO11 (tự gửi tự nhận); đo TX lúc nghỉ; rút dây | Nhận lại đúng chuỗi sau ≈ 1ms (12 byte ở 115200). TX nghỉ ở mức 1 (3.3V). Rút dây: hết giờ |
| 9.8 | Ngắt | Nút GPIO12 + LED GPIO13: 10s hỏi vòng mỗi 250ms, 10s dùng ngắt; timer phần cứng 1kHz | Hỏi vòng: LED trễ, bấm nhanh bị sót. Ngắt: tức thì, in độ trễ ngắt → task vài chục µs. Timer ≈ 1000 nhịp/s |

## 10. ADC

Chỉ dùng chân ADC1 (GPIO1–10); ADC2 bị WiFi chiếm. Áp vào chân ADC luôn ≤ 3.3V — đo bằng đồng hồ trước khi nối. Dải đo đúng 0–2.9V: trên đó số đứng ở 4095.

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 10.1 | Đọc biến trở | Biến trở kiểu B (2.3) cấp bằng **3V3** (không phải 5V), con trượt vào chân ADC1; in số đọc + đổi ra V | Số chạy 0 → 4095 (12 bit), đứng ở 4095 từ ~2.9V. So với đồng hồ đo cùng điểm |
| 10.2 | Đọc quang trở | Cầu phân áp 10k + quang trở (2.4) vào ADC; đặt ngưỡng bật LED bằng code | Mạch 5.4 làm lại bằng phần mềm: cảm biến tương tự → số → quyết định |
| 10.3 | Đo áp pin | Cầu 10k + 10k chia đôi áp hộp pin (4.8V → 2.4V), đo điểm giữa bằng đồng hồ rồi mới nối ADC; code nhân 2 | Cách robot biết pin yếu. So số ADC với đồng hồ đo thẳng pin |
| 10.4 | Sai số ADC | Đo 5 mức áp (vặn biến trở) bằng cả ADC và đồng hồ, ghi bảng lệch | ADC lệch và kém tuyến tính sát 0V và sát đỉnh → dùng hiệu chuẩn của ESP-IDF, không đo sát 2 đầu dải |

## 11. PWM

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 11.1 | Chỉnh sáng LED | PWM (LEDC) 5kHz trên mạch 9.1, duty 0 → 100% | Mắt thấy sáng dần dù chân chỉ có 0V hoặc 3.3V |
| 11.2 | Đo PWM bằng đồng hồ | DCV đo chân PWM ở duty 25/50/75% | Đồng hồ ra ≈ duty × 3.3V — áp trung bình. Logic analyzer mới thấy xung thật |
| 11.3 | PWM chạy motor | Mạch 7.4, chân B nối GPIO qua 470Ω (1k chỉ cho ~2.5mA, thiếu cho motor ~0.3A); GND chung; diode 1N4007 ngược song song motor | Tốc độ theo duty. Motor lấy nguồn riêng, không lấy 3V3 của board |
| 11.4 | Còi PWM | Còi thụ động qua S8050 từ 3V3 (100Ω nối tiếp, 1N4148 ngược song song); đổi tần số chơi gam Đô | Tần số quyết định nốt; còi to nhất quanh 2–4kHz. Còi chủ động thì chỉ kêu một tiếng |

## 12. Bus số

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 12.1 | I2C: OLED | OLED 0.96": VCC, GND, SCL=42, SDA=41 (thứ tự chân **đọc chữ in** trên module); chạy i2c scan, rồi vẽ chữ | Thấy địa chỉ (thường 0x3C). SCL = clock, SDA = data, cả 2 cần điện trở kéo lên |
| 12.2 | I2S: mic INMP441 | VDD = **3V3** (không 5V), GND, WS=4, SCK=5, SD=6, L/R → GND; in mức âm thanh | SCK = clock từng bit, WS = đang gửi kênh trái hay phải, SD = data |
| 12.3 | I2S: ampli MAX98357A + loa | VIN = 5V, GND, DIN=7, BCLK=15, LRC=16; phát 1 tone | 2 đầu loa nối thẳng ampli, **không** nối đầu nào của loa xuống GND. Volume vừa phải, loa điện thoại yếu |
| 12.4 | Nhìn bus bằng logic analyzer | Kẹp CH0/CH1 vào SCL/SDA, bắt 1 gói I2C | Thấy từng bit địa chỉ + ACK — chính là việc "i2c scan" làm |
| 12.5 | Ráp xiaozhi | Ghép 2 breadboard, ráp đủ mic + ampli + OLED + nút theo `bread-compact-wifi-128x64` | Nói chuyện được qua server riêng — mục tiêu 1 của lộ trình |

## 13. Driver motor

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 13.1 | Cầu H | Module driver (chọn lúc tới nơi), 2 chân IN từ GPIO, đảo chiều motor | 4 công tắc bắt chéo: đổi cặp đóng → đổi chiều dòng qua motor. 2 công tắc cùng một nhánh mà cùng đóng = nối tắt |
| 13.2 | Tốc độ + chiều | PWM vào chân IN/EN, chạy 2 chiều × 3 tốc độ | Đúng thứ bánh xe robot cần |
| 13.3 | Nhiễu motor lên ESP32 | Cho motor chung nguồn với board, xem board có reset / OLED nhảy khi motor khởi động; rồi tách nguồn + GND chung + tụ | Motor khởi động kéo dòng lớn → sụt áp → ESP32 reset (brownout) |
| 13.4 | MOSFET chạy motor | IRLZ44N thay S8050 ở mạch 11.3: G ← GPIO14 qua 220Ω, 10k G→S, diode ngược song song motor | U_DS khi dẫn chỉ vài chục mV so với U_CE ~0.2V của S8050: MOSFET mát hơn, gánh được dòng lớn |

Mua thêm khi tới Phần 2: **logic analyzer** 8 kênh 24MHz (rẻ, nhìn được I2C/I2S), máy hiện sóng giá rẻ (vd kit DSO138 — kiêm bài tập hàn),
ổn áp AMS1117, module driver motor. IC 555 / op-amp LM358: chỉ khi muốn đào sâu analog.

## Phần 3 — Robot: cảm biến, chuyển động, pin (khi có đồ đợt 4)

Mục tiêu: robot 2 bánh kiểu robot hút bụi tự tránh vật. Số liệu từng linh kiện đã đối chiếu datasheet.
Quy tắc mới cho mọi module cảm biến: **đo áp chân OUT bằng đồng hồ trước khi nối vào GPIO** — phải ≤ 3.3V. Module cấp 5V thì chân OUT thường cũng lên 5V.
Từ chương 16 có **pin lithium**: nối tắt = hàng chục ampe, cháy thật. Làm trên mặt bàn không có đồ dễ cháy, không bỏ đi khi đang sạc.

## 14. Cảm biến tránh vật

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 14.1 | Công tắc va chạm | Công tắc hành trình 3 chân (COM/NO/NC): dò chân bằng thang thông mạch, rồi COM → GND, NO → GPIO12 bật pull-up nội | NO thông COM chỉ khi nhấn. Đây là "cản va" phía trước robot hút bụi |
| 14.2 | Hồng ngoại tránh vật | Module FC-51 cấp **3V3**, đo OUT lúc có/không có tay chắn, rồi mới nối GPIO8; vặn biến trở chỉnh tầm | OUT ≈ 3.3V khi trống, ≈ 0V khi có vật. Vật màu đen, nắng chiếu → bắt kém |
| 14.3 | Siêu âm HC-SR04 | VCC 5V, TRIG ← GPIO17, ECHO → cầu 10k/20k (9.5) → GPIO18, đo 5V + Ω 2 con rồi tính áp Echo ≤ 3.45V trước khi nối; in khoảng cách | `cm = µs / 58`. Tường 20cm → xung ≈ 1160µs. Vật mềm/xiên → đo sai |
| 14.4 | Chống rơi TCRT5000 | Module TCRT5000 cấp 3V3 úp xuống bàn: DO → GPIO21, AO → GPIO2 (ADC); đưa ra mép bàn | Mặt bàn sáng: AO thấp, DO = 0; nhấc lên / mép bàn: AO cao, DO = 1. Robot hút bụi dùng cách này để không lăn xuống cầu thang |

## 15. Chuyển động có phản hồi

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 15.1 | Servo SG90 | Nguồn servo từ hộp 3×AAA, GND chung, dây cam ← GPIO14; PWM 50Hz, xung 1 / 1.5 / 2ms | Servo đứng ở 3 góc và **giữ** góc đó khi bị đẩy nhẹ: bên trong có biến trở đo góc + mạch tự chỉnh |
| 15.2 | Đếm vòng bánh xe | Motor TT + đĩa 20 lỗ + cảm biến khe quang (đo OUT trước) → GPIO11, đếm bằng PCNT; motor chạy qua DRV8833 | Xung/giây ÷ 20 × 60 = vòng/phút. Pin 4.5V không tải ≈ 185 vòng/phút ≈ 62 xung/s |
| 15.3 | Quay đúng góc bằng IMU | GY-521 (MPU-6050) chung bus I2C với OLED (41/42), đọc gyro Z, cộng dồn ra góc | Xoay board 90° trên bàn → in ≈ 90°. Để yên lâu → góc trôi dần: sai số cộng dồn |
| 15.4 | Giữ tốc độ bằng PI | Mạch 15.2; code đo tốc độ mỗi 200ms, chỉnh duty theo sai lệch: pha P rồi pha PI; hãm tay | P: luôn thiếu đích. PI: bám đích, hãm tay thì duty tự tăng giữ tốc độ |

## 16. Pin lithium cho robot

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 16.1 | Cell 18650 + sạc TP4056 | Đo áp cell trước (< 2.5V hoặc phồng → bỏ). Module TP4056 loại **6 chân có bảo vệ**, cell trong đế 1 ô, sạc bằng cục sạc điện thoại 5V | Đèn đỏ = đang sạc, xanh = đầy; đầy đo 4.14–4.26V. Không để qua đêm, không bỏ đi khi đang sạc |
| 16.2 | Pack 2S + mạch bảo vệ | 2 cell lệch nhau ≤ 0.1V, hộp 2×18650 nối tiếp + BMS 2S (B−, BM, B+, P−, P+); đo từng cell và cả pack | Pack = tổng 2 cell (~7.4V, đầy 8.4V). Sạc: tháo từng cell ra sạc riêng bằng 16.1 — **không** sạc 2S bằng TP4056 |
| 16.3 | Hạ áp LM2596 → 5V | Chỉnh biến trở module cho ra 5.0V **khi chưa nối tải**, rồi mới nối chân 5V board (rút USB); đo pin qua ADC (cầu 20k/10k) | Hạ áp xung hiệu suất ~80%, không nóng như AMS1117 (8.2). Pin cạn ~6V: đầu ra tụt dưới 5V vì LM2596 cần dư ~1.5V |

## 17. Ghép robot

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 17.1 | Robot tự tránh vật | Khung 2WD: DRV8833 + 2 motor TT từ pack 2S, LM2596 → 5V board, HC-SR04 + FC-51 + công tắc va chạm; chạy thử khi **bánh nhấc khỏi mặt bàn** | Gặp vật / chạm → dừng, lùi, quay rồi đi tiếp. Pin dưới 6.6V (3.3V/cell) → tự dừng |
| 17.2 | Xiaozhi điều khiển bánh xe | Firmware tự build có tool `self.robot.move`; server riêng chuyển tool của chip cho Gemini; nói "tiến lên một giây" (bánh nhấc khỏi bàn) | Robot chạy đúng hướng rồi tự dừng; log server in lần gọi tool |

Mua thêm (đợt 4): đồ của Phần 3 — mục Đồ cần của từng bài liệt kê đủ.

## Sách đọc kèm
- *Lessons in Electric Circuits* (Tony Kuphaldt) — miễn phí, trên allaboutcircuits.com; tập I (DC) khớp chương 1–3.
- *Make: Electronics* (Charles Platt) — học bằng cách ráp rồi đo, cùng kiểu với giáo trình này.
