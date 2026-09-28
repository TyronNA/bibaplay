// Bài 12.4 — Logic analyzer trên bus I2C của 12.1: GND máy → cột GND, CH0 → SCL, CH1 → SDA.
(function () {
  const OLED = { id: 'oled', loai: 'mod', ten: 'OLED', mau: 'xanhduong', chan: [['GND', '10a'], ['VCC', '11a'], ['SCL', '12a'], ['SDA', '13a']] };
  const ESP = K.esp({ GND: '10c', '3V3': '11c', G42: '12c', G41: '13c' });
  const LA = { id: 'la', loai: 'ngoai', kieu: 'hop', chu: 'logic analyzer', x: 470, chan: { GND: '10e', CH0: '12e', CH1: '13e' }, mau: ['den', 'vang', 'xanh'] };
  BAI.dangKy({
    id: '12.4',
    muc_tieu: 'Nhìn tận mắt từng bit trên dây I2C: địa chỉ, bit ghi/đọc, ACK — đúng thứ "i2c scan" làm.',
    can: [...K.coBanEsp(4), { ten: 'OLED (mạch 12.1)', tim: 'OLED', lk: 'oled', sl: 1 }, { ten: 'Logic analyzer 8 kênh 24MHz', tim: 'logic analyzer', lk: 'logic-analyzer', sl: 1 }],
    kien_thuc: `<p>Logic analyzer lấy mẫu 0/1 hàng triệu lần/giây và gửi lên máy. Phần mềm: PulseView (sigrok) trên Mac. Có bộ giải mã I2C: chọn SCL = CH0, SDA = CH1, nó in ra địa chỉ và byte.</p>
      <p>Code 12.1 gửi 1 gói thăm dò tới OLED mỗi 50ms sau khi vẽ: dễ bắt.</p>
      <p><b>Nối GND của máy trước</b>, rồi mới kẹp kênh. Máy chỉ đọc 0–5V: không kẹp vào nguồn motor hay gì cao hơn 5V.</p>
      <p>Tốc độ I2C 400kHz → lấy mẫu ≥ 4MHz (khuyên 8–12MHz).</p>`,
    code: 'sandbox/esp32-bai/main/bai_12_1.c',
    du_doan: '<p>Mỗi gói: START, 7 bit địa chỉ 0x3C, bit W (0), ACK (SDA bị OLED kéo xuống 0 ở xung thứ 9), rồi STOP.</p>',
    phan: [{
      ten: 'Phần 1 · Bắt 1 gói I2C', cot: 34,
      buoc: [
        { ten: 'Mạch 12.1', lam: ['Như 12.1 (đã chạy được).'], board: { them: [OLED, ESP] } },
        { ten: 'Kẹp logic analyzer: GND trước', lam: ['USB board rút. Dây GND của máy → cột GND (10e). Rồi CH0 → cột SCL (12e), CH1 → cột SDA (13e).', 'Cắm máy vào Mac. Cài PulseView bản macOS ở trang Downloads của sigrok.org (Homebrew không có PulseView; chỉ có <code>sigrok-cli</code> dòng lệnh). Mở, chọn thiết bị fx2lafw.'], board: { them: [LA] } },
        { ten: 'Đo trước khi cắm USB board', kiem_truoc: true, lam: ['<code>Ω 200k</code>: cột VCC (11d) với cột GND (10d).'], board: { them: [K.dh('Ω 200k', '11d', '10d', '> 0.1')] }, kiem: { thay: 'Không dưới ~100Ω.', neu_khong: 'Gần 0: không cắm USB.' } },
        K.camUsb('Cắm USB board (code 12.1), bắt mẫu', ['PulseView: 8MHz, 1M mẫu, bấm Run. Thêm bộ giải mã I2C (SCL = D0, SDA = D1).'], {}, { thay: 'Thấy chữ "Address write: 3C" và "ACK".', neu_khong: 'Toàn mức 1 phẳng: kênh chưa kẹp đúng cột, hoặc GND máy chưa nối.' }),
        K.rutUsb(['Tháo kẹp: kênh trước, GND sau.']),
      ],
    }],
    bang_do: [{ ten: 'Gói bắt được', cot: ['Địa chỉ', 'R/W', 'ACK/NACK', 'Tần số SCL'], hang: [{ ten: 'Đo', du_doan: ['0x3C', 'W', 'ACK', '≈ 400 kHz'] }] }],
    bay: ['Kẹp kênh trước khi nối GND máy.', 'Lấy mẫu chậm hơn 4× tốc độ bus: giải mã ra rác.', 'Kẹp vào áp > 5V: hỏng máy.'],
    robot: ['Bus không chạy mà không biết lỗi ở dây hay code: logic analyzer trả lời trong 1 phút. Cũng dùng được cho I2S (mic/ampli) và PWM.'],
  });
})();
