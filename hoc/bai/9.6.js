// Bài 9.6 — Chân không được đụng. Đo mức chân strapping bằng dây đực–cái ra cột riêng; code 9.6 in mức và lý do reset.
(function () {
  const ESP = K.esp({ G0: '6a', G45: '10a', G46: '14a', GND: 'B-:3' });
  BAI.dangKy({
    id: '9.6',
    muc_tieu: 'Biết những chân nào của ESP32-S3 N16R8 không dùng làm GPIO thường, và thấy tận mắt chân strapping làm gì lúc khởi động.',
    can: [...K.coBanEsp(4)],
    kien_thuc: `<p>Nguồn: ESP-IDF Programming Guide (GPIO, ESP32-S3) và datasheet ESP32-S3 v2.2.</p>
      <div class="cuon"><table><thead><tr><th>Chân</th><th>Vì sao tránh</th></tr></thead><tbody>
      <tr><td>0, 3, 45, 46</td><td>Strapping: chip đọc mức lúc reset để chọn chế độ khởi động / áp flash / nguồn JTAG. GPIO0 pull-up yếu (=1), 45 và 46 pull-down (=0), 3 thả nổi. Mạch ngoài kéo sai mức lúc cấp điện → không khởi động hoặc vào chế độ nạp.</td></tr>
      <tr><td>26–32</td><td>Nối flash (và PSRAM) bên trong module.</td></tr>
      <tr><td>33–37</td><td>Bản <b>R8</b> (PSRAM octal, như N16R8) dùng thêm các chân này cho PSRAM. Board của ông là N16R8 → tránh 26–37.</td></tr>
      <tr><td>19, 20</td><td>USB D−/D+. Dùng làm GPIO là mất cổng USB native.</td></tr>
      <tr><td>43, 44</td><td>UART0 TX/RX — cổng COM dùng để nạp và in log.</td></tr>
      <tr><td>38 hoặc 48</td><td>LED RGB trên nhiều board DevKitC (tuỳ bản). Xiaozhi dùng 48.</td></tr></tbody></table></div>
      <p>ADC: chỉ ADC1 (GPIO1–10) dùng được khi bật WiFi; ADC2 (GPIO11–20) bị WiFi dùng chung.</p>`,
    code: 'sandbox/esp32-bai/main/bai_9_6.c',
    du_doan: '<p>GPIO0 ≈ 3.3V (pull-up), GPIO45/46 ≈ 0V. Giữ BOOT (GPIO0 = 0) rồi nhấn RST → chip vào chế độ chờ nạp, không chạy code.</p>',
    phan: [{
      ten: 'Phần 1 · Nhìn chân strapping',
      buoc: [
        { ten: 'Đánh dấu chân cấm trên board', lam: ['Dán băng dính đỏ nhỏ (hoặc chấm bút) cạnh các chân trong bảng trên. Đây là việc làm 1 lần, dùng cho cả Phần 2.'], hinh: SD.svg(300, 90, ['0', '3', '45', '46', '19', '20', '26–37'].map((c, i) => `<rect x="${14 + i * 40}" y="20" width="34" height="26" rx="3" class="sd-net" style="stroke:var(--bad)"/>` + SD.chu(31 + i * 40, 38, c, 'sd-xau', 'middle')).join('') + SD.chu(150, 76, 'không dùng làm GPIO thường', 'sd-mo', 'middle'), 'Các chân không dùng làm GPIO thường') },
        { ten: 'Dây đực–cái từ GPIO0, 45, 46 ra cột riêng', lam: ['USB rút. Chân <code>0</code> → 6a, <code>45</code> → 10a, <code>46</code> → 14a, <code>GND</code> → thanh −. Mỗi cột chỉ có 1 dây.'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>: từng cột 6, 10, 14 so với thanh −.'], board: { them: [K.dh('Ω 200k', '6c', 'B-:12', '> 1')] }, kiem: { thay: 'Không cột nào gần 0.', neu_khong: 'Gần 0: dây đang chạm GND.' } },
        K.camUsb('Cắm USB, nạp 9.6, đo 3 chân', ['<code>idf.py menuconfig</code> → 9.6, <code>flash monitor</code>. <code>DCV 20</code>: từng cột so với thanh −.'], { them: [K.dh('DCV 20', '6c', 'B-:12', '≈ 3.3')] }, { thay: 'GPIO0 ≈ 3.3; GPIO45, 46 ≈ 0. Monitor in cùng mức.', neu_khong: '' }),
        { ten: 'Giữ BOOT, nhấn RST', lam: ['Giữ nút BOOT, nhấn và thả RST, rồi thả BOOT. Xem monitor.', 'Nhấn RST lần nữa (không giữ BOOT) để chạy lại bình thường.'], board: {}, kiem: { thay: 'Lần giữ BOOT: monitor in "waiting for download", code không chạy. Lần sau: chạy lại.', neu_khong: '' } },
        K.rutUsb(['Rút 4 dây.']),
      ],
    }],
    bang_do: [{ ten: 'Mức lúc chạy', cot: ['GPIO0', 'GPIO45', 'GPIO46'], hang: [{ ten: 'DCV', du_doan: ['≈ 3.3', '≈ 0', '≈ 0'] }] }],
    bay: ['Nối nút/cảm biến vào GPIO0 hay GPIO46 mà nó kéo sai mức lúc cấp điện: board "chết" — thật ra là vào chế độ nạp.', 'Dùng GPIO35–37 trên bản N16R8: đụng PSRAM, chip treo hoặc lỗi ngẫu nhiên.'],
    robot: ['Mỗi lần chọn chân cho robot: đối chiếu bảng này + chân xiaozhi đang dùng (4–7, 15, 16, 39–42, 47).'],
  });
})();
