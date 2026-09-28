// Bài 7.3 — Motor phát điện. Motor tháo từ quạt, 2 dây kẹp cá sấu vào 2 dây nhảy cắm cột 10 và cột 14.
(function () {
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 300, chan: { 1: '10c', 2: '14c' }, mau: ['do', 'den'], nhan: 'motor quạt' };
  const sd = SD;
  const svg = (w, h, s, nhan) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${nhan}" class="sd">${s}</svg>`;
  const hQuat = svg(320, 170, `<rect x="30" y="30" width="120" height="110" rx="10" class="sd-net"/>` + sd.chu(90, 22, 'thân quạt (mở vỏ)', 'sd-mo', 'middle')
    + `<rect x="45" y="80" width="60" height="45" rx="4" style="fill:#3B4652"/>` + sd.chu(75, 106, 'PIN Li', 'lk-trang', 'middle') + `<rect x="110" y="50" width="30" height="24" rx="2" class="sd-net"/>` + sd.chu(125, 66, 'mạch', 'sd-mo', 'middle')
    + `<circle cx="240" cy="70" r="28" style="fill:#B8BEC4;stroke:#6E767E"/>` + sd.chu(240, 75, 'M', 'sd-chu', 'middle') + `<path d="M140 58 C 180 50, 200 60, 214 64M140 66 C 180 80, 200 80, 214 76" class="sd-net"/>`
    + `<path d="M170 44l12 12M182 44l-12 12" class="sd-nong"/>` + sd.chu(176, 36, 'cắt TỪNG dây', 'sd-xau', 'middle') + sd.chu(90, 160, 'KHÔNG cắt/giật dây pin', 'sd-xau', 'middle'),
  'Trong quạt: pin lithium, mạch, motor. Chỉ cắt 2 dây motor, từng dây một');
  BAI.dangKy({
    id: '7.3',
    muc_tieu: 'Motor quay bằng tay thì phát ra áp. Khi chạy, áp đó chống lại nguồn — nên motor bị kẹt hoặc vừa khởi động kéo dòng lớn nhất. Đo điện trở motor để biết dòng khởi động.',
    nguon: 'không nguồn · motor tự phát',
    can: [K.can.motor(), { ten: 'Kìm cắt hoặc kéo', tim: 'kìm cắt', lk: 'kim-cat', sl: 1 }, K.can.kep(2), K.can.day(2), K.can.bb(), K.can.dh()],
    kien_thuc: `<p>Motor DC và máy phát là một: cuộn dây quay trong từ trường sinh ra áp (EMF ngược), tỉ lệ với tốc độ. Lúc chạy, dòng thật <code>I = (U_nguồn − U_ngược)/R</code>. Đứng yên → U_ngược = 0 → <code>I = U/R</code>: dòng khởi động/kẹt.</p>
      <p><b>Tháo quạt có pin lithium bên trong:</b> tắt công tắc trước. Không cắt, không giật, không để kim loại chạm 2 dây/2 cực của pin — nối tắt pin lithium là cháy. Chỉ cắt 2 dây motor, <b>từng dây một</b>, sát mạch để motor còn dây dài. Quấn băng dính riêng từng đầu dây còn lại trên mạch. Cất thân quạt + pin xa kim loại.</p>`,
    du_doan: '<p>R motor quạt nhỏ: cỡ 2–10Ω → dòng khởi động ở 4.78V cỡ 0.5–2A. Quay tay: vài chục tới vài trăm mV.</p>',
    so_do: [{ nhan: 'Motor làm máy phát', svg: SD.svg(300, 200, SD.motor(100, 100) + SD.day('100,84 100,40 200,40 200,84') + SD.dongHo(200, 100, 'V') + SD.day('100,116 100,160 200,160 200,116')
      + '<path d="M70 70 a40 40 0 0 0 0 60" class="sd-net" marker-end="url(#sd-mui)"/>' + SD.mui + SD.chu(20, 104, 'quay tay', 'sd-mo'),
      'Motor nối thẳng vôn kế, quay trục bằng tay'), chu: 'Không có pin: áp đồng hồ thấy là do chính motor sinh ra.' }],
    sau: `<h3>Mô hình motor DC: 2 phương trình</h3>
      <p><code>U = I·R + k·ω</code> (áp nguồn = sụt trên cuộn dây + áp ngược) và <code>τ = k·I</code> (mô-men tỉ lệ dòng). Trong đơn vị SI, k ở hai phương trình là <b>cùng một số</b>: đo được k bằng cách quay tay và đo áp là biết luôn motor khoẻ cỡ nào mỗi ampe.</p>
      <p>Đứng yên (ω = 0): <code>I_kẹt = U/R</code>. Không tải (τ ≈ 0, I ≈ 0): <code>ω_max ≈ U/k</code>. Ở giữa, tốc độ giảm tuyến tính khi tải tăng. Công suất cơ <code>P = τ·ω</code> lớn nhất ở <b>nửa tốc độ không tải</b>, khi đó dòng bằng nửa dòng kẹt.</p>
      <h3>Ví dụ số</h3>
      <p>Motor R = 5Ω ở 4.78V: I_kẹt ≈ 0.96A. Quay tay ~10 vòng/s (ω ≈ 63 rad/s) đo được 0.3V → k ≈ 0.3/63 ≈ 4.8mV·s/rad → ω_max ≈ 4.78/0.0048 ≈ 1000 rad/s ≈ 9500 vòng/phút: đúng cỡ motor quạt nhỏ.</p>`,
    hoi: [
      ['Motor R = 4Ω, cấp 4.78V. Dòng lúc kẹt?', '4.78/4 ≈ <b>1.2A</b>.'],
      ['Đang chạy không tải, dòng chỉ 0.1A. Áp ngược lúc đó bằng bao nhiêu (R = 4Ω)?', 'U − I·R = 4.78 − 0.4 = <b>4.38V</b>: gần hết áp nguồn bị áp ngược "ăn".'],
      ['Vì sao bánh xe robot bị kẹt là lúc nguy hiểm nhất cho driver?', 'ω = 0 → không có áp ngược → dòng = U/R lớn nhất, kéo dài bao lâu thì nóng bấy lâu.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Tháo motor',
        buoc: [
          { ten: 'Mở quạt, tìm 2 dây motor', lam: ['Tắt công tắc quạt. Mở vỏ: tháo vít, cạy bằng tay hoặc que nhựa ở mép vỏ; <b>không</b> thọc tua vít/dao vào trong — pin lithium túi (vỏ mềm) bị đâm thủng là xì khói, cháy. Nhìn: pin (khối bọc nhựa), mạch sạc, motor và 2 dây từ mạch sang motor.', 'Chụp ảnh lại trước khi cắt.'], hinh: hQuat },
          { ten: 'Cắt từng dây motor, bọc đầu dây trên mạch', kiem_truoc: true, lam: ['Cắt 1 dây motor sát mạch. Quấn băng dính đầu dây còn trên mạch. Rồi mới cắt dây thứ 2, quấn băng dính.', 'Tuốt (hoặc cạo) 1cm vỏ ở 2 đầu dây phía motor.'], hinh: hQuat,
            kiem: { thay: 'Motor rời ra với 2 dây dài. Trên mạch không còn đầu dây trần nào.', neu_khong: 'Dây pin bị đứt/trầy: bọc băng dính ngay, để quạt xa đồ kim loại, không sạc lại.' } },
        ],
      },
      {
        ten: 'Phần 2 · Đo motor',
        buoc: [
          { ten: 'Nối motor vào breadboard', lam: ['2 dây nhảy cắm 10c và 14c. Kẹp cá sấu nối mỗi dây motor với đầu kia của một dây nhảy.'], board: { them: [M] } },
          { ten: 'Đo Ω motor, xoay chậm trục', lam: ['<code>Ω 200</code>. Que vào cột 10 và cột 14. Xoay trục thật chậm 1 vòng, ghi số nhỏ nhất và lớn nhất.'], board: { them: [K.dh('Ω 200', '10a', '14a', '≈ 3–10')] }, kiem: { thay: 'Vài Ω, nhảy khi xoay (chổi than qua từng lá cổ góp).', neu_khong: '1 (OL): tiếp xúc kẹp cá sấu kém.' } },
          { ten: 'Quay tay, đo áp phát ra', lam: ['<code>DCV 2</code> (hoặc 20). Vê trục bằng 2 ngón thật nhanh. Rồi quay ngược chiều.'], board: { them: [K.dh('DCV 2', '10a', '14a', '≈ 0.2')] }, kiem: { thay: 'Ra áp, quay nhanh hơn thì lớn hơn, ngược chiều thì âm.', neu_khong: '' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Motor', cot: ['R nhỏ nhất', 'R lớn nhất', 'I khởi động = 4.78/R_min', 'U quay tay'], hang: [{ ten: 'Số đo', du_doan: ['2–10 Ω', '', '0.5–2 A', '0.1–0.5 V'] }] }],
    bay: ['Cắt 2 dây cùng lúc bằng kìm/kéo kim loại: nếu là dây pin thì nối tắt pin lithium ngay trong lưỡi kéo.', 'Để thân quạt có pin lẫn trong đống linh kiện: đầu dây trần chạm vào gì đó.'],
    robot: ['Driver motor phải chịu được dòng khởi động/kẹt, không chỉ dòng chạy. Bánh robot bị kẹt = motor ở dòng kẹt liên tục → driver và pin nóng.'],
  });
})();
