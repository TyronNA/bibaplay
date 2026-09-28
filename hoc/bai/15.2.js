// Bài 15.2 — Đếm vòng bánh. DRV8833 (đọc chữ in): SLP 8a, IN1 9a, IN2 10a, OUT1 11a, OUT2 12a, VM 13a, GND 14a.
// Motor TT ăn hộp 3×AAA qua VM. Khe quang: VCC 20a, GND 21a, OUT 22a — cấp 3V3, đo OUT trước rồi mới GPIO11 → 22c.
(function () {
  const DRV = { id: 'drv', loai: 'mod', ten: 'DRV8833', mau: 'do', chan: [['SLP', '8a'], ['IN1', '9a'], ['IN2', '10a'], ['OUT1', '11a'], ['OUT2', '12a'], ['VM', '13a'], ['GND', '14a']] };
  const DD = [K.day('vm', 'T+:13', '13c', 'do', 3), K.day('gd', '14c', 'B-:14', 'den', 3)];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 560, chan: { 1: '11e', 2: '12e' }, mau: ['cam', 'tim'], nhan: 'motor TT + đĩa' };
  const KQ = { id: 'kq', loai: 'mod', ten: 'khe quang', mau: 'xanhduong', chan: [['VCC', '20a'], ['GND', '21a'], ['OUT', '22a']] };
  const SLP = K.day('slp', '20b', '8b', 'do', 4), GK = K.day('gk', '21e', 'B-:21', 'den', 3);
  const ESP0 = K.esp({ GND: 'B-:3', '3V3': '20c', G9: '9c', G10: '10c' }, { x: 180 });
  const ESP1 = K.esp({ GND: 'B-:3', '3V3': '20c', G9: '9c', G10: '10c', G11: '22c' }, { x: 180 });
  BAI.dangKy({
    id: '15.2',
    muc_tieu: 'Biết bánh xe đã quay bao nhiêu vòng: đĩa 20 lỗ gắn trên trục motor đi qua một khe quang, mỗi lỗ là một xung. Đếm xung bằng bộ đếm phần cứng PCNT của ESP32, không tốn CPU.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(6), K.can.pin(), K.can.drv8833(), K.can.motorTT(), K.can.kheQuang()],
    kien_thuc: `<p>Khe quang = LED hồng ngoại và phototransistor đối diện nhau qua một khe. Lỗ đĩa lọt vào khe → ánh sáng qua → OUT đổi mức. 20 lỗ → 20 xung/vòng. <code>vòng/phút = xung mỗi giây ÷ 20 × 60</code>.</p>
      <p><b>Module khe quang shop ghi khác nhau</b>: có loại chỉ chạy 5V và ra 5V (HC-020K). Cấp 3V3 và đo OUT trước: đổi mức được và ≤ 3.3V thì dùng thẳng. Không đổi mức ở 3V3 → loại 5V: dừng lại, cần cấp 5V + cầu 10k/20k cho chân OUT (như 9.5) — mạch khác hình trên trang này.</p>
      <p><b>DRV8833</b> (TI) thay module "driver chung" của chương 13: VM 2.7–10.8V nên chạy được hộp 4.5V; IN1=1 IN2=0 tiến, PWM vào IN1 để chỉnh tốc độ (code 13.x dùng y hệt). Chân ngủ <b>nSLEEP</b> (module in EEP/SLP) bị chip kéo xuống bên trong → <b>phải nối lên 3V3</b>, không thì motor không chạy.</p>
      <p>Motor TT (Adafruit): 185 vòng/phút ở 4.5V không tải, kéo 150mA; <b>kẹt kéo 1.2A</b>. Motor shop khác: đo mới biết. Dòng kẹt vượt xa S8050 (7.4) → đây là lý do dùng driver.</p>
      <p>PCNT: bộ đếm xung trong chip, có bộ lọc bỏ gai ngắn (code đặt 1µs). CPU chỉ việc đọc số mỗi giây.</p>`,
    code: 'sandbox/esp32-bai/main/bai_15_2.c',
    du_doan: '<p>Duty 100% ở 4.5V: ≈ 185 vòng/phút ≈ 62 xung/s (motor Adafruit). Duty 60%: chậm hơn rõ. Lấy tay hãm nhẹ bánh: số giảm.</p>',
    phan: [
      {
        ten: 'Phần 1 · Khe quang: nguồn, đo OUT, nối GPIO', cot: 30,
        buoc: [
          K.buocPin(),
          { ten: 'Cắm khe quang, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Module khe quang vào 20a, 21a, 22a. Đọc chữ in: cột 20 = ?, 21 = ?, 22 = ? Dây đen <b>21e → thanh −</b>.'], board: { them: [KQ, GK] },
            kiem: { thay: 'Biết chắc cột VCC, GND, OUT.', neu_khong: 'Thứ tự khác: đổi dây cho khớp chữ in.' } },
          { ten: 'Dây nguồn từ board', lam: ['<code>3V3</code> → <b>20c</b> (VCC khe quang). <code>GND</code> → thanh − dưới (cột 3).'], board: { them: [ESP0] } },
          K.buocOmEsp(),
          K.doOut('Đo OUT khe quang', ['Que đỏ 22d, que đen thanh −. Lấy một mảnh giấy cứng: đút vào khe (chắn sáng), rút ra.'], '22d', 'B-:22', '≈ 3.3 / 0', 'OUT đổi mức giữa ≈ 0V và ≈ 3.3V khi chắn/bỏ chắn, đèn nhỏ trên module đổi theo.'),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · DRV8833 + motor, đếm xung', ke_thua: true,
        buoc: [
          { ten: 'Cắm DRV8833, đọc chữ in', kiem_truoc: true, lam: ['Cắm module sao cho các chân SLP (hoặc EEP/STBY), IN1, IN2, OUT1, OUT2, VM, GND nằm ở cột 8–14 như hình; module thật thứ tự khác thì ghi lại cột nào là chân nào và nối theo tên.'], board: { them: [DRV] },
            kiem: { thay: 'Biết chắc cột SLP, IN1, IN2, OUT1, OUT2, VM, GND.', neu_khong: 'Module không có chân SLP/EEP: có thể đã kéo sẵn — ghi lại, bỏ qua dây SLP.' } },
          { ten: 'Nguồn motor, SLP, motor', lam: ['Dây đỏ thanh + (cột 13) → <b>13c</b> (VM). Dây đen <b>14c → thanh −</b>. Dây đỏ <b>20b → 8b</b> (SLP lên 3V3). Motor TT: 2 dây vào <b>11e</b>, <b>12e</b>. Gắn đĩa 20 lỗ lên trục thứ hai của motor, chỉnh cho đĩa quay lọt khe không cọ.'], board: { them: [...DD, SLP, M] } },
          { ten: 'Dây điều khiển', lam: ['USB rút. <code>9</code> → <b>9c</b> (IN1). <code>10</code> → <b>10c</b> (IN2). <code>11</code> → <b>22c</b> (OUT khe quang).'], board: { bo: ['esp'], them: [ESP1] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở 2 tiếp điểm hộp pin.', 'Gần 0: VM chạm GND.', ['Thêm: 11d ↔ 12d ≈ điện trở motor (vài Ω). 8d ↔ thanh + (pin) phải lớn — SLP không được nối vào nguồn pin.']),
          K.camUsb('Cắm USB trước, nạp 15.2', ['<code>idf.py menuconfig</code> → 15.2, <code>flash monitor</code>. Hộp pin rỗng. Xoay đĩa bằng tay 1 vòng.'], {}, { thay: 'Xoay tay 1 vòng: tổng xung tăng ≈ 20.', neu_khong: 'Không tăng: dây GPIO11 chưa vào 22c. Tăng gấp đôi (≈ 40): code đếm cả 2 cạnh — kiểm lại.' }),
          K.lapPin('Rồi lắp pin', ['Code chạy motor 60% trong 5s, 100% trong 5s, nghỉ 3s. Ghi xung/s và vòng/phút ở mỗi mức. Lần 100% thứ hai: lấy ngón tay hãm nhẹ bánh.'], {}, { thay: '100%: vài chục xung/s (Adafruit ≈ 62). 60%: ít hơn rõ. Hãm tay: số giảm.', neu_khong: 'Motor không quay: SLP chưa lên 3V3. DRV8833 nóng: tháo pin — motor kẹt hoặc chip vỏ TSSOP.' }),
          { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
        ],
      },
    ],
    bang_do: [{ ten: 'Tốc độ', cot: ['Xung/s', 'Vòng/phút'], hang: [{ ten: 'Duty 60%', du_doan: ['< 62', '< 185'] }, { ten: 'Duty 100%', du_doan: ['≈ 62', '≈ 185'] }, { ten: '100% + hãm tay', du_doan: ['giảm', 'giảm'] }] }],
    bay: ['Quên nối SLP lên 3V3: DRV8833 ngủ, motor không chạy.', 'Nối SLP vào thanh + (pin 4.5V): quá mức chân logic ở mạch này thì không sao (DRV8833 chịu 5.75V) nhưng với pack 2S 8.4V thì hỏng chip.', 'Đĩa cọ khe: đếm sai và kẹt motor.', 'Module khe quang 5V nối thẳng GPIO: 5V vào chân 3.3V.'],
    robot: ['2 bánh 2 encoder: so xung 2 bên để đi thẳng (bánh nào chạy nhanh thì giảm duty bên đó), đo quãng đường = số vòng × chu vi bánh.'],
  });
})();
