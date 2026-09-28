// Bài 12.2 — Mic INMP441 qua I2S. Module cắm VDD 10a, GND 11a, SD 12a, SCK 13a, WS 14a, L/R 15a (thứ tự giả định — đọc chữ in).
(function () {
  const MIC = { id: 'mic', loai: 'mod', ten: 'INMP441', mau: 'xanhduong', chan: [['VDD', '10a'], ['GND', '11a'], ['SD', '12a'], ['SCK', '13a'], ['WS', '14a'], ['LR', '15a', 'L/R']] };
  const ESP = K.esp({ '3V3': '10c', GND: '11c', G6: '12c', G5: '13c', G4: '14c' });
  const LR = K.day('lr', '15c', '11d', 'den', 6);
  BAI.dangKy({
    id: '12.2',
    muc_tieu: 'Bus I2S cho âm thanh: đọc mic số INMP441 và in mức âm ra màn hình. Đây là mic của xiaozhi.',
    can: [...K.coBanEsp(5), { ten: 'Mic I2S INMP441', tim: 'INMP441', lk: 'inmp441', sl: 1 }],
    kien_thuc: `<p>I2S: <b>SCK</b> (clock bit) nháy mỗi bit, <b>WS</b> báo đang gửi kênh trái hay phải, <b>SD</b> là dữ liệu từ mic. Mic gửi mẫu 24 bit trong khung 32 bit, 16 000 mẫu/giây.</p>
      <p><b>L/R nối GND</b> → mic gửi ở kênh trái (code đọc kênh trái). Để L/R thả nổi: có lúc ra, có lúc không.</p>
      <p><b>VDD = 3V3</b>, không phải 5V. Chân WS=4, SCK=5, SD=6 theo <code>bread-compact-wifi/config.h</code>.</p>
      <p>INMP441 có loại header 1 hàng 6 chân, có loại 2 hàng 3 chân. Hình vẽ 1 hàng; loại 2 hàng thì cắm vắt qua rãnh giữa (mỗi chân một cột), rồi nối dây theo <b>chữ in</b>.</p>`,
    code: 'sandbox/esp32-bai/main/bai_12_2.c',
    du_doan: '<p>Phòng yên: khoảng −70 tới −60 dBFS. Nói gần mic: lên −30 tới −20. Vỗ tay: gần −10.</p>',
    so_do: [{ nhan: 'Mic I2S', svg: SD.svg(340, 210, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['3V3', 'GND', 'GPIO4 WS', 'GPIO5 SCK', 'GPIO6 SD']) + SD.khoi(230, 40, 80, 'INMP441', ['VDD', 'GND', 'WS', 'SCK', 'SD', 'L/R'])
      + SD.day('122,60 218,60') + SD.day('122,80 218,80') + SD.day('122,100 218,100') + SD.day('122,120 218,120') + SD.day('122,140 218,140')
      + SD.day('218,160 200,160 200,166') + SD.dat(200, 166),
      'ESP32 nối INMP441: 3V3, GND, WS 4, SCK 5, SD 6; L/R xuống GND'), chu: 'L/R nối GND: mic gửi ở kênh trái. VDD là 3V3.' }],
    sau: `<h3>Tần số lấy mẫu và clock</h3>
      <p>16 000 mẫu/giây → âm thanh tới <b>8kHz</b> (định lý lấy mẫu: phải lấy mẫu nhanh gấp đôi tần số cao nhất). Giọng nói nằm chủ yếu dưới 4kHz nên đủ. Clock bit SCK = 16 000 × 32 bit × 2 kênh = <b>1.024MHz</b> — dây lỏng hay dài vài chục cm là bắt đầu có lỗi bit (tiếng lách tách).</p>
      <h3>dBFS nghĩa là gì</h3>
      <p><code>dBFS = 20·log₁₀(biên độ / biên độ tối đa)</code>. 0 dBFS là mức to nhất số hoá được; −20 dBFS là 1/10 biên độ đó; −60 dBFS là 1/1000. Datasheet INMP441: âm 94dB SPL (rất to, như máy cắt cỏ sát tai) ra −26 dBFS; mỗi 20dB âm nhỏ hơn thì số giảm 20 dBFS. Phòng yên ~40dB SPL → cỡ −80 dBFS (lẫn trong nhiễu của mic, SNR 61dB).</p>
      <h3>24 bit để làm gì</h3>
      <p>Mỗi bit thêm ~6dB dải động: 24 bit ≈ 144dB, nhiều hơn mic làm được. Code lấy 16 bit trên là đủ, và xiaozhi cũng chỉ gửi 16 bit.</p>`,
    hoi: [
      ['Muốn thu tới 12kHz thì tần số lấy mẫu tối thiểu?', '<b>24kHz</b> (gấp đôi); thực tế chọn 32kHz cho dư.'],
      ['Mức âm đo được −40 dBFS. Biên độ bằng mấy phần của tối đa?', '10^(−40/20) = <b>1/100</b>.'],
      ['Để L/R thả nổi thì sao?', 'Mic không biết gửi ở kênh nào; có lúc code đọc được, có lúc chỉ ra 0.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, đọc mức âm',
      buoc: [
        { ten: 'Cắm mic, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm mic vào 10a–15a (mỗi chân một cột). Ghi tên chân theo chữ in: cột 10 = ?, … cột 15 = ?'], board: { them: [MIC] }, kiem: { thay: 'Biết chắc VDD, GND, SD, SCK, WS, L/R ở cột nào.', neu_khong: 'Chưa đi tiếp.' } },
        { ten: 'Dây từ board theo tên chân', lam: ['<code>3V3</code> → cột VDD. <code>GND</code> → cột GND. <code>6</code> → SD, <code>5</code> → SCK, <code>4</code> → WS. Dây đen từ cột L/R (15c) sang cột GND (11d).'], board: { them: [ESP, LR] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>: que đỏ cột VDD, que đen cột GND.'], board: { them: [K.dh('Ω 200k', '10d', '11e', '> 0.1')] }, kiem: { thay: 'Không dưới ~100Ω.', neu_khong: 'Gần 0: VDD chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 12.2', ['<code>idf.py menuconfig</code> → 12.2, <code>flash monitor</code>. Im lặng 5 giây, rồi nói, rồi vỗ tay.'], {}, { thay: 'Thanh ### dài ra khi nói.', neu_khong: 'Số đứng ở −180 (toàn 0): SD sai chân hoặc L/R chưa nối GND. Số nhảy loạn không theo tiếng: SCK/WS đảo.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Mức âm (dBFS)', cot: ['dBFS'], hang: [{ ten: 'Im lặng', du_doan: ['−70 … −60'] }, { ten: 'Nói cách 20cm', du_doan: ['−35 … −25'] }, { ten: 'Vỗ tay', du_doan: ['> −15'] }] }],
    bay: ['Cấp 5V cho INMP441: quá áp (mic chịu tối đa ~3.6V).', 'Để L/R thả nổi.', 'Dây I2S dài (> 20cm) và lỏng: nhiễu, rè.'],
    robot: ['Xiaozhi nghe lệnh qua đúng mic này. Robot hút bụi: mic để nhận lệnh giọng nói qua server.'],
  });
})();
