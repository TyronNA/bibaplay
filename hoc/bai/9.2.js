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
