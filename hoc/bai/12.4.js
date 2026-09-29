// Bài 12.4 — Logic analyzer trên bus I2C của 12.1: GND máy → cột GND, CH0 → SCL, CH1 → SDA.
(function () {
  const OLED = { id: 'oled', loai: 'mod', ten: 'OLED', mau: 'xanhduong', chan: [['GND', '10a'], ['VCC', '11a'], ['SCL', '12a'], ['SDA', '13a']] };
  const ESP = K.esp({ GND: '10c', '3V3': '11c', G42: '12c', G41: '13c' });
  const LA = { id: 'la', loai: 'ngoai', kieu: 'hop', chu: 'logic analyzer', x: 470, chan: { GND: '10e', CH0: '12e', CH1: '13e' }, mau: ['den', 'vang', 'xanh'] };
  BAI.dangKy({
    id: '12.4',
    muc_tieu: 'Nhìn tận mắt từng bit trên dây I2C: địa chỉ, bit ghi/đọc và ACK. Đây cũng chính là những gì lệnh "i2c scan" làm.',
    can: [...K.coBanEsp(4), { ten: 'OLED (mạch 12.1)', tim: 'OLED', lk: 'oled', sl: 1 }, { ten: 'Logic analyzer 8 kênh 24MHz', tim: 'logic analyzer', lk: 'logic-analyzer', sl: 1 }],
    kien_thuc: `<p>Logic analyzer đọc mức 0/1 hàng triệu lần mỗi giây rồi gửi lên máy tính. Phần mềm dùng ở đây là PulseView (thuộc bộ sigrok) trên Mac. PulseView có bộ giải mã I2C: chọn SCL = CH0, SDA = CH1 là nó in ra địa chỉ và từng byte.</p>
      <p>Sau khi vẽ xong, code 12.1 gửi 1 gói thăm dò tới OLED mỗi 50ms, nên rất dễ bắt.</p>
      <p><b>Nối GND của máy trước</b>, rồi mới kẹp các kênh. Máy chỉ đọc được 0–5V, nên không kẹp vào nguồn motor hay bất cứ chỗ nào cao hơn 5V.</p>
      <p>Bus I2C 400kHz cần lấy mẫu tối thiểu gấp 4 lần tốc độ bus, tức 1.6MHz. Nên chọn từ 4MHz trở lên, 8–12MHz là thoải mái.</p>`,
    code: 'sandbox/esp32-bai/main/bai_12_1.c',
    du_doan: '<p>Mỗi gói gồm: START, 7 bit địa chỉ 0x3C, bit W (0), ACK (OLED kéo SDA xuống 0 ở xung thứ 9), rồi STOP.</p>',
    so_do: [{ nhan: 'Kẹp logic analyzer', svg: SD.svg(340, 230, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['GND', 'GPIO41 SDA', 'GPIO42 SCL']) + SD.khoi(260, 40, 60, 'OLED', ['GND', 'SDA', 'SCL'])
      + SD.day('122,60 248,60') + SD.day('122,80 248,80') + SD.day('122,100 248,100')
      + SD.cham(160, 60) + SD.cham(185, 80) + SD.cham(210, 100) + SD.day('160,60 160,160') + SD.day('185,80 185,160') + SD.day('210,100 210,160')
      + SD.hop(130, 160, 120, 40, 'logic analyzer') + SD.chu(160, 214, 'GND', 'sd-mo', 'middle') + SD.chu(185, 214, 'CH1', 'sd-mo', 'middle') + SD.chu(210, 214, 'CH0', 'sd-mo', 'middle'),
      'Logic analyzer kẹp vào GND, SDA (CH1) và SCL (CH0) của bus I2C'), chu: 'Nối GND trước, rồi mới kẹp kênh. SCL = CH0, SDA = CH1.' }],
    sau: `<h3>Một gói I2C bằng số</h3>
      <p>Một gói đi theo thứ tự: START (SDA xuống trong khi SCL đang cao), 7 bit địa chỉ, 1 bit R/W, ACK (thiết bị kéo SDA xuống ở nhịp thứ 9), các byte dữ liệu (mỗi byte cũng 8 bit + ACK), cuối cùng là STOP (SDA lên khi SCL đang cao). Ở 400kHz mỗi nhịp mất 2.5µs, nên phần địa chỉ + ACK tốn 9 × 2.5 = 22.5µs.</p>
      <h3>Lấy mẫu nhanh bao nhiêu là đủ</h3>
      <p>Logic analyzer chỉ ghi 0 hoặc 1 ở mỗi lần lấy mẫu. Muốn giải mã tin cậy thì mỗi nửa nhịp phải có vài mẫu: tối thiểu ~4 lần tần số bus (1.6MHz cho 400kHz), khuyên 10 lần. Máy 24MHz thừa sức cho I2C, đủ cho I2S 1MHz, nhưng không đủ cho SPI 40MHz.</p>
      <h3>"i2c scan" thật ra làm gì</h3>
      <p>Nó gửi START + địa chỉ + W lần lượt cho từng địa chỉ 0x08–0x77, rồi nhìn bit thứ 9. Nếu có ai kéo SDA xuống (ACK) thì ở địa chỉ đó có thiết bị. Nếu không ai trả lời, SDA vẫn ở mức cao nhờ điện trở kéo lên (NACK). Trên PulseView bạn thấy đúng nhịp thứ 9 đó.</p>`,
    hoi: [
      ['Bus 100kHz. Cần lấy mẫu tối thiểu bao nhiêu?', '~<b>400kHz</b> (gấp 4 lần). Chọn 1MHz cho chắc.'],
      ['Nhịp thứ 9 SDA ở mức cao. Nghĩa là gì?', '<b>NACK</b>: không thiết bị nào nhận địa chỉ đó, hoặc thiết bị từ chối byte vừa gửi.'],
      ['Vì sao phải nối GND analyzer trước?', 'Mỗi kênh đo áp so với GND của máy. Chưa có GND chung thì kênh bị "lơ lửng", và dòng điện có thể tìm đường đi qua chân kênh.'],
    ],
    phan: [{
      ten: 'Phần 1 · Bắt 1 gói I2C', cot: 34,
      buoc: [
        { ten: 'Mạch 12.1', lam: ['Giữ nguyên mạch bài 12.1 (đã chạy được).'], board: { them: [OLED, ESP] } },
        { ten: 'Kẹp logic analyzer: GND trước', lam: ['USB board rút. Dây GND của máy → cột GND (10e). Rồi CH0 → cột SCL (12e), CH1 → cột SDA (13e).', 'Cắm máy vào Mac. Cài PulseView bản macOS ở trang Downloads của sigrok.org (Homebrew không có PulseView, chỉ có <code>sigrok-cli</code> chạy dòng lệnh). Mở PulseView, chọn thiết bị fx2lafw.'], board: { them: [LA] } },
        { ten: 'Đo trước khi cắm USB board', kiem_truoc: true, lam: ['<code>Ω 200k</code>: cột VCC (11d) với cột GND (10d).'], board: { them: [K.dh('Ω 200k', '11d', '10d', '> 0.1')] }, kiem: { thay: 'Không dưới ~100Ω.', neu_khong: 'Gần 0: không cắm USB.' } },
        K.camUsb('Cắm USB board (code 12.1), bắt mẫu', ['PulseView: 8MHz, 1M mẫu, bấm Run. Thêm bộ giải mã I2C (SCL = D0, SDA = D1).'], {}, { thay: 'Thấy chữ "Address write: 3C" và "ACK".', neu_khong: 'Chỉ thấy mức 1 phẳng: kênh kẹp chưa đúng cột, hoặc chưa nối GND của máy.' }),
        K.rutUsb(['Tháo kẹp: kênh trước, GND sau.']),
      ],
    }],
    bang_do: [{ ten: 'Gói bắt được', cot: ['Địa chỉ', 'R/W', 'ACK/NACK', 'Tần số SCL'], hang: [{ ten: 'Đo', du_doan: ['0x3C', 'W', 'ACK', '≈ 400 kHz'] }] }],
    bay: ['Kẹp kênh trước khi nối GND của máy.', 'Lấy mẫu chậm hơn 4 lần tốc độ bus: giải mã ra toàn rác.', 'Kẹp vào chỗ có áp trên 5V: hỏng máy.'],
    robot: ['Khi bus không chạy mà chưa biết lỗi ở dây hay ở code, logic analyzer cho câu trả lời trong 1 phút. Máy này cũng dùng được cho I2S (mic, ampli) và PWM.'],
  });
})();
