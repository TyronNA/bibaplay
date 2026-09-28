// Thư viện hình linh kiện: hình minh hoạ + ký hiệu mạch + cách nhận chân.
// `tim` là chuỗi tìm trong notes/do-dang-co.md (để biết có/chưa có) và khớp với `tim` trong mục "Đồ cần" của bài.
// Chỗ nào chưa chắc (thứ tự chân S8050, cặp chân nút nhấn, con trượt biến trở) thì hình ghi "đo mới biết", không vẽ chắc.
(function () {
  const W = 260;
  const anh = (trong, nhan, h = 150) => `<svg viewBox="-20 0 ${W + 40} ${h}" class="lk-anh" role="img" aria-label="${nhan}">${trong}</svg>`;
  const kh = (trong, nhan) => `<svg viewBox="0 0 120 56" class="lk-kh" role="img" aria-label="Ký hiệu mạch: ${nhan}">${trong}</svg>`;
  // đường chú thích: chấm ở điểm trên linh kiện (x1, y1), chữ ở đầu kia
  const g = (x1, y1, x2, y2, t, neo = 'start') => {
    const dx = neo === 'end' ? -4 : neo === 'start' ? 4 : 0, dy = neo === 'middle' ? (y2 > y1 ? 11 : -5) : 3.5;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="lk-dan"/><circle cx="${x1}" cy="${y1}" r="2" class="lk-cham"/>`
      + `<text x="${x2 + dx}" y="${y2 + dy}" text-anchor="${neo}" class="lk-chu">${t}</text>`;
  };
  const chu = (x, y, t, lop = 'lk-chu', neo = 'middle') => `<text x="${x}" y="${y}" text-anchor="${neo}" class="${lop}">${t}</text>`;
  const chan = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="lk-chan"/>`;
  const vien = 'stroke="rgba(0,0,0,.35)"';
  const net = pts => `<polyline points="${pts}" class="lk-net"/>`;
  const zz = (x1, x2, y) => { const p = [`${x1},${y}`], n = 6, s = (x2 - x1) / n; for (let i = 0; i < n; i++) p.push(`${x1 + s * (i + .5)},${y + (i % 2 ? 8 : -8)}`); p.push(`${x2},${y}`); return p.join(' '); };
  const muiTen = (x1, y1, x2, y2) => {
    const a = Math.atan2(y2 - y1, x2 - x1), l = 6, b = .45;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="lk-net-mo"/><polygon points="${x2},${y2} ${x2 - l * Math.cos(a - b)},${y2 - l * Math.sin(a - b)} ${x2 - l * Math.cos(a + b)},${y2 - l * Math.sin(a + b)}" class="lk-dac"/>`;
  };
  const diodeKh = (nhan, them = '') => kh(net('8,28 44,28') + '<polygon points="44,14 44,42 68,28" class="lk-net"/>' + net('68,14 68,42') + net('68,28 112,28')
    + chu(12, 18, 'A', 'lk-mo') + chu(106, 18, 'K', 'lk-mo') + them, nhan);

  const LK = [
    { id: 'dien-tro', nhom: 'lk', ten: 'Điện trở 1/4W', tim: 'Điện trở 1/4W',
      anh: anh(`<line x1="18" y1="70" x2="242" y2="70" class="lk-chan"/>
        <rect x="88" y="58" width="84" height="24" rx="11" fill="#D9B98A" ${vien}/>
        <rect x="100" y="58" width="6" height="24" fill="#7A4A1E"/><rect x="113" y="58" width="6" height="24" fill="#1B1B1B"/>
        <rect x="126" y="58" width="6" height="24" fill="#E07B1A"/><rect x="152" y="58" width="6" height="24" fill="#C9A640"/>
        ${g(103, 58, 90, 26, 'nâu·đen·cam = 10k')}${g(155, 82, 186, 112, 'vàng kim ±5%')}
        ${g(40, 70, 40, 100, 'không có cực', 'middle')}${chu(130, 142, 'đọc từ phía xa vòng vàng kim', 'lk-mo')}`, 'Điện trở 10k: thân be, 4 vòng màu nâu đen cam vàng kim, hai chân thẳng'),
      kh: kh(net(`8,28 30,28 ${zz(30, 90, 28)} 112,28`) + chu(60, 52, 'R', 'lk-mo'), 'điện trở'),
      chan: ['Không có cực, cắm chiều nào cũng được.', 'Vòng 1–2 là 2 chữ số, vòng 3 là số mũ: nâu·đen·cam = 10·10³ = 10kΩ; đỏ·đỏ·nâu = 220Ω.', 'Không chắc thì rút khỏi mạch rồi đo thang Ω (bài 1.3).'],
      gioi_han: '1/4W = 0.25W. Cắm thẳng vào 4.5V thì cần ≥ 81Ω.',
      bay: 'Đo Ω khi điện trở còn trong mạch có pin → số sai, có khi hỏng đồng hồ.',
      bai: ['1.2', '1.3', '1.4', '1.5', '1.6', '2.2', '2.3', '2.4', '2.5', '3.1', '5.2', '6.1', '6.3'] },

    { id: 'led', nhom: 'lk', ten: 'LED 5mm', tim: 'LED 5mm',
      anh: anh(`<path d="M104 78 V46 A22 22 0 0 1 148 46 V78 Z" fill="#E5372C" fill-opacity=".85" ${vien}/>
        <path d="M98 78 H148 V86 H98 Z" fill="#E5372C" fill-opacity=".95" ${vien}/>
        <path d="M130 78 V60 H138 V78" fill="none" stroke="rgba(0,0,0,.35)"/>
        ${chan(114, 86, 142)}${chan(138, 86, 124)}
        ${g(114, 136, 84, 136, 'dài = + (A)', 'end')}${g(138, 120, 170, 120, 'ngắn = − (K)')}${g(148, 82, 180, 70, 'mép phẳng = −')}
        ${chu(8, 20, 'sụt áp: đỏ ~1.8–2V · xanh/trắng ~3V', 'lk-mo', 'start')}`, 'LED 5mm màu đỏ: chân dài là cực dương, chân ngắn và mép phẳng là cực âm'),
      kh: diodeKh('LED', muiTen(58, 12, 70, 2) + muiTen(66, 16, 78, 6)),
      chan: ['Chân dài = + (anode, A). Chân ngắn = − (cathode, K).', 'Chân đã cắt bằng nhau: nhìn mép vành, bên phẳng là −. Hoặc đo thang diode: sáng mờ khi que đỏ ở A.'],
      gioi_han: 'Dòng ≤ 20mA. Luôn có điện trở nối tiếp (220Ω với 4.5V).',
      bay: 'Cắm LED thẳng vào pin không qua điện trở → cháy LED ngay.',
      bai: ['1.2', '2.3', '3.2', '4.1', '4.2', '5.2', '5.4', '6.3'] },

    { id: 'nut-nhan', nhom: 'lk', ten: 'Nút nhấn 6×6mm', tim: 'Nút nhấn',
      anh: anh(`<rect x="100" y="36" width="60" height="60" rx="3" fill="#3B4652" ${vien}/>
        <circle cx="130" cy="66" r="17" fill="#1B1F24" stroke="#6E767E"/>
        ${[48, 84].map(y => `<path d="M100 ${y} H84 V${y + 6}" class="lk-chan"/><path d="M160 ${y} H176 V${y + 6}" class="lk-chan"/>`).join('')}
        ${chu(78, 51, '1', 'lk-mo', 'end')}${chu(78, 87, '2', 'lk-mo', 'end')}${chu(182, 51, '3', 'lk-mo', 'start')}${chu(182, 87, '4', 'lk-mo', 'start')}
        ${g(130, 66, 200, 24, 'nhấn = nối')}${chu(130, 120, 'nhìn từ trên xuống · 4 chân', 'lk-mo')}
        ${chu(130, 138, '2 cặp luôn thông: đo Ω mới biết cặp nào', 'lk-canh')}`, 'Nút nhấn 6x6mm nhìn từ trên, 4 chân ra hai bên'),
      kh: kh(net('8,40 40,40') + '<circle cx="42" cy="40" r="2.5" class="lk-dac"/><circle cx="78" cy="40" r="2.5" class="lk-dac"/>' + net('80,40 112,40') + net('36,28 84,28') + net('60,28 60,12') + net('52,12 68,12'), 'nút nhấn thường hở'),
      chan: ['4 chân nhưng chỉ là 1 công tắc: 2 cặp chân luôn thông với nhau sẵn.', 'Đo thông mạch từng cặp khi chưa nhấn: cặp kêu bíp là cặp luôn thông. Nhấn giữ thì 2 cặp nối vào nhau.', 'Cắm vắt qua rãnh giữa breadboard.'],
      gioi_han: 'Chỉ cho tín hiệu vài mA, không bật motor.',
      bay: 'Cắm 2 chân luôn-thông vào 2 bên mạch → mạch luôn nối, nhấn không có tác dụng.',
      bai: ['6.1', '6.4'] },

    { id: 'bien-tro', nhom: 'lk', ten: 'Biến trở RM065 10k', tim: 'RM065',
      anh: anh(`<rect x="100" y="24" width="60" height="64" rx="4" fill="#2F6FD6" ${vien}/>
        <circle cx="130" cy="52" r="19" fill="#fff" stroke="#1F4FA0" stroke-width="2"/>
        <line x1="118" y1="52" x2="142" y2="52" stroke="#1F4FA0" stroke-width="3"/><line x1="130" y1="44" x2="130" y2="60" stroke="#1F4FA0" stroke-width="3"/>
        ${chu(130, 84, '103', 'lk-trang')}
        ${chan(110, 88, 124)}${chan(130, 88, 124)}${chan(150, 88, 124)}
        ${g(146, 44, 186, 26, 'vặn tua vít')}${g(142, 80, 186, 92, '103 = 10kΩ')}${g(100, 34, 72, 22, 'có chặn 2 đầu', 'end')}
        ${chu(130, 142, 'chân giữa chưa chắc là con trượt → đo', 'lk-canh')}`, 'Biến trở tinh chỉnh RM065 màu xanh, rotor trắng có rãnh chữ thập, 3 chân'),
      kh: kh(net(`8,36 26,36 ${zz(26, 94, 36)} 112,36`) + muiTen(60, 6, 60, 26) + chu(18, 26, 'A', 'lk-mo') + chu(102, 26, 'B', 'lk-mo') + chu(70, 12, 'W', 'lk-mo', 'start'), 'biến trở'),
      chan: ['2 đầu dải than (A, B) + con trượt (W). Cặp nào vặn mà Ω không đổi (~10k) là A–B; chân còn lại là W.', 'Luôn có R(A–W) + R(W–B) ≈ 10k.'],
      gioi_han: 'Cỡ 0.1W. Dòng qua đoạn nhỏ gần 0Ω vẫn cháy được.',
      bay: 'Nối W thẳng vào + hoặc − pin rồi vặn về đầu kia → nối tắt pin, bốc khói (đã cháy 1 con ở bài 2.3).',
      bai: ['2.3', '5.2', '5.4'] },

    { id: 'quang-tro', nhom: 'lk', ten: 'Quang trở GL5528', tim: 'GL5528',
      anh: anh(`<circle cx="130" cy="48" r="24" fill="#C9674F" ${vien}/>
        <polyline points="112,36 148,36 148,44 112,44 112,52 148,52 148,60 112,60" fill="none" stroke="#F6D9B8" stroke-width="1.6"/>
        ${chan(122, 72, 132)}${chan(138, 72, 132)}
        ${g(112, 40, 84, 24, 'sáng → R giảm', 'end')}${g(138, 118, 170, 118, 'không có cực')}
        ${chu(130, 146, 'phòng ~5–20k · che tay tối ≥ 1MΩ', 'lk-mo')}`, 'Quang trở GL5528: đầu tròn có đường ziczac, hai chân'),
      kh: kh(net(`8,36 30,36 ${zz(30, 90, 36)} 112,36`) + muiTen(40, 4, 52, 18) + muiTen(54, 4, 66, 18), 'quang trở'),
      chan: ['Không có cực.', 'Là điện trở đổi theo ánh sáng: đo thang 200k, lấy tay che rồi soi đèn để thấy số chạy.'],
      gioi_han: 'Cỡ 0.1W, áp ≤ 150V — ở đây không lo.',
      bay: 'Đặt ở trên hay ở dưới cầu phân áp thì chiều áp ra ngược nhau (poster bài 16 ghi ngược).',
      bai: ['2.4', '5.4'] },

    { id: 'tu-hoa', nhom: 'lk', ten: 'Tụ hoá 10µF / 100µF 16V', tim: 'Tụ hoá',
      anh: anh(`<rect x="106" y="24" width="44" height="78" rx="6" fill="#2B3A67" ${vien}/>
        <rect x="136" y="24" width="14" height="78" fill="#A9B8D0"/><rect x="108" y="24" width="40" height="5" fill="#B8BEC4"/>
        ${[44, 62, 80].map(y => chu(143, y, '−', 'lk-toi')).join('')}
        ${chu(122, 68, '16V', 'lk-trang')}
        ${chan(118, 102, 146)}${chan(140, 102, 130)}
        ${g(144, 50, 180, 40, 'vạch − = âm')}${g(118, 140, 90, 140, 'dài = +', 'end')}${g(140, 126, 172, 126, 'ngắn = −')}
        ${chu(8, 16, 'cắm ngược / quá 16V → phồng, nổ', 'lk-xau', 'start')}`, 'Tụ hoá hình trụ xanh, vạch sáng có dấu trừ ở một bên, chân dài là cực dương'),
      kh: kh(net('8,28 52,28') + net('52,12 52,44') + '<path d="M66 12 Q58 28 66 44" class="lk-net"/>' + net('62,28 112,28') + chu(42, 14, '+', 'lk-mo'), 'tụ có cực'),
      chan: ['Có cực. Chân dài = +. Bên có vạch in dấu − là chân −.', 'Số in trên thân: điện dung (µF) và áp tối đa (16V).'],
      gioi_han: 'Áp ≤ 16V (mình dùng 4.5V, dư). Sau này nguồn 5V vẫn an toàn.',
      bay: 'Cắm ngược cực → nóng, phồng, có thể nổ. Tụ đã nạp giữ điện sau khi rút pin: chạm 2 chân qua điện trở để xả.',
      bai: ['3.1', '3.2', '3.3', '6.3'] },

    { id: 'tu-gom', nhom: 'lk', ten: 'Tụ gốm 104 = 100nF', tim: 'Tụ gốm',
      anh: anh(`<ellipse cx="130" cy="50" rx="26" ry="24" fill="#D98A3A" ${vien}/>
        ${chu(130, 55, '104', 'lk-toi')}
        <path d="M122 72 L120 84 V134" class="lk-chan"/><path d="M138 72 L140 84 V134" class="lk-chan"/>
        ${g(152, 40, 186, 26, '104 = 100nF')}${g(120, 124, 92, 124, 'không cực', 'end')}
        ${chu(130, 145, 'lọc nhiễu sát chân nguồn', 'lk-mo')}`, 'Tụ gốm hình giọt màu cam nâu in số 104, hai chân'),
      kh: kh(net('8,28 54,28') + net('54,12 54,44') + net('66,12 66,44') + net('66,28 112,28'), 'tụ không cực'),
      chan: ['Không có cực.', 'Số 104 đọc như điện trở, đơn vị pF: 10·10⁴ pF = 100nF = 0.1µF.'],
      gioi_han: 'Áp ≤ 50V.',
      bay: 'Điện dung quá nhỏ để trữ điện — dùng để lọc nhiễu, không thay được tụ hoá (bài 3.4).',
      bai: ['3.4'] },

    { id: '1n4148', nhom: 'lk', ten: 'Diode 1N4148', tim: 'Diode 1N4148',
      anh: anh(`<line x1="18" y1="70" x2="242" y2="70" class="lk-chan"/>
        <rect x="100" y="62" width="60" height="16" rx="7" fill="#E9A96A" fill-opacity=".8" ${vien}/>
        <rect x="144" y="62" width="7" height="16" fill="#1B1B1B"/>
        ${g(147, 62, 180, 36, 'vạch = K (−)')}${g(30, 70, 30, 100, 'A', 'middle')}${g(230, 70, 230, 100, 'K', 'middle')}
        ${chu(130, 132, 'dẫn A → K · sụt ~0.6–0.7V', 'lk-mo')}`, 'Diode 1N4148 thân thuỷ tinh màu cam, vạch đen ở phía cathode'),
      kh: diodeKh('diode'),
      chan: ['Vạch đen = cathode (K, −). Dòng chỉ đi A → K.', 'Đo thang diode: que đỏ ở A ra ~0.6–0.7V, đảo que ra "1".'],
      gioi_han: 'Dòng ~200mA. Chỉ cho tín hiệu, không cho motor.',
      bay: 'Thân thuỷ tinh giòn: bẻ chân sát thân là nứt.',
      bai: ['4.1', '6.2'] },

    { id: '1n4007', nhom: 'lk', ten: 'Diode 1N4007', tim: 'Diode 1N4007',
      anh: anh(`<line x1="18" y1="70" x2="242" y2="70" class="lk-chan"/>
        <rect x="96" y="58" width="68" height="24" rx="4" fill="#1E2226" ${vien}/>
        <rect x="146" y="58" width="8" height="24" fill="#C8CDD2"/>${chu(122, 74, '4007', 'lk-trang')}
        ${g(150, 58, 168, 34, 'vạch bạc = K (−)')}${g(30, 70, 30, 100, 'A', 'middle')}${g(230, 70, 230, 100, 'K', 'middle')}
        ${chu(130, 132, '1A · đặt ngược song song motor', 'lk-mo')}`, 'Diode 1N4007 thân đen, vạch bạc ở phía cathode'),
      kh: diodeKh('diode chỉnh lưu'),
      chan: ['Vạch bạc = cathode (K, −).', 'Chống xung ngược motor: vạch về phía +V (bài 7.4).'],
      gioi_han: 'Dòng 1A, áp ngược 1000V.',
      bay: 'Cắm thuận chiều song song motor = nối tắt nguồn qua diode.',
      bai: ['4.1', '4.2', '7.4'] },

    { id: 's8050', nhom: 'lk', ten: 'Transistor S8050 NPN', tim: 'S8050',
      anh: anh(`<path d="M102 96 V42 Q102 26 130 26 Q158 26 158 42 V96 Z" fill="#1E2226" ${vien}/>
        ${chu(130, 58, 'S8050', 'lk-trang')}${chu(130, 72, 'mặt phẳng', 'lk-trang-mo')}
        ${chan(114, 96, 132)}${chan(130, 96, 132)}${chan(146, 96, 132)}
        ${chu(114, 144, '?', 'lk-canh')}${chu(130, 144, '?', 'lk-canh')}${chu(146, 144, '?', 'lk-canh')}
        ${g(158, 60, 186, 50, 'mặt có chữ')}${g(114, 120, 84, 120, 'chân: dò', 'end')}
        ${chu(8, 16, 'thứ tự chân theo lô → dò bằng bài 5.1', 'lk-canh', 'start')}`, 'Transistor S8050 vỏ TO-92 đen, mặt phẳng có chữ, 3 chân chưa biết thứ tự'),
      kh: kh('<circle cx="64" cy="28" r="22" class="lk-net"/>' + net('8,28 56,28') + net('56,14 56,42') + net('56,22 76,10 76,2') + net('56,34 76,46 76,54')
        + '<polygon points="76,46 66,44 71,38" class="lk-dac"/>' + chu(14, 20, 'B', 'lk-mo') + chu(88, 13, 'C', 'lk-mo') + chu(88, 50, 'E', 'lk-mo'), 'transistor NPN'),
      chan: ['3 chân B (điều khiển), C, E. Thường gặp là E·B·C khi mặt có chữ hướng về mình, chân chúc xuống — nhưng tuỳ lô, poster còn ghi khác.', 'Dò bằng thang diode: chân B là chân dẫn ~0.7V sang cả 2 chân kia (bài 5.1).'],
      gioi_han: 'Ic ≤ ~0.5A (tuỳ datasheet lô), Vce ≤ 25V. Luôn có điện trở ở chân B.',
      bay: 'Chân B nối thẳng vào + không qua điện trở → cháy mối B–E.',
      bai: ['5.1', '5.2', '5.3', '5.4', '5.5', '6.2', '6.3', '6.4', '7.4'] },

    { id: 'day-nhay', nhom: 'dc', ten: 'Dây nhảy đực–đực', tim: 'Dây nhảy',
      anh: anh(`<path d="M40 98 C 80 20, 180 20, 220 98" fill="none" stroke="#D8322A" stroke-width="5" stroke-linecap="round"/>
        <rect x="32" y="96" width="16" height="24" rx="2" fill="#1E2226"/><rect x="212" y="96" width="16" height="24" rx="2" fill="#1E2226"/>
        ${chan(40, 120, 140)}${chan(220, 120, 140)}
        ${g(220, 138, 190, 138, 'đầu kim (đực)', 'end')}${chu(130, 14, 'màu dây không đổi điện', 'lk-mo')}
        ${chu(130, 28, 'đỏ = +, đen = − chỉ là quy ước', 'lk-mo')}`, 'Dây nhảy đực đực màu đỏ, hai đầu kim'),
      kh: '',
      chan: ['Không có chiều. Quy ước màu: đỏ = +, đen/xanh = −, màu khác cho tín hiệu.'],
      gioi_han: 'Dây mảnh: vài trăm mA thì ổn, motor lớn thì nóng.',
      bay: 'Kim bị cong hoặc cắm chưa ngập → lỏng tiếp xúc, số đo nhảy.',
      bai: null },

    { id: 'breadboard', nhom: 'dc', ten: 'Breadboard MB-102', tim: 'MB-102',
      anh: anh(`<rect x="8" y="6" width="244" height="140" rx="6" class="bb-board"/>
        <rect x="24" y="12" width="220" height="12" rx="3" class="lk-to-ngang"/>
        <line x1="24" y1="10" x2="244" y2="10" class="bb-vach-pos"/><line x1="24" y1="38" x2="244" y2="38" class="bb-vach-neg"/>
        ${chu(16, 20, '+', 'bb-cuc-pos')}${chu(16, 37, '−', 'bb-cuc-neg')}
        <rect x="40" y="46" width="12" height="64" rx="3" class="bb-dai"/>
        <rect x="8" y="114" width="244" height="8" class="bb-ranh"/>
        <g class="bb-lo">${Array.from({ length: 13 }, (_, i) => 30 + i * 16).map(x => [18, 30, 52, 64, 76, 88, 100, 130, 142].map(y => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')).join('')}</g>
        ${chu(60, 80, 'cột: 5 lỗ a–e thông nhau', 'lk-chu', 'start')}${chu(130, 48, 'thanh +/−: thông theo hàng ngang', 'lk-chu')}
        ${chu(130, 121, 'rãnh giữa: 2 nửa không thông', 'lk-chu')}`, 'Một góc breadboard: thanh nguồn thông theo hàng ngang, mỗi cột 5 lỗ thông nhau, rãnh giữa ngăn đôi'),
      kh: '',
      chan: ['Mỗi cột có 2 nhóm 5 lỗ (a–e, f–j) thông nhau; rãnh giữa ngăn 2 nhóm.', 'Thanh nguồn +/− chạy dọc mép, thông theo hàng ngang. Có loại MB-102 đứt thanh nguồn ở giữa — đo thông mạch 2 đầu thanh cho chắc.'],
      gioi_han: 'Tiếp điểm chịu ~1A. Không cắm chân quá to (chân diode 1N4007 vừa khít).',
      bay: '2 chân linh kiện cùng 1 cột = nối tắt sẵn linh kiện đó.',
      bai: null },

    { id: 'dong-ho', nhom: 'dc', ten: 'Đồng hồ vạn năng', tim: 'đồng hồ vạn năng',
      anh: anh(`<rect x="80" y="6" width="104" height="140" rx="10" fill="#2A3440" ${vien}/>
        <rect x="92" y="16" width="80" height="28" rx="3" fill="#CFE3C8"/><text x="132" y="36" text-anchor="middle" class="lk-lcd">4.78</text>
        <circle cx="132" cy="78" r="20" fill="#1B2026" stroke="#8A949E"/><line x1="132" y1="78" x2="132" y2="60" stroke="#E6EBF0" stroke-width="3" stroke-linecap="round"/>
        ${chu(106, 62, 'V', 'lk-trang-mo')}${chu(158, 62, 'Ω', 'lk-trang-mo')}${chu(106, 102, 'A', 'lk-trang-mo')}${chu(158, 102, '→|', 'lk-trang-mo')}
        <circle cx="102" cy="124" r="6" fill="#0B0F13" stroke="#D8322A" stroke-width="2"/><circle cx="132" cy="124" r="6" fill="#0B0F13" stroke="#DDE3E8"/><circle cx="162" cy="124" r="6" fill="#0B0F13" stroke="#D8322A" stroke-width="2"/>
        ${chu(102, 140, '10A', 'lk-trang-mo')}${chu(132, 140, 'COM', 'lk-trang-mo')}${chu(162, 140, 'VΩmA', 'lk-trang-mo')}
        ${g(152, 78, 196, 78, 'núm thang')}${g(132, 124, 70, 118, 'đen → COM', 'end')}${g(162, 124, 196, 124, 'đỏ → VΩ')}
        ${g(92, 30, 70, 30, 'hiện 1 = quá', 'end')}`, 'Đồng hồ vạn năng: màn LCD, núm xoay chọn thang, 3 lỗ cắm que 10A, COM, VΩmA'),
      kh: kh('<circle cx="60" cy="28" r="16" class="lk-net"/>' + net('8,28 44,28') + net('76,28 112,28') + chu(60, 33, 'V', 'lk-chu-kh'), 'vôn kế'),
      chan: ['Que đen luôn ở COM. Que đỏ ở VΩ để đo áp/Ω; chỉ chuyển sang lỗ mA khi đo dòng, đo xong trả về VΩ ngay.', 'Vị trí 3 lỗ khác nhau giữa các đời máy — đọc chữ in cạnh lỗ trên máy của ông.'],
      gioi_han: 'Lỗ mA thường có cầu chì ~200mA; lỗ 10A không cầu chì.',
      bay: 'Que đỏ ở lỗ mA mà đặt song song đo áp pin = nối tắt pin qua đồng hồ.',
      bai: null },

    { id: 'kep-ca-sau', nhom: 'dc', ten: 'Kẹp cá sấu', tim: 'kẹp cá sấu',
      anh: anh(`<path d="M30 70 C 40 140, 220 140, 230 70" fill="none" stroke="#D8322A" stroke-width="4"/>
        <rect x="18" y="60" width="48" height="20" rx="4" fill="#D8322A"/><polygon points="66,62 100,66 100,70 66,70" fill="#B8BEC4" ${vien}/><polygon points="66,72 100,72 100,76 66,80" fill="#B8BEC4" ${vien}/>
        <rect x="194" y="60" width="48" height="20" rx="4" fill="#23303D"/><polygon points="194,62 160,66 160,70 194,70" fill="#B8BEC4" ${vien}/><polygon points="194,72 160,72 160,76 194,80" fill="#B8BEC4" ${vien}/>
        ${g(100, 70, 120, 36, 'kẹp vào chân linh kiện')}${chu(130, 146, 'giữ que đo khỏi tuột, rảnh tay', 'lk-mo')}`, 'Dây hai đầu kẹp cá sấu'),
      kh: '',
      chan: ['Kẹp vào chân linh kiện hoặc đầu que đo, không cần giữ tay.'],
      gioi_han: '',
      bay: 'Hàm kẹp không bọc cách điện: 2 kẹp chạm nhau = nối tắt.',
      bai: ['1.2'] },

    { id: 'hop-pin', nhom: 'dc', ten: 'Hộp pin 3×AAA', tim: 'hộp pin',
      anh: anh(`<rect x="30" y="34" width="200" height="72" rx="6" class="bb-hop"/>
        ${[44, 100, 156].map((x, i) => `<rect x="${x}" y="50" width="52" height="40" rx="4" fill="#3B4652"/>${chu(x + 26, 74, 'AAA', 'lk-trang')}${chu(i % 2 ? x + 8 : x + 44, 62, '+', 'lk-trang')}`).join('')}
        <path d="M230 56 C 252 56, 252 132, 222 136" fill="none" stroke="#D8322A" stroke-width="3"/><path d="M30 84 C 10 84, 10 132, 40 136" fill="none" stroke="#23303D" stroke-width="3"/>
        ${chu(130, 20, '3 × 1.5V nối tiếp = 4.5V (pin mới ~4.8V)', 'lk-chu')}${chu(216, 146, 'đỏ = +', 'lk-chu', 'end')}${chu(46, 146, 'đen = −', 'lk-chu', 'start')}`, 'Hộp 3 pin AAA nối tiếp, dây đỏ cực dương, dây đen cực âm'),
      kh: kh(net('8,28 52,28') + net('52,14 52,42') + net('62,20 62,36') + net('62,28 112,28') + chu(46, 12, '+', 'lk-mo'), 'nguồn pin'),
      chan: ['Dây đỏ = +, dây đen = −.', 'Áp: pin mới ~4.7–4.8V, gần hết ~3.3V.'],
      gioi_han: 'Dòng nối tắt vài A trong tích tắc — đủ làm nóng dây, cháy biến trở.',
      bay: 'Không nối 2 hộp với nhau. Tháo pin trước mỗi lần sửa mạch.',
      bai: null },

    { id: 'motor-dc', nhom: 'quat', ten: 'Motor DC (trong quạt)', tim: 'motor DC',
      anh: anh(`<rect x="84" y="40" width="100" height="70" rx="8" fill="#B8BEC4" ${vien}/>
        <rect x="74" y="52" width="10" height="46" fill="#8A949E"/>
        <line x1="184" y1="75" x2="232" y2="75" stroke="#8A949E" stroke-width="4" stroke-linecap="round"/>
        <rect x="66" y="56" width="8" height="8" fill="#C9A640"/><rect x="66" y="86" width="8" height="8" fill="#C9A640"/>
        <path d="M66 60 C 40 60, 40 30, 20 30" fill="none" stroke="#D8322A" stroke-width="3"/><path d="M66 90 C 40 90, 40 120, 20 120" fill="none" stroke="#23303D" stroke-width="3"/>
        ${g(232, 75, 232, 104, 'trục', 'middle')}${chu(134, 132, 'đảo 2 dây = đảo chiều quay', 'lk-mo')}
        ${chu(134, 22, 'lúc khởi động hút dòng lớn', 'lk-canh')}`, 'Motor DC hình trụ bạc, trục bên phải, 2 cực nối dây đỏ và đen'),
      kh: kh('<circle cx="60" cy="28" r="16" class="lk-net"/>' + net('8,28 44,28') + net('76,28 112,28') + chu(60, 33, 'M', 'lk-chu-kh'), 'motor'),
      chan: ['2 cực, không có cực tính cố định: đảo dây thì quay ngược.'],
      gioi_han: 'Chưa đo dòng. Đo trước (bài 1.2) rồi mới chọn transistor/driver.',
      bay: 'Tắt motor sinh xung áp ngược → cần diode 1N4007 song song (bài 7.4). Không chạy motor từ chân ESP32.',
      bai: ['7.3', '7.4'] },

    { id: 'pin-li', nhom: 'quat', ten: 'Pin lithium 1S (trong quạt)', tim: 'pin 1S',
      anh: anh(`<rect x="40" y="50" width="170" height="50" rx="8" fill="#2E7D5B" ${vien}/>
        <rect x="210" y="63" width="9" height="24" rx="2" fill="#B8BEC4"/>
        ${chu(125, 80, '3.7V · 4000mAh?', 'lk-trang')}
        ${g(219, 75, 240, 112, '+', 'middle')}${chu(130, 144, 'hình minh hoạ — chưa tháo nên chưa biết loại', 'lk-mo')}
        ${chu(130, 26, 'nối tắt = nóng, cháy thật · chưa dùng', 'lk-xau')}`, 'Pin lithium 1S hình trụ xanh 3.7V'),
      kh: kh(net('8,28 52,28') + net('52,14 52,42') + net('62,20 62,36') + net('62,28 112,28') + chu(46, 12, '+', 'lk-mo'), 'pin 1 cell'),
      chan: ['1 cell: 3.0V (cạn) → 4.2V (đầy), danh định 3.7V.'],
      gioi_han: 'Phải có mạch bảo vệ + mạch sạc riêng cho lithium (TP4056 kiểu có bảo vệ).',
      bay: 'Không dùng cho bài breadboard. Chập mạch pin lithium là cháy thật, không chỉ nóng như AAA.',
      bai: [] },
    // ——— Cần mua: chương 7 ———
    { id: 'day-emay', nhom: 'c7', ten: 'Dây đồng emay 0.3–0.5mm', tim: 'emay', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<rect x="100" y="36" width="60" height="68" fill="#C77B30"/>
        ${Array.from({ length: 13 }, (_, i) => `<line x1="100" y1="${39 + i * 5}" x2="160" y2="${39 + i * 5}" stroke="#9A5A1F"/>`).join('')}
        <rect x="92" y="28" width="76" height="8" rx="2" fill="#3B4652"/><rect x="92" y="104" width="76" height="8" rx="2" fill="#3B4652"/>
        <path d="M160 60 C 190 50, 200 40, 220 44" fill="none" stroke="#C77B30" stroke-width="2.5"/>
        <path d="M220 44 L240 50" stroke="#F4C98E" stroke-width="2.5"/>
        ${g(236, 49, 236, 80, 'cạo men ~1cm', 'middle')}${g(100, 70, 70, 70, 'có lớp men', 'end')}
        ${chu(130, 136, 'men là cách điện: chưa cạo thì không dẫn', 'lk-mo')}`, 'Cuộn dây đồng emay, đầu dây đã cạo men sáng màu'),
      kh: kh('<path d="M8 36 H28 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 H112" class="lk-net"/>' + chu(60, 52, 'L', 'lk-mo'), 'cuộn cảm'),
      chan: ['Cạo men 2 đầu bằng giấy nhám tới khi thấy màu đồng sáng; đo thông mạch 2 đầu để chắc đã cạo đủ.'],
      gioi_han: 'Cuộn vài chục vòng chỉ cỡ 1Ω → nối vào pin là gần như nối tắt.',
      bay: 'Chỉ dùng 1 viên AAA, chạm vài giây rồi nhả (dây và pin nóng nhanh). Không bao giờ với pin lithium.',
      bai: ['7.1', '7.2'] },

    { id: 'nam-cham', nhom: 'c7', ten: 'Nam châm đất hiếm tròn', tim: 'nam châm', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<rect x="90" y="58" width="80" height="22" fill="#A9B0B8"/><ellipse cx="130" cy="80" rx="40" ry="12" fill="#A9B0B8" ${vien}/>
        <ellipse cx="130" cy="58" rx="40" ry="12" fill="#D8DDE2" ${vien}/>
        ${g(160, 56, 190, 34, 'mỗi mặt 1 cực')}${g(96, 72, 66, 100, '10–15mm', 'end')}
        ${chu(130, 128, 'hút rất mạnh: kẹp thịt, va nhau là mẻ', 'lk-canh')}
        ${chu(130, 144, 'để xa điện thoại, thẻ từ', 'lk-mo')}`, 'Nam châm đất hiếm hình đĩa bạc'),
      kh: '',
      chan: ['2 mặt tròn là 2 cực N và S. Muốn biết mặt nào là N: để gần la bàn (app điện thoại).'],
      gioi_han: '',
      bay: '2 viên hút nhau từ xa, kẹp ngón tay hoặc vỡ mẻ. Giữ xa điện thoại, thẻ từ, đồng hồ cơ.',
      bai: ['7.2'] },

    { id: 'dinh-kep', nhom: 'c7', ten: 'Đinh sắt, kẹp giấy, giấy nhám', tim: 'đinh sắt', mua: 'đợt 1 · tiệm kim khí',
      anh: anh(`<rect x="34" y="40" width="6" height="20" fill="#6E767E"/><rect x="40" y="46" width="150" height="8" fill="#8A949E"/><polygon points="190,46 212,50 190,54" fill="#8A949E"/>
        <path d="M40 96 H150 a12 12 0 0 1 0 24 H52 a8 8 0 0 1 0 -16 H140" fill="none" stroke="#9AA3AD" stroke-width="2.5"/>
        <rect x="186" y="88" width="56" height="44" rx="2" fill="#C9A77A"/>
        ${g(120, 46, 120, 24, 'đinh sắt: lõi nam châm điện', 'middle')}${g(150, 96, 164, 78, 'kẹp giấy')}${g(190, 124, 172, 140, 'giấy nhám', 'end')}`, 'Đinh sắt, kẹp giấy và một miếng giấy nhám'),
      kh: '',
      chan: ['Đinh phải là sắt (nam châm hút được) — nhôm/đồng thì không làm lõi được.', 'Kẹp giấy làm vật để hút và làm giá đỡ trục motor tự quấn (7.2).'],
      gioi_han: '',
      bay: '',
      bai: ['7.1', '7.2'] },

    // ——— Cần mua: đồ nghề hàn & dụng cụ ———
    { id: 'mo-han', nhom: 'han', ten: 'Mỏ hàn chỉnh nhiệt + đế', tim: 'mỏ hàn', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<path d="M20 74 C 0 80, -10 100, -12 120" fill="none" stroke="#23303D" stroke-width="3"/>
        <rect x="20" y="62" width="92" height="24" rx="10" fill="#2A3440"/>
        ${[70, 80, 90, 100].map(x => `<line x1="${x}" y1="64" x2="${x}" y2="84" stroke="#46525E"/>`).join('')}
        <circle cx="42" cy="74" r="7" fill="#D8322A"/>
        <rect x="112" y="68" width="80" height="12" fill="#B8BEC4"/><polygon points="192,68 232,73 232,75 192,80" fill="#8A949E"/>
        <circle cx="230" cy="74" r="7" fill="#FF7A3D" fill-opacity=".35"/>
        ${g(42, 74, 42, 108, 'núm chỉnh nhiệt', 'middle')}${g(150, 68, 150, 40, 'thân nóng — không chạm', 'middle')}${g(229, 76, 229, 108, 'mũi 320–350°C', 'middle')}
        ${chu(130, 140, 'luôn gác lên đế · rút điện khi xong', 'lk-xau')}`, 'Mỏ hàn bút: tay cầm đen có núm chỉnh nhiệt, thân kim loại, mũi nhọn'),
      kh: '',
      chan: ['Cầm ở tay cầm như cầm bút. Hàn ở ~320–350°C; lau mũi vào búi đồng trước mỗi mối.', 'Mối hàn: đặt mũi chạm cả chân linh kiện lẫn pad, đưa thiếc vào chỗ tiếp xúc (không đưa lên mũi), 2–3 giây rồi nhấc.'],
      gioi_han: 'Loại cắm thẳng không chỉnh nhiệt dễ quá nóng → bong pad mạch in.',
      bay: 'Thân và mũi ~350°C: bỏng ngay. Không để nằm trên bàn; mở cửa sổ vì khói nhựa thông.',
      bai: ['12.2', '12.3', '12.5'] },

    { id: 'thiec', nhom: 'han', ten: 'Thiếc hàn + flux', tim: 'thiếc hàn', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<circle cx="80" cy="70" r="40" fill="#B8BEC4" ${vien}/><circle cx="80" cy="70" r="12" style="fill:var(--panel)" ${vien}/>
        <path d="M112 50 C 140 30, 160 30, 176 40" fill="none" stroke="#9AA3AD" stroke-width="2.5"/>
        <rect x="170" y="86" width="64" height="34" fill="#C9A640" ${vien}/><ellipse cx="202" cy="86" rx="32" ry="8" fill="#A5652A" ${vien}/>
        ${chu(202, 108, 'FLUX', 'lk-toi')}
        ${g(176, 40, 206, 28, '0.6–0.8mm')}${g(80, 110, 96, 128, 'lõi nhựa thông')}
        ${chu(130, 144, 'có chì (Sn63/Pb37): rửa tay sau khi hàn', 'lk-canh')}`, 'Cuộn thiếc hàn và hộp flux'),
      kh: '',
      chan: ['Thiếc Sn63/Pb37 chảy ở ~183°C, dễ ăn nhất cho người mới. Flux làm thiếc chảy bám vào chân.'],
      gioi_han: '',
      bay: 'Có chì: không ăn uống lúc hàn, rửa tay sau đó.',
      bai: ['12.2', '12.3', '12.5'] },

    { id: 'bac-hut', nhom: 'han', ten: 'Bấc hút thiếc', tim: 'hút thiếc', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<rect x="50" y="46" width="80" height="58" rx="10" fill="#3B4652"/>
        <rect x="130" y="66" width="100" height="16" fill="#C77B30"/>
        ${Array.from({ length: 12 }, (_, i) => `<line x1="${132 + i * 8}" y1="66" x2="${140 + i * 8}" y2="82" stroke="#9A5A1F"/><line x1="${140 + i * 8}" y1="66" x2="${132 + i * 8}" y2="82" stroke="#9A5A1F"/>`).join('')}
        ${g(200, 66, 200, 40, 'dây đồng bện 2–3mm', 'middle')}
        ${chu(130, 128, 'đặt bấc lên mối hàn, ép mũi hàn lên trên', 'lk-mo')}`, 'Cuộn bấc đồng bện để hút thiếc'),
      kh: '', chan: ['Bấc hút thiếc chảy vào nhờ mao dẫn. Đoạn đã hút đầy thiếc thì cắt bỏ.'], gioi_han: '',
      bay: 'Bấc nóng như mũi hàn: đừng cầm sát đoạn đang hút.', bai: ['12.5'] },

    { id: 'nhip', nhom: 'han', ten: 'Nhíp', tim: 'nhíp', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<polygon points="24,60 226,73 226,74 24,68" fill="#8A949E" ${vien}/><polygon points="24,90 226,77 226,76 24,82" fill="#8A949E" ${vien}/>
        <rect x="20" y="60" width="10" height="30" rx="2" fill="#6E767E"/>
        ${g(224, 75, 224, 108, 'mũi nhọn', 'middle')}${chu(110, 40, 'loại chống tĩnh điện (ESD)', 'lk-mo')}`, 'Nhíp mũi thẳng'),
      kh: '', chan: ['Gắp linh kiện nhỏ, giữ dây khi hàn.'], gioi_han: '', bay: '', bai: ['12.5'] },

    { id: 'kim-cat', nhom: 'han', ten: 'Kìm cắt chân', tim: 'kìm cắt', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<path d="M170 71 C 120 58, 80 48, 30 46" fill="none" stroke="#D8322A" stroke-width="11" stroke-linecap="round"/>
        <path d="M170 79 C 120 92, 80 102, 30 104" fill="none" stroke="#D8322A" stroke-width="11" stroke-linecap="round"/>
        <polygon points="166,68 228,73 228,77 166,82" fill="#8A949E" ${vien}/><line x1="178" y1="75" x2="228" y2="75" stroke="#3B4652"/>
        <circle cx="170" cy="75" r="5" fill="#6E767E"/>
        ${g(214, 73, 214, 40, 'lưỡi phẳng 1 mặt', 'middle')}${chu(130, 136, 'cắt sát mối hàn · chân cắt văng: che tay', 'lk-canh')}`, 'Kìm cắt chân linh kiện tay cầm đỏ'),
      kh: '', chan: ['Mặt phẳng của lưỡi áp về phía mối hàn để cắt sát.'], gioi_han: 'Chỉ cắt chân linh kiện, dây đồng nhỏ — không cắt dây thép.',
      bay: 'Đoạn chân cắt văng ra rất nhanh: che bằng tay kia, hướng ra xa mắt.', bai: ['12.5'] },

    { id: 'kim-tuot', nhom: 'han', ten: 'Kìm tuốt dây', tim: 'tuốt dây', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<path d="M166 70 C 120 58, 80 48, 30 46" fill="none" stroke="#F2B32A" stroke-width="11" stroke-linecap="round"/>
        <path d="M166 80 C 120 92, 80 102, 30 104" fill="none" stroke="#F2B32A" stroke-width="11" stroke-linecap="round"/>
        <rect x="162" y="62" width="74" height="26" rx="3" fill="#8A949E" ${vien}/>
        ${[176, 192, 208, 222].map(x => `<circle cx="${x}" cy="75" r="3.2" fill="#3B4652"/>`).join('')}
        ${g(192, 75, 192, 40, 'lỗ theo cỡ dây (AWG)', 'middle')}${chu(130, 136, 'chọn đúng lỗ: tuốt vỏ, không đứt lõi', 'lk-mo')}`, 'Kìm tuốt dây có hàng lỗ theo cỡ dây'),
      kh: '', chan: ['Dây 22AWG → lỗ 22. Lỗ nhỏ hơn là cắt vào lõi đồng.'], gioi_han: '', bay: '', bai: ['12.5'] },

    { id: 'tay-3', nhom: 'han', ten: 'Kẹp "bàn tay thứ ba"', tim: 'bàn tay thứ ba', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<rect x="60" y="120" width="140" height="16" rx="3" fill="#3B4652"/><line x1="130" y1="120" x2="130" y2="46" stroke="#6E767E" stroke-width="4"/>
        <path d="M130 70 L 76 52" stroke="#8A949E" stroke-width="3"/><path d="M130 70 L 184 52" stroke="#8A949E" stroke-width="3"/>
        <rect x="58" y="44" width="20" height="10" rx="2" fill="#D8322A"/><rect x="182" y="44" width="20" height="10" rx="2" fill="#D8322A"/>
        <circle cx="130" cy="30" r="18" fill="rgba(160,200,240,.35)" stroke="#3B4652" stroke-width="4"/>
        ${g(66, 48, 50, 30, 'kẹp giữ bo', 'end')}${g(148, 30, 190, 22, 'kính lúp')}${g(200, 128, 224, 110, 'đế nặng')}`, 'Giá kẹp bàn tay thứ ba: đế nặng, 2 kẹp cá sấu, kính lúp'),
      kh: '', chan: ['Kẹp bo mạch/module để 2 tay rảnh cầm mỏ hàn và thiếc.'], gioi_han: '', bay: '', bai: ['12.5'] },

    { id: 'tua-vit', nhom: 'han', ten: 'Tua vít mini đầu dẹt', tim: 'tua vít', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<rect x="20" y="62" width="100" height="24" rx="8" fill="#2F6FD6"/>
        ${[40, 55, 70, 85, 100].map(x => `<line x1="${x}" y1="64" x2="${x}" y2="84" stroke="#1F4FA0"/>`).join('')}
        <rect x="120" y="71" width="100" height="6" fill="#B8BEC4"/><polygon points="220,70 234,72 234,76 220,78" fill="#8A949E"/>
        ${g(232, 74, 232, 104, 'đầu dẹt 2mm', 'middle')}${chu(120, 40, 'vặn biến trở RM065', 'lk-mo')}
        ${chu(130, 136, 'tới chặn thì dừng, vặn cố là gãy', 'lk-canh')}`, 'Tua vít mini đầu dẹt tay cầm xanh'),
      kh: '', chan: ['Đầu dẹt 2mm vừa rãnh rotor RM065.'], gioi_han: '', bay: 'Tua vít kim loại chạm 2 chân đang có điện = nối tắt.', bai: ['2.3'] },

    { id: 'day-loi-don', nhom: 'han', ten: 'Dây lõi đơn 22AWG', tim: 'lõi đơn', mua: 'đợt 1 · can-mua.md',
      anh: anh(`<path d="M30 112 V60 H90 V112" fill="none" stroke="#D8322A" stroke-width="5"/><path d="M110 112 V44 H190 V112" fill="none" stroke="#E8B90C" stroke-width="5"/>
        <path d="M210 112 V76 H240 V112" fill="none" stroke="#23303D" stroke-width="5"/>
        ${[30, 90, 110, 190, 210, 240].map(x => `<line x1="${x}" y1="112" x2="${x}" y2="126" stroke="#C77B30" stroke-width="2.5"/>`).join('')}
        ${g(90, 124, 60, 138, 'tuốt ~8mm', 'end')}${chu(150, 24, 'uốn đúng chiều dài: breadboard gọn', 'lk-mo')}`, 'Ba đoạn dây lõi đơn uốn chữ U màu đỏ vàng đen'),
      kh: '', chan: ['Lõi đơn cắm vào breadboard không tuột; dây nhiều sợi thì tuột và xơ.'], gioi_han: '', bay: '', bai: ['12.5'] },

    // ——— Phần 2: ESP32 + xiaozhi (giỏ đã chốt) ———
    { id: 'esp32-s3', nhom: 'esp', ten: 'ESP32-S3 N16R8 44 chân', tim: 'ESP32-S3', mua: 'giỏ đã chốt · xiaozhi-bom.md',
      anh: anh(`<rect x="10" y="40" width="240" height="70" rx="4" fill="#1E2A36"/>
        ${Array.from({ length: 22 }, (_, i) => 26 + i * 10).map(x => `<circle cx="${x}" cy="46" r="2.6" fill="#C9A640"/><circle cx="${x}" cy="104" r="2.6" fill="#C9A640"/>`).join('')}
        <rect x="140" y="54" width="86" height="42" rx="2" fill="#C8CDD2"/>${chu(183, 73, 'ESP32-S3', 'lk-toi')}${chu(183, 88, 'N16R8', 'lk-mo')}
        <rect x="226" y="54" width="20" height="42" fill="#27384A"/><polyline points="230,60 242,60 242,68 230,68 230,76 242,76 242,84 230,84" fill="none" stroke="#C9A640" stroke-width="1.5"/>
        <rect x="-2" y="64" width="18" height="22" rx="4" fill="#B8BEC4"/>
        <rect x="32" y="58" width="10" height="7" fill="#DDE3E8"/><rect x="32" y="85" width="10" height="7" fill="#DDE3E8"/>
        ${chu(46, 64, 'BOOT', 'lk-trang-mo', 'start')}${chu(46, 91, 'RST', 'lk-trang-mo', 'start')}
        ${g(236, 58, 250, 30, 'ăng-ten', 'middle')}${g(6, 86, 6, 124, 'USB-C (cáp có data)')}
        ${chu(120, 16, 'GPIO 3.3V — không chịu 5V', 'lk-xau')}${chu(110, 30, '2 × 22 chân: ghép 2 breadboard', 'lk-mo')}
        ${chu(130, 146, 'đọc chữ in cạnh chân: 3V3 · 5V · GND · số GPIO', 'lk-mo')}`, 'Board ESP32-S3: module kim loại có ăng-ten, 2 hàng 22 chân, cổng USB-C, nút BOOT và RST'),
      kh: '',
      chan: ['Chân nguồn: 3V3, 5V (có board ghi VIN), GND. Còn lại là GPIO — số in cạnh chân.', 'Nếu board có 2 cổng USB-C: một cổng qua chip UART (COM), một cổng USB của chip — xem chữ in.', 'Không đụng: GPIO0/3/45/46 (strapping), 26–37 (flash/PSRAM bản R8), 19/20 (USB), 43/44 (UART nạp code) — đã đối chiếu datasheet v2.2, chi tiết ở bài 9.6.'],
      gioi_han: 'Mọi chân tối đa 3.6V. Mặc định 20mA/chân (GPIO17/18: 10mA). ADC đo đúng 0–2.9V (suy hao 12dB). Nguồn: datasheet ESP32-S3 v2.2.',
      bay: 'Nối 5V vào GPIO hoặc nối tắt 3V3–GND khi đang cắm USB → hỏng chip/cổng USB máy tính. Rút USB trước khi sửa dây.',
      bai: ['8.1', '8.3', '8.4', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '10.1', '10.2', '10.3', '10.4', '11.1', '11.2', '11.3', '12.1', '12.2', '12.3', '12.4', '12.5', '13.1', '13.2', '13.3'] },

    { id: 'inmp441', nhom: 'esp', ten: 'Mic I2S INMP441', tim: 'INMP441', mua: 'giỏ đã chốt · xiaozhi-bom.md',
      anh: anh(`<circle cx="130" cy="60" r="40" fill="#5B3E8C" ${vien}/>
        <rect x="116" y="46" width="28" height="28" rx="3" fill="#C8CDD2"/><circle cx="130" cy="60" r="4" fill="#1B1F24"/>
        ${[105, 115, 125, 135, 145, 155].map(x => `<circle cx="${x}" cy="104" r="2.6" fill="#C9A640"/>${chan(x, 107, 124)}`).join('')}
        ${g(134, 60, 196, 40, 'lỗ thu âm')}${chu(130, 18, 'VDD 3.3V — không cắm 5V', 'lk-xau')}
        ${chu(130, 138, '6 chân: SCK · WS · L/R · SD · VDD · GND', 'lk-mo')}
        ${chu(130, 152, 'thứ tự chân: đọc chữ in trên module', 'lk-canh')}`, 'Module mic INMP441 tròn màu tím, 6 chân', 160),
      kh: '',
      chan: ['SCK → GPIO5, WS → GPIO4, SD → GPIO6 (bread-compact-wifi). L/R → GND (kênh trái). VDD → 3V3, GND → GND.'],
      gioi_han: 'VDD 1.8–3.3V.',
      bay: 'Cấp 5V vào VDD là hỏng mic. Header phải tự hàn.',
      bai: ['12.2', '12.5'] },

    { id: 'max98357a', nhom: 'esp', ten: 'Ampli I2S MAX98357A', tim: 'MAX98357A', mua: 'giỏ đã chốt · xiaozhi-bom.md',
      anh: anh(`<rect x="70" y="36" width="120" height="64" rx="3" fill="#5B3E8C" ${vien}/><rect x="116" y="54" width="24" height="24" fill="#1E2226"/>
        <rect x="190" y="52" width="26" height="32" rx="2" fill="#2E9E5B"/><circle cx="203" cy="61" r="4" fill="#B8BEC4"/><circle cx="203" cy="75" r="4" fill="#B8BEC4"/>
        ${chu(224, 64, '+', 'lk-chu', 'start')}${chu(224, 78, '−', 'lk-chu', 'start')}
        ${[82, 98, 114, 130, 146, 162, 178].map(x => `<circle cx="${x}" cy="94" r="2.6" fill="#C9A640"/>${chan(x, 97, 122)}`).join('')}
        ${g(210, 84, 236, 108, 'ra loa', 'middle')}${chu(130, 18, 'loa: không nối đầu nào xuống GND', 'lk-xau')}
        ${chu(130, 140, 'LRC · BCLK · DIN · GAIN · SD · GND · VIN', 'lk-mo')}`, 'Module ampli MAX98357A tím, 7 chân và cọc bắt 2 dây loa'),
      kh: '',
      chan: ['DIN → GPIO7, BCLK → GPIO15, LRC → GPIO16. VIN → 5V, GND → GND. GAIN, SD để trống theo mặc định.', 'Loa nối 2 cọc +/− của module.'],
      gioi_han: 'VIN 2.5–5.5V. Ra ~3W ở 5V/4Ω — loa điện thoại chịu ít hơn nhiều.',
      bay: 'Ngõ ra loa là cầu (BTL): nối đầu − loa xuống GND là nối tắt ngõ ra.',
      bai: ['12.3', '12.5'] },

    { id: 'oled', nhom: 'esp', ten: 'OLED 0.96" 128×64 I2C', tim: 'OLED', mua: 'giỏ đã chốt · xiaozhi-bom.md',
      anh: anh(`<rect x="70" y="30" width="120" height="92" rx="3" fill="#1F4E8C" ${vien}/>
        <rect x="78" y="50" width="104" height="60" fill="#0B0F13"/>
        <text x="130" y="84" text-anchor="middle" style="fill:#7FD8FF;font:600 13px var(--mono)">xiaozhi</text>
        ${[115, 125, 135, 145].map(x => `<circle cx="${x}" cy="38" r="2.6" fill="#C9A640"/>${chan(x, 20, 35)}`).join('')}
        ${chu(130, 12, 'GND · VCC · SCL · SDA ?', 'lk-mo')}
        ${g(182, 80, 214, 80, '128×64')}${chu(130, 140, 'thứ tự 4 chân tuỳ shop → đọc chữ in', 'lk-canh')}`, 'Màn OLED 0.96 inch trên mạch xanh, 4 chân I2C ở cạnh trên'),
      kh: '',
      chan: ['4 chân: GND, VCC, SCL → GPIO42, SDA → GPIO41. Thứ tự GND/VCC có shop đảo ngược — đọc chữ in.', 'Địa chỉ I2C thường 0x3C.'],
      gioi_han: 'VCC thường 3.3–5V (module có ổn áp) — kiểm chữ in/shop; cấp 3V3 cho chắc.',
      bay: 'Cắm đảo GND/VCC là hỏng màn.',
      bai: ['12.1', '12.4', '12.5'] },

    { id: 'loa', nhom: 'esp', ten: 'Loa điện thoại (Samsung)', tim: 'Loa ngoài', mua: 'giỏ đã chốt · xiaozhi-bom.md',
      anh: anh(`<rect x="80" y="40" width="100" height="60" rx="8" fill="#2A3440" ${vien}/><rect x="90" y="50" width="80" height="40" rx="4" fill="#46525E"/>
        ${Array.from({ length: 24 }, (_, i) => `<circle cx="${98 + (i % 8) * 9.5}" cy="${57 + Math.floor(i / 8) * 13}" r="1.6" fill="#1B1F24"/>`).join('')}
        <rect x="68" y="54" width="12" height="8" fill="#C9A640"/><rect x="68" y="78" width="12" height="8" fill="#C9A640"/>
        ${g(70, 58, 56, 40, '2 miếng hàn', 'end')}${chu(130, 128, 'chịu ~0.5–1W (chưa kiểm) · volume ~60%', 'lk-canh')}`, 'Loa điện thoại hình chữ nhật có lưới, 2 miếng hàn'),
      kh: kh(net('8,20 36,20') + net('8,36 36,36') + '<rect x="36" y="14" width="12" height="28" class="lk-net"/>' + '<polygon points="48,14 70,2 70,54 48,42" class="lk-net"/>', 'loa'),
      chan: ['2 miếng hàn, không có cực quan trọng với 1 loa. Hàn 2 dây rồi bắt vào cọc của MAX98357A.'],
      gioi_han: 'Công suất chưa kiểm: để volume vừa.', bay: 'Hàn lâu trên miếng hàn nhỏ → bong. Hàn nhanh, đã tráng thiếc sẵn.', bai: ['12.3', '12.5'] },

    { id: 'cap-usbc', nhom: 'esp', ten: 'Cáp USB-C có truyền data', tim: 'USB-C có data', mua: 'kiểm cáp đang có',
      anh: anh(`<path d="M60 75 C 100 120, 160 30, 200 75" fill="none" stroke="#23303D" stroke-width="5"/>
        <rect x="10" y="63" width="50" height="24" rx="2" fill="#B8BEC4" ${vien}/><rect x="-6" y="67" width="16" height="16" fill="#8A949E"/>
        <rect x="200" y="66" width="40" height="18" rx="8" fill="#B8BEC4" ${vien}/><rect x="240" y="70" width="12" height="10" rx="4" fill="#3B4652"/>
        ${g(2, 75, 2, 110, 'USB-A (máy tính)', 'start')}${g(246, 75, 246, 110, 'USB-C', 'middle')}
        ${chu(130, 140, 'cáp chỉ sạc → máy không thấy board', 'lk-canh')}`, 'Cáp USB-A sang USB-C'),
      kh: '', chan: ['Cắm board vào máy: máy phải hiện cổng mới (ls /dev/cu.*). Không hiện → thử cáp khác trước.'], gioi_han: '',
      bay: 'Cáp sạc rẻ thiếu dây data: board vẫn sáng đèn nhưng không nạp được code.', bai: ['8.1'] },

    { id: 'day-duc-cai', nhom: 'esp', ten: 'Dây nhảy đực–cái', tim: 'đực–cái', mua: 'đợt 2 · can-mua.md',
      anh: anh(`<path d="M40 98 C 80 20, 180 20, 220 98" fill="none" stroke="#2E9E5B" stroke-width="5" stroke-linecap="round"/>
        <rect x="32" y="96" width="16" height="24" rx="2" fill="#1E2226"/>${chan(40, 120, 140)}
        <rect x="212" y="96" width="16" height="34" rx="2" fill="#1E2226"/><rect x="217" y="124" width="6" height="6" fill="#0B0F13"/>
        ${g(40, 138, 70, 138, 'đực: kim')}${g(228, 128, 250, 110, 'cái: lỗ', 'middle')}
        ${chu(130, 24, 'module chân đực ↔ breadboard', 'lk-mo')}`, 'Dây nhảy một đầu kim đực, một đầu lỗ cái'),
      kh: '', chan: ['Đầu cái cắm vào chân đực của module, đầu đực cắm vào breadboard.'], gioi_han: '', bay: '', bai: ['12.1', '12.2', '12.3', '12.5'] },

    // ——— Mua khi tới Phần 2 / robot ———
    { id: 'ams1117', nhom: 'sau', ten: 'Module ổn áp AMS1117-3.3', tim: 'AMS1117', mua: 'đợt 3 · can-mua.md',
      anh: anh(`<rect x="80" y="40" width="100" height="60" rx="3" fill="#1F4E8C" ${vien}/>
        <rect x="112" y="46" width="36" height="8" fill="#B8BEC4"/><rect x="108" y="54" width="44" height="28" fill="#1E2226"/>
        ${chu(130, 66, 'AMS1117', 'lk-trang')}${chu(130, 77, '3.3', 'lk-trang-mo')}
        ${[110, 130, 150].map(x => `<circle cx="${x}" cy="94" r="2.6" fill="#C9A640"/>${chan(x, 97, 122)}`).join('')}
        ${chu(130, 136, 'chân: đọc chữ in (VIN · GND · VOUT)', 'lk-canh')}${chu(130, 20, 'áp vào phải ≳ 4.4V mới ra đủ 3.3V', 'lk-mo')}`, 'Module ổn áp AMS1117 xanh, 3 chân'),
      kh: kh('<rect x="40" y="10" width="40" height="26" class="lk-net"/>' + net('8,20 40,20') + net('80,20 112,20') + net('60,36 60,52') + chu(60, 27, 'REG', 'lk-mo') + chu(16, 14, 'IN', 'lk-mo') + chu(104, 14, 'OUT', 'lk-mo'), 'ổn áp'),
      chan: ['3 chân: VIN, GND, VOUT (3.3V). Thứ tự trên module tuỳ loại — đọc chữ in.'],
      gioi_han: 'Sụt ~1.1V: vào 5V ra 3.3V ổn; vào 4.5V là sát ngưỡng. Phần áp dư thành nhiệt.',
      bay: 'Nối ngược VIN/VOUT hoặc cấp quá áp → nóng, hỏng.', bai: ['8.2'] },

    { id: 'driver-motor', nhom: 'sau', ten: 'Module driver motor (cầu H)', tim: 'driver motor', mua: 'đợt 3 · chọn lúc tới nơi',
      anh: anh(`<rect x="60" y="30" width="140" height="84" rx="3" fill="#8C2F2A" ${vien}/><rect x="112" y="54" width="36" height="36" fill="#1E2226"/>
        <rect x="42" y="42" width="18" height="26" rx="2" fill="#2E9E5B"/><rect x="42" y="76" width="18" height="26" rx="2" fill="#2E9E5B"/>
        ${[48, 62, 76, 90].map(y => `<circle cx="206" cy="${y}" r="2.6" fill="#C9A640"/>`).join('')}
        ${g(42, 55, 30, 40, 'motor A', 'end')}${g(42, 89, 42, 120, 'nguồn motor', 'middle')}${g(206, 62, 236, 40, 'IN ← GPIO', 'middle')}
        ${chu(150, 146, 'chưa chọn loại — hình chung chung', 'lk-mo')}`, 'Module driver motor chung: IC giữa, cọc bắt dây motor và nguồn, chân điều khiển'),
      kh: kh(net('20,4 20,14') + net('20,14 14,22') + net('20,22 20,34') + net('20,34 14,42') + net('20,42 20,52') + net('100,4 100,14') + net('100,14 106,22') + net('100,22 100,34') + net('100,34 106,42') + net('100,42 100,52') + net('20,4 100,4') + net('20,52 100,52') + net('20,28 48,28') + net('72,28 100,28') + '<circle cx="60" cy="28" r="12" class="lk-net"/>' + chu(60, 33, 'M', 'lk-chu-kh'), 'cầu H'),
      chan: ['Thường có: cọc motor (OUT), cọc nguồn motor (VM/VS + GND), chân điều khiển IN1/IN2 (hoặc EN/PWM) từ GPIO, và GND chung với ESP32.'],
      gioi_han: 'Chọn theo dòng motor đo được ở 7.4 + áp pin robot.',
      bay: 'Quên GND chung giữa driver và ESP32 → điều khiển không ăn. Nguồn motor không lấy từ chân 3V3 của board.', bai: ['13.1', '13.2', '13.3'] },

    { id: 'logic-analyzer', nhom: 'sau', ten: 'Logic analyzer 8 kênh 24MHz', tim: 'logic analyzer', mua: 'đợt 3 · can-mua.md',
      anh: anh(`<rect x="80" y="40" width="110" height="64" rx="8" fill="#9AA3AD" ${vien}/>${chu(135, 68, 'LOGIC', 'lk-toi')}${chu(135, 84, '24MHz · 8CH', 'lk-mo')}
        <rect x="190" y="62" width="16" height="20" rx="2" fill="#B8BEC4"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="64" y="${46 + i * 11}" width="6" height="6" fill="#C9A640"/><rect x="72" y="${46 + i * 11}" width="6" height="6" fill="#C9A640"/>`).join('')}
        ${g(64, 60, 48, 40, 'CH0–7, GND', 'end')}${g(206, 72, 236, 100, 'USB', 'middle')}
        ${chu(130, 130, 'nối GND trước · tín hiệu ≤ 5V', 'lk-canh')}`, 'Hộp logic analyzer nhôm, hàng chân kênh bên trái, cổng USB bên phải'),
      kh: '', chan: ['Dây GND của máy nối GND mạch trước, rồi mới kẹp các kênh vào SCL/SDA, SCK/WS/SD.'], gioi_han: 'Chỉ đọc tín hiệu số 0/1, ≤ 5V.', bay: 'Kẹp vào nguồn motor/áp cao hơn 5V là hỏng.', bai: ['11.2', '12.4'] },

    { id: 'dso138', nhom: 'sau', ten: 'Máy hiện sóng kit DSO138', tim: 'DSO138', mua: 'đợt 3 · tuỳ chọn',
      anh: anh(`<rect x="40" y="20" width="190" height="100" rx="3" fill="#1F4E8C" ${vien}/><rect x="58" y="30" width="118" height="80" fill="#0B0F13"/>
        <path d="M62 70 C 72 40, 82 40, 92 70 S 112 100, 122 70 S 142 40, 152 70 S 168 96, 172 80" fill="none" stroke="#F2D14A" stroke-width="1.8"/>
        ${[40, 60, 80, 100].map(y => `<circle cx="204" cy="${y}" r="5" fill="#DDE3E8"/>`).join('')}
        <circle cx="26" cy="70" r="12" fill="#B8BEC4" ${vien}/><circle cx="26" cy="70" r="4" fill="#3B4652"/>
        ${g(26, 82, 26, 112, 'đầu vào', 'middle')}${chu(135, 140, 'kit tự hàn — kiêm bài tập hàn', 'lk-mo')}`, 'Kit máy hiện sóng DSO138: màn hình hiện sóng, 4 nút, cổng vào tròn'),
      kh: '', chan: ['Que đo có kẹp mass (GND) và đầu móc tín hiệu.'], gioi_han: 'Áp vào tối đa: tra hướng dẫn của kit.', bay: 'Kẹp mass vào điểm không phải GND của mạch = nối tắt điểm đó xuống GND.', bai: ['8.4'] },
  ];

  const NHOM = {
    lk: 'Linh kiện', dc: 'Dụng cụ & nguồn', quat: 'Trong quạt dự phòng (để dành)',
    c7: 'Cần mua · chương 7 cuộn dây & motor', han: 'Cần mua · đồ nghề hàn & dụng cụ',
    esp: 'Phần 2 · ESP32 + xiaozhi', sau: 'Mua khi tới Phần 2 / robot',
  };
  const timLK = t => { const k = String(t || '').toLowerCase(); return LK.find(l => l.tim.toLowerCase() === k); };
  window.LINHKIEN = { ds: LK, nhom: NHOM, tim: timLK, theoId: id => LK.find(l => l.id === id) };
})();
