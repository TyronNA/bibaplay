// Bài 6.3 — Mạch nháy. Q1: E 6h B 7h C 8h. Q2: E 20h B 21h C 22h (cot 30).
// B1 ← 47k (7e→7f) ← +, B2 ← 47k (21e→21f) ← +. C1 → LED1 (k 8g, a 9g) → 1k (9e→9f) → +; C2 tương tự ở 22/23.
// Tụ 1: + ở 12i nối C1 (8j→12j), − ở 13i nối B2 (13j→21j). Tụ 2: + ở 16g nối C2 (22i→16i), − ở 17g nối B1 (17i→7i).
(function () {
  const Q1 = { id: 'q1', loai: 'npn', e: '6h', b: '7h', c: '8h', nhan: 'Q1' }, Q2 = { id: 'q2', loai: 'npn', e: '20h', b: '21h', c: '22h', nhan: 'Q2' };
  const E = [K.day('e1', '6j', 'B-:6', 'den'), K.day('e2', '20j', 'B-:20', 'den')];
  const RB = [K.tro('rb1', ['7e', '7f'], '47k'), K.day('pb1', 'T+:7', '7a', 'do'), K.tro('rb2', ['21e', '21f'], '47k'), K.day('pb2', 'T+:21', '21a', 'do')];
  const LED = [K.led('l1', '9g', '8g', 'do', { nhan: '' }), K.tro('rc1', ['9e', '9f'], '1k'), K.day('pc1', 'T+:9', '9a', 'do'), K.led('l2', '23g', '22g', 'xanhla', { nhan: '' }), K.tro('rc2', ['23e', '23f'], '1k'), K.day('pc2', 'T+:23', '23a', 'do')];
  const TU = [{ id: 'c1', loai: 'tu', p: ['12i', '13i'], nhan: '10µF' }, K.day('c1p', '8j', '12j', 'cam', 5), K.day('c1n', '13j', '21j', 'tim', 9),
    { id: 'c2', loai: 'tu', p: ['16g', '17g'], nhan: '10µF' }, K.day('c2p', '22i', '16i', 'cam', -5), K.day('c2n', '17i', '7i', 'tim', -9)];
  const sd = SD;
  const soDo = sd.svg(320, 230, sd.day('20,20 300,20') + sd.tro(60, 20, 60, '1k') + sd.led(60, 80) + sd.tro(120, 20, 60, '47k') + sd.tro(200, 20, 60, '47k') + sd.tro(260, 20, 60, '1k') + sd.led(260, 80)
    + sd.day('60,120 60,150') + sd.day('260,120 260,150') + sd.npn(50, 180) + sd.npn(270, 180) + sd.day('120,80 120,180 20,180 20,180') + sd.day('200,80 200,180 300,180')
    + sd.tu(150, 110, 40, '', true) + sd.tu(170, 110, 40, '', true) + sd.chu(160, 225, 'mỗi C nối + tụ, − tụ sang B bên kia', 'sd-mo', 'middle'), 'Mạch nháy hai transistor ghép chéo bằng tụ');
  BAI.dangKy({
    id: '6.3',
    muc_tieu: 'Mạch tự dao động: 2 transistor thay nhau dẫn, 2 LED nháy luân phiên. Đây là một "clock" làm bằng tay.',
    can: [K.can.npn(2), K.can.tuhoa('10µF', 2), K.can.tro('47k', 2), K.can.tro('1k', 2), K.can.led('đỏ + xanh lá', 2), ...K.coBan(12)],
    kien_thuc: `<p>Q1 dẫn → C1 sụt về ~0 → cú sụt đó đi qua tụ 1, kéo B2 xuống âm → Q2 tắt. Tụ 1 được 47k nạp lại dần, B2 lên tới ~0.65V thì Q2 dẫn, và cú sụt ở C2 đi qua tụ 2 tắt Q1. Lặp mãi.</p>
      <p>Mỗi nửa chu kỳ ≈ <code>0.69 · 47k · 10µF ≈ 0.32s</code>.</p>
      <p><b>Chân + của mỗi tụ hướng về chân C</b>, chân − về chân B bên kia. Chân B bị kéo xuống ~−4V mỗi chu kỳ: dưới mức S8050 chịu (~5V) ở pin 4.78V, nhưng <b>không</b> tăng nguồn lên cao hơn khi chưa thêm diode bảo vệ.</p>
      <p>Mạch nhiều dây: ráp theo từng nhóm, mỗi nhóm đối chiếu hình rồi mới làm nhóm sau.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Hai nửa đối xứng, nối chéo qua 2 tụ.' }],
    du_doan: '<p>Mỗi LED sáng ~0.3s rồi tắt ~0.3s, luân phiên. Thay 47k bằng 100k → chậm gấp đôi.</p>',
    phan: [{
      ten: 'Phần 1 · Ráp theo nhóm', cot: 30,
      buoc: [
        K.buocPin(),
        { ten: 'Nhóm 1: 2 transistor + E xuống −', lam: ['Q1: E 6h, B 7h, C 8h. Q2: E 20h, B 21h, C 22h (theo 5.1). Dây đen 6j và 20j → thanh −.'], board: { them: [Q1, Q2, ...E] } },
        { ten: 'Nhóm 2: 47k chân B', lam: ['47k vắt qua rãnh 7e → 7f, dây đỏ thanh + → 7a. Tương tự 21e → 21f, dây đỏ → 21a.'], board: { them: RB } },
        { ten: 'Nhóm 3: LED + 1k chân C', lam: ['LED1: chân ngắn 8g, chân dài 9g; 1k 9e → 9f; dây đỏ thanh + → 9a.', 'LED2: chân ngắn 22g, chân dài 23g; 1k 23e → 23f; dây đỏ thanh + → 23a.'], board: { them: LED } },
        { ten: 'Nhóm 4: 2 tụ nối chéo', lam: ['Tụ 1: <b>chân dài 12i</b>, chân ngắn 13i. Dây cam 8j → 12j (C1 → + tụ 1). Dây tím 13j → 21j (− tụ 1 → B2).', 'Tụ 2: <b>chân dài 16g</b>, chân ngắn 17g. Dây cam 22i → 16i (C2 → + tụ 2). Dây tím 17i → 7i (− tụ 2 → B1).'], board: { them: TU } },
        K.buocOm('Ω 200k', '> 10', 'Số lớn hơn 10k (2 đường 47k qua B–E, song song), có thể trôi vì tụ đang nạp.', 'Dưới 10k: có dây đi tắt qua điện trở. Gần 0: nối tắt.'),
        K.lapPin('Lắp pin', ['Nhìn 2 LED.'], { sua: { l1: { sang: true } } }, { thay: '2 LED nháy luân phiên, mỗi nhịp ~0.3s. Tụ và transistor nguội.', neu_khong: '1 LED sáng đứng: kiểm dây chéo của tụ (tím về đúng B bên kia). Tụ ấm: tháo pin, tụ ngược.' }),
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Chu kỳ', cot: ['Đếm số nháy của LED1 trong 30s', 'Nửa chu kỳ = 15/số nháy'], hang: [{ ten: '47k · 10µF', du_doan: ['≈ 47', '≈ 0.32 s'] }] }],
    bay: ['Tụ cắm ngược cực: mạch không nháy và tụ bị áp ngược.', 'Dây tím về nhầm B cùng bên: mạch đứng yên một trạng thái.', 'Tăng nguồn lên 9V+ với mạch này: chân B bị kéo âm quá mức chịu của transistor.'],
    robot: ['Vi điều khiển có thạch anh làm clock; mạch này cho thấy clock là một thứ dao động tuần hoàn, và R·C quyết định tần số.'],
  });
})();
