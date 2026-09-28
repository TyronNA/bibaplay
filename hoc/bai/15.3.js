// Bài 15.3 — IMU GY-521. 8 chân 10a–17a: VCC GND SCL SDA XDA XCL AD0 INT (đọc chữ in).
// Khác OLED 12.1: GY-521 in VCC trước GND. 3V3 → 10c, GND → 11c, 42 → 12c, 41 → 13c.
(function () {
  const IMU = { id: 'imu', loai: 'mod', ten: 'GY-521', mau: 'xanhduong', chan: [['VCC', '10a'], ['GND', '11a'], ['SCL', '12a'], ['SDA', '13a'], ['XDA', '14a'], ['XCL', '15a'], ['AD0', '16a'], ['INT', '17a']] };
  const ESP = K.esp({ '3V3': '10c', GND: '11c', G42: '12c', G41: '13c' });
  BAI.dangKy({
    id: '15.3',
    muc_tieu: 'Robot muốn quay đúng 90° mà không có encoder đủ chính xác: dùng con quay hồi chuyển (gyro) trong IMU MPU-6050, đọc tốc độ quay rồi cộng dồn theo thời gian ra góc.',
    can: [...K.coBanEsp(4), K.can.gy521()],
    kien_thuc: `<p>MPU-6050 (InvenSense) có gyro 3 trục (đo <b>tốc độ quay</b>, °/s) và gia tốc kế 3 trục. Nói chuyện qua I2C như OLED ở 12.1: chung 2 dây SDA=41, SCL=42, khác địa chỉ — MPU-6050 là <code>0x68</code> (AD0 để hở, module kéo xuống), OLED là <code>0x3C</code>.</p>
      <p>Gyro chỉ cho <b>tốc độ</b> quay. Góc = cộng dồn: <code>góc += tốc độ × thời gian mỗi lần đọc</code>. Ở thang ±250°/s, datasheet: <b>131 đơn vị = 1°/s</b>. Đứng yên gyro vẫn ra một số nhỏ khác 0 (sai lệch) → code đo 2 giây lúc đứng yên rồi trừ đi. Phần sai còn lại vẫn cộng dồn → góc <b>trôi</b> chậm theo thời gian. Robot thật chỉ tin gyro trong vài giây mỗi lần quay.</p>
      <p>Chip bật nguồn lên là <b>đang ngủ</b> (thanh ghi 0x6B = 0x40 theo register map) → code ghi 0 để đánh thức. Thanh ghi 0x75 (WHO_AM_I) phải đọc ra 0x68: cách kiểm "đúng chip".</p>
      <p>Chip chạy 2.375–3.46V; module có ổn áp nên VCC nhận 3.3–5V, nhưng điện trở kéo lên SDA/SCL trên module nối vào nguồn của module → cấp <b>3V3</b> cho chắc.</p>`,
    code: 'sandbox/esp32-bai/main/bai_15_3.c',
    du_doan: '<p>Monitor in "WHO_AM_I = 0x68". Để yên: góc ≈ 0 và trôi chậm (vài độ/phút). Xoay cả breadboard 90° trên mặt bàn: góc ≈ ±90 (dấu tuỳ chiều).</p>',
    so_do: [{ nhan: '2 thiết bị trên một bus I2C', svg: SD.svg(360, 230, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['3V3', 'GND', 'GPIO41 SDA', 'GPIO42 SCL'])
      + SD.day('122,60 340,60') + SD.day('122,80 340,80') + SD.day('122,100 340,100') + SD.day('122,120 340,120')
      + [[165, 'OLED 0x3C'], [260, 'GY-521 0x68']].map(([x, t]) => [0, 1, 2, 3].map(i => SD.cham(x + 12 + i * 16, 60 + i * 20) + SD.day(`${x + 12 + i * 16},${60 + i * 20} ${x + 12 + i * 16},160`)).join('') + SD.hop(x, 160, 80, 40, t)).join('')
      + SD.chu(170, 216, 'VCC GND SDA SCL', 'sd-mo'),
      'OLED và GY-521 cùng mắc lên 4 dây 3V3, GND, SDA, SCL; khác địa chỉ'), chu: 'Cùng 2 dây SDA/SCL, khác địa chỉ: 0x3C và 0x68.' }],
    sau: `<h3>Góc trôi vì sao</h3>
      <p>Góc = tổng (tốc độ đo × Δt). Sau khi trừ sai lệch đo lúc đứng yên, vẫn còn phần sai lệch dư b (vd 0.05°/s do nhiệt độ đổi). Cộng dồn: sau 60s trôi <code>0.05 × 60 = 3°</code>. Thêm nhiễu ngẫu nhiên: nhiễu cộng dồn tăng theo <code>√t</code> (bước ngẫu nhiên). Gyro tốt cho câu hỏi "vừa quay bao nhiêu trong 1–2 giây", không tốt cho "đang hướng về đâu sau 10 phút".</p>
      <h3>Đổi đơn vị</h3>
      <p>Thang ±250°/s: 131 đơn vị = 1°/s (datasheet). Đọc được 1310 → 10°/s. Đọc mỗi 10ms: góc += 10 × 0.01 = 0.1° mỗi lần. Δt phải lấy từ đồng hồ thật (esp_timer), không lấy từ "định cho 10ms" vì vòng lặp có lúc chậm hơn.</p>
      <h3>Sửa trôi bằng cảm biến khác</h3>
      <p>Góc nghiêng (pitch/roll) sửa được bằng gia tốc kế: trọng lực cho biết đâu là "xuống" (bộ lọc bù: 98% gyro + 2% gia tốc kế). Góc hướng (yaw, thứ robot quay trên sàn) thì trọng lực không giúp: cần la bàn từ hoặc encoder 2 bánh (bài 15.2).</p>`,
    hoi: [
      ['Đọc được −655 trên trục Z ở thang ±250°/s. Tốc độ quay?', '−655/131 = <b>−5°/s</b>.'],
      ['Sai lệch dư 0.02°/s. Sau 5 phút trôi bao nhiêu?', '0.02 × 300 = <b>6°</b>.'],
      ['Vì sao OLED và MPU-6050 chung được 2 dây?', 'I2C chọn thiết bị bằng địa chỉ trong mỗi gói: 0x3C và 0x68 khác nhau nên không đụng nhau.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, đọc, xoay', cot: 24,
      buoc: [
        { ten: 'Cắm GY-521, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm 8 chân vào 10a–17a, chip nằm ngửa. Đọc chữ in: phải là VCC, GND, SCL, SDA, XDA, XCL, AD0, INT từ cột 10.'], board: { them: [IMU] },
          kiem: { thay: 'Cột 10 = VCC, 11 = GND, 12 = SCL, 13 = SDA.', neu_khong: 'Thứ tự khác: nối theo tên chân in trên module, không theo số cột trên hình.' } },
        { ten: '4 dây theo tên chân', lam: ['<code>3V3</code> → <b>10c</b> (VCC). <code>GND</code> → <b>11c</b>. <code>42</code> → <b>12c</b> (SCL). <code>41</code> → <b>13c</b> (SDA). AD0, INT, XDA, XCL để trống.'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 10d (VCC), que đen 11d (GND).'], board: { them: [K.dh('Ω 200k', '10d', '11d', '> 0.1')] },
          kiem: { thay: 'Không dưới ~100Ω.', neu_khong: 'Gần 0: VCC chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 15.3, để yên 2 giây', ['<code>idf.py menuconfig</code> → 15.3, <code>flash monitor</code>. <b>Không chạm board</b> trong 2 giây đầu (code đo sai lệch lúc đứng yên).'], {}, { thay: '"WHO_AM_I = 0x68", "sai lech = …", rồi "goc = 0.x" in đều.', neu_khong: '"khong thay 0x68": kiểm SCL/SDA có đảo không, VCC có 3.3V không. Đọc ra 0x72/0x70: chip là bản khác (MPU-6500/9250 clone) — địa chỉ và thanh ghi có thể khác, code bài này chưa chắc chạy.' }),
        { ten: 'Xoay 90° rồi để yên 1 phút', lam: ['Xoay cả breadboard 90° trên mặt bàn (dùng mép bàn làm thước góc vuông), giữ yên. Ghi góc. Xoay về chỗ cũ, ghi góc. Để yên 1 phút, ghi góc.'], board: { sua: { esp: { usb: true } } } },
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Góc in ra (°)', cot: ['Để yên', 'Xoay 90°', 'Xoay về', 'Sau 1 phút yên'], hang: [{ ten: 'Số đo', du_doan: ['≈ 0', '≈ ±90', '≈ 0', 'trôi vài °'] }] }],
    bay: ['Cấp 5V: chân SDA/SCL có thể bị kéo lên 5V qua điện trở trên module.', 'Chạm board lúc code đo sai lệch: cả bài trôi nhanh.', 'Quên đánh thức chip: mọi số đọc = 0.', 'Tin góc gyro trong nhiều phút: trôi — cần la bàn hoặc encoder hiệu chỉnh.'],
    robot: ['Robot hút bụi: gyro giúp quay đúng góc và đi thẳng dù 2 bánh trượt khác nhau; encoder (15.2) đo quãng đường.'],
  });
})();
