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
