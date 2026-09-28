// Bài 10.1 — ADC đọc biến trở. Biến trở kiểu B cấp 3V3: A 10d ← thanh +, B 14d → thanh −, W 12d → GPIO1.
(function () {
  const BT = { id: 'bt', loai: 'bientro', A: '10d', W: '12d', B: '14d' };
  const DA = K.day('dA', 'T+:10', '10a', 'do'), DB = [K.day('dB1', '14e', '14f', 'den'), K.day('dB2', '14j', 'B-:14', 'den')];
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3', G1: '12b' });
  BAI.dangKy({
    id: '10.1',
    muc_tieu: 'ADC biến áp thành số. Đọc con trượt biến trở bằng GPIO1, so số chip đọc được với đồng hồ đo cùng điểm.',
    can: [...K.coBanEsp(4), K.can.bientro()],
    kien_thuc: `<p>ADC 12 bit: 0 → 4095. Code dùng suy hao 12dB; datasheet ESP32-S3 v2.2 (bảng 5-6) ghi dải đo đúng của mức này là <b>0 → 2900mV</b>, sai số ±50mV sau hiệu chuẩn. Trên ~2.9–3.1V số đứng ở 4095 dù áp còn tăng.</p>
      <p>Biến trở cấp bằng <b>3V3</b>, không phải 5V: áp con trượt không bao giờ vượt 3.3V &lt; 3.6V chịu tối đa. Nối kiểu B (bài 2.3): A → 3V3, B → GND, W chỉ vào GPIO.</p>
      <p>Code in 3 số: số thô, mV đã hiệu chuẩn (<code>adc_cali_raw_to_voltage</code>), và mV tính thẳng <code>thô × 3300/4095</code> — để thấy vì sao phải hiệu chuẩn.</p>`,
    code: 'sandbox/esp32-bai/main/bai_10_1.c',
    du_doan: '<p>Vặn từ B sang A: thô 0 → 4095, mV hiệu chuẩn bám đồng hồ trong ±50mV tới ~2.9V, rồi đứng. Cột "tính thẳng" lệch nhiều hơn.</p>',
    phan: [{
      ten: 'Phần 1 · Ráp, đo, đọc',
      buoc: [
        { ten: 'Biến trở kiểu B', lam: ['USB rút. Biến trở A 10d, W 12d, B 14d. Dây đỏ thanh + → 10a. B xuống −: dây đen 14e → 14f, 14j → thanh −. <b>Cột 12 (W) không nối thanh nguồn.</b>'], board: { them: [BT, DA, ...DB] } },
        { ten: 'Dây từ board', lam: ['<code>3V3</code> → thanh + (cột 3). <code>GND</code> → thanh − dưới. <code>1</code> → <b>12b</b> (cột W).'], board: { them: [ESP] } },
        K.buocOmEsp('≈ 10k song song với mốc 8.1, và <b>vặn không đổi</b>.', 'Gần 0 hoặc vặn mà đổi: W đang nối vào 3V3/GND.', ['Vặn biến trở qua lại trong lúc đo.']),
        K.camUsb('Cắm USB, nạp 10.1, vặn', ['<code>idf.py menuconfig</code> → 10.1, <code>flash monitor</code>. Vặn chậm từ đầu này sang đầu kia.'], {}, { thay: 'Số thô chạy 0 → 4095.', neu_khong: 'Đứng yên: dây GPIO1 sai cột, hoặc đếm sai chân (GPIO1 thường ở gần góc board, đọc chữ in).' }),
        { ten: 'So với đồng hồ ở 5 vị trí', lam: ['<code>DCV 20</code>: que đỏ 12c (W), que đen thanh −. Ở 5 vị trí (0.5 / 1 / 1.5 / 2.5 / 3.2V), ghi số đồng hồ và 3 số trên monitor.'], board: { them: [K.dh('DCV 20', 'bt.W', 'B-:16', '≈ 1.50')] }, kiem: { thay: 'mV hiệu chuẩn lệch đồng hồ ≤ ~50mV dưới 2.9V; ở 3.2V thô = 4095.', neu_khong: '' } },
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'ADC vs đồng hồ', cot: ['Đồng hồ (V)', 'Thô', 'mV hiệu chuẩn', 'mV tính thẳng'], hang: ['0.5', '1.0', '1.5', '2.5', '3.2'].map(v => ({ ten: `≈ ${v} V`, du_doan: [v, '', `≈ ${Math.min(+v * 1000, 2900)}`, ''] })) }],
    bay: ['Cấp biến trở bằng 5V: vặn lên là GPIO nhận 5V.', 'Nối W vào thanh nguồn (kiểu A): vặn về đầu là nối tắt 3V3 (bài 2.3).', 'Dùng chân ADC2 (GPIO11–20) khi bật WiFi: đọc lỗi/timeout.'],
    robot: ['Núm chỉnh tốc độ, joystick (2 biến trở), cảm biến góc: đều là bài này.'],
  });
})();
