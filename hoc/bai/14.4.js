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
    so_do: [{ nhan: 'Bên trong module TCRT5000', svg: SD.svg(360, 220, SD.day('20,30 330,30') + SD.chu(24, 22, 'VCC 3V3', 'sd-pos') + SD.day('60,30 60,40') + SD.tro(60, 40, 40, 'R') + SD.day('60,80 60,86') + SD.led(60, 86) + SD.chu(20, 140, 'hồng ngoại', 'sd-mo') + SD.day('60,126 60,190')
      + SD.day('170,30 170,40') + SD.tro(170, 40, 40, 'R') + SD.day('170,80 170,100') + SD.cham(170, 90) + SD.npn(160, 130) + SD.day('170,160 170,190') + SD.chu(186, 184, 'phototransistor', 'sd-mo')
      + SD.day('170,90 195,90 195,142 230,142') + SD.chu(198, 84, 'AO', 'sd-chu') + SD.day('205,118 230,118') + SD.chu(206, 112, 'ngưỡng', 'sd-mo') + SD.opamp(250, 130, 'LM393') + SD.day('290,130 330,130') + SD.chu(334, 134, 'DO', 'sd-chu')
      + SD.day('20,190 330,190') + SD.chu(24, 206, 'GND', 'sd-mo'),
      'LED hồng ngoại qua điện trở; phototransistor kéo điểm AO xuống khi thấy phản xạ; LM393 so AO với ngưỡng ra DO'), chu: 'Phản xạ mạnh → phototransistor dẫn → AO thấp → DO = 0. Giá trị R tuỳ module.' }],
    sau: `<h3>AO là một cầu phân áp</h3>
      <p>Phototransistor như một điện trở đổi theo ánh sáng (bài 2.4, nhưng nhanh hơn quang trở hàng nghìn lần). Nối với R lên VCC: AO = VCC − I_quang·R. Phản xạ mạnh → dòng lớn → AO thấp. Không có gì (mép vực) → dòng ~0 → AO ≈ VCC. Chỉ đọc AO là biết cả "sàn đang tối dần" chứ không chỉ có/không.</p>
      <h3>Vì sao phải gắn sát sàn</h3>
      <p>LED và phototransistor đặt cạnh nhau, chùm sáng chỉ chồng lên nhau ở một vùng hẹp phía trước: gần quá thì chùm chưa giao, xa quá thì ánh sáng loang và yếu theo bình phương khoảng cách. Datasheet Vishay: mạnh nhất quanh 2.5mm. Robot hút bụi gắn cảm biến chống rơi cách sàn chỉ vài mm vì lý do này.</p>`,
    hoi: [
      ['AO đọc được 2.9V, 3.1V, 3.2V khi dịch dần ra mép bàn. Nghĩa là gì?', 'Phản xạ yếu dần: sắp tới mép. Robot có thể giảm tốc trước khi DO báo hẳn.'],
      ['Thảm đen dưới robot bị coi là mép vực. Chữa bằng cách nào?', 'Đặt ngưỡng dựa trên AO với biên cho thảm tối, hoặc kết hợp thêm cảm biến khác (va chạm, encoder thấy bánh quay tự do).'],
      ['Vì sao cấp 5V cho module rồi nối AO vào ADC là sai?', 'AO lên tới VCC = 5V, vượt 3.6V chân chịu và vượt dải ADC.'],
    ],
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
