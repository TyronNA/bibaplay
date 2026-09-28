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
    so_do: [
      { nhan: 'Đồng hồ thấy trung bình', svg: SD.svg(320, 150, (() => { let p = '40,110'; for (let k = 0; k < 4; k++) { const x0 = 40 + k * 60; p += ` ${x0},110 ${x0},40 ${x0 + 30},40 ${x0 + 30},110 ${x0 + 60},110`; } return SD.day(p); })()
        + SD.day('40,75 280,75').replace('sd-net', 'sd-nong" stroke-dasharray="6 4') + SD.chu(286, 44, '3.3V', 'sd-mo') + SD.chu(286, 80, '1.65V', 'sd-xau') + SD.chu(286, 114, '0V', 'sd-mo'),
        'Xung duty 50 phần trăm và đường áp trung bình ở giữa'), chu: 'Duty 50%: đồng hồ hiện ≈ 1.63V (đỉnh ≈ 3.25V khi có tải).' },
      { nhan: 'Lọc RC = DAC thô', svg: SD.chuoi('', [['tro', '10k'], ['tu', '1µF']], 'PWM qua điện trở 10k vào tụ 1 micro fara thành áp một chiều', { nguon: { ten: 'PWM', tren: 'GPIO', duoi: 'GND' }, do: [1, 'V'] }), chu: 'Thêm RC thì ra áp một chiều thật (có gợn nhỏ), thứ đồng hồ đang làm bên trong.' },
    ],
    sau: `<h3>Trung bình của xung vuông</h3>
      <p>Xung cao U_đỉnh trong D·T, thấp 0 trong (1 − D)·T: trung bình <code>U_tb = D·U_đỉnh</code>. Đồng hồ vạn năng có mạch lọc bên trong nên hiện đúng số này. Nếu đồng hồ ghi "True RMS" và bạn chọn thang AC thì nó hiện phần xoay chiều: <code>U_đỉnh·√(D(1−D))</code> — bằng 1.63V ở duty 50%, trùng hợp với trung bình.</p>
      <h3>Tự làm DAC từ PWM</h3>
      <p>Cho xung qua lọc RC có τ ≫ chu kỳ: ra áp một chiều ≈ D·U_đỉnh, gợn còn khoảng <code>ΔU ≈ U_đỉnh·D(1−D)·T / (RC)</code>. 10k + 1µF (τ = 10ms), 5kHz (T = 0.2ms), duty 50%: ΔU ≈ 3.3 × 0.25 × 0.2/10 ≈ <b>16mV</b>. Đổi lại, áp ra chậm: đổi duty thì mất vài τ (~30ms) mới tới mức mới. Đây là cách làm âm thanh 1-bit và đặt áp chuẩn rẻ tiền.</p>`,
    hoi: [
      ['Đỉnh 3.25V, duty 40%. Đồng hồ DCV hiện bao nhiêu?', '0.4 × 3.25 = <b>1.30V</b>.'],
      ['Lọc 10k + 10µF ở 5kHz duty 50%. Gợn khoảng bao nhiêu?', 'τ = 100ms → ΔU ≈ 3.3 × 0.25 × 0.2/100 ≈ <b>1.6mV</b> (nhưng chậm gấp 10 lần).'],
      ['Vì sao không dùng áp "1.63V" này làm nguồn cho ADC tham chiếu?', 'Thật ra là xung 0/3.3V; mạch nào lấy mẫu nhanh sẽ thấy 0 hoặc 3.3V chứ không thấy 1.63V.'],
    ],
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
