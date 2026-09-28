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
      chan: ['Que đen luôn ở COM. Que đỏ ở VΩ để đo áp/Ω; chỉ chuyển sang lỗ mA khi đo dòng, đo xong trả về VΩ ngay.', 'Vị trí 3 lỗ khác nhau giữa các đời máy — đọc chữ in cạnh lỗ trên máy của bạn.'],
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
    // ── Phần 3 · robot. Số liệu + nguồn: notes/datasheet-robot.md
    { id: 'cong-tac-ht', nhom: 'robot', ten: 'Công tắc hành trình KW11-3Z', tim: 'KW11', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="70" y="40" width="120" height="56" rx="3" fill="#1E2328" ${vien}/>
        <path d="M84 40 L 196 18" stroke="#B8BEC4" stroke-width="4" stroke-linecap="round"/><rect x="118" y="34" width="12" height="8" fill="#D83A2E"/>
        ${[92, 130, 168].map(x => chan(x, 96, 124)).join('')}
        ${chu(92, 138, 'COM?', 'lk-canh')}${chu(130, 138, 'NO?', 'lk-canh')}${chu(168, 138, 'NC?', 'lk-canh')}
        ${g(196, 18, 226, 30, 'cần gạt')}${g(124, 38, 110, 12, 'nút bên trong', 'end')}${chu(130, 74, 'KW11', 'lk-trang')}`, 'Công tắc hành trình: thân đen chữ nhật, cần gạt kim loại phía trên, 3 chân dưới'),
      kh: kh(net('8,40 44,40') + '<circle cx="46" cy="40" r="2.5" class="lk-dac"/>' + net('48,39 86,22') + '<circle cx="90" cy="20" r="2.5" class="lk-dac"/><circle cx="90" cy="46" r="2.5" class="lk-dac"/>' + net('92,20 112,20') + net('92,46 112,46') + chu(18, 32, 'COM', 'lk-mo') + chu(104, 14, 'NC', 'lk-mo') + chu(104, 56, 'NO', 'lk-mo'), 'công tắc 1 cực 2 ngả'),
      chan: ['3 chân: <b>COM</b> (chung), <b>NO</b> (thường hở — chỉ thông COM khi nhấn), <b>NC</b> (thường đóng — thông COM khi nhả).', 'Chữ in trên thân thường ghi C/NO/NC; không có chữ thì <b>đo mới biết</b>: thang thông mạch, tìm cặp kêu khi nhả (COM–NC), nhấn giữ thì cặp COM–NO kêu.'],
      gioi_han: 'Tiếp điểm chịu 5A 250VAC — thừa xa cho tín hiệu 3.3V vài µA.',
      bay: 'Dùng nhầm NC thay NO: logic đảo ngược (nhả = 0). Nối COM vào 3V3 và NO vào GND: nhấn là nối tắt nguồn.', bai: ['14.1', '17.1'] },

    { id: 'fc51', nhom: 'robot', ten: 'Module hồng ngoại tránh vật FC-51', tim: 'FC-51', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="60" y="40" width="170" height="60" rx="3" fill="#1F5AA8" ${vien}/>
        <rect x="20" y="46" width="40" height="18" rx="9" fill="#1E2328"/><rect x="20" y="76" width="40" height="18" rx="9" fill="#E8EEF2" stroke="#9AA3AD"/>
        <rect x="104" y="52" width="24" height="24" fill="#2F6FD6" stroke="#fff"/><circle cx="116" cy="64" r="6" fill="#fff"/>
        <rect x="140" y="72" width="26" height="18" fill="#1E2226"/>
        ${[196, 208, 220].map(y => `<circle cx="232" cy="${y - 140}" r="2.6" fill="#C9A640"/>${chan(232, y - 140, y - 140)}`).join('')}
        ${[56, 68, 80].map(y => `<line x1="232" y1="${y}" x2="258" y2="${y}" class="lk-chan"/>`).join('')}
        ${g(20, 55, 6, 30, 'thu IR (đen)', 'end')}${g(20, 85, 6, 120, 'phát IR (trong)', 'end')}${g(116, 52, 116, 22, 'biến trở tầm', 'middle')}${g(153, 90, 153, 124, 'LM393', 'middle')}
        ${chu(262, 60, 'VCC?', 'lk-canh', 'start')}${chu(262, 72, 'GND?', 'lk-canh', 'start')}${chu(262, 84, 'OUT?', 'lk-canh', 'start')}`, 'Module FC-51: mạch xanh, 2 bóng hồng ngoại đen và trong ở một đầu, biến trở xanh, 3 chân ở đầu kia'),
      kh: '',
      chan: ['3 chân VCC, GND, OUT — thứ tự tuỳ shop, <b>đọc chữ in</b>.', 'Bóng trong = LED phát hồng ngoại (mắt không thấy, camera điện thoại thấy tím), bóng đen = thu.', 'OUT thấp (≈0V) khi có vật, cao khi trống; đèn nhỏ trên board sáng khi có vật.'],
      gioi_han: 'OUT được kéo lên <b>VCC</b> qua 10k → cấp 5V là OUT lên 5V, quá sức chân GPIO. Với ESP32 cấp <b>3V3</b>. Tầm quảng cáo 2–30cm, thực tế tuỳ màu vật.',
      bay: 'Vật đen / nắng chiếu thẳng: không thấy vật hoặc báo sai. Vặn biến trở quá tay: luôn báo có vật.', bai: ['14.2', '17.1'] },

    { id: 'hc-sr04', nhom: 'robot', ten: 'Cảm biến siêu âm HC-SR04', tim: 'HC-SR04', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="30" y="36" width="200" height="64" rx="3" fill="#1F5AA8" ${vien}/>
        <circle cx="72" cy="66" r="27" fill="#B8BEC4" ${vien}/><circle cx="72" cy="66" r="19" fill="#5B6573"/>
        <circle cx="188" cy="66" r="27" fill="#B8BEC4" ${vien}/><circle cx="188" cy="66" r="19" fill="#5B6573"/>
        <rect x="116" y="42" width="28" height="12" rx="4" fill="#C9CED3"/>
        ${[112, 124, 136, 148].map(x => `<circle cx="${x}" cy="94" r="2.6" fill="#C9A640"/>${chan(x, 100, 126)}`).join('')}
        ${chu(112, 140, 'VCC', 'lk-chu')}${chu(124, 150, 'Trig', 'lk-chu')}${chu(136, 140, 'Echo', 'lk-chu')}${chu(148, 150, 'GND', 'lk-chu')}
        ${g(52, 46, 30, 20, 'T: loa phát', 'end')}${g(208, 46, 232, 20, 'R: micro thu')}`, 'HC-SR04: mạch xanh với 2 ống tròn bạc (phát và thu), 4 chân VCC Trig Echo GND ở giữa cạnh dưới'),
      kh: '',
      chan: ['4 chân theo thứ tự in trên board: <b>VCC · Trig · Echo · GND</b> (bản gốc Elecfreaks). Bản clone vẫn đọc chữ in.', 'Trig: GPIO đưa mức cao ≥ 10µs để bắt đầu đo. Echo: module trả 1 xung cao dài bằng thời gian sóng đi và về.'],
      gioi_han: 'Nguồn 5V, 15mA. Echo ra mức 5V → qua cầu 10k/20k (bài 9.5) mới vào GPIO. Đo 2–400cm, góc ~15°; mỗi lần đo cách nhau ≥ 60ms. <code>cm = µs / 58</code>.',
      bay: 'Echo nối thẳng GPIO: 5V vào chân 3.3V. Vật mềm (vải, rèm) hoặc mặt xiên: sóng không dội về → đo ra rất xa hoặc không ra.', bai: ['14.3', '17.1'] },

    { id: 'tcrt5000', nhom: 'robot', ten: 'Module TCRT5000 (dò vạch / chống rơi)', tim: 'TCRT5000', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="50" y="40" width="180" height="56" rx="3" fill="#1F5AA8" ${vien}/>
        <rect x="18" y="50" width="32" height="36" rx="3" fill="#1E2328"/><circle cx="34" cy="60" r="6" fill="#2E6FB0"/><circle cx="34" cy="76" r="6" fill="#111"/>
        <rect x="96" y="50" width="22" height="22" fill="#2F6FD6" stroke="#fff"/><circle cx="107" cy="61" r="5" fill="#fff"/>
        ${[52, 62, 72, 82].map(y => `<circle cx="232" cy="${y}" r="2.6" fill="#C9A640"/><line x1="232" y1="${y}" x2="258" y2="${y}" class="lk-chan"/>`).join('')}
        ${chu(262, 56, 'VCC?', 'lk-canh', 'start')}${chu(262, 66, 'GND?', 'lk-canh', 'start')}${chu(262, 76, 'DO?', 'lk-canh', 'start')}${chu(262, 86, 'AO?', 'lk-canh', 'start')}
        ${g(18, 68, 4, 30, 'TCRT5000: phát + thu', 'end')}${g(107, 50, 107, 22, 'biến trở ngưỡng DO', 'middle')}`, 'Module TCRT5000: khối đen có 2 mắt ở một đầu, biến trở xanh, 4 chân VCC GND DO AO'),
      kh: kh(net('10,12 10,44') + '<polygon points="4,24 16,24 10,34" class="lk-net"/>' + net('4,34 16,34') + net('20,24 30,18') + net('20,30 30,24') + net('60,14 60,44') + net('60,24 76,14') + net('60,34 76,44') + net('76,14 76,4') + net('76,44 76,54') + net('40,22 52,26') + net('40,28 52,32') + chu(10, 54, 'LED IR', 'lk-mo') + chu(92, 30, 'thu', 'lk-mo'), 'LED hồng ngoại + phototransistor'),
      chan: ['4 chân VCC, GND, DO (số), AO (tương tự) — đọc chữ in.', 'DO thấp khi thấy mặt phản xạ (bàn sáng màu) — kiểu như FC-51. AO: áp đổi liên tục theo lượng hồng ngoại dội về.'],
      gioi_han: 'Mắt TCRT5000 làm việc tốt nhất ở ~2.5mm, dùng được 0.2–15mm (Vishay) → gắn sát mặt sàn. Cấp <b>3V3</b> cho ESP32 (DO/AO lên tới VCC).',
      bay: 'Gắn cao quá 1.5cm: gần như luôn báo "không thấy sàn". Sàn đen / thảm tối cũng bị coi như mép vực.', bai: ['14.4'] },

    { id: 'sg90', nhom: 'robot', ten: 'Servo SG90', tim: 'SG90', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="60" y="50" width="100" height="56" rx="3" fill="#2F58B8" ${vien}/><rect x="44" y="60" width="132" height="10" rx="2" fill="#2F58B8" ${vien}/>
        <circle cx="90" cy="44" r="12" fill="#E8EEF2" stroke="#9AA3AD"/><path d="M90 44 L 150 30" stroke="#E8EEF2" stroke-width="8" stroke-linecap="round"/>
        <path d="M160 92 C 200 92, 200 120, 236 120" stroke="#E07020" stroke-width="3" fill="none"/><path d="M160 97 C 196 97, 196 128, 236 128" stroke="#C8322B" stroke-width="3" fill="none"/><path d="M160 102 C 192 102, 192 136, 236 136" stroke="#6D4C41" stroke-width="3" fill="none"/>
        ${chu(240, 123, 'cam = tín hiệu', 'lk-chu', 'start')}${chu(240, 131, 'đỏ = + (4.8–6V)', 'lk-chu', 'start')}${chu(240, 139, 'nâu = −', 'lk-chu', 'start')}
        ${g(150, 30, 190, 20, 'tay quay')}${chu(110, 86, 'SG90', 'lk-trang')}`, 'Servo SG90: hộp xanh dương, tay quay trắng phía trên, 3 dây cam đỏ nâu'),
      kh: '',
      chan: ['3 dây: <b>cam</b> = tín hiệu PWM, <b>đỏ</b> = nguồn +, <b>nâu</b> = GND (TowerPro). Bản clone có thể vàng/đỏ/đen: vàng = tín hiệu, đen = GND.'],
      gioi_han: 'Nguồn 4.8–6V; xung 1–2ms mỗi 20ms (50Hz): 1ms = một đầu, 1.5ms = giữa, 2ms = đầu kia (~180°). Dòng kẹt không ghi trong datasheet: <b>đo mới biết</b> — vì vậy không lấy nguồn từ chân 5V/3V3 của board.',
      bay: 'Lấy nguồn servo từ board: servo khởi động kéo dòng → board reset. Quên GND chung: servo giật lung tung. Bẻ tay quay bằng tay khi đang cấp điện: hỏng bánh răng.', bai: ['15.1'] },

    { id: 'motor-tt', nhom: 'robot', ten: 'Motor giảm tốc TT 1:48 + bánh', tim: 'motor TT', mua: 'đợt 4 · trong khung 2WD',
      anh: anh(`<rect x="40" y="46" width="130" height="44" rx="4" fill="#E8C24A" ${vien}/><rect x="170" y="54" width="40" height="28" rx="12" fill="#B8BEC4" ${vien}/>
        <rect x="90" y="30" width="12" height="16" fill="#F2F2F2" stroke="#9AA3AD"/><circle cx="96" cy="68" r="6" fill="#F2F2F2" stroke="#9AA3AD"/>
        <circle cx="236" cy="68" r="4" fill="#C9A640"/><circle cx="236" cy="80" r="4" fill="#C9A640"/>
        ${g(96, 30, 96, 12, 'trục ra (2 phía)', 'middle')}${g(190, 54, 214, 30, 'motor DC')}${g(96, 90, 96, 122, 'hộp số nhựa 1:48', 'middle')}${g(236, 80, 250, 104, '2 cực hàn dây')}`, 'Motor TT: hộp số nhựa vàng, motor bạc gắn một đầu, trục trắng ra 2 bên'),
      kh: '',
      chan: ['2 cực, không phân cực: đảo 2 dây = đổi chiều quay.', 'Trục ra 2 phía hộp số: một bên gắn bánh, bên kia gắn đĩa encoder (15.2).'],
      gioi_han: 'Bản Adafruit: 3–6V; không tải 150mA; <b>kẹt 1.2A ở 4.5V, 1.5A ở 6V</b>; 185 vòng/phút ở 4.5V. Motor shop khác: đo dòng mới biết (7.4). Dòng kẹt vượt S8050 → cần driver.',
      bay: 'Cấp thẳng pack 2S (8.4V) toàn thời gian: quá áp định mức 6V → giới hạn duty PWM ≤ 70% (bài 17.1).', bai: ['15.2', '17.1'] },

    { id: 'khe-quang', nhom: 'robot', ten: 'Cảm biến tốc độ khe quang + đĩa 20 lỗ', tim: 'khe quang', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="110" y="70" width="120" height="44" rx="3" fill="#1F5AA8" ${vien}/>
        <rect x="118" y="30" width="16" height="40" fill="#1E2328"/><rect x="146" y="30" width="16" height="40" fill="#1E2328"/>
        <circle cx="60" cy="70" r="46" fill="#2A3038" ${vien}/>${Array.from({ length: 20 }, (_, i) => { const a = i * Math.PI / 10; return `<rect x="${60 + 38 * Math.cos(a) - 2}" y="${70 + 38 * Math.sin(a) - 4}" width="4" height="8" fill="#F3F1EA" transform="rotate(${i * 18} ${60 + 38 * Math.cos(a)} ${70 + 38 * Math.sin(a)})"/>`; }).join('')}<circle cx="60" cy="70" r="6" fill="#E8EEF2"/>
        ${[80, 90, 100].map(y => `<circle cx="232" cy="${y}" r="2.6" fill="#C9A640"/><line x1="232" y1="${y}" x2="258" y2="${y}" class="lk-chan"/>`).join('')}
        ${chu(262, 84, 'VCC?', 'lk-canh', 'start')}${chu(262, 94, 'GND?', 'lk-canh', 'start')}${chu(262, 104, 'OUT?', 'lk-canh', 'start')}
        ${g(140, 30, 150, 12, 'khe: đĩa quay lọt giữa', 'middle')}${g(60, 116, 60, 140, 'đĩa 20 lỗ trên trục motor', 'middle')}`, 'Cảm biến khe quang: mạch xanh với khe đen hình chữ U; bên cạnh là đĩa đen có 20 lỗ quanh vành'),
      kh: '',
      chan: ['3 chân VCC, GND, OUT (có loại 4 chân thêm AO) — đọc chữ in.', 'Lỗ đĩa đi qua khe → OUT đổi mức 1 lần. 20 lỗ = 20 xung mỗi vòng.'],
      gioi_han: 'Shop ghi khác nhau: có loại chỉ chạy <b>5V và ra 5V</b> (HC-020K), có loại 3.3–5V (LM393, FC-03). <b>Đo chân OUT bằng đồng hồ trước khi nối GPIO.</b> Ra 5V → cầu 10k/20k (9.5).',
      bay: 'Đĩa cọ vào khe: kêu, đếm sai. Ánh sáng mạnh chiếu vào khe: đếm nhiễu.', bai: ['15.2'] },

    { id: 'gy521', nhom: 'robot', ten: 'Module GY-521 (IMU MPU-6050)', tim: 'GY-521', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="70" y="26" width="120" height="96" rx="3" fill="#1F5AA8" ${vien}/><rect x="112" y="60" width="30" height="30" fill="#1E2226"/>
        <circle cx="84" cy="40" r="6" fill="none" stroke="#C9A640" stroke-width="3"/><circle cx="176" cy="40" r="6" fill="none" stroke="#C9A640" stroke-width="3"/>
        ${[80, 93, 106, 119, 132, 145, 158, 171].map(x => `<circle cx="${x}" cy="114" r="2.6" fill="#C9A640"/>${chan(x, 122, 134)}`).join('')}
        ${chu(80, 146, 'VCC', 'lk-mo')}${chu(106, 146, 'SCL', 'lk-mo')}${chu(132, 146, 'XCL…', 'lk-mo')}${chu(93, 156, 'GND', 'lk-mo')}${chu(119, 156, 'SDA', 'lk-mo')}${chu(158, 156, 'AD0 · INT', 'lk-mo')}
        <path d="M150 50 L 176 50 M 150 50 L 150 24" stroke="#fff" stroke-width="1.5"/>${chu(180, 53, 'X', 'lk-trang', 'start')}${chu(150, 20, 'Y', 'lk-trang')}
        ${g(127, 60, 214, 70, 'MPU-6050')}`, 'Module GY-521: mạch xanh vuông, chip MPU-6050 giữa, 8 chân một hàng: VCC GND SCL SDA XDA XCL AD0 INT, có mũi tên trục X Y'),
      kh: '',
      chan: ['8 chân: VCC, GND, SCL, SDA, XDA, XCL, AD0, INT. Bài chỉ dùng 4 chân đầu. AD0 để hở (board kéo xuống 4.7k) → địa chỉ <code>0x68</code>; nối AD0 lên 3V3 → <code>0x69</code>.', 'Mũi tên X/Y in trên board = chiều trục; Z vuông góc mặt board (xoay board trên bàn = quay quanh Z).'],
      gioi_han: 'Chip MPU-6050: 2.375–3.46V; board có ổn áp 3.3V nên VCC nhận 3.3–5V — cấp <b>3V3</b> để chân SDA/SCL không bị kéo lên 5V. Gyro ±250°/s: 131 đơn vị = 1°/s.',
      bay: 'Quên đánh thức: chip bật lên đang ngủ (thanh ghi 0x6B = 0x40), đọc ra toàn 0. Gyro cộng dồn thì góc trôi dần: phải trừ sai lệch lúc đứng yên, và vẫn trôi theo thời gian.', bai: ['15.3'] },

    { id: 'drv8833', nhom: 'robot', ten: 'Module driver motor DRV8833', tim: 'DRV8833', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="70" y="30" width="120" height="86" rx="3" fill="#A3302A" ${vien}/><rect x="112" y="56" width="36" height="30" fill="#1E2226"/>
        ${[42, 54, 66, 78, 90, 102].map(y => `<circle cx="62" cy="${y}" r="2.6" fill="#C9A640"/><line x1="36" y1="${y}" x2="62" y2="${y}" class="lk-chan"/>`).join('')}
        ${[42, 54, 66, 78, 90, 102].map(y => `<circle cx="198" cy="${y}" r="2.6" fill="#C9A640"/><line x1="198" y1="${y}" x2="224" y2="${y}" class="lk-chan"/>`).join('')}
        ${chu(32, 46, 'IN1', 'lk-mo', 'end')}${chu(32, 58, 'IN2', 'lk-mo', 'end')}${chu(32, 70, 'IN3', 'lk-mo', 'end')}${chu(32, 82, 'IN4', 'lk-mo', 'end')}${chu(32, 94, 'EEP/SLP', 'lk-canh', 'end')}${chu(32, 106, 'ULT/FLT', 'lk-mo', 'end')}
        ${chu(228, 46, 'OUT1', 'lk-mo', 'start')}${chu(228, 58, 'OUT2', 'lk-mo', 'start')}${chu(228, 70, 'OUT3', 'lk-mo', 'start')}${chu(228, 82, 'OUT4', 'lk-mo', 'start')}${chu(228, 94, 'VCC/VM', 'lk-mo', 'start')}${chu(228, 106, 'GND', 'lk-mo', 'start')}
        ${g(130, 86, 130, 134, 'DRV8833 — đọc mã vỏ chip', 'middle')}${chu(130, 148, 'tên + thứ tự chân tuỳ shop', 'lk-canh')}`, 'Module DRV8833 đỏ: chip giữa, một hàng chân điều khiển IN1–IN4 và SLEEP, hàng kia OUT1–OUT4, VM, GND'),
      kh: '',
      chan: ['Điều khiển: IN1/IN2 = motor A, IN3/IN4 = motor B (datasheet gọi AIN1/AIN2/BIN1/BIN2). Ra: OUT1/OUT2 → motor A, OUT3/OUT4 → motor B. Nguồn motor VM + GND.', 'Chân ngủ <b>nSLEEP</b> (module in EEP/SLP/STBY): chip kéo xuống bên trong → <b>phải nối lên 3V3</b> mới chạy (có module kéo sẵn — đo mới biết).', 'Bảng (TI): IN1=1 IN2=0 tiến · 0/1 lùi · 0/0 thả trôi · 1/1 phanh. PWM vào 1 chân, chân kia 0 = chỉnh tốc độ.'],
      gioi_han: 'VM 2.7–10.8V (tuyệt đối 11.8V) — pack 2S 8.4V nằm trong. Dòng liên tục/kênh: <b>1.5A nếu vỏ HTSSOP có miếng tản nhiệt dưới, chỉ 0.5A nếu vỏ TSSOP</b>. Tự ngắt khi quá dòng (≥ 2A) hoặc quá nhiệt. Logic mức 1 ≥ 2V → GPIO 3.3V đủ.',
      bay: 'Quên kéo nSLEEP lên: motor không chạy dù code đúng. Motor TT kẹt kéo 1.2–1.5A: chip vỏ TSSOP sẽ tự ngắt liên tục.', bai: ['15.2', '17.1'] },

    { id: 'cell-18650', nhom: 'pin', ten: 'Cell lithium 18650', tim: '18650', mua: 'đợt 4 · hàng hãng',
      anh: anh(`<rect x="40" y="46" width="170" height="48" rx="8" fill="#2E7D5B" ${vien}/><rect x="210" y="58" width="10" height="24" rx="2" fill="#B8BEC4"/><rect x="34" y="50" width="6" height="40" fill="#B8BEC4"/>
        ${chu(125, 74, '3.6V · 18650', 'lk-trang')}${g(220, 70, 246, 40, '+ (núm lồi)')}${g(34, 70, 14, 40, '− (phẳng)', 'end')}
        ${g(125, 94, 125, 124, 'vỏ bọc nhựa: rách = cách điện hở', 'middle')}`, 'Cell 18650: hình trụ dài 65mm, đầu + có núm lồi, đầu − phẳng'),
      kh: kh(net('10,28 46,28') + net('46,14 46,42') + '<rect x="54" y="20" width="4" height="16" class="lk-dac"/>' + net('58,28 110,28') + chu(38, 12, '+', 'lk-chu-kh') + chu(70, 12, '−', 'lk-chu-kh'), 'pin 1 cell'),
      chan: ['Đầu có <b>núm lồi = +</b>, đầu phẳng = −. Đo DCV để chắc: que đỏ vào đầu nghĩ là +, ra số dương là đúng.'],
      gioi_han: 'Danh nghĩa 3.6–3.7V, sạc đầy <b>4.2V</b>, cạn 2.5–3.0V (Samsung 25R cắt ở 2.5V). Cell hãng xả được 10–20A — nghĩa là nối tắt sẽ ra hàng chục ampe. Cell không rõ hãng: số mAh/A trên vỏ thường sai.',
      bay: '<b>Nối tắt 2 cực</b> (dây, kẹp, đồng xu trong túi): nóng đỏ dây, cháy. Vỏ nhựa rách ở đầu +: vỏ kim loại cả thân là cực −, chạm + là chập. Cell < 2.5V, phồng, móp: bỏ, không sạc.', bai: ['16.1', '16.2', '16.3', '17.1'] },

    { id: 'tp4056', nhom: 'pin', ten: 'Module sạc TP4056 có bảo vệ (6 chân)', tim: 'TP4056', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="50" y="40" width="160" height="60" rx="3" fill="#1F5AA8" ${vien}/><rect x="34" y="56" width="22" height="28" rx="3" fill="#B8BEC4"/>
        <rect x="100" y="52" width="22" height="16" fill="#1E2226"/><rect x="100" y="74" width="16" height="12" fill="#1E2226"/><rect x="130" y="74" width="16" height="12" fill="#1E2226"/>
        <circle cx="160" cy="54" r="4" fill="#E5372C"/><circle cx="172" cy="54" r="4" fill="#2FA84F"/>
        ${[[200, 48, 'OUT+'], [200, 92, 'OUT−'], [186, 60, 'B+'], [186, 80, 'B−']].map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="4" fill="#C9A640"/>${chu(x + 18, y + 4, t, 'lk-chu', 'start')}`).join('')}
        ${g(34, 70, 14, 40, 'Type-C 5V vào', 'end')}${g(111, 52, 96, 22, 'TP4056', 'end')}${g(108, 86, 90, 124, 'DW01A + 8205A = bảo vệ', 'middle')}${g(166, 54, 170, 20, 'đỏ sạc · xanh đầy', 'middle')}`, 'Module TP4056 6 chân: cổng USB một đầu, 2 đèn đỏ xanh, cọc B+ B- cho pin và OUT+ OUT- cho tải'),
      kh: '',
      chan: ['<b>B+ / B−</b> → 2 cực cell (qua đế pin). <b>OUT+ / OUT−</b> → tải (đi qua mạch bảo vệ). Cổng USB (hoặc IN+/IN−) → nguồn 5V.', 'Loại 4 chân (chỉ có B+/B−/IN) là <b>không có bảo vệ</b> — không dùng cho bài này.'],
      gioi_han: 'Vào 4.0–8V (tuyệt đối 8V). Sạc tới 4.2V ±1.5%, dòng 1A (điện trở 1.2k trên module). Pin dưới 2.9V: sạc nhỏ 130mA. Chỉ <b>1 cell</b>. Bảo vệ DW01A: ngắt ở 4.30V (sạc) / 2.50V (xả), quá dòng.',
      bay: '<b>Cắm pin ngược vào B+/B−</b>: hỏng module, có thể nóng cháy — đo cực đế pin bằng DCV trước. Dùng để sạc pack 2S: sai hoàn toàn (4.2V/cell). Tải nối vào B+/B− thay vì OUT: mất bảo vệ xả.', bai: ['16.1'] },

    { id: 'de-18650', nhom: 'pin', ten: 'Đế / hộp pin 18650 (1 ô, 2 ô nối tiếp)', tim: 'đế pin 18650', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="30" y="30" width="200" height="34" rx="3" fill="#1E2328"/><rect x="30" y="74" width="200" height="34" rx="3" fill="#1E2328"/>
        <rect x="42" y="36" width="170" height="22" rx="6" fill="#2E7D5B"/><rect x="48" y="80" width="170" height="22" rx="6" fill="#2E7D5B"/>
        ${chu(40, 50, '−', 'lk-trang')}${chu(222, 50, '+', 'lk-trang')}${chu(222, 94, '−', 'lk-trang')}${chu(40, 94, '+', 'lk-trang')}
        <path d="M230 40 C 250 40, 250 20, 262 20" stroke="#C8322B" stroke-width="3" fill="none"/><path d="M230 98 C 250 98, 250 122, 262 122" stroke="#23303D" stroke-width="3" fill="none"/>
        ${chu(130, 128, 'hộp 2 ô: 2 cell đặt ngược chiều nhau', 'lk-mo')}${chu(130, 142, '→ nối tiếp bên trong, dây ra = tổng áp', 'lk-mo')}`, 'Hộp pin 2 ô 18650: 2 cell nằm song song nhưng ngược chiều, dây đỏ đen ra một đầu'),
      kh: '',
      chan: ['Ký hiệu + / − dập trong đáy từng ô: lắp cell đúng chiều in. Dây đỏ = +, đen = − (đo DCV để chắc).', 'Hộp 2 ô nối tiếp: dây ra = tổng 2 cell (~7.4V). Có hộp có thêm dây giữa (điểm giữa 2 cell) → nối BM của BMS.'],
      gioi_han: 'Lò xo + tiếp điểm mỏng: dòng lớn (motor kẹt ~3A) làm nóng lò xo. Robot nhỏ 2 motor TT vẫn trong mức.',
      bay: 'Lắp ngược 1 cell trong hộp 2 ô: tổng chỉ còn ~0V, 2 cell xả vào nhau. Luôn đo DCV dây ra sau khi lắp.', bai: ['16.1', '16.2', '16.3', '17.1'] },

    { id: 'bms-2s', nhom: 'pin', ten: 'Mạch bảo vệ BMS 2S', tim: 'BMS 2S', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="50" y="40" width="160" height="56" rx="3" fill="#1F5AA8" ${vien}/><rect x="96" y="54" width="18" height="14" fill="#1E2226"/><rect x="124" y="54" width="18" height="14" fill="#1E2226"/><rect x="152" y="54" width="18" height="14" fill="#1E2226"/>
        ${[[64, 'B−'], [96, 'BM'], [128, 'B+'], [164, 'P−'], [196, 'P+']].map(([x, t]) => `<rect x="${x - 7}" y="84" width="14" height="8" fill="#C9A640"/>${chu(x, 112, t, 'lk-chu')}`).join('')}
        ${g(128, 54, 128, 22, 'IC bảo vệ + MOSFET', 'middle')}${chu(96, 130, 'B = phía pin', 'lk-mo')}${chu(180, 130, 'P = phía tải/sạc', 'lk-mo')}`, 'Mạch BMS 2S: mạch in dài, 5 miếng hàn B- BM B+ P- P+'),
      kh: '',
      chan: ['<b>B−</b> = cực − cell dưới, <b>BM</b> = điểm giữa 2 cell, <b>B+</b> = cực + cell trên. <b>P−/P+</b> = đầu ra cho tải (và vào sạc 2S). Tên in trên board có thể là B−/B1/B+ hoặc 0V/4.2V/8.4V.', 'B+ ↔ BM = áp cell trên, BM ↔ B− = áp cell dưới.'],
      gioi_han: 'Chỉ cho <b>2 cell nối tiếp</b>. Ngắt khi 1 cell quá thấp/quá cao hoặc quá dòng (ngưỡng tuỳ board — đọc trang shop). Board rẻ thường <b>không cân bằng</b> 2 cell.',
      bay: 'Hàn/kẹp sai thứ tự B−, BM, B+: nối tắt 1 cell qua board. Nối dây BM trước khi đo: luôn đo từng điểm bằng DCV rồi mới nối. Đầu ra P đọc 0V trong khi cell còn áp = bảo vệ đang ngắt.', bai: ['16.2', '16.3', '17.1'] },

    { id: 'lm2596', nhom: 'pin', ten: 'Module hạ áp LM2596 (chỉnh được)', tim: 'LM2596', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="40" y="36" width="190" height="72" rx="3" fill="#1F5AA8" ${vien}/><rect x="60" y="48" width="40" height="36" rx="4" fill="#1E2226"/>
        <circle cx="130" cy="66" r="15" fill="#2A3038"/><rect x="166" y="46" width="20" height="30" fill="#2F6FD6" stroke="#fff"/><circle cx="176" cy="54" r="4" fill="#C9A640"/>
        ${[[48, 'IN+'], [48, 'IN−']].map(([x, t], i) => `<circle cx="${x}" cy="${50 + i * 44}" r="4" fill="#C9A640"/>${chu(x - 10, 54 + i * 44, t, 'lk-chu', 'end')}`).join('')}
        ${[['OUT+'], ['OUT−']].map(([t], i) => `<circle cx="222" cy="${50 + i * 44}" r="4" fill="#C9A640"/>${chu(234, 54 + i * 44, t, 'lk-chu', 'start')}`).join('')}
        ${g(80, 84, 80, 124, 'LM2596', 'middle')}${g(130, 81, 130, 140, 'cuộn cảm', 'middle')}${g(176, 54, 196, 20, 'vít chỉnh áp ra')}`, 'Module LM2596 xanh: IC, cuộn cảm tròn đen, biến trở xanh có vít, 4 miếng hàn IN+ IN- OUT+ OUT-'),
      kh: '',
      chan: ['IN+ / IN− ← pin; OUT+ / OUT− → tải. In trên board, không đảo được — đảo IN là hỏng module.', 'Vít đồng trên biến trở xanh chỉnh áp ra; vặn nhiều vòng mới đổi rõ.'],
      gioi_han: 'Vào 4.5–40V, ra tới 3A. Hạ áp kiểu <b>xung</b> (bật/tắt 150kHz + cuộn cảm) nên ít nóng hơn AMS1117. Cần áp vào cao hơn áp ra ≳ 1.5V: ra 5V cần vào ≳ 6.5V.',
      bay: '<b>Module mới mua có thể đang chỉnh ra bất kỳ áp nào</b> (thường gần bằng áp vào): chỉnh ra 5.0V khi <b>chưa nối tải</b>, đo lại rồi mới nối board. Cấp board qua chân 5V trong khi vẫn cắm USB: 2 nguồn đấu nhau (Espressif: các cách cấp nguồn loại trừ nhau).', bai: ['16.3', '17.1'] },

    { id: 'khung-2wd', nhom: 'robot', ten: 'Khung robot 2WD', tim: 'khung 2WD', mua: 'đợt 4 · can-mua.md',
      anh: anh(`<rect x="60" y="30" width="140" height="90" rx="14" fill="none" stroke="#C9A640" stroke-width="3"/>
        <rect x="40" y="54" width="18" height="44" rx="4" fill="#2A3038"/><rect x="202" y="54" width="18" height="44" rx="4" fill="#2A3038"/>
        <circle cx="130" cy="112" r="8" fill="#B8BEC4"/><rect x="104" y="46" width="52" height="30" rx="3" fill="#1E2328"/>
        ${g(49, 54, 30, 24, 'bánh trái + motor', 'end')}${g(211, 54, 232, 24, 'bánh phải + motor')}${g(130, 120, 130, 146, 'bánh mắt trâu (tự xoay)', 'middle')}${g(130, 46, 130, 16, 'đế pin / board', 'middle')}`, 'Khung robot 2 bánh nhìn từ trên: 2 bánh hai bên, bánh mắt trâu phía sau, chỗ đặt pin và board ở giữa'),
      kh: '',
      chan: ['2 motor TT (mỗi bánh 1 motor) + 1 bánh mắt trâu. Robot rẽ bằng cách cho 2 bánh quay khác tốc độ; quay tại chỗ = 2 bánh ngược chiều.'],
      gioi_han: 'Khung mica/nhôm mỏng: không chịu va mạnh. Bộ thường kèm 2 đĩa encoder 20 lỗ.',
      bay: 'Chạy thử lần đầu khi bánh đang chạm bàn: robot lao xuống đất. Luôn kê khung cho bánh quay trên không trước.', bai: ['17.1'] },

    // ——— Nên có thêm: đồ nghề cho bàn làm việc (chưa bài nào bắt buộc) ———
    { id: 'que-kep-moc', nhom: 'nen', ten: 'Que đo đầu kẹp móc (test hook)', tim: 'kẹp móc', mua: 'nên có',
      anh: anh(`<rect x="20" y="60" width="70" height="22" rx="10" fill="#D8322A"/><rect x="90" y="66" width="44" height="10" rx="3" fill="#E9EDF0" ${vien}/>
        <path d="M134 71 H156 q10 0 10 -10 v-6" fill="none" stroke="#B8BEC4" stroke-width="3" stroke-linecap="round"/>
        <line x1="166" y1="30" x2="166" y2="96" class="lk-chan"/>
        <path d="M-10 71 H20" stroke="#D8322A" stroke-width="3"/>
        ${g(160, 58, 196, 30, 'móc thép kéo ra, ôm chân')}${g(55, 60, 55, 30, 'bấm đuôi để thò móc', 'middle')}${g(166, 90, 196, 110, 'chân linh kiện')}
        ${chu(130, 140, 'rảnh 2 tay · không trượt que chạm chân bên cạnh', 'lk-mo')}`, 'Đầu kẹp móc: thân nhựa đỏ, bấm đuôi thì móc thép thò ra ôm lấy chân linh kiện'),
      kh: '',
      chan: ['Bấm đuôi → móc thép thò ra, móc vào chân linh kiện hoặc chân IC rồi thả tay. Loại "mini grabber" móc được cả chân IC DIP.', 'Mua loại có đầu cắm chuối 4mm cắm thẳng vào đồng hồ, hoặc dây 2 đầu (1 đầu móc, 1 đầu cá sấu kẹp vào que đo).'],
      gioi_han: 'Dây mảnh: chỉ để đo, không cho dòng tải qua.',
      bay: 'Móc 2 chân IC sát nhau: móc chạm cả 2 chân là nối tắt. Móc xong nhìn kỹ trước khi cấp điện.', bai: [] },

    { id: 'tham-silicon', nhom: 'nen', ten: 'Thảm silicon cách điện chịu nhiệt', tim: 'thảm silicon', mua: 'nên có',
      anh: anh(`<rect x="10" y="16" width="240" height="124" rx="8" fill="#2E6A8E"/>
        ${[0, 1, 2, 3].map(i => `<rect x="${22 + i * 26}" y="28" width="20" height="20" rx="4" fill="#23546F"/>`).join('')}
        <rect x="130" y="28" width="108" height="46" rx="4" fill="#23546F"/>
        ${Array.from({ length: 8 }, (_, i) => `<line x1="${24 + i * 14}" y1="62" x2="${24 + i * 14}" y2="126" stroke="#3E7EA3"/>`).join('')}
        <rect x="140" y="92" width="80" height="34" rx="3" fill="#1F5AA8" ${vien}/>
        ${g(40, 38, 40, 8, 'ngăn giữ ốc, chân cắt', 'middle')}${g(180, 92, 244, 150, 'bo mạch đặt lên: đáy không chạm kim loại', 'end')}
        ${chu(184, 56, 'chịu ~500°C', 'lk-trang')}`, 'Thảm silicon xanh có các ngăn nhỏ đựng ốc và vùng phẳng đặt bo mạch'),
      kh: '',
      chan: ['Lót mặt bàn khi hàn và khi ráp: silicon không dẫn điện, chịu nhiệt (loại thường ghi ~500°C), thiếc rơi xuống cạy ra được.', 'Ngăn nhỏ giữ ốc, đoạn chân cắt, linh kiện đang dùng — đỡ rơi xuống sàn, đỡ lọt vào gầm mạch đang có điện.'],
      gioi_han: 'Chịu nhiệt chứ không phải đế mỏ hàn: mỏ hàn vẫn phải gác lên đế.',
      bay: 'Silicon cách điện nhưng thường <b>không</b> chống tĩnh điện (không phải thảm ESD). Bo đặt trên bàn kim loại / giấy bạc thì các chân đáy bị nối tắt — thảm giải quyết đúng chuyện này.', bai: [] },

    { id: 'kim-mo-nhon', nhom: 'nen', ten: 'Kìm mỏ nhọn mini', tim: 'kìm mỏ nhọn', mua: 'nên có',
      anh: anh(`<path d="M150 71 C 110 58, 70 48, 24 46" fill="none" stroke="#2F6FD6" stroke-width="11" stroke-linecap="round"/>
        <path d="M150 79 C 110 92, 70 102, 24 104" fill="none" stroke="#2F6FD6" stroke-width="11" stroke-linecap="round"/>
        <polygon points="146,66 238,73 238,77 146,84" fill="#8A949E" ${vien}/><line x1="160" y1="75" x2="238" y2="75" stroke="#3B4652"/>
        <circle cx="150" cy="75" r="5" fill="#6E767E"/>
        ${g(214, 74, 214, 40, 'mỏ dài, có khía', 'middle')}${chu(130, 136, 'uốn chân · giữ chân lúc hàn (hút bớt nhiệt)', 'lk-mo')}`, 'Kìm mỏ nhọn tay cầm xanh, mỏ dài thon'),
      kh: '',
      chan: ['Uốn chân điện trở/diode vuông góc cho khít lỗ breadboard, kéo dây ra khỏi lỗ, giữ đai ốc nhỏ.', 'Kẹp chân linh kiện giữa mối hàn và thân khi hàn: kìm hút bớt nhiệt, thân linh kiện đỡ nóng.'],
      gioi_han: 'Mỏ nhọn mảnh: không vặn bu lông, không bẻ dây to — mỏ toè ra là hết kẹp được chân nhỏ.',
      bay: 'Uốn chân sát thân linh kiện (nhất là diode thuỷ tinh, LED): nứt thân. Uốn cách thân ≥ 2mm.', bai: [] },

    { id: 'kinh-bao-ho', nhom: 'nen', ten: 'Kính bảo hộ', tim: 'kính bảo hộ', mua: 'nên có',
      anh: anh(`<path d="M30 60 Q30 40 60 40 H200 Q230 40 230 60 V84 Q230 104 200 104 H150 Q140 88 130 88 Q120 88 110 104 H60 Q30 104 30 84 Z" fill="rgba(160,200,240,.35)" stroke="#3B4652" stroke-width="3"/>
        <path d="M30 56 L6 50 M230 56 L254 50" stroke="#3B4652" stroke-width="4" stroke-linecap="round"/>
        ${g(80, 72, 60, 128, 'che cả 2 bên', 'end')}${chu(130, 20, 'chân linh kiện văng · thiếc bắn · tụ nổ', 'lk-canh')}`, 'Kính bảo hộ trong suốt có che hai bên'),
      kh: '',
      chan: ['Đeo khi cắt chân linh kiện, khi hàn, và khi thử mạch có tụ hoá hay pin lithium lần đầu.'],
      gioi_han: 'Kính cận/kính mát không thay được: không che hai bên, mắt kính mỏng.',
      bay: 'Đoạn chân vừa cắt văng ra nhanh hơn phản xạ nhắm mắt. Tụ hoá cắm ngược có thể nổ, bắn giấy + dung dịch.', bai: [] },

    { id: 'hut-khoi', nhom: 'nen', ten: 'Quạt hút khói hàn', tim: 'hút khói', mua: 'nên có',
      anh: anh(`<rect x="80" y="30" width="100" height="100" rx="8" fill="#2A3038" ${vien}/>
        <circle cx="130" cy="80" r="38" fill="#1E2328"/>
        ${[0, 60, 120, 180, 240, 300].map(a => `<path d="M130 80 L${130 + 34 * Math.cos(a * Math.PI / 180)} ${80 + 34 * Math.sin(a * Math.PI / 180)}" stroke="#46525E" stroke-width="8" stroke-linecap="round"/>`).join('')}
        <path d="M20 70 q10 -10 20 0 t20 0 M20 90 q10 -10 20 0 t20 0" fill="none" stroke="#9AA3AD" stroke-width="2"/>
        ${g(130, 30, 180, 16, 'lọc than hoạt tính')}${g(40, 70, 20, 40, 'khói nhựa thông', 'end')}
        ${chu(130, 146, 'đặt cách mối hàn ~15–20cm', 'lk-mo')}`, 'Quạt hút khói hàn vuông, cánh quạt phía sau có tấm lọc'),
      kh: '',
      chan: ['Đặt cạnh chỗ hàn, hút khói bay ngang ra khỏi mặt. Không có quạt thì ít nhất mở cửa sổ + quạt thổi ra ngoài.'],
      gioi_han: '',
      bay: 'Khói bốc lên khi hàn là <b>nhựa thông (flux)</b> cháy — hít lâu kích ứng mũi họng, có thể gây hen. Chì ở 350°C gần như không bay hơi; nguy cơ chì là qua tay → miệng, nên rửa tay (xem thiếc hàn).', bai: [] },

    { id: 'bom-hut', nhom: 'nen', ten: 'Bơm hút thiếc (ống hút lò xo)', tim: 'bơm hút thiếc', mua: 'nên có',
      anh: anh(`<rect x="40" y="62" width="160" height="24" rx="6" fill="#B8BEC4" ${vien}/><rect x="200" y="68" width="30" height="12" fill="#E9EDF0" ${vien}/>
        <polygon points="230,68 250,72 250,76 230,80" fill="#E9EDF0" ${vien}/><rect x="10" y="68" width="30" height="12" fill="#2F6FD6"/>
        <circle cx="150" cy="58" r="7" fill="#2F6FD6"/>
        ${g(20, 68, 20, 36, 'ấn pít-tông nạp lò xo', 'middle')}${g(150, 52, 150, 24, 'nút nhả', 'middle')}${g(248, 76, 248, 110, 'đầu teflon', 'middle')}
        ${chu(130, 136, 'nung chảy mối → áp đầu teflon → bấm nút', 'lk-mo')}`, 'Bơm hút thiếc: ống nhôm, pít-tông xanh một đầu, đầu teflon trắng đầu kia, nút nhả trên thân'),
      kh: '',
      chan: ['Ấn pít-tông tới khi chốt; nung chảy mối hàn; áp đầu teflon sát mối, bấm nút → lò xo bật, hút thiếc lỏng vào ống.', 'Gỡ chân header / linh kiện nhiều chân nhanh hơn bấc. Mối còn sót thì dùng bấc.'],
      gioi_han: 'Đầu teflon mòn dần vì nhiệt: loại có đầu thay được.',
      bay: 'Lò xo bật giật tay: giữ bơm vuông góc, đừng chọc đầu bơm vào mũi hàn. Thiếc trong ống đổ ra khi mở — đổ vào hộp, không đổ xuống sàn.', bai: [] },

    { id: 'de-kep-bo', nhom: 'nen', ten: 'Đế kẹp bo mạch (PCB holder)', tim: 'đế kẹp bo', mua: 'nên có',
      anh: anh(`<rect x="30" y="118" width="200" height="16" rx="3" fill="#3B4652"/>
        <rect x="40" y="56" width="16" height="62" fill="#6E767E"/><rect x="204" y="56" width="16" height="62" fill="#6E767E"/>
        <rect x="56" y="64" width="148" height="10" fill="#8A949E"/>
        <rect x="60" y="44" width="140" height="20" fill="#1F5AA8" ${vien}/>
        ${[76, 92, 108, 124, 140, 156, 172, 188].map(x => `<circle cx="${x}" cy="54" r="2.4" fill="#C9A640"/>`).join('')}
        ${g(48, 60, 20, 30, 'hàm kẹp 2 cạnh bo', 'end')}${g(130, 44, 180, 20, 'bo nằm phẳng, lật được')}${g(212, 126, 244, 146, 'đế nặng')}`, 'Đế kẹp bo mạch: hai trụ kẹp hai cạnh của bo, bo nằm ngang, có thể lật'),
      kh: '',
      chan: ['Kẹp 2 cạnh bo cho nằm phẳng; lật mặt dưới lên để hàn, không phải giữ bằng tay.', '"Bàn tay thứ ba" kẹp được dây/module nhỏ; đế kẹp giữ bo to vững hơn và không trượt khi ấn mỏ hàn.'],
      gioi_han: '',
      bay: 'Kẹp quá chặt bo mỏng (module) → cong bo, nứt mối hàn SMD bên dưới.', bai: [] },

    { id: 'co-nhiet', nhom: 'nen', ten: 'Ống co nhiệt + băng keo điện', tim: 'ống co nhiệt', mua: 'nên có',
      anh: anh(`<line x1="10" y1="60" x2="250" y2="60" stroke="#D8322A" stroke-width="5"/>
        <rect x="100" y="52" width="60" height="16" rx="3" fill="#23303D"/>
        ${g(130, 52, 130, 24, 'co nhiệt ~2:1 bọc kín mối hàn', 'middle')}
        <circle cx="210" cy="112" r="24" fill="#23303D"/><circle cx="210" cy="112" r="10" style="fill:var(--panel)"/>
        <path d="M230 124 L250 136" stroke="#23303D" stroke-width="8"/>
        ${g(186, 112, 150, 112, 'băng keo điện PVC', 'end')}${chu(40, 100, 'xỏ ống vào dây', 'lk-canh', 'start')}${chu(40, 114, 'TRƯỚC khi hàn', 'lk-canh', 'start')}`, 'Một đoạn ống co nhiệt đen bọc mối nối dây đỏ, bên cạnh cuộn băng keo điện'),
      kh: '',
      chan: ['Ống co nhiệt: chọn cỡ lớn hơn mối nối một chút, xỏ vào dây trước khi hàn, hàn xong kéo ống trùm mối, hơ nóng cho co lại ôm chặt.', 'Hơ bằng máy khò nhiệt; không có thì dùng thân mỏ hàn lướt qua (không chạm mũi). Băng keo điện dùng tạm khi không có ống.'],
      gioi_han: 'Ống thường co ở ~90–120°C; hơ quá lâu thì cháy, chảy.',
      bay: 'Mối nối dây pin / dây motor để trần: rung chạm nhau là chập. Với pin lithium thì mọi mối trần đều phải bọc.', bai: [] },

    { id: 'hop-ngan', nhom: 'nen', ten: 'Hộp nhựa chia ngăn đựng linh kiện', tim: 'hộp chia ngăn', mua: 'nên có',
      anh: anh(`<rect x="20" y="24" width="220" height="110" rx="6" fill="rgba(160,200,240,.25)" stroke="#6E767E" stroke-width="2"/>
        ${[0, 1, 2, 3].map(c => [0, 1, 2].map(r => `<rect x="${28 + c * 53}" y="${32 + r * 33}" width="47" height="27" rx="3" fill="none" stroke="#8A949E"/>`).join('')).join('')}
        ${chu(51, 50, '220', 'lk-chu')}${chu(104, 50, '1k', 'lk-chu')}${chu(157, 50, '10k', 'lk-chu')}${chu(210, 50, '100k', 'lk-chu')}
        ${chu(51, 83, 'LED', 'lk-chu')}${chu(104, 83, '104', 'lk-chu')}${chu(157, 83, 'S8050', 'lk-chu')}${chu(210, 83, '4007', 'lk-chu')}
        ${chu(130, 148, 'dán nhãn giá trị từng ngăn', 'lk-mo')}`, 'Hộp nhựa trong chia 12 ngăn, mỗi ngăn dán nhãn giá trị linh kiện'),
      kh: '',
      chan: ['Mỗi ngăn một giá trị, dán nhãn. Điện trở cùng màu thân rất khó phân biệt lúc đã lẫn: đo Ω rồi mới bỏ vào ngăn.'],
      gioi_han: '',
      bay: 'Bỏ lẫn 1k với 10k (nâu·đen·đỏ và nâu·đen·cam trông gần giống dưới đèn vàng) → mạch chạy sai mà không biết vì sao.', bai: [] },

    { id: 'header', nhom: 'nen', ten: 'Hàng rào chân (pin header) 2.54mm', tim: 'header', mua: 'nên có · thường kèm module',
      anh: anh(`<rect x="20" y="40" width="160" height="12" fill="#1E2226"/>
        ${Array.from({ length: 8 }, (_, i) => `<rect x="${28 + i * 20}" y="18" width="4" height="22" fill="#C9A640"/><rect x="${28 + i * 20}" y="52" width="4" height="40" fill="#C9A640"/>`).join('')}
        <rect x="196" y="40" width="48" height="36" fill="#1E2226"/>${[0, 1].map(i => `<rect x="${206 + i * 20}" y="44" width="6" height="6" fill="#0B0F13"/><rect x="${207 + i * 20}" y="76" width="4" height="16" fill="#C9A640"/>`).join('')}
        ${g(30, 26, 8, 12, 'đầu ngắn → hàn vào module', 'start')}${g(30, 84, 8, 112, 'đầu dài → cắm breadboard', 'start')}${g(220, 44, 232, 20, 'cái')}
        ${chu(130, 140, 'bước 2.54mm · bẻ theo số chân cần', 'lk-mo')}`, 'Hàng rào chân đực 8 chân: đầu ngắn phía trên, đầu dài phía dưới; bên cạnh là header cái'),
      kh: '',
      chan: ['Header đực: đầu <b>ngắn</b> hàn vào lỗ module, đầu <b>dài</b> cắm xuống breadboard. Header cái: cắm module / dây đực vào.', 'Mẹo hàn thẳng: cắm header vào breadboard trước, đặt module lên, hàn 2 chân ở 2 đầu, kiểm thẳng rồi hàn nốt.'],
      gioi_han: 'Bước chân 2.54mm (0.1") — đúng bước lỗ breadboard. Dòng mỗi chân ~1–3A tuỳ hãng.',
      bay: 'Hàn ngược (đầu dài vào module): chân cắm breadboard quá ngắn, lỏng. Hàn lâu 1 chân → nhựa chảy, chân lệch. Hàn xong đo 2 chân cạnh nhau: kêu bíp là dính cầu thiếc.', bai: [] },

    { id: 'bo-duc-lo', nhom: 'nen', ten: 'Bo đục lỗ (perfboard) 2.54mm', tim: 'bo đục lỗ', mua: 'nên có',
      anh: anh(`<rect x="30" y="20" width="200" height="110" rx="3" fill="#2E7D5B" ${vien}/>
        <g>${Array.from({ length: 12 }, (_, i) => Array.from({ length: 6 }, (_, j) => `<circle cx="${46 + i * 16}" cy="${36 + j * 16}" r="4.2" fill="#C9A640"/><circle cx="${46 + i * 16}" cy="${36 + j * 16}" r="1.6" fill="#0B0F13"/>`).join('')).join('')}</g>
        ${g(46, 36, 20, 10, 'mỗi lỗ 1 pad riêng', 'end')}${chu(130, 146, 'khác breadboard: các lỗ KHÔNG thông nhau', 'lk-canh')}`, 'Bo đục lỗ xanh, lưới lỗ có pad đồng tròn riêng rẽ'),
      kh: '',
      chan: ['Mạch đã chạy trên breadboard → chuyển lên bo đục lỗ để hàn cố định (lắp lên robot, không tuột dây).', 'Mỗi lỗ có pad đồng riêng, không lỗ nào thông lỗ nào: tự nối bằng chân linh kiện uốn hoặc dây. Loại "stripboard" thì pad nối theo dải — đọc kỹ lúc mua.'],
      gioi_han: 'Loại sợi thuỷ tinh FR4 (xanh, 2 mặt) chịu nhiệt tốt; loại giấy phíp (nâu) rẻ, dễ bong pad khi hàn lâu.',
      bay: 'Kéo cầu thiếc giữa 2 pad cạnh nhau để nối rồi quên chỗ không được nối: đo thông mạch mọi cặp pad kề nhau trước khi cấp điện.', bai: [] },

    { id: 'day-cai-cai', nhom: 'nen', ten: 'Dây nhảy cái–cái', tim: 'cái–cái', mua: 'nên có',
      anh: anh(`<path d="M40 98 C 80 20, 180 20, 220 98" fill="none" stroke="#2FA84F" stroke-width="5" stroke-linecap="round"/>
        <rect x="32" y="96" width="16" height="30" rx="2" fill="#1E2226"/><rect x="212" y="96" width="16" height="30" rx="2" fill="#1E2226"/>
        <rect x="37" y="120" width="6" height="6" fill="#0B0F13"/><rect x="217" y="120" width="6" height="6" fill="#0B0F13"/>
        ${g(220, 124, 190, 140, 'lỗ cái: cắm vào chân đực', 'end')}${chu(130, 18, 'module ↔ module, không qua breadboard', 'lk-mo')}`, 'Dây nhảy cái cái màu xanh lá, hai đầu có lỗ'),
      kh: '',
      chan: ['Hai đầu là lỗ: nối thẳng chân đực của module này sang chân đực của module/board kia.'],
      gioi_han: 'Như dây đực–đực: vài trăm mA.',
      bay: 'Lỗ cái bị giãn sau nhiều lần cắm → tiếp xúc chập chờn. Lắc nhẹ dây khi đo: số nhảy là dây hỏng.', bai: [] },

    // ——— Nên có thêm: linh kiện hay gặp trong mạch nhúng / robot ———
    { id: 's8550', nhom: 'nen', ten: 'Transistor S8550 PNP', tim: 'S8550', mua: 'nên có · cặp với S8050',
      anh: anh(`<path d="M102 96 V42 Q102 26 130 26 Q158 26 158 42 V96 Z" fill="#1E2226" ${vien}/>
        ${chu(130, 58, 'S8550', 'lk-trang')}${chu(130, 72, 'mặt phẳng', 'lk-trang-mo')}
        ${chan(114, 96, 132)}${chan(130, 96, 132)}${chan(146, 96, 132)}
        ${chu(114, 144, '?', 'lk-canh')}${chu(130, 144, '?', 'lk-canh')}${chu(146, 144, '?', 'lk-canh')}
        ${g(158, 60, 186, 50, 'vỏ giống hệt S8050')}${g(114, 120, 84, 120, 'chân: dò', 'end')}
        ${chu(8, 16, 'PNP: chiều diode ngược với NPN', 'lk-canh', 'start')}`, 'Transistor S8550 vỏ TO-92 đen giống S8050, 3 chân chưa biết thứ tự'),
      kh: kh('<circle cx="64" cy="28" r="22" class="lk-net"/>' + net('8,28 56,28') + net('56,14 56,42') + net('56,22 76,10 76,2') + net('56,34 76,46 76,54')
        + '<polygon points="58,33 68,34 63,40" class="lk-dac"/>' + chu(14, 20, 'B', 'lk-mo') + chu(88, 13, 'E', 'lk-mo') + chu(88, 50, 'C', 'lk-mo'), 'transistor PNP'),
      chan: ['Dò bằng thang diode như S8050 nhưng <b>đảo que</b>: que <b>đen</b> ở chân B thì B dẫn sang cả E lẫn C (~0.7V). Đó là cách phân biệt PNP với NPN khi chữ in mờ.', 'Mắc "phía trên" tải: E nối +, C → tải → GND. Kéo B <b>xuống</b> (qua điện trở) thì dẫn.'],
      gioi_han: 'Ic ≤ ~0.5A, Vce ≤ 25V (tuỳ datasheet lô). Luôn có điện trở ở chân B.',
      bay: 'Tải cấp 5V, E ở 5V mà chân B nối GPIO 3.3V: GPIO lên mức 1 (3.3V) vẫn thấp hơn E 1.7V → transistor <b>không tắt</b>. PNP phía trên chỉ tắt được khi B kéo lên tới áp của E.', bai: [] },

    { id: 'irlz44n', nhom: 'nen', ten: 'MOSFET kênh N IRLZ44N (logic-level)', tim: 'IRLZ44N', mua: 'nên có · thay S8050 cho tải > 0.5A',
      anh: anh(`<rect x="100" y="14" width="60" height="24" fill="#B8BEC4" ${vien}/><circle cx="130" cy="26" r="7" style="fill:var(--panel)" ${vien}/>
        <rect x="98" y="38" width="64" height="54" rx="2" fill="#1E2226"/>${chu(130, 62, 'IRLZ44N', 'lk-trang')}
        ${chan(112, 92, 136)}${chan(130, 92, 136)}${chan(148, 92, 136)}
        ${chu(112, 148, 'G', 'lk-chu')}${chu(130, 148, 'D', 'lk-chu')}${chu(148, 148, 'S', 'lk-chu')}
        ${g(160, 22, 190, 14, 'tai tản nhiệt = D')}${g(112, 118, 80, 118, 'nhìn mặt chữ', 'end')}
        ${chu(8, 108, 'vỏ TO-220', 'lk-mo', 'start')}`, 'MOSFET IRLZ44N vỏ TO-220: thân đen có chữ, tai kim loại có lỗ, 3 chân G D S'),
      kh: kh(net('8,40 40,40') + net('40,16 40,40') + net('46,12 46,20') + net('46,24 46,32') + net('46,36 46,44') + net('46,16 80,16 80,4') + net('46,40 80,40 80,54') + net('46,28 80,28 80,40')
        + '<polygon points="48,28 56,24 56,32" class="lk-dac"/>' + chu(14, 34, 'G', 'lk-mo') + chu(92, 12, 'D', 'lk-mo') + chu(92, 52, 'S', 'lk-mo'), 'MOSFET kênh N'),
      chan: ['Nhìn mặt có chữ, chân chúc xuống: <b>G · D · S</b> (theo datasheet Infineon/IR). Tai kim loại nối với D.', 'Mắc "phía dưới" tải như S8050: S → GND, D → tải → +. G ← GPIO qua ~100–220Ω, thêm 10k từ G xuống S.', 'Khác transistor: G gần như không ăn dòng — điều khiển bằng <b>áp</b>, không bằng dòng.'],
      gioi_han: 'Vds ≤ 55V, Vgs ≤ ±16V. Datasheet bảo đảm Rds(on) ≤ 0.035Ω ở Vgs = 4V. Ở 3.3V (GPIO ESP32) <b>không</b> được bảo đảm: motor nhỏ (&lt; 1A) thường ổn — đo áp D–S khi chạy, phải ≲ 0.1V.',
      bay: 'Chân G thả nổi (chưa nối GPIO, ESP32 đang reset): MOSFET tự bật nửa chừng, nóng — vì thế có 10k kéo G xuống S. Tĩnh điện từ tay có thể thủng lớp G. Motor vẫn cần diode 1N4007 ngược song song (diode trong thân MOSFET không thay được).', bai: [] },

    { id: 'zener', nhom: 'nen', ten: 'Diode zener 3.3V (1N4728A)', tim: 'zener', mua: 'nên có',
      anh: anh(`<line x1="18" y1="70" x2="242" y2="70" class="lk-chan"/>
        <rect x="96" y="58" width="68" height="24" rx="4" fill="#1E2226" ${vien}/>
        <rect x="146" y="58" width="8" height="24" fill="#C8CDD2"/>${chu(122, 74, '4728', 'lk-trang')}
        ${g(150, 58, 168, 34, 'vạch = K (−)')}${g(30, 70, 30, 100, 'A', 'middle')}${g(230, 70, 230, 100, 'K', 'middle')}
        ${chu(130, 124, 'dùng NGƯỢC: K về phía +, luôn có R nối tiếp', 'lk-canh')}${chu(130, 140, 'bản 0.5W: thân thuỷ tinh cam như 1N4148', 'lk-mo')}`, 'Diode zener 1N4728A thân đen vạch bạc, giống 1N4007'),
      kh: kh(net('8,28 44,28') + '<polygon points="44,14 44,42 68,28" class="lk-net"/>' + net('62,10 68,14 68,42 74,46') + net('68,28 112,28') + chu(12, 18, 'A', 'lk-mo') + chu(106, 18, 'K', 'lk-mo'), 'diode zener'),
      chan: ['Vạch = cathode (K). Mắc <b>ngược</b>: K về phía +, A về phía −, nối tiếp một điện trở. Áp trên nó giữ ≈ 3.3V khi dòng đủ.', 'Mắc thuận thì nó chỉ là diode thường (~0.7V).'],
      gioi_han: '1N4728A: 3.3V, 1W, dòng thử 76mA. Dòng quá nhỏ (vài mA) thì áp chỉ ~2.5–3V: zener áp thấp có "gối" mềm.',
      bay: 'Không có điện trở nối tiếp = nối tắt nguồn qua zener → nóng, cháy. Dùng làm "ổn áp" cấp cho ESP32: không đủ dòng, phí điện — việc đó của AMS1117. Zener hợp để kẹp bảo vệ chân tín hiệu.', bai: [] },

    { id: '1n5819', nhom: 'nen', ten: 'Diode Schottky 1N5819', tim: '1N5819', mua: 'nên có',
      anh: anh(`<line x1="18" y1="70" x2="242" y2="70" class="lk-chan"/>
        <rect x="96" y="58" width="68" height="24" rx="4" fill="#1E2226" ${vien}/>
        <rect x="146" y="58" width="8" height="24" fill="#C8CDD2"/>${chu(122, 74, '5819', 'lk-trang')}
        ${g(150, 58, 168, 34, 'vạch = K (−)')}${g(30, 70, 30, 100, 'A', 'middle')}${g(230, 70, 230, 100, 'K', 'middle')}
        ${chu(130, 132, 'sụt ~0.3–0.45V (1N4007 ~0.7V)', 'lk-mo')}`, 'Diode Schottky 1N5819 thân đen vạch bạc'),
      kh: kh(net('8,28 44,28') + '<polygon points="44,14 44,42 68,28" class="lk-net"/>' + net('74,10 74,14 68,14 68,42 62,42 62,46') + net('68,28 112,28') + chu(12, 18, 'A', 'lk-mo') + chu(106, 18, 'K', 'lk-mo'), 'diode Schottky'),
      chan: ['Vạch = cathode (K), giống 1N4007. Đo thang diode ra thấp hơn rõ: ~0.2–0.35V.'],
      gioi_han: '1A, áp ngược 40V. Sụt ≤ 0.6V ở 1A (datasheet), dòng nhỏ chỉ ~0.3V.',
      bay: 'Làm lại bài 4.2 bằng 1N5819 là mất ít áp hơn — nhưng dòng rò ngược lớn hơn diode thường (cỡ vài chục–trăm µA khi nóng), không hợp mạch đo µA.', bai: [] },

    { id: 'led-rgb', nhom: 'nen', ten: 'LED RGB 5mm 4 chân', tim: 'LED RGB', mua: 'nên có',
      anh: anh(`<path d="M100 78 V46 A26 22 0 0 1 152 46 V78 Z" fill="#E9EDF0" fill-opacity=".85" ${vien}/>
        <path d="M94 78 H152 V86 H94 Z" fill="#E9EDF0" ${vien}/>
        ${chan(104, 86, 128)}${chan(118, 86, 146)}${chan(132, 86, 134)}${chan(146, 86, 130)}
        ${chu(104, 140, 'R', 'lk-xau')}${chu(132, 146, 'G', 'lk-chu')}${chu(146, 142, 'B', 'lk-chu')}
        ${g(118, 140, 70, 118, 'dài nhất = chân chung', 'end')}${g(150, 60, 184, 44, '3 LED trong 1 vỏ')}
        ${chu(130, 18, 'chung − (cathode) hay chung + (anode): đo mới biết', 'lk-canh')}`, 'LED RGB 5mm vỏ trắng đục, 4 chân, chân thứ hai dài nhất là chân chung'),
      kh: '',
      chan: ['Chân dài nhất là chân chung. Loại <b>chung cathode</b>: chân chung → GND; loại <b>chung anode</b>: chân chung → +.', 'Đo thang diode: que đen ở chân dài, que đỏ lần lượt 3 chân kia, sáng mờ → chung cathode. Không sáng thì đảo que → chung anode. Thứ tự R·G·B thường theo hình, nhưng màu sáng lúc đo mới là chắc.'],
      gioi_han: 'Mỗi màu ≤ 20mA, <b>mỗi màu một điện trở riêng</b>. Đỏ ~2V, xanh lá/xanh dương ~3V → 3 điện trở khác giá trị nếu muốn sáng đều.',
      bay: 'Dùng chung 1 điện trở ở chân chung: màu đỏ (áp thấp nhất) giành hết dòng, 2 màu kia gần như tắt.', bai: [] },

    { id: 'coi-chip', nhom: 'nen', ten: 'Còi chip (buzzer) chủ động / thụ động', tim: 'buzzer', mua: 'nên có',
      anh: anh(`<rect x="50" y="40" width="64" height="44" rx="6" fill="#1E2226" ${vien}/><circle cx="82" cy="62" r="4" fill="#0B0F13"/>
        <rect x="56" y="40" width="52" height="8" fill="#E9EDF0"/>
        ${chan(72, 84, 128)}${chan(92, 84, 116)}
        ${chu(82, 26, 'chủ động', 'lk-chu')}${g(72, 122, 40, 122, 'dài = +', 'end')}${chu(82, 142, 'đáy kín · có tem', 'lk-mo')}
        <rect x="150" y="40" width="64" height="44" rx="6" fill="#1E2226" ${vien}/>
        <rect x="160" y="72" width="44" height="12" fill="#2E7D5B"/>
        ${chan(172, 84, 122)}${chan(192, 84, 122)}
        ${chu(182, 26, 'thụ động', 'lk-chu')}${chu(182, 142, 'đáy hở thấy mạch xanh', 'lk-mo')}`, 'Hai còi chip tròn đen: loại chủ động đáy kín, chân dài là cực dương; loại thụ động đáy hở thấy mạch xanh'),
      kh: kh(net('8,40 44,40 44,30') + net('76,30 76,40 112,40') + '<path d="M40 30 H80 A20 20 0 0 0 40 30 Z" class="lk-net"/>' + chu(34, 22, '+', 'lk-mo'), 'còi'),
      chan: ['<b>Chủ động</b> (active): có mạch dao động bên trong, cấp DC đúng cực là kêu một tiếng cố định. Chân dài = +.', '<b>Thụ động</b> (passive): chỉ là màng + cuộn dây, phải cấp xung (PWM 2–5kHz) mới kêu; đổi tần số = đổi nốt nhạc.', 'Phân biệt: cấp 3–5V DC thoáng qua — kêu liên tục là chủ động, chỉ "tách" 1 cái là thụ động.'],
      gioi_han: 'Dòng cỡ 20–40mA ở 5V — sát/quá giới hạn 1 chân GPIO → qua transistor S8050.',
      bay: 'Còi thụ động loại từ tính: cuộn dây chỉ vài chục Ω, cấp DC đứng yên là dòng lớn, cuộn nóng mà không kêu. Còi cũng là cuộn dây: thêm 1N4148 ngược song song khi đóng/ngắt bằng transistor.', bai: [] },

    { id: 'relay', nhom: 'nen', ten: 'Module relay 5V 1 kênh', tim: 'relay', mua: 'nên có',
      anh: anh(`<rect x="30" y="34" width="200" height="84" rx="3" fill="#1F5AA8" ${vien}/>
        <rect x="90" y="44" width="70" height="56" rx="3" fill="#2F6FD6" stroke="#fff"/>${chu(125, 72, 'SRD-05VDC', 'lk-trang')}${chu(125, 86, 'SL-C', 'lk-trang-mo')}
        <rect x="176" y="50" width="46" height="44" fill="#2FA84F"/>${[0, 1, 2].map(i => `<circle cx="199" cy="${58 + i * 14}" r="4" fill="#B8BEC4"/>`).join('')}
        ${chu(234, 62, 'NO', 'lk-chu', 'start')}${chu(234, 76, 'COM', 'lk-chu', 'start')}${chu(234, 90, 'NC', 'lk-chu', 'start')}
        ${[['VCC', 52], ['GND', 72], ['IN', 92]].map(([t, y]) => `<rect x="30" y="${y - 4}" width="10" height="8" fill="#C9A640"/>${chu(24, y + 4, t, 'lk-chu', 'end')}`).join('')}
        <circle cx="60" cy="104" r="4" fill="#E5372C"/>
        ${g(125, 44, 125, 18, 'cuộn dây + tiếp điểm cơ', 'middle')}${chu(130, 140, 'bài ở đây: chỉ đóng/ngắt mạch ≤ 12V — KHÔNG 220V', 'lk-xau')}`, 'Module relay 1 kênh: relay xanh, cọc vít NO COM NC, 3 chân VCC GND IN'),
      kh: kh(net('8,44 24,44') + '<rect x="24" y="36" width="24" height="16" class="lk-net"/>' + net('48,44 56,44') + net('70,22 96,10') + '<circle cx="70" cy="22" r="2.5" class="lk-dac"/><circle cx="100" cy="22" r="2.5" class="lk-dac"/>' + net('36,36 36,16 80,16'), 'relay'),
      chan: ['Phía điều khiển: VCC 5V, GND, IN. Phía tải: <b>COM</b> (chung), <b>NO</b> (thường hở — nối COM khi relay hút), <b>NC</b> (thường đóng).', 'Nhiều module kích mức <b>thấp</b>: IN = 0 thì relay hút (đèn sáng, nghe "tách"). Có module có jumper H/L — đọc chữ in trên board.'],
      gioi_han: 'Cuộn relay 5V ăn ~70mA — module đã có transistor + diode nên IN chỉ ăn vài mA. Tiếp điểm in "10A 250VAC" nhưng giáo trình này <b>không đụng 220V</b>.',
      bay: 'Module kích mức thấp cấp VCC 5V, IN nối GPIO 3.3V: mức 1 (3.3V) có khi vẫn không nhả relay — đo trước. Relay chậm (~10ms) và mòn tiếp điểm: không dùng để PWM motor, việc đó của driver/MOSFET.', bai: [] },

    { id: 'cong-tac-gat', nhom: 'nen', ten: 'Công tắc gạt SS12D00 (3 chân)', tim: 'công tắc gạt', mua: 'nên có',
      anh: anh(`<rect x="80" y="54" width="100" height="40" rx="2" fill="#B8BEC4" ${vien}/><rect x="90" y="62" width="80" height="24" fill="#1E2226"/>
        <rect x="100" y="36" width="20" height="34" rx="2" fill="#1E2226"/>
        ${chan(100, 94, 130)}${chan(130, 94, 130)}${chan(160, 94, 130)}
        ${chu(100, 142, '1', 'lk-mo')}${chu(130, 142, 'chung', 'lk-chu')}${chu(160, 142, '3', 'lk-mo')}
        ${g(110, 40, 80, 22, 'cần gạt', 'end')}${chu(200, 30, 'gạt trái: chung–1', 'lk-mo', 'start')}${chu(200, 44, 'gạt phải: chung–3', 'lk-mo', 'start')}`, 'Công tắc gạt SS12D00 vỏ kim loại, cần gạt đen, 3 chân, chân giữa là chân chung'),
      kh: kh(net('8,40 40,40') + '<circle cx="42" cy="40" r="2.5" class="lk-dac"/>' + net('42,40 78,24') + '<circle cx="80" cy="22" r="2.5" class="lk-dac"/><circle cx="80" cy="46" r="2.5" class="lk-dac"/>' + net('82,22 112,22') + net('82,46 112,46'), 'công tắc 1 cực 2 ngả'),
      chan: ['Chân giữa là chân chung; gạt về bên nào thì chân giữa nối chân bên đó. Đo thông mạch 2 vị trí để chắc.', 'Làm công tắc bật/tắt: chỉ dùng chân giữa + 1 chân bên.'],
      gioi_han: 'Chỉ 0.5A 50VDC. Chân vừa lỗ breadboard.',
      bay: 'Dùng làm công tắc nguồn chính cho robot 2 motor: motor khởi động kéo quá 0.5A → tiếp điểm nóng, cháy rỗ. Nguồn chính dùng công tắc bập bênh (rocker) ghi ≥ 3A.', bai: [] },

    { id: 'cau-chi', nhom: 'nen', ten: 'Cầu chì ống 5×20mm + đế nối dây', tim: 'cầu chì', mua: 'nên có · cho pin lithium',
      anh: anh(`<path d="M-10 70 H40" stroke="#D8322A" stroke-width="3"/><path d="M220 70 H270" stroke="#D8322A" stroke-width="3"/>
        <rect x="40" y="56" width="180" height="28" rx="12" fill="#1E2226"/>
        <rect x="90" y="62" width="80" height="16" rx="2" fill="rgba(160,200,240,.45)" stroke="#8A949E"/><rect x="82" y="62" width="10" height="16" fill="#B8BEC4"/><rect x="168" y="62" width="10" height="16" fill="#B8BEC4"/>
        <path d="M92 70 Q110 64 130 70 T168 70" fill="none" stroke="#C9A640" stroke-width="1.5"/>
        ${g(130, 67, 130, 30, 'dây chì: đứt khi quá dòng', 'middle')}${g(173, 78, 196, 110, 'nắp ghi dòng, vd F2A')}
        ${chu(130, 140, 'đặt ngay sau cực + của pin, trước mọi thứ', 'lk-canh')}`, 'Cầu chì ống thuỷ tinh 5x20mm nằm trong đế nối dây màu đen, dây đỏ hai đầu'),
      kh: kh(net('8,28 34,28') + '<rect x="34" y="20" width="52" height="16" class="lk-net"/>' + net('34,28 86,28') + net('86,28 112,28'), 'cầu chì'),
      chan: ['Không có cực. Mắc nối tiếp ngay sau cực + của pin. Đo thông mạch 2 đầu: kêu = còn tốt, không kêu = đã đứt.', 'Chữ trên nắp: <b>F</b> = đứt nhanh, <b>T</b> = đứt chậm; số = dòng định mức.'],
      gioi_han: 'Chọn định mức cỡ 1.5–2 lần dòng lớn nhất lúc chạy bình thường (đo trước, bài 1.2). Motor khởi động kéo dòng cao vài chục ms → loại T đỡ đứt oan.',
      bay: 'Thay cầu chì đứt bằng loại to hơn / sợi dây: mất bảo vệ, lần chập sau là dây và pin chịu. Cầu chì đứt nghĩa là có chỗ chập — tìm ra trước khi thay.', bai: [] },

    { id: 'ne555', nhom: 'nen', ten: 'IC định thời NE555 (DIP-8)', tim: 'NE555', mua: 'tuỳ chọn · đào sâu analog',
      anh: anh(`<rect x="80" y="40" width="100" height="60" rx="3" fill="#1E2226" ${vien}/>
        <path d="M80 62 a8 8 0 0 1 0 16" style="fill:var(--panel)"/><circle cx="94" cy="88" r="3.5" fill="#46525E"/>
        ${chu(134, 74, 'NE555', 'lk-trang')}
        ${[0, 1, 2, 3].map(i => `<rect x="${92 + i * 24}" y="100" width="6" height="16" fill="#B8BEC4"/>${chu(95 + i * 24, 128, String(i + 1), 'lk-chu')}<rect x="${92 + i * 24}" y="24" width="6" height="16" fill="#B8BEC4"/>${chu(95 + i * 24, 18, String(8 - i), 'lk-chu')}`).join('')}
        ${g(84, 70, 50, 70, 'khuyết', 'end')}${g(94, 88, 50, 104, 'chấm = chân 1', 'end')}
        ${chu(130, 146, '1 GND · 3 OUT · 4 RESET · 8 VCC', 'lk-mo')}`, 'IC NE555 vỏ DIP-8 nhìn từ trên: khuyết bên trái, chấm ở chân 1, đếm ngược chiều kim đồng hồ'),
      kh: '',
      chan: ['Nhìn từ trên, khuyết quay sang trái: chân 1 ở dưới-trái (cạnh chấm), đếm <b>ngược chiều kim đồng hồ</b> tới chân 8 ở trên-trái.', '1 GND · 2 TRIG · 3 OUT · 4 RESET · 5 CTRL · 6 THRES · 7 DISCH · 8 VCC. Chân 4 nối VCC nếu không dùng.', 'Cắm vắt qua rãnh giữa breadboard (4 chân mỗi bên).'],
      gioi_han: 'NE555: VCC 4.5–16V — hộp 3×AAA (4.5V) chỉ vừa sát, pin yếu là chập chờn. Bản CMOS (TLC555, 7555) chạy từ 2V. Chân OUT ~200mA.',
      bay: 'Cắm ngược IC (xoay 180°): VCC và GND đảo → IC nóng rất nhanh. Luôn tìm khuyết/chấm trước. Mạch nháy 555 là bản IC của mạch 6.3 — làm 6.3 trước để hiểu bên trong.', bai: [] },

    { id: 'lm358', nhom: 'nen', ten: 'Op-amp kép LM358 (DIP-8)', tim: 'LM358', mua: 'tuỳ chọn · đào sâu analog',
      anh: anh(`<rect x="80" y="40" width="100" height="60" rx="3" fill="#1E2226" ${vien}/>
        <path d="M80 62 a8 8 0 0 1 0 16" style="fill:var(--panel)"/><circle cx="94" cy="88" r="3.5" fill="#46525E"/>
        ${chu(134, 74, 'LM358', 'lk-trang')}
        ${[0, 1, 2, 3].map(i => `<rect x="${92 + i * 24}" y="100" width="6" height="16" fill="#B8BEC4"/>${chu(95 + i * 24, 128, String(i + 1), 'lk-chu')}<rect x="${92 + i * 24}" y="24" width="6" height="16" fill="#B8BEC4"/>${chu(95 + i * 24, 18, String(8 - i), 'lk-chu')}`).join('')}
        ${g(84, 70, 50, 70, 'khuyết', 'end')}${g(94, 88, 50, 104, 'chân 1', 'end')}
        ${chu(130, 146, '4 GND · 8 VCC · 2 op-amp A/B', 'lk-mo')}`, 'IC LM358 vỏ DIP-8, khuyết bên trái, chấm ở chân 1'),
      kh: kh('<polygon points="36,6 36,50 84,28" class="lk-net"/>' + net('8,16 36,16') + net('8,40 36,40') + net('84,28 112,28') + chu(44, 20, '−', 'lk-chu-kh') + chu(44, 44, '+', 'lk-chu-kh'), 'op-amp'),
      chan: ['Cách đếm chân như NE555. Op-amp A: 1 OUT · 2 IN− · 3 IN+. Op-amp B: 7 OUT · 6 IN− · 5 IN+. 4 = GND, 8 = VCC.', 'Dùng làm <b>bộ so sánh</b>: IN+ > IN− thì OUT lên cao, ngược lại xuống thấp — đúng việc con LM393 trên module FC-51/TCRT5000 đang làm.'],
      gioi_han: 'VCC 3–32V. Không "rail-to-rail": OUT lên cao nhất ≈ VCC − 1.5V, đầu vào chỉ đúng trong 0 → VCC − 1.5V. Cấp 3.3V thì OUT chỉ lên ~1.8V.',
      bay: 'Op-amp thứ 2 không dùng mà để chân thả nổi: dao động, nóng, gây nhiễu con kia. Nối IN+ của nó xuống GND, OUT về IN−.', bai: [] },
  ];

  const NHOM = {
    lk: 'Linh kiện', dc: 'Dụng cụ & nguồn', quat: 'Trong quạt dự phòng (để dành)',
    c7: 'Cần mua · chương 7 cuộn dây & motor', han: 'Cần mua · đồ nghề hàn & dụng cụ',
    esp: 'Phần 2 · ESP32 + xiaozhi', sau: 'Mua khi tới Phần 2 / robot',
    robot: 'Phần 3 · cảm biến + chuyển động robot', pin: 'Phần 3 · pin lithium + nguồn robot',
    nen: 'Nên có thêm · chưa bài nào bắt buộc',
  };
  // Nhóm hiển thị theo loại đồ (thư viện, trang Đồ, tìm nhanh). `nhom` ở trên là đợt mua, giữ cho nhãn "cần mua".
  const LOAI = [
    ['do', 'Dụng cụ đo & xem tín hiệu', ['dong-ho', 'que-kep-moc', 'kep-ca-sau', 'logic-analyzer', 'dso138']],
    ['rap', 'Ráp mạch: breadboard, dây, bo', ['breadboard', 'day-nhay', 'day-duc-cai', 'day-cai-cai', 'day-loi-don', 'header', 'bo-duc-lo', 'hop-ngan']],
    ['han', 'Đồ nghề hàn & bàn làm việc', ['mo-han', 'thiec', 'bac-hut', 'bom-hut', 'tham-silicon', 'tay-3', 'de-kep-bo', 'hut-khoi', 'kinh-bao-ho']],
    ['cam-tay', 'Dụng cụ cầm tay', ['nhip', 'kim-cat', 'kim-tuot', 'kim-mo-nhon', 'tua-vit', 'co-nhiet']],
    ['thu-dong', 'Điện trở, tụ, cuộn dây', ['dien-tro', 'bien-tro', 'quang-tro', 'tu-hoa', 'tu-gom', 'day-emay']],
    ['ban-dan', 'Diode, LED, transistor, MOSFET', ['led', 'led-rgb', '1n4148', '1n4007', '1n5819', 'zener', 's8050', 's8550', 'irlz44n']],
    ['ic', 'IC rời', ['ne555', 'lm358']],
    ['cong-tac', 'Nút, công tắc, relay, cầu chì', ['nut-nhan', 'cong-tac-gat', 'cong-tac-ht', 'relay', 'cau-chi']],
    ['cam-bien', 'Cảm biến', ['fc51', 'hc-sr04', 'tcrt5000', 'khe-quang', 'gy521']],
    ['mcu', 'Vi điều khiển, âm thanh, màn hình', ['esp32-s3', 'cap-usbc', 'inmp441', 'max98357a', 'loa', 'coi-chip', 'oled']],
    ['motor', 'Motor, driver, khung robot', ['motor-dc', 'motor-tt', 'sg90', 'driver-motor', 'drv8833', 'khung-2wd', 'nam-cham', 'dinh-kep']],
    ['nguon', 'Pin & nguồn', ['hop-pin', 'pin-li', 'cell-18650', 'de-18650', 'tp4056', 'bms-2s', 'lm2596', 'ams1117']],
  ];
  LOAI.forEach(([k, , ids]) => ids.forEach(id => { const l = LK.find(x => x.id === id); if (l) l.loai = k; else console.warn('LOAI: không có linh kiện', id); }));
  LK.filter(l => !l.loai).forEach(l => console.warn('LOAI: chưa xếp nhóm', l.id));
  // Từ khoá thêm cho tìm nhanh: tên tiếng Anh, cách gọi ngoài chợ. Tên + chuỗi `tim` + tên nhóm đã được tìm sẵn.
  const KHAC = {
    'dong-ho': 'multimeter VOM đồng hồ đo điện vạn năng', 'que-kep-moc': 'test hook grabber que đo kẹp', 'kep-ca-sau': 'alligator clip dây kẹp',
    'logic-analyzer': 'saleae bắt xung I2C', dso138: 'oscilloscope máy hiện sóng dao động ký', breadboard: 'test board bo cắm',
    'day-nhay': 'jumper wire dây cắm', 'day-duc-cai': 'jumper wire', 'day-cai-cai': 'jumper wire dupont', 'day-loi-don': 'solid wire dây điện',
    header: 'pin header rào đực cái', 'bo-duc-lo': 'perfboard protoboard stripboard pcb', 'hop-ngan': 'hộp đựng organizer',
    'mo-han': 'soldering iron trạm hàn', thiec: 'solder flux nhựa thông', 'bac-hut': 'desoldering wick braid', 'bom-hut': 'solder sucker desoldering pump',
    'tham-silicon': 'silicone mat thảm hàn lót bàn cách điện', 'tay-3': 'helping hands kính lúp kẹp giữ đồ', 'de-kep-bo': 'pcb holder kẹp giữ đồ',
    'hut-khoi': 'fume extractor khói', 'kinh-bao-ho': 'safety glasses kính mắt', nhip: 'tweezers kim nhíp gắp', 'kim-cat': 'side cutter flush cutter kềm',
    'kim-tuot': 'wire stripper kềm tuốt', 'kim-mo-nhon': 'needle nose pliers kềm mũi nhọn', 'tua-vit': 'screwdriver tuốc nơ vít', 'co-nhiet': 'heat shrink băng dính cách điện',
    'dien-tro': 'resistor trở', 'bien-tro': 'potentiometer trimpot chiết áp', 'quang-tro': 'LDR photoresistor cảm biến ánh sáng', 'tu-hoa': 'capacitor electrolytic tụ điện',
    'tu-gom': 'ceramic capacitor tụ điện', 'day-emay': 'enamel wire cuộn cảm inductor', led: 'đèn diode phát quang', 'led-rgb': 'đèn nhiều màu',
    '1n4148': 'signal diode', '1n4007': 'rectifier diode chỉnh lưu', '1n5819': 'schottky diode', zener: 'ổn áp kẹp áp', s8050: 'BJT NPN bóng bán dẫn',
    s8550: 'BJT PNP bóng bán dẫn', irlz44n: 'mosfet fet logic level công tắc motor', ne555: '555 timer định thời', lm358: 'op amp khuếch đại thuật toán so sánh comparator',
    'nut-nhan': 'button tactile switch nút bấm', 'cong-tac-gat': 'slide switch công tắc nguồn', 'cong-tac-ht': 'limit switch micro switch va chạm', relay: 'rơ le rờ le',
    'cau-chi': 'fuse cầu chì', fc51: 'IR obstacle hồng ngoại', 'hc-sr04': 'ultrasonic siêu âm khoảng cách', tcrt5000: 'line sensor dò line hồng ngoại',
    'khe-quang': 'encoder speed sensor đếm vòng', gy521: 'mpu6050 gyro con quay gia tốc', 'esp32-s3': 'vi điều khiển mcu board', 'cap-usbc': 'type-c cable',
    inmp441: 'microphone mic I2S', max98357a: 'amplifier ampli loa', loa: 'speaker', 'coi-chip': 'buzzer còi kêu bíp', oled: 'màn hình display ssd1306',
    'motor-dc': 'động cơ', 'motor-tt': 'gear motor động cơ giảm tốc bánh xe', sg90: 'servo', 'driver-motor': 'h-bridge L298N', drv8833: 'motor driver cầu H',
    'khung-2wd': 'chassis robot car', 'nam-cham': 'magnet', 'dinh-kep': 'đinh kẹp giấy giấy nhám', 'hop-pin': 'battery holder AAA', 'pin-li': 'lithium li-ion',
    'cell-18650': 'pin lithium li-ion', 'de-18650': 'battery holder hộp pin', tp4056: 'mạch sạc charger', 'bms-2s': 'battery protection board', lm2596: 'buck converter hạ áp step down',
    ams1117: 'LDO ổn áp 3.3V regulator',
  };
  LK.forEach(l => { l.khac = KHAC[l.id] || ''; });
  const timLK = t => { const k = String(t || '').toLowerCase(); return LK.find(l => l.tim.toLowerCase() === k); };
  window.LINHKIEN = { ds: LK, nhom: NHOM, loai: Object.fromEntries(LOAI.map(([k, ten]) => [k, ten])), tim: timLK, theoId: id => LK.find(l => l.id === id) };
})();
