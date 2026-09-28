// Bài 5.2 — Khuếch đại. Biến trở kiểu B (A 3d, W 5d, B 7d) → 100k (5b → 13b) → chân B (13h). Q: E 12h, B 13h, C 14h.
// C → LED (k 14g, a 15g) → 220Ω (15e → 15f) → thanh +. Chỉ đo DCV: Ib từ áp trên 100k, Ic từ áp trên 220Ω.
(function () {
  const BT = { id: 'bt', loai: 'bientro', A: '3d', W: '5d', B: '7d' };
  const pot = [BT, K.day('pA', 'T+:3', '3a', 'do'), K.day('pB1', '7e', '7f', 'den'), K.day('pB2', '7j', 'B-:7', 'den')];
  const RB = K.tro('rb', ['5b', '13b'], '100k'), CAU = K.day('cau', '13e', '13f', 'vang');
  const Q = { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, DE = K.day('dE', '12j', 'B-:12', 'den');
  const L = K.led('led', '15g', '14g', 'do', { nhan: '' }), RC = K.tro('rc', ['15e', '15f'], '220'), DC = K.day('dC', 'T+:15', '15a', 'do');
  const sd = SD;
  const soDo = sd.svg(300, 220, sd.mui + sd.pin(30, 110, '') + sd.day('30,110 30,20 250,20') + sd.day('80,20 80,40') + sd.bienTro(80, 40, 100) + sd.day('80,140 80,200 30,200 30,120')
    + sd.day('120,90 130,90') + sd.troNgang(130, 90, 60, '100k') + sd.day('190,90 210,90') + sd.npn(240, 90) + sd.day('250,20 250,24') + sd.tro(250, 24, 36, '')
    + sd.chu(262, 44, '220Ω', 'sd-mo') + sd.day('250,120 250,200 80,200'), 'Biến trở chia áp, qua 100k vào chân B; LED và 220 ohm ở chân C');
  BAI.dangKy({
    id: '5.2',
    muc_tieu: 'Dòng nhỏ vào chân B điều khiển dòng lớn gấp hFE lần ở chân C, tới khi transistor <b>bão hoà</b>. Chỉ đo áp, không cần chuyển đồng hồ sang mA.',
    can: [K.can.npn(), K.can.bientro(), K.can.tro('100k'), K.can.tro('220'), K.can.led(), ...K.coBan(7)],
    kien_thuc: `<p>Làm 5.1 trước: hình dưới giả sử chân <b>E-B-C</b> từ trái sang phải; nếu của bạn khác thì cắm theo kết quả 5.1.</p>
      <p><code>Ib = U_100k / 100k</code>, <code>Ic = U_220 / 220</code>. Vùng khuếch đại: <code>Ic ≈ hFE · Ib</code>. Tăng Ib mãi thì Ic chạm trần <code>(4.78 − 1.9 − 0.1)/220 ≈ 12.6mA</code>: bão hoà, C–E còn ~0.1V.</p>
      <p>Biến trở dùng <b>kiểu B</b> (bài 2.3): A → thanh +, B → thanh −, W chỉ nối vào 100k. 100k giữ Ib ≤ 41µA dù vặn hết cỡ.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'W → 100k → B. C → LED → 220Ω → +. E → −.' }],
    du_doan: '<p>U_W = 1 / 2 / 3 / 4.78V → Ib ≈ 3.5 / 13.5 / 23.5 / 41µA → Ic ≈ hFE × Ib, trần 12.6mA. hFE 200: U_W = 3V cho Ic ≈ 4.7mA.</p>',
    phan: [
      {
        ten: 'Phần 1 · Ráp',
        cot: 24,
        buoc: [
          K.buocPin(),
          { ten: 'Biến trở kiểu B', lam: ['A 3d, W 5d, B 7d (đã xác định chân W ở 2.3). Dây đỏ thanh + → 3a. Chân B xuống −: dây đen 7e → 7f, dây đen 7j → thanh −. <b>Cột 5 (W) không nối dây nào vào thanh nguồn.</b>'], board: { them: pot } },
          { ten: '100k, transistor, LED, 220Ω', lam: ['100k: 5b → 13b. Dây vàng 13e → 13f.', 'S8050: E 12h, B 13h, C 14h. Dây đen 12j → thanh −.', 'LED: chân ngắn 14g (về phía C), chân dài 15g. 220Ω vắt qua rãnh 15e → 15f. Dây đỏ thanh + → 15a.'], board: { them: [RB, CAU, Q, DE, L, RC, DC] } },
          K.buocOm('Ω 200k', '≈ 10.0', '≈ 10k (dải than A–B của biến trở), vặn thì <b>không đổi</b>.', 'Gần 0, hoặc vặn mà đổi nhiều: W đang nối vào thanh nguồn (lỗi bài 2.3).', ['Vặn biến trở qua lại trong lúc đo.']),
        ],
      },
      {
        ten: 'Phần 2 · Vặn và đo', ke_thua: true,
        buoc: [
          K.lapPin('Lắp pin, vặn W về phía B', ['LED tắt. Vặn chậm về phía A: LED sáng dần.'], { sua: { led: { sang: true } } }, { thay: 'LED sáng dần rồi tới lúc vặn thêm không sáng hơn nữa.', neu_khong: 'Không sáng bao giờ: kiểm chân transistor (5.1) và chiều LED. Transistor nóng: tháo pin.' }),
          { ten: 'Đo 3 áp ở 4 vị trí', lam: ['<code>DCV 20</code>. Ở mỗi vị trí đo: U_W (W so với −), U_100k (2 chân 100k), U_220 (2 chân 220Ω). Thêm U_CE ở vị trí sáng nhất.'], board: { them: [K.dh('DCV 20', 'rb.1', 'rb.2', '≈ 2.35')] }, kiem: { thay: 'Ic/Ib gần như không đổi (hFE) ở các vị trí đầu, rồi Ic đứng ở ~12.6mA.', neu_khong: '' } },
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Ib, Ic, hFE', cot: ['U_W', 'U_100k', 'Ib = U/100k', 'U_220', 'Ic = U/220', 'Ic/Ib'], hang: [
      { ten: 'Vị trí 1', du_doan: ['≈ 1.0', '≈ 0.35', '3.5 µA', '', '', '100–400'] }, { ten: 'Vị trí 2', du_doan: ['≈ 2.0', '≈ 1.35', '13.5 µA', '', '', ''] },
      { ten: 'Vị trí 3', du_doan: ['≈ 3.0', '≈ 2.35', '23.5 µA', '', '', ''] }, { ten: 'Hết về A', du_doan: ['≈ 4.78', '≈ 4.1', '41 µA', '≤ 2.78', '≤ 12.6 mA', ''] }] }],
    bay: ['Nối W thẳng vào chân B không có 100k: vặn về A là chân B nhận thẳng 4.78V, dòng B lớn, transistor chết.', 'Biến trở nối kiểu A (W vào thanh nguồn): như bài 2.3, vặn về 0 là nối tắt pin.', 'Cắm transistor theo hình mà chưa làm 5.1.'],
    robot: ['Driver motor bên trong cũng là transistor: dòng nhỏ từ GPIO điều khiển dòng lớn của motor.'],
  });
})();
