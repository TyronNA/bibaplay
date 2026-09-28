// Bài 12.3 — Ampli MAX98357A. Module cắm LRC 10a, BCLK 11a, DIN 12a, GAIN 13a, SD 14a, GND 15a, VIN 16a (thứ tự kiểu Adafruit — đọc chữ in).
// Loa nối vào cầu đấu "+ −" trên module, không qua breadboard.
(function () {
  const AMP = { id: 'amp', loai: 'mod', ten: 'MAX98357A', mau: 'tim', chan: [['LRC', '10a'], ['BCLK', '11a'], ['DIN', '12a'], ['GAIN', '13a'], ['SD', '14a'], ['GND', '15a'], ['VIN', '16a']] };
  const ESP = K.esp({ G16: '10c', G15: '11c', G7: '12c', GND: '15c', '5V': '16c' });
  const NHAN = { id: 'nl', loai: 'nhan', o: 'B-:12', dx: -20, dy: 40, chu: 'loa → cầu đấu + − trên module' };
  BAI.dangKy({
    id: '12.3',
    muc_tieu: 'Phát âm thanh: chip gửi mẫu số qua I2S, ampli MAX98357A tự đổi ra tín hiệu cho loa. Phát tone 440Hz nhỏ.',
    can: [...K.coBanEsp(5), { ten: 'Ampli I2S MAX98357A', tim: 'MAX98357A', lk: 'max98357a', sl: 1 }, { ten: 'Loa điện thoại (đã hàn 2 dây)', tim: 'Loa ngoài', lk: 'loa', sl: 1 }],
    kien_thuc: `<p>MAX98357A nhận I2S (BCLK, LRC, DIN), bên trong có DAC + ampli class D ra thẳng loa. <b>VIN = 5V</b> (chân 5V của board): công suất loa lấy từ đây. GAIN, SD bỏ trống: mặc định gain 9dB, bật, trộn trái+phải.</p>
      <p>Ngõ ra loa là cầu (BTL): <b>2 đầu loa chỉ nối vào 2 cực ra của module</b>, không đầu nào nối GND hay nối vào breadboard.</p>
      <p>Loa điện thoại chịu công suất nhỏ (chưa kiểm, ~0.5–1W). Code phát biên độ ~9%; nghe rè/méo thì giảm <code>BIEN_DO</code>.</p>
      <p>Chân DIN=7, BCLK=15, LRC=16 theo <code>bread-compact-wifi/config.h</code>.</p>`,
    code: 'sandbox/esp32-bai/main/bai_12_3.c',
    du_doan: '<p>Tiếng "tuuu" 440Hz (nốt La) 2 giây, nghỉ 2 giây, lặp lại.</p>',
    so_do: [{ nhan: 'Ampli I2S + loa', svg: SD.svg(380, 190, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['5V', 'GND', 'GPIO7 DIN', 'GPIO15 BCLK', 'GPIO16 LRC']) + SD.khoi(230, 40, 80, 'MAX98357A', ['VIN', 'GND', 'DIN', 'BCLK', 'LRC'], ['+', '−'])
      + SD.day('122,60 218,60') + SD.day('122,80 218,80') + SD.day('122,100 218,100') + SD.day('122,120 218,120') + SD.day('122,140 218,140')
      + SD.day('322,60 340,60 340,70') + SD.day('322,80 334,80 334,90 340,90') + SD.loa(346, 80),
      'ESP32 nối MAX98357A: 5V, GND, DIN 7, BCLK 15, LRC 16; loa nối thẳng 2 cực ra của ampli'), chu: '2 đầu loa chỉ nối vào + và − của ampli, không đầu nào xuống GND.' }],
    sau: `<h3>Ngõ ra cầu (BTL)</h3>
      <p>Ampli có 2 ngõ ra, mỗi ngõ dao động quanh VIN/2 và ngược pha nhau. Loa nối giữa 2 ngõ nên thấy biên độ gấp đôi mỗi ngõ, công suất gấp 4 — không cần tụ chặn một chiều. Hệ quả: <b>không đầu loa nào là GND</b>. Nối một đầu xuống GND là chập một ngõ ra.</p>
      <h3>Class D và công suất</h3>
      <p>Class D bật/tắt ngõ ra ở vài trăm kHz và điều độ rộng xung theo âm thanh (một kiểu PWM, chương 11); cuộn dây loa lọc lấy trung bình. Hiệu suất ~90% thay vì ~50% của ampli thường. Datasheet MAX98357A: cỡ 3W vào loa 4Ω ở VIN 5V. Loa điện thoại chịu ít hơn nhiều.</p>
      <h3>Biên độ 9% là bao nhiêu công suất</h3>
      <p>Công suất theo bình phương biên độ: <code>0.09² ≈ 0.8%</code> công suất tối đa, tức cỡ vài chục mW — an toàn cho loa nhỏ. Tính theo dB: 20·log₁₀(0.09) ≈ −21 dBFS. Tăng biên độ gấp đôi (+6dB) là công suất gấp 4.</p>`,
    hoi: [
      ['Vì sao nối 1 đầu loa xuống GND là sai với MAX98357A?', 'Ngõ ra là cầu: cả 2 cực đều có áp dao động quanh VIN/2. Nối xuống GND là chập một ngõ ra.'],
      ['Tăng BIEN_DO từ 9% lên 27%. Công suất tăng mấy lần?', '(27/9)² = <b>9 lần</b>.'],
      ['Vì sao VIN lấy từ 5V mà không từ 3V3?', 'Công suất loa lấy từ VIN; 3V3 là ổn áp nhỏ nuôi chip, âm to sẽ kéo sụt nguồn chip.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, phát tone',
      buoc: [
        { ten: 'Cắm ampli, đọc chữ in, nối loa', kiem_truoc: true, lam: ['USB rút. Cắm 7 chân vào 10a–16a. Ghi tên chân theo chữ in.', 'Loa: 2 dây vào cầu đấu vít (hoặc 2 lỗ) ghi <code>+</code> <code>−</code> trên module. Vặn chặt, 2 dây không chạm nhau.'], board: { them: [AMP, NHAN] }, kiem: { thay: 'Biết chắc cột VIN, GND, DIN, BCLK, LRC.', neu_khong: 'Chưa đi tiếp.' } },
        { ten: 'Dây từ board theo tên chân', lam: ['<code>5V</code> → cột VIN. <code>GND</code> → cột GND. <code>7</code> → DIN, <code>15</code> → BCLK, <code>16</code> → LRC. GAIN, SD không nối.'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>: que đỏ cột VIN (16d), que đen cột GND (15d). Rồi que đỏ 1 cực loa, que đen cột GND: phải lớn (loa không chạm GND).'], board: { them: [K.dh('Ω 200k', '16d', '15d', '> 0.1')] },
          kiem: { thay: 'VIN–GND không dưới ~100Ω. Loa–GND: không gần 0.', neu_khong: 'Gần 0: nối tắt 5V hoặc loa chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 12.3', ['<code>idf.py menuconfig</code> → 12.3, <code>flash monitor</code>. Sau 1 phút sờ module.'], {}, { thay: 'Nghe tone 2s/2s. Module ấm nhẹ tối đa.', neu_khong: 'Im lặng: kiểm DIN/BCLK/LRC. Rè to: giảm BIEN_DO. Module nóng: rút USB.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Loa', cot: ['Nghe'], hang: [{ ten: 'BIEN_DO 3000', du_doan: ['rõ, không rè'] }] }],
    bay: ['Nối 1 đầu loa xuống GND: ngõ ra cầu bị chập, ampli nóng hoặc tự ngắt.', 'Biên độ lớn với loa nhỏ: rè, cháy cuộn loa.', 'Lấy VIN từ 3V3: yếu, và kéo sụt nguồn chip khi âm lớn.'],
    robot: ['Xiaozhi nói qua đúng ampli này. Âm lớn kéo dòng 5V thành cú: tụ 100µF sát VIN giúp đỡ rè/reset.'],
  });
})();
