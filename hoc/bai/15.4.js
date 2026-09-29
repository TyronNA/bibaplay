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
    muc_tieu: 'Vòng điều khiển kín: cứ 200ms đo tốc độ bánh một lần, so với tốc độ đích rồi tự chỉnh duty. Bài này cho thấy vì sao chỉ dùng "tỉ lệ" (P) thì luôn thiếu đích, còn thêm "tích phân" (I) thì bám được đích cả khi bánh bị hãm tay.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(6), K.can.pin(), K.can.drv8833(), K.can.motorTT(), K.can.kheQuang()],
    code: 'sandbox/esp32-bai/main/bai_15_4.c',
    kien_thuc: `
      <p>Bài 15.2 là <b>vòng hở</b>: đặt duty 60% và tốc độ ra bao nhiêu thì chịu bấy nhiêu. Pin yếu, sàn thảm hay bánh bị kẹt đều làm robot chậm lại mà code không hề biết. <b>Vòng kín</b> thì đo tốc độ v, tính sai lệch <code>sai = đích − v</code>, rồi chỉnh duty theo sai lệch đó.</p>
      <p><b>P</b> (tỉ lệ): <code>duty = NỀN + KP·sai</code>. Muốn duty đủ lớn để giữ tốc độ thì phải còn sai lệch, nên P luôn dừng ở dưới đích một khoảng, gọi là sai lệch tĩnh. KP càng lớn thì khoảng đó càng nhỏ, nhưng càng dễ dao động.</p>
      <p><b>I</b> (tích phân) cộng dồn sai lệch theo thời gian: <code>duty = NỀN + KP·sai + KI·∫sai</code>. Còn thiếu đích bao lâu thì phần I còn tăng bấy lâu. Khi sai lệch về 0, phần I đứng yên đúng ở mức duty cần, và sai lệch tĩnh biến mất.</p>
      <p>Code đếm cả 2 cạnh của khe quang (40 xung/vòng) để mỗi 200ms có nhiều xung hơn. Kịch bản lặp lại: 20s pha P rồi 20s pha PI. Trong mỗi pha, đích là 60 xung/s rồi 100 xung/s (90 → 150 vòng/phút). Mạch điện giữ nguyên như 15.2, chỉ đổi code.</p>`,
    so_do: [{ nhan: 'Vòng kín', svg: vong, chu: 'Mỗi 200ms đi hết một vòng: đo → so → chỉnh.' }],
    du_doan: `<p><b>Pha P</b>: tốc độ đo dừng ở dưới đích khá xa (với KP 0.3, đích 60 có khi chỉ đo được 20–35) và không bao giờ tới đích.</p>
      <p><b>Pha PI</b>: sau 1–3 giây bám sát đích (±5 xung/s), có thể vượt nhẹ rồi quay về. Hãm tay trong pha PI: số đo tụt, duty tự tăng, tốc độ trở lại gần đích. Bỏ tay ra: vượt đích một chút rồi về.</p>
      <p>Đích 100 cần duty ~85%. Pin yếu thì duty chạm 100% mà vẫn thiếu, đó là giới hạn của motor chứ không phải của code.</p>
      <p>KP, KI trong code là số khởi đầu, đoán theo motor Adafruit (≈ 124 xung/s ở 100% khi đếm 2 cạnh). Motor của bạn khác thì xem cách chỉnh ở phần Đào sâu.</p>`,
    sau: `<h3>Sai lệch tĩnh của P, bằng số</h3>
      <p>Giả sử quanh vùng làm việc, motor cho <code>v ≈ G·(duty − duty₀)</code>. Motor Adafruit cho 124 xung/s ở 100%, lấy duty₀ ≈ 30% là mức vừa đủ để quay, thì G ≈ 124/70 ≈ 1.8 xung/s cho mỗi %.</p>
      <p>Vòng P đặt <code>duty = NỀN + KP·(đích − v)</code>. Giải ra được <code>v = G·(NỀN − duty₀ + KP·đích)/(1 + G·KP)</code>. Với NỀN 35, KP 0.3, đích 60: v ≈ 1.8 × (5 + 18)/1.54 ≈ 27 xung/s, thiếu xa đích. Tăng KP lên 2: v ≈ 1.8 × (5 + 120)/4.6 ≈ 49, gần hơn nhưng vẫn thiếu, lại dễ rung vì cứ 200ms mới đo và cập nhật một lần.</p>
      <h3>Chỉnh KP, KI thế nào</h3>
      <p>1) Đặt KI = 0, tăng KP từng bước (0.3 → 0.6 → 1…) cho tới khi tốc độ bắt đầu dao động quanh một mức, rồi lùi lại còn ~½.</p>
      <p>2) Tăng KI dần từ nhỏ cho tới khi sai lệch về 0 trong vài giây. Nếu vượt đích nhiều và lắc lâu thì KI quá lớn.</p>
      <p>Đơn vị: KP là %duty cho mỗi (xung/s) sai lệch. KI là %duty cho mỗi (xung/s·giây) sai lệch cộng dồn.</p>
      <h3>Chống tràn tích phân</h3>
      <p>Đích là 100 mà duty đã chạm 100% (do pin yếu): sai lệch vẫn dương, nên phần I cứ cộng mãi. Tới lúc đích giảm xuống, phần I khổng lồ đó giữ duty ở 100% rất lâu, robot như "không phanh được". Vì vậy code ngừng cộng khi duty đã kẹp ở biên mà sai lệch vẫn đẩy ra ngoài. Robot thật còn thêm thành phần D (vi phân) để phanh sớm khi sắp tới đích, gọi chung là PID.</p>`,
    hoi: [
      ['Pha P, đích 60, đo dừng ở 48. Tăng KP gấp đôi thì số đo đổi thế nào?', 'Gần đích hơn (sai lệch tĩnh nhỏ lại) nhưng vẫn không tới 60. KP quá lớn thì tốc độ bắt đầu dao động.'],
      ['Vì sao pha PI tới được đích mà pha P không?', 'Phần I cộng dồn sai lệch: còn thiếu thì còn tăng duty, tới khi sai lệch = 0 thì đứng yên ở đúng mức duty cần.'],
      ['Đo mỗi 200ms, đếm 2 cạnh ở 60 xung/s: mỗi lần đọc được bao nhiêu xung, sai số ±1 xung là bao nhiêu %?', '60 × 0.2 = <b>12 xung</b>, nên ±1 xung là ±1/12 ≈ <b>±8%</b>. Vì vậy số đo nhảy nhẹ quanh đích.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Ráp lại mạch 15.2: khe quang trước', cot: 30,
        buoc: [
          K.buocPin(),
          { ten: 'Cắm khe quang, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Module khe quang vào 20a, 21a, 22a. Đọc chữ in: cột 20 = ?, 21 = ?, 22 = ? Dây đen <b>21e → thanh −</b>.'], board: { them: [KQ, GK] },
            kiem: { thay: 'Biết chắc cột VCC, GND, OUT.', neu_khong: 'Thứ tự chân khác hình: đổi dây cho khớp chữ in.' } },
          { ten: 'Dây nguồn từ board', lam: ['<code>3V3</code> → <b>20c</b>. <code>GND</code> → thanh − dưới (cột 3). Chưa nối 9, 10, 11.'], board: { them: [ESP0] } },
          K.buocOmEsp(),
          K.doOut('Đo OUT khe quang', ['Que đỏ 22d, que đen thanh −. Đút mảnh giấy cứng vào khe rồi rút ra.'], '22d', 'B-:22', '≈ 3.3 / 0', 'OUT đổi giữa ≈ 0V và ≈ 3.3V khi chắn/bỏ chắn.'),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Driver, motor, chạy vòng kín', ke_thua: true,
        buoc: [
          { ten: 'Cắm DRV8833, đọc chữ in', kiem_truoc: true, lam: ['Cắm module sao cho SLP, IN1, IN2, OUT1, OUT2, VM, GND nằm ở cột 8–14 như hình. Module của bạn xếp chân khác thì nối theo tên in trên module.'], board: { them: [DRV] },
            kiem: { thay: 'Biết chắc cột từng chân.', neu_khong: '' } },
          { ten: 'Nguồn motor, SLP, motor', lam: ['Dây đỏ thanh + (cột 13) → <b>13c</b> (VM). Dây đen <b>14c → thanh −</b>. Dây đỏ <b>20b → 8b</b> (SLP lên 3V3). Motor TT vào <b>11e</b>, <b>12e</b>. Đĩa 20 lỗ phải quay lọt khe, không cọ. Kê motor lên cho bánh quay tự do.'], board: { them: [...DD, SLP, M] } },
          { ten: 'Dây điều khiển', lam: ['USB rút. <code>9</code> → <b>9c</b>, <code>10</code> → <b>10c</b>, <code>11</code> → <b>22c</b>.'], board: { bo: ['esp'], them: [ESP1] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở 2 tiếp điểm hộp pin.', 'Gần 0: VM chạm GND.', ['Thêm: 8d ↔ thanh + (pin) phải lớn — SLP không được nối vào nguồn pin.']),
          K.camUsb('Cắm USB, nạp 15.4', ['<code>idf.py menuconfig</code> → 15.4, <code>flash monitor</code>. Hộp pin còn trống nên số đo = 0 và duty tự tăng tới 100%, vì vòng kín đang "cố" đạt đích.'], {}, { thay: 'Monitor in mỗi 0.2s một dòng t, dich, do, sai, duty.', neu_khong: '' }),
          K.lapPin('Rồi lắp pin, nhấn RST', ['Nhấn nút RST trên board để chạy lại từ đầu với motor đã có điện. Đọc 20s pha P, rồi 20s pha PI.', 'Giữa pha PI: lấy ngón tay hãm nhẹ bánh 2–3 giây rồi thả.'], {},
            { thay: 'Pha P: "do" dừng dưới "dich". Pha PI: "do" bám "dich" sau vài giây. Hãm tay thì duty tăng, "do" trở lại gần đích.', neu_khong: '"do" luôn bằng 0: kiểm dây GPIO11 và khe quang. Tốc độ lắc mạnh ở pha PI: KI quá lớn, xem phần Đào sâu. DRV8833 nóng: tháo pin.' }),
          { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
        ],
      },
    ],
    bang_do: [{ ten: 'Sau 5 giây mỗi đích', cot: ['Đích 60', 'Đích 100'], hang: [{ ten: 'Pha P: tốc độ đo', du_doan: ['< 60', '< 100'] }, { ten: 'Pha PI: tốc độ đo', du_doan: ['≈ 60', '≈ 100'] }, { ten: 'PI + hãm tay: duty', du_doan: ['tăng', 'tăng'] }] }],
    bay: ['Để chạy lâu khi hộp pin còn trống: phần I đã chạm biên. Lắp pin xong thì nhấn RST để chạy lại từ đầu.', 'KP/KI quá lớn: bánh giật tới giật lui, driver và motor nóng. Giảm một nửa rồi thử lại.', 'Đĩa cọ vào khe: đếm sai, và vòng kín chỉnh theo con số sai đó.'],
    robot: ['Cho 2 bánh cùng một đích tốc độ thì robot đi thẳng, dù 2 motor không giống hệt nhau.', 'Bên trong servo (15.1) là một vòng P theo góc. Bài này là vòng PI theo tốc độ, cùng một ý tưởng.'],
  });
})();
