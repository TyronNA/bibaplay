// Bài 3.3 — Tụ nối tiếp: 2 tụ 100µF, + tụ 1 ở 5h, − tụ 1 ở 7h = + tụ 2 ở 7i, − tụ 2 ở 9i.
// Mỗi tụ bẻ chân rộng 2 lỗ: thân tụ vẽ đứng cao hơn chân, 2 tụ sát cột nhau thì thân tụ này che chân tụ kia trên hình.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), R = K.tro('r', ['5e', '5f'], '100k');
  const C1 = { id: 'c1', loai: 'tu', p: ['5h', '7h'], nhan: '' }, C2 = { id: 'c2', loai: 'tu', p: ['7i', '9i'], nhan: '' }, DK = K.day('dK', '9j', 'B-:9', 'den');
  BAI.dangKy({
    id: '3.3',
    muc_tieu: 'Hai tụ nối tiếp có điện dung <b>nhỏ hơn</b> một tụ: τ còn một nửa. Ngược với điện trở.',
    can: [K.can.tro('100k'), K.can.tuhoa('100µF', 2), ...K.coBan(3)],
    kien_thuc: `<p>Nối tiếp: <code>1/C = 1/C1 + 1/C2</code> → 2 con 100µF = 50µF. Giống như tấm cách điện dày gấp đôi.</p>
      <p>Chiều: <b>+ của C2 nối với − của C1</b>, + của C1 về phía điện trở. Mỗi tụ chịu khoảng một nửa áp (~2.4V), dư xa 16V.</p>
      <p>Gói 100µF chỉ có 1 con: dùng 2 tụ 10µF với điện trở 1M thay cho 100k (τ = 1M × 5µF = 5s). Đồng hồ ~10MΩ song song làm áp cuối chỉ lên ~4.35V, vẫn thấy rõ τ giảm nửa.</p>`,
    du_doan: '<p>τ = 100k × 50µF = 5 giây: sau 5 giây ≈ 3.0V, sau 25 giây gần đầy. Mỗi tụ ≈ 2.4V lúc đầy.</p>',
    phan: [{
      ten: 'Phần 1 · 2 tụ nối tiếp',
      buoc: [
        K.buocPin(),
        { ten: 'Cắm 100k và 2 tụ', lam: ['Dây đỏ thanh + → 5a. 100k 5e → 5f.', 'Bẻ 2 chân mỗi tụ rộng ra cho cách nhau 2 lỗ. C1: <b>chân dài 5h</b>, chân ngắn 7h. C2: <b>chân dài 7i</b>, chân ngắn 9i — cột 7 nối − của C1 với + của C2. Dây đen 9j → thanh −.'], board: { them: [DA, R, C1, C2, DK] } },
        K.buocOm('Ω 200k', '≈ 100 → 1', 'Số tăng dần tới OL.', 'Gần 0: nối tắt.', ['Xả 2 tụ: chạm que vào chân + C1 và chân − C2 vài giây.']),
        K.lapPin('Lắp pin, bấm giờ, đo áp cả chuỗi', ['Que đỏ 5g, que đen 9g. Ghi số ở 5, 10, 25 giây.'], { them: [K.dh('DCV 20', 'c1.P', 'c2.N', '0 → 4.78')] }, { thay: 'Sau 5 giây ≈ 3.0V: nhanh gấp đôi bài 3.1.', neu_khong: 'Tụ ấm: tháo pin, có tụ cắm ngược.' }),
        { ten: 'Đo áp từng tụ', lam: ['Đầy rồi thì đo C1 (5g–7g) và C2 (7g–9g).'], board: { them: [K.dh('DCV 20', 'c1.P', 'c1.N', '≈ 2.4')] }, kiem: { thay: 'Mỗi tụ ~2.4V, cộng ≈ 4.78. Lệch nhau chút là do 2 tụ không giống hệt.', neu_khong: '' } },
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Áp chuỗi 2 tụ', cot: ['5s', '10s', '25s', 'U C1', 'U C2'], hang: [{ ten: 'Số đo', du_doan: ['≈ 3.02', '≈ 4.13', '≈ 4.75', '≈ 2.4', '≈ 2.4'] }] }],
    bay: ['Nối 2 tụ ngược chiều nhau (+ với +): một con bị áp ngược.'],
    robot: ['Muốn tụ chịu áp cao hơn thì ghép nối tiếp; muốn trữ nhiều hơn thì ghép song song.'],
  });
})();
