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
