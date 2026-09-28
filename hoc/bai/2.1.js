// Bài 2.1 — Nối tiếp, song song (đã xong theo kit; soạn lại bằng số đo Ω, không cần pin).
(function () {
  const A = K.tro('a', ['4c', '8c'], '1k'), B = K.tro('b', ['8d', '12d'], '1k');
  const C = K.tro('c', ['16c', '20c'], '1k'), D = K.tro('d', ['16d', '20d'], '1k');
  BAI.dangKy({
    id: '2.1',
    poster: [8, 9],
    muc_tieu: 'Thấy bằng số: nối tiếp thì điện trở cộng lại, song song thì nhỏ đi. Chỉ đo Ω, không cần pin.',
    can: [K.can.tro('1k', 4), K.can.bb(), K.can.dh()],
    kien_thuc: `<p>Nối tiếp: dòng chỉ có một đường, phải đi qua hết → <code>R = R1 + R2</code>.</p>
      <p>Song song: dòng có 2 đường → dễ đi hơn → <code>1/R = 1/R1 + 1/R2</code>. Hai con bằng nhau thì còn một nửa.</p>
      <p>Trên breadboard: 2 chân ở <b>cùng một cột</b> là nối với nhau. Nối tiếp = chân con này cùng cột với chân con kia. Song song = cả 2 chân đều chung cột.</p>`,
    du_doan: '<p>1k + 1k = 2k. 1k ∥ 1k = 500Ω.</p>',
    so_do: [
      { nhan: 'Nối tiếp', svg: SD.chuoi('', [['tro', 'R1 1k'], ['tro', 'R2 1k']], 'Hai điện trở nối tiếp đo bằng thang ôm', { nguon: { ten: 'Ω', tren: 'que đỏ', duoi: 'que đen' } }), chu: 'Một đường duy nhất: R = R1 + R2 = 2k.' },
      { nhan: 'Song song', svg: SD.svg(300, 200, SD.hop(20, 60, 70, 80, 'Ω') + SD.day('90,76 130,76 130,30 230,30') + SD.day('90,124 130,124 130,170 230,170')
        + SD.day('170,30 170,70') + SD.tro(170, 70, 60, 'R1') + SD.day('170,130 170,170') + SD.day('230,30 230,70') + SD.tro(230, 70, 60, 'R2') + SD.day('230,130 230,170')
        + SD.cham(170, 30) + SD.cham(170, 170), 'Hai điện trở song song đo bằng thang ôm'), chu: 'Hai đường: 1/R = 1/R1 + 1/R2 → 500Ω.' },
    ],
    sau: `<h3>Song song cộng "độ dẫn"</h3>
      <p>Đặt <code>G = 1/R</code> (độ dẫn, đơn vị siemens). Song song thì các đường cho dòng cộng lại, nên <b>G cộng lại</b>: <code>G = G1 + G2</code>. Đổi về R là ra công thức <code>1/R = 1/R1 + 1/R2</code>, hay gọn với 2 con: <code>R = R1·R2 / (R1 + R2)</code>.</p>
      <p>Hệ quả dễ nhớ: cụm song song luôn <b>nhỏ hơn con nhỏ nhất</b> trong cụm; n con bằng nhau song song còn R/n; một con rất lớn song song một con nhỏ thì gần như không đổi gì (10k ∥ 1M ≈ 9.9k).</p>
      <p>Nối tiếp thì ngược lại: R cộng lại, và cụm luôn lớn hơn con lớn nhất.</p>`,
    hoi: [
      ['1k nối tiếp 2.2k nối tiếp 4.7k bằng bao nhiêu?', '<b>7.9k</b>.'],
      ['1k song song 2.2k bằng bao nhiêu?', '1 × 2.2 / 3.2 ≈ <b>688Ω</b>, nhỏ hơn 1k như dự đoán.'],
      ['Chỉ có các con 1k. Ghép thế nào ra 1.5k?', '2 con song song (500Ω) nối tiếp với 1 con 1k.'],
    ],
    phan: [{
      ten: 'Phần 1 · Nối tiếp và song song',
      buoc: [
        { ten: 'Nối tiếp: 4c–8c và 8d–12d', lam: ['Con a: 4c → 8c. Con b: 8d → 12d. Cột 8 là chỗ 2 con gặp nhau.'], board: { them: [A, B] } },
        { ten: 'Đo cả chuỗi', lam: ['Núm <code>Ω 20k</code>. Que vào chân ở cột 4 và chân ở cột 12.'], board: { them: [K.dh('Ω 20k', 'a.1', 'b.2', '≈ 2.00')] }, kiem: { thay: '≈ 2k.', neu_khong: '≈ 1k: 2 con không chung cột 8.' } },
        { ten: 'Song song: 16c–20c và 16d–20d', lam: ['Con c và con d cùng cắm từ cột 16 sang cột 20.'], board: { them: [C, D] } },
        { ten: 'Đo cụm song song', lam: ['Núm <code>Ω 2k</code>. Que vào cột 16 và cột 20.'], board: { them: [K.dh('Ω 2k', 'c.1', 'c.2', '≈ 500')] }, kiem: { thay: '≈ 500Ω.', neu_khong: '' } },
      ],
    }],
    bang_do: [{ ten: 'Ω', cot: ['Tính', 'Đo'], hang: [{ ten: 'Nối tiếp', du_doan: ['2000', '≈ 2k'] }, { ten: 'Song song', du_doan: ['500', '≈ 500'] }] }],
    bay: ['2 LED nối tiếp ở 4.78V: 2 LED đỏ còn rất mờ, LED xanh dương/trắng nối tiếp thì không sáng (poster bài 8 tính với 5V).'],
    robot: ['Ghép pin: nối tiếp thì áp cộng lại (2 cell lithium = 8.4V), song song thì dung lượng cộng lại. Pin lithium ghép sai là nguy hiểm: làm theo bài 16.1–16.2.'],
  });
})();
