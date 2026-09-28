// Bài 5.3 — Công tắc. Dây vàng T+ → 13a là "nút bật". 4.7k: 13e → 13f → chân B (13h). 100k kéo B xuống −. LED + 220 ở chân C.
(function () {
  const SW = K.day('sw', 'T+:13', '13a', 'vang'), RB = K.tro('rb', ['13e', '13f'], '4.7k'), RD = K.tro('rd', ['13j', 'B-:13'], '100k');
  const Q = { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, DE = K.day('dE', '12j', 'B-:12', 'den');
  const L = K.led('led', '15g', '14g', 'do', { nhan: '' }), RC = K.tro('rc', ['15e', '15f'], '220'), DC = K.day('dC', 'T+:15', '15a', 'do');
  BAI.dangKy({
    id: '5.3',
    poster: [25, 26],
    muc_tieu: 'Dùng transistor như công tắc: tính điện trở chân B sao cho transistor bão hoà chắc chắn, đo áp C–E khi đóng.',
    can: [K.can.npn(), K.can.tro('4.7k'), K.can.tro('100k'), K.can.tro('220'), K.can.led(), ...K.coBan(5)],
    kien_thuc: `<p>Tải: LED + 220Ω → Ic ≈ 12.6mA. hFE nhỏ nhất ~100 → cần Ib ≥ 0.13mA; dư 4–5 lần cho chắc → ~0.6mA → <code>R_B = (4.78 − 0.7)/0.6mA ≈ 6.8k</code>. Dùng <b>4.7k</b> (Ib ≈ 0.87mA).</p>
      <p>100k từ B xuống −: khi rút dây bật, B không thả nổi mà bị kéo về 0 → tắt chắc chắn (poster bài 26 thiếu con này).</p>
      <p>Dây vàng <b>thanh + → 13a</b> là nút bật: bài này rút/cắm đúng dây đó khi có pin. 4.7k luôn đứng giữa nên cắm vào không nối tắt gì.</p>`,
    du_doan: '<p>Bật: U_CE ≈ 0.05–0.2V, U_220 ≈ 2.7V (Ic ≈ 12mA). Tắt: LED tắt, U_CE cỡ 3–3.5V — không bằng áp pin, vì dòng rất nhỏ của đồng hồ đi qua LED và LED vẫn giữ lại ~1.3–1.6V.</p>',
    so_do: [{ nhan: 'Transistor làm công tắc', svg: SD.svg(320, 250, SD.pin(40, 120, '4.78V') + SD.day('40,120 40,30 240,30') + SD.cham(90, 30)
      + SD.day('90,30 90,80') + '<circle cx="90" cy="80" r="3" class="sd-cham"/><circle cx="90" cy="102" r="3" class="sd-cham"/>' + SD.day('92,82 100,98') + SD.chu(98, 94, 'dây bật', 'sd-mo')
      + SD.day('90,102 90,160') + SD.troNgang(90, 160, 60, '4.7k') + SD.day('150,160 170,160') + SD.cham(160, 160) + SD.tro(160, 160, 50) + SD.chu(128, 196, '100k', 'sd-chu', 'end') + SD.day('160,210 160,225')
      + SD.day('210,30 210,34') + SD.tro(210, 34, 44, '220Ω') + SD.day('210,78 210,82') + SD.led(210, 82) + SD.day('210,122 210,130') + SD.npn(200, 160) + SD.day('210,190 210,225 40,225 40,130'),
      'NPN: tải LED và 220 ôm ở chân C, chân B qua 4.7k tới dây bật, 100k kéo B xuống cực âm'), chu: 'Dây bật cắm: Ib ≈ 0.87mA, dư gấp ~7 lần so với cần. 100k giữ B về 0 khi rút dây.' }],
    sau: `<h3>Bão hoà "ép buộc"</h3>
      <p>Muốn transistor chắc chắn bão hoà, chọn Ib sao cho <code>Ic_tải / Ib</code> ≈ 10–20 (gọi là β ép buộc), nhỏ hơn hFE nhỏ nhất nhiều lần. Ở đây 12.6mA / 0.87mA ≈ 14: con hFE 100 hay 300 đều bão hoà như nhau. Mạch không còn phụ thuộc hFE.</p>
      <h3>Vì sao chế độ công tắc hiệu quả</h3>
      <p>Công suất transistor đốt: <code>P = U_CE · Ic</code>. Bão hoà: 0.1V × 12.6mA ≈ 1.3mW. Nếu để lưng chừng (U_CE = 1.5V, Ic = 6mA): 9mW — gấp 7 lần mà LED chỉ sáng nửa. Tắt hẳn: Ic ≈ 0 → P ≈ 0. Công tắc tốt nhất là chỉ ở 2 đầu: hoàn toàn dẫn hoặc hoàn toàn tắt. PWM (chương 11) dựa đúng vào điều này.</p>
      <h3>Tính R_B cho tải khác</h3>
      <p>Từ GPIO 3.3V, tải 100mA, hFE nhỏ nhất 100, dư 5 lần: <code>Ib = 5mA</code>, <code>R_B = (3.3 − 0.7)/5mA ≈ 520Ω</code> → 470Ω. 5mA vẫn dưới 20mA/chân. Tải lớn hơn nữa thì Ib vượt sức GPIO → dùng MOSFET (bài 13.4).</p>`,
    hoi: [
      ['Tải 50mA, hFE_min 100, điều khiển từ 4.78V, muốn dư 5 lần. Chọn R_B?', 'Ib = 2.5mA; R_B = (4.78 − 0.7)/2.5mA ≈ 1.6k → dùng <b>1.5k</b>.'],
      ['Bỏ 100k kéo xuống thì khi rút dây bật chuyện gì có thể xảy ra?', 'Chân B thả nổi, bắt nhiễu và dòng rò → LED le lói hoặc chập chờn; transistor không tắt chắc.'],
      ['U_CE = 0.1V, Ic = 12.6mA. Transistor đốt bao nhiêu công suất?', '≈ <b>1.3mW</b> — gần như nguội.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp và bật/tắt',
      buoc: [
        K.buocPin(),
        { ten: 'Transistor, LED, 220Ω', lam: ['S8050: E 12h, B 13h, C 14h (theo kết quả 5.1). Dây đen 12j → thanh −. LED: chân ngắn 14g, chân dài 15g. 220Ω 15e → 15f, dây đỏ thanh + → 15a.'], board: { them: [Q, DE, L, RC, DC] } },
        { ten: 'Điện trở chân B và kéo xuống', lam: ['4.7k (' + K.tenVong('4.7k') + ') vắt qua rãnh 13e → 13f. 100k từ <b>13j</b> xuống thanh −. Chưa cắm dây bật.'], board: { them: [RB, RD] } },
        K.buocOm('Ω 200k', '1', '1 (OL): không có đường nào từ + xuống − khi transistor tắt.', 'Có số nhỏ: LED hoặc transistor cắm sai, hoặc C–E đang chạm nhau.'),
        { ten: 'Cắm dây bật, đo lại', kiem_truoc: true, lam: ['Hộp vẫn rỗng. Cắm dây vàng thanh + → 13a. Đo lại 2 tiếp điểm hộp pin.'], board: { them: [SW, K.dh('Ω 200k', 'pin+', 'pin-', '> 4.7')] }, kiem: { thay: 'Lớn hơn 4.7k (4.7k + 100k, có thể thấp hơn chút vì B–E dẫn nhẹ).', neu_khong: 'Dưới 4.7k: dây bật đang đi tắt qua 4.7k. Không lắp pin.' } },
        K.lapPin('Lắp pin: LED sáng, đo U_CE và U_220', ['<code>DCV 20</code>. Que đỏ C (14h), que đen E (12h). Rồi 2 chân 220Ω. Rồi 2 chân 4.7k (tính Ib).'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', 'q.C', 'q.E', '≈ 0.1')] }, { thay: 'U_CE ≤ 0.2V: bão hoà. Transistor nguội.', neu_khong: 'U_CE > 0.5V hoặc transistor ấm: chưa bão hoà, kiểm giá trị 4.7k.' }),
        { ten: 'Rút dây bật', lam: ['Rút đầu dây vàng ở thanh +.'], board: { bo: ['sw'], sua: { led: { sang: false } }, them: [K.dh('DCV 20', 'q.C', 'q.E', '≈ 3')] }, kiem: { thay: 'LED tắt ngay; U_CE lớn.', neu_khong: 'LED vẫn le lói: 100k kéo xuống chưa cắm đúng.' } },
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Bật/tắt', cot: ['U_CE', 'U_220 → Ic', 'U_4.7k → Ib', 'Ic/Ib'], hang: [{ ten: 'Bật', du_doan: ['≈ 0.1', '≈ 2.7 → 12 mA', '≈ 4.0 → 0.85 mA', '≈ 14 (bão hoà, < hFE)'] }, { ten: 'Tắt', du_doan: ['lớn', '≈ 0', '0', ''] }] }],
    bay: ['Dây bật cắm thẳng vào chân B (bỏ qua 4.7k): B nhận 4.78V trực tiếp, dòng B hàng trăm mA, transistor chết.', 'Thiếu 100k kéo xuống: rút dây bật mà LED vẫn le lói hoặc chập chờn.'],
    robot: ['GPIO ESP32 ra tối đa ~20mA ở 3.3V: tải lớn hơn (motor, relay, dải LED) luôn qua transistor/driver như bài này (chương 11, 13).'],
  });
})();
