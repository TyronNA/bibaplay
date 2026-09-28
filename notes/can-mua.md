# Cần mua

Chưa kiểm giá/shop cụ thể. Mua xong thì chuyển món sang `do-dang-co.md`.

## Đợt 1 — mua ngay (giáo trình Phần 1 + tập hàn)

**Dụng cụ hàn**
| Món | Chọn loại nào | Vì sao |
|---|---|---|
| Mỏ hàn **chỉnh được nhiệt** ~60W | Có núm chỉnh nhiệt, kèm vài mũi thay | Loại cắm thẳng không chỉnh nhiệt dễ quá nóng → bong mạch in. Hàn ở ~320–350°C |
| Đế mỏ hàn + búi đồng lau mũi | Búi đồng tốt hơn bọt biển ướt (không làm mũi sốc nhiệt) | Mỏ hàn nóng để lung tung = bỏng / cháy bàn |
| Thiếc hàn 0.6–0.8mm | Có lõi nhựa thông; Sn63/Pb37 (có chì) dễ ăn nhất cho người mới — rửa tay sau khi hàn | |
| Flux / nhựa thông | Hộp nhựa thông hoặc bút flux | Giúp thiếc chảy bám vào chân |
| Dây hút thiếc (bấc đồng) | Bản 2–3mm | Gỡ mối hàn hỏng |
| Kit tập hàn THT | Bo có sẵn lỗ + linh kiện chân cắm (vd kit mạch nháy LED) | Tập trước khi đụng module thật |

**Dụng cụ cầm tay**
| Món | Chọn loại nào | Vì sao |
|---|---|---|
| Nhíp | Bộ 2 cây: mũi thẳng + mũi cong, loại chống tĩnh điện | Gắp linh kiện nhỏ, giữ dây lúc hàn |
| Kìm cắt chân mini | Lưỡi phẳng một mặt | Cắt chân linh kiện sát mối hàn |
| Kìm tuốt dây | Có lỗ theo cỡ dây 20–30AWG | Tuốt vỏ dây không đứt lõi |
| Kẹp "bàn tay thứ ba" | Có đế nặng + 2 kẹp cá sấu | Giữ bo khi 2 tay bận mỏ hàn + thiếc |
| Bộ tua vít mini | Có đầu dẹt 2mm | Vặn biến trở RM065 |

**Linh kiện / vật tư**
| Món | Vì sao |
|---|---|
| Breadboard MB-102 830 lỗ × 1 (thêm) | ESP32-S3 44 pin phải ghép **2** cái |
| Dây điện lõi đơn (solid) 22AWG, 3–4 màu | Cắt dây đúng độ dài cho breadboard gọn; lõi đơn cắm lỗ không tuột (dây nhiều sợi thì tuột) |
| Dây đồng **emay** 0.3–0.5mm (1 cuộn nhỏ) | Chương 7: nam châm điện, motor tự quấn. Có lớp men cách điện — cạo men mới hàn/nối được |
| Nam châm đất hiếm tròn ~10–15mm × 1–2 | Chương 7 |
| Đinh sắt / bu lông, kẹp giấy, giấy nhám | Chương 7 — mua ở tiệm kim khí/văn phòng phẩm |

## Đợt 2 — xiaozhi
Giỏ đã chốt: `xiaozhi-bom.md`. Thêm dây jumper **đực–cái** (module có chân đực ↔ breadboard/ESP32).

## Đợt 3 — mua khi tới Phần 2 / robot
Logic analyzer 8 kênh 24MHz, module ổn áp AMS1117 3.3V, driver motor + khung robot (chọn lúc tới bước 5 — chọn motor/driver trước rồi mới chọn pin).

## Đợt 4 — Phần 3 robot (chương 14–17)
Số liệu và nguồn từng món: `datasheet-robot.md`. Chưa kiểm giá/shop.

| Món | Chọn loại nào | Vì sao |
|---|---|---|
| Công tắc hành trình KW11-3Z × 2 | Loại có cần gạt (lá hoặc bánh xe nhỏ), 3 chân COM/NO/NC | Cản va trước robot (14.1) |
| Module hồng ngoại tránh vật FC-51 × 2 | 3 chân VCC/GND/OUT, có biến trở xanh | 14.2; chạy được 3.3V |
| Cảm biến siêu âm HC-SR04 × 1 | Bản thường (5V); bản "HC-SR04P" / 3.3–5V cũng được | 14.3 |
| Module TCRT5000 × 2 | 4 chân VCC/GND/DO/AO | Chống rơi mép bàn/cầu thang (14.4) |
| Servo SG90 × 1 | Loại bánh răng nhựa là đủ | 15.1 |
| Khung robot 2WD | Bộ có sẵn 2 motor TT 1:48 + 2 bánh + bánh mắt trâu + **2 đĩa encoder 20 lỗ** + đế pin | 15.2, 17.1 — mua bộ thì motor/bánh khớp nhau |
| Cảm biến tốc độ khe quang × 2 | Module LM393 khe 5mm (FC-03 / "speed sensor"); ghi rõ 3.3V thì tốt, loại chỉ 5V thì cần cầu phân áp | 15.2 |
| Module GY-521 (MPU-6050) × 1 | | 15.3 |
| Module driver **DRV8833** × 1 | 2 kênh; hỏi shop chip vỏ HTSSOP (1.5A/kênh) — vỏ TSSOP chỉ 0.5A/kênh | Thay "driver motor" chung ở chương 13; chạy từ 2.7V |
| Cell 18650 × 2 (+1 dự phòng) | **Hàng hãng** (Samsung / LG / Sony-Murata / Molicel) từ shop uy tín; cùng loại, cùng đợt | Cell không rõ hãng thường ghi dung lượng ảo, không rõ dòng xả |
| Module TP4056 **6 chân** (có DW01A + 8205A) × 1 | Có 2 cọc OUT+/OUT− ngoài B+/B−; cổng Type-C | 16.1 — loại 4 chân không có bảo vệ xả |
| Đế pin 18650 1 ô × 1 + hộp 2 ô nối tiếp × 1 | Có dây đỏ/đen; hộp 2 ô có công tắc thì tốt | 16.1, 16.2 |
| Mạch bảo vệ BMS **2S** × 1 | Có cọc B−, BM, B+, P−, P+; dòng ≥ 3A | 16.2 — không dùng BMS 3S/4S cho pack 2S |
| Module hạ áp LM2596 × 1 | Loại có biến trở chỉnh (ADJ) | 16.3 |
| Điện trở 20k (nếu kit thiếu) | | Cầu đo pin 2S (16.3) |
