// Bài 5.4 — Đèn tự bật khi tối. Trên: biến trở (A 3d, W 5d, B bỏ trống) nối tiếp 47k (5b → 10b). Dưới: quang trở 10j → thanh −.
// Điểm giữa cột 10 → dây vàng 10e → 10f → chân B (10h). Q: E 9h, B 10h, C 11h. LED + 220Ω ở C.
(function () {
  const BT = { id: 'bt', loai: 'bientro', A: '3d', W: '5d', B: '7d' }, PA = K.day('pA', 'T+:3', '3a', 'do');
  const R47 = K.tro('r47', ['5b', '10b'], '47k'), CAU = K.day('cau', '10e', '10f', 'vang');
  const LDR = { id: 'ldr', loai: 'ldr', p: ['10j', 'B-:10'], nhan: 'quang trở' };
  const Q = { id: 'q', loai: 'npn', e: '9h', b: '10h', c: '11h' }, DE = K.day('dE', '9j', 'B-:9', 'den');
  const L = K.led('led', '12g', '11g', 'do', { nhan: '' }), RC = K.tro('rc', ['12e', '12f'], '220'), DC = K.day('dC', 'T+:12', '12a', 'do');
  const sd = SD;
  const soDo = sd.svg(300, 230, sd.mui + sd.pin(30, 115, '') + sd.day('30,115 30,15 250,15') + sd.day('100,15 100,25') + sd.tro(100, 25, 45, 'biến trở') + sd.tro(100, 70, 45, '47k')
    + sd.cham(100, 115) + sd.ldr(100, 115, 70, '') + sd.day('100,185 100,210 30,210 30,125') + sd.day('100,115 170,115 190,115') + sd.npn(220, 115)
    + sd.day('250,15 250,30') + sd.tro(250, 30, 30, '') + sd.led(230, 60) + sd.day('230,145 230,210 100,210') + sd.chu(40, 150, 'tối → R lớn', 'sd-mo'), 'Quang trở ở dưới: tối thì điện trở lớn, áp chân B lên, transistor dẫn');
  BAI.dangKy({
    id: '5.4',
    poster: [16, 27, 30],
    muc_tieu: 'Cảm biến + công tắc: che quang trở thì LED tự sáng. Chỉnh độ nhạy bằng biến trở.',
    can: [K.can.ldr(), K.can.bientro(), K.can.tro('47k'), K.can.tro('220'), K.can.npn(), K.can.led(), ...K.coBan(7)],
    kien_thuc: `<p>Cầu phân áp: phía trên = biến trở + 47k, phía dưới = quang trở. <code>U_giữa = U · R_dưới/(R_trên + R_dưới)</code>. Tối → quang trở lớn → U_giữa lên → qua ~0.65V thì transistor dẫn. <b>Quang trở phải ở dưới</b>; poster bài 27/30 vẽ ở trên nên chạy ngược.</p>
      <p>47k là để khi vặn biến trở về 0Ω, chân B vẫn không nối thẳng vào +: dòng B tối đa ~0.1mA.</p>
      <p>Ngưỡng bật: <code>R_quang ≈ 0.16 × R_trên</code> ≈ 7.5k–9k. Phòng sáng quá (che tay mà quang trở vẫn < 7k, LED không bật) → đổi 47k thành <b>22k</b> cho ngưỡng xuống ~3.5k; phòng tối quá (LED luôn sáng) → đổi thành <b>100k</b> cho ngưỡng lên ~16k.</p>
      <p>Biến trở chỉ dùng A và W (kiểu A, bài 2.3). Chân B của biến trở bỏ trống.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Trên: biến trở + 47k. Dưới: quang trở. Giữa → chân B.' }],
    du_doan: '<p>Sáng phòng (quang trở 5–20k): LED mờ hoặc tắt. Che bằng tay (≥ 100k): LED sáng hẳn, U_B ≈ 0.7V.</p>',
    sau: `<h3>Tính ngưỡng bật</h3>
      <p>Transistor bắt đầu dẫn khi áp chân B ≈ 0.65V: <code>4.78 × R_q / (R_trên + R_q) = 0.65</code> → <code>R_q = 0.65/4.13 × R_trên ≈ 0.157·R_trên</code>. R_trên = 47k + biến trở (0–10k) → ngưỡng R_q ≈ <b>7.4k–9k</b>: vặn biến trở là dời ngưỡng trong khoảng đó.</p>
      <h3>Vì sao LED sáng dần chứ không bật "tách"</h3>
      <p>Quanh ngưỡng, transistor ở vùng khuếch đại: áp B nhích vài chục mV là dòng C đổi nhiều lần (bài 4.1: ×10 dòng mỗi ~60mV). Cầu phân áp lại bị chính dòng B kéo xuống. Kết quả: một vùng chuyển tiếp mềm, trời chạng vạng thì LED sáng lưng chừng hoặc chập chờn.</p>
      <p>Cách chữa là <b>trễ (hysteresis)</b>: bật ở một ngưỡng, tắt ở ngưỡng khác cao hơn chút. Mạch điện làm bằng bộ Schmitt trigger (thêm phản hồi dương); bài 10.2 làm bằng 2 dòng code.</p>`,
    hoi: [
      ['R_trên = 57k (biến trở vặn hết). Quang trở dưới bao nhiêu thì LED tắt?', 'Ngưỡng ≈ 0.157 × 57k ≈ <b>8.9k</b>: dưới đó áp B &lt; 0.65V, LED tắt.'],
      ['Thay 47k bằng 100k. Ngưỡng mới khoảng bao nhiêu?', '0.157 × (100k … 110k) ≈ <b>15.7k–17.3k</b>: quang trở phải lên cao hơn, tức <b>phải tối hơn</b> mới bật. Dùng khi phòng hơi tối mà LED đã sáng suốt.'],
      ['Vì sao LED sáng lưng chừng lúc chạng vạng?', 'Transistor ở vùng khuếch đại quanh ngưỡng, không có trễ nên không nhảy hẳn sang bật hay tắt.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Ráp', cot: 24,
        buoc: [
          K.buocPin(),
          { ten: 'Biến trở + 47k ở trên', lam: ['Biến trở A 3d, W 5d, B 7d (cột 7 bỏ trống). Dây đỏ thanh + → 3a. 47k (' + K.tenVong('47k') + '): 5b → 10b. Dây vàng 10e → 10f.'], board: { them: [BT, PA, R47, CAU] } },
          { ten: 'Quang trở ở dưới, transistor, LED', lam: ['Quang trở từ <b>10j</b> xuống thanh − (cột 10). S8050: E 9h, B 10h, C 11h; dây đen 9j → thanh −.', 'LED: chân ngắn 11g, chân dài 12g. 220Ω 12e → 12f, dây đỏ thanh + → 12a.'], board: { them: [LDR, Q, DE, L, RC, DC] } },
          K.buocOm('Ω 200k', '> 47', 'Lớn hơn 47k (biến trở + 47k + quang trở), đổi khi che tay lên quang trở.', 'Dưới 47k: 47k đang bị đi tắt, chân B có thể nối thẳng vào +.'),
        ],
      },
      {
        ten: 'Phần 2 · Che, chỉnh ngưỡng', ke_thua: true,
        buoc: [
          K.lapPin('Lắp pin, che quang trở', ['Lấy tay khum che kín quang trở. Rồi bỏ tay ra.'], { sua: { led: { sang: true } } }, { thay: 'Che: LED sáng. Bỏ tay: LED tắt hoặc mờ.', neu_khong: 'Luôn sáng: xem phần "Hiểu trước khi ráp" để đổi 47k. Luôn tắt: kiểm chân transistor.' }),
          { ten: 'Đo U_B lúc sáng và lúc che, vặn biến trở', lam: ['<code>DCV 20</code>, que đỏ chân B (10h), que đen thanh −. Vặn biến trở: tìm vị trí LED bắt đầu sáng khi che nửa chừng.'], board: { them: [K.dh('DCV 20', 'q.B', 'B-:14', '≈ 0.7')] }, kiem: { thay: 'U_B tăng khi che, và dừng lại ở ~0.7V khi LED sáng hẳn (B–E như một diode).', neu_khong: '' } },
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'U_B', cot: ['U_B', 'LED'], hang: [{ ten: 'Sáng phòng', du_doan: ['< 0.6', 'tắt/mờ'] }, { ten: 'Che tay', du_doan: ['≈ 0.7', 'sáng'] }] }],
    bay: ['Quang trở ở trên: chạy ngược (sáng thì bật).', 'Bỏ 47k: vặn biến trở về 0 là chân B chỉ còn cách thanh + vài ôm, dòng B hàng chục mA, transistor nóng rồi chết.', 'Đo Ω quang trở ngay dưới đèn bàn rồi so với lúc khác: số đổi theo ánh sáng, đừng hoảng.'],
    robot: ['Bài 10.2 làm lại mạch này bằng ADC + code: ngưỡng chỉnh bằng số, có trễ để không chập chờn.'],
  });
})();
