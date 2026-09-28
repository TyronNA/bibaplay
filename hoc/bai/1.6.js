// Bài 1.6 — Nội trở pin. Dây đỏ hộp pin vào 2a; dây vàng 2c → T+ là "công tắc tải". 5 × 100Ω song song giữa T+ và B-.
(function () {
  const PIN = { ...K.PIN, cong: '2a' };
  const COT = [6, 8, 10, 12, 14];
  const tai = COT.flatMap((c, i) => [K.day('do' + i, `T+:${c}`, `${c}a`, 'do'), K.tro('r' + i, [`${c}e`, `${c}f`], '100'), K.day('den' + i, `${c}j`, `B-:${c}`, 'den')]);
  const CT = K.day('ct', '2c', 'T+:3', 'vang');
  const sd = SD;
  const soDo = sd.svg(300, 190, sd.chu(20, 20, 'hộp pin', 'sd-mo') + `<rect x="20" y="30" width="80" height="130" rx="4" class="sd-net"/>`
    + sd.pin(60, 60, '') + sd.troNgang(40, 115, 40, 'r') + sd.day('60,60 60,40 150,40') + sd.day('60,70 60,115 40,115') + sd.day('80,115 80,170 220,170')
    + sd.chu(150, 34, 'U_hở / U_tải', 'sd-mo') + sd.tro(220, 40, 130, '≈ 20Ω') + sd.day('150,40 220,40'),
  'Pin thật = pin lý tưởng nối tiếp một điện trở nhỏ r bên trong');
  BAI.dangKy({
    id: '1.6',
    muc_tieu: 'Đo áp pin lúc không tải và lúc kéo ~0.24A, tính ra điện trở bên trong pin. Đây là lý do ESP32 reset khi pin yếu.',
    can: [K.can.tro('100', 5), ...K.coBan(12)],
    kien_thuc: `<p>Pin thật = một nguồn áp lý tưởng nối tiếp một điện trở nhỏ <code>r</code> nằm bên trong. Kéo dòng I thì mất <code>I·r</code> trên r, áp ra ngoài tụt: <code>U_tải = U_hở − I·r</code>.</p>
      <p>5 con 100Ω song song ≈ 20Ω → I ≈ 0.24A. <b>Mỗi con 0.23W, sát giới hạn 1/4W</b>: chỉ lắp pin ≤ 5 giây mỗi lần đo, rồi tháo.</p>
      <p>Dây vàng <b>2c → thanh +</b> là công tắc tải: rút ra thì pin không nối gì (đo U_hở), cắm vào thì 5 điện trở ăn điện. Chỉ cắm/rút dây này khi hộp pin <b>rỗng</b>.</p>`,
    so_do: [{ nhan: 'Mô hình pin', svg: soDo, chu: 'U_tải thấp hơn U_hở một khoảng I·r.' }],
    du_doan: '<p>AAA kiềm mới cỡ 0.15–0.3Ω mỗi viên → hộp ~0.5–1Ω. Với I ≈ 0.24A: áp tụt 0.1–0.25V. Pin càng yếu r càng lớn.</p>',
    sau: `<h3>Mô hình Thevenin: pin = nguồn lý tưởng + r</h3>
      <p>Hai số đo là đủ để tính r: <code>I = U_tải / R_tải</code> (dùng áp <b>lúc có tải</b>), rồi <code>r = (U_hở − U_tải) / I</code>. Ví dụ U_hở 4.78V, U_tải 4.62V qua 20Ω: I = 0.231A, r = 0.16 / 0.231 ≈ <b>0.69Ω</b>.</p>
      <p>Mô hình này dùng lại được cho mọi nguồn: chân GPIO (bài 9.2), cầu phân áp (2.5), ổn áp. Nguồn nào cũng có một r; câu hỏi chỉ là r lớn cỡ nào so với tải.</p>
      <h3>Công suất lớn nhất lấy được</h3>
      <p>Tải R nối vào pin r: <code>P_tải = E²·R / (R + r)²</code>. Lấy đạo hàm theo R, cực đại ở <code>R = r</code>, khi đó P = E²/(4r). Với r ≈ 0.7Ω: ~8W — nhưng lúc đó một nửa công suất đốt ngay trong pin, pin nóng rất nhanh. Mạch thật luôn chạy với R ≫ r.</p>
      <h3>ESP32 reset vì đâu</h3>
      <p>WiFi phát làm board kéo từng đợt ~0.3–0.5A. Pin yếu có r ~1.5Ω → áp tụt 0.5–0.75V đúng lúc đó → ổn áp hết dư (bài 8.2) → 3V3 sụt → chip reset. Bài 13.3 làm lại chuyện này với motor.</p>`,
    hoi: [
      ['U_hở = 4.70V, U_tải = 4.45V qua 20Ω. Tính r.', 'I = 4.45/20 ≈ 0.223A; r = 0.25/0.223 ≈ <b>1.1Ω</b>: pin đã yếu hơn pin mới.'],
      ['Vì sao phải lấy I = U_tải / R, không lấy U_hở / R?', 'Dòng thật chạy qua tải được quyết định bởi áp <b>trên tải</b> lúc đó. U_hở không còn nằm trên tải khi có dòng, vì một phần đã mất trên r.'],
      ['Pin r = 1Ω, ESP32 kéo đỉnh 0.5A. Áp pin tụt bao nhiêu?', '0.5 × 1 = <b>0.5V</b>. Hộp 4.78V còn ~4.28V — đã dưới mức 4.4V AMS1117 cần (bài 8.2).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Ráp tải, chưa cắm công tắc',
        buoc: [
          { ten: 'Nối hộp pin rỗng: đỏ vào 2a', lam: ['Hộp pin rỗng. Dây đỏ của hộp cắm vào <b>2a</b> (không phải thanh +), dây đen vào thanh − dưới.'], board: { them: [PIN] } },
          { ten: 'Cắm 5 con 100Ω và 10 dây', lam: ['5 con 100Ω vắt qua rãnh ở cột 6, 8, 10, 12, 14 (e → f). Mỗi cột: dây đỏ thanh + → hàng a, dây đen hàng j → thanh −.', 'Chưa cắm dây vàng.'], board: { them: tai } },
          {
            ten: 'Đo trước khi cấp điện', kiem_truoc: true,
            lam: ['Núm <code>Ω 200</code>. Que đỏ chạm thanh +, que đen chạm thanh −: đo cụm tải.', 'Rồi chạm 2 tiếp điểm trong hộp pin: công tắc chưa cắm nên phải hở.'],
            board: { them: [K.dh('Ω 200', 'T+:16', 'B-:16', '≈ 20.0')] },
            kiem: { thay: 'Cụm tải ≈ 20Ω (18–22). Tiếp điểm hộp pin: <code>1</code> (hở).', neu_khong: 'Cụm tải dưới 15Ω: có con nào sai giá trị hoặc dây nối tắt. Tiếp điểm hộp pin ra ~20Ω: dây đỏ hộp pin đang cắm vào thanh + chứ không phải 2a. <b>Không lắp pin.</b>' },
          },
        ],
      },
      {
        ten: 'Phần 2 · Đo U_hở rồi U_tải', ke_thua: true,
        buoc: [
          K.lapPin('Lắp pin, đo U_hở', ['Công tắc chưa cắm. Núm <code>DCV 20</code>, que đỏ 2d, que đen thanh −.'], { them: [K.dh('DCV 20', '2d', 'B-:4', '≈ 4.78')] }, { thay: '≈ 4.7–4.8V, số đứng yên.', neu_khong: '' }),
          K.thaoPin(['Cắm dây vàng <b>2c → thanh +</b> (công tắc).'], { them: [CT] }),
          K.buocOm('Ω 200', '≈ 20.0', '≈ 20Ω.', 'Dưới 15Ω: kiểm lại.'),
          K.lapPin('Lắp pin, đọc U_tải trong 5 giây, tháo pin', ['Que đỏ 2d, que đen thanh −. Đọc số trong 2–3 giây đầu, ghi, <b>tháo pin ngay</b>.'], { them: [K.dh('DCV 20', '2d', 'B-:4', '≈ 4.6')] },
            { thay: 'Thấp hơn U_hở 0.1–0.25V, và tụt dần nếu để lâu.', neu_khong: 'Điện trở nóng rát hoặc có mùi: tháo pin ngay.' }),
          K.thaoPin(['Đợi 1 phút cho điện trở nguội rồi mới rút.']),
        ],
      },
    ],
    bang_do: [{ ten: 'Nội trở', cot: ['U_hở', 'U_tải', 'R tải đo', 'I = U_tải/R', 'r = (U_hở − U_tải)/I'], hang: [{ ten: 'Pin đang dùng', du_doan: ['≈ 4.78', '≈ 4.6', '≈ 20', '≈ 0.23 A', '0.5–1 Ω'] }] }],
    bay: ['Để tải 20Ω lâu: mỗi con 100Ω ăn 0.23W, nóng tới bỏng. ≤ 5 giây mỗi lần.', 'Cắm dây đỏ hộp pin vào thanh + thay vì 2a: không còn đo được U_hở, và tải ăn điện ngay khi lắp pin.', 'Không làm bài này với pin lithium: nội trở nhỏ hơn nhiều, mạch sai một chút là dòng hàng ampe.'],
    robot: ['Motor khởi động kéo dòng lớn → áp pin tụt → ESP32 reset (brownout, bài 13.3). Pin yếu thì r tăng, tụt càng nhiều.', 'Chọn pin robot theo cả dung lượng lẫn khả năng xả dòng (nội trở).'],
  });
})();
