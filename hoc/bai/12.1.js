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
