// Bài 16.2 — Pack 2S + BMS 2S. Hàn BMS vào hộp 2 ô khi hộp RỖNG, đo, rồi lắp từng cell và đo từng điểm.
// Không breadboard, không ESP32: phác thảo từng bước.
(function () {
  const sd = SD;
  // Hộp 2 ô bên trái, BMS bên phải; 3 dây nằm ngang nối đúng miếng cùng tên: B+ y34, BM y56, B− y78. P+ y40, P− y72.
  const Y = { 'B+': 34, BM: 56, 'B−': 78 }, P = { 'P+': [348, 40], 'P−': [348, 72] };
  const diem = t => (P[t] ? P[t] : [t === 'B+' ? 196 : t === 'BM' ? 204 : 212, Y[t]]);
  const HOP = cell => `<rect x="10" y="20" width="150" height="80" rx="4" class="sd-net"/>`
    + [0, 1].map(i => `<rect x="20" y="${27 + i * 34}" width="130" height="24" rx="5" class="${cell[i] ? 'sd-nong' : 'sd-net'}"/>` + sd.chu(85, 43 + i * 34, cell[i] ? `cell ${i ? 'dưới' : 'trên'}` : '(ô trống)', 'sd-mo', 'middle')).join('');
  const BMS = `<rect x="230" y="20" width="110" height="80" rx="3" class="sd-net sd-to"/>` + sd.chu(285, 14, 'BMS 2S', 'sd-chu', 'middle')
    + Object.entries(Y).map(([t, y]) => sd.chu(236, y + 4, t, 'sd-mo')).join('') + sd.chu(334, 44, 'P+', 'sd-mo', 'end') + sd.chu(334, 76, 'P−', 'sd-mo', 'end')
    + sd.day('160,34 230,34', true) + sd.day('160,56 230,56') + sd.day('160,78 230,78') + sd.day('340,40 356,40', true) + sd.day('340,72 356,72');
  const dongHo = (a, b) => { const [ax, ay] = diem(a), [bx, by] = diem(b);
    return sd.dongHo(180, 140, 'V') + sd.day(`${ax},${ay} ${ax},140 196,140`, true) + sd.day(`${bx},${by} ${bx},160 180,160 180,156`) + sd.cham(ax, ay) + sd.cham(bx, by)
      + sd.chu(10, 150, `que đỏ ${a} · que đen ${b}`, 'sd-mo'); };
  const hinh = (cell, do_, chu) => sd.svg(360, 170, HOP(cell) + BMS + (do_ ? dongHo(...do_) : '') + sd.chu(10, 12, chu, 'sd-mo'), chu);
  const hCell = sd.svg(340, 150, [0, 1].map(i => { const x = 40 + i * 150; return `<rect x="${x}" y="30" width="110" height="28" rx="6" class="sd-net"/>` + sd.chu(x + 55, 49, `cell ${i + 1}`, 'sd-mo', 'middle')
    + sd.chu(x + 4, 24, '−', 'sd-neg') + sd.chu(x + 98, 24, '+', 'sd-pos') + sd.day(`${x + 8},58 ${x + 8},100 ${x + 39},100`) + sd.day(`${x + 102},58 ${x + 102},100 ${x + 71},100`) + sd.dongHo(x + 55, 100, 'V'); }).join('')
    + sd.chu(170, 140, 'đo DCV 20 từng cell trần, lệch ≤ 0.1V', 'sd-mo', 'middle'), 'Đo áp từng cell trước khi ghép');
  BAI.dangKy({
    id: '16.2',
    muc_tieu: 'Robot cần khoảng 7–8V (motor mạnh hơn, đủ dư cho hạ áp 5V): 2 cell nối tiếp = pack <b>2S</b>. Ráp pack với mạch bảo vệ BMS 2S theo thứ tự không bao giờ để hở cực pin, và đo được áp từng cell.',
    nguon: '2 cell 18650 (đã sạc đầy ở 16.1)',
    can: [K.can.cell(2), K.can.de18650(2), K.can.bms2s(), K.can.dh(), K.can.moHan()],
    kien_thuc: `<p>Nối tiếp cộng áp: 2S = 7.2–7.4V danh nghĩa, <b>đầy 8.4V</b>, cạn ~6V. Dòng xả vẫn là của 1 cell — và nối tắt pack còn mạnh hơn 1 cell.</p>
      <p>BMS 2S giám sát <b>từng</b> cell: cần 3 dây từ pack — <b>B−</b> (âm cell dưới), <b>BM</b> (điểm nối giữa 2 cell), <b>B+</b> (dương cell trên). Cell nào quá thấp/quá cao hoặc dòng quá lớn → BMS ngắt đầu ra <b>P−/P+</b>. Robot lấy điện ở P−/P+. Ngưỡng cụ thể tuỳ board: đọc trang shop.</p>
      <p><b>2 cell phải gần bằng nhau</b> (lệch ≤ 0.1V) trước khi ghép: lệch nhiều thì cell yếu chạm ngưỡng cắt trước, robot dừng sớm; BMS rẻ thường không có mạch cân bằng.</p>
      <p><b>Sạc pack này thế nào:</b> tháo từng cell ra, sạc riêng bằng 16.1, rồi lắp lại. Không dùng TP4056 cho cả pack (chỉ sạc tới 4.2V). <b>Không</b> gắn 2 module TP4056 vào 2 cell đang nối tiếp rồi cắm chung một cục sạc: GND 2 module nối nhau qua cục sạc → nối tắt cell dưới.</p>
      <p>Thứ tự an toàn: hàn dây BMS vào hộp <b>khi hộp rỗng</b> → đo Ω → lắp cell dưới → đo → lắp cell trên → đo. Mỗi lần chỉ thêm một thứ.</p>`,
    code: null,
    du_doan: '<p>Cell 4.18V + 4.17V → B−↔BM ≈ 4.17, BM↔B+ ≈ 4.18, B−↔B+ ≈ 8.35, P−↔P+ ≈ 8.35.</p>',
    khoi: 'Tháo cell trên ra trước (bỏ nối tiếp), rồi cell dưới — dùng găng hoặc khăn khô nếu ấm. Cell nóng, phồng, xì hơi hoặc có khói: <b>không cầm</b>, không cúi sát, mở cửa cho thoáng, để yên trên nền gạch xa đồ dễ cháy; có lửa thì tránh xa và gọi 114.',
    phan: [
      {
        ten: 'Phần 1 · Hàn BMS vào hộp rỗng',
        gioi_thieu: 'Mặt bàn trống, không có kim loại vương vãi. Chưa có cell nào trong hộp.',
        buoc: [
          { ten: 'Đo 2 cell, chọn cặp', kiem_truoc: true, lam: ['Sạc đầy cả 2 cell bằng 16.1 (từng cell một). Nghỉ 1 giờ. Đo <code>DCV 20</code> từng cell trần, ghi lại.'], hinh: hCell, kiem: { thay: 'Mỗi cell ≥ 4.1V và 2 cell lệch nhau ≤ 0.1V.', neu_khong: 'Lệch > 0.1V: sạc lại cell thấp; vẫn lệch → không ghép cặp, dùng cell khác.' } },
          { ten: 'Tìm 3 điểm trên hộp 2 ô', kiem_truoc: true, lam: ['Hộp rỗng. Dây đỏ = B+ (dương ô trên), dây đen = B− (âm ô dưới). Điểm giữa = lá kim loại nối 2 ô ở đầu kia hộp (có hộp có sẵn dây thứ 3). Thang thông mạch: xác nhận lá giữa không thông với dây đỏ hay đen khi hộp rỗng.'], hinh: hinh([0, 0], null, 'hộp rỗng: tìm B−, điểm giữa, B+'),
            kiem: { thay: 'Biết chắc 3 điểm, không cặp nào thông nhau.', neu_khong: 'Không tìm ra điểm giữa: chưa đi tiếp, chụp ảnh nhờ người biết điện tử xem.' } },
          { ten: 'Hàn 3 dây vào BMS', lam: ['Hộp vẫn rỗng. Đen (B− hộp) → miếng <b>B−</b>. Dây từ lá giữa → <b>BM</b>. Đỏ (B+ hộp) → <b>B+</b>. Hàn thêm 2 dây ra ở <b>P−</b> (đen), <b>P+</b> (đỏ), đầu kia để tách xa nhau, bọc băng keo đầu.'], hinh: hinh([0, 0], null, 'hàn 3 dây khi hộp còn rỗng'),
            kiem: { thay: 'Mối hàn không dính sang miếng bên cạnh. Ω B−↔BM, BM↔B+, P−↔P+ đều không gần 0.', neu_khong: 'Cặp nào gần 0Ω: có thiếc dính — sửa trước khi có cell.' } },
        ],
      },
      {
        ten: 'Phần 2 · Lắp từng cell, đo từng điểm',
        buoc: [
          { ten: 'Lắp cell dưới, đo', kiem_truoc: true, lam: ['Lắp 1 cell vào ô nối với B− (ô dưới), đúng dấu. <code>DCV 20</code>: que đen B−, que đỏ BM.'], hinh: hinh([0, 1], ['BM', 'B−'], 'chỉ cell dưới: đo BM ↔ B−'),
            kiem: { thay: 'B−↔BM ≈ áp cell dưới (số dương).', neu_khong: 'Số âm: cell lắp ngược — tháo ra. 0V: tiếp điểm không chạm.' } },
          { ten: 'Lắp cell trên, đo 3 cặp', kiem_truoc: true, lam: ['Lắp cell thứ hai, đúng dấu (thường ngược chiều cell dưới trong hộp). Đo: BM↔B+, B−↔B+.'], hinh: hinh([1, 1], ['B+', 'B−'], 'đủ 2 cell: đo B+ ↔ B− (và B+ ↔ BM)'),
            kiem: { thay: 'BM↔B+ ≈ cell trên. B−↔B+ ≈ tổng 2 cell (≈ 8.3–8.4V khi đầy).', neu_khong: 'B−↔B+ ≈ 0 trong khi mỗi cell có áp: cell trên lắp ngược — <b>tháo ngay</b> (2 cell đang xả vào nhau), sờ xem có ấm không.' } },
          { ten: 'Đo đầu ra P−/P+', lam: ['Bóc băng keo 2 dây P, đo DCV P−↔P+ rồi bọc lại ngay, tách xa nhau.'], hinh: hinh([1, 1], ['P+', 'P−'], 'đầu ra cho robot: P+ ↔ P−'),
            kiem: { thay: 'P−↔P+ ≈ B−↔B+.', neu_khong: '0V: BMS đang ngắt. Một số BMS cần "đánh thức" lần đầu bằng áp sạc — làm theo trang shop, không tự nối tắt để mở.' } },
          { ten: 'Cất pack', lam: ['Tháo cell trên ra khi chưa dùng (pack không còn nối tiếp). Ghi áp 2 cell vào bảng.'], hinh: hinh([0, 1], null, 'cất: tháo cell trên') },
        ],
      },
    ],
    bang_do: [{ ten: 'Pack 2S', cot: ['B−↔BM', 'BM↔B+', 'B−↔B+', 'P−↔P+'], hang: [{ ten: 'Số đo (V)', du_doan: ['≈ 4.2', '≈ 4.2', '≈ 8.4', '≈ 8.4'] }] }],
    bay: ['Hàn BMS khi đã có cell trong hộp: mỏ hàn/thiếc chạm 2 miếng = nối tắt cell.', 'Nhầm thứ tự B−/BM/B+: BMS nối tắt một cell.', 'Sạc 2 cell nối tiếp bằng 2 TP4056 chung một cục sạc: nối tắt cell dưới qua GND chung.', 'Dùng BMS 3S/4S cho pack 2S: không bảo vệ đúng.', 'Ghép cell lệch áp nhiều hoặc khác loại.'],
    robot: ['17.1: dây P+/P− là nguồn của robot: vào VM của DRV8833 (≤ 10.8V) và vào LM2596 hạ xuống 5V cho board.'],
  });
})();
