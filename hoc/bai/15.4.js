// Bài 15.4 — Giữ tốc độ bánh bằng PI. Mạch y hệt 15.2 (ráp lại từ đầu theo đúng thứ tự an toàn của 15.2).
// DRV8833: SLP 8a, IN1 9a, IN2 10a, OUT1 11a, OUT2 12a, VM 13a, GND 14a. Khe quang: VCC 20a, GND 21a, OUT 22a.
(function () {
  const DRV = { id: 'drv', loai: 'mod', ten: 'DRV8833', mau: 'do', chan: [['SLP', '8a'], ['IN1', '9a'], ['IN2', '10a'], ['OUT1', '11a'], ['OUT2', '12a'], ['VM', '13a'], ['GND', '14a']] };
  const DD = [K.day('vm', 'T+:13', '13c', 'do', 3), K.day('gd', '14c', 'B-:14', 'den', 3)];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 560, chan: { 1: '11e', 2: '12e' }, mau: ['cam', 'tim'], nhan: 'motor TT + đĩa' };
  const KQ = { id: 'kq', loai: 'mod', ten: 'khe quang', mau: 'xanhduong', chan: [['VCC', '20a'], ['GND', '21a'], ['OUT', '22a']] };
  const SLP = K.day('slp', '20b', '8b', 'do', 4), GK = K.day('gk', '21e', 'B-:21', 'den', 3);
  const ESP0 = K.esp({ GND: 'B-:3', '3V3': '20c', G9: '9c', G10: '10c' }, { x: 180 });
  const ESP1 = K.esp({ GND: 'B-:3', '3V3': '20c', G9: '9c', G10: '10c', G11: '22c' }, { x: 180 });
  const sd = SD;
  const vong = sd.svg(380, 170, sd.mui + sd.chu(20, 44, 'đích', 'sd-chu') + `<line x1="50" y1="40" x2="90" y2="40" class="sd-net" marker-end="url(#sd-mui)"/>`
    + '<circle cx="100" cy="40" r="10" class="sd-net"/>' + sd.chu(100, 44, 'Σ', 'sd-chu', 'middle') + sd.chu(84, 30, '+', 'sd-pos') + sd.chu(106, 64, '−', 'sd-neg')
    + `<line x1="110" y1="40" x2="140" y2="40" class="sd-net" marker-end="url(#sd-mui)"/>` + sd.chu(116, 32, 'sai', 'sd-mo')
    + sd.hop(140, 22, 80, 36, 'PI') + `<line x1="220" y1="40" x2="250" y2="40" class="sd-net" marker-end="url(#sd-mui)"/>` + sd.chu(222, 32, 'duty', 'sd-mo')
    + sd.hop(250, 22, 100, 36, 'DRV8833+motor') + sd.day('350,40 364,40 364,120 320,120') + sd.hop(220, 104, 100, 32, 'khe quang+PCNT')
    + sd.day('220,120 100,120 100,50') + `<line x1="100" y1="60" x2="100" y2="52" class="sd-net" marker-end="url(#sd-mui)"/>` + sd.chu(130, 140, 'tốc độ đo (xung/s)', 'sd-mo'),
    'Vòng kín: đích trừ tốc độ đo ra sai lệch, khối PI tính duty cho driver motor, khe quang đo tốc độ đưa về');

  BAI.dangKy({
    id: '15.4',
    muc_tieu: 'Vòng điều khiển kín: đo tốc độ bánh mỗi 200ms, so với đích, tự chỉnh duty. Thấy vì sao chỉ "tỉ lệ" (P) luôn thiếu đích, và thêm "tích phân" (I) thì bám đích cả khi bị hãm tay.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(6), K.can.pin(), K.can.drv8833(), K.can.motorTT(), K.can.kheQuang()],
    code: 'sandbox/esp32-bai/main/bai_15_4.c',
    kien_thuc: `
      <p>Bài 15.2 là <b>vòng hở</b>: đặt duty 60% và chấp nhận tốc độ ra bao nhiêu thì ra — pin yếu, sàn thảm, bánh bị kẹt là chậm lại mà code không biết. <b>Vòng kín</b>: đo tốc độ v, tính sai lệch <code>sai = đích − v</code>, rồi chỉnh duty theo sai lệch.</p>
      <p><b>P</b> (tỉ lệ): <code>duty = NỀN + KP·sai</code>. Muốn có duty đủ lớn để giữ tốc độ thì phải còn sai lệch — nên P luôn dừng ở dưới đích một khoảng (sai lệch tĩnh). KP to hơn thì khoảng đó nhỏ hơn nhưng dễ dao động.</p>
      <p><b>I</b> (tích phân): cộng dồn sai lệch theo thời gian, <code>duty = NỀN + KP·sai + KI·∫sai</code>. Còn thiếu đích bao lâu thì phần I còn tăng bấy lâu — tới khi sai về 0 thì phần I đứng yên đúng ở mức duty cần. Hết sai lệch tĩnh.</p>
      <p>Code đếm cả 2 cạnh khe quang (40 xung/vòng) để có nhiều xung hơn mỗi 200ms. Kịch bản lặp: 20s pha P rồi 20s pha PI, mỗi pha đích 60 xung/s rồi 100 xung/s (90 → 150 vòng/phút). Mạch điện không đổi so với 15.2; chỉ đổi code.</p>`,
    so_do: [{ nhan: 'Vòng kín', svg: vong, chu: 'Mỗi 200ms đi hết một vòng: đo → so → chỉnh.' }],
    du_doan: `<p><b>Pha P</b>: tốc độ đo dừng ở dưới đích xa (với KP 0.3: đích 60 có khi chỉ đo được 20–35) và không bao giờ tới. <b>Pha PI</b>: trong 1–3 giây bám sát đích (±5 xung/s), có thể vượt nhẹ rồi về. Hãm tay trong pha PI: số đo tụt, duty tự tăng, tốc độ trở lại gần đích; bỏ tay ra: vượt đích một chút rồi về. Đích 100 cần duty ~85%: pin yếu thì duty chạm 100% mà vẫn thiếu — đó là giới hạn của motor, không phải của code.</p>
      <p>Số KP, KI trong code là số khởi đầu đoán theo motor Adafruit (≈ 124 xung/s ở 100% khi đếm 2 cạnh); motor của bạn khác thì Đào sâu có cách chỉnh.</p>`,
    sau: `<h3>Sai lệch tĩnh của P, bằng số</h3>
      <p>Giả sử quanh vùng làm việc motor cho <code>v ≈ G·(duty − duty₀)</code> (motor Adafruit: 124 xung/s ở 100%; lấy duty₀ ≈ 30% là mức vừa đủ quay → G ≈ 124/70 ≈ 1.8 xung/s mỗi %). Vòng P: <code>duty = NỀN + KP·(đích − v)</code>. Giải ra <code>v = G·(NỀN − duty₀ + KP·đích)/(1 + G·KP)</code>. Với NỀN 35, KP 0.3, đích 60: v ≈ 1.8 × (5 + 18)/1.54 ≈ 27 xung/s — thiếu xa đích. KP lên 2: v ≈ 1.8 × (5 + 120)/4.6 ≈ 49 — gần hơn nhưng vẫn thiếu, và dễ rung vì đo mỗi 200ms mới cập nhật.</p>
      <h3>Chỉnh KP, KI thế nào</h3>
      <p>1) KI = 0, tăng KP từng bước (0.3 → 0.6 → 1…) tới khi tốc độ bắt đầu dao động quanh một mức, lùi lại còn ~½. 2) Tăng KI từ nhỏ tới khi sai lệch về 0 trong vài giây; vượt đích nhiều và lắc lâu là KI quá lớn. Đơn vị: KP là %duty mỗi (xung/s) sai; KI là %duty mỗi (xung/s·giây) sai cộng dồn.</p>
      <h3>Chống tràn tích phân</h3>
      <p>Đích 100 mà duty đã chạm 100% (pin yếu): sai lệch vẫn dương, phần I cứ cộng mãi. Tới lúc đích giảm, phần I khổng lồ đó giữ duty 100% rất lâu — robot "không phanh được". Code ngừng cộng khi duty đã kẹp ở biên mà sai lệch còn đẩy ra ngoài. Robot thật còn thêm D (vi phân) để phanh sớm khi sắp tới đích: PID.</p>`,
    hoi: [
      ['Pha P, đích 60, đo dừng ở 48. Tăng KP gấp đôi thì số đo đổi thế nào?', 'Gần đích hơn (sai lệch tĩnh nhỏ lại) nhưng không tới 60; KP quá lớn thì tốc độ bắt đầu dao động.'],
      ['Vì sao pha PI tới được đích mà pha P không?', 'Phần I cộng dồn sai lệch: còn thiếu là còn tăng duty, tới khi sai lệch = 0 thì đứng yên ở đúng duty cần.'],
      ['Đo mỗi 200ms, đếm 2 cạnh ở 60 xung/s: mỗi lần đọc được bao nhiêu xung, sai số ±1 xung là bao nhiêu %?', '60 × 0.2 = <b>12 xung</b>; ±1/12 ≈ <b>±8%</b> — vì vậy số đo nhảy nhẹ quanh đích.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Ráp lại mạch 15.2: khe quang trước', cot: 30,
        buoc: [
          K.buocPin(),
          { ten: 'Cắm khe quang, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Module khe quang vào 20a, 21a, 22a. Đọc chữ in: cột 20 = ?, 21 = ?, 22 = ? Dây đen <b>21e → thanh −</b>.'], board: { them: [KQ, GK] },
            kiem: { thay: 'Biết chắc cột VCC, GND, OUT.', neu_khong: 'Thứ tự khác: đổi dây cho khớp chữ in.' } },
          { ten: 'Dây nguồn từ board', lam: ['<code>3V3</code> → <b>20c</b>. <code>GND</code> → thanh − dưới (cột 3). Chưa nối 9, 10, 11.'], board: { them: [ESP0] } },
          K.buocOmEsp(),
          K.doOut('Đo OUT khe quang', ['Que đỏ 22d, que đen thanh −. Đút mảnh giấy cứng vào khe rồi rút ra.'], '22d', 'B-:22', '≈ 3.3 / 0', 'OUT đổi giữa ≈ 0V và ≈ 3.3V khi chắn/bỏ chắn.'),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Driver, motor, chạy vòng kín', ke_thua: true,
        buoc: [
          { ten: 'Cắm DRV8833, đọc chữ in', kiem_truoc: true, lam: ['Cắm module sao cho SLP, IN1, IN2, OUT1, OUT2, VM, GND nằm ở cột 8–14 như hình; module thật khác thứ tự thì nối theo tên.'], board: { them: [DRV] },
            kiem: { thay: 'Biết chắc cột từng chân.', neu_khong: '' } },
          { ten: 'Nguồn motor, SLP, motor', lam: ['Dây đỏ thanh + (cột 13) → <b>13c</b> (VM). Dây đen <b>14c → thanh −</b>. Dây đỏ <b>20b → 8b</b> (SLP lên 3V3). Motor TT vào <b>11e</b>, <b>12e</b>. Đĩa 20 lỗ quay lọt khe không cọ. Kê motor cho bánh quay tự do.'], board: { them: [...DD, SLP, M] } },
          { ten: 'Dây điều khiển', lam: ['USB rút. <code>9</code> → <b>9c</b>, <code>10</code> → <b>10c</b>, <code>11</code> → <b>22c</b>.'], board: { bo: ['esp'], them: [ESP1] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở 2 tiếp điểm hộp pin.', 'Gần 0: VM chạm GND.', ['Thêm: 8d ↔ thanh + (pin) phải lớn — SLP không được nối vào nguồn pin.']),
          K.camUsb('Cắm USB, nạp 15.4', ['<code>idf.py menuconfig</code> → 15.4, <code>flash monitor</code>. Hộp pin rỗng: số đo = 0, duty tự tăng tới 100% (vòng kín đang "cố").'], {}, { thay: 'Monitor in mỗi 0.2s một dòng t, dich, do, sai, duty.', neu_khong: '' }),
          K.lapPin('Rồi lắp pin, nhấn RST', ['Nhấn nút RST trên board để chạy lại từ đầu với motor đã có điện. Đọc 20s pha P, rồi 20s pha PI.', 'Giữa pha PI: lấy ngón tay hãm nhẹ bánh 2–3 giây rồi thả.'], {},
            { thay: 'Pha P: "do" dừng dưới "dich". Pha PI: "do" bám "dich" sau vài giây; hãm tay → duty tăng, "do" trở lại gần đích.', neu_khong: 'do luôn 0: dây GPIO11 / khe quang. Tốc độ lắc mạnh ở pha PI: KI lớn — xem Đào sâu. DRV8833 nóng: tháo pin.' }),
          { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
        ],
      },
    ],
    bang_do: [{ ten: 'Sau 5 giây mỗi đích', cot: ['Đích 60', 'Đích 100'], hang: [{ ten: 'Pha P: tốc độ đo', du_doan: ['< 60', '< 100'] }, { ten: 'Pha PI: tốc độ đo', du_doan: ['≈ 60', '≈ 100'] }, { ten: 'PI + hãm tay: duty', du_doan: ['tăng', 'tăng'] }] }],
    bay: ['Chạy khi hộp pin rỗng lâu: phần I đã chạm biên; lắp pin xong nhấn RST để chạy lại sạch.', 'KP/KI quá lớn: bánh giật tới lui, driver và motor nóng. Giảm một nửa rồi thử lại.', 'Đĩa cọ khe: đếm sai → vòng kín chỉnh sai theo số sai.'],
    robot: ['Hai bánh cùng đích tốc độ = robot đi thẳng dù 2 motor không giống hệt nhau.', 'Servo (15.1) bên trong là vòng P theo góc; bài này là vòng PI theo tốc độ — cùng một ý tưởng.'],
  });
})();
