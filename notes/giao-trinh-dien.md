# Giáo trình điện cơ bản

Mục tiêu: nắm chắc điện, **nghiêng về robot + nhúng**. Bài nào không dẫn tới mạch nhúng/robot thì không vào đây
(vd thí nghiệm vật lý thuần như motor đồng cực).
Chỉ dùng đồ trong `do-dang-co.md`. Nguồn: 1 hộp 3×AAA (~4.5V) — tính theo áp **đo thực tế**, không theo số danh nghĩa.
Mỗi bài: **đoán trước** kết quả bằng công thức → ráp → đo → so. Lệch nhiều thì dừng lại tìm vì sao, đó mới là bài học.

Tiến độ đánh dấu ngay trong bảng (✅ xong).

## 1. Đo đạc & định luật Ohm

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 1.1 ✅ | Đo áp | Thang DCV, cổng COM/V, cắm ngược → số âm; đo thông mạch | |
| 1.2 | Đo dòng | Que đỏ sang cổng **mA**, đồng hồ cắm **nối tiếp** vào mạch LED + điện trở. Xong trả que về cổng V | Dòng đo vs `(U − U_LED)/R`. **Cấm** chạm 2 que ở cổng mA vào 2 cực nguồn = nối tắt, cháy cầu chì đồng hồ |
| 1.3 | Đo điện trở | Thang Ω, đo khi điện trở **đã rút khỏi mạch**; đọc vòng màu rồi đo đối chiếu | Sai số thực vs dung sai ghi (vòng vàng kim = ±5%). Cầm 2 que bằng 2 tay → điện trở cơ thể (MΩ, đổi khi tay ướt) |
| 1.4 | Định luật Ohm | 1 điện trở vào nguồn: đo U (song song), đo I (nối tiếp), tính `R = U/I`, so với bài 1.3. Làm với 3–4 giá trị | U/I là hằng số với điện trở; **không** hằng số với LED (bài 4.1 giải thích) |
| 1.5 | Công suất | `P = U·I = I²·R`. Tính: điện trở 1/4W nhỏ nhất dám cắm thẳng vào 4.5V là ~81Ω. Cắm 100Ω (~0.2W), sờ | Điện trở ấm lên — năng lượng thành nhiệt. Dưới 81Ω là quá 1/4W → nóng, cháy |
| 1.6 | Nội trở pin | Đo áp hộp pin không tải; rồi mắc 5 con 100Ω **song song** (~20Ω, mỗi con ~0.2W), đo lại — đo nhanh rồi rút | Áp tụt → tính nội trở `r = (U_hở − U_tải)/I`. Đây là lý do ESP32 reset khi pin yếu |

## 2. Mạch điện trở

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 2.1 ✅ | Nối tiếp, song song | Bài 1–10 của kit | |
| 2.2 | Định luật Kirchhoff | **Áp**: 3 điện trở khác giá trị nối tiếp, đo áp từng con. **Dòng**: 2 điện trở song song, đo dòng từng nhánh và dòng tổng | Tổng áp các con = áp nguồn; dòng vào nút = tổng dòng ra. Hai định luật này giải được mọi mạch |
| 2.3 | Biến trở ← **đang ở đây** | RM065 (vặn bằng tua vít). 2 chân: nối tiếp LED, vặn đổi sáng. 3 chân: 2 đầu vào nguồn/GND, chân giữa ra | Áp chân giữa chạy 0 → áp nguồn |
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

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 4.1 | Chiều dẫn & sụt áp | Thang diode: 1N4148, 1N4007, 5 màu LED, cắm thuận rồi ngược | Silicon ~0.6–0.7V; LED đỏ/vàng ~2V, xanh dương/trắng ~3V. Áp gần như cố định dù dòng đổi → vì thế U/I không hằng số (bài 1.4) |
| 4.2 | Chống cắm ngược nguồn | 1N4007 nối tiếp nguồn vào mạch LED; đảo chiều hộp pin | Đảo pin → mạch không sao; cái giá: mất ~0.7V |

## 5. Transistor

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 5.1 | Tìm chân | Thang diode dò S8050 (NPN): chân B dẫn sang cả E lẫn C | B–E ~0.7V, B–C ~0.7V. Đối chiếu datasheet S8050 |
| 5.2 | Khuếch đại | Biến trở nối 3 chân làm chia áp, chân giữa → 100k → chân B (Ib chỉnh được 0 → ~38µA), LED + 220Ω ở chân C, đồng hồ đo dòng C. Dòng B tính từ áp trên điện trở 100k (Ohm) | `Ic ≈ hFE·Ib` (hFE ~100–300) tới khi LED hết sáng thêm = **bão hoà** |
| 5.3 | Công tắc | Tính điện trở chân B để transistor bão hoà chắc chắn (Ib dư 3–5 lần) | Áp C–E ~0.1–0.2V khi dẫn. GPIO chỉ ra vài chục mA → cần transistor cho tải lớn |
| 5.4 | Đèn tự bật khi tối | Quang trở + biến trở 10k chia áp → chân B → LED ở chân C | Áp chân B qua ngưỡng ~0.7V thì LED bật |
| 5.5 | Công tắc chạm tay | 2 S8050 Darlington (C chung, E con 1 → B con 2), ngón tay nối nguồn ↔ B con 1 qua 100k | hFE nhân nhau → dòng µA qua da đủ bật LED |

## 6. Logic & mạch có trạng thái

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 6.1 | Pull-up / pull-down | Nút + 10k kéo lên nguồn; đo điểm giữa khi nhấn/nhả. Rồi **bỏ** điện trở | Nhả: nguồn / nhấn: 0V; bỏ điện trở → số nhảy lung tung ("chân thả nổi") |
| 6.2 | Cổng logic | OR: 2 diode 1N4148 chung cathode + 10k kéo xuống. AND: chung anode + 10k kéo lên. NOT: 1 S8050 | Bảng chân trị bằng đồng hồ: 0/1 thực chất là áp |
| 6.3 | Mạch nháy (astable) | 2 S8050 + 2 tụ 10µF + 2 × 47k (chân B) + 2 LED kèm 470Ω–1k (chân C). **Chân + tụ hướng về chân C** | Mỗi nửa chu kỳ ≈ `0.69·R·C` (~0.3s); đổi R/C → nháy nhanh/chậm. Đây là "clock" |
| 6.4 | Mạch nhớ 1 bit (bistable) | Như 6.3 nhưng thay 2 tụ bằng 10k; 2 nút kéo chân B xuống GND | Nhấn → đổi trạng thái, nhả vẫn **giữ**: flip-flop, ô nhớ dạng thô nhất |

## 7. Cuộn dây & motor

Cần mua thêm: dây đồng emay, nam châm, đinh sắt — xem `can-mua.md`.
Bài 7.1–7.2 là **nối tắt pin có chủ đích** (cuộn dây gần như 0Ω): chỉ dùng pin AAA kiềm, chạm vài giây rồi nhả vì dây và pin nóng nhanh.
**Không bao giờ làm với pin lithium (18650, pin quạt)**: nối tắt kéo hàng chục ampe → cháy.

| # | Bài | Làm gì | Đo / thấy gì |
|---|---|---|---|
| 7.1 | Nam châm điện | Quấn 30 vòng emay quanh đinh sắt (cạo men 2 đầu), nối 1 viên AAA, hút kẹp giấy; thử 60 vòng. Đặt gần la bàn (app điện thoại cũng được) | Có dòng là có từ trường; nhiều vòng → mạnh hơn. Đây là ruột của relay, loa, motor — và là **cuộn cảm** |
| 7.2 | Motor cuộn dây tự quấn | Cuộn 15 vòng emay làm rotor, 2 đầu làm trục; 1 đầu cạo hết men, đầu kia cạo **một nửa** chu vi. 2 kẹp giấy làm giá nối pin, nam châm đặt dưới | Mồi nhẹ là quay. Nửa men còn lại ngắt dòng mỗi nửa vòng = **cổ góp**, đúng cơ chế motor DC chổi than của robot |
| 7.3 | Motor phát điện | Tháo motor quạt dự phòng, đồng hồ DCV vào 2 cực, xoay trục bằng tay | Có áp → khi motor chạy, áp này **chống lại** nguồn. Vì thế motor đứng yên/bị kẹt (khởi động, bánh kẹt) kéo dòng lớn nhất |
| 7.4 | Chạy motor bằng transistor | Đo dòng motor trước (1.2). S8050 chịu ~0.5A → lớn hơn thì dừng, chờ driver. 1N4007 **ngược chiều** song song motor | Áp C–E khi chạy; không diode → cuộn dây bị ngắt đột ngột tạo xung áp cao, có thể giết transistor |

## Xuyên suốt
- **Đọc datasheet**: mỗi linh kiện mới tra 3 số — áp tối đa, dòng tối đa, công suất tối đa.
- **Điện 220V trong nhà: không đụng.** Mọi bài ở đây ≤ 4.5V, chạm tay vô hại; 220V qua người là chết người.

## Phần 2 — Điện cho mạch nhúng (khi có ESP32 + đồ trong `xiaozhi-bom.md`)

Khung, viết chi tiết lúc tới nơi:

| Chương | Nội dung | Dùng ở |
|---|---|---|
| 8. Nguồn | USB 5V → ổn áp 3.3V trên board; tụ lọc sát chân nguồn (tụ gốm 100nF + tụ hoá); **GND chung** giữa các nguồn; sụt áp khi WiFi phát | Mọi mạch |
| 9. GPIO & mức logic | 3.3V vs 5V, dòng tối đa mỗi chân, pull-up nội, chuyển mức; làm lại 6.1 bằng code, chống dội phím | Nút xiaozhi |
| 10. ADC | Đọc biến trở (2.3), quang trở (2.4), đo áp pin qua cầu phân áp (2.5) | Báo pin robot |
| 11. PWM | Chỉnh sáng LED, rồi tốc độ motor (thay chân B bài 7.4 bằng GPIO) | Tốc độ bánh xe |
| 12. Bus số | I2C (OLED), I2S (mic INMP441, ampli MAX98357A): dây nào mang clock, dây nào mang data | Xiaozhi |
| 13. Driver motor | Cầu H (đảo chiều), nhiễu motor lên nguồn ESP32 | Robot |

Mua thêm khi tới Phần 2: **logic analyzer** 8 kênh 24MHz (rẻ, nhìn được I2C/I2S), máy hiện sóng giá rẻ (vd kit DSO138 — kiêm bài tập hàn),
ổn áp AMS1117, module driver motor. IC 555 / op-amp LM358: chỉ khi muốn đào sâu analog.

## Sách đọc kèm
- *Lessons in Electric Circuits* (Tony Kuphaldt) — miễn phí, trên allaboutcircuits.com; tập I (DC) khớp chương 1–3.
- *Make: Electronics* (Charles Platt) — học bằng cách ráp rồi đo, cùng kiểu với giáo trình này.
