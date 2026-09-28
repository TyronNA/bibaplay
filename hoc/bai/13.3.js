// Bài 13.3 — Nhiễu motor lên ESP32. Phần 1: board ăn hộp pin qua AMS1117 (VOUT → chân 3V3), motor ăn cùng hộp pin qua driver.
// USB rút hẳn. LED GPIO13 nháy 5 lần mỗi lần chip khởi động. Phần 2: thêm tụ 100µF ở nguồn.
(function () {
  const AMS = { id: 'ams', loai: 'mod', ten: 'AMS1117', chan: [['VIN', '3a'], ['GND', '4a'], ['VOUT', '5a']] };
  const A = [K.day('av', 'T+:2', '3c', 'do'), K.day('ag1', '4e', '4f', 'den'), K.day('ag2', '4j', 'B-:4', 'den')];
  const LED = [K.tro('rl', ['16e', '16f'], '330'), K.led('led', '16i', '17i'), K.day('lk', '17j', 'B-:17', 'den')];
  const DRV = { id: 'drv', loai: 'mod', ten: 'driver', mau: 'do', chan: [['VM', '20a'], ['GND', '21a'], ['IN1', '22a'], ['IN2', '23a'], ['OUT1', '24a'], ['OUT2', '25a']] };
  const D = [K.day('vm', 'T+:18', '20c', 'do', 4), K.day('g1', '21e', '21f', 'den'), K.day('g2', '21j', 'B-:21', 'den')];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 530, chan: { 1: '24c', 2: '25c' }, mau: ['cam', 'tim'], nhan: 'motor' };
  const ESP = K.esp({ '3V3': '5c', GND: 'B-:8', G13: '16a', G9: '22c', G10: '23c' }, { x: 260 });
  const TU = [{ id: 'c', loai: 'tu', p: ['28c', '29c'], nhan: '100µF' }, K.day('cp', 'T+:28', '28a', 'do'), K.day('cn1', '29e', '29f', 'den'), K.day('cn2', '29j', 'B-:29', 'den')];
  BAI.dangKy({
    id: '13.3',
    muc_tieu: 'Thấy motor khởi động làm sụt áp pin (nội trở, bài 1.6) → ổn áp hết dư (bài 8.2) → ESP32 reset (brownout). Rồi thấy cách chữa.',
    nguon: '3×AAA → AMS1117 → chân 3V3 (USB rút) + motor',
    can: [K.can.esp(), K.can.usb(), K.can.ducCai(5), K.can.pin(), K.can.motor(), { ten: 'Module driver motor', tim: 'driver motor', lk: 'driver-motor', sl: 1 }, { ten: 'Module AMS1117-3.3', tim: 'AMS1117', lk: 'ams1117', sl: 1 }, K.can.tuhoa('100µF'), K.can.tro('330'), K.can.led(), ...K.coBan(10)],
    kien_thuc: `<p>Hộp pin nội trở ~0.5–1Ω. Motor khởi động kéo ~1A → pin tụt ~0.5–1V → AMS1117 vào dưới 4.4V → 3V3 tụt → chip reset (brownout, ngưỡng mặc định ~2.4–2.7V).</p>
      <p><b>Chạy board bằng chân 3V3 thì USB phải rút hẳn</b>: cắm cả 2 là 2 nguồn đấu nhau trên đường 3V3. Nạp code 13.3 trước (USB), rút USB, rồi mới ráp nguồn pin.</p>
      <p>Không có Serial khi rút USB: code nháy LED GPIO13 nhanh 5 lần mỗi lần khởi động, rồi sáng đều. Thấy 5 nháy lúc motor vừa quay = vừa reset. Lần cắm USB sau, code in lý do reset lần trước.</p>
      <p>Cách chữa (phần 2–3): tụ to ở nguồn, và <b>tách nguồn</b> (board ăn USB, motor ăn pin, GND chung) như bài 11.3/13.1.</p>`,
    code: 'sandbox/esp32-bai/main/bai_13_3.c',
    du_doan: '<p>Pin mới có thể không reset (dư áp đủ); pin hơi yếu thì gần như chắc reset mỗi lần motor khởi động. Tụ 100µF giúp một phần; tách nguồn thì hết.</p>',
    phan: [
      {
        ten: 'Phần 1 · Nạp code rồi rút USB',
        buoc: [
          { ...K.camUsb('Cắm USB, nạp 13.3', ['Board chưa nối gì. <code>idf.py menuconfig</code> → 13.3, <code>flash</code>.'], {}, { thay: 'Nạp xong.', neu_khong: '' }), board: { them: [K.esp({}, { usb: true, x: 250 })] } },
          K.rutUsb(['<b>Từ đây tới hết phần 2, USB luôn rút.</b>']),
        ],
      },
      {
        ten: 'Phần 2 · Chung nguồn pin', cot: 36,
        buoc: [
          K.buocPin(),
          { ten: 'AMS1117 + LED', lam: ['AMS1117 cột 3–5 (đọc chữ in như 8.2). Dây đỏ thanh + → VIN. GND xuống −: 4e → 4f, 4j → thanh −.', 'LED GPIO13: 330Ω 16e → 16f, LED 16i (dài) / 17i, dây đen 17j → −.'], board: { them: [AMS, ...A, ...LED] } },
          { ten: 'Driver + motor', lam: ['Driver cột 20–25 như 13.1: dây đỏ thanh + → VM, GND xuống −, motor vào OUT1/OUT2.'], board: { them: [DRV, ...D, M] } },
          { ten: 'Dây từ board', lam: ['Cột VOUT AMS1117 (5c) → chân <code>3V3</code> board. <code>GND</code> → thanh − (8). <code>13</code> → 16a, <code>9</code> → IN1, <code>10</code> → IN2.', 'Kiểm lại: cáp USB <b>không</b> cắm.'], board: { them: [ESP] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở tiếp điểm hộp pin.', 'Gần 0: nối tắt ở AMS1117 hoặc driver.', ['Thêm: cột VOUT (5d) với thanh − → gần mốc 8.1 của board (song song 330Ω + LED thì không, vì LED chặn).']),
          K.lapPin('Lắp pin, nhìn LED lúc motor khởi động', ['LED nháy 5 lần rồi sáng đều. Mỗi 5 giây motor khởi động 100%. Nhìn LED đúng lúc đó, 5 lần.'], { sua: { led: { sang: true } } }, { thay: 'Nếu thấy 5 nháy lại lúc motor vừa quay: board vừa reset.', neu_khong: 'Không bao giờ reset: pin còn mới, dư áp đủ. Ghi lại, vẫn làm phần 3. AMS1117 nóng: tháo pin.' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 3 · Thêm tụ 100µF ở nguồn', ke_thua: true,
        buoc: [
          { ten: 'Tụ 100µF giữa + và −', lam: ['Tụ: <b>chân dài 28c</b>, chân ngắn 29c. Dây đỏ thanh + → 28a. Cột 29 xuống −: 29e → 29f, 29j → thanh −.'], board: { them: TU } },
          K.buocOm('Ω 200k', 'tăng dần', 'Số tăng dần (tụ nạp), không dưới ~100Ω.', 'Gần 0: nối tắt.'),
          K.lapPin('Lắp pin, đếm số lần reset trong 5 lần khởi động', ['Như phần 2.'], { sua: { led: { sang: true } } }, { thay: 'Reset ít hơn (hoặc hết) so với phần 2.', neu_khong: 'Tụ ấm: tháo pin, tụ ngược.' }),
          K.thaoPin(['Cắm USB lại (không lắp pin), <code>idf.py monitor</code>: dòng đầu in lý do reset lần trước. Cách chữa triệt để: board ăn USB, motor ăn pin, GND chung (13.1).']),
        ],
      },
    ],
    bang_do: [{ ten: 'Reset trong 5 lần motor khởi động', cot: ['Số lần reset'], hang: [{ ten: 'Chung nguồn', du_doan: ['0–5 (tuỳ pin)'] }, { ten: '+ tụ 100µF', du_doan: ['ít hơn'] }, { ten: 'Tách nguồn (13.1)', du_doan: ['0'] }] }],
    bay: ['Cắm USB trong khi board đang ăn nguồn qua chân 3V3: 2 nguồn đấu nhau.', 'Cấp VOUT AMS1117 vào chân 5V thay vì 3V3: board không chạy ổn định (ổn áp trên board cần > 3.3V).', 'Thiếu GND chung giữa AMS1117, driver và board.'],
    robot: ['Robot thật: pin → ổn áp riêng cho logic (buck/LDO + tụ to), pin → driver cho motor, chung GND. Không bao giờ cho motor và chip "giành" một đường nguồn mỏng.'],
  });
})();
