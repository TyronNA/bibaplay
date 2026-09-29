// Bài 12.2 — Mic INMP441 qua I2S. Module cắm VDD 10a, GND 11a, SD 12a, SCK 13a, WS 14a, L/R 15a (thứ tự giả định — đọc chữ in).
(function () {
  const MIC = { id: 'mic', loai: 'mod', ten: 'INMP441', mau: 'xanhduong', chan: [['VDD', '10a'], ['GND', '11a'], ['SD', '12a'], ['SCK', '13a'], ['WS', '14a'], ['LR', '15a', 'L/R']] };
  const ESP = K.esp({ '3V3': '10c', GND: '11c', G6: '12c', G5: '13c', G4: '14c' });
  const LR = K.day('lr', '15c', '11d', 'den', 6);
  BAI.dangKy({
    id: '12.2',
    muc_tieu: 'Dùng bus I2S cho âm thanh: đọc mic số INMP441 và in mức âm ra màn hình. Đây chính là mic của xiaozhi.',
    can: [...K.coBanEsp(5), { ten: 'Mic I2S INMP441', tim: 'INMP441', lk: 'inmp441', sl: 1 }],
    kien_thuc: `<p>I2S có 3 dây: <b>SCK</b> (clock bit) nháy một nhịp cho mỗi bit, <b>WS</b> báo đang gửi kênh trái hay phải, <b>SD</b> là dữ liệu từ mic. Mic gửi mỗi mẫu 24 bit trong một khung 32 bit, 16 000 mẫu mỗi giây.</p>
      <p><b>L/R nối GND</b> thì mic gửi ở kênh trái, và code đọc kênh trái. Nếu để L/R thả nổi, có lúc đọc được, có lúc không.</p>
      <p><b>VDD = 3V3</b>, không phải 5V. Chân WS=4, SCK=5, SD=6 lấy theo board <code>bread-compact-wifi</code> của xiaozhi.</p>
      <p>INMP441 có loại header 1 hàng 6 chân, có loại 2 hàng 3 chân. Hình vẽ loại 1 hàng. Loại 2 hàng thì cắm vắt qua rãnh giữa (mỗi chân một cột), rồi nối dây theo <b>chữ in trên module</b>.</p>`,
    code: 'sandbox/esp32-bai/main/bai_12_2.c',
    du_doan: '<p>Phòng yên tĩnh: khoảng −70 tới −60 dBFS. Nói gần mic: lên −30 tới −20. Vỗ tay: gần −10.</p>',
    so_do: [{ nhan: 'Mic I2S', svg: SD.svg(340, 210, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['3V3', 'GND', 'GPIO4 WS', 'GPIO5 SCK', 'GPIO6 SD']) + SD.khoi(230, 40, 80, 'INMP441', ['VDD', 'GND', 'WS', 'SCK', 'SD', 'L/R'])
      + SD.day('122,60 218,60') + SD.day('122,80 218,80') + SD.day('122,100 218,100') + SD.day('122,120 218,120') + SD.day('122,140 218,140')
      + SD.day('218,160 200,160 200,166') + SD.dat(200, 166),
      'ESP32 nối INMP441: 3V3, GND, WS 4, SCK 5, SD 6; L/R xuống GND'), chu: 'L/R nối GND: mic gửi ở kênh trái. VDD là 3V3.' }],
    sau: `<h3>Tần số lấy mẫu và clock</h3>
      <p>Lấy 16 000 mẫu/giây thì thu được âm thanh tới <b>8kHz</b>, vì theo định lý lấy mẫu, phải lấy mẫu nhanh gấp đôi tần số cao nhất. Giọng nói nằm chủ yếu dưới 4kHz nên như vậy là đủ. Clock bit SCK = 16 000 × 32 bit × 2 kênh = <b>1.024MHz</b>. Ở tần số này, dây lỏng hoặc dài vài chục cm là bắt đầu có lỗi bit, nghe thành tiếng lách tách.</p>
      <h3>dBFS nghĩa là gì</h3>
      <p><code>dBFS = 20·log₁₀(biên độ / biên độ tối đa)</code>. 0 dBFS là mức to nhất còn số hoá được, −20 dBFS là 1/10 biên độ đó, −60 dBFS là 1/1000. Theo datasheet INMP441, âm 94dB SPL (rất to, như máy cắt cỏ sát tai) cho ra −26 dBFS, và cứ âm nhỏ đi 20dB thì số giảm 20 dBFS. Phòng yên tĩnh ~40dB SPL cho ra cỡ −80 dBFS, mức này đã lẫn vào nhiễu của mic (SNR 61dB).</p>
      <h3>24 bit để làm gì</h3>
      <p>Mỗi bit thêm được ~6dB dải động, nên 24 bit ≈ 144dB, nhiều hơn mức mic làm được. Code chỉ lấy 16 bit cao là đủ, và xiaozhi cũng chỉ gửi 16 bit.</p>`,
    hoi: [
      ['Muốn thu tới 12kHz thì tần số lấy mẫu tối thiểu?', '<b>24kHz</b> (gấp đôi). Thực tế nên chọn 32kHz cho dư.'],
      ['Mức âm đo được −40 dBFS. Biên độ bằng mấy phần của tối đa?', '10^(−40/20) = <b>1/100</b>.'],
      ['Để L/R thả nổi thì sao?', 'Mic không biết phải gửi ở kênh nào, nên có lúc code đọc được, có lúc chỉ ra 0.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, đọc mức âm',
      buoc: [
        { ten: 'Cắm mic, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm mic vào 10a–15a (mỗi chân một cột). Ghi tên chân theo chữ in: cột 10 = ?, … cột 15 = ?'], board: { them: [MIC] }, kiem: { thay: 'Biết chắc VDD, GND, SD, SCK, WS, L/R ở cột nào.', neu_khong: 'Chưa rõ thì chưa đi tiếp.' } },
        { ten: 'Dây từ board theo tên chân', lam: ['<code>3V3</code> → cột VDD. <code>GND</code> → cột GND. <code>6</code> → SD, <code>5</code> → SCK, <code>4</code> → WS. Dây đen từ cột L/R (15c) sang cột GND (11d).'], board: { them: [ESP, LR] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>: que đỏ cột VDD, que đen cột GND.'], board: { them: [K.dh('Ω 200k', '10d', '11e', '> 0.1')] }, kiem: { thay: 'Không dưới ~100Ω.', neu_khong: 'Gần 0: VDD chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 12.2', ['<code>idf.py menuconfig</code> → 12.2, <code>flash monitor</code>. Im lặng 5 giây, rồi nói, rồi vỗ tay.'], {}, { thay: 'Thanh ### dài ra khi nói.', neu_khong: 'Số đứng yên ở −180 (toàn số 0): SD cắm sai chân, hoặc L/R chưa nối GND. Số nhảy loạn không theo tiếng: SCK và WS đang bị đảo.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Mức âm (dBFS)', cot: ['dBFS'], hang: [{ ten: 'Im lặng', du_doan: ['−70 … −60'] }, { ten: 'Nói cách 20cm', du_doan: ['−35 … −25'] }, { ten: 'Vỗ tay', du_doan: ['> −15'] }] }],
    bay: ['Cấp 5V cho INMP441: quá áp, mic chỉ chịu tối đa ~3.6V.', 'Để L/R thả nổi: lúc đọc được, lúc không.', 'Dây I2S dài (> 20cm) và lỏng: nhiễu, rè.'],
    robot: ['Xiaozhi nghe lệnh qua đúng mic này. Trên robot hút bụi, mic dùng để nhận lệnh giọng nói qua server.'],
  });
})();
