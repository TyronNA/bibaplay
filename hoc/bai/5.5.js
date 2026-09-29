// Bài 5.5 — Darlington chạm tay. Q1: E 10h, B 11h, C 12h. Q2: E 14h, B 15h, C 16h. E1 → B2: 10i → 15i. C1 ↔ C2: 12j → 16j.
// B1 ← 100k (11e → 11f) ← điểm chạm cột 11 trên. Điểm chạm kia: cột 8 trên, nối thanh + qua 10k — đầu dây tự do
// ở 8c mà nối thẳng thanh + thì rơi vào thanh − là nối tắt pin. LED + 220 ở C2.
(function () {
  const Q1 = { id: 'q1', loai: 'npn', e: '10h', b: '11h', c: '12h', nhan: 'Q1' }, Q2 = { id: 'q2', loai: 'npn', e: '14h', b: '15h', c: '16h', nhan: 'Q2' };
  const W1 = K.day('eb', '10i', '15i', 'xanh', 6), W2 = K.day('cc', '12j', '16j', 'cam', 8), DE = K.day('dE', '14j', 'B-:14', 'den');
  const R100 = K.tro('rb', ['11e', '11f'], '100k'), DP = K.tro('dP', ['T+:8', '8a'], '10k');
  const L = K.led('led', '17g', '16g', 'do', { nhan: '' }), RC = K.tro('rc', ['17e', '17f'], '220'), DC = K.day('dC', 'T+:17', '17a', 'do');
  const nhan = [{ id: 'n1', loai: 'nhan', o: '8c', dx: -22, dy: -20, chu: 'chạm 8c' }, { id: 'n2', loai: 'nhan', o: '11c', dx: 6, dy: -20, chu: '+ 11c' }];
  BAI.dangKy({
    id: '5.5',
    muc_tieu: 'Ghép 2 transistor để hFE của chúng nhân với nhau (~10 000 lần). Khi đó dòng vài µA qua da ngón tay cũng đủ bật LED.',
    can: [K.can.npn(2), K.can.tro('100k'), K.can.tro('10k'), K.can.tro('220'), K.can.led(), ...K.coBan(8)],
    kien_thuc: `<p>Cặp Darlington: E của Q1 nối vào B của Q2, 2 chân C nối chung. Dòng E của Q1 (= hFE·Ib) chính là Ib của Q2, nên hFE tổng ≈ hFE1 × hFE2.</p>
      <p>Da người ~1MΩ, nên <code>Ib ≈ 4.78/1.11M ≈ 4µA</code>. Nhân 10 000 lần được 40mA, dư để bật LED (12mA).</p>
      <p>Điểm chạm = 2 dây nhảy <b>chỉ cắm một đầu</b>: một vào 8c (cột 8 nối thanh + <b>qua 10k</b>), một vào 11c (cột 11, phía trên 100k). Đầu kia để tự do, ngón tay chạm vào 2 đầu kim loại đó. Nhờ 10k, đầu dây tự do ở 8c lỡ rơi vào thanh − cũng chỉ có ~0.5mA, không nối tắt pin. 100k + 10k giữ dòng B ≤ 43µA ngay cả khi 2 đầu dây chạm nhau.</p>
      <p>Chạm vào 4.78V là vô hại. Mạch không có điện trở kéo B xuống, nên LED có thể chập chờn khi tay lại gần mà chưa chạm, vì chân B cực nhạy, bắt được cả nhiễu điện lưới trên người.</p>`,
    du_doan: '<p>Chạm: LED sáng, bóp mạnh hoặc tay ẩm thì sáng hơn. Không chạm: tắt (hoặc chập chờn nhẹ).</p>',
    so_do: [{ nhan: 'Darlington', svg: SD.svg(320, 290, SD.pin(30, 140) + SD.chu(6, 205, '4.78V', 'sd-mo') + SD.day('30,140 30,30 240,30') + SD.cham(70, 30)
      + SD.day('70,30 70,40') + SD.tro(70, 40, 50, '10k') + SD.day('70,90 70,110') + '<circle cx="70" cy="110" r="3" class="sd-cham"/><circle cx="70" cy="132" r="3" class="sd-cham"/>' + '<path d="M62 114 q-10 7 0 14" class="sd-net" stroke-dasharray="3 3"/>' + SD.chu(80, 125, 'ngón tay', 'sd-mo')
      + SD.day('70,132 70,175') + SD.troNgang(70, 175, 50, '100k') + SD.day('120,175 120,175') + SD.npn(150, 175) + SD.chu(128, 212, 'Q1', 'sd-mo', 'end')
      + SD.day('160,145 240,145') + SD.cham(240, 145) + SD.day('160,205 160,225 200,225') + SD.npn(230, 225) + SD.chu(262, 250, 'Q2', 'sd-mo')
      + SD.day('240,30 240,34') + SD.tro(240, 34, 40, '220Ω') + SD.day('240,74 240,76') + SD.led(240, 76) + SD.day('240,116 240,195') + SD.day('240,255 240,272 30,272 30,150'),
      'Darlington: ngón tay nối cực dương qua 10k và 100k vào B của Q1, E của Q1 vào B của Q2, hai C chung, LED ở C'), chu: 'E của Q1 là B của Q2: hệ số nhân của 2 con nhân với nhau.' }],
    sau: `<h3>Hệ số nhân, và cái giá</h3>
      <p>Dòng E của Q1 ≈ β1·Ib là dòng B của Q2, nên <code>Ic ≈ β1·β2·Ib</code>. Với β1 = 150, β2 = 200 thì được 30 000. Qua da ngón tay (~1MΩ), Ib ≈ 4µA, tức có thể lên tới 120mA. Nhưng LED + 220Ω chỉ cho tối đa ~12mA, nên Q2 vào bão hoà và LED sáng hết cỡ.</p>
      <p>Cái giá phải trả: áp B–E của cặp gấp đôi (~1.3V), và cặp này <b>không bão hoà sâu được</b>, vì U_CE nhỏ nhất ≈ U_BE của Q2 + U_CE bão hoà của Q1 ≈ 0.8V. Ở dòng lớn, 0.8V × Ic thành nhiệt nhiều hơn một transistor đơn (0.1V). Module driver đời cũ (ULN2003, L298N) dùng Darlington nên nóng và sụt áp nhiều.</p>
      <h3>Vì sao tay lại gần là LED chập chờn</h3>
      <p>Cơ thể bạn ở gần dây điện 220V đi trong tường. Điện dung giữa người và dây tạo ra trên da một áp xoay chiều nhỏ 50Hz. Với hệ số nhân 10 000, dòng µA đó đủ bật LED theo nhịp 50Hz. Đây cũng là nguyên lý nút chạm kiểu cũ.</p>`,
    hoi: [
      ['β1 = 100, β2 = 250, Ib = 2µA. Ic tối đa theo khuếch đại là bao nhiêu? LED có sáng hết cỡ không?', '100 × 250 × 2µA = <b>50mA</b> &gt; 12.6mA, nên transistor bão hoà, LED sáng hết cỡ.'],
      ['Vì sao U_CE của cặp Darlington không xuống 0.1V được?', 'C của Q1 nối C chung, nên U_CE ≥ U_BE(Q2) + U_CE(Q1) ≈ 0.7 + 0.1 ≈ 0.8V.'],
      ['Bỏ 100k rồi chạm 2 đầu dây vào nhau. Tính Ib của Q1.', 'Còn 10k: Ib ≈ (4.78 − 1.3)/10k ≈ <b>0.35mA</b>, Q1 vẫn sống. Bỏ cả 10k thì chỉ còn đường B–E của 2 transistor, dòng lên hàng trăm mA, Q1 chết. Hai con điện trở là 2 lớp bảo vệ.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp và chạm', cot: 24,
      buoc: [
        K.buocPin(),
        { ten: '2 transistor và 2 dây nối', lam: ['Q1: E 10h, B 11h, C 12h. Q2: E 14h, B 15h, C 16h (theo kết quả bài 5.1).', 'Dây xanh 10i → 15i (E1 → B2). Dây cam 12j → 16j (C1 ↔ C2). Dây đen 14j → thanh − (E2).'], board: { them: [Q1, Q2, W1, W2, DE] } },
        { ten: 'LED, 220Ω, 100k và điểm chạm', lam: ['LED: chân ngắn 16g, chân dài 17g. 220Ω 17e → 17f, dây đỏ thanh + → 17a.', '100k vắt qua rãnh 11e → 11f. 10k từ thanh + (cột 8) cắm thẳng xuống <b>8a</b>, không dùng dây đỏ ở chỗ này. Hai dây chạm: một dây cắm 8c, một dây cắm 11c, 2 đầu tự do để xa thanh −.'], board: { them: [L, RC, DC, R100, DP, ...nhan] } },
        K.buocOm('Ω 200k', '1', '1 (OL): 2 điểm chạm đang hở, không có đường nào từ + xuống −.', 'Có số: dây chạm đang dính nhau, hoặc transistor cắm sai chân.'),
        K.lapPin('Lắp pin, chạm 2 đầu dây', ['Ngón cái chạm đầu dây ở 8c, ngón trỏ chạm đầu dây ở 11c.'], { sua: { led: { sang: true } } }, { thay: 'LED sáng khi chạm, tắt khi buông.', neu_khong: 'Không sáng: kiểm dây E1 → B2 và C1 ↔ C2. Transistor ấm: tháo pin.' }),
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Thử', cot: ['LED'], hang: [{ ten: 'Không chạm', du_doan: ['tắt / chập chờn'] }, { ten: 'Chạm nhẹ', du_doan: ['mờ'] }, { ten: 'Bóp mạnh, tay ẩm', du_doan: ['sáng'] }] }],
    bay: ['Bỏ 100k và 10k: 2 đầu dây chạm nhau (hoặc chạm bằng nhíp) là B1 nối thẳng vào +, Q1 chết.', 'Thay 10k ở 8a bằng dây đỏ: đầu dây chạm tự do là + pin trần, rơi vào thanh − là nối tắt pin.', 'Dây E1 → B2 cắm nhầm vào C2: mạch không chạy.'],
    robot: ['Cảm biến chạm của ESP32 (touch pin) đo điện dung của ngón tay chứ không cần dòng. Bài này cho thấy vì sao một chân vào có trở kháng cao lại dễ bắt nhiễu.'],
  });
})();
