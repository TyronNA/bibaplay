// Bài 13.2 — Cầu H + PWM: mạch 13.1, code PWM trên IN1 hoặc IN2.
(function () {
  const DRV = { id: 'drv', loai: 'mod', ten: 'driver motor', mau: 'do', chan: [['VM', '10a'], ['GND', '11a'], ['IN1', '12a'], ['IN2', '13a'], ['OUT1', '14a'], ['OUT2', '15a']] };
  const D = [K.day('vm', 'T+:8', '10c', 'do', 4), K.day('g1', '11e', '11f', 'den'), K.day('g2', '11j', 'B-:11', 'den')];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 470, chan: { 1: '14c', 2: '15c' }, mau: ['cam', 'tim'], nhan: 'motor' };
  const ESP = K.esp({ GND: 'B-:20', G9: '12c', G10: '13c' }, { x: 250 });
  BAI.dangKy({
    id: '13.2',
    muc_tieu: 'Kết hợp chiều (chân nào có xung) và tốc độ (duty): 2 chiều × 3 tốc độ — đúng thứ bánh xe robot cần.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(3), K.can.pin(), K.can.motor(), { ten: 'Module driver motor 2 kênh', tim: 'driver motor', lk: 'driver-motor', sl: 1 }],
    kien_thuc: `<p>Chiều A: PWM ở IN1, IN2 = 0. Chiều B: ngược lại. Duty quyết định tốc độ trung bình (bài 11.3).</p>
      <p>Đổi chiều luôn qua <b>dừng</b> (code nghỉ 1s): đảo chiều khi motor đang quay nhanh là cú dòng lớn nhất có thể (EMF ngược cộng với nguồn, bài 7.3).</p>
      <p>Duty thấp (40%) motor có thể không đủ lực khởi động từ đứng yên: robot thật thường "đá" 100% trong vài chục ms rồi mới hạ.</p>`,
    code: 'sandbox/esp32-bai/main/bai_13_2.c',
    du_doan: '<p>Chiều A: chậm → vừa → nhanh, dừng 1s; chiều B tương tự.</p>',
    so_do: [{ nhan: 'Chiều + tốc độ', svg: SD.svg(360, 190, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['GPIO9 PWM', 'GPIO10', 'GND']) + SD.khoi(210, 40, 80, 'DRV8833', ['IN1', 'IN2', 'GND'], ['OUT1', 'OUT2'])
      + SD.day('122,60 198,60') + SD.day('122,80 198,80') + SD.day('122,100 198,100') + SD.day('302,60 330,60 330,72') + SD.motor(330, 88) + SD.day('302,80 318,80 318,110 330,110 330,104')
      + SD.chu(210, 150, 'VM ← hộp pin, SLP → 3V3', 'sd-mo'),
      'GPIO9 PWM vào IN1, GPIO10 vào IN2 của DRV8833, OUT1 OUT2 ra motor'), chu: 'Chiều A: PWM ở IN1, IN2 = 0. Chiều B: đổi vai 2 chân.' }],
    sau: `<h3>Hai cách băm PWM</h3>
      <p>Theo bảng DRV8833: <b>IN1 = PWM, IN2 = 0</b> → lúc xung thấp là thả trôi (dòng tắt nhanh qua diode, "fast decay"). <b>IN1 = 1, IN2 = PWM đảo</b> → lúc xung là phanh (dòng chạy vòng qua 2 công tắc dưới, "slow decay"). Slow decay cho tốc độ gần tuyến tính theo duty hơn và mô-men tốt hơn ở tốc độ thấp; fast decay đơn giản, là cách code bài này dùng.</p>
      <h3>"Đá" khởi động</h3>
      <p>Ma sát tĩnh lớn hơn ma sát động: cần một cú dòng để bắt đầu quay, rồi duty thấp vẫn giữ được. Code robot thường cho 100% trong 30–50ms rồi hạ về duty đích. Đây là một dạng điều khiển vòng hở — bài 15.4 làm bằng vòng kín.</p>`,
    hoi: [
      ['Muốn quay chiều B tốc độ 60% (fast decay). Đặt IN1, IN2 thế nào?', 'IN1 = <b>0</b>, IN2 = <b>PWM 60%</b>.'],
      ['Vì sao code nghỉ 1s trước khi đảo chiều?', 'Để motor dừng hẳn (hết áp ngược) trước khi cấp chiều mới, tránh cú dòng lớn nhất.'],
      ['Duty 40% motor đứng rung, 100% thì chạy. Cách chữa trong code?', 'Cho 100% trong vài chục ms để khởi động, rồi hạ về 40%.'],
    ],
    phan: [{
      ten: 'Phần 1 · Mạch 13.1, code PWM', cot: 34,
      buoc: [
        K.buocPin(),
        { ten: 'Mạch 13.1', lam: ['Như bài 13.1 (đã chạy được).'], board: { them: [DRV, ...D, M, ESP] } },
        K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω.', 'Gần 0: VM chạm GND.'),
        K.camUsb('Cắm USB trước, nạp 13.2', ['<code>idf.py menuconfig</code> → 13.2, <code>flash monitor</code>.'], {}, { thay: 'Monitor in chiều + duty.', neu_khong: '' }),
        K.lapPin('Rồi lắp pin', ['Nhìn motor, chạm nhanh vào driver sau 1 phút.'], {}, { thay: '2 chiều × 3 tốc độ.', neu_khong: 'Driver nóng: tháo pin.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Tốc độ', cot: ['Chiều A', 'Chiều B'], hang: [{ ten: '40%', du_doan: ['chậm / đứng', 'chậm / đứng'] }, { ten: '70%', du_doan: ['vừa', 'vừa'] }, { ten: '100%', du_doan: ['nhanh', 'nhanh'] }] }],
    bay: ['Đảo chiều tức thì ở tốc độ cao: cú dòng lớn, sụt áp, có thể reset board (13.3).'],
    robot: ['Điều khiển robot = 2 kênh như thế này + cảm biến; bước sau là tool MCP để xiaozhi ra lệnh.'],
  });
})();
