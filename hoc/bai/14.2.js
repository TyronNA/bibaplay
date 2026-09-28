// Bài 14.2 — FC-51. Module cắm VCC 10a, GND 11a, OUT 12a (thứ tự giả định — đọc chữ in).
// 3V3 → 10c, GND → 11c. Đo OUT (12d) trước, rồi mới GPIO8 → 12c.
(function () {
  const IR = { id: 'ir', loai: 'mod', ten: 'FC-51', mau: 'xanhduong', chan: [['VCC', '10a'], ['GND', '11a'], ['OUT', '12a']] };
  const ESP0 = K.esp({ GND: '11c', '3V3': '10c' });
  const ESP1 = K.esp({ GND: '11c', '3V3': '10c', G8: '12c' });
  const sd = SD;
  const soDo = sd.svg(300, 180, sd.chu(20, 20, 'VCC = 3V3', 'sd-pos') + sd.day('40,26 200,26') + sd.tro(200, 26, 50, '10k') + sd.cham(200, 76) + sd.day('200,76 262,76') + sd.chu(230, 70, 'OUT', 'sd-chu')
    + sd.hop(120, 70, 60, 40, 'LM393') + sd.day('180,90 200,90 200,76') + sd.chu(40, 146, 'thấy hồng ngoại dội về', 'sd-mo') + sd.chu(40, 164, '→ LM393 kéo OUT xuống 0', 'sd-mo'),
  'Ngõ ra FC-51: LM393 chỉ kéo xuống; mức cao là nhờ điện trở 10k lên VCC');
  BAI.dangKy({
    id: '14.2',
    muc_tieu: 'Module hồng ngoại FC-51 báo "có vật phía trước" bằng một chân số. Học quy tắc mới của Phần 3: cấp nguồn module, <b>đo chân OUT trước</b>, ≤ 3.3V mới nối GPIO.',
    can: [...K.coBanEsp(3), K.can.fc51()],
    kien_thuc: `<p>Bóng trong phát hồng ngoại liên tục, bóng đen thu. Có vật trước mặt → hồng ngoại dội về bóng thu → chip so sánh LM393 thấy tín hiệu vượt ngưỡng (đặt bằng biến trở xanh) → kéo OUT xuống 0V, đèn báo trên module sáng.</p>
      <p><b>Vì sao cấp 3V3 chứ không 5V:</b> LM393 chỉ biết kéo chân OUT xuống. Mức "1" có được là nhờ điện trở 10k trên module nối OUT lên <b>VCC</b> (sơ đồ mạch FC-51). Cấp 5V thì OUT lên 5V — quá 3.6V chân GPIO chịu. Cấp 3V3 thì OUT tối đa 3.3V.</p>
      <p>Tầm quảng cáo 2–30cm, nhưng phụ thuộc màu và mặt vật: giấy trắng thấy xa, vải đen gần như không thấy. Nắng chiếu thẳng vào bóng thu làm báo sai.</p>
      <p>Thứ tự 3 chân mỗi shop một kiểu (VCC-GND-OUT hoặc OUT-GND-VCC): nối theo <b>chữ in</b>.</p>`,
    so_do: [{ nhan: 'Ngõ ra', svg: soDo, chu: 'OUT cao = VCC qua 10k, thấp = LM393 kéo xuống.' }],
    code: 'sandbox/esp32-bai/main/bai_14_2.c',
    du_doan: '<p>Tay cách ~10cm: OUT ≈ 0V, monitor in "CO VAT". Bỏ tay ra: OUT ≈ 3.3V, in "trong".</p>',
    phan: [{
      ten: 'Phần 1 · Nguồn module, đo OUT, rồi mới nối GPIO',
      buoc: [
        { ten: 'Cắm FC-51, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm 3 chân module vào 10a, 11a, 12a, bóng hồng ngoại hướng ra ngoài. Đọc chữ in: cột 10 = ?, 11 = ?, 12 = ?'], board: { them: [IR] },
          kiem: { thay: 'Biết chắc cột VCC, GND, OUT.', neu_khong: 'Thứ tự khác hình: vẫn cắm vào 10–12 nhưng đổi dây ở bước sau cho khớp chữ in.' } },
        { ten: 'Chỉ 2 dây nguồn', lam: ['<code>3V3</code> → cột VCC (10c) — <b>không phải 5V</b>. <code>GND</code> → cột GND (11c). Chưa nối gì vào cột OUT.'], board: { them: [ESP0] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 10d (VCC), que đen 11d (GND).'], board: { them: [K.dh('Ω 200k', '10d', '11d', '> 0.1')] },
          kiem: { thay: 'Không dưới ~100Ω (thường vài kΩ, song song mốc 8.1).', neu_khong: 'Gần 0: VCC chạm GND. Không cắm USB.' } },
        K.doOut('Đo chân OUT', ['Que đỏ 12d (OUT), que đen 11d (GND). Đọc khi không có gì trước module, rồi khi đưa bàn tay cách ~10cm.'], '12d', '11d', '≈ 3.3 / 0',
          'Trống: 3.2–3.4V. Có tay: dưới 0.5V, đèn báo trên module sáng.'),
        K.rutUsb(),
        { ten: 'Nối OUT → GPIO8', lam: ['USB đã rút. Chân <code>8</code> → <b>12c</b>.'], board: { bo: ['esp'], them: [ESP1] } },
        K.camUsb('Cắm USB, nạp 14.2', ['<code>idf.py menuconfig</code> → 14.2, <code>flash monitor</code>. Đưa tay lại gần, ra xa; thử tờ giấy trắng và một vật màu đen.'], {}, { thay: 'In "CO VAT" / "trong" khớp đèn báo trên module. Giấy trắng thấy xa hơn vật đen.', neu_khong: 'Luôn "CO VAT": vặn biến trở ngược chiều kim đồng hồ (giảm tầm). Luôn "trong": vặn theo chiều kim đồng hồ.' }),
        { ten: 'Chỉnh tầm bằng biến trở', lam: ['Dùng tua vít vặn biến trở xanh từng chút. Tìm vị trí mà tay cách ~15cm thì vừa báo. Đo khoảng cách bằng thước, ghi vào bảng.'], board: { sua: { esp: { usb: true } } } },
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Chân OUT (DCV)', cot: ['Trống', 'Tay 10cm'], hang: [{ ten: 'V', du_doan: ['≈ 3.3', '< 0.5'] }] },
      { ten: 'Tầm phát hiện (cm)', cot: ['Giấy trắng', 'Tay', 'Vật đen'], hang: [{ ten: 'cm', du_doan: ['xa nhất', 'giữa', 'gần nhất'] }] }],
    bay: ['Cấp 5V cho module rồi nối OUT thẳng GPIO: 5V vào chân 3.3V.', 'Vặn biến trở hết cỡ: module thấy cả mặt bàn/tường xa, báo có vật liên tục.', 'Nắng / đèn sợi đốt chiếu vào: báo sai — robot hút bụi dùng cảm biến có điều chế xung để lọc ánh sáng nền.'],
    robot: ['17.1: FC-51 gắn mũi robot, bổ sung cho siêu âm ở góc gần mà HC-SR04 mù (< 2cm) và vật mảnh.'],
  });
})();
