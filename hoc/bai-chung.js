// Mảnh dùng chung cho hoc/bai/<id>.js: linh kiện hay cắm, đồ cần, và các bước an toàn lặp lại ở mọi bài.
// Bước "đo trước khi cấp điện" nằm ở đây để không bài nào quên, và con số phải ra luôn ghi kèm.
(function () {
  const M = { den: '#1B1B1B', nau: '#6D4C41', do: '#C62828', cam: '#EF6C00', vang: '#F9A825', luc: '#2E7D32', lam: '#1565C0', tim: '#6A1B9A' };
  const VONG = {
    10: 'nau den den', 100: 'nau den nau', 150: 'nau luc nau', 220: 'do do nau', 330: 'cam cam nau', 470: 'vang tim nau', '1k': 'nau den do',
    '2.2k': 'do do do', '4.7k': 'vang tim do', '10k': 'nau den cam', '20k': 'do den cam', '47k': 'vang tim cam', '100k': 'nau den vang', '1M': 'nau den luc',
  };
  const TEN_VONG = { den: 'đen', nau: 'nâu', do: 'đỏ', cam: 'cam', vang: 'vàng', luc: 'lục', lam: 'lam', tim: 'tím' };
  const vong = gt => (VONG[gt] || '').split(' ').filter(Boolean);

  const K = {
    // Vòng màu 4 vòng (vòng thứ 4 vàng kim ±5%); kit 5 vòng thì thêm 1 vòng đen trước vòng nhân — đo Ω cho chắc.
    tenVong: gt => vong(gt).map(v => TEN_VONG[v]).join('-'),
    tro: (id, p, gt, them) => ({ id, loai: 'tro', p, nhan: gt + 'Ω', vong: vong(gt).map(v => M[v]), ...them }),
    led: (id, a, k, mau, them) => ({ id, loai: 'led', a, k, mau: mau || 'do', nhan: { do: 'LED đỏ', xanhla: 'LED xanh lá', vang: 'LED vàng', xanhduong: 'LED xanh dương', trang: 'LED trắng' }[mau || 'do'], ...them }),
    day: (id, tu, den, mau, cong) => ({ id, loai: 'day', tu, den, mau: mau || 'vang', ...(cong ? { cong } : {}) }),
    dh: (che_do, do_, den, hien, cong) => ({ id: 'dh', loai: 'dh', che_do, do_, den, hien, ...(cong ? { cong } : {}) }),
    cu: it => ({ ...it, moi: false }),
    PIN: { id: 'pin', loai: 'pin', cong: 'T+:1', tru: 'B-:1', trang_thai: 'rong' },

    can: {
      tro: (gt, sl = 1) => ({ ten: `Điện trở ${gt}Ω${VONG[gt] ? ` (${K.tenVong(gt)})` : ''}`, tim: 'Điện trở 1/4W', lk: 'dien-tro', sl }),
      led: (mau = 'đỏ', sl = 1) => ({ ten: `LED ${mau} 5mm`, tim: 'LED 5mm', lk: 'led', sl }),
      day: (sl = 6) => ({ ten: 'Dây nhảy đực–đực', tim: 'Dây nhảy', lk: 'day-nhay', sl }),
      bb: () => ({ ten: 'Breadboard MB-102', tim: 'MB-102', lk: 'breadboard', sl: 1 }),
      pin: () => ({ ten: 'Hộp pin 3×AAA + 3 viên AAA', tim: 'hộp pin', lk: 'hop-pin', sl: 1 }),
      dh: () => ({ ten: 'Đồng hồ vạn năng', tim: 'đồng hồ vạn năng', lk: 'dong-ho', sl: 1 }),
      kep: (sl = 2) => ({ ten: 'Kẹp cá sấu', tim: 'kẹp cá sấu', lk: 'kep-ca-sau', sl }),
      bientro: (sl = 1) => ({ ten: 'Biến trở RM065 10k', tim: 'RM065', lk: 'bien-tro', sl }),
      ldr: () => ({ ten: 'Quang trở GL5528', tim: 'GL5528', lk: 'quang-tro', sl: 1 }),
      tuhoa: (gt, sl = 1) => ({ ten: `Tụ hoá ${gt} 16V`, tim: `Tụ hoá 16V ${gt}`, lk: 'tu-hoa', sl }),
      tugom: (sl = 1) => ({ ten: 'Tụ gốm 104 (100nF)', tim: 'Tụ gốm', lk: 'tu-gom', sl }),
      d4148: (sl = 1) => ({ ten: 'Diode 1N4148', tim: 'Diode 1N4148', lk: '1n4148', sl }),
      d4007: (sl = 1) => ({ ten: 'Diode 1N4007', tim: 'Diode 1N4007', lk: '1n4007', sl }),
      npn: (sl = 1) => ({ ten: 'Transistor S8050 (đã dò chân ở 5.1)', tim: 'S8050', lk: 's8050', sl }),
      nut: (sl = 1) => ({ ten: 'Nút nhấn 6×6', tim: 'Nút nhấn', lk: 'nut-nhan', sl }),
      motor: () => ({ ten: 'Motor DC tháo từ quạt dự phòng', tim: 'motor DC', lk: 'motor-dc', sl: 1 }),
      esp: () => ({ ten: 'Board ESP32-S3 N16R8', tim: 'ESP32-S3', lk: 'esp32-s3', sl: 1 }),
      usb: () => ({ ten: 'Cáp USB-C có data', tim: 'USB-C có data', lk: 'cap-usbc', sl: 1 }),
      ducCai: (sl = 4) => ({ ten: 'Dây nhảy đực–cái', tim: 'đực–cái', lk: 'day-duc-cai', sl }),
      // Phần 3 (robot) — số liệu: notes/datasheet-robot.md
      kw11: (sl = 1) => ({ ten: 'Công tắc hành trình KW11-3Z', tim: 'KW11', lk: 'cong-tac-ht', sl }),
      fc51: (sl = 1) => ({ ten: 'Module hồng ngoại FC-51', tim: 'FC-51', lk: 'fc51', sl }),
      sr04: () => ({ ten: 'Cảm biến siêu âm HC-SR04', tim: 'HC-SR04', lk: 'hc-sr04', sl: 1 }),
      tcrt: () => ({ ten: 'Module TCRT5000', tim: 'TCRT5000', lk: 'tcrt5000', sl: 1 }),
      sg90: () => ({ ten: 'Servo SG90', tim: 'SG90', lk: 'sg90', sl: 1 }),
      motorTT: (sl = 1) => ({ ten: 'Motor TT 1:48 + bánh', tim: 'motor TT', lk: 'motor-tt', sl }),
      kheQuang: () => ({ ten: 'Cảm biến khe quang + đĩa 20 lỗ', tim: 'khe quang', lk: 'khe-quang', sl: 1 }),
      gy521: () => ({ ten: 'Module GY-521 (MPU-6050)', tim: 'GY-521', lk: 'gy521', sl: 1 }),
      drv8833: () => ({ ten: 'Module DRV8833', tim: 'DRV8833', lk: 'drv8833', sl: 1 }),
      cell: (sl = 1) => ({ ten: 'Cell 18650 hàng hãng', tim: '18650', lk: 'cell-18650', sl }),
      tp4056: () => ({ ten: 'Module TP4056 6 chân (có bảo vệ)', tim: 'TP4056', lk: 'tp4056', sl: 1 }),
      de18650: (o = 1) => ({ ten: `Đế pin 18650 ${o} ô${o > 1 ? ' nối tiếp' : ''}`, tim: 'đế pin 18650', lk: 'de-18650', sl: 1 }),
      bms2s: () => ({ ten: 'Mạch bảo vệ BMS 2S', tim: 'BMS 2S', lk: 'bms-2s', sl: 1 }),
      cauChi: () => ({ ten: 'Cầu chì ống T2A 5×20mm + đế nối dây', tim: 'cầu chì', lk: 'cau-chi', sl: 1 }),
      lm2596: () => ({ ten: 'Module hạ áp LM2596', tim: 'LM2596', lk: 'lm2596', sl: 1 }),
      khung: () => ({ ten: 'Khung robot 2WD', tim: 'khung 2WD', lk: 'khung-2wd', sl: 1 }),
      sac5v: () => ({ ten: 'Cục sạc điện thoại 5V ≥ 1A + cáp khớp cổng module', tim: 'cục sạc', sl: 1 }),
      moHan: () => ({ ten: 'Mỏ hàn + thiếc (đồ nghề đợt 1)', tim: 'mỏ hàn', lk: 'mo-han', sl: 1 }),
      // Phần 4
      robot17: () => ({ ten: 'Robot đã chạy được ở bài 17.1 (pack 2S, LM2596, DRV8833, cảm biến)', tim: 'khung 2WD', lk: 'khung-2wd', sl: 1 }),
      wifi: () => ({ ten: 'Máy tính cùng mạng WiFi 2.4GHz với robot, có Python 3', tim: 'máy tính', sl: 1 }),
      thuoc: () => ({ ten: 'Thước dây + băng keo giấy đánh dấu sàn', tim: 'thước dây', sl: 1 }),
      bangKeoDen: () => ({ ten: 'Băng keo điện đen (vạch trên sàn sáng màu)', tim: 'băng keo điện', lk: 'co-nhiet', sl: 1 }),
      ld19: () => ({ ten: 'LiDAR LDROBOT LD19 + dây 4 chân', tim: 'LD19', lk: 'ld19', sl: 1 }),
      mayLinux: () => ({ ten: 'Máy Linux chạy Docker (mini PC, Raspberry Pi 5, laptop Ubuntu 24.04)', tim: 'máy Linux', sl: 1 }),
    },
    // Đồ luôn cần ở Phần 1 / Phần 2
    coBan: (soDay = 6) => [K.can.bb(), K.can.day(soDay), K.can.pin(), K.can.dh(), K.can.kep()],
    coBanEsp: (soDay = 4) => [K.can.esp(), K.can.usb(), K.can.ducCai(soDay), K.can.bb(), K.can.day(), K.can.dh(), K.can.kep()],

    buocPin: () => ({
      ten: 'Nối hộp pin rỗng vào breadboard',
      lam: ['Tháo hết pin khỏi hộp. Dây đỏ của hộp cắm vào thanh <b>+ trên</b>, dây đen vào thanh <b>− dưới</b>.'],
      board: { them: [K.PIN] },
    }),
    // Đo Ω giữa 2 tiếp điểm trong hộp pin rỗng = đo cả mạch nhìn từ phía pin.
    buocOm: (thang, hien, thay, neuKhong, lamThem) => ({
      ten: 'Đo trước khi cấp điện', kiem_truoc: true,
      lam: [`Hộp pin vẫn rỗng. Núm <code>${thang}</code>, que đỏ ở lỗ VΩ. Chạm 2 que vào 2 tiếp điểm kim loại trong hộp pin (chỗ dây đỏ và dây đen nối vào).`, ...(lamThem || [])],
      board: { them: [K.dh(thang, 'pin+', 'pin-', hien)] },
      kiem: { thay, neu_khong: neuKhong + ' <b>Không lắp pin</b>, sửa xong đo lại.' },
    }),
    lapPin: (ten, lam, board, kiem) => ({
      ten, cap_dien: true, lam,
      board: { ...(board || {}), sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' }, ...((board || {}).sua || {}) } },
      kiem,
    }),
    thaoPin: (lam, board) => ({
      ten: 'Tháo pin', lam: ['Tháo pin khỏi hộp trước khi rút hay cắm bất cứ thứ gì.', ...(lam || [])],
      board: { ...(board || {}), sua: { pin: { trang_thai: 'rong' }, ...((board || {}).sua || {}) } },
    }),

    // Phần 2: board ESP32 để ngoài breadboard, nối bằng dây đực–cái. Chân 3V3/GND đi vào thanh nguồn.
    esp: (chan, them) => ({ id: 'esp', loai: 'esp', chan, usb: false, ...them }),
    // Mốc Ω 3V3–GND đo ở bài 8.1 khi board chưa nối gì; mạch ngoài chỉ được làm số này nhỏ đi chút ít.
    // o.thanh3v3 = 'dưới' cho bài dùng thanh + trên cho nguồn khác (17.1: thanh + trên là pin 8.4V).
    buocOmEsp: (thay, neuKhong, lamThem, o = {}) => ({
      ten: 'Đo trước khi cắm USB', kiem_truoc: true,
      lam: [`Cáp USB <b>chưa cắm</b>. Núm <code>Ω 200k</code>. Que đỏ chạm thanh + ${o.thanh3v3 || 'trên'} (đang nối 3V3), que đen chạm thanh − dưới (GND).`,
        'So với <b>mốc</b> đã ghi ở bài 8.1 (board chưa nối gì). Số có thể chạy dần lên vài giây: tụ trên board đang được đồng hồ nạp, đợi số đứng rồi đọc.', ...(lamThem || [])],
      board: { them: [K.dh('Ω 200k', o.thanh3v3 === 'dưới' ? 'B+:6' : 'T+:2', 'B-:2', '≥ mốc 8.1')] },
      kiem: { thay: thay || 'Gần bằng mốc 8.1 hoặc thấp hơn chút ít, và <b>không dưới 100Ω</b>.', neu_khong: (neuKhong || 'Dưới 100Ω hoặc gần 0: 3V3 đang chạm GND ở đâu đó.') + ' <b>Không cắm USB</b>, rút từng dây ra đo lại để tìm chỗ.' },
    }),
    camUsb: (ten, lam, board, kiem) => ({
      ten, cap_dien: true, lam: ['Cắm cáp USB từ máy tính vào cổng USB của board (cổng ghi <code>USB</code> hoặc <code>COM</code> đều được, dùng một cổng cho cả bài).', ...lam],
      board: { ...(board || {}), sua: { esp: { usb: true }, ...((board || {}).sua || {}) } },
      kiem,
    }),
    // Phần 3: module cảm biến cấp nguồn xong, CHƯA nối GPIO — đo chân OUT phải ≤ 3.3V mới được nối.
    doOut: (ten, lam, do_, den, hien, thay) => ({
      ten, cap_dien: true, kiem_truoc: true,
      lam: ['Cắm USB (board chưa có dây nào vào chân OUT của module). Núm <code>DCV 20</code>.', ...lam],
      board: { sua: { esp: { usb: true } }, them: [K.dh('DCV 20', do_, den, hien)] },
      kiem: { thay, neu_khong: '<b>Trên 3.4V: không nối GPIO.</b> Module đang cấp 5V hoặc kéo lên 5V — rút USB, kiểm dây VCC có đúng 3V3 không. Không đổi mức khi thử: module chưa chạy, kiểm VCC/GND.' },
    }),
    rutUsb: (lam, board) => ({
      ten: 'Rút USB', lam: ['Rút cáp USB trước khi rút hay cắm bất cứ dây nào.', ...(lam || [])],
      board: { ...(board || {}), sua: { esp: { usb: false }, ...((board || {}).sua || {}) } },
    }),

    // Phần 4: robot lúc xong bài 17.1 làm nền, vẽ như đồ cũ (không khung vàng). 3 mức áp như 17.1:
    // T+ = pack 6–8.4V · B+ = 3V3 · cột 16 = 5V từ LM2596 (Phần 4 bắc 16e → 16f để có thêm 4 lỗ 5V ở nửa dưới).
    // Motor, công tắc, LM2596 dời sang phải (x ≥ 740) chừa chỗ cho board ESP32 nhiều chân hơn.
    robot17: () => {
      const d = (id, tu, den, mau, cong) => K.day(id, tu, den, mau, cong);
      return [
        d('gn', 'T-:2', 'B-:2', 'den'),
        { id: 'drv', loai: 'mod', ten: 'DRV8833', mau: 'do', chan: [['SLP', '4a'], ['IN1', '5a'], ['IN2', '6a'], ['IN3', '7a'], ['IN4', '8a'], ['OUT1', '9a'], ['OUT2', '10a'], ['OUT3', '11a'], ['OUT4', '12a'], ['VM', '13a'], ['GND', '14a']] },
        d('slp', '4c', 'B+:4', 'do', 5), d('vm', 'T+:13', '13c', 'do', 3), d('gd', '14c', 'T-:14', 'den', 3),
        // 2 motor gộp một hộp (T = trái, P = phải) cho hình đủ chỗ; nối y như 17.1
        { id: 'mot', loai: 'ngoai', kieu: 'hop', chu: '2 motor', x: 790, chan: { T1: '9e', T2: '10e', P1: '11e', P2: '12e' }, mau: ['cam', 'tim', 'cam', 'tim'], nhan: 'trái · phải' },
        { id: 'sr', loai: 'mod', ten: 'HC-SR04', mau: 'xanhduong', chan: [['VCC', '18a'], ['Trig', '19a'], ['Echo', '20a'], ['GND', '21a']] },
        d('v5', '16d', '18d', 'do', 3), K.tro('e1', ['20c', '24c'], '10k'), K.tro('e2', ['24e', '24f'], '20k'), d('e3', '24j', 'B-:24', 'den'), d('sg', '21e', 'B-:21', 'den', 3),
        { id: 'ir', loai: 'mod', ten: 'FC-51', mau: 'xanhduong', chan: [['VCC', '28a'], ['GND', '29a'], ['OUT', '30a']] },
        d('iv', '28e', 'B+:28', 'do', 4), d('ig', '29e', 'B-:29', 'den', 3),
        { id: 'sw', loai: 'ngoai', kieu: 'hop', chu: 'KW11', x: 890, chan: { COM: 'T-:34', NO: '34e' }, mau: ['den', 'vang'], nhan: 'va chạm' },
        K.tro('p1', ['T+:38', '38a'], '20k'), K.tro('p2', ['38e', '38f'], '10k'), d('p3', '38j', 'B-:38', 'den'),
        { id: 'buck', loai: 'ngoai', kieu: 'hop', chu: 'LM2596', x: 1000, chan: { 'IN+': 'T+:42', 'IN−': 'T-:42', 'OUT+': '16a', 'OUT−': 'B-:16' }, mau: ['do', 'den', 'cam', 'den'], nhan: 'ra 5.0V' },
        d('pp', '44c', 'T+:44', 'do'),
      ].map(i => ({ ...i, moi: false }));
    },
    // Mũi tên cho sơ đồ khối (cần SD.mui trong svg).
    mt: (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="sd-net" marker-end="url(#sd-mui)"/>`,
    // Đồ thêm của Phần 4, mỗi món một chỗ cố định để các bài sau vẽ lại đúng chỗ bài trước đã cắm.
    // Cảm biến gắn trên khung nối dây đực–cái xuống nửa dưới board: tín hiệu ở hàng h, dây ESP32 ở hàng i cùng cột.
    // Cột nửa dưới: 16 = 5V (sau cầu 16e → 16f), 46/48 khe quang, 50/52 TCRT, 54 servo, 56 LiDAR. GY-521 cắm nửa trên 53–60.
    p4: {
      enc: () => [
        { id: 'enct', loai: 'ngoai', kieu: 'hop', chu: 'khe quang', x: 1115, chan: { VCC: 'B+:45', GND: 'B-:45', OUT: '46h' }, mau: ['do', 'den', 'vang'], nhan: 'bánh trái' },
        { id: 'encp', loai: 'ngoai', kieu: 'hop', chu: 'khe quang', x: 1210, chan: { VCC: 'B+:47', GND: 'B-:47', OUT: '48h' }, mau: ['do', 'den', 'vang'], nhan: 'bánh phải' },
      ],
      encEsp: { G11: '46i', G13: '48i' },
      imu: () => [
        { id: 'imu', loai: 'mod', ten: 'GY-521', mau: 'xanhduong', chan: [['VCC', '53a'], ['GND', '54a'], ['SCL', '55a'], ['SDA', '56a'], ['XDA', '57a'], ['XCL', '58a'], ['AD0', '59a'], ['INT', '60a']] },
        K.day('iv3', '53e', 'B+:53', 'do', 4), K.day('ig3', '54e', 'B-:54', 'den', 3),
      ],
      imuEsp: { G42: '55c', G41: '56c' },
      tcrt: () => [
        { id: 'tct', loai: 'ngoai', kieu: 'hop', chu: 'TCRT5000', x: 1115, chan: { VCC: 'B+:49', GND: 'B-:49', AO: '50h' }, mau: ['do', 'den', 'xanh'], nhan: 'mắt trái' },
        { id: 'tcp', loai: 'ngoai', kieu: 'hop', chu: 'TCRT5000', x: 1210, chan: { VCC: 'B+:51', GND: 'B-:51', AO: '52h' }, mau: ['do', 'den', 'xanh'], nhan: 'mắt phải' },
      ],
      tcrtEsp: { G4: '50i', G5: '52i' },
      // Cầu 5V sang nửa dưới + tụ 100µF chặn sụt áp lúc servo/LiDAR khởi động.
      nguon5: () => [K.day('c5v', '16e', '16f', 'do'), { id: 'c100', loai: 'tu', p: ['16j', 'B-:17'], nhan: '100µF' }],
      servo: () => [{ id: 'sv', loai: 'ngoai', kieu: 'hop', chu: 'SG90', x: 1115, chan: { S: '54h', '+': '16g', '−': 'B-:15' }, mau: ['cam', 'do', 'nau'], nhan: 'servo radar' }],
      servoEsp: { G15: '54i' },
      // HC-SR04 rời breadboard lên tay servo, 4 dây đực–cái cắm lại đúng 4 lỗ cũ 18a–21a.
      srServo: () => [{ id: 'sr2', loai: 'ngoai', kieu: 'hop', chu: 'HC-SR04', x: 1210, chan: { VCC: '18a', Trig: '19a', Echo: '20a', GND: '21a' }, mau: ['do', 'vang', 'xanh', 'den'], nhan: 'trên tay servo' }],
      lidar: () => [{ id: 'ld', loai: 'ngoai', kieu: 'hop', chu: 'LD19', x: 1210, chan: { Tx: '56h', PWM: 'B-:57', GND: 'B-:58', P5V: '16h' }, mau: ['vang', 'den', 'den', 'do'], nhan: 'LiDAR' }],
      lidarEsp: { G16: '56i' },
    },
    // Chân ESP32 của robot 17.1 + chân thêm của bài (vd { G11: '46i' }).
    espRobot: (them, o) => K.esp({ GND: 'B-:3', '3V3': 'B+:3', G9: '5c', G10: '6c', G14: '7c', G21: '8c', G17: '19c', G18: '24a', G8: '30c', G12: '34c', G1: '38c', '5V': '16c', ...them }, { x: 30, ...o }),
    packRobot: () => ({ id: 'pack', loai: 'ngoai', kieu: 'hop', chu: 'pack 2S', x: 1300, chan: { 'P+': '44a', 'P−': 'T-:44' }, mau: ['do', 'den'], nhan: 'P+/P−' }),
    // Bước chung Phần 4: cắm P+ khi board đang không có USB (thứ tự nạp code của 17.1).
    camPack: (ten, lam, kiem, board) => ({ ten, cap_dien: true, lam: ['Cáp USB <b>đã rút</b> khỏi board. Cắm P+ vào <b>44a</b>.', ...lam], board: { ...(board || {}), them: [K.packRobot(), ...((board || {}).them || [])] }, kiem }),
    rutPack: (lam) => ({ ten: 'Rút P+', lam: ['Rút P+ khỏi 44a trước khi rút hay cắm bất cứ dây nào, và trước khi cắm USB.', ...(lam || [])], board: { bo: ['pack'] } }),
    // Đo trước khi cắm pack: 3 mức áp của robot không được chạm nhau.
    buocOmRobot: (them, o = {}) => ({
      ten: 'Đo trước khi cấp điện', kiem_truoc: true,
      lam: ['P+ và USB đều <b>rút</b>. Núm <code>Ω 200k</code>, đo từng cặp, đợi số đứng (tụ trên board được đồng hồ nạp nên số chạy lên từ từ):',
        '① Thanh + trên (pin) ↔ thanh − trên: ≈ 20–30kΩ (cầu đo pin 20k + 10k), <b>không dưới 1kΩ</b>.',
        '② Thanh + dưới (3V3) ↔ thanh − dưới: gần mốc 3V3 của bài 8.1, <b>không dưới 100Ω</b>.',
        '③ 16b (5V) ↔ thanh − dưới: <b>không dưới 100Ω</b>.',
        '④ Thanh + trên ↔ thanh + dưới, và thanh + trên ↔ 16b: phải <b>rất lớn</b> (không nối nhau).', ...(them || [])],
      board: { them: [K.dh('Ω 200k', o.do_ || 'T+:40', o.den || 'T-:40', '> 1k')] },
      kiem: { thay: 'Đủ các số trên.', neu_khong: 'Cặp nào gần 0 hay dưới ngưỡng: <b>không cắm P+</b>. Rút từng dây mới cắm ở bài này ra, đo lại tới khi tìm ra chỗ chạm.' },
    }),
  };
  window.K = K;
})();
