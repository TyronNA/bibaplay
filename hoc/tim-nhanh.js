// Tìm nhanh (nút kính lúp ở đầu trang, phím "/" hoặc Ctrl/⌘K): linh kiện ra kèm hình, bài học ra kèm số bài.
// So khớp bỏ dấu ("nhip" ra "Nhíp") vì người xem hay gõ không dấu trên điện thoại.
// Danh sách bài lấy từ BAI.ds() của app.js; trang 404 không có app.js → chỉ tìm linh kiện.
(function () {
  const L = window.LINHKIEN;
  if (!L) return;
  const chuan = s => String(s || '').replace(/<[^>]*>/g, ' ').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().replace(/[–—]/g, '-');
  const goc = () => (window.LUU ? LUU.goc : '/');

  // Điểm: trùng đầu tên > đầu một từ trong tên > đầu một từ trong từ khoá/nhóm. Mọi từ gõ vào phải khớp đâu đó.
  // Chỉ khớp đầu từ: bỏ dấu rồi thì "han" nằm giữa "chan" (chân). Chuỗi có số ("4007") thì cho khớp giữa từ (1N4007).
  function diem(tu, ten, phu) {
    let d = 0;
    for (const t of tu) {
      const dauTu = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), giua = /\d/.test(t);
      if (ten.startsWith(t)) d += 6;
      else if (dauTu.test(ten)) d += 4;
      else if (giua && ten.includes(t)) d += 3;
      else if (dauTu.test(phu) || (giua && phu.includes(t))) d += 1;
      else return 0;
    }
    return d;
  }
  // Gõ có dấu mà khớp đúng dấu ("kẹp") thì xếp trên chỗ chỉ khớp khi bỏ dấu ("kép").
  const tuCua = s => new Set(s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  const dungDau = (q, tu) => [...tuCua(q)].every(t => tu.has(t)) ? 5 : 0;
  const chiMuc = L.ds.map(l => ({ l, ten: chuan(l.ten), tho: tuCua([l.ten, l.khac].join(' ')), phu: chuan([l.tim, l.khac, L.loai[l.loai], l.id].join(' ')) }));
  function tim(q) {
    const tu = chuan(q).split(/\s+/).filter(Boolean), qTho = q.toLowerCase();
    if (!tu.length) return { lk: [], bai: [] };
    const lk = chiMuc.map(x => { const d = diem(tu, x.ten, x.phu); return { l: x.l, d: d && d + dungDau(qTho, x.tho) }; })
      .filter(x => x.d).sort((a, b) => b.d - a.d).map(x => x.l);
    const ds = window.BAI && BAI.ds ? BAI.ds() : [];
    const bai = ds.map(b => ({ b, d: diem(tu, chuan(`${b.id} ${b.ten}`), chuan(`${b.chuong.ten} ${b.lam} ${b.thay}`)) }))
      .filter(x => x.d).sort((a, b) => b.d - a.d).map(x => x.b);
    return { lk, bai };
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const boThe = s => String(s).replace(/<[^>]*>/g, '').replace(/[*`]/g, '');

  // ——— hộp tìm ở đầu trang ———
  const nut = document.getElementById('nut-tim');
  let hop, o, ds, chon = -1;
  function taoHop() {
    hop = document.createElement('dialog');
    hop.className = 'tim-hop to';
    hop.setAttribute('aria-label', 'Tìm linh kiện, bài học');
    hop.innerHTML = `<form method="dialog" class="tim-dau"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>
      <input type="search" id="tim-o" placeholder="Tìm linh kiện, dụng cụ, bài… (vd: nhíp, tụ, mosfet, 2.3)" autocomplete="off" spellcheck="false" aria-controls="tim-ds">
      <button type="submit" class="tim-dong" aria-label="Đóng">Esc</button></form>
      <div id="tim-ds" class="tim-ds" role="listbox"></div>`;
    document.body.appendChild(hop);
    o = hop.querySelector('#tim-o'); ds = hop.querySelector('#tim-ds');
    o.addEventListener('input', ve);
    o.addEventListener('keydown', e => {
      const a = [...ds.querySelectorAll('a')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        chon = a.length ? (chon + (e.key === 'ArrowDown' ? 1 : -1) + a.length) % a.length : -1;
        a.forEach((x, i) => x.toggleAttribute('aria-selected', i === chon));
        if (a[chon]) a[chon].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        (a[chon] || a[0])?.click();
      }
    });
    // Bấm kết quả: app.js bắt click link nội bộ (pushState) — chỉ cần đóng hộp. Bấm ra nền tối cũng đóng.
    ds.addEventListener('click', e => { if (e.target.closest('a')) hop.close(); });
    hop.addEventListener('click', e => { if (e.target === hop) hop.close(); });
  }
  function ve() {
    const q = o.value.trim(), kq = tim(q);
    chon = -1;
    if (!q) { ds.innerHTML = `<p class="tim-goi">Gõ tên món (có dấu hay không đều được), tên tiếng Anh, hoặc số bài.</p>
      <div class="tim-nhom-nhanh">${Object.entries(L.loai).map(([k, t]) => `<a href="${goc()}linh-kien/#loai-${k}" data-loai="${k}">${esc(t)}</a>`).join('')}</div>`; return; }
    if (!kq.lk.length && !kq.bai.length) { ds.innerHTML = `<p class="tim-goi">Không thấy "${esc(q)}".</p>`; return; }
    ds.innerHTML = (kq.lk.length ? `<p class="tim-nhan">Linh kiện · ${kq.lk.length}</p><ul class="tim-lk">${kq.lk.slice(0, 24).map(l => `
      <li><a href="${goc()}linh-kien/${l.id}/" role="option"><span class="tim-hinh">${l.anh}</span><span class="tim-chu"><b>${l.ten}</b><span class="mo">${esc(L.loai[l.loai] || '')}</span></span></a></li>`).join('')}</ul>` : '')
      + (kq.bai.length ? `<p class="tim-nhan">Bài học · ${kq.bai.length}</p><ul class="tim-bai">${kq.bai.slice(0, 12).map(b => `
      <li><a href="${goc()}bai/${b.id}/" role="option"><span class="id">${b.id}</span><span class="tim-chu"><b>${esc(boThe(b.ten))}</b><span class="mo">${esc(boThe(b.chuong.ten))}</span></span></a></li>`).join('')}</ul>` : '');
  }
  function mo() {
    if (!hop) taoHop();
    if (hop.open) return;
    hop.showModal();
    o.select(); ve();
  }
  if (nut) {
    nut.hidden = false;
    nut.addEventListener('click', mo);
    document.addEventListener('keydown', e => {
      const dangGo = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
      if ((e.key === '/' && !dangGo && !e.metaKey && !e.ctrlKey && !e.altKey) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault(); mo();
      }
    });
  }

  // Link nhóm trong hộp tìm (/linh-kien/#loai-x): app.js vẽ lại trang rồi cuộn lên đầu → cuộn tới nhóm sau khi vẽ.
  // Hash không phải route (route là đường dẫn thật), chỉ là chỗ cần cuộn tới.
  function cuonToiNhom() {
    const m = /^#loai-([\w-]+)$/.exec(location.hash);
    const el = m && document.getElementById(`loai-${m[1]}`);
    if (el) el.scrollIntoView();
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-loai]');
    if (!a) return;
    const k = a.dataset.loai;
    setTimeout(() => { history.replaceState(null, '', `${location.pathname}#loai-${k}`); cuonToiNhom(); }, 0);
  });

  // ——— lọc tại chỗ trên trang thư viện (app.js gọi sau khi vẽ) ———
  function ganThuVien(goc) {
    const o = goc.querySelector('#lk-loc'), dem = goc.querySelector('#lk-dem');
    if (!o) return;
    const the = [...goc.querySelectorAll('.lk-the[data-id]')], nhom = [...goc.querySelectorAll('section[data-loai]')];
    const loc = () => {
      const q = o.value.trim(), khop = q ? new Set(tim(q).lk.map(l => l.id)) : null;
      the.forEach(t => { t.hidden = !!khop && !khop.has(t.dataset.id); });
      nhom.forEach(s => { s.hidden = !!khop && !s.querySelector('.lk-the:not([hidden])'); });
      dem.textContent = khop ? `${khop.size} món khớp` : '';
    };
    o.addEventListener('input', loc);
    goc.querySelectorAll('[data-toi]').forEach(b => b.addEventListener('click', () => {
      o.value = ''; loc();
      const el = goc.querySelector(`#loai-${b.dataset.toi}`);
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', `${location.pathname}#loai-${b.dataset.toi}`); }
    }));
    cuonToiNhom();
  }

  window.TIM = { tim, chuan, ganThuVien };
})();
