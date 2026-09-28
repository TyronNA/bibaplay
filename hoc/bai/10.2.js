// Bài 10.2 — Quang trở trên (thanh + → 10a), 10k dưới (10e → 10f, 10j → −), điểm giữa cột 10 → GPIO2. LED ở GPIO13 như 9.1.
(function () {
  const LDR = { id: 'ldr', loai: 'ldr', p: ['T+:10', '10a'], nhan: 'quang trở' };
  const R = K.tro('r', ['10e', '10f'], '10k'), DK = K.day('dK', '10j', 'B-:10', 'den');
  const LED = [K.tro('rl', ['16e', '16f'], '330'), K.led('led', '16i', '17i'), K.day('lk', '17j', 'B-:17', 'den')];
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3', G2: '10c', G13: '16a' });
  BAI.dangKy({
    id: '10.2',
    muc_tieu: 'Làm lại mạch 5.4 bằng phần mềm: ADC đọc quang trở, code quyết định bật LED. Ngưỡng và độ trễ chỉnh bằng số trong code.',
    can: [...K.coBanEsp(5), K.can.ldr(), K.can.tro('10k'), K.can.tro('330'), K.can.led()],
    kien_thuc: `<p>Quang trở ở <b>trên</b>, 10k ở dưới: sáng → quang trở nhỏ → áp giữa cao; tối → áp giữa thấp. Code bật LED khi dưới <code>NGUONG_MV</code>.</p>
      <p><b>Trễ</b> (hysteresis): bật dưới 1000mV nhưng chỉ tắt khi lên trên 1100mV, để LED không chập chờn khi ánh sáng đứng sát ngưỡng. Mạch transistor ở 5.4 không có thứ này.</p>
      <p>Cả 2 cầu đều nuôi bằng 3V3 → áp vào GPIO2 ≤ 3.3V.</p>`,
    code: 'sandbox/esp32-bai/main/bai_10_2.c',
    du_doan: '<p>Sáng phòng (quang trở ~10k): ≈ 1650mV → LED tắt. Che tay (≥ 100k): ≲ 300mV → LED sáng.</p>',
    so_do: [
      { nhan: 'Cầu quang trở vào ADC', svg: SD.svg(300, 200, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['3V3', 'GPIO2 ADC', 'GND']) + SD.day('122,60 200,60') + SD.ldr(200, 60, 50, '') + SD.chu(222, 90, 'quang trở', 'sd-chu')
        + SD.day('200,110 200,115') + SD.cham(200, 112) + SD.day('122,80 165,80 165,112 200,112') + SD.tro(200, 115, 50, '10k') + SD.day('200,165 200,180 140,180 140,100 122,100') + SD.mui,
        'Quang trở ở trên nối 3V3, 10k ở dưới nối GND, điểm giữa vào GPIO2'), chu: 'Sáng: quang trở nhỏ → áp giữa cao. Tối: áp giữa thấp.' },
      { nhan: 'LED ở GPIO13', svg: SD.chuoi('', [['tro', '330Ω'], ['led']], 'GPIO13 qua 330 ôm vào LED', { nguon: { ten: 'ESP32', tren: 'GPIO13', duoi: 'GND' } }), chu: 'Code bật LED khi áp ADC dưới ngưỡng.' },
    ],
    sau: `<h3>Ngưỡng mV đổi ra ngưỡng Ω</h3>
      <p><code>U = 3.3 × 10k / (R_q + 10k)</code> → <code>R_q = 10k × (3.3/U − 1)</code>. Bật ở 1000mV ↔ R_q ≈ <b>23k</b>; tắt ở 1100mV ↔ R_q ≈ <b>20k</b>. Vùng trễ là 20–23k: ánh sáng dao động trong vùng này thì LED giữ nguyên trạng thái.</p>
      <h3>Quang trở và ánh sáng</h3>
      <p>Quang trở CdS đi theo luật mũ: <code>R ≈ R₁₀ · (lux/10)^(−γ)</code>, γ ≈ 0.6–0.7, R₁₀ ≈ 10–20k với GL5528. Ánh sáng gấp 10 lần thì R giảm ~4–5 lần. Vì vậy dùng thang log khi nói về ánh sáng, và ngưỡng đặt theo kiểu "tối hơn phòng khoảng 2 lần" chứ không theo lux tuyệt đối.</p>
      <h3>Trễ là phản hồi dương trong phần mềm</h3>
      <p>Code nhớ trạng thái hiện tại và dùng ngưỡng khác nhau tuỳ trạng thái: đúng cách một Schmitt trigger làm bằng mạch. Ở robot, cùng ý tưởng dùng cho pin yếu (dừng ở 6.6V, chỉ chạy lại khi ≥ 7.0V) để khỏi bật tắt liên tục.</p>`,
    hoi: [
      ['Muốn LED bật khi quang trở vượt 40k. Đặt NGUONG_MV bao nhiêu?', '3.3 × 10/50 = <b>660mV</b>.'],
      ['Bỏ trễ, đặt bật/tắt cùng 1000mV. Chạng vạng chuyện gì xảy ra?', 'Áp dao động quanh 1000mV do nhiễu và ánh sáng chập chờn → LED nháy liên tục.'],
      ['Ánh sáng tăng 10 lần, quang trở γ = 0.6 giảm mấy lần?', '10^0.6 ≈ <b>4 lần</b>.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, nạp, chỉnh ngưỡng',
      buoc: [
        { ten: 'Cầu quang trở + 10k', lam: ['USB rút. Quang trở từ thanh + (cột 10) cắm thẳng xuống 10a. 10k vắt qua rãnh 10e → 10f, dây đen 10j → thanh −.'], board: { them: [LDR, R, DK] } },
        { ten: 'LED ở GPIO13', lam: ['330Ω 16e → 16f, LED chân dài 16i, chân ngắn 17i, dây đen 17j → thanh −.'], board: { them: LED } },
        { ten: 'Dây từ board', lam: ['<code>3V3</code> → thanh +, <code>GND</code> → thanh −, <code>2</code> → <b>10c</b>, <code>13</code> → <b>16a</b>.'], board: { them: [ESP] } },
        K.buocOmEsp('≈ quang trở + 10k (song song mốc) → không dưới ~10k khi đèn rọi thẳng.', 'Gần 0: có dây nối thẳng thanh + xuống −.', ['Đo thêm: cột 16 (GPIO13) so với − → không dưới 330Ω.']),
        K.camUsb('Cắm USB, nạp 10.2, che tay', ['<code>idf.py menuconfig</code> → 10.2, <code>flash monitor</code>. Ghi mV lúc sáng phòng và lúc che kín.'], { sua: { led: { sang: true } } }, { thay: 'Che: mV xuống thấp, LED sáng. Bỏ tay: LED tắt.', neu_khong: 'LED không bao giờ sáng: sửa NGUONG_MV cho nằm giữa 2 số vừa ghi, nạp lại.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'mV ở GPIO2', cot: ['mV', 'LED'], hang: [{ ten: 'Sáng phòng', du_doan: ['≈ 1650', 'tắt'] }, { ten: 'Che tay', du_doan: ['≲ 300', 'sáng'] }] }],
    bay: ['Đặt ngưỡng không có trễ: sát ngưỡng LED nháy liên tục.'],
    robot: ['Cảm biến ánh sáng, cảm biến dò line (hồng ngoại) của robot: cùng cách đọc ADC + ngưỡng có trễ.'],
  });
})();
