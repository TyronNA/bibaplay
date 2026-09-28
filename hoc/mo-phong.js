// Mô phỏng mạch trên breadboard: cùng dữ liệu items như Board.ve (board.js), giải bằng phân tích nút (MNA)
// + Newton cho LED/diode/transistor, tụ theo thời gian bằng Euler lùi. Chạy được cả trong Node để test.
//
// Mô hình cố ý đơn giản — đủ để thấy đúng hướng và đúng cỡ số, KHÔNG thay việc đo trên mạch thật:
//   pin 3×AAA = 4.78V (số đo ở bài 2.3) nối tiếp 0.45Ω; dây nhảy 0.02Ω; LED/diode theo phương trình Shockley;
//   S8050 theo Ebers–Moll (β≈200, không có hiệu ứng Early); motor quạt = 15Ω; loa = 8Ω.
//   Thanh nguồn coi như liền cả chiều dài (có loại MB-102 đứt ở giữa — bài học đã dặn cắm nửa trái).
(function () {
  const VT = 0.02585, GMIN = 1e-9;
  const PIN = { V: 4.78, R: 0.45 };
  // Is, n cho Vf ≈ số trong datasheet ở vài mA. LED: đỏ ~1.8V, vàng ~1.95V, xanh lá ~2.1V, xanh dương/trắng ~2.9V.
  const LED = { do: [2.8e-18, 2], vang: [6e-19, 2], xanhla: [1.2e-19, 2], xanhduong: [1e-26, 2], trang: [1e-26, 2] };
  const DIODE = { '4148': [2.5e-9, 1.9], '4007': [7e-9, 1.8] };
  const NPN = { Is: 1e-14, bf: 200, br: 5 };
  // Ngưỡng: vượt "nong" = cảnh báo nóng; vượt "chay" = bốc khói, linh kiện coi như hở mạch từ đó (phải thay).
  const NGUONG = {
    tro: { P: [0.25, 0.75] },          // điện trở 1/4W
    bientro: { P: [0.1, 0.5] },        // RM065 ~0.1W
    ldr: { P: [0.1, 0.3] },
    led: { I: [0.03, 0.08] },
    diode4148: { I: [0.2, 0.5] }, diode4007: { I: [1, 3] },
    npn: { I: [0.5, 1], P: [0.625, 1.2] },
    day: { I: [2, 1e9] },
  };

  // Lỗ → tên nút điện. 5 lỗ a–e của một cột thông nhau, f–j thông nhau; mỗi thanh nguồn là một nút.
  function nutLo(ref) {
    let m = /^([TB][+-]):\d+$/.exec(ref);
    if (m) return m[1];
    m = /^(\d+)([a-j])$/.exec(ref);
    if (m) return 'c' + m[1] + ('abcde'.includes(m[2]) ? 't' : 'd');
    throw new Error('Lỗ không hợp lệ: ' + ref);
  }

  // Số cuối cùng có đơn vị trong chuỗi: "R1 10k" → 10000, "220Ω" → 220, "100µF" → 1e-4.
  function soTro(s) {
    const ms = [...String(s || '').matchAll(/(\d+(?:\.\d+)?)\s*([kKM]?)\s*(?:Ω|ohm|$|\s)/g)];
    if (!ms.length) return null;
    const m = ms[ms.length - 1];
    return +m[1] * ({ k: 1e3, K: 1e3, M: 1e6 }[m[2]] || 1);
  }
  function soTu(s) {
    const m = /(\d+(?:\.\d+)?)\s*(µ|u|n|p)F/.exec(String(s || ''));
    return m ? +m[1] * { µ: 1e-6, u: 1e-6, n: 1e-9, p: 1e-12 }[m[2]] : null;
  }
  // GL5528: ~15k ở 10 lux, gamma ≈ 0.6; tối hẳn ~1MΩ.
  const troLdr = sang => Math.min(1e6, Math.max(200, 15e3 * Math.pow(Math.pow(10, -1 + 5 * sang) / 10, -0.6)));

  const TEN = { day: 'Dây nhảy', tro: 'Điện trở', led: 'LED', bientro: 'Biến trở', ldr: 'Quang trở', diode: 'Diode', npn: 'Transistor S8050', tu: 'Tụ', nut: 'Nút nhấn', ngoai: 'Motor' };
  const tenLk = it => it.nhan || TEN[it.loai] || it.id;

  function pnjlim(vnew, vold, vt, vcrit) {
    if (vnew > vcrit && Math.abs(vnew - vold) > 2 * vt) {
      if (vold > 0) { const a = 1 + (vnew - vold) / vt; return a > 0 ? vold + vt * Math.log(a) : vcrit; }
      return vt * Math.log(vnew / vt);
    }
    return vnew;
  }

  // Đồng hồ: que đỏ = do_, que đen = den. Lỗ cắm que đỏ (cong): VΩ (mặc định), mA (cầu chì 200mA), 10A.
  const THANG = {
    'DCV 2': { loai: 'V', max: 1.999, so: 3 }, 'DCV 20': { loai: 'V', max: 19.99, so: 2 },
    'DCA 20m': { loai: 'A', max: 0.01999, nhan: 1e3, so: 2 }, 'DCA 200m': { loai: 'A', max: 0.1999, nhan: 1e3, so: 1 },
    'DCA 10A': { loai: 'A', max: 19.99, so: 2 },
    'Ω 200': { loai: 'O', max: 199.9, so: 1 }, 'Ω 2k': { loai: 'O', max: 1999, nhan: 1e-3, so: 3 },
    'Ω 20k': { loai: 'O', max: 19990, nhan: 1e-3, so: 2 }, 'Ω 200k': { loai: 'O', max: 199900, nhan: 1e-3, so: 1 },
    'diode ▶|': { loai: 'D', max: 1.999, so: 3 }, 'thông mạch': { loai: 'T', max: 199.9, so: 1 },
  };
  const THU_O = { V: 2.8 };
  const loCong = dh => (dh.cong === 'mA' ? 'mA' : dh.cong === '10A' ? '10A' : 'VΩ');

  function lapMach(items, trangThai) {
    const ten = new Map(), els = [], canh = [];
    const id = n => { if (!ten.has(n)) ten.set(n, ten.size + 1); return ten.get(n); };
    const theoId = {};
    items.forEach(i => { if (i.id) theoId[i.id] = i; });
    const chanCua = (it) => {
      switch (it.loai) {
        case 'tro': case 'ldr': return { 1: it.p[0], 2: it.p[1] };
        case 'led': case 'diode': return { A: it.a, K: it.k };
        case 'bientro': return { A: it.A, W: it.W, B: it.B };
        case 'day': return { 1: it.tu, 2: it.den };
        case 'tu': return { P: it.p[0], N: it.p[1] };
        case 'npn': return { E: it.e, B: it.b, C: it.c };
        case 'nut': { const m = /^(\d+)([a-j])$/.exec(it.o), c2 = +m[1] + (it.rong || 2); return { 1: it.o, 2: c2 + 'e', 3: m[1] + 'f', 4: c2 + 'f' }; }
        case 'ngoai': return it.chan;
        default: return {};
      }
    };
    const diem = ref => {
      if (ref === 'pin+' || ref === 'pin-') { const p = items.find(i => i.loai === 'pin'); return p ? nutLo(ref === 'pin+' ? p.cong : p.tru) : null; }
      const m = /^([\w-]+)\.(\w+)$/.exec(ref);
      if (m && theoId[m[1]]) return nutLo(chanCua(theoId[m[1]])[m[2]]);
      return nutLo(ref);
    };
    const chay = it => trangThai.chay.has(it.id);
    const R = (it, a, b, r, phan) => els.push({ k: 'R', it, a: id(a), b: id(b), R: r, phan });

    let pin = null;
    items.forEach(it => {
      if (chay(it)) return;
      const c = chanCua(it), n = k => nutLo(c[k]);
      switch (it.loai) {
        case 'day': R(it, n(1), n(2), 0.02); break;
        case 'tro': { let r = it.R || soTro(it.nhan); if (!r) { r = 1e3; canh.push({ muc: 'tin', it, chu: `${it.id}: không đọc được giá trị, coi là 1kΩ` }); } R(it, n(1), n(2), r); break; }
        case 'ldr': R(it, n(1), n(2), troLdr(it.sang_moi != null ? it.sang_moi : 0.6)); break;
        case 'bientro': {
          // vi_tri: 0 = con trượt sát B, 1 = sát A. Đầu dải than còn vài ôm, không bao giờ đúng 0.
          const RT = it.R || 1e4, x = it.vi_tri != null ? it.vi_tri : 0.5;
          R(it, n('A'), n('W'), Math.max(2, RT * (1 - x)), 'AW'); R(it, n('W'), n('B'), Math.max(2, RT * x), 'WB'); break;
        }
        case 'led': { const [Is, nn] = LED[it.mau || 'do'] || LED.do; els.push({ k: 'D', it, a: id(n('A')), b: id(n('K')), Is, n: nn }); break; }
        case 'diode': { const [Is, nn] = DIODE[it.kieu === '4007' ? '4007' : '4148']; els.push({ k: 'D', it, a: id(n('A')), b: id(n('K')), Is, n: nn }); break; }
        case 'npn': els.push({ k: 'Q', it, c: id(n('C')), b: id(n('B')), e: id(n('E')) }); break;
        case 'tu': {
          const C = it.C || soTu(it.nhan) || (it.kieu === 'gom' ? 1e-7 : 1e-5);
          els.push({ k: 'C', it, a: id(n('P')), b: id(n('N')), C, v: trangThai.tu[it.id] || 0 }); break;
        }
        case 'nut':
          // 1–3 và 2–4 luôn thông (vắt qua rãnh giữa); nhấn thì nối 2 cặp.
          R(it, n(1), n(3), 0.05); R(it, n(2), n(4), 0.05);
          if (it.nhan_xuong) R(it, n(1), n(2), 0.1, 'nhan');
          break;
        case 'ngoai':
          if (it.kieu === 'motor' || it.kieu === 'loa') R(it, nutLo(it.chan[1]), nutLo(it.chan[2]), it.kieu === 'loa' ? 8 : 15);
          else canh.push({ muc: 'tin', it, chu: `${it.id}: loại này chưa mô phỏng` });
          break;
        case 'pin':
          if (it.trang_thai === 'day') { pin = { it, a: id(nutLo(it.cong)), b: id(nutLo(it.tru)) }; els.push({ k: 'V', ...pin, V: PIN.V, R: PIN.R }); }
          else { id(nutLo(it.cong)); id(nutLo(it.tru)); }
          break;
        case 'esp': case 'mod': canh.push({ muc: 'tin', it, chu: `${it.ten || it.id}: ESP32/module chưa mô phỏng — thử code trên Wokwi` }); break;
      }
    });

    let dh = items.find(i => i.loai === 'dh' && i.do_ && i.den);
    if (dh) {
      const a = diem(dh.do_), b = diem(dh.den), th = THANG[dh.che_do] || THANG['DCV 20'], cong = loCong(dh);
      if (a && b) {
        const e = { k: 'M', it: dh, a: id(a), b: id(b), th, cong };
        if (cong === 'mA') { if (!trangThai.chay.has('dh:cauchi')) Object.assign(e, { R: th.max < 0.03 ? 10 : 1 }); else e.R = 1e12; }
        else if (cong === '10A') e.R = 0.01;
        else if (th.loai === 'V' || th.loai === 'A') e.R = 1e7;
        else { e.R = th.loai === 'D' ? 2800 : th.loai === 'T' ? 1000 : Math.max(1000, th.max); e.V = THU_O.V; }
        els.push(e);
      } else dh = null;
    }
    // Đất (0V) = cực − của pin nếu có hộp pin, không thì nút đầu tiên.
    const pinIt = items.find(i => i.loai === 'pin');
    const dat = pinIt ? id(nutLo(pinIt.tru)) : 1;
    return { ten, els, canh, dat, pin, dh, diem };
  }

  function giaiTuyen(n, G, b) {
    for (let k = 0; k < n; k++) {
      let p = k, mx = Math.abs(G[k][k]);
      for (let i = k + 1; i < n; i++) if (Math.abs(G[i][k]) > mx) { mx = Math.abs(G[i][k]); p = i; }
      if (mx < 1e-18) return null;
      if (p !== k) { [G[k], G[p]] = [G[p], G[k]]; [b[k], b[p]] = [b[p], b[k]]; }
      for (let i = k + 1; i < n; i++) {
        const f = G[i][k] / G[k][k];
        if (!f) continue;
        for (let j = k; j < n; j++) G[i][j] -= f * G[k][j];
        b[i] -= f * b[k];
      }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= G[i][j] * x[j]; x[i] = s / G[i][i]; }
    return x;
  }

  // Một lần giải: dt = null → DC (tụ hở); dt > 0 → một bước Euler lùi từ điện áp tụ đang lưu.
  function newton(m, dt, V0) {
    const N = m.ten.size, dat = m.dat;
    // Chỉ số hàng: nút 1..N trừ nút đất.
    const hang = new Map(); let k = 0;
    for (let i = 1; i <= N; i++) if (i !== dat) hang.set(i, k++);
    const n = k;
    let V = V0 && V0.length === N + 1 ? V0.slice() : new Array(N + 1).fill(0);
    const v = i => (i === dat ? 0 : V[i]);
    const jn = m.els.filter(e => e.k === 'D' || e.k === 'Q');
    jn.forEach(e => { if (e.k === 'D') e.vd = e.vd != null ? e.vd : v(e.a) - v(e.b); else { e.vbe = e.vbe != null ? e.vbe : v(e.b) - v(e.e); e.vbc = e.vbc != null ? e.vbc : v(e.b) - v(e.c); } });
    for (let lan = 0; lan < 200; lan++) {
      const G = Array.from({ length: n }, () => new Array(n).fill(0)), b = new Array(n).fill(0);
      const g2 = (a, c, g) => { const ia = hang.get(a), ic = hang.get(c); if (ia != null) G[ia][ia] += g; if (ic != null) G[ic][ic] += g; if (ia != null && ic != null) { G[ia][ic] -= g; G[ic][ia] -= g; } };
      const bi = (a, x) => { const i = hang.get(a); if (i != null) b[i] += x; };
      const gj = (r, c, g) => { const i = hang.get(r), j = hang.get(c); if (i != null && j != null) G[i][j] += g; };
      for (let i = 0; i < n; i++) G[i][i] += GMIN;
      let hoiTu = true;
      m.els.forEach(e => {
        switch (e.k) {
          case 'R': g2(e.a, e.b, 1 / e.R); break;
          case 'V': g2(e.a, e.b, 1 / e.R); bi(e.a, e.V / e.R); bi(e.b, -e.V / e.R); break;
          case 'M': g2(e.a, e.b, 1 / e.R); if (e.V) { bi(e.a, e.V / e.R); bi(e.b, -e.V / e.R); } break;
          case 'C': if (dt) { const g = e.C / dt; g2(e.a, e.b, g); bi(e.a, g * e.v); bi(e.b, -g * e.v); } break;
          case 'D': {
            const nvt = e.n * VT, vc = nvt * Math.log(nvt / (Math.SQRT2 * e.Is));
            const moi = v(e.a) - v(e.b), vd = pnjlim(moi, e.vd, nvt, vc);
            if (Math.abs(vd - moi) > 1e-9) hoiTu = false;
            e.vd = vd;
            const ex = Math.exp(Math.min(vd / nvt, 80)), id = e.Is * (ex - 1), g = e.Is / nvt * ex + GMIN;
            g2(e.a, e.b, g); bi(e.a, -(id - g * vd)); bi(e.b, id - g * vd); break;
          }
          case 'Q': {
            const { Is, bf, br } = NPN, vc = VT * Math.log(VT / (Math.SQRT2 * Is));
            const mbe = v(e.b) - v(e.e), mbc = v(e.b) - v(e.c);
            const vbe = pnjlim(mbe, e.vbe, VT, vc), vbc = pnjlim(mbc, e.vbc, VT, vc);
            if (Math.abs(vbe - mbe) > 1e-9 || Math.abs(vbc - mbc) > 1e-9) hoiTu = false;
            e.vbe = vbe; e.vbc = vbc;
            const ebe = Math.exp(Math.min(vbe / VT, 80)), ebc = Math.exp(Math.min(vbc / VT, 80));
            const ic = Is * (ebe - ebc) - Is / br * (ebc - 1), ib = Is / bf * (ebe - 1) + Is / br * (ebc - 1);
            const dcBe = Is / VT * ebe, dcBc = -Is / VT * ebc - Is / (br * VT) * ebc;
            const dbBe = Is / (bf * VT) * ebe + GMIN, dbBc = Is / (br * VT) * ebc + GMIN;
            // dòng chảy VÀO linh kiện ở từng chân, tuyến tính hoá theo vbe = Vb−Ve, vbc = Vb−Vc
            [[e.c, ic, dcBe, dcBc], [e.b, ib, dbBe, dbBc], [e.e, -ic - ib, -dcBe - dbBe, -dcBc - dbBc]].forEach(([t, i0, a, c]) => {
              gj(t, e.b, a + c); gj(t, e.e, -a); gj(t, e.c, -c); bi(t, -(i0 - a * vbe - c * vbc));
            });
            break;
          }
        }
      });
      const x = giaiTuyen(n, G, b);
      if (!x) return null;
      let lech = 0;
      for (const [i, r] of hang) { lech = Math.max(lech, Math.abs(x[r] - V[i])); V[i] = x[r]; }
      V[dat] = 0;
      if (hoiTu && lech < 1e-7 + 1e-6 * Math.max(...V.map(Math.abs))) return V;
    }
    return null;
  }

  function hienSo(x, so, max) {
    if (!isFinite(x) || Math.abs(x) > max) return x < 0 ? '-1' : '1';
    return x.toFixed(so);
  }

  // Tính dòng/công suất từng linh kiện từ điện áp nút, rồi đối chiếu ngưỡng.
  function danhGia(m, V, trangThai) {
    const v = i => V[i] || 0, lk = {}, canh = [...m.canh], moiChay = [];
    const cong = (id, x) => { const o = lk[id] || (lk[id] = { I: 0, P: 0 }); o.I = Math.max(o.I, Math.abs(x.I)); o.P += x.P; if (x.phan) (o.phan = o.phan || {})[x.phan] = x; };
    let dh = null;
    m.els.forEach(e => {
      const u = v(e.a) - v(e.b);
      switch (e.k) {
        case 'R': cong(e.it.id, { I: u / e.R, P: u * u / e.R, phan: e.phan, U: u }); break;
        case 'D': { const i = e.Is * (Math.exp(Math.min(u / (e.n * VT), 80)) - 1); cong(e.it.id, { I: i, P: u * i, U: u }); break; }
        case 'C': cong(e.it.id, { I: 0, P: 0, U: u }); lk[e.it.id].U = u; break;
        case 'Q': {
          const { Is, bf, br } = NPN, vbe = v(e.b) - v(e.e), vbc = v(e.b) - v(e.c);
          const ebe = Math.exp(Math.min(vbe / VT, 80)), ebc = Math.exp(Math.min(vbc / VT, 80));
          const ic = Is * (ebe - ebc) - Is / br * (ebc - 1), ib = Is / bf * (ebe - 1) + Is / br * (ebc - 1);
          lk[e.it.id] = { I: Math.abs(ic), Ib: ib, P: ic * (v(e.c) - v(e.e)) + ib * vbe, Vce: v(e.c) - v(e.e), Vbe: vbe };
          break;
        }
        case 'V': { const i = (e.V - u) / e.R; lk[e.it.id] = { I: i, P: i * i * e.R, U: u }; break; }
        case 'M': {
          const th = e.th;
          let doc;
          if (e.cong !== 'VΩ') {
            const i = u / e.R;
            if (e.cong === 'mA' && Math.abs(i) > 0.25) { moiChay.push('dh:cauchi'); canh.push({ muc: 'chay', it: e.it, chu: `Đồng hồ: dòng ${(Math.abs(i)).toFixed(2)}A qua lỗ mA → <b>đứt cầu chì</b>. Que đỏ ở lỗ mA mà chạm 2 đầu pin/nguồn = nối tắt qua đồng hồ.` }); }
            doc = th.loai === 'A' ? hienSo(i * (th.nhan || 1), th.so, th.max * (th.nhan || 1)) : '0.00';
            if (th.loai !== 'A') canh.push({ muc: 'nong', it: e.it, chu: `Đồng hồ: que đỏ đang ở lỗ ${e.cong} nhưng núm ở ${e.it.che_do}. Trả que đỏ về VΩ.` });
          } else if (th.loai === 'V') doc = hienSo(u, th.so, th.max);
          else if (th.loai === 'A') doc = '0.00';
          else {
            const i = (e.V - u) / e.R, r = i > 1e-12 ? u / i : Infinity;
            if (th.loai === 'D') doc = u > 1.999 ? '1' : u.toFixed(3);
            else if (th.loai === 'T') doc = r < 50 ? `${hienSo(r, 1, 199.9)} bíp` : hienSo(r, 1, 199.9);
            else doc = r < 0 ? '-1' : hienSo(r * (th.nhan || 1), th.so, th.max * (th.nhan || 1));
            if (m.pin) canh.push({ muc: 'nong', it: e.it, chu: 'Đo Ω / diode / thông mạch khi mạch đang có pin: số sai, và có thể hỏng đồng hồ. Tháo pin rồi đo.' });
          }
          dh = { hien: doc, U: u };
          break;
        }
      }
    });
    Object.entries(lk).forEach(([id, o]) => {
      const it = m.els.find(e => e.it.id === id).it;
      let loai = it.loai === 'diode' ? 'diode' + (it.kieu === '4007' ? '4007' : '4148') : it.loai;
      const ng = NGUONG[loai];
      if (it.loai === 'bientro' && o.phan) o.P = Math.max(...Object.values(o.phan).map(p => p.P));
      if (it.loai === 'tu' && it.kieu !== 'gom' && o.U < -0.5) { o.muc = 'nong'; canh.push({ muc: 'nong', it, chu: `${it.nhan || 'Tụ hoá'} đang bị <b>ngược cực</b> (${o.U.toFixed(2)}V): tụ hoá có thể phồng, xì. Tháo pin, đảo chiều tụ.` }); }
      if (it.loai === 'pin') {
        if (o.I > 1) { o.muc = 'chay'; canh.push({ muc: 'chay', it, chu: `<b>Pin đang bị nối tắt</b>: ${o.I.toFixed(1)}A. Ngoài đời pin nóng lên nhanh, dây có thể cháy. Tháo pin ngay, tìm đường nối thẳng từ + về −.` }); }
        else if (o.I > 0.2) { o.muc = 'nong'; canh.push({ muc: 'nong', it, chu: `Pin đang cấp ${(o.I * 1e3).toFixed(0)}mA — quá nhiều cho mạch học. Kiểm có chỗ nào thiếu điện trở không.` }); }
        return;
      }
      if (!ng) return;
      const vuot = (k, i) => ng[k] && o[k] > ng[k][i];
      if (vuot('I', 1) || vuot('P', 1)) {
        o.muc = 'chay'; moiChay.push(id);
        canh.push({ muc: 'chay', it, chu: `<b>${tenLk(it)} bốc khói</b> (${o.I < 1 ? (o.I * 1e3).toFixed(0) + 'mA' : o.I.toFixed(2) + 'A'}, ${o.P.toFixed(2)}W). Tháo pin, không sờ tới khi nguội; linh kiện đã bốc khói thì bỏ — xoá rồi cắm cái mới.` });
      } else if (vuot('I', 0) || vuot('P', 0)) {
        o.muc = 'nong';
        canh.push({ muc: 'nong', it, chu: `${tenLk(it)} đang <b>nóng</b> (${o.I < 1 ? (o.I * 1e3).toFixed(0) + 'mA' : o.I.toFixed(2) + 'A'}, ${o.P.toFixed(2)}W). Tháo pin, kiểm có thiếu điện trở hạn dòng không.` });
      }
      if (it.loai === 'led') o.sang = o.I > 5e-5 ? Math.min(1, Math.log10(o.I / 5e-5) / Math.log10(0.02 / 5e-5)) : 0;
      if (it.loai === 'ngoai') o.quay = o.I > 0.03;
    });
    return { lk, canh, moiChay, dh };
  }

  const coId = items => items.map((it, i) => (it.id ? it : { ...it, id: '_' + i }));

  // Mạch mô phỏng có trạng thái (tụ đang tích bao nhiêu, cái gì đã cháy). Đổi mạch → gọi lai(items).
  function tao(items) {
    const tt = { tu: {}, chay: new Set(), loiChay: {} };
    let m, V = null, kq = null, t = 0;
    const coTu = () => m.els.some(e => e.k === 'C');
    function lai(moi) { items = coId(moi); t = 0; m = lapMach(items, tt); V = null; return tinh(null); }
    function tinh(dt) {
      for (let lan = 0; lan < 6; lan++) {
        let Vn = newton(m, dt, V);
        if (!Vn && dt) Vn = newton(m, dt / 10, V);
        if (!Vn) return (kq = { loi: 'Mạch không giải được (không hội tụ). Thử bỏ bớt linh kiện vừa cắm.', lk: {}, canh: m.canh, V: {} });
        const dg = danhGia(m, Vn, tt);
        if (dg.moiChay.length) {
          dg.moiChay.forEach(id => { tt.chay.add(id); const c = dg.canh.find(x => x.muc === 'chay' && (x.it.id === id || id === 'dh:cauchi')); if (c) tt.loiChay[id] = c; });
          // Pin nối tắt cũng được báo ở lần giải đầu, trước khi linh kiện cháy thành hở mạch.
          dg.canh.filter(x => x.muc === 'chay' && x.it.loai === 'pin').forEach(c => { tt.loiChay['pin:' + c.it.id] = c; });
          m = lapMach(items, tt); V = null; continue;
        }
        dg.canh = [...Object.values(tt.loiChay), ...dg.canh];
        V = Vn;
        if (dt) m.els.forEach(e => { if (e.k === 'C') { e.v = (V[e.a] || 0) - (V[e.b] || 0); tt.tu[e.it.id] = e.v; } });
        const ap = {}; m.ten.forEach((i, ten) => { ap[ten] = V[i] || 0; });
        kq = { ...dg, V: ap, t, chay: new Set(tt.chay), apTai: ref => { try { const n = m.diem(ref); return n != null ? ap[n] || 0 : null; } catch (_) { return null; } } };
        return kq;
      }
      return kq;
    }
    function buoc(giay) {
      if (!coTu()) return kq;
      // Euler lùi bước 2ms: đủ mịn cho RC ≥ ~10ms của các bài tụ; bước dài hơn thì chia nhỏ.
      const n = Math.min(50, Math.max(1, Math.ceil(giay / 0.002))), dt = giay / n;
      for (let i = 0; i < n; i++) { tinh(dt); t += dt; }
      if (kq) kq.t = t;
      return kq;
    }
    // Xoá linh kiện cháy / thay cầu chì: quên luôn cảnh báo cũ của nó.
    function boChay(id) { tt.chay.delete(id); delete tt.loiChay[id]; Object.keys(tt.loiChay).filter(k => k.startsWith('pin:')).forEach(k => delete tt.loiChay[k]); }
    items = coId(items); lai(items);
    return { lai, buoc, coTu, boChay, get kq() { return kq; }, get tt() { return tt; } };
  }

  const MoPhong = { tao, nutLo, soTro, soTu, THANG, PIN, troLdr };
  if (typeof module !== 'undefined') module.exports = MoPhong;
  else window.MoPhong = MoPhong;
})();
