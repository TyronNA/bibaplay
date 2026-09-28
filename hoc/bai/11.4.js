// Bài 11.4 — Còi thụ động qua S8050, nuôi bằng 3V3 của board. 3V3 → thanh + trên; dây T+:17 → 17a; 100Ω 17e → 17f.
// Còi: + 17g, − 14g. 1N4148 A 14i, K (vạch) 17i. S8050 E 12h, B 13h, C 14h; 12j → −; 1k 13e → 13f; 10k 13j → −; GPIO14 → 13a.
(function () {
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3', G14: '13a' });
  const Q = { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, DE = K.day('dE', '12j', 'B-:12', 'den');
  const RB = K.tro('rb', ['13e', '13f'], '1k'), RD = K.tro('rd', ['13j', 'B-:13'], '10k');
  const COI = { id: 'coi', loai: 'coi', p: ['17g', '14g'], nhan: 'còi' };
  const D = { id: 'd', loai: 'diode', kieu: '4148', a: '14i', k: '17i', nhan: '1N4148' };
  const R100 = K.tro('r100', ['17e', '17f'], '100'), D17 = K.day('d17', 'T+:17', '17a', 'do');
  const sd = SD;
  const soDo = sd.svg(340, 250, sd.khoi(20, 90, 90, 'ESP32-S3', [], ['GPIO14', 'GND']) + sd.day('20,30 300,30') + sd.chu(24, 22, '3V3 (board)', 'sd-pos')
    + sd.day('122,110 130,110 130,160') + sd.troNgang(130, 160, 50, '1k') + sd.day('180,160 190,160') + sd.cham(186, 160) + sd.day('186,160 186,170') + sd.tro(186, 170, 40) + sd.chu(172, 196, '10k', 'sd-chu', 'end') + sd.day('186,210 186,226')
    + sd.npn(220, 160) + sd.day('230,190 230,226') + sd.day('230,30 230,34') + sd.tro(230, 34, 36, '100Ω') + sd.day('230,70 230,76') + sd.coi(230, 76, 44, '') + sd.day('230,120 230,130')
    + sd.cham(230, 74) + sd.cham(230, 124) + sd.day('230,74 280,74 280,80') + sd.diodeLen(280, 80, 40, '1N4148') + sd.day('280,120 280,124 230,124')
    + sd.day('122,130 140,130 140,226 230,226'),
    'GPIO14 qua 1k vào B của S8050; còi nối tiếp 100 ôm từ 3V3 xuống chân C; diode 1N4148 ngược song song còi');

  BAI.dangKy({
    id: '11.4',
    muc_tieu: 'Phát âm thanh bằng PWM: còi thụ động kêu đúng tần số xung đưa vào. Lần này giữ duty 50% và đổi tần số — tần số là nốt nhạc.',
    can: [...K.coBanEsp(3), { ten: 'Còi thụ động (passive buzzer)', tim: 'buzzer', lk: 'coi-chip', sl: 1 }, K.can.npn(), K.can.d4148(), K.can.tro('1k'), K.can.tro('10k'), K.can.tro('100')],
    code: 'sandbox/esp32-bai/main/bai_11_4.c',
    kien_thuc: `
      <p>Còi thụ động là một màng kim loại + cuộn dây (hoặc gốm áp điện): mỗi xung kéo màng một cái. Xung 523 lần/giây → màng rung 523Hz → nốt Đô. Chương 11 trước đổi <b>duty</b> để đổi độ sáng; ở đây giữ duty 50% và đổi <b>tần số</b> bằng <code>ledc_set_freq</code>.</p>
      <p>Còi từ tính có cuộn dây chỉ vài chục Ω: không nối thẳng GPIO. Qua S8050 như bài 5.3, thêm <b>100Ω nối tiếp</b> để dòng đỉnh ≤ <code>3.3/(100 + 16) ≈ 28mA</code> — board 3V3 gánh dễ. Chân B: GPIO qua 1k → Ib ≈ 2.6mA, dư để bão hoà.</p>
      <p>Còi là cuộn dây: ngắt đột ngột sinh xung ngược như motor (bài 7.4) — hàng nghìn lần mỗi giây. 1N4148 ngược song song còi (<b>vạch về phía 3V3</b>) cho xung đó chạy vòng.</p>
      <p>Mua nhầm còi <b>chủ động</b> (đáy kín, có tem): nó tự kêu một tần số khi có điện, PWM chỉ làm nó kêu rè rè. Thử bằng pin: chủ động kêu liên tục, thụ động chỉ "tách".</p>`,
    so_do: [{ nhan: 'Còi qua transistor', svg: soDo, chu: 'Vạch 1N4148 về phía 3V3. Mọi thứ ăn 3V3 của board, không cần hộp pin.' }],
    du_doan: '<p>Gam Đô 523 → 1047Hz, mỗi nốt 0.4s. Rồi 1000, 2000, 2700, 4000Hz: thường to nhất ở 2–3kHz (cộng hưởng của màng). Cuối cùng một tiếng quét lên từ 500 tới 4000Hz. Chạm transistor: nguội.</p>',
    sau: `<h3>Nốt nhạc là tần số theo cấp số nhân</h3>
      <p>Lên một quãng tám = tần số gấp đôi. Chia quãng tám thành 12 nửa cung đều theo tỉ lệ: mỗi nửa cung gấp <code>2^(1/12) ≈ 1.0595</code> lần. La4 = 440Hz; Đô5 = 440 × 2^(3/12) ≈ 523.3Hz. Tai nghe cao độ theo log của tần số — như mắt nghe độ sáng theo log (bài 11.1).</p>
      <h3>Tần số và độ phân giải</h3>
      <p>LEDC 10 bit ở 4kHz cần 4k × 1024 ≈ 4MHz, dư so với clock 80MHz. Tần số thật = 80MHz / (bộ chia × 1024) nên không đúng tuyệt đối từng Hz: sai vài phần nghìn — tai không nghe ra.</p>
      <h3>Vì sao còi kêu to ở 2–3kHz</h3>
      <p>Màng có tần số cộng hưởng riêng (datasheet còi 12mm thường ghi 2.3–2.7kHz). Ở đó mỗi xung đẩy màng đúng nhịp nó muốn rung, biên độ dồn lên. Xa tần số đó, cùng dòng mà nhỏ hơn nhiều. Loa (bài 12.3) màng mềm, dải rộng hơn — vì thế phát giọng nói được, còn còi chỉ bíp.</p>`,
    hoi: [
      ['La5 là bao nhiêu Hz (La4 = 440Hz)?', '<b>880Hz</b> (lên 1 quãng tám = gấp đôi).'],
      ['Vì sao cần 100Ω nối tiếp còi?', 'Cuộn còi chỉ ~16Ω: không có 100Ω thì dòng đỉnh ~200mA từ 3V3, quá sức ổn áp board và transistor nóng.'],
      ['Duty 50% và 10% cùng tần số: khác gì?', 'Cùng nốt, nhưng duty 10% nhỏ tiếng và "mỏng" hơn (ít năng lượng mỗi chu kỳ, nhiều hoạ âm).'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp và phát nốt', cot: 24,
      buoc: [
        { ten: 'Transistor, 1k, 10k', lam: ['USB rút. S8050 E 12h, B 13h, C 14h (theo 5.1). Dây đen <b>12j → thanh −</b>. 1k vắt qua rãnh <b>13e → 13f</b>. 10k từ <b>13j</b> xuống thanh −.'], board: { them: [Q, DE, RB, RD] } },
        { ten: 'Còi, diode, 100Ω', lam: ['Còi: chân <b>+ (dài) 17g</b>, chân − 14g.', '1N4148: anode 14i, <b>vạch 17i</b>.', 'Dây đỏ thanh + (cột 17) → <b>17a</b>. 100Ω (' + K.tenVong('100') + ') vắt qua rãnh <b>17e → 17f</b>.'], board: { them: [COI, D, R100, D17] } },
        { ten: 'Dây từ board', lam: ['<code>3V3</code> → thanh + trên (cột 3). <code>GND</code> → thanh − dưới (cột 3). <code>14</code> → <b>13a</b>.'], board: { them: [ESP] } },
        K.buocOmEsp(null, null, ['Còi chỉ nối 3V3 qua 100Ω tới chân C; transistor tắt nên không có đường xuống GND: số phải gần mốc.']),
        K.camUsb('Cắm USB, nạp 11.4', ['<code>idf.py menuconfig</code> → 11.4, <code>flash monitor</code>. Nghe gam Đô, các tần số thử và tiếng quét. Sau 1 vòng, chạm nhanh vào transistor.'], {},
          { thay: 'Nghe rõ 8 nốt tăng dần; to nhất quanh 2–3kHz. Transistor nguội.', neu_khong: 'Chỉ rè rè đều một tiếng: còi chủ động. Im lặng: kiểm chân C, còi, 100Ω; dây 13a đúng chân 14 chưa.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Nghe to nhất', cot: ['To / nhỏ'], hang: [{ ten: '523 Hz', du_doan: ['nhỏ'] }, { ten: '1000 Hz', du_doan: [''] }, { ten: '2000 Hz', du_doan: [''] }, { ten: '2700 Hz', du_doan: ['to'] }, { ten: '4000 Hz', du_doan: [''] }] }],
    bay: ['Còi nối thẳng GPIO: cuộn dây vài chục Ω kéo quá 20mA.', 'Thiếu diode: xung ngược mỗi chu kỳ đập vào chân C.', 'Còi chủ động + PWM: kêu rè, không ra nốt.'],
    robot: ['Robot kêu bíp khi pin yếu, khi va chạm, khi mất WiFi — thông báo không cần màn hình.', 'Xiaozhi phát giọng qua ampli I2S (12.3); còi hợp cho báo lỗi đơn giản khi chưa có ampli.'],
  });
})();
