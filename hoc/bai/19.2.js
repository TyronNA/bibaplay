// Bài 19.2 — Đi thẳng: vòng hở / PI từng bánh / PI + bù lệch. Mạch như cuối 19.1.
(function () {
  const sd = SD;
  const khoi = sd.svg(380, 220, sd.mui
    + sd.chu(6, 34, 'đích 200', 'sd-chu') + K.mt(60, 30, 96, 30) + sd.hop(96, 14, 70, 32, 'PI trái') + K.mt(166, 30, 196, 30) + sd.hop(196, 14, 84, 32, 'motor trái')
    + sd.chu(6, 124, 'đích 200', 'sd-chu') + K.mt(60, 120, 96, 120) + sd.hop(96, 104, 70, 32, 'PI phải') + K.mt(166, 120, 196, 120) + sd.hop(196, 104, 84, 32, 'motor phải')
    + sd.day('280,30 330,30 330,60') + sd.day('280,120 330,120 330,90') + sd.hop(290, 60, 84, 30, 's_T − s_P')
    + sd.day('290,75 70,75') + K.mt(70, 75, 70, 34) + K.mt(70, 75, 70, 116) + sd.chu(80, 70, 'bù lệch: trái −, phải +', 'sd-mo')
    + sd.chu(6, 170, 's = quãng mỗi bánh đã đi (encoder)', 'sd-mo') + sd.chu(6, 190, 'bánh trái đi xa hơn → robot đang quẹo phải', 'sd-mo')
    + sd.chu(6, 210, '→ bớt tốc trái, thêm tốc phải', 'sd-mo'),
    'Hai vòng PI tốc độ riêng cho 2 bánh; khối bù lệch lấy hiệu quãng đường 2 bánh để chỉnh đích của từng bánh');
  const nen = [...K.robot17(), ...K.p4.enc().map(K.cu), K.cu(K.espRobot(K.p4.encEsp))];

  BAI.dangKy({
    id: '19.2',
    muc_tieu: 'Cho robot đi thẳng 1.5m theo 3 cách rồi đo xem nó lệch khỏi đường thẳng bao nhiêu. Cách 1: hai bánh cùng duty. Cách 2: mỗi bánh một vòng PI giữ tốc độ (như 15.4). Cách 3: thêm bù lệch, bánh nào đã đi xa hơn thì chạy chậm lại. Hai motor TT không bao giờ giống hệt nhau, và bài này cho thấy phải làm gì để robot vẫn đi thẳng.',
    nguon: 'pack 2S → LM2596 → board · WiFi',
    can: [K.can.robot17(), K.can.thuoc(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_19_2.c',
    kien_thuc: `
      <p><b>Cùng duty</b>: 2 motor khác nhau về ma sát hộp số, về dây quấn, về lốp. Cùng 40% duty thì một bánh có thể nhanh hơn bánh kia 5–10%, và robot đi thành một cung tròn.</p>
      <p><b>PI từng bánh</b> (15.4, giờ là 2 vòng chạy song song): mỗi bánh bám đích 200mm/s. Tốc độ trung bình bằng nhau, nhưng lúc khởi động một bánh có thể bắt kịp chậm hơn bánh kia vài phần mười giây. Quãng hụt đó <b>không bao giờ được bù lại</b>, vì PI chỉ quan tâm tốc độ hiện tại, và robot lệch hướng một góc cố định.</p>
      <p><b>Bù lệch</b> nhìn thẳng vào thứ cần giữ: quãng đường 2 bánh phải bằng nhau. Code tính <code>lệch = s_trái − s_phải</code> (mm), rồi đặt đích trái = 200 − 1·lệch, phải = 200 + 1·lệch. Bánh nào đi trước sẽ chậm lại tới khi bánh kia đuổi kịp.</p>
      <p>Robot bắt đầu chạy khi bạn nhấn công tắc va chạm (1 giây sau, đủ rút tay). Mỗi lần nhấn thì chạy cách kế tiếp: hở → PI → PI + bù. Đi đủ 1.5m, hoặc gặp vật, thì dừng.</p>`,
    so_do: [{ nhan: '2 vòng PI + bù lệch', svg: khoi, chu: 'Bù lệch là vòng thứ ba, bọc ngoài 2 vòng tốc độ.' }],
    du_doan: `<p><b>Hở</b>: lệch ngang ở cuối 5–20cm, về phía bánh yếu hơn.</p>
      <p><b>PI</b>: đỡ hơn, còn lệch vài cm tới hơn 10cm, tuỳ lúc khởi động.</p>
      <p><b>PI + bù</b>: 1–3cm. Đồ thị <code>lech_mm</code> trên trạm dao động quanh 0 thay vì trôi dần.</p>`,
    sau: `<h3>Lệch 1% đường kính bánh thì lệch bao nhiêu</h3>
      <p>Hai bánh chạy cùng số vòng nhưng bánh phải to hơn 1%. Sau 1.5m, bánh phải đi xa hơn Δs ≈ 15mm. Góc lệch θ = Δs / b = 15/135 ≈ 0.11 rad ≈ 6.4°. Góc tăng đều theo quãng đường, nên lệch ngang cuối ≈ L·θ/2 = 1500 × 0.11 / 2 ≈ <b>83mm</b>. Chỉ 1% đường kính đã lệch 8cm.</p>
      <p>Bù lệch làm số <b>xung</b> 2 bánh bằng nhau. Nếu 2 bánh khác đường kính thì cùng số xung vẫn khác quãng đường, và robot vẫn lệch. Robot kỹ hơn hiệu chuẩn mm/xung riêng cho từng bánh (thử ở bài 19.5).</p>
      <h3>Hệ số bù K = 2</h3>
      <p>Chênh tốc độ 2 bánh = 2·K·lệch/2 = K·lệch. Lệch 10mm thì chênh 20mm/s, và phần lệch co lại theo kiểu hàm mũ với hằng số thời gian 1/K = 0.5s. K lớn thì sửa nhanh nhưng robot lắc qua lại, vì tốc độ chỉ đo được mỗi 200ms và rất thô.</p>
      <h3>Feed-forward</h3>
      <p>PI trong code không bắt đầu từ 0: <code>duty = 20% + 0.07 × đích</code> là phần "đoán trước" (feed-forward), cộng thêm phần PI sửa sai. Motor cần ~20% mới bắt đầu quay (ma sát hộp số), nên phần đoán trước giúp PI không phải tự leo từ 0 lên mỗi lần khởi động. Hai số 20% và 0.07 là đoán: nhìn đồ thị dT, dP ở tốc độ đều để chỉnh.</p>`,
    hoi: [
      ['PI giữ mỗi bánh đúng 200mm/s. Vì sao robot vẫn có thể lệch?', 'PI chỉ giữ tốc độ <b>hiện tại</b>. Quãng một bánh hụt lúc khởi động (bắt kịp chậm hơn) không bao giờ được đòi lại, và góc lệch đó giữ nguyên suốt quãng sau.'],
      ['lech_mm = +12 (bánh trái đi xa hơn). Code đặt đích 2 bánh thế nào (K = 2)?', 'bù = K·lệch/2 = 12 → trái 200 − 12 = <b>188</b>, phải 200 + 12 = <b>212</b> mm/s.'],
      ['Bù lệch về 0 xung mà robot vẫn cong đều về một phía. Nghi gì?', 'Hai bánh khác đường kính (lốp mòn, bơm khác), nên cùng số xung mà khác quãng. Cần mm/xung riêng từng bánh.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nạp code', cot: 63,
        buoc: [
          { ten: 'Robot như cuối 19.1, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Encoder vẫn cắm như 19.1.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 19.2', ['menuconfig: Bai hoc → 19.2; Robot (Phan 4) → Quang duong moi xung = số đo ở 19.1. <code>idf.py flash</code>.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Bánh trên không, rồi xuống sàn', ke_thua: true,
        gioi_thieu: 'Dán một đường băng keo thẳng dài 2m trên sàn trống. Robot đặt ở đầu vạch, tâm robot ngay trên vạch, mũi dọc theo vạch.',
        buoc: [
          K.camPack('Cắm P+, bánh trên không', ['Kê bánh. Bấm <b>M 1</b> trên trạm, rồi nhấn công tắc va chạm, rút tay.'],
            { thay: 'Sau 1 giây 2 bánh quay. Đồ thị vT, vP leo lên và dao động quanh 200. Sau ~7.5 giây tự dừng (bánh quay đủ quãng 1.5m).', neu_khong: 'vT hoặc vP = 0 mà bánh vẫn quay: encoder bên đó chưa đếm (19.1). Tốc độ lắc mạnh ±100: bánh không tải nên PI dễ dao động, xuống sàn sẽ êm hơn.' }),
          { ten: 'Chạy 3 cách trên sàn', cap_dien: true, lam: ['Rút P+, đặt robot ở đầu vạch, cắm P+. Bấm <b>M 0</b>, nhấn công tắc. Robot dừng thì đo khoảng cách từ tâm robot tới vạch (bằng thước, ghi dấu: lệch trái +, lệch phải −). Đưa robot về, lần lượt nhấn tiếp cho cách 1 và 2 (hoặc bấm M 1, M 2 trước khi nhấn).'],
            kiem: { thay: 'Mỗi lần nhật ký in "dung sau 1500mm … Lech xung T-P". Cách 2 lệch ít nhất.', neu_khong: 'Robot quẹo gắt ngay khi chạy (cách 1, 2): một encoder đang báo sai bên, kiểm lại BT/BP ở 19.1.' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Lệch ngang sau 1.5m (mm, trái +)', cot: ['Lần 1', 'Lần 2', 'Lần 3'], hang: [{ ten: 'Cùng duty', du_doan: ['±50–200', '', ''] }, { ten: 'PI từng bánh', du_doan: ['±20–100', '', ''] }, { ten: 'PI + bù lệch', du_doan: ['±10–30', '', ''] }] }],
    bay: ['Chưa điền mm/xung của 19.1: quãng 1.5m tính sai, robot dừng sớm/muộn.', 'Để K bù quá lớn: robot lắc lư như rắn.', 'Chạy trên thảm dày một bên, sàn trơn một bên: bánh trượt, encoder đếm đủ mà robot vẫn lệch.'],
    robot: ['Cả 3 bài kế tiếp dùng PI từng bánh. Muốn "đi thẳng" chính xác hơn nữa thì cần biết hướng thật của robot: gyro (19.4).'],
  });
})();
