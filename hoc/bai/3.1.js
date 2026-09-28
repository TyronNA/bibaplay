// Bài 3.1 — Nạp tụ chậm. 100k: 5e → 5f; tụ 100µF: + ở 5h, − ở 6h; dây đen 6j → thanh −.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), R = K.tro('r', ['5e', '5f'], '100k');
  const C = { id: 'c', loai: 'tu', p: ['5h', '6h'], nhan: '100µF' }, DK = K.day('dK', '6j', 'B-:6', 'den');
  const XA = K.day('xa', '5b', 'B-:3', 'den', 14);
  const sd = SD;
  const soDo = sd.svg(300, 190, sd.mui + sd.pin(40, 95, '4.78V') + sd.day('40,95 40,20 160,20 160,30') + sd.tro(160, 30, 60, '100k') + sd.tu(160, 90, 60, '100µF', true)
    + sd.day('160,150 160,175 40,175 40,105') + sd.day('160,90 240,90 240,104') + sd.dongHo(240, 120, 'V') + sd.day('240,136 240,175 160,175'), 'Điện trở 100k nạp tụ 100µF, đồng hồ đo áp trên tụ');
  const t = [0, 5, 10, 20, 30, 50], nap = t.map(x => (4.78 * (1 - Math.exp(-x / 10))).toFixed(2)), xa = [0, 10, 20, 30].map(x => (4.78 * Math.exp(-x / 10)).toFixed(2));
  BAI.dangKy({
    id: '3.1',
    poster: [21, 23],
    muc_tieu: 'Xem tụ nạp chậm qua điện trở, đo được hằng số thời gian <code>τ = R·C</code>, rồi xem tụ xả.',
    can: [K.can.tro('100k'), K.can.tuhoa('100µF'), ...K.coBan(3)],
    kien_thuc: `<p>Tụ là 2 tấm kim loại cách nhau một lớp mỏng. Nạp = dồn điện tích lên 2 tấm; áp trên tụ tăng dần, dòng nạp giảm dần. Qua điện trở R: sau <code>τ = R·C</code> giây tụ lên 63%, sau 5τ gần đầy.</p>
      <p><b>Tụ hoá có cực</b>: chân dài = +, vạch sọc trên thân là phía −. <b>Cắm ngược có thể phồng, xì, nổ</b>. Tụ 16V, bài này 4.78V: dư xa.</p>
      <p>100k × 100µF = 10 giây. Cần đồng hồ bấm giờ (điện thoại).</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: '+ của tụ về phía điện trở (phía thanh +).' }],
    du_doan: `<p>Nạp: <code>U = 4.78·(1 − e^(−t/10))</code>. Xả qua 100k: <code>U = 4.78·e^(−t/10)</code>.</p>`,
    phan: [
      {
        ten: 'Phần 1 · Nạp',
        buoc: [
          K.buocPin(),
          { ten: 'Cắm 100k, tụ và dây', lam: ['Dây đỏ thanh + → 5a. 100k (' + K.tenVong('100k') + ') vắt qua rãnh 5e → 5f.', 'Tụ 100µF: <b>chân dài (+) vào 5h</b>, chân ngắn (sọc −) vào 6h. Dây đen 6j → thanh −.'], board: { them: [DA, R, C, DK] } },
          K.buocOm('Ω 200k', '≈ 100 → 1', 'Số bắt đầu ≈ 100k rồi <b>tăng dần tới 1 (OL)</b>: đồng hồ đang nạp tụ bằng dòng nhỏ của nó. Đúng.', 'Đứng yên ở gần 0: tụ hoặc dây nối tắt.', ['Xong thì chạm 2 que vào 2 chân tụ vài giây ở thang Ω để tụ về gần 0 trước khi bắt đầu.']),
          K.lapPin('Lắp pin, bấm giờ, đọc áp trên tụ', ['Que đỏ chân + tụ (5h), que đen chân − (6h), <code>DCV 20</code>. Lắp pin và bấm giờ cùng lúc. Ghi số ở 5, 10, 20, 30, 50 giây.'],
            { them: [K.dh('DCV 20', 'c.P', 'c.N', '0 → 4.78')] }, { thay: 'Sau 10 giây ≈ 3.0V, sau 50 giây ≈ 4.75V.', neu_khong: 'Lên gần 4.78 ngay: đang dùng tụ nhỏ hoặc điện trở nhỏ. Tụ ấm hoặc phồng: <b>tháo pin</b>, tụ đang cắm ngược.' }),
        ],
      },
      {
        ten: 'Phần 2 · Xả qua 100k', ke_thua: true,
        buoc: [
          K.thaoPin(['Rút dây đỏ thanh + → 5a. Cắm dây đen <b>5b → thanh −</b>: giờ tụ xả qua 100k xuống −. Làm nhanh để tụ còn gần đầy.'], { bo: ['dA'], them: [XA] }),
          { ten: 'Bấm giờ, đọc áp tụt', lam: ['Que vẫn ở 2 chân tụ. Bấm giờ khi cắm xong dây đen, ghi số ở 10, 20, 30 giây.'], board: { them: [K.dh('DCV 20', 'c.P', 'c.N', '4.78 → 0')] }, kiem: { thay: 'Sau 10 giây còn ~37%.', neu_khong: '' } },
        ],
      },
    ],
    bang_do: [
      { ten: 'Nạp (V trên tụ)', cot: t.map(x => x + 's'), hang: [{ ten: 'Số đo', du_doan: nap }] },
      { ten: 'Xả (V trên tụ)', cot: ['0s', '10s', '20s', '30s'], hang: [{ ten: 'Số đo', du_doan: xa }] },
    ],
    bay: ['Tụ hoá cắm ngược: nóng, phồng, có thể nổ. Chân dài về phía +.', 'Chập thẳng 2 chân tụ to đã nạp bằng dây: tia lửa nhỏ, mòn chân. Xả qua điện trở.', 'Đồng hồ ở thang V cũng xả tụ rất chậm (~10MΩ): áp tụt dần dù đã rút nguồn là bình thường.'],
    robot: ['Tụ sát chân nguồn ESP32 bù lúc chip kéo dòng đột ngột (bài 8.4).', 'Mạch RC là bộ lọc: làm mượt tín hiệu nhiễu trước khi vào ADC, chống dội nút (bài 9.4).'],
  });
})();
