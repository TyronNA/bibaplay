// Bài 11.1 — PWM chỉnh sáng LED: mạch 9.1 (GPIO13 → 330Ω → LED → GND), code LEDC 5kHz.
(function () {
  const ESP = K.esp({ G13: '8a', GND: 'B-:3' });
  const R = K.tro('r', ['8e', '8f'], '330'), L = K.led('led', '8i', '9i'), DK = K.day('dK', '9j', 'B-:9', 'den');
  BAI.dangKy({
    id: '11.1',
    muc_tieu: 'Chân số chỉ có 0V hoặc 3.3V, nhưng bật/tắt 5000 lần/giây với tỉ lệ bật (duty) đổi dần thì mắt thấy LED sáng dần.',
    can: [...K.coBanEsp(2), K.can.tro('330'), K.can.led()],
    kien_thuc: `<p>PWM: chu kỳ 200µs (5kHz). Duty 25% = bật 50µs, tắt 150µs. Mắt (và LED) tích trung bình: độ sáng theo duty.</p>
      <p>Bộ LEDC của ESP32 tạo PWM bằng phần cứng, không tốn CPU. Code: độ phân giải 10 bit (0–1023).</p>
      <p>Mạch y hệt 9.1: dòng lúc bật vẫn ~4mA, PWM không làm dòng đỉnh lớn hơn.</p>`,
    code: 'sandbox/esp32-bai/main/bai_11_1.c',
    du_doan: '<p>LED sáng dần rồi tối dần, lặp lại mỗi ~6 giây. Mắt thấy thay đổi nhiều ở duty thấp, ít ở duty cao.</p>',
    so_do: [{ nhan: 'Xung PWM 5kHz', svg: SD.svg(320, 200, [[25, 30], [50, 90], [75, 150]].map(([d, y]) => {
      let p = `40,${y + 30}`; for (let k = 0; k < 4; k++) { const x0 = 40 + k * 60, x1 = x0 + 60 * d / 100; p += ` ${x0},${y + 30} ${x0},${y} ${x1},${y} ${x1},${y + 30} ${x0 + 60},${y + 30}`; }
      return SD.day(p) + SD.chu(290, y + 20, d + '%', 'sd-chu'); }).join('') + SD.chu(40, 196, '← 200µs →', 'sd-mo'),
      'Ba dạng xung duty 25, 50, 75 phần trăm, chu kỳ 200 micro giây'), chu: 'Chân chỉ có 0V hoặc 3.3V; độ sáng theo phần trăm thời gian bật.' }],
    sau: `<h3>Độ phân giải và tần số đổi lấy nhau</h3>
      <p>Bộ LEDC đếm xung clock (80MHz từ APB) để tạo mỗi chu kỳ PWM. Muốn N bit thì mỗi chu kỳ cần 2^N nhịp: <code>f_PWM × 2^N ≤ 80MHz</code>. 5kHz × 1024 = 5.1MHz: dư xa. Ở 5kHz tối đa được 80M/5k = 16 000 nhịp → 13 bit (8192). Ở 20kHz (trên ngưỡng nghe, cho motor) còn 12 bit.</p>
      <h3>Vì sao duty tăng đều mà mắt không thấy sáng đều</h3>
      <p>Mắt cảm nhận độ sáng gần theo lũy thừa ~1/2.2 của công suất ánh sáng. Duty 10% → 20% trông khác rất nhiều, 80% → 90% gần như không khác. Muốn "sáng dần đều" thì duty phải đi theo <code>duty = (mức/100)^2.2</code>: đó là hiệu chỉnh gamma, màn hình nào cũng làm.</p>
      <h3>Tần số bao nhiêu thì hết thấy nháy</h3>
      <p>Mắt nhìn thẳng bắt được nháy dưới ~60–90Hz; liếc mắt hoặc quay camera thì thấy tới vài trăm Hz. 5kHz là an toàn cho cả hai.</p>`,
    hoi: [
      ['PWM 1kHz, duty 30%. Mỗi chu kỳ bật bao lâu?', 'Chu kỳ 1ms → bật <b>0.3ms</b>, tắt 0.7ms.'],
      ['Muốn PWM 40kHz. Tối đa bao nhiêu bit với clock 80MHz?', '80M/40k = 2000 nhịp → <b>10 bit</b> (1024; 11 bit cần 2048 &gt; 2000).'],
      ['Muốn LED trông sáng "một nửa". Duty khoảng bao nhiêu (gamma 2.2)?', '0.5^2.2 ≈ <b>22%</b>.'],
    ],
    phan: [{
      ten: 'Phần 1 · Mạch 9.1 + code PWM',
      buoc: [
        { ten: 'Mạch 9.1', lam: ['USB rút. 330Ω 8e → 8f, LED 8i (dài) / 9i, dây đen 9j → −. <code>13</code> → 8a, <code>GND</code> → thanh −.'], board: { them: [R, L, DK, ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>, que đỏ 8c, que đen thanh −.'], board: { them: [K.dh('Ω 200k', '8c', 'B-:12', '> 0.33')] }, kiem: { thay: 'Không dưới 330Ω.', neu_khong: 'Gần 0: GPIO chạm GND. Không cắm USB.' } },
        K.camUsb('Cắm USB, nạp 11.1', ['<code>idf.py menuconfig</code> → 11.1, <code>flash monitor</code>.'], { sua: { led: { sang: true } } }, { thay: 'LED sáng dần/tối dần theo "duty …%".', neu_khong: '' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Mắt thấy', cot: ['Độ sáng'], hang: [{ ten: 'duty 10%', du_doan: ['mờ rõ'] }, { ten: 'duty 50%', du_doan: ['gần sáng hẳn'] }, { ten: 'duty 100%', du_doan: ['sáng nhất'] }] }],
    bay: ['PWM tần số thấp (< 100Hz) cho LED: thấy nháy.'],
    robot: ['Tốc độ motor (11.3, 13.2), độ sáng đèn, góc servo đều điều khiển bằng PWM.'],
  });
})();
