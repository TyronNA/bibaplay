// Bài 8.3 — GND chung. LED + 220Ω ăn điện từ hộp pin qua S8050 (E 12h, B 13h, C 14h). GPIO14 → 13a → 4.7k (13e→13f) → B.
// ESP để ngoài: phần 2 chỉ nối GPIO14; phần 3 thêm dây GND board → thanh − (GND hộp pin).
(function () {
  const Q = { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, DE = K.day('dE', '12j', 'B-:12', 'den');
  const L = K.led('led', '15g', '14g', 'do', { nhan: '' }), RC = K.tro('rc', ['15e', '15f'], '220'), DC = K.day('dC', 'T+:15', '15a', 'do'), RB = K.tro('rb', ['13e', '13f'], '4.7k');
  const sd = SD;
  const soDo = sd.svg(320, 222, sd.pin(250, 100, '4.78V') + sd.day('250,100 250,20 150,20 150,30') + sd.tro(150, 30, 40, '220Ω') + sd.led(150, 70) + sd.day('150,110 150,125') + sd.npn(140, 155)
    + sd.day('150,185 150,195 250,195 250,110') + sd.hop(10, 130, 70, 50, 'ESP32') + sd.day('80,145 110,145') + sd.troNgang(80, 155, 30, '') + sd.chu(40, 125, 'GPIO14', 'sd-mo', 'middle')
    + sd.day('45,180 45,195 150,195') + sd.chu(160, 214, 'dây GND chung — thiếu là không chạy', 'sd-xau', 'middle'),
  'ESP32 điều khiển transistor của mạch dùng hộp pin; hai bên phải nối chung GND');
  BAI.dangKy({
    id: '8.3',
    muc_tieu: 'GPIO bật một mạch dùng nguồn khác (hộp pin) qua transistor. Thấy vì sao mọi nguồn trong một mạch phải <b>nối chung GND</b>.',
    nguon: 'USB (board) + 3×AAA (LED)',
    can: [...K.coBanEsp(2), K.can.pin(), K.can.npn(), K.can.tro('4.7k'), K.can.tro('220'), K.can.led()],
    kien_thuc: `<p>"3.3V" ở GPIO là 3.3V <b>so với GND của board</b>. Chân B của transistor cần áp so với <b>E</b>, mà E đang nối về − của hộp pin. Chưa nối 2 GND với nhau thì dòng từ GPIO không có đường quay về board: không có dòng B, LED không bật.</p>
      <p>Dây GND chung nối <b>GND board ↔ − hộp pin</b>. Không bao giờ nối + hộp pin vào bất kỳ chân nào của board: 4.78V vượt mức chịu tối đa 3.6V của chân ESP32.</p>
      <p>4.7k: Ib = (3.3 − 0.7)/4.7k ≈ 0.55mA, lấy từ GPIO rất ít; đủ cho Ic 12mA với hFE ≥ 22.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'GPIO → 4.7k → B. E, − hộp pin và GND board phải chung một điểm.' }],
    code: 'sandbox/esp32-bai/main/bai_8_3.c',
    du_doan: '<p>Chưa nối GND: LED tắt dù code đang bật/tắt. Nối GND: LED nháy 1s.</p>',
    phan: [
      {
        ten: 'Phần 1 · Nạp code khi board chưa nối gì',
        buoc: [
          { ...K.camUsb('Cắm USB, nạp bài 8.3', ['<code>idf.py menuconfig</code> → Bai hoc → 8.3, rồi <code>idf.py -p /dev/cu.usbmodem… flash monitor</code>.'], {}, { thay: 'Monitor in "GPIO14 = 1", "GPIO14 = 0" mỗi giây.', neu_khong: 'Không nạp được: giữ BOOT, nhấn RST, thả BOOT, nạp lại.' }), board: { them: [K.esp({}, { usb: true, x: 270 })] } },
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Chưa nối GND chung', cot: 34,
        buoc: [
          K.buocPin(),
          { ten: 'Transistor, LED, 220Ω, 4.7k', lam: ['S8050: E 12h, B 13h, C 14h; dây đen 12j → thanh −. LED: chân ngắn 14g, chân dài 15g. 220Ω 15e → 15f, dây đỏ thanh + → 15a. 4.7k vắt qua rãnh 13e → 13f.'], board: { them: [Q, DE, L, RC, DC, RB] } },
          { ten: 'Dây GPIO14 → 13a', lam: ['USB vẫn rút. Dây đực–cái: đầu cái vào chân <code>14</code> của board, đầu đực vào <b>13a</b>. Không nối GND.'], board: { them: [K.esp({ G14: '13a' }, { x: 270 })] } },
          K.buocOm('Ω 200k', '1', '1 (OL): transistor tắt.', 'Có số nhỏ: kiểm lại chân transistor.', ['Thêm: que đỏ 13c, que đen thanh + → phải 1 (OL): cột 13 không chạm + hộp pin.']),
          K.lapPin('Lắp pin, cắm USB', ['Lắp pin trước, rồi cắm USB. Code đang chạy (monitor in 1/0).'], { sua: { esp: { usb: true } } }, { thay: 'LED <b>không</b> nháy.', neu_khong: 'LED nháy: đâu đó đã có đường GND chung (vd Mac và hộp pin cùng chạm một vật kim loại). Vẫn làm tiếp phần 3.' }),
          { ten: 'Rút USB, tháo pin', lam: ['Rút USB trước, rồi tháo pin.'], board: { sua: { esp: { usb: false }, pin: { trang_thai: 'rong' } } } },
        ],
      },
      {
        ten: 'Phần 3 · Nối GND chung', ke_thua: true,
        buoc: [
          { ten: 'Thêm dây GND board → thanh −', lam: ['Dây đực–cái: đầu cái vào chân <code>GND</code> của board, đầu đực vào thanh − dưới (cột 20).'], board: { bo: ['esp'], them: [K.esp({ G14: '13a', GND: 'B-:20' }, { x: 270 })] } },
          K.buocOm('Ω 200k', '1', 'Vẫn 1 (OL) ở tiếp điểm hộp pin: dây GND không tạo đường nào từ +.', 'Có số nhỏ: dây GND cắm nhầm vào thanh +. Sửa ngay.'),
          K.lapPin('Lắp pin, cắm USB', ['Lắp pin, rồi cắm USB.'], { sua: { esp: { usb: true }, led: { sang: true } } }, { thay: 'LED nháy 1s theo monitor.', neu_khong: 'Vẫn không nháy: kiểm chân B, chiều LED.' }),
          { ten: 'Rút USB, tháo pin', lam: ['Rút USB trước, rồi tháo pin.'], board: { sua: { esp: { usb: false }, pin: { trang_thai: 'rong' }, led: { sang: false } } } },
        ],
      },
    ],
    bang_do: [{ ten: 'LED', cot: ['Nháy?'], hang: [{ ten: 'Chưa GND chung', du_doan: ['không'] }, { ten: 'GND chung', du_doan: ['có'] }] }],
    bay: ['Nối + hộp pin vào chân board (kể cả 5V/3V3): 2 nguồn đấu nhau hoặc chân GPIO nhận 4.78V > 3.6V.', 'Dây GND chung cắm nhầm vào thanh +: + hộp pin đi thẳng vào GND board.', 'GPIO nối thẳng chân B không có 4.7k: B–E như diode kéo chân GPIO xuống ~0.7V, dòng GPIO vượt mức.'],
    robot: ['Robot: pin motor, driver, ESP32 luôn chung GND, dù nguồn khác nhau. Quên dây này là lỗi hay gặp nhất.'],
  });
})();
