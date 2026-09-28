// Trang #/mo-phong: ghép mạch trên breadboard (vẽ bằng Board.ve), giải bằng MoPhong (mo-phong.js).
// Mạch đang ghép lưu localStorage của người xem; chia sẻ bằng link chứa cả mạch trong hash.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KHOA = 'banrap.mo-phong';
  const TRO = ['10', '100', '150', '220', '330', '470', '1k', '2.2k', '4.7k', '10k', '20k', '47k', '100k', '1M'];
  const MAU_LED = { do: '#E5372C', xanhla: '#2FA84F', vang: '#E8B90C', xanhduong: '#2F6FE0', trang: '#F2F2F2' };
  const TEN_LED = { do: 'đỏ', xanhla: 'xanh lá', vang: 'vàng', xanhduong: 'xanh dương', trang: 'trắng' };
  const TEN_DAY = { vang: 'vàng', do: 'đỏ', den: 'đen', xanh: 'xanh', cam: 'cam', tim: 'tím' };
  const TU = ['104 (gốm)', '10µF', '100µF', '470µF', '1000µF'];
  // goi: lời nhắc cho từng lần bấm; 1 lần bấm = linh kiện nhiều chân tự trải theo hàng.
  const CU = {
    day: { ten: 'Dây nhảy', goi: ['đầu thứ nhất', 'đầu thứ hai'] },
    tro: { ten: 'Điện trở', goi: ['chân 1', 'chân 2'] },
    led: { ten: 'LED', goi: ['chân dài (+, anode)', 'chân ngắn (−, cathode)'] },
    bientro: { ten: 'Biến trở 10k', goi: ['lỗ chân A — W ở lỗ thứ 3, B ở lỗ thứ 5 cùng hàng'] },
    ldr: { ten: 'Quang trở', goi: ['chân 1', 'chân 2'] },
    diode: { ten: 'Diode', goi: ['anode', 'cathode (đầu có vạch)'] },
    tu: { ten: 'Tụ', goi: ['chân + (chân dài; tụ gốm không cực)', 'chân −'] },
    npn: { ten: 'S8050', goi: ['lỗ chân E — B, C ở 2 lỗ kế tiếp (mặt chữ quay xuống)'] },
    nut: { ten: 'Nút nhấn', goi: ['lỗ hàng e — nút vắt qua rãnh, rộng 3 cột'] },
    motor: { ten: 'Motor', goi: ['dây 1', 'dây 2'] },
    pin: { ten: 'Hộp pin', goi: ['lỗ cho dây đỏ (+)', 'lỗ cho dây đen (−)'] },
    xoa: { ten: 'Xoá', goi: ['lỗ có chân linh kiện cần rút'] },
  };
  const docLuu = () => { try { return JSON.parse(localStorage.getItem(KHOA) || 'null'); } catch (_) { return null; } };
  const ghiLuu = v => { try { localStorage.setItem(KHOA, JSON.stringify(v)); } catch (_) { /* chế độ riêng tư: bỏ qua */ } };
  const b64 = { ma: o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    giai: s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))) };
  const soMa = x => (Math.abs(x) >= 1 ? x.toFixed(2) + 'A' : Math.abs(x) >= 1e-3 ? (x * 1e3).toFixed(1) + 'mA' : (x * 1e6).toFixed(0) + 'µA');

  // Mạch lấy từ bài học: bỏ phần chỉ để vẽ (khung vàng, dấu X, chú thích, số đồng hồ ghi sẵn).
  function tuBai(items) {
    const dh = items.find(i => i.loai === 'dh');
    return {
      items: items.filter(i => !['dh', 'cam', 'nhan'].includes(i.loai)).map(({ moi, sang, ...i }) => i),
      dh: dh ? { che_do: dh.che_do, cong: dh.cong === 'mA' ? 'mA' : dh.cong === '10A' ? '10A' : 'VΩ', do_: dh.do_, den: dh.den } : null,
    };
  }

  function mo(app, vao) {
    const luu = docLuu();
    const S = {
      cot: 30, items: [], dh: { che_do: 'DCV 20', cong: 'VΩ', do_: null, den: null },
      cu: 'day', tham: { tro: '220', led: 'do', day: 'vang', diode: '4148', tu: '100µF' },
      cho: [], que: null, hover: null, loi: '', daDoOm: false, hoiPin: false, dem: 0, nguon: '',
    };
    const nap = v => { if (!v) return; S.items = v.items || []; if (v.dh) S.dh = { ...S.dh, ...v.dh }; S.cot = Math.max(30, v.cot || 30); S.nguon = v.nguon || ''; };
    nap(vao || luu);
    const idMoi = k => { let id; do id = k + (++S.dem); while (S.items.some(i => i.id === id)); return id; };
    const pinIt = () => S.items.find(i => i.loai === 'pin');

    app.innerHTML = `<section class="dau"><p class="eyebrow">Mô phỏng · chạy trong trình duyệt</p><h1>Ghép mạch thử</h1>
      <p class="lede">Cắm linh kiện vào breadboard, lắp pin, cầm que đo. Web tính áp và dòng từng chỗ, báo <b>nóng / bốc khói</b> khi nối sai. Thử ở đây trước, rồi mới ráp thật.</p>
      <p class="mo">Mô hình gần đúng (pin 4.78V, LED/transistor theo công thức chuẩn). Số trên mạch thật sẽ lệch chút ít, và <b>vẫn phải đo Ω trước khi lắp pin</b> như mọi bài. Mới có linh kiện Phần 1; ESP32 và module chưa mô phỏng.${S.nguon ? ` · Đang mở: ${esc(S.nguon)}` : ''}</p></section>
      <div class="mp">
        <div class="mp-cu to" role="toolbar" aria-label="Linh kiện để cắm">${Object.entries(CU).map(([k, c]) => `<button type="button" data-cu="${k}">${c.ten}</button>`).join('')}</div>
        <div class="mp-tham" id="mp-tham"></div>
        <div class="mp-ban to"><div class="cuon" id="mp-svg"></div>
          <p class="mp-goi" id="mp-goi" aria-live="polite"></p>
          <form class="mp-go" id="mp-go"><label for="mp-lo">Hoặc gõ lỗ</label><input id="mp-lo" placeholder="12d · T+:5 · pin+" autocomplete="off" spellcheck="false"><button type="submit">Chọn lỗ</button></form></div>
        <aside class="mp-ben">
          <section class="to mp-khoi"><h3>Hộp pin</h3><div id="mp-pin"></div></section>
          <section class="to mp-khoi"><h3>Đồng hồ vạn năng</h3>
            <div class="mp-lcd" id="mp-lcd" aria-live="polite">—</div>
            <div class="mp-hang"><label>Núm <select id="mp-thang">${Object.keys(MoPhong.THANG).map(t => `<option${t === S.dh.che_do ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
              <label>Que đỏ ở lỗ <select id="mp-cong">${['VΩ', 'mA', '10A'].map(t => `<option${t === S.dh.cong ? ' selected' : ''}>${t}</option>`).join('')}</select></label></div>
            <p class="do-nut"><button type="button" data-que="do">Đặt que đỏ</button><button type="button" data-que="den">Đặt que đen</button><button type="button" data-que="">Cất que</button></p>
            <p class="mo" id="mp-que"></p></section>
          <section class="to mp-khoi" id="mp-canh-khung"><h3>Cảnh báo</h3><ul class="mp-canh" id="mp-canh"></ul></section>
          <section class="to mp-khoi"><h3>Trên board</h3><ul class="mp-ds" id="mp-ds"></ul>
            <p class="do-nut"><button type="button" id="mp-link">Chép link chia sẻ</button><button type="button" id="mp-xoa">Xoá hết</button></p><p class="mo" id="mp-tb"></p></section>
        </aside>
      </div>`;
    const $ = id => document.getElementById(id);
    let sim = MoPhong.tao(dsSim());

    function dsSim() {
      const d = S.dh;
      return d.do_ && d.den ? [...S.items, { id: 'dh', loai: 'dh', ...d }] : S.items;
    }
    // Đổi cấu trúc mạch: giải lại, lưu, và bắt đo Ω lại trước khi lắp pin.
    function doi(giuOm) {
      if (!giuOm) S.daDoOm = false;
      sim.lai(dsSim());
      ghiLuu({ items: S.items, dh: S.dh, cot: S.cot });
      veDs(); ve();
    }

    const chanCam = it => (it.loai === 'pin' ? [it.cong, it.tru] : Object.values(Board.chan(it)));
    const oLo = ref => S.items.find(it => chanCam(it).includes(ref));
    const giua = it => {
      if (it.loai === 'pin') { const P = Board.PIN(); return { x: P.x + P.w / 2, y: P.y + P.h / 2 }; }
      if (it.loai === 'ngoai') return { x: it.x != null ? it.x : 300, y: 420 };
      const ps = chanCam(it).map(Board.lo);
      return { x: ps.reduce((t, p) => t + p.x, 0) / ps.length, y: ps.reduce((t, p) => t + p.y, 0) / ps.length - (it.loai === 'bientro' ? 26 : 0) };
    };

    // Đo Ω đúng 2 tiếp điểm hộp pin khi hộp rỗng = đã "đo trước khi cấp điện".
    const nutQue = r => { const p = pinIt(); if (!r || !p) return null; return MoPhong.nutLo(r === 'pin+' ? p.cong : r === 'pin-' ? p.tru : r); };
    function ghiDoOm() {
      const p = pinIt(), d = S.dh;
      if (!p || p.trang_thai === 'day' || !/^Ω/.test(d.che_do) || d.cong !== 'VΩ' || !d.do_ || !d.den) return;
      if ([nutQue(d.do_), nutQue(d.den)].sort().join() === [MoPhong.nutLo(p.cong), MoPhong.nutLo(p.tru)].sort().join()) S.daDoOm = true;
    }

    function ve() {
      ghiDoOm();
      const kq = sim.kq || { lk: {}, canh: [], chay: new Set() };
      const items = dsSim().map(it => {
        if (it.loai === 'dh') return { ...it, hien: kq.dh ? kq.dh.hien : '' };
        return it;
      });
      let svg = Board.ve({ cot: S.cot, items }, 'Breadboard đang ghép');
      let lop = '';
      S.items.forEach(it => {
        const o = kq.lk[it.id] || {}, g = giua(it);
        if (it.loai === 'led' && o.sang > 0.02) lop += `<circle cx="${g.x}" cy="${g.y}" r="${12 + 16 * o.sang}" style="fill:${MAU_LED[it.mau || 'do']};opacity:${(0.2 + 0.55 * o.sang).toFixed(2)}" class="mp-sang"/>`;
        if (it.loai === 'ngoai' && o.quay) lop += `<g class="mp-quay" style="transform-origin:${g.x}px ${g.y}px"><path d="M${g.x - 30} ${g.y}a30 30 0 0 1 30 -30" class="mp-quay-net"/><path d="M${g.x + 30} ${g.y}a30 30 0 0 1 -30 30" class="mp-quay-net"/></g>`;
        if (kq.chay.has(it.id) || o.muc === 'chay') lop += `<g class="mp-khoi-hinh"><circle cx="${g.x}" cy="${g.y - 10}" r="9"/><circle cx="${g.x + 8}" cy="${g.y - 22}" r="11"/><circle cx="${g.x - 4}" cy="${g.y - 36}" r="13"/></g><text x="${g.x + 16}" y="${g.y - 30}" class="mp-khoi-chu">KHÓI</text>`;
        else if (o.muc === 'nong') lop += `<circle cx="${g.x}" cy="${g.y}" r="18" class="mp-nong"/>`;
      });
      S.cho.forEach(r => { const p = Board.lo(r); lop += `<circle cx="${p.x}" cy="${p.y}" r="7" class="mp-cho"/>`; });
      if (S.hover && !/^pin/.test(S.hover)) {
        const p = Board.lo(S.hover);
        if (p.thanh) lop += `<line x1="84" y1="${p.y}" x2="${84 + (S.cot - 1) * 20}" y2="${p.y}" class="mp-thong"/>`;
        else { const ys = p.nua === 'tren' ? [90, 162] : [206, 278]; lop += `<rect x="${p.x - 7}" y="${ys[0] - 7}" width="14" height="${ys[1] - ys[0] + 14}" rx="4" class="mp-thong"/>`; }
        lop += `<circle cx="${p.x}" cy="${p.y}" r="6" class="mp-tro"/>`;
      }
      svg = svg.replace(/<\/svg>$/, `<g class="mp-lop">${lop}</g></svg>`);
      $('mp-svg').innerHTML = svg;
      veBen(kq);
    }

    function veBen(kq) {
      const p = pinIt(), co = p && p.trang_thai === 'day';
      $('mp-pin').innerHTML = !p ? '<p class="mo">Chưa có hộp pin. Chọn <b>Hộp pin</b> rồi bấm 2 lỗ: dây đỏ, dây đen.</p>'
        : `<p>${co ? `<span class="pill canh">đã lắp pin · 4.78V</span> dòng ra ${soMa(Math.abs((kq.lk.pin || {}).I || 0))}` : '<span class="pill mo">hộp rỗng · không có điện</span>'}</p>
          ${S.hoiPin && !co ? `<div class="mp-hoi"><p><b>Chưa đo Ω</b> giữa 2 tiếp điểm hộp pin từ lần sửa mạch cuối. Luật của mọi bài: đo trước, số không được gần 0.</p>
            <p class="do-nut"><button type="button" id="mp-doom">Đặt que vào hộp pin (Ω 200k)</button><button type="button" id="mp-vanlap">Vẫn lắp pin</button></p></div>` : ''}
          <p class="do-nut"><button type="button" id="mp-pinbtn">${co ? 'Tháo pin' : 'Lắp pin'}</button></p>`;
      const d = S.dh;
      $('mp-lcd').textContent = kq.dh ? kq.dh.hien : '—';
      $('mp-que').innerHTML = `Que đỏ: <b>${esc(d.do_ || 'chưa đặt')}</b> · que đen: <b>${esc(d.den || 'chưa đặt')}</b>${kq.chay.has('dh:cauchi') ? ' · <b class="xau-chu">cầu chì đứt</b> <button type="button" id="mp-cauchi" class="mp-nho">Thay cầu chì</button>' : ''}`;
      document.querySelectorAll('[data-que]').forEach(b => b.setAttribute('aria-pressed', String(S.que === b.dataset.que && !!b.dataset.que)));
      const canh = [...(kq.loi ? [{ muc: 'chay', chu: kq.loi }] : []), ...kq.canh].sort((a, b) => ['chay', 'nong', 'tin'].indexOf(a.muc) - ['chay', 'nong', 'tin'].indexOf(b.muc));
      const omTat = S.daDoOm && kq.dh && /^Ω/.test(d.che_do) && kq.dh.hien !== '1' && +kq.dh.hien < 0.1 && d.che_do === 'Ω 200k';
      if (omTat) canh.unshift({ muc: 'chay', chu: 'Đo Ω giữa 2 tiếp điểm hộp pin ra <b>gần 0</b>: đang có chỗ nối tắt. <b>Không lắp pin</b>, tìm dây/chân nối thẳng từ + về −.' });
      $('mp-canh').innerHTML = canh.length ? canh.map(c => `<li class="mp-${c.muc}">${c.chu}</li>`).join('') : '<li class="mo">Không có gì bất thường.</li>';
      $('mp-canh-khung').classList.toggle('co-chay', canh.some(c => c.muc === 'chay'));
      document.querySelectorAll('#mp-ds [data-so]').forEach(n => { n.textContent = soDong(n.dataset.so, kq); });
      const c = CU[S.cu];
      $('mp-goi').innerHTML = S.loi ? `<b class="xau-chu">${S.loi}</b>` : S.que ? `Bấm chỗ đặt <b>que ${S.que === 'do' ? 'đỏ' : 'đen'}</b>: một lỗ, hoặc tiếp điểm trong hộp pin.`
        : `<b>${c.ten}:</b> bấm ${c.goi[S.cho.length]}.${S.hover ? ` · Lỗ <b>${esc(S.hover)}</b>${apLo(S.hover, kq)}` : ''}`;
    }
    const apLo = (ref, kq) => { if (!kq.apTai) return ''; const v = kq.apTai(ref); return v == null || !pinIt() ? '' : ` = ${v.toFixed(2)}V so với cực − pin`; };

    function soDong(id, kq) {
      const o = kq.lk[id], it = S.items.find(i => i.id === id);
      if (kq.chay.has(id)) return 'đã cháy — hở mạch';
      if (!o || !it) return '';
      if (it.loai === 'npn') return `Ic ${soMa(o.I)} · Vce ${o.Vce.toFixed(2)}V`;
      if (it.loai === 'tu') return `${(o.U || 0).toFixed(2)}V`;
      if (it.loai === 'day' || it.loai === 'pin') return o.I > 1e-4 ? soMa(Math.abs(o.I)) : '';
      return `${soMa(Math.abs(o.I))}${o.P > 0.005 ? ` · ${o.P.toFixed(2)}W` : ''}`;
    }

    function tenIt(it) {
      switch (it.loai) {
        case 'day': return `Dây ${TEN_DAY[it.mau] || ''} ${it.tu} → ${it.den}`;
        case 'tro': return `${it.nhan} ${it.p.join('–')}`;
        case 'led': return `${it.nhan || 'LED'} +${it.a} −${it.k}`;
        case 'bientro': return `Biến trở A${it.A} W${it.W} B${it.B}`;
        case 'ldr': return `Quang trở ${it.p.join('–')}`;
        case 'diode': return `${it.nhan || 'Diode'} ${it.a}→${it.k}`;
        case 'tu': return `Tụ ${it.nhan}${it.kieu === 'gom' ? '' : ` +${it.p[0]} −${it.p[1]}`}`;
        case 'npn': return `S8050 E${it.e} B${it.b} C${it.c}`;
        case 'nut': return `Nút ${it.nhan || ''} ${it.o}`;
        case 'ngoai': return `${it.nhan || it.kieu} ${Object.values(it.chan).join('–')}`;
        case 'pin': return `Hộp pin + ${it.cong} · − ${it.tru}`;
        default: return `${it.ten || it.loai} (chưa mô phỏng)`;
      }
    }
    function veDs() {
      $('mp-ds').innerHTML = S.items.length ? S.items.map(it => `<li data-id="${esc(it.id)}"><div><b>${esc(tenIt(it))}</b> <span class="mo" data-so="${esc(it.id)}"></span></div>
        ${it.loai === 'bientro' ? `<label class="mp-truot">W sát B <input type="range" min="0" max="100" value="${Math.round((it.vi_tri != null ? it.vi_tri : 0.5) * 100)}" data-vitri="${esc(it.id)}" aria-label="Vặn biến trở"> sát A</label>` : ''}
        ${it.loai === 'ldr' ? `<label class="mp-truot">tối <input type="range" min="0" max="100" value="${Math.round((it.sang_moi != null ? it.sang_moi : 0.6) * 100)}" data-sang="${esc(it.id)}" aria-label="Độ sáng chiếu vào quang trở"> sáng</label>` : ''}
        ${it.loai === 'nut' ? `<button type="button" class="mp-nho" data-nhan="${esc(it.id)}" aria-pressed="${!!it.nhan_xuong}">${it.nhan_xuong ? 'Đang nhấn giữ — bấm để nhả' : 'Nhấn giữ'}</button>` : ''}
        <button type="button" class="mp-nho mp-bo" data-bo="${esc(it.id)}" aria-label="Rút ${esc(tenIt(it))}">Rút</button></li>`).join('') : '<li class="mo">Board trống.</li>';
    }

    function veTham() {
      document.querySelectorAll('[data-cu]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cu === S.cu)));
      const t = S.tham, sel = (k, ds, ten) => `<label>${ten} <select data-tham="${k}">${ds.map(([v, n]) => `<option value="${esc(v)}"${String(t[k]) === String(v) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
      $('mp-tham').innerHTML = {
        tro: sel('tro', TRO.map(v => [v, v + 'Ω']), 'Giá trị'),
        led: sel('led', Object.entries(TEN_LED), 'Màu'),
        day: sel('day', Object.entries(TEN_DAY), 'Màu dây'),
        diode: sel('diode', [['4148', '1N4148 (tín hiệu)'], ['4007', '1N4007 (nguồn)']], 'Loại'),
        tu: sel('tu', TU.map(v => [v, v]), 'Loại'),
      }[S.cu] || '';
    }

    // Bấm một lỗ (hoặc tiếp điểm hộp pin): đặt que, rút linh kiện, hoặc cắm chân.
    function bam(ref) {
      S.loi = '';
      if (S.que) {
        S.dh[S.que === 'do' ? 'do_' : 'den'] = ref; S.que = S.que === 'do' && !S.dh.den ? 'den' : null;
        return doi(true);
      }
      if (/^pin/.test(ref)) { S.loi = 'Tiếp điểm hộp pin chỉ để đặt que đo.'; return ve(); }
      if (S.cu === 'xoa') { const it = oLo(ref); if (!it) { S.loi = `Lỗ ${ref} không có chân nào.`; return ve(); } return rut(it.id); }
      const o = oLo(ref);
      if (o) { S.loi = `Lỗ ${ref} đã có chân của ${tenIt(o)}. Mỗi lỗ chỉ cắm 1 chân.`; return ve(); }
      if (S.cho.includes(ref)) { S.cho = []; return ve(); }
      const can = CU[S.cu].goi.length;
      S.cho.push(ref);
      if (S.cho.length < can) return ve();
      const [a, b] = S.cho; S.cho = [];
      const it = taoIt(a, b);
      if (typeof it === 'string') { S.loi = it; return ve(); }
      const trung = chanCam(it).find(r => oLo(r));
      if (trung) { S.loi = `Lỗ ${trung} đã có chân linh kiện khác.`; return ve(); }
      if (it.loai === 'pin') S.items = S.items.filter(i => i.loai !== 'pin');
      S.items.push(it);
      const cc = chanCam(it).map(MoPhong.nutLo);
      if (cc.length === 2 && cc[0] === cc[1] && it.loai !== 'day') S.loi = `Chú ý: 2 chân cùng một dải thông nhau — breadboard đang nối tắt ${tenIt(it)}.`;
      doi();
    }

    function taoIt(a, b) {
      const pa = Board.lo(a), t = S.tham;
      const hang = (c, lech) => { const m = /^(\d+)([a-j])$/.exec(a); if (!m) return null; const cc = +m[1] + lech; return cc <= S.cot ? cc + m[2] : null; };
      switch (S.cu) {
        case 'day': return K.day(idMoi('d'), a, b, t.day);
        case 'tro': return K.tro(idMoi('r'), [a, b], t.tro);
        case 'led': return K.led(idMoi('led'), a, b, t.led);
        case 'ldr': return { id: idMoi('ldr'), loai: 'ldr', p: [a, b], nhan: 'quang trở', sang_moi: 0.6 };
        case 'diode': return { id: idMoi('d'), loai: 'diode', kieu: t.diode, a, k: b, nhan: '1N' + t.diode };
        case 'tu': return t.tu.startsWith('104') ? { id: idMoi('c'), loai: 'tu', kieu: 'gom', p: [a, b], nhan: '100nF' } : { id: idMoi('c'), loai: 'tu', p: [a, b], nhan: t.tu };
        case 'motor': return { id: idMoi('m'), loai: 'ngoai', kieu: 'motor', x: 300 + 110 * S.items.filter(i => i.loai === 'ngoai').length, chan: { 1: a, 2: b }, mau: ['do', 'den'], nhan: 'motor' };
        case 'pin': return { id: 'pin', loai: 'pin', cong: a, tru: b, trang_thai: 'rong' };
        case 'bientro': { if (pa.thanh) return 'Biến trở cắm vào hàng a–j, không cắm vào thanh nguồn.'; const W = hang(0, 2), B = hang(0, 4); return W && B ? { id: idMoi('bt'), loai: 'bientro', A: a, W, B, vi_tri: 0.5 } : 'Không đủ chỗ: cần 5 cột tính từ lỗ này.'; }
        case 'npn': { if (pa.thanh) return 'Transistor cắm vào hàng a–j.'; const B = hang(0, 1), C = hang(0, 2); return B && C ? { id: idMoi('q'), loai: 'npn', e: a, b: B, c: C } : 'Không đủ chỗ: cần 3 cột tính từ lỗ này.'; }
        case 'nut': { if (!/^\d+e$/.test(a)) return 'Nút nhấn vắt qua rãnh giữa: bấm một lỗ ở hàng e.'; return +a.slice(0, -1) + 2 <= S.cot ? { id: idMoi('n'), loai: 'nut', o: a } : 'Không đủ chỗ bên phải.'; }
      }
      return 'Chưa hỗ trợ.';
    }

    function rut(id) {
      S.items = S.items.filter(i => i.id !== id);
      sim.boChay(id);
      doi();
    }

    // Lỗ gần con trỏ nhất trong bán kính 11 (khoảng cách 2 lỗ là 18–20).
    function loGan(ev) {
      const svg = $('mp-svg').querySelector('svg'); if (!svg) return null;
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const q = pt.matrixTransform(svg.getScreenCTM().inverse());
      if (pinIt()) for (const r of ['pin+', 'pin-']) { const p = Board.diem(r, {}); if (Math.hypot(p.x - q.x, p.y - q.y) < 16) return r; }
      const c = Math.round((q.x - 84) / 20) + 1;
      if (c < 1 || c > S.cot) return null;
      let best = null, d = 11;
      [...Object.keys(Board.THANH).map(t => `${t}:${c}`), ...Object.keys(Board.HANG).map(h => c + h)].forEach(r => {
        const p = Board.lo(r), k = Math.hypot(p.x - q.x, p.y - q.y); if (k < d) { d = k; best = r; }
      });
      return best;
    }

    const hop = $('mp-svg');
    hop.addEventListener('click', ev => { const r = loGan(ev); if (r) bam(r); });
    let henHover = 0;
    hop.addEventListener('pointermove', ev => {
      if (henHover) return;
      henHover = requestAnimationFrame(() => { henHover = 0; const r = loGan(ev); if (r !== S.hover) { S.hover = r; ve(); } });
    });
    hop.addEventListener('pointerleave', () => { S.hover = null; ve(); });
    $('mp-go').addEventListener('submit', ev => {
      ev.preventDefault();
      const r = $('mp-lo').value.trim().replace(/^([tb])([+-])/i, (_, a, b) => a.toUpperCase() + b);
      try { if (!/^pin[+-]$/.test(r)) Board.lo(r); bam(r); $('mp-lo').value = ''; } catch (_) { S.loi = `"${esc(r)}" không phải lỗ. Ví dụ: 12d, T+:5, B-:3, pin+.`; ve(); }
    });

    app.querySelector('.mp').addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.cu) { S.cu = b.dataset.cu; S.cho = []; S.que = null; S.loi = ''; veTham(); return ve(); }
      if (b.dataset.que != null) {
        if (b.dataset.que) { S.que = b.dataset.que; S.cho = []; return ve(); }
        S.que = null; S.dh.do_ = S.dh.den = null; return doi(true);
      }
      if (b.dataset.bo) return rut(b.dataset.bo);
      if (b.dataset.nhan) { const it = S.items.find(i => i.id === b.dataset.nhan); it.nhan_xuong = !it.nhan_xuong; sim.lai(dsSim()); veDs(); return ve(); }
      const p = pinIt();
      switch (b.id) {
        case 'mp-pinbtn':
          if (p.trang_thai === 'day') { p.trang_thai = 'rong'; sim.boChay('pin:'); S.hoiPin = false; return doi(true); }
          if (!S.daDoOm) { S.hoiPin = true; return ve(); }
          p.trang_thai = 'day'; return doi(true);
        case 'mp-vanlap': S.hoiPin = false; p.trang_thai = 'day'; return doi(true);
        case 'mp-doom': Object.assign(S.dh, { che_do: 'Ω 200k', cong: 'VΩ', do_: 'pin+', den: 'pin-' }); $('mp-thang').value = 'Ω 200k'; $('mp-cong').value = 'VΩ'; S.hoiPin = false; return doi(true);
        case 'mp-cauchi': sim.boChay('dh:cauchi'); return doi(true);
        case 'mp-xoa': S.items = []; S.dh.do_ = S.dh.den = null; S.cho = []; sim = MoPhong.tao([]); return doi();
        case 'mp-link': {
          const url = location.href.split('#')[0] + '#/mo-phong/m/' + b64.ma({ items: S.items, dh: S.dh, cot: S.cot });
          const bao = t => { $('mp-tb').textContent = t; };
          (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => bao('Đã chép link. Ai mở link sẽ thấy đúng mạch này.'), () => bao(url));
          return;
        }
      }
    });
    app.querySelector('.mp').addEventListener('input', ev => {
      const t = ev.target;
      if (t.dataset.vitri) { S.items.find(i => i.id === t.dataset.vitri).vi_tri = t.value / 100; sim.lai(dsSim()); ghiLuu({ items: S.items, dh: S.dh, cot: S.cot }); return ve(); }
      if (t.dataset.sang) { S.items.find(i => i.id === t.dataset.sang).sang_moi = t.value / 100; sim.lai(dsSim()); return ve(); }
    });
    app.querySelector('.mp').addEventListener('change', ev => {
      const t = ev.target;
      if (t.dataset.tham) { S.tham[t.dataset.tham] = t.value; return; }
      if (t.id === 'mp-thang') { S.dh.che_do = t.value; return doi(true); }
      if (t.id === 'mp-cong') { S.dh.cong = t.value; return doi(true); }
    });

    // Tụ tích/xả theo thời gian thật; mạch không có tụ thì không cần vòng lặp.
    let truoc = performance.now(), veLuc = 0;
    function chay(now) {
      if (!document.body.contains(hop)) return;
      const dt = Math.min(0.1, (now - truoc) / 1000); truoc = now;
      if (sim.coTu()) { sim.buoc(dt); if (now - veLuc > 90) { veLuc = now; ve(); } }
      requestAnimationFrame(chay);
    }
    requestAnimationFrame(chay);

    veTham(); veDs(); ve();
    if (vao) ghiLuu({ items: S.items, dh: S.dh, cot: S.cot });
  }

  window.MoPhongTrang = { mo, tuBai, b64 };
})();
