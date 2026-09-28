// Bài 3.3 — Tụ nối tiếp: 2 tụ 100µF, + tụ 1 ở 5h, − tụ 1 ở 7h = + tụ 2 ở 7i, − tụ 2 ở 9i.
// Mỗi tụ bẻ chân rộng 2 lỗ: thân tụ vẽ đứng cao hơn chân, 2 tụ sát cột nhau thì thân tụ này che chân tụ kia trên hình.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), R = K.tro('r', ['5e', '5f'], '100k');
  const C1 = { id: 'c1', loai: 'tu', p: ['5h', '7h'], nhan: '' }, C2 = { id: 'c2', loai: 'tu', p: ['7i', '9i'], nhan: '' }, DK = K.day('dK', '9j', 'B-:9', 'den');
  BAI.dangKy({
    id: '3.3',
    muc_tieu: 'Hai tụ nối tiếp có điện dung <b>nhỏ hơn</b> một tụ: τ còn một nửa. Ngược với điện trở.',
    can: [K.can.tro('100k'), K.can.tro('1k'), K.can.tuhoa('100µF', 2), ...K.coBan(3)],
    kien_thuc: `<p>Nối tiếp: <code>1/C = 1/C1 + 1/C2</code> → 2 con 100µF = 50µF. Giống như tấm cách điện dày gấp đôi.</p>
      <p>Chiều: <b>+ của C2 nối với − của C1</b>, + của C1 về phía điện trở. Mỗi tụ chịu khoảng một nửa áp (~2.4V), dư xa 16V.</p>
      <p>Gói 100µF chỉ có 1 con: dùng 2 tụ 10µF với điện trở 1M thay cho 100k (τ = 1M × 5µF = 5s). Đồng hồ ~10MΩ song song làm áp cuối chỉ lên ~4.35V, vẫn thấy rõ τ giảm nửa.</p>`,
    du_doan: '<p>τ = 100k × 50µF = 5 giây: sau 5 giây ≈ 3.0V, sau 25 giây gần đầy. Mỗi tụ ≈ 2.4V lúc đầy.</p>',
    so_do: [{ nhan: '2 tụ nối tiếp', svg: SD.chuoi('4.78V', [['tro', '100k'], ['tu', 'C1 100µF', true], ['tu', 'C2 100µF', true]], 'Điện trở 100k nối tiếp 2 tụ 100 micro fara'), chu: '+ của C2 nối − của C1. C tương đương = 50µF, τ = 5s.' }],
    sau: `<h3>Vì sao nối tiếp thì điện dung giảm</h3>
      <p>Hai tụ nối tiếp nhận <b>cùng một lượng điện tích Q</b> (dòng chỉ có một đường). Áp tổng: <code>U = Q/C1 + Q/C2</code>, nên <code>1/C = 1/C1 + 1/C2</code>. Giống như 2 tấm cách điện xếp chồng thành một tấm dày gấp đôi.</p>
      <h3>Chia áp ngược với điện dung</h3>
      <p>Vì cùng Q, tụ nhỏ ăn áp lớn: <code>U1/U2 = C2/C1</code>. 100µF nối tiếp 10µF ở 4.78V: con 10µF ăn <code>4.78 × 100/110 ≈ 4.35V</code>. Ở đây vẫn dư xa 16V, nhưng ghép tụ nối tiếp để "chịu áp cao hơn" mà 2 con khác nhau là một con sẽ bị quá áp. Dòng rò của mỗi tụ cũng khác nhau nên lâu dần áp chia lệch; mạch thật thêm điện trở cân bằng song song mỗi tụ.</p>`,
    hoi: [
      ['100µF nối tiếp 10µF bằng bao nhiêu?', '100 × 10 / 110 ≈ <b>9.1µF</b>, nhỏ hơn con nhỏ nhất.'],
      ['Chuỗi đó ở 4.78V: tụ 10µF ăn bao nhiêu volt?', '<b>≈ 4.35V</b> (tụ nhỏ ăn phần lớn).'],
      ['Dùng 1M + 2 tụ 10µF nối tiếp. τ bằng bao nhiêu?', '1M × 5µF = <b>5 giây</b>.'],
    ],
    phan: [{
      ten: 'Phần 1 · 2 tụ nối tiếp',
      buoc: [
        K.buocPin(),
        { ten: 'Cắm 100k và 2 tụ', lam: ['Dây đỏ thanh + → 5a. 100k 5e → 5f.', 'Bẻ 2 chân mỗi tụ rộng ra cho cách nhau 2 lỗ. C1: <b>chân dài 5h</b>, chân ngắn 7h. C2: <b>chân dài 7i</b>, chân ngắn 9i — cột 7 nối − của C1 với + của C2. Dây đen 9j → thanh −.'], board: { them: [DA, R, C1, C2, DK] } },
        K.buocOm('Ω 200k', '≈ 100 → 1', 'Số tăng dần tới OL.', 'Gần 0: nối tắt.', ['Đồng hồ vừa nạp 2 tụ lên một chút. Xả về 0: hộp vẫn rỗng, chạm 2 chân một điện trở 1k vào 5g (+ C1) và 9g (− C2) khoảng 5 giây.']),
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
