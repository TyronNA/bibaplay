// Bài 16.3 — LM2596 → 5V + đo pin 2S qua ADC. Pack P+ → 5a (cột riêng — 8.4V, không bao giờ vào thanh +), P− → thanh −.
// LM2596: IN+ 5b, IN− thanh −, OUT+ 20a, OUT− thanh −. Cầu đo pin: 20k 5c → 9c, 10k 9e → 9f, 9j → thanh −; GPIO1 → 9a.
// Phần 3: LED 13 (330Ω 26e → 26f, LED 26i/27i, 27j → −); rút USB, 5V board ← 20c.
(function () {
  const PACK = { id: 'pack', loai: 'ngoai', kieu: 'hop', chu: 'pack 2S', x: 440, chan: { 'P+': '5a', 'P−': 'B-:5' }, mau: ['do', 'den'], nhan: 'P+/P− của BMS' };
  const BUCK = { id: 'buck', loai: 'ngoai', kieu: 'hop', chu: 'LM2596', x: 580, chan: { 'IN+': '5b', 'IN−': 'B-:7', 'OUT+': '20a', 'OUT−': 'B-:20' }, mau: ['do', 'den', 'cam', 'den'], nhan: 'hạ áp' };
  const R1 = K.tro('r1', ['5c', '9c'], '20k'), R2 = K.tro('r2', ['9e', '9f'], '10k'), D9 = K.day('d9', '9j', 'B-:9', 'den');
  const RL = K.tro('rl', ['26e', '26f'], '330'), LED = K.led('led', '26i', '27i'), DL = K.day('dl', '27j', 'B-:27', 'den');
  const ESP2 = K.esp({ GND: 'B-:3', G1: '9a' }, { x: 40 });
  const ESP3 = K.esp({ GND: 'B-:3', G1: '9a', G13: '26a', '5V': '20c' }, { x: 40 });
  const sd = SD;
  const soDo = sd.svg(320, 190, sd.chu(10, 20, 'P+ 6–8.4V', 'sd-pos') + sd.day('70,26 110,26') + sd.hop(110, 10, 70, 34, 'LM2596') + sd.day('180,26 240,26', true) + sd.chu(246, 30, '5V board', 'sd-pos')
    + sd.day('90,26 90,60') + sd.tro(90, 60, 40, '20k') + sd.cham(90, 100) + sd.day('90,100 160,100') + sd.chu(166, 104, 'GPIO1 ≤ 2.8V', 'sd-chu') + sd.tro(90, 100, 40, '10k') + sd.day('90,140 90,160') + sd.dat(90, 160)
    + sd.chu(166, 150, 'pin = mV × 3', 'sd-mo'), 'Pin qua LM2596 ra 5V cho board; cầu 20k/10k chia áp pin cho ADC');
  BAI.dangKy({
    id: '16.3',
    muc_tieu: 'Board chạy bằng pin, không cần cáp USB: hạ pack 2S (6–8.4V) xuống 5V bằng mạch hạ áp xung LM2596, và cho chip tự đo pin còn bao nhiêu.',
    nguon: 'pack 2S (16.2) · USB chỉ ở phần 2',
    can: [...K.coBanEsp(5), K.can.lm2596(), { ten: 'Pack 2S + BMS (bài 16.2)', tim: 'BMS 2S', lk: 'bms-2s', sl: 1 }, K.can.tro('20k'), K.can.tro('10k'), K.can.tro('330'), K.can.led(), { ten: 'Tua vít nhỏ', tim: 'tua vít', lk: 'tua-vit', sl: 1 }],
    kien_thuc: `<p><b>Hạ áp xung khác AMS1117 (8.2):</b> AMS1117 "đốt" phần áp dư thành nhiệt: 8.4V → 3.3V ở 0.3A là ~1.5W nóng bỏng tay. LM2596 bật/tắt 150kHz qua một cuộn cảm, chỉ lấy đúng phần năng lượng cần: TI ghi hiệu suất bản 5V ~80% (12V → 5V, 3A).</p>
      <p>LM2596 cần áp vào cao hơn áp ra: sụt trên công tắc 1.16–1.4V ở 3A (datasheet), nên với 5V ra cần vào ≳ 6.5V. Pack 2S gần cạn (~6V) → 5V ra bắt đầu tụt → chip tự đo pin và dừng robot trước lúc đó.</p>
      <p><b>Module mới mua có thể đang chỉnh ra bất kỳ áp nào</b> — thường gần bằng áp vào. 8.4V vào chân 5V board là hỏng board. Vì vậy: chỉnh ra 5.0V <b>khi chưa nối gì ở OUT</b>, đo lại, rồi mới nối.</p>
      <p><b>Không cắm USB khi board đang ăn 5V từ LM2596</b> — Espressif: các đường cấp nguồn (USB / chân 5V / chân 3V3) loại trừ nhau. Phần 2 chạy bằng USB (LM2596 chưa nối vào board), phần 3 rút USB rồi mới nối.</p>
      <p>Đo pin: cầu 20k/10k chia 3 → 8.4V thành 2.8V, dưới 2.9V (giới hạn đo đúng của ADC, chương 10). <b>Pack P+ đi vào cột 5 riêng</b>, không bao giờ vào thanh + của breadboard.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Đo điểm giữa cầu trước khi nối GPIO1; chỉnh OUT = 5.0V trước khi nối board.' }],
    code: 'sandbox/esp32-bai/main/bai_16_3.c',
    du_doan: '<p>Pack đầy 8.3V: điểm giữa cầu ≈ 2.77V, code in ≈ 8300mV. LED nháy 1 lần/giây; dưới 6.6V (3.3V/cell) nháy nhanh.</p>',
    khoi: 'Tháo dây P+ của pack khỏi breadboard ngay (không để đầu dây chạm gì), rút USB nếu đang cắm. Cell/pack nóng, phồng, có khói: <b>không cầm</b>, mở cửa thoáng, tránh xa; có lửa thì gọi 114.',
    phan: [
      {
        ten: 'Phần 1 · Chỉnh LM2596 ra 5.0V, chưa nối board', cot: 30,
        gioi_thieu: 'Không có ESP32 trên hình. Pack đã ráp ở 16.2, dây P+/P− đang bọc băng keo.',
        buoc: [
          { ten: 'Nối LM2596 (chưa có pin)', lam: ['Dây <b>IN+</b> → <b>5b</b>, <b>IN−</b> → thanh − dưới (cột 7). <b>OUT+</b> → <b>20a</b>, <b>OUT−</b> → thanh − (cột 20). Cột 20 chưa nối gì khác.'], board: { them: [BUCK] } },
          { ten: 'Đo trước khi nối pin', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 5d (IN+), que đen thanh −. Rồi que đỏ 20c (OUT+), que đen thanh −.'], board: { them: [K.dh('Ω 200k', '5d', 'B-:12', '> 0.1')] },
            kiem: { thay: 'Cả 2 không gần 0 (số có thể chạy lên từ từ vì tụ trên module).', neu_khong: 'Gần 0: IN+ hoặc OUT+ chạm thanh −. Không nối pin.' } },
          { ten: 'Nối P+ vào 5a, P− vào thanh −', cap_dien: true, lam: ['Bóc băng keo dây P−, cắm thanh − (cột 5). Rồi dây P+ → <b>5a</b>. Đèn trên module (nếu có) sáng.'], board: { them: [PACK] },
            kiem: { thay: 'Không có gì nóng, không mùi.', neu_khong: 'Module kêu rít / nóng ngay: rút P+.' } },
          { ten: 'Đo OUT, vặn về 5.0V', cap_dien: true, lam: ['<code>DCV 20</code>, que đỏ 20c, que đen thanh −. Vặn vít đồng của biến trở xanh bằng tua vít, mỗi lần nửa vòng, xem số đổi. Dừng ở 4.95–5.05V.'], board: { them: [K.dh('DCV 20', '20c', 'B-:22', '→ 5.0')] },
            kiem: { thay: 'OUT = 4.95–5.05V và đứng yên.', neu_khong: 'Vặn hàng chục vòng không đổi: vặn chiều ngược lại (biến trở nhiều vòng). OUT ≈ áp pin mà vặn không đổi: module hỏng.' } },
          { ten: 'Tháo P+', lam: ['Rút dây P+ khỏi 5a, bọc băng keo đầu dây.'], board: { bo: ['pack'] } },
        ],
      },
      {
        ten: 'Phần 2 · Cầu đo pin, chạy bằng USB', ke_thua: true,
        buoc: [
          { ten: 'Cầu 20k/10k', lam: ['20k (đỏ-đen-cam) <b>5c → 9c</b>. 10k (nâu-đen-cam) vắt qua rãnh <b>9e → 9f</b>. Dây đen <b>9j → thanh −</b>.'], board: { them: [R1, R2, D9] } },
          { ten: 'Nối lại pin, đo điểm giữa', cap_dien: true, kiem_truoc: true, lam: ['P+ → 5a. <code>DCV 20</code>: đo 5d (pin) rồi 9d (điểm giữa), que đen thanh −.'], board: { them: [PACK, K.dh('DCV 20', '9d', 'B-:12', '≈ 2.8')] },
            kiem: { thay: 'Điểm giữa = pin ÷ 3, <b>≤ 2.9V</b>.', neu_khong: 'Điểm giữa ≈ 2/3 pin: 20k và 10k đảo chỗ — rút P+, đổi lại. Không nối GPIO khi chưa đúng.' } },
          { ten: 'Dây từ board (LM2596 chưa nối board)', lam: ['Rút P+. <code>GND</code> → thanh − (cột 3). <code>1</code> → <b>9a</b>. Chân 5V của board <b>chưa nối</b>. Cắm lại P+.'], board: { them: [ESP2] } },
          K.camUsb('Cắm USB, nạp 16.3', ['<code>idf.py menuconfig</code> → 16.3, <code>flash monitor</code>. Ghi số in ra, so với đồng hồ đo thẳng 5d.'], {}, { thay: 'Code in pin ≈ số đồng hồ ở 5d (lệch ≤ 0.2V).', neu_khong: 'In ≈ 0: dây GPIO1 sai cột. In ≈ 8700 cố định: ADC chạm trần — cầu sai.' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 3 · Rút USB, board ăn pin qua LM2596', ke_thua: true,
        buoc: [
          { ten: 'Tháo P+, thêm LED trạng thái', lam: ['USB rút. Rút P+ khỏi 5a. 330Ω (cam-cam-nâu) vắt qua rãnh <b>26e → 26f</b>. LED: chân dài <b>26i</b>, chân ngắn <b>27i</b>. Dây đen <b>27j → thanh −</b>.'], board: { bo: ['pack'], them: [RL, LED, DL] } },
          { ten: 'Chân 5V board ← OUT LM2596', lam: ['<code>13</code> → <b>26a</b>. <code>5V</code> → <b>20c</b> (cột OUT+ LM2596). Kiểm: cáp USB đã rút khỏi board.'], board: { bo: ['esp'], them: [ESP3] } },
          { ten: 'Đo trước khi nối pin', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 20d, que đen thanh −.'], board: { them: [K.dh('Ω 200k', '20d', 'B-:22', '≥ mốc 8.1')] },
            kiem: { thay: 'Không dưới ~100Ω (mốc 5V–GND bài 8.1 song song OUT LM2596).', neu_khong: 'Gần 0: 5V chạm GND. Không nối pin.' } },
          { ten: 'Nối P+ → board chạy bằng pin', cap_dien: true, lam: ['P+ → 5a. <b>Không cắm USB.</b> Nhìn LED. Sau 1 phút sờ LM2596 và board. Đo DCV 20c.'], board: { them: [PACK] },
            kiem: { thay: 'LED nháy 1 lần/giây (pin > 6.6V). 20c ≈ 5.0V. LM2596 chỉ hơi ấm.', neu_khong: 'LED nháy nhanh: pin < 6.6V — sạc lại 2 cell (16.1). Không sáng: kiểm 5V ở 20c. Board/LM2596 nóng: rút P+.' } },
          { ten: 'Tháo P+ khi xong', lam: ['Rút P+ khỏi 5a, bọc băng keo. Muốn nạp code lại: tháo P+ <b>trước</b>, rồi mới cắm USB.'], board: { bo: ['pack'] } },
        ],
      },
    ],
    bang_do: [{ ten: 'Áp (V)', cot: ['Pin (5d)', 'Điểm giữa (9d)', 'Code in', 'OUT LM2596'], hang: [{ ten: 'Số đo', du_doan: ['7.4–8.4', 'pin ÷ 3', '≈ pin', '4.95–5.05'] }] }],
    bay: ['Nối OUT LM2596 vào board trước khi chỉnh về 5V: 8V vào chân 5V, hỏng board.', 'Cắm USB trong khi board đang ăn pin qua chân 5V: 2 nguồn đấu nhau.', 'Pack P+ cắm thanh + của breadboard: lẫn với 3V3/5V ở bài khác.', 'Đảo 20k/10k: 5.6V vào ADC.', 'Để pack cạn dưới 6V: LM2596 không giữ nổi 5V, board reset liên tục.'],
    robot: ['17.1 dùng nguyên bộ này: pin → LM2596 → 5V board + HC-SR04; pin → VM DRV8833 trực tiếp; GPIO1 đo pin, dưới 6.6V robot tự dừng.'],
  });
})();
