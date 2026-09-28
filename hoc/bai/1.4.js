// Bài 1.4 — Định luật Ohm. Một điện trở vắt qua rãnh ở cột 5, đo U song song rồi đo I nối tiếp.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), DK = K.day('dK', '5j', 'B-:5', 'den');
  const R = gt => K.tro('r', ['5e', '5f'], gt);
  const sd = SD;
  const soDo = sd.svg(300, 180, sd.pin(50, 90, '4.78V') + sd.day('50,90 50,30 150,30 150,50') + sd.tro(150, 50, 70, 'R') + sd.day('150,120 150,134')
    + sd.dongHo(150, 150, 'mA') + sd.day('150,166 150,172 50,172 50,100') + sd.dongHo(240, 85, 'V') + sd.day('240,69 240,50 150,50') + sd.day('240,101 240,120 150,120') + sd.cham(150, 50) + sd.cham(150, 120),
  'R nối vào pin; vôn kế song song với R, ampe kế nối tiếp');
  BAI.dangKy({
    id: '1.4',
    poster: [5, 6],
    muc_tieu: 'Đo cả áp lẫn dòng trên cùng một điện trở, tính <code>R = U/I</code>, và thấy số đó không đổi khi đổi điện trở khác giá trị: đó là định luật Ohm.',
    can: [K.can.tro('220'), K.can.tro('1k'), K.can.tro('10k'), K.can.tro('100k'), ...K.coBan(3)],
    kien_thuc: `<p>Định luật Ohm: <code>U = I · R</code>. Với điện trở, tỉ số U/I là một hằng số (chính là R). Với LED thì không (bài 4.1): LED giữ áp gần như cố định dù dòng đổi.</p>
      <p>Bài này nối điện trở <b>thẳng</b> vào pin, không có LED. Mọi điện trở dùng ở đây đều ≥ 220Ω nên công suất ≤ <code>4.78²/220 ≈ 0.10W</code>, dưới 1/4W. <b>Không</b> thay bằng con nhỏ hơn 100Ω (bài 1.5).</p>
      <p>Chỉ 1 đồng hồ: đo U trước (dây đen cắm), rồi thay dây đen bằng đồng hồ ở chế độ mA để đo I. Cách cắm mA giống bài 1.2.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Hai chỗ đặt đồng hồ; bài này đo lần lượt từng chỗ.' }],
    du_doan: `<p><code>I = 4.78 / R</code>: 220Ω → 21.7mA · 1k → 4.78mA · 10k → 0.478mA · 100k → 47.8µA.</p>`,
    sau: `<h3>Vẽ U theo I: đường thẳng đi qua gốc</h3>
      <p>Ghi 4 cặp (I, U) lên giấy kẻ ô: với điện trở, các điểm nằm trên một đường thẳng đi qua gốc toạ độ, <b>độ dốc chính là R</b>. Đo nhiều điểm rồi tính độ dốc chính xác hơn tính từ một điểm, vì sai số từng điểm bù nhau.</p>
      <p>Với LED thì đường này cong: gần như nằm ngang ở ~1.8–2V, dòng tăng mà áp gần như đứng yên. Tỉ số U/I tại mỗi điểm khác nhau, nên "điện trở của LED" không phải một con số.</p>
      <h3>Sai số của R tính ra</h3>
      <p><code>R = U / I</code>: sai số tương đối của R ≈ sai số của U cộng sai số của I. Đồng hồ ±0.5% ở thang V và ±1% ở thang mA → R tính ra lệch tới ~1.5% mà không có gì sai cả. Cộng thêm sai số ±5% của chính điện trở, lệch 5–6% so với số in là bình thường.</p>
      <p>Với 100k (47.8µA), thang 20mA chỉ lẻ tới 0.01mA = 10µA: số hiện 0.05, sai tới ~5%. Đó là lúc phải lên thang nhỏ hơn (nếu máy có 200µA) hoặc tính I từ U/R.</p>`,
    hoi: [
      ['Con 1k: đo U = 4.76V, I = 4.70mA. R tính ra bằng bao nhiêu? Có "sai" không?', 'R = 4.76 / 0.00470 ≈ <b>1013Ω</b>. Nằm trong ±5% của 1k, không sai.'],
      ['Vì sao với LED, U/I không phải hằng số?', 'LED giữ áp gần như cố định (~1.8–2V) trong khi dòng đổi nhiều lần. U gần như đứng yên còn I thay đổi, nên tỉ số đổi theo dòng.'],
      ['Mọi điện trở trong bài đều ≥ 220Ω. Công suất lớn nhất là bao nhiêu, có an toàn với loại 1/4W không?', 'P = 4.78² / 220 ≈ <b>0.10W</b> &lt; 0.25W: an toàn.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Ráp với 1k, đo U',
        buoc: [
          K.buocPin(),
          { ten: 'Cắm 1k và 2 dây', lam: [`Điện trở 1k (${K.tenVong('1k')}) vắt qua rãnh: <b>5e → 5f</b>. Dây đỏ thanh + (cột 5) → <b>5a</b>. Dây đen <b>5j</b> → thanh −.`], board: { them: [DA, R('1k'), DK] } },
          K.buocOm('Ω 20k', '≈ 1.00', '≈ 1k (1.00 ở thang 20k): pin chỉ thấy đúng 1 điện trở.', 'Dưới 0.9k hoặc gần 0: có dây nối tắt hoặc cắm nhầm điện trở.'),
          K.lapPin('Lắp pin, đo U trên điện trở', ['Núm <code>DCV 20</code>, que đỏ chân trên (5e), que đen chân dưới (5f).'], { them: [K.dh('DCV 20', 'r.1', 'r.2', '≈ 4.78')] },
            { thay: '≈ áp pin: điện trở là thứ duy nhất trong mạch.', neu_khong: 'Điện trở ấm: không bình thường với 1k, tháo pin kiểm lại giá trị.' }),
        ],
      },
      {
        ten: 'Phần 2 · Thay dây đen bằng đồng hồ, đo I', ke_thua: true,
        buoc: [
          K.thaoPin(['Rút dây đen 5j → thanh −. Giờ mạch hở, không có gì chạy.'], { bo: ['dK'] }),
          {
            ten: 'Đồng hồ sang mA, kẹp vào chỗ hở', kiem_truoc: true,
            lam: ['Que đỏ sang lỗ mA (nếu đồng hồ có lỗ riêng), núm <code>DCA 20m</code>.', 'Dây nhảy ở <b>5j</b> và ở thanh − (cột 7). Kẹp que đỏ vào dây 5j, que đen vào dây thanh −.'],
            board: { them: [K.dh('DCA 20m', '5j', 'B-:7', '—', 'mA')] },
            kiem: { thay: 'Đọc to: que đỏ lỗ mA, núm DCA, que đỏ ở 5j, que đen ở thanh −, <b>không que nào chạm thanh +</b>.', neu_khong: 'Sai bất kỳ điều nào: sửa. Không lắp pin.' },
          },
          K.lapPin('Lắp pin, đọc I', ['Đọc số mA. Tính <code>U/I</code> với U từ phần 1.'], { them: [K.dh('DCA 20m', '5j', 'B-:7', '≈ 4.78', 'mA')] },
            { thay: '≈ 4.7–4.8 mA → U/I ≈ 1000Ω.', neu_khong: '0: cầu chì mA đứt hoặc que ở lỗ V. Số âm: đảo que.' }),
        ],
      },
      {
        ten: 'Phần 3 · Đổi điện trở: 220Ω, 10k, 100k', ke_thua: true,
        gioi_thieu: 'Trước phần này: đo Ω rời cả 3 con (như bài 1.3) và ghi lại; con nào dưới 200Ω thì không dùng, vì lúc đồng hồ đang kẹp ở mA sẽ không đo Ω lại được. Mỗi giá trị làm đúng thứ tự: tháo pin → đổi điện trở → kiểm que → lắp pin đọc I → tháo pin. Thang dòng: 220Ω dùng DCA 200m; 10k dùng DCA 2m; 100k dùng DCA 200µ.',
        buoc: [
          K.thaoPin(['Con 220Ω sắp cắm phải là con đã đo Ω rời ở đầu phần này (209–231Ω). Không chắc thì đo lại rời trước khi cắm.', 'Rút 1k ra, cắm 220Ω vào đúng 5e → 5f. Đồng hồ giữ nguyên kẹp, núm lên <code>DCA 200m</code>.'], { bo: ['r'], them: [R('220')] }),
          { ten: 'Kiểm lại que trước khi lắp pin', kiem_truoc: true, lam: ['Que đỏ vẫn ở 5j, que đen vẫn ở thanh −, núm DCA 200m.'], board: { them: [K.dh('DCA 200m', '5j', 'B-:7', '—', 'mA')] }, kiem: { thay: 'Không que nào chạm thanh +.', neu_khong: 'Sửa trước khi lắp pin.' } },
          K.lapPin('Lắp pin, đọc I với 220Ω', ['Đọc nhanh, ghi, rồi tháo pin. 220Ω lúc này ăn ~0.1W, ấm nhẹ là bình thường.'], { them: [K.dh('DCA 200m', '5j', 'B-:7', '≈ 21.7', 'mA')] },
            { thay: '≈ 21–22 mA.', neu_khong: 'Nóng rõ: tháo pin, kiểm lại vòng màu (có thể cắm nhầm con 22Ω).' }),
          K.thaoPin(['Con 10k sắp cắm: đã đo rời (9.5–10.5k).', 'Rút 220Ω, cắm 10k (nâu-đen-cam) vào 5e → 5f. Núm xuống <code>DCA 2m</code>. Kẹp giữ nguyên.'], { bo: ['r'], them: [R('10k')] }),
          { ten: 'Kiểm lại que trước khi lắp pin', kiem_truoc: true, lam: ['Que đỏ vẫn ở 5j, que đen vẫn ở thanh −, núm DCA 2m.'], board: { them: [K.dh('DCA 2m', '5j', 'B-:7', '—', 'mA')] }, kiem: { thay: 'Không que nào chạm thanh +.', neu_khong: 'Sửa trước khi lắp pin.' } },
          K.lapPin('Lắp pin, đọc I với 10k', ['Đọc, ghi, tháo pin.'], { them: [K.dh('DCA 2m', '5j', 'B-:7', '≈ 0.478', 'mA')] },
            { thay: '≈ 0.47–0.48 mA.', neu_khong: 'Hiện <code>1</code>: quá thang, lên lại <code>DCA 20m</code>.' }),
          K.thaoPin(['Con 100k sắp cắm: đã đo rời (95–105k).', 'Rút 10k, cắm 100k (nâu-đen-vàng) vào 5e → 5f. Núm xuống <code>DCA 200µ</code>.'], { bo: ['r'], them: [R('100k')] }),
          { ten: 'Kiểm lại que trước khi lắp pin', kiem_truoc: true, lam: ['Que đỏ vẫn ở 5j, que đen vẫn ở thanh −, núm DCA 200µ.'], board: { them: [K.dh('DCA 200µ', '5j', 'B-:7', '—', 'mA')] }, kiem: { thay: 'Không que nào chạm thanh +.', neu_khong: 'Sửa trước khi lắp pin.' } },
          K.lapPin('Lắp pin, đọc I với 100k', ['Đọc, ghi, tháo pin.'], { them: [K.dh('DCA 200µ', '5j', 'B-:7', '≈ 47.8', 'mA')] },
            { thay: '≈ 47–48 µA.', neu_khong: 'Đọc ra 0: thang chưa đủ nhỏ, hoặc đồng hồ không có thang µA — ghi "không đo được".' }),
          K.thaoPin(['Tháo 2 kẹp. <b>Que đỏ về lỗ VΩ, núm về DCV 20.</b> Cắm lại dây đen 5j → thanh −.', 'U không cần đo lại cho từng con: điện trở là thứ duy nhất trong mạch nên U luôn ≈ áp pin. Chia U (phần 1) cho từng I là ra R.'], { them: [DK] }),
        ],
      },
    ],
    bang_do: [{ ten: 'U, I và U/I', cot: ['U (DCV)', 'I đo', 'U/I'], hang: [
      { ten: '220Ω', du_doan: ['≈ 4.75', '≈ 21.7 mA', '≈ 220'] }, { ten: '1k', du_doan: ['≈ 4.78', '≈ 4.78 mA', '≈ 1000'] },
      { ten: '10k', du_doan: ['≈ 4.78', '≈ 0.478 mA', '≈ 10k'] }, { ten: '100k', du_doan: ['≈ 4.78', '≈ 47.8 µA', '≈ 100k'] }] }],
    bay: ['Đo U mà đồng hồ còn ở mA: nối tắt pin. Mỗi lần đổi từ I sang U: <b>tháo pin, que đỏ về VΩ, núm về DCV</b> trước.', 'Thay điện trở nhỏ hơn 100Ω để "thử dòng lớn": quá 1/4W, nóng, cháy (bài 1.5).', 'Thang dòng nhỏ hơn dòng thật: báo quá thang hoặc đứt cầu chì. Luôn đi từ thang lớn xuống.'],
    robot: ['Mọi phép tính chọn điện trở sau này (LED từ GPIO, chân B transistor) đều là định luật Ohm.'],
  });
})();
