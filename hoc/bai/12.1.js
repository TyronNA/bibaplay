// Bài 12.1 — OLED I2C. Module cắm GND 10a, VCC 11a, SCL 12a, SDA 13a (thứ tự giả định — đọc chữ in).
// Dây đực–cái từ board thẳng vào cột của từng chân: GND → 10c, 3V3 → 11c, 42 → 12c, 41 → 13c.
(function () {
  const OLED = { id: 'oled', loai: 'mod', ten: 'OLED', mau: 'xanhduong', chan: [['GND', '10a'], ['VCC', '11a'], ['SCL', '12a'], ['SDA', '13a']] };
  const ESP = K.esp({ GND: '10c', '3V3': '11c', G42: '12c', G41: '13c' });
  BAI.dangKy({
    id: '12.1',
    muc_tieu: 'Bus I2C: 2 dây (SCL clock, SDA data) nói chuyện với nhiều thiết bị theo địa chỉ. Quét tìm OLED rồi vẽ chữ lên nó.',
    can: [...K.coBanEsp(4), { ten: 'OLED 0.96" 128×64 I2C', tim: 'OLED', lk: 'oled', sl: 1 }],
    kien_thuc: `<p>I2C: chip (master) phát xung clock trên SCL, gửi/nhận bit trên SDA. Mỗi thiết bị có địa chỉ 7 bit; OLED SSD1306 thường là <code>0x3C</code>. Cả 2 dây là "cực máng hở": thiết bị chỉ kéo xuống 0, còn mức 1 là nhờ <b>điện trở kéo lên</b>. Module OLED thường có sẵn 2 con trên board; code bật thêm pull-up nội (~45k).</p>
      <p>Chân SDA=41, SCL=42 là chân xiaozhi dùng (<code>bread-compact-wifi/config.h</code>), để bài 12.5 khỏi đổi.</p>
      <p><b>Thứ tự 4 chân OLED mỗi shop một kiểu</b> (GND-VCC-SCL-SDA hoặc VCC-GND-…). Đảo VCC và GND là hỏng module. Nối dây theo <b>chữ in</b>, không theo hình.</p>
      <p>Module phải có hàng chân (header) đã hàn; loại bán rời header thì hàn trước khi làm bài này.</p>`,
    code: 'sandbox/esp32-bai/main/bai_12_1.c',
    du_doan: '<p>Monitor in "co thiet bi o 0x3C"; OLED hiện XIN CHAO, DIA CHI 3C, và số DEM tăng.</p>',
    so_do: [{ nhan: 'Bus I2C', svg: SD.svg(340, 170, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['3V3', 'GND', 'GPIO41 SDA', 'GPIO42 SCL']) + SD.khoi(230, 40, 90, 'OLED SSD1306', ['VCC', 'GND', 'SDA', 'SCL'])
      + SD.day('122,60 218,60') + SD.day('122,80 218,80') + SD.day('122,100 218,100') + SD.day('122,120 218,120'),
      'Bốn dây nối ESP32 với OLED: 3V3, GND, SDA 41, SCL 42'), chu: 'Thứ tự chân trên module thật mỗi shop một kiểu: nối theo chữ in. Điện trở kéo lên thường có sẵn trên module.' }],
    sau: `<h3>Chọn điện trở kéo lên</h3>
      <p>Dây I2C chỉ được kéo xuống bởi thiết bị; lên lại là nhờ điện trở kéo lên nạp điện dung của bus (dây + chân, cỡ 20–100pF). Thời gian lên từ 30% tới 70%: <code>t_r ≈ 0.85·R·C</code>. Chuẩn I2C 400kHz cho t_r ≤ 300ns → với 50pF: <code>R ≤ 300ns / (0.85 × 50pF) ≈ 7k</code>. Nhỏ quá thì thiết bị không kéo xuống nổi (chuẩn cho tối đa 3mA → R ≥ 3.3/3mA ≈ 1.1k). Vì vậy module hay gắn 4.7k. Pull-up nội ~45k chỉ đủ cho bus ngắn, chậm.</p>
      <h3>Địa chỉ 0x3C trên dây</h3>
      <p>0x3C = <code>0111100</code> (7 bit). Trên dây, byte đầu là 7 bit địa chỉ + 1 bit đọc/ghi: ghi → <code>0111100 0</code> = 0x78. Nhiều tài liệu ghi "0x78" cho OLED là đang nói byte này — cùng một thiết bị.</p>
      <h3>Màn hình nhanh cỡ nào</h3>
      <p>Cả màn 128×64 = 1024 byte. Mỗi byte trên I2C tốn 9 nhịp (8 bit + ACK): ở 400kHz là 22.5µs → cả màn ≈ 23ms + phần đầu gói → tối đa ~40 khung/giây. Đủ cho mặt robot chớp mắt, không đủ cho video.</p>`,
    hoi: [
      ['Địa chỉ 7 bit 0x68 (MPU-6050). Byte đầu khi ghi là bao nhiêu?', '0x68 &lt;&lt; 1 = <b>0xD0</b> (đọc là 0xD1).'],
      ['Bus dài có 200pF, cần t_r ≤ 300ns. Điện trở kéo lên tối đa?', '300ns / (0.85 × 200pF) ≈ <b>1.8k</b> (vẫn trên mức tối thiểu ~1.1k).'],
      ['Quét I2C không thấy gì. Nêu 3 chỗ kiểm trước.', 'Đảo SDA/SCL; VCC/GND sai hoặc chưa có điện (đo áp VCC module); thiếu điện trở kéo lên hoặc dây lỏng.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, quét, vẽ',
      buoc: [
        { ten: 'Cắm OLED, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm 4 chân OLED vào 10a, 11a, 12a, 13a. Đọc chữ in trên module, ghi: cột 10 = ?, 11 = ?, 12 = ?, 13 = ?'], board: { them: [OLED] },
          kiem: { thay: 'Biết chắc cột nào là GND, VCC, SCL, SDA.', neu_khong: 'Không đọc được: chưa đi tiếp, tra ảnh trang shop bán hoặc chụp ảnh nhờ người biết điện tử xem.' } },
        { ten: '4 dây từ board theo tên chân', lam: ['<code>GND</code> → cột GND (10c). <code>3V3</code> → cột VCC (11c) — <b>không phải 5V</b>. <code>42</code> → cột SCL (12c). <code>41</code> → cột SDA (13c).'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>. Que đỏ cột VCC (11d), que đen cột GND (10d). Rồi đọc to: dây từ chân 3V3 của board đang ở cột có chữ VCC.'], board: { them: [K.dh('Ω 200k', '11d', '10d', '> 0.1')] },
          kiem: { thay: 'Không dưới ~100Ω (thường kΩ, song song mốc 8.1).', neu_khong: 'Gần 0: VCC chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 12.1', ['<code>idf.py menuconfig</code> → 12.1, <code>flash monitor</code>.'], {}, { thay: 'Monitor: "co thiet bi o 0x3C" (hoặc 0x3D). OLED hiện chữ.', neu_khong: '"khong thay gi": kiểm SCL/SDA có đảo không, VCC có điện không (đo 3.3V giữa VCC và GND). OLED ấm: rút USB ngay, VCC/GND có thể đang đảo.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'I2C', cot: ['Địa chỉ tìm thấy', 'OLED hiện chữ?'], hang: [{ ten: 'Kết quả', du_doan: ['0x3C', 'có'] }] }],
    bay: ['Đảo VCC/GND của OLED: hỏng module.', 'Cấp 5V cho OLED loại chỉ chịu 3.3V: đọc ghi chú shop; 3V3 luôn an toàn.', 'Đảo SCL/SDA: quét không thấy gì (không hỏng).'],
    robot: ['Cảm biến IMU, cảm biến khoảng cách laser (VL53L0X), cảm biến dòng (INA219) đều là I2C: chung 2 dây SDA/SCL với OLED, khác địa chỉ.'],
  });
})();
