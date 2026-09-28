// Bài 8.1 — Nhận board ESP32-S3. 3 dây đực–cái từ chân 5V, GND, 3V3 ra 3 cột riêng để đo, que không chạm thẳng hàng chân.
(function () {
  const sd = SD;
  const svg = (w, h, s, nhan) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${nhan}" class="sd">${s}</svg>`;
  const hBoard = svg(340, 215, `<rect x="70" y="20" width="180" height="160" rx="6" style="fill:#1E2328"/>` + `<rect x="120" y="30" width="80" height="60" rx="3" style="fill:#B8BEC4"/>` + sd.chu(160, 64, 'WROOM-1', 'sd-chu', 'middle')
    + Array.from({ length: 11 }, (_, i) => `<rect x="76" y="${100 + i * 7}" width="6" height="4" style="fill:#E0B84C"/><rect x="238" y="${100 + i * 7}" width="6" height="4" style="fill:#E0B84C"/>`).join('')
    + `<rect x="110" y="176" width="30" height="14" rx="3" style="fill:#B8BEC4"/><rect x="180" y="176" width="30" height="14" rx="3" style="fill:#B8BEC4"/>` + sd.chu(125, 200, 'USB', 'sd-mo', 'middle') + sd.chu(195, 200, 'COM', 'sd-mo', 'middle')
    + sd.chu(20, 110, 'hàng chân', 'sd-mo') + sd.chu(20, 124, '22 × 2', 'sd-mo') + sd.chu(255, 130, 'chữ in cạnh', 'sd-mo') + sd.chu(255, 144, 'từng chân', 'sd-mo'),
  'Board ESP32-S3 44 chân: module WROOM ở trên, 2 hàng chân hai bên, 2 cổng USB-C ở dưới');
  const ESP = K.esp({ '5V': '14a', GND: '17a', '3V3': '20a' });
  BAI.dangKy({
    id: '8.1',
    muc_tieu: 'Làm quen board: đọc tên từng chân, đo điện trở nguồn khi chưa cắm (ghi làm <b>mốc</b> cho mọi bài sau), cắm USB đo 5V và 3V3, nạp thử một chương trình.',
    can: [K.can.esp(), K.can.usb(), K.can.ducCai(3), K.can.bb(), K.can.dh()],
    kien_thuc: `<p>Board nhận 5V từ USB, một ổn áp trên board hạ xuống 3.3V nuôi chip. Chân <code>5V</code> nối thẳng với USB; chân <code>3V3</code> là đầu ra ổn áp. Chip chỉ chịu tối đa <b>3.6V</b> ở mọi chân (datasheet ESP32-S3 v2.2, bảng 5-1).</p>
      <p>Hàng chân có <code>5V</code> đứng sát <code>GND</code>: que đo trượt một cái là nối tắt 5V của USB. Nên bài này (và mọi bài sau) đo qua <b>dây đực–cái</b> đưa ra từng cột riêng trên breadboard, không chạm que thẳng vào hàng chân.</p>
      <p>Board 2 cổng USB-C: cổng ghi <code>COM</code>/<code>UART</code> đi qua chip chuyển USB–serial; cổng <code>USB</code> nối thẳng USB của chip. Cổng nào cũng nạp được; chọn 1 cổng dùng cho cả giáo trình.</p>`,
    du_doan: '<p>Chưa cắm USB: 3V3–GND và 5V–GND ra vài kΩ tới MΩ, số có thể tăng dần (tụ trên board đang nạp). Cắm USB: 5V ≈ 4.8–5.1V, 3V3 ≈ 3.28–3.35V.</p>',
    phan: [
      {
        ten: 'Phần 1 · Chưa cắm USB',
        buoc: [
          { ten: 'Đọc chữ in cạnh từng chân', lam: ['Chụp ảnh 2 mặt board. Tìm: <code>3V3</code>, <code>5V</code> (hoặc <code>5VIN</code>/<code>VBUS</code>), các chân <code>GND</code>, <code>RST</code>/<code>EN</code>, và số GPIO. Đánh dấu vị trí các chân 4, 5, 6, 7, 15, 16, 41, 42, 39, 40, 47 (xiaozhi dùng).', 'Tìm 2 nút <code>BOOT</code> và <code>RST</code>.'], hinh: hBoard },
          { ten: 'Cắm 3 dây đực–cái ra breadboard', lam: ['Đầu cái vào chân <code>5V</code>, <code>GND</code>, <code>3V3</code> của board. Đầu đực vào 14a, 17a, 20a — <b>mỗi dây một cột</b>, cột đó không có gì khác.'], board: { them: [ESP] } },
          { ten: 'Đo mốc Ω', kiem_truoc: true, lam: ['<code>Ω 200k</code>. Que đỏ cột 20 (3V3), que đen cột 17 (GND); đợi số đứng rồi ghi. Rồi que đỏ cột 14 (5V), que đen cột 17.', 'Đây là <b>mốc</b>: các bài sau đo lại 3V3–GND trước khi cắm USB và so với số này.'], board: { them: [K.dh('Ω 200k', '20c', '17c', 'ghi mốc')] },
            kiem: { thay: 'Cả 2 số đều không dưới ~100Ω (thường vài kΩ trở lên).', neu_khong: 'Gần 0: board lỗi (chập nguồn) hoặc dây đực–cái chạm nhau. Không cắm USB, chụp ảnh gửi Claude.' } },
        ],
      },
      {
        ten: 'Phần 2 · Cắm USB', ke_thua: true,
        buoc: [
          K.camUsb('Cắm USB vào Mac', ['Đèn nguồn trên board sáng. Chạy <code>ls /dev/cu.usb*</code>: phải thấy 1 cổng mới (vd <code>/dev/cu.usbmodem…</code>).'], {}, { thay: 'Đèn sáng, có cổng mới.', neu_khong: 'Đèn sáng mà không có cổng: cáp chỉ sạc, không có dây data — đổi cáp. Board nóng hoặc có mùi: rút USB ngay.' }),
          { ten: 'Đo áp 5V và 3V3', lam: ['<code>DCV 20</code>. Que đen cột 17 (GND). Que đỏ cột 14 (5V), rồi cột 20 (3V3).'], board: { them: [K.dh('DCV 20', '20c', '17c', '≈ 3.30')] }, kiem: { thay: '5V ≈ 4.8–5.1; 3V3 ≈ 3.28–3.35.', neu_khong: '3V3 lệch nhiều (< 3.1 hoặc > 3.5): ghi lại, hỏi Claude trước khi nối gì vào board.' } },
          { ten: 'Nạp thử bài 9.6', lam: ['<code>source firmware/idf-env.sh</code>, <code>cd sandbox/esp32-bai</code>, <code>idf.py menuconfig</code> → Bai hoc → 9.6. Rồi <code>idf.py -p /dev/cu.usbmodem… flash monitor</code>.', 'Màn hình in lý do reset và mức 4 chân strapping mỗi giây. Thoát: <code>Ctrl+]</code>.'],
            board: {}, kiem: { thay: 'In "ly do reset: 1 = cap dien" hoặc "reset qua USB", rồi các dòng GPIO0=1 GPIO3=… GPIO45=0 GPIO46=0.', neu_khong: 'Không nạp được: giữ nút BOOT, nhấn RST, thả BOOT rồi nạp lại.' } },
          K.rutUsb(['Xong bài thì rút 3 dây đực–cái.']),
        ],
      },
    ],
    bang_do: [{ ten: 'Mốc của board', cot: ['Ω 3V3–GND', 'Ω 5V–GND', 'V 5V', 'V 3V3'], hang: [{ ten: 'Số đo', du_doan: ['> 100Ω', '> 100Ω', '4.8–5.1', '3.28–3.35'] }] }],
    bay: ['Chạm que thẳng vào hàng chân khi đang cắm USB: trượt sang chân bên cạnh là nối tắt (5V cạnh GND).', 'Cáp USB chỉ có dây sạc: board sáng đèn nhưng máy không thấy cổng.', 'Cắm 2 dây USB vào 2 cổng cùng lúc: 2 nguồn 5V đấu nhau, không cần thiết.'],
    robot: ['Mốc Ω 3V3–GND dùng mãi: mỗi lần ráp thêm gì, đo lại, số tụt mạnh là có chỗ chập trước khi cắm điện.'],
  });
})();
