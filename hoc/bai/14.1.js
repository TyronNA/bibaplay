// Bài 14.1 — Công tắc va chạm. KW11 nằm ngoài board: COM → thanh −, NO → cột 12. GPIO12 → 12c, pull-up nội.
// Dùng lại code 9.4 (đếm nhấn có chống dội) — công tắc hành trình về điện chỉ là một nút nhấn.
(function () {
  const sd = SD;
  const hinhDo = (cap, thay) => sd.svg(330, 160, sd.hop(90, 30, 120, 50, 'KW11') + sd.day('114,80 114,110') + sd.day('150,80 150,110') + sd.day('186,80 186,110')
    + sd.chu(86, 100, 'chân', 'sd-mo', 'end') + sd.chu(119, 100, '1', 'sd-mo') + sd.chu(155, 100, '2', 'sd-mo') + sd.chu(191, 100, '3', 'sd-mo')
    + sd.day(`${cap[0]},110 ${cap[0]},136 64,136`, true) + sd.day(`${cap[1]},110 ${cap[1]},144 262,144`) + sd.chu(58, 140, 'que đỏ', 'sd-pos', 'end') + sd.chu(268, 148, 'que đen', 'sd-chu')
    + sd.chu(150, 20, thay, 'sd-mo', 'middle'), 'Que đồng hồ chạm 2 chân của công tắc hành trình');
  const SW = { id: 'sw', loai: 'ngoai', kieu: 'hop', chu: 'KW11', x: 470, chan: { COM: 'B-:14', NO: '12e' }, mau: ['den', 'vang'], nhan: 'công tắc (COM, NO)' };
  const ESP = K.esp({ GND: 'B-:3', G12: '12c' });
  const soDo = sd.svg(300, 170, sd.chu(20, 24, '3V3 (trong chip)', 'sd-pos') + sd.day('60,30 150,30') + sd.tro(150, 30, 40, '~45k') + sd.cham(150, 70) + sd.day('150,70 240,70') + sd.chu(246, 74, 'GPIO12', 'sd-chu')
    + sd.nut(150, 90, 40, 'COM–NO') + sd.day('150,70 150,90') + sd.day('150,130 150,146') + sd.dat(150, 146), 'Pull-up nội trong chip kéo GPIO12 lên 1; nhấn công tắc nối GPIO12 xuống GND');
  BAI.dangKy({
    id: '14.1',
    muc_tieu: 'Robot hút bụi biết mình đâm vào tường nhờ một thanh cản phía trước đè lên công tắc hành trình. Về điện đây chỉ là một nút nhấn: dò chân COM/NO/NC, nối COM → GND, NO → GPIO, bật pull-up nội.',
    can: [...K.coBanEsp(3), K.can.kw11(), K.can.kep(2)],
    kien_thuc: `<p>Công tắc hành trình (KW11-3Z) có 3 chân: <b>COM</b> chung, <b>NO</b> (normally open — thường hở, nhấn mới nối với COM), <b>NC</b> (normally closed — thường đóng, nhấn thì hở). Bên trong là một lá kim loại bật qua bật lại giữa NO và NC.</p>
      <p>Dùng COM + NO: nhả → GPIO12 chỉ nối với pull-up nội (~45k lên 3.3V) → đọc 1. Nhấn → GPIO12 nối thẳng GND → đọc 0. Giống hệt nút ở bài 9.3, nên bài này chạy lại code 9.4 (đếm có chống dội).</p>
      <p><b>Chân phải dò bằng đồng hồ trước</b> (chữ in C/NO/NC thường rất nhỏ hoặc không có). Chưa có số đo xác nhận chân nào là COM, NO thì không nối vào board.</p>
      <p>Chân công tắc là lá dẹt, không cắm vừa breadboard: nối bằng 2 kẹp cá sấu (hoặc hàn 2 dây). 2 kẹp không được chạm nhau — ở mạch này chạm nhau chỉ làm GPIO đọc 0, không hại gì, nhưng tập thói quen trước khi tới pin lithium.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Nhả = 1 (pull-up nội), nhấn = 0.' }],
    code: 'sandbox/esp32-bai/main/bai_9_4.c',
    du_doan: '<p>Mỗi lần gạt cần công tắc, số "chong doi" tăng đúng 1; số "tho" có thể nhảy nhiều hơn vì tiếp điểm nảy (bài 9.4).</p>',
    sau: `<h3>NO hay NC: chọn theo lúc hỏng</h3>
      <p>Bài dùng NO: bình thường hở, va chạm thì nối. Nếu dây công tắc đứt, GPIO luôn đọc 1 = "không va chạm" — robot cứ thế húc tường mà không biết. Nhiều máy công nghiệp dùng <b>NC</b> cho công tắc an toàn: bình thường đóng, va chạm hoặc <b>đứt dây</b> đều làm mở mạch → máy dừng. Thiết kế sao cho hỏng thì rơi về trạng thái an toàn (fail-safe).</p>
      <h3>Cần gạt là đòn bẩy</h3>
      <p>Nút bên trong cần lực F để bấm. Cần gạt dài d_cần, nút nằm cách trục d_nút: lực cần ở đầu cần <code>F_đầu = F · d_nút / d_cần</code>. Cần dài gấp 3 thì va chạm nhẹ gấp 3 cũng bấm được — đổi lại cần phải đi quãng dài hơn.</p>`,
    hoi: [
      ['Dùng NO, dây GPIO bị đứt. Robot hiểu thế nào?', 'GPIO chỉ còn pull-up → đọc 1 mãi = "không va chạm". Robot không biết mình đang húc tường.'],
      ['Nút cần 1.5N, nằm cách trục 5mm; cần gạt dài 25mm. Lực ở đầu cần?', '1.5 × 5/25 = <b>0.3N</b>.'],
      ['Vì sao số "thô" nhảy nhiều hơn số "chống dội"?', 'Lá kim loại nảy vài ms khi đóng: ngắt bắt từng lần nảy, bộ chống dội chờ 20ms mới tính.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Dò chân COM / NO / NC (chưa nối gì)',
        gioi_thieu: 'Công tắc chưa nối vào đâu, không có nguồn. Đồng hồ ở thang thông mạch (biểu tượng loa / diode).',
        buoc: [
          { ten: 'Thử cặp chân 1–2 và 1–3 khi nhả', kiem_truoc: true, lam: ['Núm thang thông mạch. Chạm que đỏ chân 1, que đen chân 2 — nghe có kêu không. Rồi chân 1–3, rồi 2–3. Ghi cặp nào kêu khi <b>nhả</b>.'], hinh: hinhDo([114, 150], 'nhả: tìm cặp kêu'),
            kiem: { thay: 'Đúng 1 cặp kêu khi nhả: đó là <b>COM–NC</b>.', neu_khong: 'Không cặp nào kêu, hoặc cả 3 cặp kêu: thử lại với que chạm chắc vào kim loại; vẫn vậy thì công tắc hỏng.' } },
          { ten: 'Giữ nhấn, thử lại', kiem_truoc: true, lam: ['Giữ cần công tắc (nghe "tách"). Thử lại 3 cặp. Cặp vừa kêu lúc nhả giờ phải im; một cặp khác kêu.'], hinh: hinhDo([150, 186], 'nhấn giữ: cặp mới kêu'),
            kiem: { thay: 'Nhấn: cặp mới kêu = <b>COM–NO</b>. Chân có mặt trong cả 2 cặp là <b>COM</b>. Ghi lại: COM = chân ?, NO = chân ?, NC = chân ?', neu_khong: 'Không tìm ra chân chung: chưa đi tiếp. Ghi lại các cặp đã thử, đo lại từ đầu với que tì chắc vào lá kim loại.' } },
        ],
      },
      {
        ten: 'Phần 2 · Nối vào board, đếm va chạm', cot: 24,
        buoc: [
          { ten: 'Kẹp COM và NO', lam: ['USB rút. Kẹp cá sấu 1: chân <b>COM</b> → dây nhảy → thanh − dưới (cột 14). Kẹp 2: chân <b>NO</b> → dây nhảy → <b>12e</b>. Chân NC để trống.'], board: { them: [SW] } },
          { ten: 'Dây từ board', lam: ['<code>GND</code> → thanh − dưới (cột 3). <code>12</code> → <b>12c</b>. Không dùng 3V3: pull-up nằm trong chip.'], board: { them: [ESP] } },
          { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 12b, que đen thanh −. Đo lúc nhả rồi giữ nhấn.'], board: { them: [K.dh('Ω 200k', '12b', 'B-:10', 'OL / ≈0')] },
            kiem: { thay: 'Nhả: OL (hoặc rất lớn). Nhấn: gần 0Ω. Đúng vậy là đã nối COM–NO.', neu_khong: 'Ngược lại (nhả ≈ 0, nhấn OL): đang dùng NC — đổi kẹp 2 sang chân NO. Luôn ≈ 0: 2 kẹp chạm nhau.' } },
          K.camUsb('Cắm USB, nạp 9.4', ['<code>idf.py menuconfig</code> → 9.4, <code>flash monitor</code>. Gạt cần công tắc 5 lần, mỗi lần dứt khoát.'], {}, { thay: '"chong doi" tăng đúng 5. "tho" có thể lớn hơn.', neu_khong: 'Không tăng: kẹp NO chưa vào cột 12, hoặc dây GPIO ở cột khác. Tăng khi không gạt: kẹp lỏng, rung.' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: 'Dò chân', cot: ['Kêu khi nhả', 'Kêu khi nhấn'], hang: [{ ten: 'Cặp chân', du_doan: ['COM–NC', 'COM–NO'] }] },
      { ten: 'Đếm 5 lần gạt', cot: ['tho', 'chong doi'], hang: [{ ten: 'Số in ra', du_doan: ['≥ 5', '5'] }] }],
    bay: ['Nối nhầm NC: logic đảo, robot tưởng đang va chạm suốt.', 'Nối COM vào 3V3 thay vì GND và NO vào GPIO mà không có pull-down: nhả thì chân thả nổi.', 'Cần công tắc quá cứng so với thanh cản: robot va nhẹ không bấm được — chọn loại cần dài.'],
    robot: ['Bài 17.1: công tắc này nằm sau thanh cản trước; GPIO12 xuống 0 = dừng, lùi, quay.'],
  });
})();
