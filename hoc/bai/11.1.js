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
