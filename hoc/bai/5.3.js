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
    du_doan: '<p>Bật: U_CE ≈ 0.05–0.2V, U_220 ≈ 2.7V (Ic ≈ 12mA). Tắt: U_CE ≈ áp pin trừ áp LED lúc không dẫn, LED tắt.</p>',
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
