// Bài 11.3 — PWM motor: mạch 7.4 (S8050 E 12h B 13h C 14h, motor 14j ↔ 17j, 1N4007 A 14g K 17g, cột 17 → +),
// chân B: GPIO14 → 13a → 470Ω (13e→13f), 10k kéo xuống. Motor ăn hộp pin; GND board ↔ − hộp pin.
(function () {
  const Q = { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, DE = K.day('dE', '12j', 'B-:12', 'den');
  const D = { id: 'd', loai: 'diode', kieu: '4007', a: '14g', k: '17g', nhan: '1N4007' };
  const VP = [K.day('vp', 'T+:17', '17a', 'do'), K.day('vc', '17e', '17f', 'do')];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 420, chan: { 1: '17j', 2: '14j' }, mau: ['do', 'den'], nhan: 'motor' };
  const RB = K.tro('rb', ['13e', '13f'], '470'), RD = K.tro('rd', ['13j', 'B-:13'], '10k');
  const ESP = K.esp({ G14: '13a', GND: 'B-:22' }, { x: 250 });
  BAI.dangKy({
    id: '11.3',
    muc_tieu: 'Chỉnh tốc độ motor bằng PWM từ GPIO qua transistor. Motor ăn nguồn riêng (hộp pin), chung GND với board.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(2), K.can.pin(), K.can.motor(), K.can.npn(), K.can.d4007(), K.can.tro('470'), K.can.tro('10k')],
    kien_thuc: `<p>Làm bài 7.4 trước (đo dòng motor ≤ 0.4A, kiểm chiều diode). Mạch y hệt 7.4, chỉ thay dây bật bằng GPIO14.</p>
      <p>Chân B: GPIO 3.3V qua 470Ω → Ib ≈ (3.3 − 0.8)/470 ≈ 5.3mA: GPIO ra được (< 20mA); đủ cho Ic ~0.3A với hFE ≥ 60 ở dòng lớn. Poster bài 28 dùng 1k (2.5mA) là thiếu. 10k kéo B xuống giữ motor tắt lúc chip đang khởi động (chân chưa cấu hình).</p>
      <p><b>Motor không bao giờ lấy điện từ chân 3V3 hay 5V của board</b>: dòng khởi động motor làm sụt nguồn chip → reset (bài 13.3).</p>
      <p>Thứ tự: cắm USB (code chạy, motor chưa có điện) → lắp pin. Tháo pin → rút USB.</p>`,
    code: 'sandbox/esp32-bai/main/bai_11_3.c',
    du_doan: '<p>Duty 30%: motor chạy chậm hoặc không đủ lực khởi động (đứng rung). 60%: vừa. 100%: như cắm thẳng pin.</p>',
    so_do: [{ nhan: 'PWM chạy motor qua S8050', svg: SD.svg(360, 240, SD.khoi(20, 60, 80, 'ESP32-S3', [], ['GPIO14', 'GND']) + SD.day('112,80 130,80 130,150') + SD.troNgang(130, 150, 60, '470Ω') + SD.day('190,150 210,150') + SD.cham(200, 150)
      + SD.day('200,150 200,155') + SD.tro(200, 155, 50) + SD.chu(186, 186, '10k', 'sd-chu', 'end') + SD.day('200,205 200,220') + SD.npn(240, 150) + SD.day('250,180 250,220')
      + SD.pin(320, 110) + SD.chu(330, 150, 'hộp pin', 'sd-mo', 'middle') + SD.day('320,110 320,30 250,30 250,62') + SD.motor(250, 78) + SD.day('250,94 250,120') + SD.cham(290, 30) + SD.cham(250, 110)
      + SD.day('290,30 290,50') + SD.diodeLen(290, 50, 50, '1N4007') + SD.day('290,100 290,110 250,110') + SD.day('320,120 320,220 112,220') + SD.day('112,100 120,100 120,220') + SD.cham(250, 220) + SD.cham(200, 220),
      'GPIO14 qua 470 ôm vào chân B của S8050; motor và diode ngược từ cực dương hộp pin xuống chân C; GND board nối cực âm pin'), chu: 'Motor ăn hộp pin, không ăn board. Vạch diode về phía +. GND chung.' }],
    sau: `<h3>Motor thấy gì từ PWM</h3>
      <p>Cuộn dây motor có hằng số thời gian điện <code>L/R</code> cỡ 0.1–1ms. Ở 1kHz trở lên, dòng không kịp lên xuống theo từng xung mà gợn quanh một mức trung bình: motor chạy như được cấp áp <code>D·U_pin</code>. Khi transistor tắt, dòng cuộn dây chạy vòng qua diode — diode làm việc hàng nghìn lần mỗi giây, không chỉ lúc tắt hẳn.</p>
      <h3>Tiếng rít và tổn hao chuyển mạch</h3>
      <p>PWM 1–5kHz làm cuộn dây rung nghe được (tiếng rít). Lên 20kHz thì hết nghe, nhưng mỗi lần bật/tắt transistor đi qua vùng lưng chừng một chút: tổn hao <code>P ≈ ½·U·I·(t_lên + t_xuống)·f</code>. 4.78V, 0.3A, 2µs, 20kHz: ≈ 29mW — vẫn nhỏ. Ở dòng và tần số cao hơn thì MOSFET + driver cổng mới theo kịp.</p>
      <h3>Vì sao duty thấp motor đứng rung</h3>
      <p>Đứng yên cần mô-men thắng ma sát tĩnh: dòng ≥ I_khởi. Duty 30% → áp trung bình 1.4V → dòng kẹt 1.4/R có khi chưa đủ. Code robot "đá" 100% vài chục ms rồi mới hạ về duty thấp.</p>`,
    hoi: [
      ['Pin 4.7V, duty 60%. Motor "thấy" khoảng bao nhiêu volt?', '≈ 0.6 × 4.7 ≈ <b>2.8V</b> (trừ thêm chút U_CE).'],
      ['Vì sao diode làm việc ở mỗi chu kỳ PWM chứ không chỉ lúc tắt motor?', 'Mỗi lần transistor tắt trong chu kỳ, dòng cuộn dây vẫn chạy tiếp và cần đường vòng: qua diode.'],
      ['Tổn hao chuyển mạch ở 1kHz so với 20kHz?', 'Tỉ lệ thuận với f: 1kHz ít hơn <b>20 lần</b> (nhưng rít nghe được).'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp mạch 7.4 với GPIO', cot: 34,
      buoc: [
        K.buocPin(),
        { ten: 'Transistor, diode, cột +', lam: ['S8050 E 12h, B 13h, C 14h; dây đen 12j → −. Dây đỏ thanh + → 17a, dây đỏ 17e → 17f. 1N4007: anode 14g, <b>vạch 17g</b>.'], board: { them: [Q, DE, ...VP, D] } },
        { ten: 'Kiểm chiều diode trước khi cắm motor', kiem_truoc: true, lam: ['Thang diode: que đỏ 14i, que đen 17i → ~0.55. Đảo que → 1.'], board: { them: [K.dh('diode ▶|', '14i', '17i', '≈ 0.55')] }, kiem: { thay: 'Đúng như trên.', neu_khong: '<b>Diode ngược, sửa ngay.</b>' } },
        { ten: 'Motor, 470Ω, 10k', lam: ['Motor: dây 1 → 17j, dây 2 → 14j. 470Ω vắt qua rãnh 13e → 13f. 10k từ 13j xuống thanh −.'], board: { them: [M, RB, RD] } },
        { ten: 'Dây từ board', lam: ['<code>14</code> → <b>13a</b>. <code>GND</code> → thanh − dưới (cột 22). Không nối 3V3/5V.'], board: { them: [ESP] } },
        K.buocOm('Ω 200k', '1', '1 (OL) ở tiếp điểm hộp pin.', 'Vài Ω: C–E nối tắt hoặc motor nối thẳng xuống −.', ['Thêm: que đỏ 13c (GPIO14), que đen thanh + → <b>không dưới ~0.4k</b>. Có thể ra vài kΩ (đường 470Ω → mối B–C → motor lên +) hoặc OL tuỳ đồng hồ; gần 0 mới là GPIO đang chạm + hộp pin.']),
        { ...K.camUsb('Cắm USB trước, nạp 11.3', ['<code>idf.py menuconfig</code> → 11.3, <code>flash monitor</code>. Hộp pin vẫn rỗng: motor không chạy.'], {}, { thay: 'Monitor in "motor duty …%".', neu_khong: '' }) },
        K.lapPin('Rồi lắp pin', ['Nhìn motor theo từng mức. Sau 1 vòng, chạm nhanh vào transistor.'], {}, { thay: 'Tốc độ theo duty; 0% thì dừng. Transistor nguội hoặc ấm nhẹ.', neu_khong: 'Transistor nóng: tháo pin, rút USB. Motor không bao giờ dừng: dây GPIO sai cột hoặc thiếu 10k.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Motor theo duty', cot: ['Chạy?', 'Tốc độ'], hang: [{ ten: '30%', du_doan: ['có thể không', 'chậm'] }, { ten: '60%', du_doan: ['có', 'vừa'] }, { ten: '100%', du_doan: ['có', 'nhanh'] }] }],
    bay: ['Motor lấy điện từ chân 5V/3V3 board: board reset hoặc cổng USB bị ngắt.', 'Thiếu diode: xung ngược giết transistor và có thể lọt về GPIO.', 'Quên GND chung: motor không chạy theo code.'],
    robot: ['Bánh robot chỉ cần 1 chiều thì mạch này đủ; cần tiến/lùi → cầu H (chương 13).'],
  });
})();
