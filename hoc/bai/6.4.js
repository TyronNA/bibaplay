// Bài 6.4 — Mạch nhớ 1 bit. Như 6.3 nhưng thay 2 tụ bằng 10k nối C sang B bên kia, bỏ 47k chân B, thêm 2 nút kéo B xuống −.
// Ra: 10k C1 (8i) → 13i, dây 13j → B2 (21j). 10k C2 (22i) → 16i, dây 16j → B1 (7j).
// Nút 1 ở cột 2/4: dây B1 7f → 4g; cột 2 → −. Nút 2 ở cột 26/28: dây B2 21f → 26g; cột 28 → −.
(function () {
  const Q1 = { id: 'q1', loai: 'npn', e: '6h', b: '7h', c: '8h', nhan: 'Q1' }, Q2 = { id: 'q2', loai: 'npn', e: '20h', b: '21h', c: '22h', nhan: 'Q2' };
  const E = [K.day('e1', '6j', 'B-:6', 'den'), K.day('e2', '20j', 'B-:20', 'den')];
  const LED = [K.led('l1', '9g', '8g', 'do', { nhan: '' }), K.tro('rc1', ['9e', '9f'], '1k'), K.day('pc1', 'T+:9', '9a', 'do'), K.led('l2', '23g', '22g', 'xanhla', { nhan: '' }), K.tro('rc2', ['23e', '23f'], '1k'), K.day('pc2', 'T+:23', '23a', 'do')];
  const CHEO = [K.tro('x1', ['8i', '13i'], '10k'), K.day('x1d', '13j', '21j', 'tim', 9), K.tro('x2', ['22i', '16i'], '10k'), K.day('x2d', '16j', '7j', 'tim', -9)];
  const NUT = [{ id: 'n1', loai: 'nut', o: '2e', nhan: 'S1' }, K.day('n1b', '7f', '4g', 'xanh', 4), K.day('n1g', '2j', 'B-:2', 'den'),
    { id: 'n2', loai: 'nut', o: '26e', nhan: 'S2' }, K.day('n2b', '21f', '26g', 'xanh', -4), K.day('n2g', '28j', 'B-:28', 'den')];
  BAI.dangKy({
    id: '6.4',
    muc_tieu: 'Flip-flop: nhấn S1 thì LED2 sáng, nhả vẫn giữ; nhấn S2 thì đổi sang LED1. Ô nhớ 1 bit dạng thô nhất.',
    can: [K.can.npn(2), K.can.tro('10k', 2), K.can.tro('1k', 2), K.can.led('đỏ + xanh lá', 2), K.can.nut(2), ...K.coBan(14)],
    kien_thuc: `<p>Q1 dẫn → C1 ≈ 0 → không có dòng qua 10k sang B2 → Q2 tắt → C2 cao → dòng qua 10k vào B1 giữ Q1 dẫn. Trạng thái tự giữ.</p>
      <p>Nhấn S1 kéo B1 xuống − → Q1 tắt → C1 lên → Q2 dẫn → C2 xuống → B1 mất dòng. Nhả S1, trạng thái mới vẫn giữ.</p>
      <p>Nút nhấn chỉ nối chân B xuống −, không bao giờ nối + với −. Cột 2/4 và 26/28 phải đo lại như 6.1 (nhả: không thông; nhấn: thông).</p>
      <p>LED bên "tắt" có thể le lói rất mờ: dòng giữ chân B của transistor kia đi qua nó (~0.2mA).</p>`,
    du_doan: '<p>Lắp pin: một trong 2 LED sáng (ngẫu nhiên). S1 → LED2 sáng; S2 → LED1 sáng. Nhả nút không đổi gì.</p>',
    so_do: [{ nhan: 'Flip-flop 2 transistor', svg: SD.svg(340, 250, SD.pin(20, 130) + SD.chu(30, 20, '4.78V', 'sd-mo') + SD.day('20,130 20,30 280,30')
      + SD.day('120,30 120,34') + SD.tro(120, 34, 40, '1k') + SD.day('120,74 120,76') + SD.led(120, 76) + SD.day('120,116 120,130') + SD.cham(120, 122) + SD.chu(128, 126, 'C1', 'sd-mo')
      + SD.day('280,30 280,34') + SD.tro(280, 34, 40, '1k') + SD.day('280,74 280,76') + SD.led(280, 76) + SD.day('280,116 280,130') + SD.cham(280, 122) + SD.chu(288, 126, 'C2', 'sd-mo')
      + SD.npn(110, 160) + SD.npn(270, 160) + SD.day('120,190 120,225') + SD.day('280,190 280,225')
      + SD.troNgang(36, 160, 38) + SD.chu(55, 146, '10k', 'sd-chu', 'middle') + SD.chu(46, 184, '← C2', 'sd-mo', 'middle') + SD.day('74,160 80,160') + SD.cham(77, 160) + SD.day('77,160 77,170') + SD.nut(77, 170, 50, 'S1')
      + SD.troNgang(180, 160, 50, '10k') + SD.chu(195, 184, '← C1', 'sd-mo', 'middle') + SD.day('230,160 240,160') + SD.cham(236, 160) + SD.day('236,160 236,170') + SD.nut(236, 170, 50, 'S2')
      + SD.day('20,140 20,225 280,225'),
      'Flip-flop: C1 nối qua 10k sang B2, C2 nối qua 10k sang B1, mỗi chân B có nút kéo xuống cực âm'), chu: 'Nhãn "← C2": đầu trái 10k nối về điểm C2 (vẽ tách cho khỏi rối dây chéo).' }],
    sau: `<h3>Phản hồi dương tự giữ</h3>
      <p>Hai tầng đảo (NOT) nối vòng: ra con này vào con kia. Một tầng đảo lật dấu, hai tầng lật lại → vòng khuếch đại <b>cùng dấu</b> và hệ số lớn hơn 1. Nhiễu nhỏ đẩy lệch một chút là vòng khuếch đại tiếp tới khi một con bão hoà hẳn, con kia tắt hẳn. Chỉ có 2 trạng thái đứng yên được: đó là 1 bit.</p>
      <p>Lúc vừa cấp điện, 2 bên gần như cân bằng, bên nào dẫn trước là do lệch hFE và nhiễu: vì vậy trạng thái đầu "ngẫu nhiên".</p>
      <h3>Từ đây tới RAM</h3>
      <p>Một ô nhớ SRAM trong chip ESP32 là đúng ý tưởng này: 2 cổng đảo CMOS nối vòng (4 transistor) + 2 transistor để đọc/ghi = 6 transistor mỗi bit. ESP32-S3 có 512KB SRAM ≈ 4 triệu bit, tức cỡ 25 triệu transistor chỉ cho bộ nhớ. PSRAM ngoài (8MB trên N16R8) dùng tụ nhỏ thay vòng giữ, rẻ hơn nhưng phải làm tươi liên tục.</p>`,
    hoi: [
      ['Vì sao mạch này giữ trạng thái còn mạch 6.3 thì tự lật?', '6.3 nối chéo qua <b>tụ</b>: chỉ truyền cú đổi, rồi tụ nạp lại làm con kia dẫn trở lại. 6.4 nối chéo qua <b>điện trở</b>: truyền cả mức một chiều, nên giữ mãi.'],
      ['Mạch đang ở trạng thái Q1 dẫn. Nhấn S2 (kéo B2 xuống) có đổi gì không?', 'Không. Q2 vốn đã tắt; kéo B2 xuống chỉ giữ nó tắt thêm.'],
      ['Ước lượng dòng mạch ăn khi đứng yên.', 'Bên dẫn: (4.78 − 2 − 0.1)/1k ≈ 2.7mA qua LED; cộng dòng giữ B ~0.3–0.4mA → <b>~3mA</b>.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp theo nhóm', cot: 30,
      buoc: [
        K.buocPin(),
        { ten: 'Nhóm 1: 2 transistor, LED, 1k', lam: ['Q1: E 6h, B 7h, C 8h. Q2: E 20h, B 21h, C 22h. Dây đen 6j, 20j → thanh −.', 'LED + 1k ở cả 2 chân C như bài 6.3.'], board: { them: [Q1, Q2, ...E, ...LED] } },
        { ten: 'Nhóm 2: 2 điện trở chéo 10k', lam: ['10k từ 8i (C1) → 13i, dây tím 13j → 21j (B2).', '10k từ 22i (C2) → 16i, dây tím 16j → 7j (B1).'], board: { them: CHEO } },
        { ten: 'Nhóm 3: 2 nút kéo B xuống −', lam: ['S1 vắt qua rãnh ở cột 2/4 (đã kiểm hướng như 6.1). Dây xanh 7f → 4g (B1 → nút). Dây đen 2j → thanh −.', 'S2 ở cột 26/28. Dây xanh 21f → 26g (B2 → nút). Dây đen 28j → thanh −.'], board: { them: NUT } },
        K.buocOm('Ω 200k', '> 1', 'Số lớn (qua LED + 1k + 10k + B–E), hoặc 1. Nhấn giữ S1 rồi S2 và đo lại: vẫn không dưới 1k.', 'Gần 0 khi nhấn nút: nút đang nối thanh + chứ không phải chân B.', ['Đo cả lúc nhả, lúc nhấn S1, lúc nhấn S2.']),
        K.lapPin('Lắp pin', ['Một LED sáng.'], { sua: { l1: { sang: true } } }, { thay: 'Đúng 1 LED sáng rõ.', neu_khong: 'Cả 2 cùng sáng vừa: kiểm 2 dây tím.' }),
        { ten: 'Nhấn S1, nhả; nhấn S2, nhả', lam: ['Nhấn S1 rồi nhả. Rồi nhấn S2 rồi nhả.'], board: { sua: { l1: { sang: false }, l2: { sang: true }, n1: { nhan_xuong: true } } }, kiem: { thay: 'S1 → LED2 sáng và giữ. S2 → LED1 sáng và giữ.', neu_khong: '' } },
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'Trạng thái', cot: ['LED1', 'LED2'], hang: [{ ten: 'Sau S1', du_doan: ['tắt', 'sáng'] }, { ten: 'Sau S2', du_doan: ['sáng', 'tắt'] }] }],
    bay: ['Nút cắm sai hướng 90°: nút luôn đóng, B luôn bị kéo xuống, mạch không giữ.', 'Nối nút từ chân B lên thanh +: nhấn là dòng B không giới hạn, transistor chết.'],
    robot: ['RAM tĩnh (SRAM) trong ESP32 là hàng triệu ô kiểu này, mỗi ô 6 transistor.'],
  });
})();
