// Vẽ breadboard MB-102 từ dữ liệu bài học.
// Địa chỉ lỗ: "12d" = cột 12 hàng d; "T+:9" = thanh + phía trên, cột 9; T- / B- / B+ tương tự.
// Thanh nguồn thật có lỗ theo nhóm 5; ở đây vẽ 1 lỗ mỗi cột cho dễ gióng — cột trên hình không phải số in trên thanh.
(function () {
  const P = 20, X0 = 84;
  const HANG = { a: 90, b: 108, c: 126, d: 144, e: 162, f: 206, g: 224, h: 242, i: 260, j: 278 };
  const THANH = { 'T+': 30, 'T-': 50, 'B-': 318, 'B+': 338 };
  const MAU_DAY = { do: 'var(--pos)', den: 'var(--wire-neg)', vang: '#D9A400', xanh: '#2E9E5B', cam: '#E07020', tim: '#8E44AD' };
  const MAU_LED = { do: '#E5372C', xanhla: '#2FA84F', vang: '#E8B90C', xanhduong: '#2F6FE0', trang: '#F2F2F2' };
  const PIN0 = { x: 56, y: 378, w: 180, h: 62 };
  let PIN = PIN0;
  let DAT = {}; // id → x thật của ESP32 / đồ ngoài sau khi ve() dời cho khỏi chồng (mô phỏng vẽ hiệu ứng theo đây)
  const ESP_Y = 392, ESP_BUOC = 36;
  // ESP32 vẽ tách khỏi breadboard, chỉ các chân bài dùng: board thật để trên bàn, nối bằng dây đực–cái.
  const tenChanEsp = k => k.replace(/^G(\d+)$/, 'IO$1').replace(/^GND\d$/, 'GND');
  const mauChanEsp = (k, i) => /^(3V3|5V)$/.test(k) ? 'do' : /^GND/.test(k) ? 'den' : ['vang', 'xanh', 'cam', 'tim'][i % 4];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cotX = c => X0 + (c - 1) * P;

  function lo(ref) {
    let m = /^([TB][+-]):(\d+)$/.exec(ref);
    if (m) return { x: cotX(+m[2]), y: THANH[m[1]], thanh: m[1], cot: +m[2] };
    m = /^(\d+)([a-j])$/.exec(ref);
    if (m) return { x: cotX(+m[1]), y: HANG[m[2]], cot: +m[1], nua: 'abcde'.includes(m[2]) ? 'tren' : 'duoi' };
    throw new Error('Lỗ không hợp lệ: ' + ref);
  }

  function chan(it) {
    switch (it.loai) {
      case 'tro': case 'ldr': return { 1: it.p[0], 2: it.p[1] };
      case 'led': return { A: it.a, K: it.k };
      case 'bientro': return { A: it.A, W: it.W, B: it.B };
      case 'day': case 'cam': return { 1: it.tu, 2: it.den };
      case 'tu': return it.kieu === 'gom' ? { 1: it.p[0], 2: it.p[1] } : { P: it.p[0], N: it.p[1] };
      case 'diode': return { A: it.a, K: it.k };
      case 'npn': return { E: it.e, B: it.b, C: it.c };
      case 'nut': { const p = lo(it.o), c2 = p.cot + (it.rong || 2); return { 1: it.o, 2: c2 + 'e', 3: p.cot + 'f', 4: c2 + 'f' }; }
      case 'mod': return Object.fromEntries(it.chan.map(c => [c[0], c[1]]));
      // IC DIP-8 vắt qua rãnh: chân 1 ở cột o hàng f, đếm ngược chiều kim đồng hồ → chân 8 ở cột o hàng e.
      case 'ic': return Object.fromEntries([1, 2, 3, 4].flatMap(i => [[i, (it.o + i - 1) + 'f'], [9 - i, (it.o + i - 1) + 'e']]));
      // LED RGB 4 chân thẳng hàng: p = [R, chung, G, B] (thứ tự theo hình của shop — dò lại ở bài 4.4)
      case 'rgb': return { R: it.p[0], C: it.p[1], G: it.p[2], B: it.p[3] };
      case 'coi': return { P: it.p[0], N: it.p[1] };
      case 'esp': case 'ngoai': return it.chan;
      default: return {};
    }
  }

  // Điểm que đo chạm: lỗ, "id.chân", hoặc tiếp điểm hộp pin "pin+" / "pin-".
  function diem(ref, theoId) {
    if (ref === 'pin+') return { x: PIN.x + PIN.w - 10, y: PIN.y + PIN.h / 2 };
    if (ref === 'pin-') return { x: PIN.x + 10, y: PIN.y + PIN.h / 2 };
    const m = /^([\w-]+)\.(\w+)$/.exec(ref);
    if (m && theoId[m[1]]) return lo(chan(theoId[m[1]])[m[2]]);
    return lo(ref);
  }

  function khung(bb, moi) {
    if (!moi) return '';
    const [x1, y1, x2, y2] = bb;
    return `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="7" class="bb-moi"/>`;
  }

  function haiChan(it, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    const g = Math.atan2(dy, dx) * 180 / Math.PI, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const doc = Math.abs(dy) > Math.abs(dx);
    let s = `<g transform="rotate(${g.toFixed(2)} ${mx} ${my})">`;
    s += `<line x1="${mx - L / 2}" y1="${my}" x2="${mx + L / 2}" y2="${my}" class="bb-chan"/>`;
    if (it.loai === 'tro') {
      const t = Math.min(L - 12, 40);
      s += `<rect x="${mx - t / 2}" y="${my - 6}" width="${t}" height="12" rx="5" class="bb-tro"/>`;
      (it.vong || []).forEach((v, i) => {
        s += `<rect x="${mx - t / 2 + 6 + i * 7}" y="${my - 6}" width="3.5" height="12" style="fill:${v}"/>`;
      });
    } else if (it.loai === 'diode') {
      // vạch = cathode, luôn ở đầu K (điểm b)
      const t = Math.min(L - 14, 30), den = it.kieu !== '4148';
      s += `<rect x="${mx - t / 2}" y="${my - 5}" width="${t}" height="10" rx="3" class="${den ? 'bb-d4007' : 'bb-d4148'}"/>`;
      s += `<rect x="${mx + t / 2 - 7}" y="${my - 5}" width="4" height="10" class="${den ? 'bb-vach-bac' : 'bb-vach-den'}"/>`;
    } else {
      s += `<circle cx="${mx}" cy="${my}" r="10" class="bb-ldr"/>`;
      s += `<path d="M${mx - 7} ${my - 3} h3 v6 h3 v-6 h3 v6 h3 v-6 h2" class="bb-ldr-zz"/>`;
    }
    s += '</g>';
    const ray = [a, b].find(q => q.thanh);
    if (it.nhan) {
      s += doc
        ? `<text x="${mx + 12}" y="${ray ? (ray.thanh[0] === 'B' ? ray.y - 1 : ray.y + 18) : my + 4}" class="bb-nhan">${esc(it.nhan)}</text>`
        : `<text x="${mx}" y="${my - 12}" text-anchor="middle" class="bb-nhan">${esc(it.nhan)}</text>`;
    }
    return { s, bb: [Math.min(a.x, b.x) - 12, Math.min(a.y, b.y) - (doc ? 8 : 24), Math.max(a.x, b.x) + (doc ? 60 : 12), Math.max(a.y, b.y) + 8] };
  }

  // LED nhìn từ trên xuống: bóng tròn nằm ngay trên 2 lỗ chân, vạch phẳng ở phía cathode (chân ngắn).
  function veLed(it, A, K) {
    const mx = (A.x + K.x) / 2, my = (A.y + K.y) / 2, mau = MAU_LED[it.mau || 'do'];
    const g = Math.atan2(K.y - A.y, K.x - A.x), cx = Math.cos(g), cy = Math.sin(g);
    let s = '';
    if (it.sang) s += `<circle cx="${mx}" cy="${my}" r="19" style="fill:${mau};opacity:.35"/>`;
    s += `<circle cx="${mx}" cy="${my}" r="11" style="fill:${mau};stroke:rgba(0,0,0,.4);opacity:.9"/>`;
    s += `<line x1="${mx + cx * 9 - cy * 7}" y1="${my + cy * 9 + cx * 7}" x2="${mx + cx * 9 + cy * 7}" y2="${my + cy * 9 - cx * 7}" style="stroke:rgba(0,0,0,.55);stroke-width:2"/>`;
    s += `<text x="${A.x - cx * 4}" y="${A.y - 14}" text-anchor="middle" class="bb-cuc">+</text>`;
    if (it.nhan) s += `<text x="${Math.max(A.x, K.x) + 14}" y="${my + 4}" class="bb-nhan">${esc(it.nhan)}</text>`;
    return { s, bb: [Math.min(A.x, K.x) - 14, my - 24, Math.max(A.x, K.x) + 14, my + 14] };
  }

  function veBienTro(it, A, W, B) {
    const xs = [A.x, W.x, B.x], minY = Math.min(A.y, W.y, B.y);
    const x1 = Math.min(...xs) - 12, x2 = Math.max(...xs) + 12, y1 = minY - 44, y2 = minY - 6;
    const ten = it.ten_chan || ['A', 'W', 'B'];
    let s = '';
    [A, W, B].forEach(p => { s += `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${y2}" class="bb-chan"/>`; });
    s += `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="4" class="bb-pot"/>`;
    const kx = (x1 + x2) / 2, ky = y1 + 17;
    s += `<circle cx="${kx}" cy="${ky}" r="10" class="bb-knob"/><line x1="${kx - 7}" y1="${ky}" x2="${kx + 7}" y2="${ky}" class="bb-slot"/>`;
    [A, W, B].forEach((p, i) => { s += `<text x="${p.x}" y="${y2 - 3}" text-anchor="middle" class="bb-potchu">${esc(ten[i])}</text>`; });
    return { s, bb: [x1 - 6, y1 - 6, x2 + 6, Math.max(A.y, W.y, B.y) + 8] };
  }

  // Tụ đứng như LED: tụ hoá thân trụ có sọc "−" phía chân N; tụ gốm là hạt dẹt.
  function veTu(it, ps) {
    const [a, b] = ps, mx = (a.x + b.x) / 2, top = Math.min(a.y, b.y) - 34;
    let s = `<line x1="${a.x}" y1="${a.y}" x2="${mx - 4}" y2="${top + 20}" class="bb-chan"/><line x1="${b.x}" y1="${b.y}" x2="${mx + 4}" y2="${top + 20}" class="bb-chan"/>`;
    if (it.kieu === 'gom') {
      s += `<ellipse cx="${mx}" cy="${top + 12}" rx="11" ry="9" class="bb-tugom"/><text x="${mx}" y="${top + 15}" text-anchor="middle" class="bb-tugom-chu">104</text>`;
    } else {
      const bx = b.x > a.x ? mx + 3 : mx - 11;
      s += `<rect x="${mx - 11}" y="${top - 6}" width="22" height="28" rx="4" class="bb-tuhoa"/><rect x="${bx}" y="${top - 6}" width="8" height="28" class="bb-tuhoa-soc"/>`;
      s += `<text x="${bx + 4}" y="${top + 11}" text-anchor="middle" class="bb-tuhoa-tru">−</text><text x="${a.x - 9}" y="${a.y - 6}" class="bb-cuc">+</text>`;
    }
    if (it.nhan) s += `<text x="${Math.max(a.x, b.x) + 12}" y="${top + 6}" class="bb-nhan">${esc(it.nhan)}</text>`;
    return { s, bb: [Math.min(a.x, b.x) - 16, top - 12, Math.max(a.x, b.x) + 16, Math.max(a.y, b.y) + 8] };
  }

  // Transistor TO-92 nhìn từ trên xuống: thân nằm ngay trên 3 lỗ chân, mặt phẳng (có chữ) quay xuống dưới hình.
  function veNpn(it, ps) {
    const xs = ps.map(p => p.x), y = ps[0].y;
    const x1 = Math.min(...xs) - 11, x2 = Math.max(...xs) + 11, y1 = y - 11, y2 = y + 8;
    const ten = it.ten_chan || ['E', 'B', 'C'];
    let s = `<path d="M${x1} ${y2}V${y1 + 8}Q${(x1 + x2) / 2} ${y1 - 8} ${x2} ${y1 + 8}V${y2}Z" class="bb-to92"/>`;
    ps.forEach((p, i) => { s += `<text x="${p.x}" y="${y + 4}" text-anchor="middle" class="bb-potchu">${esc(ten[i])}</text>`; });
    s += `<text x="${(x1 + x2) / 2}" y="${y2 + 10}" text-anchor="middle" class="bb-to92-chu-ngoai">${esc(it.chu || 'S8050')}${it.nhan ? ' · ' + esc(it.nhan) : ''}</text>`;
    if (it.to220) s = `<rect x="${x1 - 2}" y="${y1 - 26}" width="${x2 - x1 + 4}" height="16" rx="2" class="bb-tai"/>` + s;
    return { s, bb: [x1 - 6, y1 - 10, x2 + 6, y2 + 14] };
  }

  // IC DIP-8 vắt qua rãnh giữa: thân che rãnh, khuyết bên trái, chấm ở chân 1.
  function veIc(it, c) {
    const p1 = lo(c[1]), p8 = lo(c[8]), p4 = lo(c[4]);
    const x1 = p1.x - 11, x2 = p4.x + 11, y1 = p8.y + 5, y2 = p1.y - 5;
    let s = `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="3" class="bb-ic"/>`
      + `<path d="M${x1} ${(y1 + y2) / 2 - 7} a7 7 0 0 1 0 14" class="bb-ic-khuyet"/><circle cx="${p1.x}" cy="${y2 - 8}" r="2.6" class="bb-ic-cham"/>`
      + `<text x="${(x1 + x2) / 2 + 4}" y="${(y1 + y2) / 2 + 4}" text-anchor="middle" class="bb-ic-chu">${esc(it.chu || 'IC')}</text>`;
    for (let i = 1; i <= 8; i++) { const q = lo(c[i]); s += `<text x="${q.x}" y="${i <= 4 ? q.y + 15 : q.y - 8}" text-anchor="middle" class="bb-nutchu">${i}</text>`; }
    if (it.nhan) s += `<text x="${x2 + 8}" y="${(y1 + y2) / 2 + 4}" class="bb-nhan">${esc(it.nhan)}</text>`;
    return { s, bb: [x1 - 8, p8.y - 18, x2 + 8, p1.y + 20] };
  }

  // LED RGB nhìn từ trên: bóng trắng đục che 4 chân; chữ dưới mỗi chân theo tên chân của bài.
  function veRgb(it, c) {
    const ps = ['R', 'C', 'G', 'B'].map(k => ({ k, ...lo(c[k]) })), xs = ps.map(p => p.x), y = ps[0].y;
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    let s = '';
    if (it.sang) s += `<circle cx="${cx}" cy="${y - 20}" r="26" style="fill:${it.sang};opacity:.35"/>`;
    s += `<circle cx="${cx}" cy="${y - 20}" r="17" class="bb-rgb"/>`;
    ps.forEach(p => { s += `<line x1="${p.x}" y1="${p.y}" x2="${cx + (p.x - cx) * .4}" y2="${y - 8}" class="bb-chan"/><text x="${p.x}" y="${p.y + 15}" text-anchor="middle" class="bb-nutchu">${esc((it.ten_chan || {})[p.k] || (p.k === 'C' ? '−' : p.k))}</text>`; });
    if (it.nhan) s += `<text x="${Math.max(...xs) + 14}" y="${y - 16}" class="bb-nhan">${esc(it.nhan)}</text>`;
    return { s, bb: [Math.min(...xs) - 16, y - 42, Math.max(...xs) + 16, y + 20] };
  }

  // Còi chip nhìn từ trên: hình tròn đen, dấu + ở chân P.
  function veCoi(it, c) {
    const a = lo(c.P), b = lo(c.N), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    let s = `<circle cx="${mx}" cy="${my}" r="15" class="bb-coi"/><circle cx="${mx}" cy="${my}" r="3" class="bb-coi-lo"/><text x="${a.x - 4}" y="${a.y - 13}" text-anchor="middle" class="bb-cuc">+</text>`;
    if (it.nhan) s += `<text x="${Math.max(a.x, b.x) + 18}" y="${my + 4}" class="bb-nhan">${esc(it.nhan)}</text>`;
    return { s, bb: [Math.min(a.x, b.x) - 18, my - 18, Math.max(a.x, b.x) + 18, my + 18] };
  }

  // Nút 6×6 vắt qua rãnh giữa: 4 chân ở hàng e và f.
  function veNut(it, c) {
    const p1 = lo(c[1]), p4 = lo(c[4]);
    const x1 = p1.x - 9, x2 = p4.x + 9, y1 = p1.y - 8, y2 = p4.y + 8, cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    let s = `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="3" class="bb-nut"/><circle cx="${cx}" cy="${cy}" r="11" class="bb-nut-num${it.nhan_xuong ? ' nhan' : ''}"/>`;
    ['1', '2', '3', '4'].forEach(k => { const q = lo(c[k]); s += `<text x="${q.x + (q.x < cx ? -9 : 9)}" y="${q.y + (q.y < cy ? -6 : 14)}" text-anchor="middle" class="bb-nutchu">${k}</text>`; });
    if (it.nhan) s += `<text x="${cx}" y="${y2 + 26}" text-anchor="middle" class="bb-nhan">${esc(it.nhan)}</text>`;
    return { s, bb: [x1 - 14, y1 - 14, x2 + 14, y2 + 30] };
  }

  // Module cắm chân vào hàng a; thân nằm trên cao, che thanh nguồn ở các cột đó.
  function veMod(it) {
    const ps = it.chan.map(c => ({ ...lo(c[1]), ten: c[2] || c[0] })), xs = ps.map(p => p.x);
    const x1 = Math.min(...xs) - 12, x2 = Math.max(...xs) + 12, y1 = 12, y2 = Math.min(...ps.map(p => p.y)) - 8;
    const mau = { xanh: '#1E7A46', den: '#1E2328', tim: '#5B3A8E', xanhduong: '#1F5AA8', do: '#A3302A' }[it.mau || 'xanhduong'] || '#1F5AA8';
    let s = '';
    ps.forEach(p => { s += `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${y2}" class="bb-chan"/>`; });
    s += `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="4" style="fill:${mau};opacity:.94"/>`;
    s += `<text x="${(x1 + x2) / 2}" y="${y1 + 13}" text-anchor="middle" class="bb-modten">${esc(it.ten)}</text>`;
    ps.forEach(p => { s += `<text transform="translate(${p.x + 3.5} ${y2 - 4}) rotate(-90)" class="bb-modchan">${esc(p.ten)}</text>`; });
    // thân module che dòng số cột của board: vẽ lại số (1, 5, 10…) lên thân, bài ghi chân theo số cột
    ps.filter(p => p.cot === 1 || p.cot % 5 === 0).forEach(p => { s += `<text x="${p.x}" y="${y1 + 27}" text-anchor="middle" class="bb-modso">${p.cot}</text>`; });
    return { s, bb: [x1 - 6, y1 - 4, x2 + 6, Math.max(...ps.map(p => p.y)) + 8] };
  }

  function veEsp(it) {
    const ks = Object.keys(it.chan), x0 = it.x != null ? it.x : 40, w = 40 + ks.length * ESP_BUOC, h = 60, y0 = ESP_Y;
    let s = '';
    ks.forEach((k, i) => {
      const px = x0 + 34 + i * ESP_BUOC, d = lo(it.chan[k]), m = MAU_DAY[mauChanEsp(k, i)];
      s += `<path d="M${px} ${y0} C ${px} ${y0 - 50}, ${d.x} ${d.y + 70}, ${d.x} ${d.y}" style="stroke:${m}" class="bb-daypin"/><circle cx="${d.x}" cy="${d.y}" r="4.5" style="fill:${m}"/>`;
    });
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="5" class="bb-esp"/>`;
    s += `<rect x="${x0 - 12}" y="${y0 + 22}" width="14" height="18" rx="3" class="bb-usb"/>`;
    ks.forEach((k, i) => {
      const px = x0 + 34 + i * ESP_BUOC;
      s += `<rect x="${px - 4}" y="${y0 - 4}" width="8" height="8" class="bb-header"/><text x="${px}" y="${y0 + 20}" text-anchor="middle" class="bb-espchan">${esc(tenChanEsp(k))}</text>`;
    });
    s += `<text x="${x0 + 22}" y="${y0 + 46}" class="bb-espten">ESP32-S3</text>`;
    s += it.usb
      ? `<text x="${x0}" y="${y0 + h + 20}" class="bb-canh">USB: CẮM · có điện</text>`
      : `<text x="${x0}" y="${y0 + h + 20}" class="bb-xau">USB: RÚT · không điện</text>`;
    return { s, bb: [x0 - 18, y0 - 10, x0 + w + 8, y0 + h + 28] };
  }

  // Đồ nằm ngoài board (motor, loa, cuộn dây): 2 dây nối vào lỗ.
  function veNgoai(it) {
    const x = it.x != null ? it.x : 300, y = 420, ks = Object.keys(it.chan), mau = it.mau || ['do', 'den'];
    // hộp: chân giãn theo nhãn dài nhất (chữ 9px mono ≈ 5.5px/ký tự), không thì "IN+IN−OUT+OUT−" dính liền
    const buoc = it.kieu === 'hop' ? Math.max(ks.length > 2 ? 18 : 24, Math.max(...ks.map(k => k.length)) * 5.5 + 4) : ks.length > 2 ? 18 : 24;
    const w = it.kieu === 'hop' ? Math.max(70, ks.length * buoc + 16) : 52;
    let s = '';
    ks.forEach((k, i) => {
      const d = lo(it.chan[k]), sx = x + (i - (ks.length - 1) / 2) * buoc, m = MAU_DAY[mau[i] || 'vang'];
      s += `<path d="M${sx} ${y - 22} C ${sx} ${y - 70}, ${d.x} ${d.y + 60}, ${d.x} ${d.y}" style="stroke:${m}" class="bb-daypin"/><circle cx="${d.x}" cy="${d.y}" r="4.5" style="fill:${m}"/>`;
    });
    if (it.kieu === 'hop') {
      s += `<rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="5" class="bb-esp"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="bb-espchan">${esc(it.chu || '')}</text>`;
      ks.forEach((k, i) => { s += `<text x="${x + (i - (ks.length - 1) / 2) * buoc}" y="${y - 26}" text-anchor="middle" class="bb-nutchu">${esc(k)}</text>`; });
    } else if (it.kieu === 'loa') {
      s += `<circle cx="${x}" cy="${y}" r="24" class="bb-loa"/><circle cx="${x}" cy="${y}" r="10" class="bb-loa-giua"/>`;
    } else {
      s += `<rect x="${x - 26}" y="${y - 22}" width="52" height="44" rx="20" class="bb-motor"/><rect x="${x + 26}" y="${y - 3}" width="16" height="6" class="bb-truc"/><text x="${x}" y="${y + 5}" text-anchor="middle" class="bb-motorchu">M</text>`;
    }
    if (it.nhan) s += `<text x="${x}" y="${y + 42}" text-anchor="middle" class="bb-ghichu">${esc(it.nhan)}</text>`;
    const nua = Math.max(w / 2 + 6, it.nhan ? it.nhan.length * 3.4 : 0);
    return { s, bb: [x - Math.max(32, nua), y - 28, x + Math.max(it.kieu === 'hop' ? 0 : 46, nua), y + 48] };
  }

  function veDay(it, a, b) {
    const mau = MAU_DAY[it.mau || 'do'];
    // cong: dây võng ra khỏi hàng lỗ nó đi ngang qua, để khỏi trông như cắm vào các lỗ đó
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, k = 2 * (it.cong || 0);
    const qx = (a.x + b.x) / 2 - (b.y - a.y) / L * k, qy = (a.y + b.y) / 2 + (b.x - a.x) / L * k;
    let s = `<path d="M${a.x} ${a.y} Q ${qx} ${qy} ${b.x} ${b.y}" style="stroke:${mau}" class="bb-day"/>`;
    s += `<circle cx="${a.x}" cy="${a.y}" r="4.5" style="fill:${mau}"/><circle cx="${b.x}" cy="${b.y}" r="4.5" style="fill:${mau}"/>`;
    return { s, bb: [Math.min(a.x, b.x) - 9, Math.min(a.y, b.y) - 9, Math.max(a.x, b.x) + 9, Math.max(a.y, b.y) + 9] };
  }

  function veCam(it, a, b) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    let s = `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="bb-cam"/>`;
    s += `<path d="M${mx - 7} ${my - 7}L${mx + 7} ${my + 7}M${mx + 7} ${my - 7}L${mx - 7} ${my + 7}" class="bb-cam-x"/>`;
    if (it.nhan) s += `<text x="${mx + 12}" y="${my + 4}" class="bb-camchu">${esc(it.nhan)}</text>`;
    return { s, bb: null };
  }

  function vePin(it, theoId) {
    const { x, y, w, h } = PIN, day = it.trang_thai === 'day';
    let s = '';
    [['cong', 'pos', x + w - 34], ['tru', 'den', x + 34]].forEach(([k, m, sx]) => {
      const d = lo(it[k]);
      // hộp ở chỗ mặc định: dây vòng qua mép trái board; hộp dời sang chỗ khác: dây đi thẳng lên
      const c = it.x != null ? `${sx} ${y - 60}, ${d.x} ${d.y + 60}` : `10 ${y - 10}, 10 ${d.y + 10}`;
      s += `<path d="M${sx} ${y} C ${c}, ${d.x} ${d.y}" style="stroke:${MAU_DAY[m === 'pos' ? 'do' : 'den']}" class="bb-daypin"/>`;
      s += `<circle cx="${d.x}" cy="${d.y}" r="4.5" style="fill:${MAU_DAY[m === 'pos' ? 'do' : 'den']}"/>`;
    });
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" class="bb-hop"/>`;
    for (let i = 0; i < 3; i++) {
      const cx = x + 20 + i * 48;
      s += day
        ? `<rect x="${cx}" y="${y + 14}" width="44" height="34" rx="4" class="bb-cell"/><text x="${cx + 22}" y="${y + 36}" text-anchor="middle" class="bb-cellchu">AAA</text>`
        : `<rect x="${cx}" y="${y + 14}" width="44" height="34" rx="4" class="bb-cell-rong"/><text x="${cx + 22}" y="${y + 36}" text-anchor="middle" class="bb-mo">trống</text>`;
    }
    s += `<rect x="${x + 4}" y="${y + h / 2 - 8}" width="7" height="16" class="bb-tiepdiem"/><rect x="${x + w - 11}" y="${y + h / 2 - 8}" width="7" height="16" class="bb-tiepdiem"/>`;
    s += `<text x="${x + w + 6}" y="${y + h / 2 + 4}" class="bb-cuc-pos">+</text><text x="${x - 12}" y="${y + h / 2 + 4}" class="bb-cuc-neg">−</text>`;
    s += day
      ? `<text x="${x + w / 2}" y="${y + h + 20}" text-anchor="middle" class="bb-canh">ĐÃ LẮP PIN · ${esc(it.ap || 'có điện')}</text>`
      : `<text x="${x + w / 2}" y="${y + h + 20}" text-anchor="middle" class="bb-xau">CHƯA LẮP PIN · không có điện</text>`;
    return { s, bb: [x - 16, y - 8, x + w + 16, y + h + 28] };
  }

  // ngoai: khung của hộp pin / ESP32 / đồ ngoài board đã vẽ. Đồng hồ mặc định ở góc phải dưới; chồng lên món nào
  // (LM2596, pack, công tắc… bài đặt x ở đó) thì xuống hàng riêng bên dưới, không thì món đó bị che mất.
  function veDongHo(it, W, theoId, ngoai) {
    const w = 200, h = 108, mx = W - w - 16;
    const chong = ngoai.filter(b => b[0] < mx + w + 6 && b[2] > mx - 32 && b[3] > 372);
    const my = chong.length ? Math.max(...chong.map(b => b[3])) + 18 : 378;
    const com = { x: mx + 60, y: my + 90 }, cong = { x: mx + 140, y: my + 90 };
    let s = '';
    // Dây que đi xuống khỏi cổng rồi vòng sang trái đồng hồ, để không vẽ đè lên màn LCD.
    // Que đỏ đi vòng ngoài dây đen nên hai dây không cắt nhau.
    const que = (tu, den, lop, yb, xs) => {
      const t = diem(den, theoId);
      const c2 = t.y < my ? t.y + 70 : t.y - 50;
      return `<path d="M${tu.x} ${tu.y} V${yb - 8} Q${tu.x} ${yb} ${tu.x - 8} ${yb} H${xs + 8} Q${xs} ${yb} ${xs} ${yb - 8} V${my + 20} C ${xs} ${my - 50}, ${t.x + 4} ${c2}, ${t.x + 4} ${t.y + 5}" class="${lop}"/><circle cx="${t.x + 4}" cy="${t.y + 5}" r="3.5" class="${lop}-dau"/>`;
    };
    s += `<rect x="${mx}" y="${my}" width="${w}" height="${h}" rx="10" class="bb-dh"/>`;
    s += `<rect x="${mx + 14}" y="${my + 10}" width="${w - 28}" height="36" rx="3" class="bb-lcd"/>`;
    s += `<text x="${mx + w / 2}" y="${my + 35}" text-anchor="middle" class="bb-lcdchu">${esc(it.hien || '')}</text>`;
    s += `<text x="${mx + w / 2}" y="${my + 64}" text-anchor="middle" class="bb-dhchu">núm: ${esc(it.che_do)}</text>`;
    s += `<circle cx="${com.x}" cy="${com.y}" r="7" class="bb-cong-den"/><text x="${com.x - 12}" y="${com.y + 4}" text-anchor="end" class="bb-dhchu">COM</text>`;
    s += `<circle cx="${cong.x}" cy="${cong.y}" r="7" class="bb-cong-do"/><text x="${cong.x + 12}" y="${cong.y + 4}" class="bb-dhchu">${esc(it.cong || 'VΩ')}</text>`;
    s += que(cong, it.do_, 'bb-que-do', my + h + 24, mx - 26) + que(com, it.den, 'bb-que-den', my + h + 12, mx - 12);
    return { s, bb: [mx - 6, my - 6, mx + w + 6, my + h + 6], day: my + h + 34 };
  }

  function veNhan(it) {
    const p = lo(it.o), x = p.x + (it.dx || 0), y = p.y + (it.dy || 0);
    return { s: `<text x="${x}" y="${y}" class="${it.xau ? 'bb-xau' : 'bb-ghichu'}">${esc(it.chu)}</text>`, bb: null };
  }

  function ve(board, moTa) {
    const N = board.cot || 24, items = board.items || [];
    const W = cotX(N) + 30;
    const hop = items.find(i => i.loai === 'pin');
    PIN = hop && hop.x != null ? { ...PIN0, x: hop.x } : PIN0;
    const coNgoai = items.some(i => ['pin', 'dh', 'esp', 'ngoai'].includes(i.loai));
    let H = items.some(i => i.loai === 'dh') ? 520 : coNgoai ? 500 : 362;
    // Khung các món dưới board đã đặt chỗ. Hộp pin đứng yên (dây pin + que đo tới tiếp điểm hộp tính theo PIN);
    // ESP32 / đồ ngoài mà bài đặt x chồng lên món trước thì dời sang phải tới khi hết chồng.
    DAT = {};
    const ngoai = hop ? [[PIN.x - 16, PIN.y - 8, PIN.x + PIN.w + 16, PIN.y + PIN.h + 28]] : [];
    const giao = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
    // Dời mà tràn mép phải thì thôi, giữ chỗ bài đặt: chồng một góc còn hơn mất hẳn khỏi hình.
    const datCho = (veMon, it, xMacDinh) => {
      const goc = veMon(it);
      let r = goc, moi = it;
      for (let k = 0; k < 12; k++) {
        const b = ngoai.find(q => giao(q, r.bb));
        if (!b) break;
        moi = { ...moi, x: (moi.x != null ? moi.x : xMacDinh) + b[2] - r.bb[0] + 6 };
        r = veMon(moi);
      }
      if (r.bb[2] > W) { r = goc; moi = it; }
      if (it.id) DAT[it.id] = moi.x != null ? moi.x : xMacDinh;
      return r;
    };
    const theoId = {};
    items.forEach(i => { if (i.id) theoId[i.id] = i; });

    let s = `<rect x="50" y="8" width="${W - 60}" height="344" rx="8" class="bb-board"/>`;
    s += `<rect x="50" y="180" width="${W - 60}" height="8" class="bb-ranh"/>`;
    // dải 5 lỗ thông nhau của mọi cột đang dùng
    const dai = new Set();
    items.filter(it => it.loai !== 'cam').forEach(it => Object.values(chan(it)).forEach(r => { const p = lo(r); if (p.nua) dai.add(p.cot + '|' + p.nua); }));
    dai.forEach(k => {
      const [c, n] = k.split('|');
      s += `<rect x="${cotX(+c) - 8}" y="${n === 'tren' ? 81 : 197}" width="16" height="90" rx="3" class="bb-dai"/>`;
    });
    s += `<line x1="${X0}" y1="20" x2="${W - 20}" y2="20" class="bb-vach-pos"/><line x1="${X0}" y1="60" x2="${W - 20}" y2="60" class="bb-vach-neg"/>`;
    s += `<line x1="${X0}" y1="308" x2="${W - 20}" y2="308" class="bb-vach-neg"/><line x1="${X0}" y1="348" x2="${W - 20}" y2="348" class="bb-vach-pos"/>`;
    s += `<text x="62" y="34" class="bb-cuc-pos">+</text><text x="62" y="54" class="bb-cuc-neg">−</text><text x="62" y="322" class="bb-cuc-neg">−</text><text x="62" y="342" class="bb-cuc-pos">+</text>`;
    // Linh kiện cắm từ hàng a/j thẳng vào thanh nguồn thì thân nằm đúng dòng số cột: bỏ số ở cột đó cho khỏi đè.
    const cheSo = { tren: new Set(), duoi: new Set() };
    items.filter(it => ['tro', 'ldr', 'led', 'diode', 'tu'].includes(it.loai)).forEach(it => {
      const ps = Object.values(chan(it)).map(lo), t = ps.find(q => q.thanh);
      if (t && ps.some(q => q.nua && q.cot === t.cot)) cheSo[t.thanh[0] === 'T' ? 'tren' : 'duoi'].add(t.cot);
    });
    let lo_ = '';
    for (let c = 1; c <= N; c++) {
      const x = cotX(c);
      Object.values(THANH).forEach(y => { lo_ += `<circle cx="${x}" cy="${y}" r="3"/>`; });
      Object.values(HANG).forEach(y => { lo_ += `<circle cx="${x}" cy="${y}" r="3"/>`; });
      if (c === 1 || c % 5 === 0) {
        if (!cheSo.tren.has(c)) s += `<text x="${x}" y="76" text-anchor="middle" class="bb-so">${c}</text>`;
        if (!cheSo.duoi.has(c)) s += `<text x="${x}" y="300" text-anchor="middle" class="bb-so">${c}</text>`;
      }
    }
    s += `<g class="bb-lo">${lo_}</g>`;
    'abcdefghij'.split('').forEach(r => { s += `<text x="64" y="${HANG[r] + 4}" class="bb-so">${r}</text>`; });

    const lop = { duoi: '', tren: '', moi: '' };
    const them = (r, it) => {
      if (!r) return;
      lop[it.loai === 'dh' || it.loai === 'nhan' || it.loai === 'cam' ? 'tren' : 'duoi'] += r.s;
      if (r.bb) lop.moi += khung(r.bb, it.moi);
      if (r.bb && ['esp', 'ngoai'].includes(it.loai)) ngoai.push(r.bb);
      if (r.day) H = Math.max(H, r.day);
    };
    const thuTu = ['mod', 'ic', 'tro', 'ldr', 'diode', 'bientro', 'npn', 'nut', 'led', 'rgb', 'coi', 'tu', 'day', 'ngoai', 'esp', 'pin', 'cam', 'dh', 'nhan'];
    [...items].sort((a, b) => thuTu.indexOf(a.loai) - thuTu.indexOf(b.loai)).forEach(it => {
      const c = chan(it), p = k => lo(c[k]);
      switch (it.loai) {
        case 'tro': case 'ldr': them(haiChan(it, p(1), p(2)), it); break;
        case 'diode': them(haiChan(it, p('A'), p('K')), it); break;
        case 'tu': them(veTu(it, Object.keys(c).map(p)), it); break;
        case 'npn': them(veNpn(it, [p('E'), p('B'), p('C')]), it); break;
        case 'nut': them(veNut(it, c), it); break;
        case 'ic': them(veIc(it, c), it); break;
        case 'rgb': them(veRgb(it, c), it); break;
        case 'coi': them(veCoi(it, c), it); break;
        case 'mod': them(veMod(it), it); break;
        case 'esp': them(datCho(veEsp, it, 40), it); break;
        case 'ngoai': them(datCho(veNgoai, it, 300), it); break;
        case 'led': them(veLed(it, p('A'), p('K')), it); break;
        case 'bientro': them(veBienTro(it, p('A'), p('W'), p('B')), it); break;
        case 'day': them(veDay(it, p(1), p(2)), it); break;
        case 'cam': them(veCam(it, p(1), p(2)), it); break;
        case 'pin': them(vePin(it, theoId), it); break;
        case 'dh': them(veDongHo(it, W, theoId, ngoai), it); break;
        case 'nhan': them(veNhan(it), it); break;
      }
      // chấm chân cắm
      if (['tro', 'ldr', 'led', 'bientro', 'diode', 'tu', 'nut', 'mod', 'ic', 'rgb', 'coi'].includes(it.loai)) {
        Object.values(c).forEach(r => { const q = lo(r); lop.duoi += `<circle cx="${q.x}" cy="${q.y}" r="3.6" class="bb-chancam"/>`; });
      }
    });
    s += lop.duoi + lop.moi + lop.tren;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(moTa || 'Hình breadboard')}" style="min-width:${Math.min(W, 560)}px">${s}</svg>`;
  }

  // lo/chan/diem cho trang mô phỏng dò lỗ dưới con trỏ; diem('pin±') theo vị trí hộp pin của lần ve() gần nhất.
  window.Board = { ve, lo, chan, diem, HANG, THANH, PIN: () => PIN, xNgoai: id => DAT[id] };
})();

// Sơ đồ nguyên lý vẽ tay bằng vài khối cơ bản; mọi nét theo currentColor nên ăn theo theme.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SD = {
    svg: (w, h, trong, nhan) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(nhan)}" class="sd">${trong}</svg>`,
    day: (pts, nong) => `<polyline points="${pts}" class="${nong ? 'sd-nong' : 'sd-net'}"/>`,
    cham: (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" class="sd-cham"/>`,
    chu: (x, y, t, lop, neo) => `<text x="${x}" y="${y}" class="${lop || 'sd-chu'}"${neo ? ` text-anchor="${neo}"` : ''}>${esc(t)}</text>`,
    // pin dọc: cực + ở trên tại (x, y)
    pin: (x, y, ap) => `<line x1="${x - 16}" y1="${y}" x2="${x + 16}" y2="${y}" class="sd-net" stroke-width="3"/><line x1="${x - 8}" y1="${y + 10}" x2="${x + 8}" y2="${y + 10}" class="sd-net" stroke-width="3"/>`
      + SD.chu(x + 22, y + 2, '+', 'sd-pos') + SD.chu(x + 22, y + 20, '−', 'sd-neg') + (ap ? SD.chu(x + 14, y + 36, ap, 'sd-mo') : ''),
    // điện trở dọc từ (x, y) xuống dài d
    tro: (x, y, d, nhan, nong) => {
      const z = [], n = 6, s = (d - 16) / n;
      z.push(`${x},${y}`, `${x},${y + 8}`);
      for (let i = 0; i < n; i++) z.push(`${x + (i % 2 ? -8 : 8)},${y + 8 + s * (i + 0.5)}`);
      z.push(`${x},${y + d - 8}`, `${x},${y + d}`);
      return SD.day(z.join(' '), nong) + (nhan ? SD.chu(x + 14, y + d / 2 + 4, nhan) : '');
    },
    // điện trở ngang từ (x, y) sang phải dài d
    troNgang: (x, y, d, nhan) => {
      const z = [`${x},${y}`, `${x + 8},${y}`], n = 6, s = (d - 16) / n;
      for (let i = 0; i < n; i++) z.push(`${x + 8 + s * (i + 0.5)},${y + (i % 2 ? -8 : 8)}`);
      z.push(`${x + d - 8},${y}`, `${x + d},${y}`);
      return SD.day(z.join(' ')) + (nhan ? SD.chu(x + d / 2, y - 14, nhan, 'sd-chu', 'middle') : '');
    },
    // biến trở dọc, con trượt chỉ vào từ bên phải tại giữa
    bienTro: (x, y, d) => SD.tro(x, y, d) + `<line x1="${x + 40}" y1="${y + d / 2}" x2="${x + 12}" y2="${y + d / 2}" class="sd-net" marker-end="url(#sd-mui)"/>`
      + SD.chu(x + 14, y + 12, 'A') + SD.chu(x + 14, y + d - 4, 'B') + SD.chu(x + 26, y + d / 2 - 6, 'W'),
    // LED dọc, anode ở trên tại (x, y), dài 40
    led: (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 12}" class="sd-net"/><path d="M${x - 10} ${y + 12}H${x + 10}L${x} ${y + 28}Z" class="sd-net sd-to"/><line x1="${x - 10}" y1="${y + 28}" x2="${x + 10}" y2="${y + 28}" class="sd-net"/><line x1="${x}" y1="${y + 28}" x2="${x}" y2="${y + 40}" class="sd-net"/>`
      + `<path d="M${x + 13} ${y + 14}l9 -7M${x + 15} ${y + 22}l9 -7" class="sd-net"/>` + SD.chu(x - 14, y + 24, 'LED', 'sd-chu', 'end'),
    // quang trở dọc
    ldr: (x, y, d, nhan) => SD.tro(x, y, d) + `<circle cx="${x}" cy="${y + d / 2}" r="16" class="sd-net"/><path d="M${x - 34} ${y + d / 2 - 18}l12 8M${x - 34} ${y + d / 2 - 6}l12 8" class="sd-net" marker-end="url(#sd-mui)"/>`
      + (nhan ? SD.chu(x + 22, y + d / 2 + 4, nhan) : ''),
    // tụ dọc từ (x, y) xuống dài d; coCuc = tụ hoá, bản + ở trên
    tu: (x, y, d, nhan, coCuc) => {
      const m = y + d / 2;
      return SD.day(`${x},${y} ${x},${m - 4}`) + SD.day(`${x},${m + 4} ${x},${y + d}`)
        + `<line x1="${x - 13}" y1="${m - 4}" x2="${x + 13}" y2="${m - 4}" class="sd-net" stroke-width="2.6"/>`
        + (coCuc ? `<path d="M${x - 13} ${m + 7} Q${x} ${m + 1} ${x + 13} ${m + 7}" class="sd-net" stroke-width="2.6"/>` + SD.chu(x - 22, m - 6, '+', 'sd-pos')
          : `<line x1="${x - 13}" y1="${m + 4}" x2="${x + 13}" y2="${m + 4}" class="sd-net" stroke-width="2.6"/>`)
        + (nhan ? SD.chu(x + 18, m + 4, nhan) : '');
    },
    // diode dọc, anode ở trên, cathode (vạch) ở dưới
    diode: (x, y, d, nhan) => {
      const m = y + d / 2;
      return SD.day(`${x},${y} ${x},${m - 9}`) + `<path d="M${x - 10} ${m - 9}H${x + 10}L${x} ${m + 7}Z" class="sd-net sd-to"/>`
        + `<line x1="${x - 10}" y1="${m + 7}" x2="${x + 10}" y2="${m + 7}" class="sd-net" stroke-width="2.4"/>` + SD.day(`${x},${m + 7} ${x},${y + d}`)
        + (nhan ? SD.chu(x + 16, m + 4, nhan) : '');
    },
    // NPN: B vào từ (x−30, y); C ra ở (x+10, y−30); E ra ở (x+10, y+30)
    npn: (x, y, nhan) => `<circle cx="${x}" cy="${y}" r="19" class="sd-net"/>` + SD.day(`${x - 30},${y} ${x - 7},${y}`)
      + `<line x1="${x - 7}" y1="${y - 11}" x2="${x - 7}" y2="${y + 11}" class="sd-net" stroke-width="2.6"/>`
      + SD.day(`${x - 7},${y - 5} ${x + 10},${y - 16} ${x + 10},${y - 30}`) + SD.day(`${x - 7},${y + 5} ${x + 10},${y + 16} ${x + 10},${y + 30}`)
      + `<path d="M${x + 10} ${y + 16}l-9 -1l4 -6z" style="fill:currentColor"/>`
      + SD.chu(x - 30, y - 6, 'B', 'sd-mo') + SD.chu(x + 15, y - 22, 'C', 'sd-mo') + SD.chu(x + 15, y + 28, 'E', 'sd-mo') + (nhan ? SD.chu(x + 24, y + 4, nhan) : ''),
    // nút nhấn dọc từ (x, y) xuống dài d
    nut: (x, y, d, nhan) => {
      const m = y + d / 2;
      return SD.day(`${x},${y} ${x},${m - 10}`) + SD.day(`${x},${m + 10} ${x},${y + d}`) + SD.cham(x, m - 10) + SD.cham(x, m + 10)
        + `<line x1="${x - 12}" y1="${m - 14}" x2="${x - 12}" y2="${m + 14}" class="sd-net" stroke-width="2.4"/><line x1="${x - 12}" y1="${m}" x2="${x - 24}" y2="${m}" class="sd-net"/>`
        + (nhan ? SD.chu(x + 12, m + 4, nhan) : '');
    },
    // motor, tâm (x, y), chân trên (x, y−16) và dưới (x, y+16)
    motor: (x, y) => `<circle cx="${x}" cy="${y}" r="16" class="sd-net sd-to"/>` + SD.chu(x, y + 5, 'M', 'sd-chu', 'middle'),
    loa: (x, y) => `<path d="M${x - 6} ${y - 8}h8v16h-8zM${x + 2} ${y - 8}l12 -10v36l-12 -10" class="sd-net"/>`,
    // khối (chip, module) — vẽ chữ nhật có tên; dây nối vào tự vẽ bằng SD.day
    hop: (x, y, w, h, ten) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="sd-net sd-to"/>` + SD.chu(x + w / 2, y + h / 2 + 4, ten, 'sd-chu', 'middle'),
    dat: (x, y) => SD.day(`${x},${y} ${x},${y + 8}`) + `<path d="M${x - 11} ${y + 8}H${x + 11}M${x - 7} ${y + 13}H${x + 7}M${x - 3} ${y + 18}H${x + 3}" class="sd-net"/>`,
    dongHo: (x, y, chu) => `<circle cx="${x}" cy="${y}" r="16" class="sd-net"/>` + SD.chu(x, y + 5, chu, 'sd-chu', 'middle'),
    // diode dọc chỉ lên: cathode (vạch) ở TRÊN — kiểu diode ngược song song motor, vạch về phía +
    diodeLen: (x, y, d, nhan) => {
      const m = y + d / 2;
      return SD.day(`${x},${y} ${x},${m - 7}`) + `<line x1="${x - 10}" y1="${m - 7}" x2="${x + 10}" y2="${m - 7}" class="sd-net" stroke-width="2.4"/>`
        + `<path d="M${x - 10} ${m + 9}H${x + 10}L${x} ${m - 7}Z" class="sd-net sd-to"/>` + SD.day(`${x},${m + 9} ${x},${y + d}`) + (nhan ? SD.chu(x + 16, m + 4, nhan) : '');
    },
    // zener dọc, cathode (vạch có râu) ở TRÊN: vẽ đúng chiều mắc ngược (K về phía +)
    zener: (x, y, d, nhan) => {
      const m = y + d / 2;
      return SD.day(`${x},${y} ${x},${m - 7}`) + `<path d="M${x - 10} ${m + 9}H${x + 10}L${x} ${m - 7}Z" class="sd-net sd-to"/>`
        + `<path d="M${x - 14} ${m - 11}L${x - 10} ${m - 7}H${x + 10}L${x + 14} ${m - 3}" class="sd-net" stroke-width="2.2"/>` + SD.day(`${x},${m + 9} ${x},${y + d}`)
        + (nhan ? SD.chu(x + 18, m + 4, nhan) : '');
    },
    // PNP: B vào từ (x−30, y); E ở trên (x+10, y−30) nối +; C ở dưới (x+10, y+30) ra tải. Mũi tên chỉ VÀO (ở E).
    pnp: (x, y, nhan) => `<circle cx="${x}" cy="${y}" r="19" class="sd-net"/>` + SD.day(`${x - 30},${y} ${x - 7},${y}`)
      + `<line x1="${x - 7}" y1="${y - 11}" x2="${x - 7}" y2="${y + 11}" class="sd-net" stroke-width="2.6"/>`
      + SD.day(`${x - 7},${y - 5} ${x + 10},${y - 16} ${x + 10},${y - 30}`) + SD.day(`${x - 7},${y + 5} ${x + 10},${y + 16} ${x + 10},${y + 30}`)
      + `<path d="M${x - 6} ${y - 6}l9 -1l-3 6z" style="fill:currentColor"/>`
      + SD.chu(x - 30, y - 6, 'B', 'sd-mo') + SD.chu(x + 15, y - 22, 'E', 'sd-mo') + SD.chu(x + 15, y + 28, 'C', 'sd-mo') + (nhan ? SD.chu(x + 24, y + 4, nhan) : ''),
    // MOSFET kênh N: G vào từ (x−30, y); D ở trên (x+10, y−30); S ở dưới (x+10, y+30).
    mosfet: (x, y, nhan) => SD.day(`${x - 30},${y} ${x - 10},${y}`) + `<line x1="${x - 10}" y1="${y - 12}" x2="${x - 10}" y2="${y + 12}" class="sd-net" stroke-width="2.4"/>`
      + [-12, 0, 12].map(dy => `<line x1="${x - 4}" y1="${y + dy - 5}" x2="${x - 4}" y2="${y + dy + 5}" class="sd-net" stroke-width="2.4"/>`).join('')
      + SD.day(`${x - 4},${y - 12} ${x + 10},${y - 12} ${x + 10},${y - 30}`) + SD.day(`${x - 4},${y + 12} ${x + 10},${y + 12} ${x + 10},${y + 30}`) + SD.day(`${x - 4},${y} ${x + 10},${y} ${x + 10},${y + 12}`)
      + `<path d="M${x - 3} ${y}l7 -4v8z" style="fill:currentColor"/>`
      + SD.chu(x - 30, y - 6, 'G', 'sd-mo') + SD.chu(x + 15, y - 22, 'D', 'sd-mo') + SD.chu(x + 15, y + 28, 'S', 'sd-mo') + (nhan ? SD.chu(x + 24, y + 4, nhan) : ''),
    // op-amp: tam giác mũi ở (x+40, y); IN− vào (x−20, y−12), IN+ vào (x−20, y+12)
    opamp: (x, y, nhan) => `<path d="M${x} ${y - 26}V${y + 26}L${x + 40} ${y}Z" class="sd-net sd-to"/>` + SD.day(`${x - 20},${y - 12} ${x},${y - 12}`) + SD.day(`${x - 20},${y + 12} ${x},${y + 12}`)
      + SD.chu(x + 4, y - 8, '−', 'sd-chu') + SD.chu(x + 4, y + 16, '+', 'sd-chu') + (nhan ? SD.chu(x + 6, y + 40, nhan, 'sd-mo') : ''),
    // còi dọc từ (x, y) dài d, + ở trên
    coi: (x, y, d, nhan) => {
      const m = y + d / 2;
      return SD.day(`${x},${y} ${x},${m - 8}`) + SD.day(`${x},${m + 8} ${x},${y + d}`) + `<path d="M${x - 14} ${m - 8}H${x + 14}M${x - 14} ${m + 8}H${x + 14}M${x - 10} ${m - 8}A12 12 0 0 1 ${x + 10} ${m - 8}" class="sd-net"/>`
        + SD.chu(x - 22, m - 8, '+', 'sd-pos') + (nhan ? SD.chu(x + 20, m + 4, nhan) : '');
    },
    // Khối có chân ghi tên: trai/phai = danh sách tên chân. Chân thứ i nằm ở y + 20 + 20·i; đầu dây trái ở x − 12, phải ở x + w + 12.
    khoi: (x, y, w, ten, trai = [], phai = []) => {
      const h = Math.max(trai.length, phai.length, 1) * 20 + 20;
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="sd-net sd-to"/>` + SD.chu(x + w / 2, y + h + 14, ten, 'sd-chu', 'middle');
      trai.forEach((t, i) => { const yy = y + 20 + i * 20; s += SD.day(`${x - 12},${yy} ${x},${yy}`) + SD.chu(x + 4, yy + 4, t, 'sd-mo'); });
      phai.forEach((t, i) => { const yy = y + 20 + i * 20; s += SD.day(`${x + w},${yy} ${x + w + 12},${yy}`) + SD.chu(x + w - 4, yy + 4, t, 'sd-mo', 'end'); });
      return s;
    },
    // Mạch một vòng: nguồn bên trái, các linh kiện xếp dọc bên phải từ trên xuống, nối tiếp.
    // cac: [['tro','220Ω'], ['led'], ['diode','1N4148'], ['tu','100µF',true], ['nut','S1'], ['motor'], ['dh','A'], ['ldr','quang trở'], ['zener','3.3V'], ['coi','còi']]
    // o.nguon: { tren: 'GPIO13', duoi: 'GND', ten: 'ESP32' } → vẽ khối chip thay cho pin. o.do: [i, 'V'] → vôn kế song song linh kiện thứ i.
    chuoi: (ap, cac, nhan, o = {}) => {
      const DAI = { tro: 60, ldr: 60, led: 40, diode: 50, zener: 50, tu: 50, nut: 50, motor: 36, dh: 36, coi: 44 };
      const X = 170, x0 = 60;
      let y = 40, s = o.mui || cac.some(c => c[0] === 'ldr') ? SD.mui : '', moc = [];
      cac.forEach(([k, n, cuc], i) => {
        const d = DAI[k] || 50;
        s += SD.day(`${X},${y - 10} ${X},${y}`);
        moc.push([y, y + d]);
        if (k === 'tro') s += SD.tro(X, y, d, n); else if (k === 'ldr') s += SD.ldr(X, y, d, n);
        else if (k === 'led') s += SD.led(X, y) + (n ? SD.chu(X + 26, y + 24, n) : '');
        else if (k === 'diode') s += SD.diode(X, y, d, n); else if (k === 'zener') s += SD.zener(X, y, d, n);
        else if (k === 'tu') s += SD.tu(X, y, d, n, cuc); else if (k === 'nut') s += SD.nut(X, y, d, n);
        else if (k === 'coi') s += SD.coi(X, y, d, n);
        else if (k === 'motor') s += SD.day(`${X},${y} ${X},${y + 2}`) + SD.motor(X, y + 18) + SD.day(`${X},${y + 34} ${X},${y + d}`) + (n ? SD.chu(X + 22, y + 22, n) : '');
        else if (k === 'dh') s += SD.day(`${X},${y} ${X},${y + 2}`) + SD.dongHo(X, y + 18, n || 'A') + SD.day(`${X},${y + 34} ${X},${y + d}`);
        y += d + 10;
      });
      const yb = y, H = yb + 26, ym = (30 + yb) / 2;
      s += SD.day(`${X},${yb - 10} ${X},${yb}`);
      if (o.nguon) {
        s += SD.hop(x0 - 40, ym - 40, 70, 80, o.nguon.ten || 'ESP32') + SD.day(`${x0 + 30},${ym - 24} ${x0 + 50},${ym - 24} ${x0 + 50},30 ${X},30 ${X},30`)
          + SD.day(`${x0 + 30},${ym + 24} ${x0 + 50},${ym + 24} ${x0 + 50},${yb} ${X},${yb}`)
          + SD.chu(x0 - 5, ym - 22, o.nguon.tren || 'GPIO', 'sd-mo', 'middle') + SD.chu(x0 - 5, ym + 32, o.nguon.duoi || 'GND', 'sd-mo', 'middle');
      } else {
        s += SD.pin(x0, ym, ap) + SD.day(`${x0},${ym} ${x0},30 ${X},30 ${X},30`) + SD.day(`${x0},${ym + 10} ${x0},${yb} ${X},${yb}`);
      }
      s += SD.day(`${X},30 ${X},30`);
      if (o.do) {
        const [i, chu] = o.do, [a, b] = moc[i], xm = X + 80;
        s += SD.cham(X, a - 5) + SD.cham(X, b + 5) + SD.day(`${X},${a - 5} ${xm},${a - 5} ${xm},${(a + b) / 2 - 16}`) + SD.dongHo(xm, (a + b) / 2, chu) + SD.day(`${xm},${(a + b) / 2 + 16} ${xm},${b + 5} ${X},${b + 5}`);
      }
      return SD.svg(o.rong || 300, H, s, nhan);
    },
    mui: '<defs><marker id="sd-mui" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker></defs>',
  };
  window.SD = SD;
})();

// Phác thảo bo đục lỗ (perfboard) cho chương Hàn: lưới pad đồng, linh kiện nằm giữa 2 pad, mối hàn, que đo, mũi hàn.
// Toạ độ theo ô pad [cột, hàng] tính từ 0. mat: 'duoi' = nhìn mặt hàn (lật bo) — trái/phải bị đảo so với mặt linh kiện.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = 22, L = 26;
  function ve(b, moTa) {
    const C = b.cot || 12, H = b.hang || 6, W = L * 2 + C * O, HH = 40 + H * O + (b.them_duoi || 0);
    const X = c => L + O / 2 + (b.mat === 'duoi' ? C - 1 - c : c) * O, Y = r => 30 + O / 2 + r * O;
    let s = `<rect x="${L - 8}" y="22" width="${C * O + 16}" height="${H * O + 16}" rx="4" class="pb-bo"/>`;
    for (let c = 0; c < C; c++) for (let r = 0; r < H; r++) s += `<circle cx="${X(c)}" cy="${Y(r)}" r="6" class="pb-pad"/><circle cx="${X(c)}" cy="${Y(r)}" r="2.2" class="pb-lo"/>`;
    s += `<text x="${L - 8}" y="14" class="pb-mat">${b.mat === 'duoi' ? 'MẶT HÀN (lật bo, nhìn từ dưới)' : 'MẶT LINH KIỆN (nhìn từ trên)'}</text>`;
    const tren = [], duoi = [];
    (b.items || []).forEach(it => {
      const P = q => ({ x: X(q[0]), y: Y(q[1]) });
      if (it.loai === 'tro' || it.loai === 'diode') {
        const a = P(it.a), k = P(it.b), mx = (a.x + k.x) / 2, my = (a.y + k.y) / 2, g = Math.atan2(k.y - a.y, k.x - a.x) * 180 / Math.PI, d = Math.hypot(k.x - a.x, k.y - a.y);
        if (b.mat === 'duoi') duoi.push(`<line x1="${a.x}" y1="${a.y}" x2="${k.x}" y2="${k.y}" class="pb-chan-mo"/>`);
        else duoi.push(`<g transform="rotate(${g} ${mx} ${my})"><line x1="${mx - d / 2}" y1="${my}" x2="${mx + d / 2}" y2="${my}" class="bb-chan"/><rect x="${mx - 17}" y="${my - 6}" width="34" height="12" rx="5" class="${it.loai === 'tro' ? 'bb-tro' : 'bb-d4007'}"/>${it.loai === 'diode' ? `<rect x="${mx + 9}" y="${my - 6}" width="4" height="12" class="bb-vach-bac"/>` : ''}</g>`);
        if (it.nhan) tren.push(`<text x="${mx}" y="${my - 11}" text-anchor="middle" class="bb-nhan">${esc(it.nhan)}</text>`);
      } else if (it.loai === 'led') {
        const a = P(it.a), k = P(it.b);
        if (b.mat !== 'duoi') duoi.push(`<circle cx="${(a.x + k.x) / 2}" cy="${(a.y + k.y) / 2}" r="11" style="fill:#E5372C;opacity:.9"/><text x="${a.x}" y="${a.y - 13}" text-anchor="middle" class="bb-cuc">+</text>`);
        if (it.nhan && b.mat !== 'duoi') tren.push(`<text x="${Math.max(a.x, k.x) + 14}" y="${a.y + 4}" class="bb-nhan">${esc(it.nhan)}</text>`);
      } else if (it.loai === 'day') {
        const pts = it.pts.map(P);
        (it.tren ? duoi : duoi).push(`<polyline points="${pts.map(q => `${q.x},${q.y}`).join(' ')}" class="${it.thiec ? 'pb-thiec' : 'pb-day'}" style="${it.mau ? `stroke:${it.mau}` : ''}"/>`);
      } else if (it.loai === 'moi') {
        const q = P(it.p);
        const lop = { dat: 'pb-moi', von: 'pb-moi-von', lanh: 'pb-moi-lanh' }[it.kieu || 'dat'] || 'pb-moi';
        tren.push(`<circle cx="${q.x}" cy="${q.y}" r="${it.kieu === 'von' ? 8.5 : 6.5}" class="${lop}"/>`);
      } else if (it.loai === 'cau') {
        const a = P(it.a), k = P(it.b);
        tren.push(`<path d="M${a.x} ${a.y} L${k.x} ${k.y}" class="pb-cau"/>`);
      } else if (it.loai === 'header') {
        const q = P(it.p);
        duoi.push(`<rect x="${q.x - O / 2 + 2}" y="${q.y - 7}" width="${it.n * O - 4}" height="14" rx="2" class="${b.mat === 'duoi' ? 'pb-header-mo' : 'pb-header'}"/>`);
        for (let i = 0; i < it.n; i++) duoi.push(`<rect x="${X(it.p[0] + i) - 2.5}" y="${q.y - 2.5}" width="5" height="5" class="bb-header"/>`);
      } else if (it.loai === 'que') {
        const q = P(it.p), m = it.mau === 'den' ? 'bb-que-den' : 'bb-que-do';
        tren.push(`<path d="M${q.x} ${q.y} L${q.x + (it.dx || 30)} ${q.y + (it.dy || -34)}" class="${m}" style="stroke-width:3"/><circle cx="${q.x}" cy="${q.y}" r="3.5" class="${m}-dau"/>`);
      } else if (it.loai === 'mohan') {
        const q = P(it.p);
        tren.push(`<path d="M${q.x} ${q.y} L${q.x + 60} ${q.y - 46}" class="pb-mohan"/><path d="M${q.x + 60} ${q.y - 46} L${q.x + 110} ${q.y - 84}" class="pb-mohan-tay"/><circle cx="${q.x}" cy="${q.y}" r="4" class="pb-mui"/>`);
      } else if (it.loai === 'chu') {
        const q = P(it.p);
        tren.push(`<text x="${q.x + (it.dx || 0)}" y="${q.y + (it.dy || 0)}" text-anchor="${it.neo || 'middle'}" class="${it.xau ? 'bb-xau' : 'bb-ghichu'}">${esc(it.t)}</text>`);
      } else if (it.loai === 'khoanh') {
        const q = P(it.p);
        tren.push(`<circle cx="${q.x}" cy="${q.y}" r="${it.r || 13}" class="pb-khoanh"/>`);
      }
    });
    s += duoi.join('') + tren.join('');
    return `<svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="${esc(moTa || 'Phác thảo bo đục lỗ')}" class="pb">${s}</svg>`;
  }
  window.PB = { ve };
})();
