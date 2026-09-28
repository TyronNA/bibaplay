// Bài 8.2 — Ổn áp AMS1117-3.3 cấp từ hộp 3×AAA. Module cắm VIN 10a, GND 11a, VOUT 12a (thứ tự giả định — đọc chữ in).
(function () {
  const MOD = { id: 'ams', loai: 'mod', ten: 'AMS1117', mau: 'xanhduong', chan: [['VIN', '10a'], ['GND', '11a'], ['VOUT', '12a']] };
  const VIN = K.day('vin', 'T+:7', '10c', 'do', 4), G = [K.day('g1', '11e', '11f', 'den'), K.day('g2', '11j', 'B-:11', 'den')];
  const TAI = [K.tro('rl', ['12e', '12f'], '330', { nhan: '330Ω tải' }), K.day('g3', '12j', 'B-:13', 'den', 4)];
  const D = { id: 'd', loai: 'diode', kieu: '4007', a: '5c', k: '10d', nhan: '1N4007' }, V2 = K.day('v2', 'T+:5', '5a', 'do');
  BAI.dangKy({
    id: '8.2',
    muc_tieu: 'Ổn áp tuyến tính AMS1117-3.3: vào 4.78V ra 3.3V, và thấy nó cần <b>dư áp</b> ~1V — hộp 3×AAA chỉ vừa đủ.',
    nguon: '3×AAA → AMS1117 → 3.3V',
    can: [{ ten: 'Module AMS1117-3.3', tim: 'AMS1117', lk: 'ams1117', sl: 1 }, K.can.tro('330'), K.can.d4007(), ...K.coBan(6)],
    kien_thuc: `<p>Ổn áp tuyến tính là một "điện trở tự chỉnh": ăn phần áp dư <code>U_vào − 3.3V</code> thành nhiệt. Muốn giữ 3.3V ở đầu ra thì đầu vào phải cao hơn ít nhất <b>~1.1V</b> (sụt áp tối thiểu, dropout): ≥ 4.4V.</p>
      <p><b>Thứ tự chân mỗi module một khác</b> (VIN-GND-VOUT, GND-VOUT-VIN…). Hình vẽ VIN–GND–VOUT; đọc chữ in trên module của bạn và nối theo <b>tên chân</b>, không theo vị trí trên hình. Cấp nhầm vào VOUT: module nóng, hỏng.</p>
      <p>Tải 330Ω ở 3.3V = 10mA, công suất ổn áp <code>(4.78 − 3.3) × 0.01 ≈ 15mW</code>: nguội. Phần 2 thêm 1N4007 phía trước để giả lập pin yếu (mất 0.7V).</p>`,
    du_doan: '<p>Pin 4.78V: VOUT ≈ 3.30V. Qua diode (VIN ≈ 4.05V < 4.4V): VOUT tụt ≈ 2.9–3.0V — ổn áp "hết dư".</p>',
    phan: [
      {
        ten: 'Phần 1 · Pin đầy', cot: 20,
        buoc: [
          K.buocPin(),
          { ten: 'Cắm module, đọc chữ in', kiem_truoc: true, lam: ['Cắm 3 chân module vào 10a, 11a, 12a. Đọc chữ in cạnh từng chân, viết ra giấy: cột 10 = ?, cột 11 = ?, cột 12 = ?', 'Các bước sau gọi theo tên chân. Nếu module của bạn khác thứ tự, đổi số cột theo tên.'], board: { them: [MOD] },
            kiem: { thay: 'Biết chắc cột nào là VIN, GND, VOUT.', neu_khong: 'Không đọc được chữ: tra ảnh trang shop bán, hoặc chụp ảnh nhờ người biết điện tử xem. <b>Chưa đi tiếp.</b>' } },
          { ten: 'VIN, GND, tải', lam: ['Dây đỏ thanh + → cột VIN (10c). GND xuống −: dây đen 11e → 11f, dây đen 11j → thanh −.', 'Tải 330Ω vắt qua rãnh ở cột VOUT (12e → 12f), dây đen 12j → thanh −.'], board: { them: [VIN, ...G, ...TAI] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω (con số cụ thể tuỳ module). Đo thêm VOUT–GND (12c với thanh −): ≈ 330Ω hoặc thấp hơn chút.', 'Gần 0: VIN chạm GND.'),
          K.lapPin('Lắp pin, đo VIN và VOUT', ['<code>DCV 20</code>, que đen thanh −. Que đỏ 10b (VIN), rồi 12c (VOUT). Sờ module.'], { them: [K.dh('DCV 20', '12c', 'B-:15', '≈ 3.30')] },
            { thay: 'VIN ≈ 4.7, VOUT ≈ 3.30. Module nguội.', neu_khong: 'VOUT ≈ VIN: đang đo nhầm chân. Module nóng: tháo pin, có thể đang cấp vào VOUT.' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 2 · Giả lập pin yếu bằng 1N4007', ke_thua: true,
        buoc: [
          { ten: 'Chèn diode trước VIN', lam: ['Rút dây đỏ thanh + → 10c. Dây đỏ thanh + → 5a. 1N4007: anode 5c, <b>vạch 10d</b> (về phía VIN).'], board: { bo: ['vin'], them: [V2, D] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω.', 'Gần 0: nối tắt.'),
          K.lapPin('Lắp pin, đo lại', ['Que đỏ 10b (VIN), rồi 12c (VOUT).'], { them: [K.dh('DCV 20', '12c', 'B-:15', '≈ 2.95')] }, { thay: 'VIN ≈ 4.05, VOUT tụt dưới 3.3 (≈ 2.9–3.0): VIN − VOUT ≈ 1.1V, không còn ổn áp.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'AMS1117', cot: ['VIN', 'VOUT', 'VIN − VOUT'], hang: [{ ten: 'Pin trực tiếp', du_doan: ['≈ 4.75', '≈ 3.30', '≈ 1.45'] }, { ten: 'Qua 1N4007', du_doan: ['≈ 4.05', '≈ 2.95', '≈ 1.1'] }] }],
    bay: ['Cấp vào chân VOUT hoặc đảo VIN/GND: module nóng, chết.', 'Cấp 5V vào chân 3V3 của ESP32: hỏng chip. Ổn áp là thứ đứng giữa.', 'Tải lớn (ESP32 phát WiFi ~300–500mA) qua AMS1117 từ 5V: ăn ~0.6–0.9W, cần tản nhiệt.'],
    robot: ['Robot chạy pin 2 cell lithium (7.4–8.4V) → ổn áp xuống 5V/3.3V. Chênh áp lớn thì dùng ổn áp xung (buck) cho đỡ nóng.', 'Bài 13.3 dùng lại mạch này để thấy motor làm sụt áp pin → ESP32 reset.'],
  });
})();
