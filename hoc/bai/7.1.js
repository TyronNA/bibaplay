// Bài 7.1 — Nam châm điện. Không breadboard: 1 viên AAA, cuộn emay quấn quanh đinh, kẹp cá sấu.
(function () {
  const sd = SD;
  const svg = (w, h, s, nhan) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${nhan}" class="sd">${s}</svg>`;
  const dinh = (x, y) => `<rect x="${x}" y="${y}" width="170" height="10" rx="2" style="fill:#9AA3AD"/><path d="M${x + 170} ${y}l16 5l-16 5z" style="fill:#9AA3AD"/><rect x="${x - 8}" y="${y - 5}" width="8" height="20" rx="2" style="fill:#7E868F"/>`;
  const cuon = (x, y, n) => Array.from({ length: n }, (_, i) => `<ellipse cx="${x + i * 6}" cy="${y + 5}" rx="3" ry="9" style="fill:none;stroke:#C0733A;stroke-width:2"/>`).join('');
  const pin = (x, y) => `<rect x="${x}" y="${y}" width="90" height="30" rx="4" style="fill:#3B4652"/><rect x="${x + 90}" y="${y + 9}" width="6" height="12" style="fill:#B8BEC4"/>` + sd.chu(x + 45, y + 20, 'AAA 1.5V', 'lk-trang', 'middle') + sd.chu(x + 104, y + 20, '+', 'sd-pos') + sd.chu(x - 12, y + 20, '−', 'sd-neg');
  const h1 = svg(360, 150, dinh(60, 50) + cuon(90, 50, 16) + sd.chu(90, 30, 'quấn cùng một chiều, sát nhau', 'sd-mo') + `<path d="M84 55 C 60 70, 40 90, 40 120" class="sd-net"/><path d="M186 55 C 220 70, 250 90, 260 120" class="sd-net"/>`
    + sd.chu(80, 138, 'đầu 1: cạo men 1cm', 'sd-mo', 'middle') + sd.chu(270, 138, 'đầu 2: cạo men 1cm', 'sd-mo', 'middle'), 'Đinh sắt quấn dây emay, 2 đầu cạo men');
  const h2 = svg(360, 170, dinh(60, 30) + cuon(90, 30, 16) + `<path d="M84 35 C 60 60, 40 110, 99 133" class="sd-net"/><path d="M186 35 C 240 60, 250 120, 197 133" class="sd-net"/>` + pin(100, 118)
    + sd.chu(92, 164, 'băng dính ở −', 'sd-mo', 'middle') + sd.chu(262, 112, 'kẹp cá sấu:', 'sd-mo') + sd.chu(262, 126, 'chạm 2–3 giây', 'sd-xau') + `<path d="M262 30l26 14M270 26l22 20" class="sd-net"/>` + sd.chu(298, 40, 'kẹp giấy', 'sd-mo'),
  'Một đầu dây dán vào cực âm pin, đầu kia chạm cực dương 2 đến 3 giây');
  BAI.dangKy({
    id: '7.1',
    muc_tieu: 'Có dòng là có từ trường: quấn dây quanh đinh sắt thành nam châm điện hút được kẹp giấy. Ruột của relay, loa, motor.',
    nguon: '1 viên AAA kiềm · chạm ≤ 3 giây',
    can: [{ ten: 'Dây đồng emay 0.3–0.5mm, ~1.5m', tim: 'emay', lk: 'day-emay', sl: 1 }, { ten: 'Đinh sắt ~5cm + kẹp giấy + giấy nhám', tim: 'đinh sắt', lk: 'dinh-kep', sl: 1 }, { ten: 'Pin AAA <b>kiềm</b> (1 viên)', tim: 'pin AAA', sl: 1 }, K.can.kep(1), K.can.dh()],
    kien_thuc: `<p>Dòng qua dây tạo từ trường vòng quanh dây. Quấn thành cuộn thì từ trường các vòng cộng lại; lõi sắt gom nó lại mạnh hơn nhiều lần.</p>
      <p><b>Đây là nối tắt pin có chủ đích.</b> Cuộn dây gần như 0Ω (~0.2Ω), chỉ nội trở pin chặn dòng: 1 viên AAA cho ~2A. Dây và pin nóng lên trong vài giây. Luật cho bài này:</p>
      <ul><li><b>Chỉ 1 viên AAA kiềm (alkaline)</b>. Không dùng hộp 3 viên, không dùng pin sạc NiMH (nội trở nhỏ hơn → dòng lớn hơn), <b>tuyệt đối không pin lithium</b> (pin quạt, 18650): hàng chục ampe, cháy.</li>
      <li>Chạm <b>≤ 3 giây</b>, nghỉ ≥ 30 giây. Cầm dây qua kẹp cá sấu, không cầm bằng tay trần chỗ đồng.</li>
      <li>Pin hoặc dây nóng tới mức khó cầm: dừng, đợi nguội. Pin phồng/rỉ: bỏ.</li></ul>`,
    du_doan: '<p>30 vòng: hút được 1–2 kẹp giấy. 60 vòng: hút nhiều hơn rõ. Nhả pin: kẹp rơi (đinh có thể giữ lại chút từ).</p>',
    so_do: [{ nhan: 'Nối tắt có chủ đích', svg: SD.svg(300, 200, SD.pin(50, 90, '1 viên AAA 1.5V') + SD.day('50,90 50,30 200,30 200,50')
      + '<path d="M200 50 a10 10 0 0 1 0 20 a10 10 0 0 1 0 20 a10 10 0 0 1 0 20 a10 10 0 0 1 0 20" class="sd-net"/>' + '<rect x="176" y="46" width="12" height="88" class="sd-net" stroke-dasharray="4 3"/>'
      + SD.chu(220, 94, '30 vòng', 'sd-chu') + SD.chu(220, 110, '~0.2Ω', 'sd-mo') + SD.chu(150, 94, 'lõi sắt', 'sd-mo', 'end') + SD.day('200,130 200,170 50,170 50,100'),
      'Một viên pin AAA nối thẳng cuộn dây quấn quanh đinh sắt'), chu: 'Dòng chỉ bị nội trở pin chặn (~2A): chạm ≤ 3 giây.' }],
    sau: `<h3>Từ trường của một cuộn dây</h3>
      <p>Ống dây dài l, N vòng, dòng I: trong lòng ống <code>B = μ₀·N·I / l</code>, với μ₀ = 4π×10⁻⁷. Cuộn 30 vòng dài 3cm, 2A: <code>B ≈ 4π×10⁻⁷ × 30 × 2 / 0.03 ≈ 2.5mT</code> trong không khí — cỡ 50 lần từ trường Trái Đất. Lõi sắt gom đường sức lại, làm mạnh lên hàng chục tới hàng trăm lần (tới khi sắt bão hoà từ).</p>
      <h3>Vì sao 60 vòng mạnh hơn dù dây dài hơn</h3>
      <p>Dây dài gấp đôi thì điện trở dây gấp đôi, nhưng 0.2Ω → 0.4Ω vẫn nhỏ so với nội trở pin (~0.15–0.3Ω) + tiếp xúc, nên dòng giảm ít. N gấp đôi còn I giảm chút ít → B vẫn tăng rõ. Lực hút kẹp giấy tăng theo <b>B²</b>, nên tăng nhiều hơn gấp đôi.</p>
      <h3>Pin nóng vì đâu</h3>
      <p>Hầu hết công suất đốt ở <b>trong pin</b>: I²·r = 2² × 0.25 ≈ 1W, trong khi cuộn dây chỉ 2² × 0.2 ≈ 0.8W. Pin lithium có r nhỏ hơn 10 lần → dòng hàng chục A: đó là lý do cấm.</p>`,
    hoi: [
      ['Cuộn 60 vòng, dòng 1.8A, dài 3cm. B trong lòng ống (không lõi)?', '4π×10⁻⁷ × 60 × 1.8 / 0.03 ≈ <b>4.5mT</b>.'],
      ['Vì sao quấn lẫn 2 chiều làm nam châm yếu hẳn?', 'Vòng quấn ngược tạo từ trường ngược chiều, triệt tiêu với vòng quấn xuôi.'],
      ['Pin AAA r = 0.25Ω, cuộn 0.2Ω. Dòng và công suất đốt trong pin?', 'I = 1.5/0.45 ≈ <b>3.3A</b> (lý thuyết; thực tế thấp hơn vì tiếp xúc); P_pin = 3.3² × 0.25 ≈ <b>2.8W</b> — nóng nhanh.'],
    ],
    phan: [{
      ten: 'Phần 1 · Quấn, đo, chạm',
      buoc: [
        { ten: 'Quấn 30 vòng', lam: ['Chừa ~15cm mỗi đầu. Quấn 30 vòng sát nhau, cùng một chiều quanh đinh. Dán băng dính giữ 2 đầu cuộn.', 'Dùng giấy nhám cạo sạch lớp men (màu đỏ/nâu bóng) ở 1cm cuối mỗi đầu dây, tới khi thấy màu đồng sáng.'], hinh: h1 },
        { ten: 'Đo Ω cuộn dây', kiem_truoc: true, lam: ['Núm <code>Ω 200</code>. Chạm 2 que vào nhau trước, ghi số (điện trở dây que). Rồi chạm 2 đầu đã cạo men.'], hinh: h1,
          kiem: { thay: 'Cuộn ≈ (số đo − số dây que) ≈ 0.1–0.5Ω: gần như dây dẫn trần. Vì vậy chỉ được chạm pin vài giây.', neu_khong: '1 (OL): men chưa cạo sạch, cạo lại. Không cần pin để biết.' } },
        { ten: 'Chạm pin 2–3 giây, hút kẹp giấy', cap_dien: true, lam: ['Dán 1 đầu dây vào cực − của pin bằng băng dính. Kẹp cá sấu vào đầu kia, chạm vào cực + trong <b>2–3 giây</b>, đưa mũi đinh lại gần kẹp giấy. Nhả.', 'Nghỉ 30 giây. Thử đưa gần la bàn (app điện thoại) lúc chạm.'], hinh: h2,
          kiem: { thay: 'Hút được kẹp giấy lúc chạm, nhả thì rơi. La bàn lệch.', neu_khong: 'Không hút: men chưa sạch hoặc pin yếu. Dây nóng rát: nghỉ lâu hơn.' } },
        { ten: 'Quấn thêm thành 60 vòng, làm lại', cap_dien: true, lam: ['Quấn thêm 30 vòng cùng chiều đè lên lớp cũ. Cạo lại đầu dây nếu cần, đo Ω lại (vẫn < 1Ω), chạm 2–3 giây.'], hinh: h2,
          kiem: { thay: 'Hút mạnh hơn, nhiều kẹp hơn.', neu_khong: '' } },
      ],
    }],
    bang_do: [{ ten: 'Số kẹp giấy hút được', cot: ['Ω cuộn', 'Số kẹp'], hang: [{ ten: '30 vòng', du_doan: ['≈ 0.1–0.3', '1–2'] }, { ten: '60 vòng', du_doan: ['≈ 0.2–0.5', 'nhiều hơn'] }] }],
    bay: ['Giữ chạm lâu: pin và dây nóng nhanh, pin có thể rỉ.', 'Dùng pin lithium/pin sạc: dòng lớn gấp nhiều lần — cháy.', 'Quấn lẫn 2 chiều: từ trường triệt tiêu nhau, yếu hẳn.'],
    robot: ['Cuộn dây = cuộn cảm: ngắt dòng đột ngột là sinh xung áp cao (bài 7.4). Relay, motor, loa đều có cuộn dây.'],
  });
})();
