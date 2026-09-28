// Bài 9.5 — Hạ 5V xuống ~3.3V bằng cầu 10k/20k. 5V board → 5a (cột riêng, không phải thanh nguồn). 10k 5c → 9c. 20k 9e → 9f, 9j → −.
(function () {
  const ESP0 = K.esp({ '5V': '5a', GND: 'B-:3' });
  const R1 = K.tro('r1', ['5c', '9c'], '10k'), R2 = K.tro('r2', ['9e', '9f'], '20k'), DK = K.day('dK', '9j', 'B-:9', 'den');
  const ESP1 = K.esp({ '5V': '5a', GND: 'B-:3', G12: '9a' });
  const sd = SD;
  const soDo = sd.svg(300, 190, sd.chu(30, 16, '5V (USB)', 'sd-pos') + sd.day('60,20 150,20') + sd.tro(150, 20, 60, '10k') + sd.tro(150, 80, 60, '20k') + sd.day('150,140 150,160') + sd.dat(150, 160)
    + sd.cham(150, 80) + sd.day('150,80 230,80') + sd.chu(236, 84, 'GPIO12', 'sd-chu') + sd.chu(160, 76, '≈ 3.3V', 'sd-mo'), 'Cầu 10k trên, 20k dưới hạ 5V xuống khoảng 3.3V cho GPIO');
  BAI.dangKy({
    id: '9.5',
    muc_tieu: 'GPIO ESP32-S3 không chịu 5V. Hạ tín hiệu 5V xuống ~3.3V bằng cầu phân áp, <b>đo bằng đồng hồ trước</b> rồi mới nối vào chân.',
    can: [...K.coBanEsp(3), K.can.tro('10k'), K.can.tro('20k')],
    kien_thuc: `<p>Datasheet: áp vào mọi chân tối đa <b>VDD + 0.3 = 3.6V</b>. 5V vào GPIO là quá, có thể hỏng chân hoặc cả chip.</p>
      <p><code>5 × 20k/(10k + 20k) = 3.33V</code>. USB thực tế 4.8–5.1V → 3.2–3.4V: trên mức "1" (2.48V), dưới 3.6V.</p>
      <p>Bài này lấy 5V ngay từ chân <code>5V</code> của board làm "tín hiệu 5V" giả. Dây 5V cắm vào <b>cột 5</b> riêng, không phải thanh nguồn, để không bao giờ lẫn với 3V3.</p>
      <p>Không có 20k thì dùng 2 con 10k nối tiếp.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Chỉ nối GPIO sau khi đã đo điểm giữa ≤ 3.4V.' }],
    code: 'sandbox/esp32-bai/main/bai_9_3.c',
    du_doan: '<p>Điểm giữa ≈ 3.2–3.4V. GPIO12 đọc ra 1.</p>',
    sau: `<h3>Tính cho trường hợp xấu nhất</h3>
      <p>5V × 20k/30k = 3.33V là với số danh nghĩa. Điện trở ±5% và USB 5.25V: xấu nhất R1 = 9.5k, R2 = 21k → <code>5.25 × 21/30.5 ≈ 3.61V</code> — <b>chạm</b> mức 3.6V tối đa. Chưa hỏng, nhưng không có dư. Bài này vẫn dùng 10k/20k vì bạn <b>đo</b> điểm giữa trên đúng board và đúng 2 con điện trở của mình: ra ≤ 3.45V là còn dư 0.15V. Mạch không đo từng cái (làm hàng loạt, hay nguồn 5V lạ) thì chọn tỉ lệ thấp hơn, vd 10k + 15k:</p>
      <p>Danh nghĩa 3.0V; xấu nhất cao: 5.25 × 15.75/(9.5 + 15.75) ≈ 3.27V; xấu nhất thấp: 4.75 × 14.25/(10.5 + 14.25) ≈ 2.73V — vẫn trên ngưỡng 1 (2.475V). Thiết kế đúng là kiểm cả 2 đầu.</p>
      <h3>Cầu phân áp nhanh cỡ nào</h3>
      <p>Chân vào có ~5–10pF. R_th của cầu = 10k ∥ 20k ≈ 6.7k → τ ≈ 6.7k × 10pF ≈ 67ns: đủ cho tín hiệu tới cỡ 1MHz (Echo của HC-SR04, UART 115200). I2C 2 chiều thì cầu không dùng được (chỉ hạ 1 chiều) → dùng module chuyển mức MOSFET BSS138.</p>`,
    hoi: [
      ['Cầu 10k + 22k từ 5V. Điểm giữa danh nghĩa bao nhiêu? An toàn không?', '5 × 22/32 ≈ <b>3.44V</b>; xấu nhất vượt 3.6V → không nên.'],
      ['Vì sao không nối 5V qua một điện trở 10k vào GPIO rồi thôi?', 'Chân sẽ bị kéo lên 5V qua diode bảo vệ bên trong chip, đẩy dòng vào đường 3.3V — không được datasheet cho phép lâu dài.'],
      ['Cầu 10k + 20k tốn bao nhiêu dòng từ 5V?', '5/30k ≈ <b>0.17mA</b>.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Cầu phân áp, chưa nối GPIO',
        buoc: [
          { ten: 'Cầu 10k + 20k', lam: ['USB rút. 10k 5c → 9c. 20k (đỏ-đen-cam) vắt qua rãnh 9e → 9f. Dây đen 9j → thanh −.'], board: { them: [R1, R2, DK] } },
          { ten: 'Dây 5V và GND từ board', lam: ['<code>5V</code> → <b>5a</b> (không phải thanh +). <code>GND</code> → thanh − dưới. Chưa nối chân GPIO nào.'], board: { them: [ESP0] } },
          { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>. Que đỏ 5b (5V), que đen thanh −.'], board: { them: [K.dh('Ω 200k', '5b', 'B-:12', '≤ 30')] }, kiem: { thay: '≈ 30k song song với mốc 5V–GND ở 8.1 → không dưới 100Ω.', neu_khong: 'Gần 0: dây 5V đang chạm GND. Không cắm USB.' } },
          K.camUsb('Cắm USB, đo điểm giữa', ['<code>DCV 20</code>, que đỏ 9b, que đen thanh −. Đo cả 5V (5b).'], { them: [K.dh('DCV 20', '9b', 'B-:12', '≈ 3.3')] }, { thay: '5V ≈ 4.8–5.1; điểm giữa ≈ 3.2–3.4, <b>không quá 3.45</b>.', neu_khong: 'Điểm giữa > 3.45: 2 điện trở đảo chỗ, sai giá trị, hoặc 5V của cổng USB cao. Không đi tiếp: thay 20k bằng con nhỏ hơn (15k–18k), hoặc thêm 2.2k nối tiếp con 10k, đo lại.' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Nối vào GPIO12', ke_thua: true,
        buoc: [
          { ten: 'Dây GPIO12 → 9a', lam: ['USB rút. Chân <code>12</code> → <b>9a</b> (cột điểm giữa).'], board: { bo: ['esp'], them: [ESP1] } },
          { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>. Que đỏ 5b, que đen 9b: phải ≈ 10k (dây GPIO không cắm nhầm vào cột 5).'], board: { them: [K.dh('Ω 200k', '5b', '9b', '≈ 10.0')] }, kiem: { thay: '≈ 10k.', neu_khong: 'Gần 0: GPIO đang ở cột 5 = nhận thẳng 5V. Sửa ngay.' } },
          K.camUsb('Cắm USB, nạp 9.3, đọc', ['<code>idf.py menuconfig</code> → 9.3, <code>flash monitor</code>.'], {}, { thay: 'In 1111… ở cả 2 đợt.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: 'Áp', cot: ['5V', 'Điểm giữa', 'GPIO đọc'], hang: [{ ten: 'Số đo', du_doan: ['4.8–5.1', '3.2–3.4', '1'] }] }],
    bay: ['Đảo 10k và 20k: điểm giữa ≈ 1.7V — không hỏng nhưng sát vùng không xác định.', 'Cắm dây 5V vào thanh + đang nối 3V3: 2 nguồn đấu nhau.', 'Nối GPIO trước khi đo điểm giữa.'],
    robot: ['Cảm biến siêu âm HC-SR04 (5V) ra chân ECHO 5V: cần đúng cầu này hoặc module chuyển mức.'],
  });
})();
