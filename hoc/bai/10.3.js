// Bài 10.3 — Đo áp hộp pin: cầu 10k (6e→6f) + 10k (6j→−) chia đôi; điểm giữa cột 6 dưới → GPIO1. GND board ↔ − hộp pin.
(function () {
  const DA = K.day('dA', 'T+:6', '6a', 'do'), R1 = K.tro('r1', ['6e', '6f'], '10k'), R2 = K.tro('r2', ['6j', 'B-:6'], '10k');
  const ESP = K.esp({ GND: 'B-:20', G1: '6h' }, { x: 270 });
  BAI.dangKy({
    id: '10.3',
    muc_tieu: 'Robot tự biết pin yếu: cầu phân áp chia đôi áp hộp pin cho vừa dải ADC, code nhân 2.',
    nguon: 'USB (board) + 3×AAA (đo)',
    can: [...K.coBanEsp(2), K.can.pin(), K.can.tro('10k', 2)],
    kien_thuc: `<p>Pin 4.78V vượt dải ADC (≤ 2.9V) và vượt 3.6V chịu tối đa. Cầu 10k + 10k: <code>4.78/2 = 2.39V</code>, nằm gọn trong dải.</p>
      <p>Dây GND board ↔ − hộp pin là bắt buộc (bài 8.3). <b>+ hộp pin không bao giờ nối vào board.</b></p>
      <p>Thứ tự cấp điện: <b>cắm USB trước, lắp pin sau; tháo pin trước, rút USB sau</b>. Chip chưa có điện mà chân đã nhận áp từ pin là không tốt cho chip.</p>
      <p>Cầu 20k tổng lấy ~0.24mA liên tục từ pin: với robot thật thì dùng điện trở lớn hơn (100k + 100k) để đỡ tốn pin.</p>`,
    code: 'sandbox/esp32-bai/main/bai_10_3.c',
    du_doan: '<p>Điểm giữa ≈ 2.39V; code in pin ≈ 4.78V (±0.1V).</p>',
    so_do: [{ nhan: 'Đo áp pin qua cầu', svg: SD.svg(340, 210, SD.pin(40, 100, '4.78V') + SD.day('40,100 40,30 150,30') + SD.tro(150, 30, 60, '10k') + SD.day('150,90 150,105') + SD.cham(150, 100)
      + SD.tro(150, 105, 60, '10k') + SD.day('150,165 150,185') + SD.day('40,110 40,185 210,185') + SD.cham(150, 185)
      + SD.day('150,100 200,100 200,90 238,90') + SD.khoi(250, 70, 70, 'ESP32-S3', ['GPIO1', 'GND']) + SD.day('238,110 210,110 210,185'),
      'Cầu 10k cộng 10k chia đôi áp pin, điểm giữa vào GPIO1; GND board nối cực âm pin'), chu: 'Cực + pin không bao giờ nối thẳng vào board. GND chung bắt buộc.' }],
    sau: `<h3>Sai số của cầu</h3>
      <p>Code nhân 2 giả sử 2 con 10k bằng nhau. Với ±5%, tỉ lệ thật có thể là 10.5/(9.5 + 10.5) = 0.525 thay vì 0.5 → áp pin tính ra lệch tới ±5%, tức ±0.24V ở 4.78V. Hiệu chuẩn 1 lần: đo pin bằng đồng hồ, chia cho số code in, ra hệ số sửa; hoặc đo Ω 2 con rồi dùng tỉ lệ thật trong code.</p>
      <h3>Cầu tốn pin bao nhiêu</h3>
      <p>20k ở 4.78V: 0.24mA liên tục. Pin AAA ~1000mAh → ~4000 giờ — không đáng kể so với robot, nhưng thiết bị ngủ chờ nhiều tháng thì đáng kể. Cầu 100k + 100k còn 24µA; thêm tụ 100nF ở điểm giữa để ADC lấy mẫu không bị "đói" (bài 2.5).</p>
      <h3>Lấy trung bình để bớt nhiễu</h3>
      <p>Nhiễu ngẫu nhiên giảm theo <code>√N</code>: trung bình 16 mẫu giảm nhiễu 4 lần, 64 mẫu giảm 8 lần. Sai số hệ thống (tỉ lệ cầu, lệch ADC) thì trung bình bao nhiêu cũng không hết — phải hiệu chuẩn.</p>`,
    hoi: [
      ['Đồng hồ đo pin 4.70V, code in 4.84V. Hệ số sửa là bao nhiêu?', '4.70/4.84 ≈ <b>0.971</b>: nhân kết quả code với số này.'],
      ['Pack 2S tới 8.4V. Cầu chia 2 còn dùng được không?', 'Không: 4.2V vượt dải ADC và vượt 3.6V. Chia 3 (20k + 10k) → 2.8V (bài 16.3).'],
      ['Trung bình 64 mẫu giảm nhiễu ngẫu nhiên mấy lần?', '√64 = <b>8 lần</b>.'],
    ],
    phan: [{
      ten: 'Phần 1 · Đo điểm giữa bằng đồng hồ trước, rồi mới nối GPIO', cot: 34,
      buoc: [
        K.buocPin(),
        { ten: 'Cầu 10k + 10k', lam: ['Dây đỏ thanh + → 6a. 10k vắt qua rãnh 6e → 6f. 10k từ 6j cắm thẳng xuống thanh −.'], board: { them: [DA, R1, R2] } },
        K.buocOm('Ω 200k', '≈ 20.0', '≈ 20k.', 'Gần 10k: một con bị đi tắt.'),
        K.lapPin('Lắp pin, đo điểm giữa', ['Chưa nối board. <code>DCV 20</code>, que đỏ 6h, que đen thanh −.'], { them: [K.dh('DCV 20', '6h', 'B-:10', '≈ 2.39')] }, { thay: '≈ 2.3–2.45V, <b>dưới 2.9V</b>.', neu_khong: 'Trên 2.9V: sai điện trở. Không nối GPIO.' }),
        K.thaoPin(),
        { ten: 'Nối board: GND và GPIO1', lam: ['USB rút, hộp rỗng. Dây đực–cái: <code>GND</code> → thanh − dưới (cột 20). <code>1</code> → <b>6h</b>.'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cấp điện', kiem_truoc: true, lam: ['<code>Ω 200k</code>: 2 tiếp điểm hộp pin (≈ 20k như trước). Que đỏ 6g, que đen thanh + → phải ≈ 10k (GPIO không chạm thẳng +).'], board: { them: [K.dh('Ω 200k', '6g', 'T+:10', '≈ 10.0')] }, kiem: { thay: '≈ 20k và ≈ 10k.', neu_khong: 'Gần 0: dây GPIO cắm nhầm vào cột/thanh +. Sửa ngay.' } },
        { ...K.camUsb('Cắm USB, nạp 10.3', ['<code>idf.py menuconfig</code> → 10.3, <code>flash</code>.'], {}, { thay: '', neu_khong: '' }), ten: 'Cắm USB trước, nạp 10.3' },
        K.lapPin('Rồi mới lắp pin, xem monitor', ['<code>idf.py monitor</code>. So "pin = … mV" với đồng hồ đo thẳng 2 cực pin.'], {}, { thay: 'Lệch ≤ ~0.1V.', neu_khong: 'Lệch nhiều: 2 con 10k lệch nhau, đo từng con và sửa hệ số trong code.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Áp pin', cot: ['Đồng hồ (2 cực pin)', 'Điểm giữa', 'Code in'], hang: [{ ten: 'Số đo', du_doan: ['≈ 4.78', '≈ 2.39', '≈ 4780 mV'] }] }],
    bay: ['Nối + pin thẳng vào GPIO: 4.78V > 3.6V.', 'Quên GND chung: số đọc vô nghĩa.', 'Lắp pin khi board chưa cắm USB.'],
    robot: ['Robot báo pin yếu / tự về sạc. Pin lithium 2 cell (8.4V) thì cầu phải chia 3–4 lần, tính lại cho ≤ 2.9V.'],
  });
})();
