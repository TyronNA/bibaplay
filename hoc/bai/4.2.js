// Bài 4.2 — Chống cắm ngược nguồn: 1N4007 (A 5c, K 9c) nối tiếp trước mạch 220Ω + LED.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), D = { id: 'd', loai: 'diode', kieu: '4007', a: '5c', k: '9c', nhan: '1N4007' };
  const R = K.tro('r', ['9e', '9f'], '220'), L = K.led('led', '9i', '10i'), DK = K.day('dK', '10j', 'B-:10', 'den');
  const sd = SD;
  const soDo = sd.svg(300, 200, sd.pin(40, 100, '4.78V') + sd.day('40,100 40,20 150,20 150,30') + sd.diode(150, 30, 50, '1N4007') + sd.tro(150, 80, 50, '220Ω') + sd.led(150, 130)
    + sd.day('150,170 150,185 40,185 40,110'), 'Diode 1N4007 nối tiếp ngay sau cực + của pin');
  BAI.dangKy({
    id: '4.2',
    muc_tieu: 'Đặt 1 diode nối tiếp ngay sau cực +: cắm pin ngược thì mạch không nhận dòng. Cái giá là mất ~0.7V.',
    can: [K.can.d4007(), K.can.tro('220'), K.can.led(), ...K.coBan(3)],
    kien_thuc: `<p>Cắm ngược, diode bị phân cực ngược nên chặn dòng: mạch phía sau không nhận điện.</p>
      <p>Đảo cực pin ở bài này dùng cách <b>đổi chỗ 2 dây của hộp pin</b> trên breadboard, lúc hộp rỗng. Không lắp ngược từng viên pin trong hộp (dễ nhầm, và các viên đấu ngược nhau sẽ tự xả).</p>
      <p>LED chịu áp ngược tối đa ~5V; 4.78V vẫn trong giới hạn nên không cháy dù không có diode. Với nguồn cao hơn (pin lithium 2 cell 8.4V) thì không còn đúng.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Vạch của 1N4007 hướng về phía mạch.' }],
    du_doan: '<p>Chiều đúng: áp sau diode ≈ 4.78 − 0.72 ≈ 4.06V → I ≈ (4.06 − 1.9)/220 ≈ 9.8mA (không có diode là ~13mA). Chiều ngược: LED tắt. Diode và LED cùng chặn, 4.78V chia giữa 2 con tuỳ dòng rò của mỗi con — đo mới biết.</p>',
    phan: [
      {
        ten: 'Phần 1 · Chiều đúng',
        buoc: [
          K.buocPin(),
          { ten: 'Ráp diode, 220Ω, LED', lam: ['Dây đỏ thanh + → 5a. 1N4007: anode 5c, <b>vạch bạc 9c</b>. 220Ω vắt qua rãnh 9e → 9f. LED: chân dài 9i, chân ngắn 10i. Dây đen 10j → thanh −.'], board: { them: [DA, D, R, L, DK] } },
          K.buocOm('Ω 200k', '1', '1 (OL) hoặc số lớn: diode + LED chặn dòng nhỏ.', 'Dưới 200Ω: nối tắt.'),
          K.lapPin('Lắp pin, đo áp sau diode', ['LED sáng. <code>DCV 20</code>: que đỏ 9b (sau diode), que đen thanh −. Rồi đo 2 chân diode.'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', '9b', 'B-:12', '≈ 4.06')] }, { thay: 'Sau diode ≈ 4.0–4.1V; trên diode ≈ 0.7V.', neu_khong: 'LED tắt: diode ngược (vạch phải ở 9c).' }),
        ],
      },
      {
        ten: 'Phần 2 · Đảo cực pin', ke_thua: true,
        buoc: [
          K.thaoPin(['Hộp rỗng. Đổi chỗ 2 dây hộp pin: <b>dây đỏ vào thanh − dưới, dây đen vào thanh + trên</b>.'], { sua: { pin: { cong: 'B-:1', tru: 'T+:1', trang_thai: 'rong' }, led: { sang: false } } }),
          K.buocOm('Ω 200k', '1', '1 (OL).', 'Có số nhỏ: kiểm lại.'),
          K.lapPin('Lắp pin, đo áp trên diode', ['LED tắt. Que đỏ chân anode (5c), que đen chân vạch (9c).'], { them: [K.dh('DCV 20', 'd.A', 'd.K', '< 0')] }, { thay: 'LED tắt; diode ra số âm. Đo thêm 2 chân LED: 2 số cộng lại ≈ −4.78.', neu_khong: 'LED sáng: dây hộp pin chưa đổi chỗ.' }),
          K.thaoPin(['Đổi dây hộp pin về lại: đỏ → thanh + trên, đen → thanh − dưới.'], { sua: { pin: { cong: 'T+:1', tru: 'B-:1' } } }),
        ],
      },
    ],
    bang_do: [{ ten: 'Có diode', cot: ['U sau diode', 'U diode', 'LED'], hang: [{ ten: 'Chiều đúng', du_doan: ['≈ 4.06', '≈ 0.72', 'sáng'] }, { ten: 'Chiều ngược', du_doan: ['', 'âm, + U_LED ≈ −4.78', 'tắt'] }] }],
    bay: ['Quên đổi dây hộp pin về chiều đúng: bài sau cấp ngược cho mọi thứ.', 'Diode 1N4148 thay 1N4007 ở chỗ này: chỉ chịu ~200mA, mạch lớn hơn là cháy diode.'],
    robot: ['Board robot hay có diode (hoặc MOSFET) chống cắm ngược ở jack pin. Mất 0.7V là lý do các board tốt dùng MOSFET thay diode.'],
  });
})();
