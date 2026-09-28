// Bài 17.1 — Robot tự tránh vật. 3 mức áp trên một breadboard, nhầm là cháy module:
// T+ = pin 2S 6–8.4V (chỉ VM, IN+ LM2596, cầu đo pin) · B+ = 3V3 board · cột 16 = 5V từ LM2596. T− và B− là GND, nối ở cột 2.
(function () {
  const GN = K.day('gn', 'T-:2', 'B-:2', 'den');
  const DRV = { id: 'drv', loai: 'mod', ten: 'DRV8833', mau: 'do', chan: [['SLP', '4a'], ['IN1', '5a'], ['IN2', '6a'], ['IN3', '7a'], ['IN4', '8a'], ['OUT1', '9a'], ['OUT2', '10a'], ['OUT3', '11a'], ['OUT4', '12a'], ['VM', '13a'], ['GND', '14a']] };
  const DDRV = [K.day('slp', '4c', 'B+:4', 'do', 5), K.day('vm', 'T+:13', '13c', 'do', 3), K.day('gd', '14c', 'T-:14', 'den', 3)];
  const MT = { id: 'mt', loai: 'ngoai', kieu: 'motor', x: 560, chan: { 1: '9e', 2: '10e' }, mau: ['cam', 'tim'], nhan: 'motor trái' };
  const MP = { id: 'mp', loai: 'ngoai', kieu: 'motor', x: 640, chan: { 1: '11e', 2: '12e' }, mau: ['cam', 'tim'], nhan: 'motor phải' };
  const SR = { id: 'sr', loai: 'mod', ten: 'HC-SR04', mau: 'xanhduong', chan: [['VCC', '18a'], ['Trig', '19a'], ['Echo', '20a'], ['GND', '21a']] };
  const DSR = [K.day('v5', '16d', '18d', 'do', 3), K.tro('e1', ['20c', '24c'], '10k'), K.tro('e2', ['24e', '24f'], '20k'), K.day('e3', '24j', 'B-:24', 'den'), K.day('sg', '21e', 'B-:21', 'den', 3)];
  const IR = { id: 'ir', loai: 'mod', ten: 'FC-51', mau: 'xanhduong', chan: [['VCC', '28a'], ['GND', '29a'], ['OUT', '30a']] };
  const DIR = [K.day('iv', '28e', 'B+:28', 'do', 4), K.day('ig', '29e', 'B-:29', 'den', 3)];
  const SW = { id: 'sw', loai: 'ngoai', kieu: 'hop', chu: 'KW11', x: 722, chan: { COM: 'T-:34', NO: '34e' }, mau: ['den', 'vang'], nhan: 'va chạm' };
  const DPIN = [K.tro('p1', ['T+:38', '38a'], '20k'), K.tro('p2', ['38e', '38f'], '10k'), K.day('p3', '38j', 'B-:38', 'den')];
  const BUCK = { id: 'buck', loai: 'ngoai', kieu: 'hop', chu: 'LM2596', x: 830, chan: { 'IN+': 'T+:42', 'IN−': 'T-:42', 'OUT+': '16a', 'OUT−': 'B-:16' }, mau: ['do', 'den', 'cam', 'den'], nhan: 'ra 5.0V' };
  const PACK = { id: 'pack', loai: 'ngoai', kieu: 'hop', chu: 'pack 2S', x: 935, chan: { 'P+': 'T+:44', 'P−': 'T-:44' }, mau: ['do', 'den'], nhan: 'P+/P−' };
  const E = { GND: 'B-:3', '3V3': 'B+:3', G9: '5c', G10: '6c', G14: '7c', G21: '8c' };
  const ESP1 = K.esp(E, { x: 30 });
  const ESP2 = K.esp({ ...E, G17: '19c', G18: '24a', G8: '30c', G12: '34c', G1: '38c' }, { x: 30 });
  // Nối pack để đo 5V khi board chưa có điện: tạm rút GPIO1, không thì cầu đo pin đưa ~2.8V vào chân của chip đang tắt.
  const ESP2b = K.esp({ ...E, G17: '19c', G18: '24a', G8: '30c', G12: '34c' }, { x: 30 });
  const ESP3 = K.esp({ ...E, G17: '19c', G18: '24a', G8: '30c', G12: '34c', G1: '38c', '5V': '16c' }, { x: 30 });
  BAI.dangKy({
    id: '17.1',
    muc_tieu: 'Ghép mọi thứ của Phần 3 thành robot 2 bánh chạy bằng pin: đi thẳng, gặp vật (siêu âm / hồng ngoại / cản va) thì dừng, lùi, quay rồi đi tiếp; pin yếu thì tự dừng.',
    nguon: 'pack 2S → VM (6–8.4V) + LM2596 5V → board',
    can: [K.can.khung(), K.can.motorTT(2), K.can.drv8833(), K.can.sr04(), K.can.fc51(), K.can.kw11(), K.can.lm2596(), { ten: 'Pack 2S + BMS (16.2)', tim: 'BMS 2S', lk: 'bms-2s', sl: 1 }, K.can.esp(), K.can.usb(), K.can.ducCai(12), K.can.bb(), K.can.day(14), K.can.dh(), K.can.tro('10k', 2), K.can.tro('20k', 2)],
    kien_thuc: `<p>Mọi mảnh đã làm riêng: công tắc va chạm (14.1), FC-51 (14.2), HC-SR04 (14.3), DRV8833 + motor (15.2), pack 2S (16.2), LM2596 + đo pin (16.3). Bài này chỉ ghép, nên <b>làm từng cụm, đo từng cụm</b> — không cắm hết rồi mới cấp điện.</p>
      <p><b>Thanh nguồn có 3 mức áp khác nhau</b> — ghi nhãn bằng băng keo lên breadboard: thanh + trên = <b>pin 6–8.4V</b> (chỉ VM driver, IN+ LM2596, cầu đo pin); thanh + dưới = <b>3V3</b> của board (SLP, FC-51); cột 16 = <b>5V</b> từ LM2596 (board, HC-SR04). 2 thanh − là GND, nối với nhau ở cột 2.</p>
      <p><b>Motor TT định mức 3–6V</b>, pack đầy 8.4V → code giới hạn duty tối đa 70% (≈ 5.9V trung bình). DRV8833 chịu VM tới 10.8V nên pack 2S nằm trong mức.</p>
      <p><b>Nạp code:</b> rút dây P+ của pack → cắm USB → nạp → rút USB → cắm P+. Không bao giờ có USB và pin cùng lúc (Espressif: các đường cấp nguồn loại trừ nhau).</p>
      <p>Code: đi thẳng 50%; siêu âm &lt; 20cm, FC-51 báo vật, hoặc công tắc bị nhấn → dừng, lùi 0.4s, quay tại chỗ 0.35s, đi tiếp. Pin &lt; 6.6V (3.3V/cell) → dừng hẳn. Monitor in lý do mỗi lần né (khi chạy bằng USB ở bước thử).</p>`,
    code: 'sandbox/esp32-bai/main/bai_17_1.c',
    du_doan: '<p>Kê khung cho bánh quay trên không: 2 bánh cùng quay tiến; đưa tay trước siêu âm → 2 bánh dừng, quay lùi, rồi quay ngược nhau. Thả xuống sàn: robot né tường.</p>',
    khoi: 'Rút dây P+ của pack khỏi breadboard ngay, rút USB nếu đang cắm. Motor kẹt kêu ù, DRV8833 hoặc LM2596 nóng: tháo P+ trước rồi mới tìm lỗi. Pack nóng, phồng, có khói: không cầm, mở cửa thoáng, tránh xa; có lửa thì gọi 114.',
    phan: [
      {
        ten: 'Phần 1 · Driver + motor (chạy bằng USB, motor chưa có điện)', cot: 44,
        gioi_thieu: 'Breadboard + board ESP32 gắn lên khung bằng băng keo 2 mặt. Pack và LM2596 chưa nối.',
        buoc: [
          { ten: 'Nối 2 thanh −, cắm DRV8833', kiem_truoc: true, lam: ['Dây đen <b>thanh − trên (cột 2) → thanh − dưới (cột 2)</b>. Cắm DRV8833 cho các chân nằm ở cột 4–14 như hình, đọc chữ in: SLP, IN1–IN4, OUT1–OUT4, VM, GND.'], board: { them: [GN, DRV] },
            kiem: { thay: 'Biết chắc cột của từng chân driver.', neu_khong: 'Thứ tự khác hình: ghi lại, nối theo tên chân.' } },
          { ten: 'SLP, VM, GND driver, 2 motor', lam: ['Dây đỏ <b>4c → thanh + dưới</b> (SLP lên 3V3). Dây đỏ <b>thanh + trên → 13c</b> (VM). Dây đen <b>14c → thanh − trên</b>. Motor trái → 9e, 10e. Motor phải → 11e, 12e.'], board: { them: [...DDRV, MT, MP] } },
          { ten: 'Dây từ board', lam: ['USB rút. <code>GND</code> → thanh − dưới (cột 3). <code>3V3</code> → <b>thanh + dưới</b> (cột 3). <code>9</code> → 5c, <code>10</code> → 6c, <code>14</code> → 7c, <code>21</code> → 8c.'], board: { them: [ESP1] } },
          K.buocOmEsp('Không dưới 100Ω; thanh + trên (pin, đang trống) ↔ thanh −: rất lớn.', 'Thanh + dưới gần 0 với thanh −: 3V3 chạm GND.', ['Thêm: que đỏ thanh + <b>trên</b>, que đen thanh + <b>dưới</b> → không gần 0 (pin và 3V3 không được dính nhau).'], { thanh3v3: 'dưới' }),
          K.camUsb('Cắm USB, nạp 17.1, xem monitor', ['<code>idf.py menuconfig</code> → 17.1, <code>flash monitor</code>. Motor chưa có điện nên đứng yên; cảm biến chưa nối nên code có thể báo né liên tục — bình thường ở bước này.'], {}, { thay: 'Monitor in trạng thái và "pin = … mV" (≈ 0 vì chưa có pin).', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Cảm biến (vẫn chạy bằng USB)', ke_thua: true,
        buoc: [
          { ten: 'HC-SR04 + cầu Echo', lam: ['HC-SR04 vào 18a–21a (VCC Trig Echo GND, ống hướng ra mũi robot). Dây đỏ <b>16d → 18d</b> (5V sẽ tới từ LM2596 ở cột 16). 10k <b>20c → 24c</b>, 20k <b>24e → 24f</b>, dây đen <b>24j → thanh −</b>, dây đen <b>21e → thanh −</b>.'], board: { them: [SR, ...DSR] } },
          { ten: 'FC-51, công tắc va chạm', lam: ['FC-51 vào 28a–30a (đọc chữ in VCC/GND/OUT). Dây đỏ <b>28e → thanh + dưới</b> (3V3). Dây đen <b>29e → thanh −</b>. Công tắc (đã dò chân ở 14.1): COM → thanh − trên (cột 34), NO → <b>34e</b>.'], board: { them: [IR, ...DIR, SW] } },
          { ten: 'Cầu đo pin', lam: ['20k từ <b>thanh + trên (cột 38) → 38a</b>. 10k <b>38e → 38f</b>. Dây đen <b>38j → thanh −</b>.'], board: { them: DPIN } },
          { ten: 'Dây tín hiệu', lam: ['USB rút. <code>17</code> → 19c, <code>18</code> → <b>24a</b> (điểm giữa cầu Echo), <code>8</code> → 30c, <code>12</code> → 34c, <code>1</code> → <b>38c</b>.'], board: { bo: ['esp'], them: [ESP2] } },
          K.buocOmEsp(null, null, ['Thêm: 20b ↔ 24b ≈ 10k (Echo không nối thẳng GPIO18). 38b ↔ thanh − ≈ 10k song song phần còn lại.'], { thanh3v3: 'dưới' }),
          K.camUsb('Cắm USB, thử từng cảm biến', ['<code>flash monitor</code>. HC-SR04 chưa có 5V (cột 16 chưa nối) nên báo "het gio" — bình thường. Thử: che FC-51 bằng tay; gạt công tắc.'], {}, { thay: 'Che FC-51 → in "ne: hong ngoai". Gạt công tắc → in "ne: va cham".', neu_khong: 'Không in: kiểm dây 8 / 12 như bài 14.1, 14.2.' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 3 · Pin + LM2596, bánh nhấc khỏi mặt bàn', ke_thua: true,
        gioi_thieu: 'Kê khung lên hộp/cuốn sách cho 2 bánh quay trên không. LM2596 đã chỉnh 5.0V ở 16.3 — đo lại trước.',
        buoc: [
          { ten: 'LM2596 vào thanh pin, OUT → cột 16', lam: ['USB rút, pack chưa nối. IN+ → thanh + trên (cột 42), IN− → thanh − trên (cột 42). OUT+ → <b>16a</b>, OUT− → thanh − dưới (cột 16). Chân 5V board chưa nối.', 'Tạm rút đầu dây <code>1</code> khỏi <b>38c</b>: bước sau nối pack khi board chưa có điện, cầu đo pin sẽ đưa ~2.8V vào chân của chip đang tắt.'], board: { bo: ['esp'], them: [BUCK, ESP2b] } },
          { ten: 'Nối pack, đo 5V trước khi nối board', cap_dien: true, kiem_truoc: true, lam: ['Dây P− → thanh − trên (cột 44), rồi P+ → thanh + trên (cột 44). <code>DCV 20</code>: que đỏ 16b, que đen thanh −. Motor phải <b>đứng yên</b> (board chưa có điện, SLP = 0).'], board: { them: [PACK, K.dh('DCV 20', '16b', 'B-:18', '≈ 5.0')] },
            kiem: { thay: '16b = 4.95–5.05V. Không gì nóng.', neu_khong: 'Khác 5V: rút P+, chỉnh lại LM2596 như 16.3. Motor quay: SLP đang nối nhầm vào thanh pin — rút P+ ngay.' } },
          { ten: 'Rút P+, nối chân 5V board', lam: ['Rút P+. <code>5V</code> → <b>16c</b>. Cắm lại <code>1</code> → <b>38c</b>. Cáp USB: <b>rút khỏi board</b>.'], board: { bo: ['pack', 'esp'], them: [ESP3] } },
          K.buocOmEsp('3V3 ↔ − không dưới 100Ω, và 16b ↔ − (5V) không dưới 100Ω.', null, ['Thêm: 16b ↔ thanh − (mạch 5V).'], { thanh3v3: 'dưới' }),
          { ten: 'Cắm P+: robot chạy (bánh trên không)', cap_dien: true, lam: ['Không có USB. P+ → thanh + trên (cột 44). Nhìn 2 bánh. Đưa tay trước HC-SR04 ~10cm, rồi che FC-51, rồi gạt công tắc. Sau 1 phút sờ DRV8833, LM2596.'], board: { them: [PACK] },
            kiem: { thay: '2 bánh quay tiến; mỗi lần có vật: dừng → lùi → 2 bánh ngược nhau → tiến lại. Driver/LM2596 chỉ ấm.', neu_khong: 'Một bánh quay lùi khi "tiến": đảo 2 dây motor đó. Không bánh nào quay: SLP, VM. Dừng hẳn ngay: pin < 6.6V — sạc lại. Nóng: rút P+.' } },
          { ten: 'Thả xuống sàn', cap_dien: true, lam: ['Rút P+. Đặt robot trên sàn trống, cách tường 1m, xa cầu thang. Cắm P+. Quan sát. Muốn dừng: nhấc robot lên, rút P+.'], board: {},
            kiem: { thay: 'Robot đi, né tường/chân ghế. Vật mềm (rèm) có thể không né được bằng siêu âm — công tắc cản va là lớp cuối.', neu_khong: 'Đi lệch hẳn một bên: 2 motor khác tốc độ — bình thường với motor TT; encoder (15.2) là cách sửa.' } },
          { ten: 'Rút P+ khi xong', lam: ['Rút P+ trước, bọc đầu dây. Sạc lại 2 cell bằng 16.1 (tháo từng cell).'], board: { bo: ['pack'] } },
        ],
      },
    ],
    bang_do: [{ ten: 'Thử né (bánh trên không)', cot: ['Phản ứng?', 'Lý do in ra (khi có USB)'], hang: [{ ten: 'Tay trước HC-SR04 10cm', du_doan: ['dừng-lùi-quay', 'sieu am'] }, { ten: 'Che FC-51', du_doan: ['dừng-lùi-quay', 'hong ngoai'] }, { ten: 'Gạt công tắc', du_doan: ['dừng-lùi-quay', 'va cham'] }] },
      { ten: 'Nguồn', cot: ['Pin (V)', '5V (16b)'], hang: [{ ten: 'Lúc chạy', du_doan: ['7.4–8.4', '4.95–5.05'] }] }],
    bay: ['Cắm USB khi P+ đang nối: 2 nguồn đấu nhau trên chân 5V.', 'Cắm cảm biến 3V3 (FC-51, SLP) nhầm vào thanh + trên (pin 8.4V): hỏng module/chip.', 'Chạy thử lần đầu trên sàn: robot lao đi, rơi, đứt dây. Luôn bánh trên không trước.', 'Duty 100% với pack đầy: motor TT 8.4V, quá định mức 6V.', 'Để pack cạn dưới 6V: LM2596 tụt áp, board reset, robot giật cục.'],
    robot: ['Bước tiếp: encoder 2 bánh để đi thẳng (15.2), gyro quay đúng góc (15.3), TCRT5000 chống rơi (14.4), rồi cho xiaozhi điều khiển qua MCP (tài liệu MCP trong repo xiaozhi-esp32).'],
  });
})();
