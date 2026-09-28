// Bài 11.2 — Đo PWM bằng đồng hồ: mạch 11.1, code giữ duty 25/50/75%.
(function () {
  const ESP = K.esp({ G13: '8a', GND: 'B-:3' });
  const R = K.tro('r', ['8e', '8f'], '330'), L = K.led('led', '8i', '9i'), DK = K.day('dK', '9j', 'B-:9', 'den');
  BAI.dangKy({
    id: '11.2',
    muc_tieu: 'Đồng hồ DCV đặt lên chân PWM ra đúng <b>áp trung bình</b> ≈ duty × 3.3V: nó không thấy xung. Muốn thấy xung thật phải có logic analyzer / máy hiện sóng.',
    can: [...K.coBanEsp(2), K.can.tro('330'), K.can.led(), { ten: 'Logic analyzer (nếu có)', tim: 'logic analyzer', lk: 'logic-analyzer', sl: 1 }],
    kien_thuc: `<p>Đồng hồ lấy mẫu vài lần/giây và lọc: 5kHz với nó chỉ là một áp đều bằng trung bình. <code>U_tb = duty × U_đỉnh</code>. U_đỉnh ở đây ≈ 3.25V (chân có tải LED).</p>
      <p>Code giữ mỗi mức 10 giây để kịp đọc.</p>`,
    code: 'sandbox/esp32-bai/main/bai_11_2.c',
    du_doan: '<p>25% → ≈ 0.81V · 50% → ≈ 1.63V · 75% → ≈ 2.44V.</p>',
    phan: [{
      ten: 'Phần 1 · Đo 3 mức duty',
      buoc: [
        { ten: 'Mạch 11.1', lam: ['Như 11.1.'], board: { them: [R, L, DK, ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>, que đỏ 8c, que đen thanh −.'], board: { them: [K.dh('Ω 200k', '8c', 'B-:12', '> 0.33')] }, kiem: { thay: 'Không dưới 330Ω.', neu_khong: 'Gần 0: không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 11.2, đo', ['<code>idf.py menuconfig</code> → 11.2, <code>flash monitor</code>. <code>DCV 20</code>, que đỏ 8c, que đen thanh −. Ghi số ở mỗi mức monitor báo.'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', '8c', 'B-:12', '≈ 1.63')] }, { thay: 'Gần bảng dự đoán (±0.1V).', neu_khong: '' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Áp trung bình', cot: ['Dự đoán', 'Đồng hồ'], hang: [{ ten: '25%', du_doan: ['≈ 0.81', ''] }, { ten: '50%', du_doan: ['≈ 1.63', ''] }, { ten: '75%', du_doan: ['≈ 2.44', ''] }] }],
    bay: ['Kết luận "chân ra 1.6V" từ đồng hồ: thật ra là xung 0/3.3V. Nối vào mạch cần áp thật (vd tham chiếu ADC) là sai.'],
    robot: ['Đồng hồ ở chân PWM motor chỉ cho biết "trung bình": xem chương 12.4 để nhìn xung bằng logic analyzer.'],
  });
})();
