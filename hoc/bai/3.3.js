// Bài 3.3 — Tụ nối tiếp: 2 tụ 100µF, + tụ 1 ở 5g, − tụ 1 ở 6g = + tụ 2 ở 6i, − tụ 2 ở 7i.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), R = K.tro('r', ['5e', '5f'], '100k');
  const C1 = { id: 'c1', loai: 'tu', p: ['5g', '6g'], nhan: '' }, C2 = { id: 'c2', loai: 'tu', p: ['6i', '7i'], nhan: '' }, DK = K.day('dK', '7j', 'B-:7', 'den');
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
        { ten: 'Cắm 100k và 2 tụ', lam: ['Dây đỏ thanh + → 5a. 100k 5e → 5f.', 'C1 (tụ trên): <b>chân dài 5g</b>, chân ngắn 6g. C2 (tụ dưới): <b>chân dài 6i</b>, chân ngắn 7i. Dây đen 7j → thanh −.'], board: { them: [DA, R, C1, C2, DK] } },
        K.buocOm('Ω 200k', '≈ 100 → 1', 'Số tăng dần tới OL.', 'Gần 0: nối tắt.', ['Xả 2 tụ: chạm que vào chân + C1 và chân − C2 vài giây.']),
        K.lapPin('Lắp pin, bấm giờ, đo áp cả chuỗi', ['Que đỏ 5g, que đen 7i. Ghi số ở 5, 10, 25 giây.'], { them: [K.dh('DCV 20', 'c1.P', 'c2.N', '0 → 4.78')] }, { thay: 'Sau 5 giây ≈ 3.0V: nhanh gấp đôi bài 3.1.', neu_khong: 'Tụ ấm: tháo pin, có tụ cắm ngược.' }),
        { ten: 'Đo áp từng tụ', lam: ['Đầy rồi thì đo C1 (5g–6g) và C2 (6i–7i).'], board: { them: [K.dh('DCV 20', 'c1.P', 'c1.N', '≈ 2.4')] }, kiem: { thay: 'Mỗi tụ ~2.4V, cộng ≈ 4.78. Lệch nhau chút là do 2 tụ không giống hệt.', neu_khong: '' } },
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Áp chuỗi 2 tụ', cot: ['5s', '10s', '25s', 'U C1', 'U C2'], hang: [{ ten: 'Số đo', du_doan: ['≈ 3.02', '≈ 4.13', '≈ 4.75', '≈ 2.4', '≈ 2.4'] }] }],
    bay: ['Nối 2 tụ ngược chiều nhau (+ với +): một con bị áp ngược.'],
    robot: ['Muốn tụ chịu áp cao hơn thì ghép nối tiếp; muốn trữ nhiều hơn thì ghép song song.'],
  });
})();
