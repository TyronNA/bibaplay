// Bài 9.2 — Dòng mỗi chân: GPIO13 luôn 1 (dùng code 9.1, đo lúc LED sáng). Đổi 330Ω → 150Ω, thấy áp chân tụt khi kéo nhiều dòng.
(function () {
  const ESP = K.esp({ G13: '8a', GND: 'B-:3' });
  const R = gt => K.tro('r', ['8e', '8f'], gt), L = K.led('led', '8i', '9i'), DK = K.day('dK', '9j', 'B-:9', 'den');
  BAI.dangKy({
    id: '9.2',
    muc_tieu: 'Tra datasheet dòng mỗi chân, tính điện trở nhỏ nhất cho LED, và đo "điện trở trong" của chân GPIO giống như nội trở pin (bài 1.6).',
    can: [...K.coBanEsp(2), K.can.tro('330'), K.can.tro('220'), K.can.tro('150'), K.can.led()],
    kien_thuc: `<p>Datasheet ESP32-S3 v2.2: mức kéo dòng mặc định mỗi chân <b>20mA</b> (GPIO17/18: 10mA; GPIO19/20: 40mA). Ở mức mạnh nhất (<code>GPIO_DRIVE_CAP_3</code>) chân ra được ~40mA khi còn ≥ 2.64V. Tổng dòng mọi chân ≤ 1500mA (mức tuyệt đối). Mức vào: ≥ 2.48V là 1, ≤ 0.83V là 0.</p>
      <p>Điện trở nhỏ nhất cho LED đỏ ở 20mA: <code>(3.3 − 1.9)/0.020 = 70Ω</code>. Dùng ≥ 150Ω cho dư. Motor, loa, relay <b>không bao giờ</b> nối thẳng GPIO (bài 5.3, 11.3).</p>
      <p>Chân GPIO như một nguồn 3.3V nối tiếp điện trở trong vài chục Ω: kéo dòng thì áp ở chân tụt. <code>r = (U_không_tải − U_có_tải) / I</code>.</p>
      <p>Kit 30 giá trị thường có 150Ω; không có thì dùng 220Ω.</p>`,
    code: 'sandbox/esp32-bai/main/bai_9_1.c',
    du_doan: '<p>330Ω: I ≈ 4mA, U chân ≈ 3.25V. 150Ω: I ≈ 9mA, U chân tụt thêm ~0.1–0.2V → r cỡ 20–40Ω (chưa kiểm, đo mới biết).</p>',
    so_do: [{ nhan: 'Mô hình chân GPIO', svg: SD.chuoi('', [['tro', 'r (trong chip)'], ['tro', 'R'], ['led']], 'Chân GPIO như nguồn 3.3V nối tiếp điện trở trong r', { nguon: { ten: '3.3V', tren: 'GPIO', duoi: 'GND' }, do: [1, 'V'] }), chu: 'R = 150Ω hoặc 330Ω. Giống nội trở pin ở bài 1.6: kéo dòng thì áp ở chân tụt I·r.' }],
    sau: `<h3>Tính r từ 2 lần đo</h3>
      <p>Như bài 1.6: <code>r = (U_chân,1 − U_chân,2) / (I_2 − I_1)</code>. Ví dụ 330Ω: U_chân 3.25V, I = 4.1mA; 150Ω: U_chân 3.12V, I = 8.1mA → r ≈ 0.13V / 4mA ≈ <b>33Ω</b>. Số của bạn phụ thuộc mức <code>drive_cap</code> đặt trong code (mức cao hơn = r nhỏ hơn).</p>
      <h3>Giới hạn tổng</h3>
      <p>20mA mỗi chân không có nghĩa là 40 chân × 20mA. Datasheet giới hạn tổng dòng mọi chân (1500mA tuyệt đối), và các chân chia nhau vài nhánh nguồn bên trong chip. Quy tắc tay: LED báo hiệu 2–5mA mỗi con là đủ sáng, cộng lại vẫn dư xa.</p>
      <h3>Chọn điện trở theo độ sáng cần, không theo mức tối đa</h3>
      <p>Mắt thấy độ sáng theo kiểu log: 5mA và 15mA khác nhau ít hơn ta nghĩ. Chạy LED ở 1/4 mức tối đa là LED bền, chân GPIO mát, và pin robot đỡ tốn.</p>`,
    hoi: [
      ['Không tải chân ra 3.30V; tải 10mA chân còn 3.05V. r bằng bao nhiêu?', '0.25/0.010 = <b>25Ω</b>.'],
      ['Điện trở nhỏ nhất cho LED đỏ ở 15mA từ GPIO (bỏ qua r)?', '(3.3 − 1.9)/0.015 ≈ <b>93Ω</b> → dùng 100Ω (hoặc lớn hơn cho dư).'],
      ['Tính cả r = 30Ω, LED đỏ với 100Ω: dòng thật khoảng bao nhiêu?', '(3.3 − 1.9)/(100 + 30) ≈ <b>10.8mA</b>.'],
    ],
    phan: [{
      ten: 'Phần 1 · Đo áp chân theo tải',
      buoc: [
        { ten: 'Mạch 9.1 với 330Ω', lam: ['Như bài 9.1: 330Ω 8e → 8f, LED 8i/9i, dây đen 9j → −, GPIO13 → 8a, GND → thanh −.'], board: { them: [R('330'), L, DK, ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>, que đỏ 8c, que đen thanh −.'], board: { them: [K.dh('Ω 200k', '8c', 'B-:12', '> 0.33')] }, kiem: { thay: 'Không dưới 330Ω.', neu_khong: 'Gần 0: GPIO chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB (code 9.1 đã nạp), đo lúc LED sáng', ['Đo U chân GPIO (8c so với −) và U_330, cả 2 lúc LED sáng.'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', '8c', 'B-:12', '≈ 3.25')] }, { thay: 'Ghi 2 số vào bảng.', neu_khong: '' }),
        K.rutUsb(['Đổi 330Ω thành <b>150Ω</b> (nâu-lục-nâu).'], { bo: ['r'], them: [R('150')] }),
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 2k</code>, que đỏ 8c, que đen thanh −.'], board: { them: [K.dh('Ω 2k', '8c', 'B-:12', '> 150')] }, kiem: { thay: 'Không dưới 150Ω.', neu_khong: 'Nhỏ hơn: cắm nhầm con 15Ω hoặc nối tắt. Không cắm USB.' } },
        K.camUsb('Cắm USB, đo lại', ['Như trên.'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', '8c', 'B-:12', '≈ 3.1')] }, { thay: 'U chân thấp hơn lúc 330Ω; LED sáng hơn.', neu_khong: '' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Điện trở trong của chân', cot: ['U chân', 'U_R', 'I = U_R/R'], hang: [{ ten: '330Ω', du_doan: ['≈ 3.25', '≈ 1.35', '≈ 4.1 mA'] }, { ten: '150Ω', du_doan: ['≈ 3.1', '≈ 1.2', '≈ 8 mA'] }, { ten: 'r = ΔU/ΔI', du_doan: ['', '', '20–40 Ω ?'] }] }],
    bay: ['Nghĩ "GPIO ra 3.3V" là một nguồn cứng: kéo dòng là tụt áp, và vượt 20mA là hại chân.', 'Nối nhiều LED vào nhiều chân cùng lúc mà không cộng tổng dòng.'],
    robot: ['Mọi tải > vài mA từ GPIO → transistor/driver. Tính trước, đừng thử.'],
  });
})();
