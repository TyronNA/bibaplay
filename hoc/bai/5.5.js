// Bài 5.5 — Darlington chạm tay. Q1: E 10h, B 11h, C 12h. Q2: E 14h, B 15h, C 16h. E1 → B2: 10i → 15i. C1 ↔ C2: 12j → 16j.
// B1 ← 100k (11e → 11f) ← điểm chạm cột 11 trên. Điểm chạm kia: cột 8 trên, nối thanh +. LED + 220 ở C2.
(function () {
  const Q1 = { id: 'q1', loai: 'npn', e: '10h', b: '11h', c: '12h', nhan: 'Q1' }, Q2 = { id: 'q2', loai: 'npn', e: '14h', b: '15h', c: '16h', nhan: 'Q2' };
  const W1 = K.day('eb', '10i', '15i', 'xanh', 6), W2 = K.day('cc', '12j', '16j', 'cam', 8), DE = K.day('dE', '14j', 'B-:14', 'den');
  const R100 = K.tro('rb', ['11e', '11f'], '100k'), DP = K.day('dP', 'T+:8', '8a', 'do');
  const L = K.led('led', '17g', '16g', 'do', { nhan: '' }), RC = K.tro('rc', ['17e', '17f'], '220'), DC = K.day('dC', 'T+:17', '17a', 'do');
  const nhan = [{ id: 'n1', loai: 'nhan', o: '8c', dx: -22, dy: -20, chu: 'chạm 8c' }, { id: 'n2', loai: 'nhan', o: '11c', dx: 6, dy: -20, chu: '+ 11c' }];
  BAI.dangKy({
    id: '5.5',
    muc_tieu: 'Ghép 2 transistor để hFE nhân nhau (~10 000 lần): dòng vài µA qua da ngón tay đủ bật LED.',
    can: [K.can.npn(2), K.can.tro('100k'), K.can.tro('220'), K.can.led(), ...K.coBan(8)],
    kien_thuc: `<p>Darlington: E của Q1 nối B của Q2, hai C nối chung. Dòng E của Q1 (= hFE·Ib) chính là Ib của Q2 → tổng hFE ≈ hFE1 × hFE2.</p>
      <p>Da người ~1MΩ: <code>Ib ≈ 4.78/1.1M ≈ 4µA</code> → nhân 10 000 = 40mA, dư để bật LED (12mA).</p>
      <p>Điểm chạm = 2 dây nhảy <b>chỉ cắm một đầu</b>: một vào 8c (cột 8 đã nối thanh +), một vào 11c (cột 11, phía trên 100k). Đầu kia để tự do, ngón tay chạm 2 đầu kim loại đó. 100k giữ dòng B ≤ 48µA ngay cả khi 2 đầu dây chạm nhau.</p>
      <p>Chạm vào 4.78V là vô hại. Không có điện trở kéo B xuống nên LED có thể chập chờn khi tay lại gần mà chưa chạm: chân B cực nhạy, bắt được cả nhiễu điện lưới trên người.</p>`,
    du_doan: '<p>Chạm: LED sáng, bóp mạnh/tay ẩm sáng hơn. Không chạm: tắt (hoặc chập chờn nhẹ).</p>',
    phan: [{
      ten: 'Phần 1 · Ráp và chạm', cot: 24,
      buoc: [
        K.buocPin(),
        { ten: '2 transistor và 2 dây nối', lam: ['Q1: E 10h, B 11h, C 12h. Q2: E 14h, B 15h, C 16h (theo 5.1).', 'Dây xanh 10i → 15i (E1 → B2). Dây cam 12j → 16j (C1 ↔ C2). Dây đen 14j → thanh − (E2).'], board: { them: [Q1, Q2, W1, W2, DE] } },
        { ten: 'LED, 220Ω, 100k và điểm chạm', lam: ['LED: chân ngắn 16g, chân dài 17g. 220Ω 17e → 17f, dây đỏ thanh + → 17a.', '100k vắt qua rãnh 11e → 11f. Dây đỏ thanh + → 8a. Hai dây chạm: một đầu cắm 8c, một đầu cắm 11c.'], board: { them: [L, RC, DC, R100, DP, ...nhan] } },
        K.buocOm('Ω 200k', '1', '1 (OL): 2 điểm chạm đang hở, không có đường nào từ + xuống −.', 'Có số: dây chạm đang dính nhau, hoặc transistor cắm sai chân.'),
        K.lapPin('Lắp pin, chạm 2 đầu dây', ['Ngón cái chạm đầu dây ở 8c, ngón trỏ chạm đầu dây ở 11c.'], { sua: { led: { sang: true } } }, { thay: 'LED sáng khi chạm, tắt khi buông.', neu_khong: 'Không sáng: kiểm dây E1 → B2 và C1 ↔ C2. Transistor ấm: tháo pin.' }),
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Thử', cot: ['LED'], hang: [{ ten: 'Không chạm', du_doan: ['tắt / chập chờn'] }, { ten: 'Chạm nhẹ', du_doan: ['mờ'] }, { ten: 'Bóp mạnh, tay ẩm', du_doan: ['sáng'] }] }],
    bay: ['Bỏ 100k: 2 đầu dây chạm nhau (hoặc chạm bằng nhíp) là B1 nối thẳng +, Q1 chết.', 'Dây E1 → B2 cắm nhầm vào C2: mạch không chạy.'],
    robot: ['Cảm biến chạm của ESP32 (touch pin) đo điện dung ngón tay chứ không cần dòng; bài này cho thấy vì sao chân vào trở kháng cao dễ bắt nhiễu.'],
  });
})();
