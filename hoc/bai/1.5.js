// Bài 1.5 — Công suất. Cùng mạch 1.4 (một điện trở thẳng vào pin), đổi 1k → 220Ω → 100Ω.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), DK = K.day('dK', '5j', 'B-:5', 'den');
  const R = gt => K.tro('r', ['5e', '5f'], gt);
  BAI.dangKy({
    id: '1.5',
    muc_tieu: 'Tính công suất một điện trở ăn, rồi sờ để thấy điện năng thành nhiệt. Biết điện trở nhỏ nhất dám cắm thẳng vào pin.',
    can: [K.can.tro('1k'), K.can.tro('220'), K.can.tro('100'), ...K.coBan(2)],
    kien_thuc: `<p><code>P = U · I = U² / R</code>. Điện trở trong kit là loại <b>1/4W = 0.25W</b>: quá mức đó là nóng tới cháy.</p>
      <p>Với pin đo được 4.78V: <code>R_min = U² / P = 4.78² / 0.25 ≈ 91Ω</code>. Bài này dừng ở 100Ω (≈ 0.23W, sát giới hạn) để sờ thấy nóng. <b>Không</b> dùng con nhỏ hơn 100Ω, không ghép 2 con song song.</p>
      <p>Cách sờ: <b>chạm nhanh mu ngón tay</b> vào thân điện trở trong 1 giây, không cầm, không bóp. Con 100Ω để quá 30 giây có thể nóng tới mức bỏng.</p>`,
    du_doan: '<p>1k: 0.023W (không thấy gì) · 220Ω: 0.10W (ấm) · 100Ω: 0.23W (nóng rõ sau 10–20 giây).</p>',
    phan: [{
      ten: 'Phần 1 · Đổi từ 1k xuống 100Ω',
      buoc: [
        K.buocPin(),
        { ten: 'Cắm 1k và 2 dây', lam: ['1k 5e → 5f, dây đỏ thanh + → 5a, dây đen 5j → thanh −.'], board: { them: [DA, R('1k'), DK] } },
        K.buocOm('Ω 20k', '≈ 1.00', '≈ 1k.', 'Gần 0: có chỗ nối tắt.'),
        K.lapPin('Lắp pin 30 giây, chạm thử', ['Đợi 30 giây, chạm nhanh mu ngón tay vào thân điện trở. Tháo pin.'], {}, { thay: 'Không ấm.', neu_khong: '' }),
        K.thaoPin(['Rút 1k, cắm 220Ω (<b>' + K.tenVong('220') + '</b>) vào 5e → 5f.'], { bo: ['r'], them: [R('220')] }),
        K.buocOm('Ω 2k', '≈ 220', '≈ 220Ω.', 'Dưới 200Ω: cắm nhầm con khác. Đọc lại vòng màu.'),
        K.lapPin('Lắp pin 30 giây, chạm thử', ['Như trên. Tháo pin.'], {}, { thay: 'Ấm nhẹ.', neu_khong: 'Nóng rát: tháo pin, cắm nhầm con nhỏ hơn.' }),
        K.thaoPin(['Rút 220Ω, cắm 100Ω (<b>' + K.tenVong('100') + '</b>) vào 5e → 5f.'], { bo: ['r'], them: [R('100')] }),
        K.buocOm('Ω 200', '≈ 100', '≈ 100Ω (95–105).', '<b>Dưới 90Ω: không lắp pin</b>, con này quá 1/4W ở 4.78V.'),
        K.lapPin('Lắp pin, chạm thử sau 10 và 20 giây', ['Chạm nhanh sau 10 giây, rồi sau 20 giây. <b>Quá 30 giây là tháo pin</b>, dù chưa thấy gì.'], {}, { thay: 'Nóng rõ, nóng hơn hẳn 220Ω.', neu_khong: 'Có mùi hoặc thân đổi màu: tháo pin ngay, bỏ con đó.' }),
        K.thaoPin(['Để điện trở nguội 1 phút rồi mới rút ra.']),
      ],
    }],
    bang_do: [{ ten: 'Công suất', cot: ['R đo (Ω)', 'P tính = 4.78²/R', 'Cảm giác'], hang: [
      { ten: '1k', du_doan: ['≈ 1000', '0.023 W', 'nguội'] }, { ten: '220Ω', du_doan: ['≈ 220', '0.10 W', 'ấm'] }, { ten: '100Ω', du_doan: ['≈ 100', '0.23 W', 'nóng'] }] }],
    bay: ['Dưới 91Ω cắm thẳng vào 4.78V là quá 1/4W: nóng, đổi màu, cháy.', 'Cầm chặt điện trở đang nóng: bỏng. Chạm nhanh bằng mu ngón tay.', 'Nguồn lithium sau này (2 cell ~8.4V): R_min thành ~280Ω, con 100Ω sẽ cháy.'],
    robot: ['Chọn điện trở cho LED, cho chân B: tính cả công suất chứ không chỉ Ohm.', 'Driver motor, ổn áp AMS1117 cũng nóng theo đúng công thức này: P = (U_vào − U_ra) · I.'],
  });
})();
