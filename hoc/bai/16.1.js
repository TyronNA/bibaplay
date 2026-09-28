// Bài 16.1 — Cell 18650 + sạc TP4056 (loại 6 chân có DW01A). Không breadboard, không ESP32: phác thảo từng bước.
// Thứ tự cố ý: đo cell trần → hàn dây vào module khi CHƯA có cell → đo cực đế pin → nối → sạc.
(function () {
  const sd = SD;
  const CELL = (x, y) => `<rect x="${x}" y="${y}" width="120" height="30" rx="6" class="sd-net"/>` + sd.chu(x + 60, y + 20, '18650', 'sd-chu', 'middle') + sd.chu(x + 128, y + 20, '+', 'sd-pos') + sd.chu(x - 12, y + 20, '−', 'sd-neg');
  // đế: 2 dây ra bên phải, đỏ trên / đen dưới, dài tới x + 160
  const DE = (x, y) => sd.hop(x, y, 120, 40, 'đế 1 ô') + sd.day(`${x + 120},${y + 12} ${x + 160},${y + 12}`, true) + sd.day(`${x + 120},${y + 28} ${x + 160},${y + 28}`)
    + sd.chu(x + 126, y + 7, 'đỏ', 'sd-pos') + sd.chu(x + 126, y + 44, 'đen', 'sd-chu');
  // module: tên chân nằm trong khung — B+/B− trái, OUT phải, USB dưới
  const MOD = (x, y) => sd.hop(x, y, 100, 70, 'TP4056') + sd.chu(x + 6, y + 24, 'B+', 'sd-mo') + sd.chu(x + 6, y + 54, 'B−', 'sd-mo')
    + sd.chu(x + 94, y + 24, 'OUT+', 'sd-mo', 'end') + sd.chu(x + 94, y + 54, 'OUT−', 'sd-mo', 'end') + sd.chu(x + 50, y + 66, 'USB', 'sd-mo', 'middle');
  const NOI = sd.day('170,57 220,54', true) + sd.day('170,73 220,84');
  const h0 = sd.svg(360, 125, CELL(120, 30) + sd.chu(180, 90, 'vỏ nhựa kín, vòng cách điện ở đầu + còn nguyên', 'sd-mo', 'middle') + sd.chu(180, 108, 'không phồng, móp, rỉ, ướt', 'sd-mo', 'middle'), 'Kiểm tra vỏ cell bằng mắt');
  const h1 = sd.svg(360, 135, CELL(120, 30) + sd.dongHo(60, 100, 'V') + sd.day('248,45 280,45 280,100 76,100', true) + sd.day('108,45 60,45 60,84')
    + sd.chu(286, 80, 'que đỏ', 'sd-pos') + sd.chu(14, 68, 'que đen', 'sd-chu') + sd.chu(60, 130, 'DCV 20', 'sd-mo', 'middle'), 'Đo áp cell trần bằng DCV 20');
  const h2 = sd.svg(360, 135, MOD(220, 30) + sd.day('130,54 220,54', true) + sd.day('130,84 220,84') + sd.chu(10, 58, 'dây đỏ → hàn B+', 'sd-pos') + sd.chu(10, 88, 'dây đen → hàn B−', 'sd-chu')
    + sd.chu(180, 126, 'hàn khi CHƯA có cell trong đế', 'sd-xau', 'middle'), 'Hàn 2 dây vào B+ và B- của module khi chưa có pin');
  const h3 = sd.svg(360, 130, DE(20, 40) + sd.dongHo(300, 60, 'V') + sd.day('180,52 284,52', true) + sd.day('180,68 284,68') + sd.chu(300, 96, 'DCV 20', 'sd-mo', 'middle')
    + sd.chu(180, 120, 'que đỏ vào dây đỏ: phải ra số dương', 'sd-mo', 'middle'), 'Đo cực dây ra của đế pin');
  const h4 = sd.svg(360, 130, DE(10, 45) + MOD(220, 30) + NOI + sd.chu(180, 124, 'đỏ → B+ · đen → B− · OUT để trống', 'sd-mo', 'middle'), 'Nối dây đế pin vào B+ B- của module');
  const h5 = sd.svg(360, 145, DE(10, 45) + MOD(220, 30) + NOI + sd.hop(235, 115, 70, 24, 'sạc 5V') + sd.day('270,115 270,100') + sd.chu(356, 64, '● đỏ', 'sd-pos', 'end'), 'Cắm sạc 5V vào cổng module, đèn đỏ sáng');
  BAI.dangKy({
    id: '16.1',
    muc_tieu: 'Lần đầu làm với pin lithium: đo và nhận biết cell 18650 còn dùng được, sạc 1 cell bằng module TP4056 có mạch bảo vệ, và biết khi nào phải dừng.',
    nguon: 'cục sạc 5V · 1 cell 18650',
    can: [K.can.cell(1), K.can.de18650(1), K.can.tp4056(), K.can.sac5v(), K.can.dh(), K.can.moHan()],
    kien_thuc: `<p><b>Khác hẳn pin AAA:</b> cell 18650 hãng xả được 10–20A (Samsung 25R: 20A liên tục). Nối tắt 2 cực — bằng dây, kẹp cá sấu, tua vít, đồng xu — là hàng chục ampe: dây đỏ rực, cháy vỏ, cell có thể xì khói. Mọi bước dưới đây sắp xếp để <b>không bao giờ có lúc 2 dây của pin nằm hở gần nhau</b>.</p>
      <p>Số của cell: sạc đầy <b>4.2V</b>, danh nghĩa 3.6–3.7V, cạn 2.5–3.0V. Đo trước khi dùng: ≥ 3.0V dùng được; 2.5–3.0V xả sâu; <b>dưới 2.5V hoặc phồng, móp, rách vỏ → bỏ</b>, không sạc.</p>
      <p>TP4056 (NanJing Top Power): vào 4.0–8V, sạc tới 4.2V ±1.5%, dòng 1A với điện trở 1.2k có sẵn trên module; pin dưới 2.9V thì sạc nhỏ giọt 130mA trước. Đèn đỏ = đang sạc, xanh = đầy. Chip <b>chỉ cho 1 cell</b> và bản thân không chống xả cạn — module 6 chân có thêm DW01A + MOSFET 8205A: ngắt khi cell xuống ~2.5V hoặc quá dòng ở ngõ <b>OUT</b>. Tải phải lấy ở OUT, không lấy ở B+/B−.</p>
      <p>TP4056 là sạc tuyến tính: 1A × (5V − 3.7V) ≈ 1.3W biến thành nhiệt trên module → module <b>nóng</b> là bình thường; chip tự giảm dòng khi quá nóng. Nóng tới mức không giữ tay được 3 giây thì rút sạc.</p>
      <p><b>Cắm cell ngược vào B+/B−</b> (chip không chịu đảo cực) có thể làm module cháy. Vì vậy phải đo cực dây đế pin bằng DCV trước khi nối.</p>`,
    code: null,
    du_doan: '<p>Cell mới mua thường ~3.6V (bán ở mức nửa đầy). Sạc 1A cho cell 2500mAh: ~2–3 giờ. Đầy: đèn xanh, đo 4.14–4.26V.</p>',
    khoi: 'Rút cục sạc khỏi ổ điện ngay. Cell nóng, phồng, xì hơi hoặc có khói: <b>không cầm</b>, không cúi sát, mở cửa cho thoáng, để yên trên nền gạch/bát sứ xa đồ dễ cháy; có lửa thì tránh xa và gọi 114.',
    so_do: [{ nhan: 'Sạc 1 cell', svg: SD.svg(360, 200, SD.hop(10, 50, 70, 60, 'sạc 5V') + SD.day('80,70 118,70') + SD.day('80,90 118,90') + SD.khoi(130, 50, 90, 'TP4056', ['IN+', 'IN−'], ['B+', 'B−', 'OUT+', 'OUT−'])
      + SD.day('232,70 280,70 280,100') + SD.pin(280, 100) + SD.day('280,110 280,130 258,130 258,90 232,90') + SD.chu(292, 84, '18650', 'sd-mo')
      + SD.day('232,110 250,110 250,150 330,150') + SD.day('232,130 244,130 244,170 330,170') + SD.chu(334, 164, 'tải', 'sd-chu'),
      'Cục sạc 5V vào TP4056; B+ B− ra cell 18650; OUT+ OUT− ra tải'), chu: 'Cell ở B+/B−; tải chỉ lấy ở OUT (qua mạch bảo vệ).' }],
    sau: `<h3>Sạc 2 giai đoạn: CC rồi CV</h3>
      <p>TP4056 sạc <b>dòng không đổi</b> 1A tới khi cell lên 4.2V, rồi giữ <b>áp không đổi</b> 4.2V, dòng tự giảm dần; tới ~1/10 dòng đặt (100mA) thì dừng, đèn xanh. Cell 2500mAh: giai đoạn CC ≈ 2 giờ (lên ~80%), CV thêm 0.5–1 giờ. Ép dòng hay áp cao hơn không nhanh hơn được bao nhiêu mà làm cell già nhanh; vượt 4.2V là nguy hiểm.</p>
      <h3>Năng lượng và nối tắt</h3>
      <p>Cell 3.6V × 2.5Ah ≈ <b>9Wh</b> — bằng một viên pin AAA gấp ~5 lần. Điện trở trong cell hãng cỡ 20–30mΩ: nối tắt lý thuyết 4.2/0.025 ≈ 170A; thực tế giới hạn bởi dây và tiếp xúc nhưng vẫn hàng chục A. Dây nhảy mỏng ở 30A đốt I²R ≈ 30² × 0.02 = 18W trong vài cm: đỏ rực trong vài giây.</p>
      <h3>Nhiệt trên module</h3>
      <p>Sạc tuyến tính: <code>P = (U_vào − U_cell) × I</code>. Lúc cell 3.2V: (5 − 3.2) × 1 = 1.8W — nóng nhất ở đầu quá trình sạc, mát dần khi cell lên áp.</p>`,
    hoi: [
      ['Cell 3000mAh, sạc 1A. Ước lượng thời gian sạc đầy?', 'CC ~2.4h tới ~80% + CV ~0.5–1h ≈ <b>3–3.5 giờ</b>.'],
      ['Cell đang 3.5V, sạc 1A từ 5V. Module đốt bao nhiêu W?', '(5 − 3.5) × 1 = <b>1.5W</b>.'],
      ['Vì sao tải nối vào B+/B− là mất bảo vệ?', 'B+/B− nối thẳng cell. Mạch bảo vệ (DW01A + MOSFET) chỉ nằm trên đường OUT.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Kiểm cell, chuẩn bị module (chưa có pin trong mạch)',
        gioi_thieu: 'Làm trên mặt bàn trống, không có kẹp, dây, tua vít vương vãi. Tháo nhẫn/đồng hồ kim loại.',
        buoc: [
          { ten: 'Nhìn vỏ cell', kiem_truoc: true, lam: ['Nhìn kỹ cả thân và 2 đầu. Vỏ nhựa bọc phải kín, nhất là quanh đầu + (vòng cách điện giấy/nhựa). Không phồng, móp, rỉ, ướt.'], hinh: h0, kiem: { thay: 'Vỏ lành, cell thẳng, không mùi.', neu_khong: 'Rách vỏ, móp, phồng: <b>bỏ</b> — không sạc, mang tới điểm thu pin cũ, không vứt thùng rác.' } },
          { ten: 'Đo áp cell trần', kiem_truoc: true, lam: ['Núm <code>DCV 20</code>, que ở cổng COM/V. Que đỏ chạm núm lồi (+), que đen chạm đầu phẳng (−). Chỉ dùng thang <b>DCV</b>: thang A gần như nối tắt cell.'], hinh: h1,
            kiem: { thay: '≥ 3.0V: dùng được. 2.5–3.0V: xả sâu, sạc được nhưng theo dõi sát.', neu_khong: '<b>Dưới 2.5V: bỏ</b>, không sạc (sạc lại có thể gây chập trong). Số âm: đảo que — đầu kia mới là +.' } },
          { ten: 'Hàn 2 dây vào B+ / B− của module', kiem_truoc: true, lam: ['Module chưa nối gì, <b>chưa có cell trong đế</b>. Hàn 2 dây rời (~10cm): đỏ vào miếng <b>B+</b>, đen vào <b>B−</b> (đọc chữ in cạnh miếng hàn). Đầu kia 2 dây để tách xa nhau. Không dùng kẹp cá sấu trên module: 2 kẹp nhỏ rất dễ chạm nhau.', 'Chưa nối 2 dây này với dây của đế pin — phải đo cực đế ở bước sau đã.'], hinh: h2,
            kiem: { thay: 'Mối hàn bóng, không dính sang miếng bên cạnh. Đo Ω giữa B+ và B− của module (chưa có pin): <b>không gần 0</b>.', neu_khong: 'B+ ↔ B− gần 0Ω: thiếc dính 2 miếng — gỡ bằng bấc hút thiếc trước khi có pin.' } },
          { ten: 'Lắp cell vào đế, đo cực dây ra', kiem_truoc: true, lam: ['Dây của đế chưa nối vào đâu, 2 đầu dây tách xa nhau. Lắp cell đúng dấu +/− dập trong đế. Đo <code>DCV 20</code> giữa dây đỏ và dây đen của đế: que đỏ vào dây đỏ.'], hinh: h3,
            kiem: { thay: 'Số <b>dương</b>, bằng số đo cell trần.', neu_khong: 'Số âm: cell lắp ngược hoặc dây đế đảo màu — sửa trước khi nối module. 0V: tiếp điểm lò xo không chạm.' } },
        ],
      },
      {
        ten: 'Phần 2 · Nối và sạc',
        buoc: [
          { ten: 'Nối đế vào module', lam: ['<b>Tháo cell ra khỏi đế trước.</b> Nối dây đỏ đế với dây đỏ từ B+, dây đen đế với dây đen từ B− (hàn nối rồi bọc gen/băng keo, hoặc cầu đấu vít). Mối nối đỏ và đen cách xa nhau. Rồi mới lắp lại cell. OUT+/OUT− để trống, không chạm vật kim loại nào.'], hinh: h4,
            kiem: { thay: 'Đo DCV ở OUT+/OUT−: ≈ áp cell (qua mạch bảo vệ).', neu_khong: 'OUT = 0V: mạch bảo vệ đang ngắt (cell quá cạn) hoặc cần "đánh thức" — cắm sạc ở bước sau là mở. Module ấm lên ngay khi chưa cắm sạc: <b>tháo cell</b>, có chỗ chập.' } },
          { ten: 'Cắm sạc 5V', cap_dien: true, lam: ['Cục sạc điện thoại 5V ≥ 1A cắm vào cổng USB của module. Đặt module + đế trên mặt bàn không có giấy/vải. Ghi giờ bắt đầu và áp cell.'], hinh: h5,
            kiem: { thay: 'Đèn <b>đỏ</b>. Sau 5 phút sờ module: ấm/nóng vừa là bình thường.', neu_khong: 'Không đèn: sạc không ra điện hoặc cáp chỉ-sạc sai cổng. Đỏ nhấp nháy + xanh: cell không tiếp xúc. <b>Nóng không giữ tay được 3 giây</b> hoặc cell ấm rõ: rút sạc.' } },
          { ten: 'Đo mỗi 30 phút tới khi đầy', lam: ['Mỗi 30 phút: đo DCV ở 2 dây đế (vẫn đang sạc), sờ cell. Không bỏ đi khỏi phòng, không để qua đêm.'], hinh: h5,
            kiem: { thay: 'Áp tăng dần tới ~4.2V; đèn chuyển xanh. Cell chỉ hơi ấm.', neu_khong: 'Cell nóng rõ trong khi module chưa nóng: cell hỏng — rút sạc, bỏ cell.' } },
          { ten: 'Rút sạc, đo lại sau 10 phút', lam: ['Rút cục sạc trước. Chờ 10 phút, đo lại áp cell.'], hinh: h4,
            kiem: { thay: '4.14–4.26V ngay khi đầy, tụt nhẹ còn ~4.15V sau 10 phút.', neu_khong: 'Trên 4.3V: module sạc sai — không dùng module đó nữa. Tụt nhanh (> 0.1V trong 10 phút, không tải): cell tự xả, bỏ.' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Sạc 1 cell', cot: ['Áp cell (V)', 'Đèn', 'Nhiệt (sờ)'], hang: [{ ten: 'Trước sạc', du_doan: ['3.0–4.1', '—', 'nguội'] }, { ten: '30 phút', du_doan: ['tăng', 'đỏ', 'module ấm'] }, { ten: '60 phút', du_doan: ['tăng', 'đỏ', 'module ấm'] }, { ten: 'Đầy', du_doan: ['4.14–4.26', 'xanh', 'nguội dần'] }] }],
    bay: ['Đo cell ở thang A (hoặc que đỏ đang ở lỗ mA/10A): nối tắt cell qua đồng hồ. Thang Ω thì không nối tắt nhưng số vô nghĩa và có thể hỏng thang đo — chỉ dùng DCV.', 'Kẹp cá sấu B+ và B− trên module nhỏ: 2 kẹp chạm nhau = nối tắt cell.', 'Cắm cell ngược: module cháy.', 'Dùng TP4056 cho pack 2 cell nối tiếp: sai — chỉ 1 cell (bài 16.2).', 'Để sạc qua đêm / trên giường, sofa.', 'Tải nối vào B+/B−: mất bảo vệ xả cạn.'],
    robot: ['Robot 17.1 dùng 2 cell nối tiếp: mỗi cell sạc riêng bằng đúng bài này, tháo khỏi robot khi sạc.'],
  });
})();
