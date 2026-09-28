// Bài 13.1 — Cầu H. Module driver kiểu 2 chân IN mỗi motor, cắm VM 10a, GND 11a, IN1 12a, IN2 13a, OUT1 14a, OUT2 15a
// (thứ tự giả định — module thật chọn lúc mua, đọc chữ in). Motor ăn hộp pin; GND board ↔ − hộp pin.
(function () {
  const DRV = { id: 'drv', loai: 'mod', ten: 'driver motor', mau: 'do', chan: [['VM', '10a'], ['GND', '11a'], ['IN1', '12a'], ['IN2', '13a'], ['OUT1', '14a'], ['OUT2', '15a']] };
  const D = [K.day('vm', 'T+:8', '10c', 'do', 4), K.day('g1', '11e', '11f', 'den'), K.day('g2', '11j', 'B-:11', 'den')];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 470, chan: { 1: '14c', 2: '15c' }, mau: ['cam', 'tim'], nhan: 'motor' };
  const ESP = K.esp({ GND: 'B-:20', G9: '12c', G10: '13c' }, { x: 250 });
  const sd = SD;
  const soDo = sd.svg(300, 200, sd.day('40,20 260,20') + sd.day('40,180 260,180') + sd.chu(20, 24, '+', 'sd-pos') + sd.chu(20, 184, '−', 'sd-neg')
    + [[80, 'S1'], [220, 'S2']].map(([x, t]) => sd.day(`${x},20 ${x},50`) + `<line x1="${x}" y1="50" x2="${x + 12}" y2="72" class="sd-net"/>` + sd.day(`${x},76 ${x},124`) + `<line x1="${x}" y1="128" x2="${x + 12}" y2="150" class="sd-net"/>` + sd.day(`${x},154 ${x},180`) + sd.chu(x - 26, 64, t, 'sd-mo')).join('')
    + sd.chu(54, 142, 'S3', 'sd-mo') + sd.chu(194, 142, 'S4', 'sd-mo') + sd.day('80,100 134,100') + sd.motor(150, 100) + sd.day('166,100 220,100'),
  'Cầu H: 4 công tắc quanh motor; S1 + S4 đóng thì dòng đi một chiều, S2 + S3 đóng thì chiều ngược');
  BAI.dangKy({
    id: '13.1',
    muc_tieu: 'Cầu H = 4 công tắc bắt chéo quanh motor: đổi cặp đóng là đổi chiều dòng, tức đổi chiều quay. Điều khiển bằng 2 chân GPIO.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(3), K.can.pin(), K.can.motor(), { ten: 'Module driver motor 2 kênh', tim: 'driver motor', lk: 'driver-motor', sl: 1 }],
    kien_thuc: `<p>S1 + S4 đóng: dòng + → motor (trái sang phải) → −. S2 + S3 đóng: chiều ngược. <b>S1 + S3 cùng đóng</b> (2 công tắc cùng một nhánh) = nối tắt nguồn. IC driver tự chặn trường hợp đó bên trong.</p>
      <p>Chọn module khi mua: loại <b>2 chân IN mỗi motor</b>, chạy được từ ~3V (vd DRV8833, MX1508, L9110S). <b>L298N sụt ~2V</b> trên transistor bên trong: với pin 4.5V motor chỉ còn ~2.5V. Thứ tự chân mỗi module một khác: nối theo <b>chữ in</b>.</p>
      <p>Bảng điều khiển (DRV8833/MX1508): IN1=1 IN2=0 → chiều A; 0/1 → chiều B; 0/0 → thả trôi; 1/1 → phanh.</p>
      <p>Motor lấy điện hộp pin qua VM. <b>Không</b> lấy từ chân 5V/3V3 board. GND chung bắt buộc. Thứ tự: cắm USB (code chạy) → lắp pin; tháo pin → rút USB.</p>
      <p>Làm 7.4 phần 1 trước: dòng motor phải nằm trong dòng liên tục mà driver chịu (tra trang shop/datasheet module).</p>`,
    so_do: [{ nhan: 'Cầu H', svg: soDo, chu: 'Đổi cặp công tắc đóng = đổi chiều dòng qua motor.' }],
    code: 'sandbox/esp32-bai/main/bai_13_1.c',
    du_doan: '<p>Mỗi 3 giây: quay A → dừng từ từ → quay B → dừng.</p>',
    sau: `<h3>Điện trở trong của cầu H</h3>
      <p>DRV8833 dùng MOSFET: datasheet ghi tổng điện trở công tắc trên + dưới ~360mΩ. Motor 0.5A → sụt 0.18V. L298N dùng transistor lưỡng cực (Darlington): sụt ~2V ở cùng dòng — với pin 4.5V, motor chỉ còn 2.5V và L298N đốt 1W. Khác biệt đó là lý do giáo trình chọn DRV8833.</p>
      <h3>Phanh và thả trôi</h3>
      <p><b>Thả trôi</b> (IN1 = IN2 = 0): cả 4 công tắc hở, motor quay theo đà, áp ngược không có đường về → dừng chậm. <b>Phanh</b> (IN1 = IN2 = 1): 2 công tắc dưới cùng đóng, 2 cực motor bị nối tắt qua cầu: áp ngược đẩy dòng chạy vòng, sinh mô-men chống lại chuyển động → dừng nhanh. Năng lượng quay thành nhiệt trong cuộn dây và công tắc.</p>
      <h3>Chống nối tắt nhánh</h3>
      <p>Hai công tắc cùng một nhánh chuyển trạng thái không tức thì; nếu con trên chưa tắt hẳn mà con dưới đã dẫn thì nguồn bị nối tắt trong khoảnh khắc (shoot-through). IC driver chèn "thời gian chết" vài trăm ns giữa hai lần chuyển. Tự ráp cầu H bằng transistor rời thì phải tự lo chuyện này.</p>`,
    hoi: [
      ['Motor 0.8A qua DRV8833 (0.36Ω) và qua L298N (~2V). Mỗi con đốt bao nhiêu W?', 'DRV8833: 0.8² × 0.36 ≈ <b>0.23W</b>. L298N: 2 × 0.8 = <b>1.6W</b>.'],
      ['IN1 = IN2 = 1 làm gì? Khác IN1 = IN2 = 0 thế nào?', '1/1 = <b>phanh</b> (nối tắt 2 cực motor, dừng nhanh). 0/0 = <b>thả trôi</b> (dừng từ từ).'],
      ['Vì sao đảo chiều ngay khi motor đang quay nhanh là cú dòng lớn nhất?', 'Áp ngược đang cùng chiều áp nguồn mới: dòng ≈ (U + U_ngược)/R, gần gấp đôi dòng kẹt.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, đổi chiều', cot: 34,
      buoc: [
        K.buocPin(),
        { ten: 'Cắm driver, đọc chữ in', kiem_truoc: true, lam: ['Cắm module vào 10a–15a (hoặc theo số chân thật). Ghi tên từng cột theo chữ in: VM (hoặc VCC/+), GND, IN1, IN2, OUT1, OUT2.'], board: { them: [DRV] }, kiem: { thay: 'Biết chắc cột VM, GND, IN1, IN2, OUT1, OUT2.', neu_khong: 'Module có thêm chân (STBY/nSLEEP/EN): đọc trang shop, thường phải kéo lên mức 1 mới chạy — nối lên <b>3V3 của board</b> (như bài 15.2), không nối lên VM/pin. Chưa chắc thì chưa cấp điện.' } },
        { ten: 'Nguồn motor, motor', lam: ['Dây đỏ thanh + → cột VM. Cột GND xuống −: dây đen 11e → 11f, 11j → thanh −. Motor vào cột OUT1, OUT2.'], board: { them: [...D, M] } },
        { ten: 'Dây từ board', lam: ['USB rút. <code>GND</code> → thanh − (cột 20). <code>9</code> → IN1, <code>10</code> → IN2. Không nối 5V vào driver. 3V3 chỉ nối vào chân nSLEEP/STBY (nếu module có) hoặc chân VCC logic (loại cần nguồn logic riêng — đọc trang shop); không bao giờ vào VM.'], board: { them: [ESP] } },
        K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở tiếp điểm hộp pin.', 'Gần 0: VM chạm GND.', ['Thêm: cột OUT1 ↔ OUT2 ≈ R motor (vài Ω). Cột IN1 ↔ thanh + → không gần 0.']),
        K.camUsb('Cắm USB trước, nạp 13.1', ['<code>idf.py menuconfig</code> → 13.1, <code>flash monitor</code>. Hộp pin vẫn rỗng.'], {}, { thay: 'Monitor in trạng thái mỗi 3s; motor chưa chạy.', neu_khong: '' }),
        K.lapPin('Rồi lắp pin', ['Nhìn motor theo monitor. Sau 1 phút, chạm nhanh vào IC driver.'], {}, { thay: 'Quay A, dừng, quay B, dừng. Driver nguội/ấm.', neu_khong: 'Không quay: kiểm chân EN/STBY. Driver nóng: tháo pin.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Trạng thái', cot: ['Motor'], hang: [{ ten: 'IN1=1 IN2=0', du_doan: ['chiều A'] }, { ten: 'IN1=0 IN2=0', du_doan: ['dừng từ từ'] }, { ten: 'IN1=0 IN2=1', du_doan: ['chiều B'] }] }],
    bay: ['Motor lấy điện từ board: reset, hỏng cổng USB.', 'Quên GND chung: IN không có mốc, motor không theo code.', 'L298N với pin 4.5V: motor yếu hẳn.', 'Tự ráp cầu H bằng 4 transistor rời mà bật nhầm 2 con cùng nhánh: nối tắt pin.'],
    robot: ['Robot 2 bánh: 1 driver 2 kênh, mỗi bánh một kênh. Quay tại chỗ = 2 bánh ngược chiều.'],
  });
})();
