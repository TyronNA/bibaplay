// Bài 14.4 — TCRT5000. Module VCC 10a, GND 11a, DO 12a, AO 13a (đọc chữ in). 3V3 → 10c, GND → 11c.
// Đo DO/AO trước; rồi GPIO21 → 12c (DO), GPIO2 → 13c (AO, ADC1 kênh 1).
(function () {
  const TC = { id: 'tc', loai: 'mod', ten: 'TCRT5000', mau: 'xanhduong', chan: [['VCC', '10a'], ['GND', '11a'], ['DO', '12a'], ['AO', '13a']] };
  const ESP0 = K.esp({ GND: '11c', '3V3': '10c' });
  const ESP1 = K.esp({ GND: '11c', '3V3': '10c', G21: '12c', G2: '13c' });
  BAI.dangKy({
    id: '14.4',
    muc_tieu: 'Robot hút bụi không lăn xuống cầu thang nhờ mắt hồng ngoại úp xuống sàn: còn thấy sàn phản xạ thì đi tiếp, mất phản xạ = mép vực. Đọc cả ngõ số (DO) lẫn ngõ tương tự (AO) bằng ADC.',
    can: [...K.coBanEsp(4), K.can.tcrt(), { ten: 'Tờ giấy trắng + 1 vật màu đen', tim: 'giấy', sl: 1 }],
    kien_thuc: `<p>TCRT5000 (Vishay) gồm 1 LED hồng ngoại và 1 phototransistor đặt cạnh nhau, có lọc ánh sáng ngày. Mặt phản xạ càng gần/càng sáng → phototransistor dẫn càng mạnh. Tầm tốt nhất ~<b>2.5mm</b>, dùng được 0.2–15mm — vì vậy phải gắn sát sàn.</p>
      <p>Module có LM393 như FC-51: <b>DO</b> = 0 khi thấy mặt phản xạ (ngưỡng chỉnh bằng biến trở), <b>AO</b> = áp thay đổi liên tục. Cả 2 lên tới VCC → cấp <b>3V3</b>.</p>
      <p>AO đọc bằng ADC (chương 10): GPIO2 = ADC1 kênh 1. ADC chỉ đúng tới ~2.9V; trên đó số đứng ở 4095 — với bài này không sao, chỉ cần phân biệt "thấy sàn" và "không thấy".</p>
      <p>Robot thật dùng 3–4 cảm biến kiểu này ở mép dưới đáy. Sàn đen, thảm tối phản xạ yếu → bị coi như mép vực: robot hút bụi rẻ tiền hay "sợ" thảm đen vì đúng lý do này.</p>`,
    code: 'sandbox/esp32-bai/main/bai_14_4.c',
    du_doan: '<p>Giấy trắng sát mắt (~5mm): DO = 0, AO thấp. Không có gì (như mép vực): DO = 1, AO cao (≈ VCC). Vật đen ở 5mm: gần giống không có gì.</p>',
    phan: [{
      ten: 'Phần 1 · Nguồn, đo DO/AO, rồi nối GPIO',
      buoc: [
        { ten: 'Cắm module, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm 4 chân vào 10a–13a, mắt cảm biến hướng lên trên. Đọc chữ in: cột 10 = ?, 11 = ?, 12 = ?, 13 = ?'], board: { them: [TC] },
          kiem: { thay: 'Biết chắc cột VCC, GND, DO, AO.', neu_khong: 'Thứ tự khác: đổi dây các bước sau cho khớp chữ in.' } },
        { ten: 'Chỉ 2 dây nguồn', lam: ['<code>3V3</code> → cột VCC (10c). <code>GND</code> → cột GND (11c).'], board: { them: [ESP0] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 10d, que đen 11d.'], board: { them: [K.dh('Ω 200k', '10d', '11d', '> 0.1')] },
          kiem: { thay: 'Không dưới ~100Ω.', neu_khong: 'Gần 0: VCC chạm GND. Không cắm USB.' } },
        K.doOut('Đo DO và AO', ['Que đen 11d. Que đỏ 12d (DO), rồi 13d (AO). Mỗi chân đo 2 lần: không có gì trên mắt, và tờ giấy trắng cách mắt ~5mm.'], '12d', '11d', '≈ 3.3 / 0',
          'DO: không giấy ≈ 3.3V, có giấy < 0.5V. AO: không giấy cao, có giấy thấp hẳn. Cả 2 không quá 3.4V.'),
        K.rutUsb(),
        { ten: 'Nối DO → GPIO21, AO → GPIO2', lam: ['USB đã rút. Chân <code>21</code> → <b>12c</b>. Chân <code>2</code> → <b>13c</b>.'], board: { bo: ['esp'], them: [ESP1] } },
        K.camUsb('Cắm USB, nạp 14.4', ['<code>idf.py menuconfig</code> → 14.4, <code>flash monitor</code>. Thử: giấy trắng 5mm, giấy trắng 3cm, vật đen 5mm, không có gì.'], {}, { thay: 'Giấy 5mm: "SAN", AO thấp. Giấy 3cm và vật đen: gần như "MEP VUC".', neu_khong: 'DO không đổi mà AO đổi: vặn biến trở ngưỡng. AO luôn 4095: dây GPIO2 ở cột VCC.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Đo bằng code', cot: ['DO', 'AO (mV)'], hang: [{ ten: 'Giấy trắng 5mm', du_doan: ['0', 'thấp'] }, { ten: 'Giấy trắng 3cm', du_doan: ['1?', 'cao hơn'] }, { ten: 'Vật đen 5mm', du_doan: ['1?', 'cao'] }, { ten: 'Không có gì', du_doan: ['1', '≈ 2900+'] }] }],
    bay: ['Gắn cảm biến cao hơn 1.5cm trên sàn: luôn báo mép vực.', 'Cấp 5V rồi nối AO vào ADC: quá 3.6V chân chịu.', 'Chỉ dùng DO: không biết "yếu dần" — AO cho thấy sàn đang tối dần trước khi mất hẳn.'],
    robot: ['Robot hút bụi: 3–4 mắt chống rơi dưới đáy, mất sàn ở mắt nào thì lùi và quay tránh phía đó.'],
  });
})();
