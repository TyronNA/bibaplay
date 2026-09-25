# Pin lithium — ghi chú an toàn

## Con số
- 1 cell Li-ion: danh nghĩa 3.6–3.7V, đầy **4.2V**, cạn ~3.0V.
- Nối tiếp cộng áp: 2S = 7.2V danh nghĩa, đầy **8.4V**. Song song cộng dung lượng, áp giữ nguyên.
- Mạch sạc phải đúng số cell: TP4056/TP4057 chỉ cho **1S**. Pin 2S cần mạch sạc 2S.
- Module 5V (MAX98357A VIN tối đa ~5.5V) không cắm thẳng pin 2S → cần buck hạ áp 5V.

## Đo
- Thang **DCV 20V**, que COM + que V. Ở DCV chạm cặp nào cũng an toàn (đồng hồ gần như không cho dòng qua).
- **Không** đo pin ở thang A (gần như nối tắt 2 cực) hay Ω.
- Board bảo vệ 2S: `B+` (+ của pack), `BM` (điểm giữa 2 cell), `B−`, `P+`/`P−` (đầu ra sau bảo vệ).
  B+↔BM = áp 1 cell. Đầu ra 0V trong khi cell còn áp = mạch bảo vệ đã ngắt.

## Ngưỡng mỗi cell
| Áp | Kết luận |
|---|---|
| ≥ 3.0V | ổn |
| 2.5–3.0V | xả sâu, cân nhắc |
| < 2.5V (nhất là < 2.0V) | bỏ — sạc lại có thể tạo gai đồng → chập trong |
| Phồng (dù nhẹ) | bỏ, không ấn/chọc/sạc |

## Xử lý pin hỏng
Dán băng keo kín cực/board → để trong bát sứ, xa đồ dễ cháy → điểm thu gom pin. Không bỏ thùng rác thường.

## Đã kiểm (2026-09-25)
| Pin | Kết quả |
|---|---|
| Pack 2S 7.2V 2680mAh (loa, 5 dây) | 1 cell ~2V, P− 0V (bảo vệ ngắt), dây đầu ra đứt → **bỏ** |
| Nokia BL-5C 3.7V 1000mAh | phồng nhẹ, 0V → **bỏ** |
| Hộp sạc tai nghe, Xiaomi band, điện thoại HTC nguyên khối | không tháo — rủi ro thủng pin > giá trị linh kiện |
| Quạt cầm tay 5V (dự phòng) | còn tốt → giữ nguyên, sạc 2–3 tháng/lần, tháo khi cần pin/motor |
