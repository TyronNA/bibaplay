// Web tự học: danh sách bài lấy từ notes/giao-trinh-dien.md, chi tiết từng bài ở hoc/bai/<id>.js.
(function () {
  const { esc, dong } = MD;
  const app = document.getElementById('app');
  const S = { gt: null, soan: [], doText: '', bai: {}, route: '' };

  // Route là đường dẫn thật (/bai/2.3/), không phải hash: Google chỉ index được URL không có #.
  // LUU.goc: '/' trên web, '/hoc/' khi chạy local (server.py); <base href> trong index.html khớp với nó.
  const R = r => LUU.goc + (r ? r.replace(/\/?$/, '/') : '');
  const routeCua = pathname => decodeURIComponent(pathname.startsWith(LUU.goc) ? pathname.slice(LUU.goc.length) : pathname.replace(/^\//, '')).replace(/\/+$/, '');
  const LA_ROUTE = /^(|do|bai\/\d+\.\d+|linh-kien(\/[\w-]+)?|mo-phong(\/.*)?|(en\/)?xiaozhi|gioi-thieu|chinh-sach-rieng-tu)$/;

  // title + description + canonical + og: xuat-web.py chụp DOM sau khi render → mỗi trang tĩnh mang meta riêng.
  const bo = s => String(s).replace(/<[^>]*>/g, '').replace(/[*`]/g, '').replace(/\s+/g, ' ').trim();
  const cat = (s, n = 160) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
  // ld: dữ liệu có cấu trúc (schema.org) cho Google, ghi vào <script id="ld"> trong khối meta của index.html.
  const GOC_WEB = 'https://bibaplay.com';
  const vet = ds => ({ '@type': 'BreadcrumbList', itemListElement: ds.map(([ten, r], i) => ({ '@type': 'ListItem', position: i + 1, name: ten, item: GOC_WEB + R(r) })) });
  function datMeta(tieuDe, moTa, ld = []) {
    const url = (LUU.web ? GOC_WEB : location.origin) + R(S.route);
    const dat = (sel, v) => { const el = document.head.querySelector(sel); if (el) el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', v); };
    document.title = tieuDe;
    moTa = cat(bo(moTa));
    dat('meta[name="description"]', moTa); dat('meta[property="og:description"]', moTa);
    dat('meta[property="og:title"]', tieuDe); dat('meta[property="og:url"]', url); dat('link[rel="canonical"]', url);
    const el = document.getElementById('ld');
    // "<" thoát thành \u003c: chữ bài có thể chứa "</script>" và làm vỡ thẻ
    if (el) el.textContent = ld.length ? JSON.stringify({ '@context': 'https://schema.org', '@graph': ld }).replace(/</g, '\\u003c') : '';
  }

  // Video ráp thật (video.js). Chỉ nhận id YouTube 11 ký tự: link dán tay, sai dạng thì coi như chưa có video.
  function videoCua(id) {
    const v = window.VIDEO && VIDEO[id];
    const m = v && /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})(?![\w-])/.exec(v.link || '');
    return m ? { ...v, yt: m[1] } : null;
  }

  // ds: cho tìm nhanh (tim-nhanh.js) — rỗng tới khi giáo trình tải xong.
  window.BAI = { dangKy: b => { S.bai[b.id] = b; }, ds: () => (S.gt ? tatCaBai() : []) };

  async function taiChung() {
    const [gt, soan, doText] = await Promise.all([
      fetch(LUU.url('notes/giao-trinh-dien.md')).then(r => r.text()),
      LUU.dsBai(),
      fetch(LUU.url('notes/do-dang-co.md')).then(r => r.text()),
    ]);
    S.gt = MD.giaoTrinh(gt); S.soan = soan; datDo(doText); apTienDo();
  }

  // Bản web: ✅ / "đang ở đây" trong giáo trình là tiến độ của chủ repo → bỏ, lấy tiến độ riêng của người xem.
  function apTienDo() {
    if (!LUU.web) return;
    const td = LUU.tienDo();
    S.gt.chuong.forEach(c => c.bai.forEach(b => { b.xong = td[b.id] === 'xong'; b.dangO = td[b.id] === 'dang'; }));
  }

  // "Có" chỉ tính chỗ liệt kê đồ: cột Món của bảng + dòng "Dụng cụ:/Nguồn:/Khác:". Ghi chú kiểu
  // "ESP32-S3 44 pin cần ghép 2 cái" trong cột khác không được làm ESP32 thành "có".
  function datDo(t) {
    S.doMd = t;
    S.doText = t.split('\n').map(d => {
      if (/^\|/.test(d)) return d.split('|')[1] || '';
      return /^(Dụng cụ|Nguồn|Khác):/.test(d) ? d : '';
    }).join('\n').toLowerCase();
  }
  const coTim = tim => S.doText.includes(String(tim).toLowerCase());
  // Bản web: "có" theo danh sách người xem tự tick; món không có trong thư viện linh kiện → null (không biết).
  const coMon = (tim, l) => (LUU.web ? (l ? LUU.doCo().has(l.id) : null) : coTim(tim));

  // Nút mua (link affiliate trong mua.js); rel=sponsored theo quy định của Google cho link có hoa hồng.
  // Bản web đi qua /mua/<id> (worker.js đếm click vào D1 rồi chuyển sang Shopee); tu = trang bấm, để biết bài nào ra đơn.
  const linkMua = id => (LUU.web ? `${LUU.goc}mua/${id}?tu=${encodeURIComponent(S.route || 'chu')}` : MUA[id]);
  const nutMua = id => (window.MUA && MUA[id] ? `<a class="mua" href="${esc(linkMua(id))}" target="_blank" rel="sponsored nofollow noopener">Mua trên Shopee ↗</a>` : '');

  const tatCaBai = () => S.gt.chuong.flatMap(c => c.bai.map(b => ({ ...b, chuong: c })));

  function taiBai(id) {
    if (S.bai[id]) return Promise.resolve(S.bai[id]);
    return new Promise((ok, loi) => {
      const s = document.createElement('script');
      s.src = LUU.web ? `bai/${id}.js` : `bai/${id}.js?t=${Date.now()}`;
      s.onload = () => ok(S.bai[id]);
      s.onerror = loi;
      document.head.appendChild(s);
    });
  }

  function trangThai(b) {
    const rap = videoCua(b.id) ? '<span class="pill ok">đã ráp thật</span>' : '';
    if (b.xong) return rap + '<span class="pill ok">xong</span>';
    if (b.dangO) return rap + '<span class="pill dang">đang học</span>';
    if (S.soan.includes(b.id)) return rap || '<span class="pill soan">có hướng dẫn</span>';
    return '<span class="pill mo">chưa soạn</span>';
  }

  function khungAnToan() {
    return `<section class="antoan to"><h2>Ghi chú chung · an toàn, áp dụng cho mọi bài</h2><ol>${S.gt.xuyenSuot.map(x => `<li><span>${dong(x)}</span></li>`).join('')}</ol></section>`;
  }

  function trangChu() {
    datMeta('Bàn Ráp · học điện tử, robot, ESP32 trên breadboard', 'Giáo trình điện miễn phí bằng tiếng Việt cho người mới: đo đạc, định luật Ohm, tụ, diode, transistor, ESP32, motor, pin lithium tới robot. Mỗi bài có hình breadboard từng bước và bước đo Ω trước khi cấp điện.',
      [{ '@type': 'WebSite', name: 'Bàn Ráp', url: GOC_WEB + '/', inLanguage: 'vi' }]);
    app.innerHTML = `
      <section class="dau"><p class="eyebrow">Giáo trình điện · nghiêng về robot + nhúng</p>
      <h1>Học điện trên breadboard</h1>
      <p class="lede">Bài nào cũng đi theo một vòng: đoán trước bằng công thức, ráp khi chưa có pin, đo Ω rồi mới cấp điện, sau đó đo và so với số đã đoán.</p></section>
      ${khungAnToan()}
      ${Object.entries(S.gt.phan).map(([so, ph]) => `
      <section><h2><span class="so">Phần ${so}</span><span>${dong(ph.ten.replace(/\s*\(.*\)\s*$/, ''))}</span></h2>
      ${ph.dan.length ? `<div class="khung to dan-phan">${ph.dan.map(x => `<p>${dong(x)}</p>`).join('')}</div>` : ''}
      <div class="danh-muc">${S.gt.chuong.filter(c => String(c.phan) === so).map(c => `
        <div class="chuong to"><div class="dm-dau"><span class="so">${String(c.so).padStart(2, '0')}</span><h3>${dong(c.ten)}</h3>
          <span class="dem">${c.bai.filter(b => b.xong).length}/${c.bai.length} xong</span></div>
        <ol class="ds">${c.bai.map(b => `
          <li><a href="${R(`bai/${b.id}`)}" class="${b.dangO ? 'dang-o' : ''}">
            <span class="id">${b.id}</span><span class="ten">${dong(b.ten)}</span>${trangThai(b)}
          </a></li>`).join('')}</ol></div>`).join('')}</div></section>`).join('')}`;
  }

  const coLK = l => coMon(l.tim, l);
  // Các dòng bảng trong do-dang-co.md có cột "Món" chứa chuỗi tìm của linh kiện → [món, số lượng, ghi chú].
  const dongBang = (md, tim) => md.split('\n').filter(d => /^\|/.test(d) && !/^\|\s*-/.test(d))
    .map(d => d.split('|').slice(1, -1).map(c => c.trim())).filter(c => c[0] && c[0].toLowerCase().includes(tim.toLowerCase()));

  function trangDo() {
    datMeta('Đồ cần có để học điện tử · Bàn Ráp', 'Danh sách linh kiện và dụng cụ để học điện trên breadboard: tick món đang có, trang bài tự báo còn thiếu gì.');
    if (LUU.web) return trangDoWeb();
    fetch(LUU.url('notes/do-dang-co.md')).then(r => r.text()).then(t => {
      datDo(t);
      const co = LINHKIEN.ds.filter(coLK);
      app.innerHTML = `<section class="dau"><p class="eyebrow">Bộ đồ dùng cho giáo trình</p><h1>Đồ đang có</h1>
        <p class="lede">${co.length} loại đồ, mỗi món có hình. Bấm vào để xem cách nhận chân, giới hạn và bẫy trong <a href="${R(`linh-kien`)}">thư viện linh kiện</a>.</p></section>
        <section><h2>Hình từng món</h2><ul class="do-luoi">${co.map(l => {
          let dong = dongBang(t, l.tim);
          // món không nằm trong bảng (dụng cụ, nguồn): lấy nguyên câu chứa nó trong file md
          if (!dong.length) { const c = t.split('\n').find(d => d.toLowerCase().includes(l.tim.toLowerCase())); if (c) dong = [[c.replace(/^[-*]\s*/, '')]]; }
          return `<li><a class="to" href="${R(`linh-kien/${l.id}`)}"><figure>${l.anh}</figure>
            <div class="do-chu"><b>${l.ten}</b>${dong.map(c => `<span class="mo">${MD.dong(c[0])}${c[1] ? ` · <b class="sl">${MD.dong(c[1])}</b>` : ''}</span>`).join('')}</div></a></li>`;
        }).join('')}</ul></section>
        <section><h2>Bản gốc</h2><article class="md to">${MD.khoi(t)}</article></section>`;
    });
  }

  function trangDoWeb() {
    const co = LUU.doCo(), kitGoc = LINHKIEN.ds.filter(l => coTim(l.tim)).map(l => l.id);
    app.innerHTML = `<section class="dau"><p class="eyebrow">Lưu trong trình duyệt của bạn</p><h1>Đồ đang có</h1>
      <p class="lede">Tick món bạn đang có. Trang bài dựa vào đây để báo <b>có / thiếu</b> ở mục "Đồ cần". Danh sách chỉ nằm trên máy này, không gửi đi đâu.${window.MUA && Object.values(MUA).some(Boolean) ? ' Món chưa có thì bấm "Mua trên Shopee" ngay tại đây.' : ''}</p>
      <p class="do-nut"><button type="button" id="do-kit">Chọn theo bộ kit gốc (${kitGoc.length} món)</button> <button type="button" id="do-xoa">Bỏ hết</button> <span class="mo" id="do-dem"></span></p></section>
      ${Object.entries(LINHKIEN.loai).map(([k, ten]) => `<section><h2>${ten}</h2><ul class="do-luoi">${LINHKIEN.ds.filter(l => l.loai === k).map(l => `
        <li><label class="to do-chon" for="co-${l.id}"><figure>${l.anh}</figure>
          <div class="do-chu"><span><input type="checkbox" id="co-${l.id}" data-id="${l.id}"${co.has(l.id) ? ' checked' : ''}> <b>${l.ten}</b></span>
          <a href="${R(`linh-kien/${l.id}`)}" class="mo">cách nhận chân →</a>${nutMua(l.id)}</div></label></li>`).join('')}</ul></section>`).join('')}
      <section><h2>Bộ kit gốc</h2><p class="mo">Bộ đồ giáo trình này được soạn theo. Mua giống vậy thì các bài khớp số.</p><article class="md to">${MD.khoi(S.doMd)}</article></section>`;
    const hop = [...app.querySelectorAll('.do-chon input')];
    const luu = () => { const s = new Set(hop.filter(i => i.checked).map(i => i.dataset.id)); LUU.datDoCo(s); document.getElementById('do-dem').textContent = `Đang có ${s.size} món.`; };
    hop.forEach(i => i.addEventListener('change', luu));
    document.getElementById('do-kit').onclick = () => { hop.forEach(i => { i.checked = kitGoc.includes(i.dataset.id); }); luu(); };
    document.getElementById('do-xoa').onclick = () => { hop.forEach(i => { i.checked = false; }); luu(); };
    document.getElementById('do-dem').textContent = `Đang có ${co.size} món.`;
  }

  function trangLinhKien(chon) {
    const tatCa = tatCaBai();
    const tenBai = id => { const b = tatCa.find(x => x.id === id); return b ? `<a href="${R(`bai/${id}`)}">${id} ${dong(b.ten)}</a>` : id; };
    const the = l => `<article class="lk-the to${l.id === chon ? ' chon' : ''}" id="lk-${l.id}" data-id="${l.id}">
      <header><h3>${l.id === chon ? l.ten : `<a href="${R(`linh-kien/${l.id}`)}">${l.ten}</a>`}</h3>${coLK(l) ? '<span class="pill ok">có</span>' : `${l.mua && !LUU.web ? `<span class="pill mo">${l.mua.replace(/\s*·\s*\S+\.md$/, '')}</span>` : ''}<span class="pill xau">chưa có</span>`}${nutMua(l.id)}</header>
      <div class="lk-hinh${l.kh ? '' : ' mot'}"><figure>${l.anh}<figcaption>Hình minh hoạ</figcaption></figure>${l.kh ? `<figure>${l.kh}<figcaption>Ký hiệu trên sơ đồ</figcaption></figure>` : ''}</div>
      <dl class="lk-tt">
        <div><dt>Nhận chân / cực</dt><dd><ul>${l.chan.map(x => `<li>${x}</li>`).join('')}</ul></dd></div>
        ${l.gioi_han ? `<div><dt>Giới hạn</dt><dd>${l.gioi_han}</dd></div>` : ''}
        ${l.bay ? `<div class="bay-lk"><dt>Bẫy</dt><dd>${l.bay}</dd></div>` : ''}
        <div><dt>Dùng ở bài</dt><dd>${l.bai === null ? 'mọi bài' : l.bai.length ? l.bai.map(tenBai).join(' · ') : 'chưa có bài'}</dd></div>
      </dl></article>`;
    // /linh-kien/<id>/ là trang riêng của một món (mỗi món một URL để search ra), không phải cả thư viện cuộn tới món đó.
    const l = chon && LINHKIEN.theoId(chon);
    if (l) {
      const cungNhom = LINHKIEN.ds.filter(x => x.loai === l.loai && x.id !== l.id);
      datMeta(`${bo(l.ten)}: cách nhận chân, giới hạn, bẫy · Bàn Ráp`, `${l.ten}: ${l.chan.join(' ')}`,
        [vet([['Linh kiện', 'linh-kien'], [bo(l.ten), `linh-kien/${l.id}`]])]);
      app.innerHTML = `<section class="dau"><p class="eyebrow"><a href="${R('linh-kien')}">Thư viện linh kiện</a> · ${LINHKIEN.loai[l.loai]}</p><h1>${l.ten}</h1>
        <p class="lede">Hình minh hoạ có chú thích chân, ký hiệu trên sơ đồ, cách nhận chân và bẫy. Chỗ nào ghi <b>đo mới biết</b> thì phải đo trước khi ráp.</p></section>
        <div class="lk-luoi lk-mot">${the(l)}</div>
        ${cungNhom.length ? `<section><h2>Cùng nhóm · ${LINHKIEN.loai[l.loai]}</h2><ul class="tim-lk lk-cung">${cungNhom.map(x => `<li><a href="${R(`linh-kien/${x.id}`)}"><span class="tim-hinh">${x.anh}</span><span class="tim-chu"><b>${x.ten}</b></span></a></li>`).join('')}</ul></section>` : ''}
        <p><a href="${R('linh-kien')}">← Toàn bộ thư viện linh kiện</a></p>`;
      return;
    }
    datMeta('Thư viện linh kiện điện tử: nhận chân, ký hiệu, bẫy · Bàn Ráp', `${LINHKIEN.ds.length} linh kiện cho người mới học điện tử và robot: hình minh hoạ có chú thích chân, ký hiệu trên sơ đồ, giới hạn và bẫy hay gặp.`);
    app.innerHTML = `<section class="dau"><p class="eyebrow">Thư viện linh kiện · ${LINHKIEN.ds.length} món</p><h1>Linh kiện</h1>
      <p class="lede">Mỗi món có hình minh hoạ với chú thích chân, ký hiệu trên sơ đồ mạch, cách nhận chân và bẫy. Chỗ nào ghi <b>đo mới biết</b> là chỗ hình không dám vẽ chắc: phải đo trước khi ráp.</p></section>
      <div class="lk-cong to"><label class="lk-loc"><span>Lọc</span><input type="search" id="lk-loc" placeholder="tên, tiếng Anh, không dấu cũng được" autocomplete="off"></label><span class="mo" id="lk-dem"></span>
        <nav class="lk-chip" aria-label="Nhóm linh kiện">${Object.entries(LINHKIEN.loai).map(([k, ten]) => `<button type="button" data-toi="${k}">${ten} <span class="mo">${LINHKIEN.ds.filter(x => x.loai === k).length}</span></button>`).join('')}</nav></div>
      ${Object.entries(LINHKIEN.loai).map(([k, ten]) => `<section id="loai-${k}" data-loai="${k}"><h2>${ten}</h2><div class="lk-luoi">${LINHKIEN.ds.filter(x => x.loai === k).map(the).join('')}</div></section>`).join('')}`;
    if (window.TIM) TIM.ganThuVien(app);
  }

  // Trạng thái breadboard sau từng bước: bước sau kế thừa bước trước. Phần mới ráp lại từ đầu,
  // trừ phần có ke_thua: true (làm tiếp trên mạch cuối của phần trước).
  // Đồng hồ đo không kế thừa — bước nào đo thì bước đó tự khai báo.
  function cacTrangThai(phan, dau, cotTruoc) {
    const cot = phan.cot || (phan.ke_thua && cotTruoc) || 24;
    let items = dau.map(i => ({ ...i }));
    return phan.buoc.map(b => {
      const bd = b.board || {};
      items = items.filter(i => i.loai !== 'dh' && !(bd.bo || []).includes(i.id)).map(i => ({ ...i, moi: false }));
      Object.entries(bd.sua || {}).forEach(([id, p]) => { items = items.map(i => (i.id === id ? { ...i, ...p, moi: true } : i)); });
      (bd.them || []).forEach(it => items.push({ ...it, moi: it.moi !== false }));
      return { cot, items: items.map(i => ({ ...i })) };
    });
  }

  // Mỗi phần → danh sách trạng thái board theo bước; phần ke_thua nối tiếp mạch cuối của phần trước.
  function cacPhan(bai) {
    let cuoi = [], cot = 24;
    return bai.phan.map(p => {
      const tt = cacTrangThai(p, p.ke_thua ? cuoi : [], cot);
      if (tt.length) { cuoi = tt[tt.length - 1].items; cot = tt[0].cot; }
      return tt;
    });
  }
  // Link mô phỏng chỉ cho mạch toàn linh kiện rời: ESP32/module chưa mô phỏng.
  // ic/rgb/coi, zener, PNP, MOSFET (khong_mp) cũng chưa có mô hình: link ra số sai còn tệ hơn không có link.
  const moPhongDuoc = bd => bd.items.some(i => i.loai === 'pin') && !bd.items.some(i => ['esp', 'mod', 'ic', 'rgb', 'coi'].includes(i.loai) || i.khong_mp || (i.loai === 'ngoai' && i.kieu === 'hop'));

  function veBuoc(b, bd, n, pi, id) {
    const kiem = b.kiem && (b.kiem.thay || b.kiem.neu_khong) ? `<div class="gate">
      ${b.kiem.thay ? `<b class="y">Phải thấy</b><span>${b.kiem.thay}</span>` : ''}
      ${b.kiem.neu_khong ? `<b class="n">Nếu không</b><span>${b.kiem.neu_khong}</span>` : ''}</div>` : '';
    const so = `${id}·P${pi + 1}·${String(n).padStart(2, '0')}`;
    return `<li class="buoc to${b.cap_dien ? ' cap-dien' : ''}${b.kiem_truoc ? ' kiem-truoc' : ''}">
      <h4><span class="tag" title="Bước ${n} của phần ${pi + 1}"><b>${n}</b><i>P${pi + 1}</i></span>${b.cap_dien ? '<span class="pill canh">cấp điện</span>' : ''}${b.kiem_truoc ? '<span class="pill kiem">đo trước khi cấp điện</span>' : ''} ${b.ten}</h4>
      <div class="buoc-noidung">
        <div class="buoc-chu">${(b.lam || []).map(x => `<p>${x}</p>`).join('')}${kiem}</div>
        ${b.board ? `<figure><div class="cuon">${Board.ve(bd, b.mo_ta || b.ten)}</div><figcaption><span class="so-hinh">Hình ${so}</span><span>Breadboard sau bước ${n} · khung vàng = vừa cắm thêm${bd.items.some(i => i.loai === 'esp') ? ' · board ESP32 vẽ tách ra, chỉ các chân bài dùng, nối bằng dây đực–cái' : ''}${moPhongDuoc(bd) ? ` · <a class="mp-mo" href="${R(`mo-phong/bai/${id}/${pi}/${n - 1}`)}">Thử mạch này trên mô phỏng →</a>` : ''}</span></figcaption></figure>`
    : b.hinh ? `<figure><div class="cuon phac">${b.hinh}</div><figcaption><span class="so-hinh">Hình ${so}</span><span>Phác thảo bước ${n}</span></figcaption></figure>` : ''}
      </div></li>`;
  }

  function bangDo(bai, kq) {
    return (bai.bang_do || []).map((bg, gi) => `
      <div class="cuon"><table class="bang-do"><caption>${bg.ten}</caption>
      <thead><tr><th></th>${bg.cot.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>${bg.hang.map((h, hi) => `<tr><th>${h.ten}</th>${bg.cot.map((c, ci) => {
        const k = `${gi}|${hi}|${ci}`, dd = (h.du_doan || [])[ci];
        return `<td>${dd ? `<div class="dd">đoán ${dd}</div>` : ''}<input id="kq-${bai.id}-${gi}-${hi}-${ci}" data-k="${k}" value="${esc(kq[k] || '')}" inputmode="decimal" autocomplete="off"></td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>`).join('');
  }

  async function trangBai(id) {
    const ds = tatCaBai(), i = ds.findIndex(b => b.id === id), gt = ds[i];
    if (!gt) { app.innerHTML = '<p>Không có bài này trong giáo trình.</p>'; return; }
    const truoc = ds[i - 1], sau = ds[i + 1];
    const dieuHuong = `<nav class="dh-bai">${truoc ? `<a href="${R(`bai/${truoc.id}`)}">← ${truoc.id} ${dong(truoc.ten)}</a>` : '<span></span>'}${sau ? `<a href="${R(`bai/${sau.id}`)}">${sau.id} ${dong(sau.ten)} →</a>` : ''}</nav>`;
    const ph = S.gt.phan[gt.chuong.phan], danPhan = gt.chuong.phan > 1 ? ph.dan : [];
    const danChuong = [...danPhan, ...(gt.chuong.dan || [])];
    const dau = `<section class="dau"><p class="eyebrow">Phần ${gt.chuong.phan} · Chương ${gt.chuong.so} · ${dong(gt.chuong.ten)}</p>
      <h1><span class="so">${id}</span>${dong(gt.ten)}</h1></section>
      ${danChuong.length ? `<section class="khung to dan-phan"><p class="nhan-dan">Dặn của chương</p>${danChuong.map(x => `<p>${dong(x)}</p>`).join('')}</section>` : ''}`;
    let nguon = '';
    const khungTen = (them = '') => `<dl class="tb to">
      <div><dt>Bài</dt><dd>${id}</dd></div><div><dt>Chương</dt><dd>${gt.chuong.so}</dd></div>
      <div><dt>Trạng thái</dt><dd>${trangThai(gt)}</dd></div><div><dt>Nguồn</dt><dd>${nguon || (gt.chuong.phan > 1 ? 'USB 5V · GPIO 3.3V' : '3×AAA · đo 4.78 V')}</dd></div>${them}</dl>`;

    const tieuDe = `Bài ${id}: ${bo(gt.ten)} · ${bo(gt.chuong.ten)} · Bàn Ráp`;
    if (!S.soan.includes(id)) {
      datMeta(tieuDe, `${gt.lam} ${gt.thay}`);
      app.innerHTML = `${dau}${khungTen()}<section class="khung to"><p><b>Làm gì:</b> ${dong(gt.lam)}</p><p><b>Đo / thấy gì:</b> ${dong(gt.thay)}</p>
        <p class="mo">${LUU.web ? 'Bài này chưa có hướng dẫn từng bước. Đừng tự ráp theo 2 dòng trên: chờ hướng dẫn có hình và bước đo Ω trước khi cấp điện.' : `Bài này chưa có hướng dẫn từng bước. Nhờ Claude soạn <code>hoc/bai/${id}.js</code> trước khi ráp.`}</p></section>${khungAnToan()}${dieuHuong}`;
      return;
    }
    const bai = await taiBai(id);
    const moTa = bai.muc_tieu || `${gt.lam} ${gt.thay}`, vd = videoCua(id);
    const ld = [vet([['Bài học', ''], [`Bài ${id}: ${bo(gt.ten)}`, `bai/${id}`]])];
    // Google chỉ nhận VideoObject có đủ name, description, thumbnailUrl, uploadDate
    if (vd && vd.ngay) ld.push({ '@type': 'VideoObject', name: `Ráp thật bài ${id}: ${bo(gt.ten)}`, description: cat(bo(vd.ghi || moTa)),
      thumbnailUrl: `https://i.ytimg.com/vi/${vd.yt}/hqdefault.jpg`, uploadDate: vd.ngay, embedUrl: `https://www.youtube-nocookie.com/embed/${vd.yt}`, contentUrl: `https://www.youtube.com/watch?v=${vd.yt}` });
    datMeta(tieuDe, moTa, ld);
    nguon = bai.nguon || '';
    const kq = await LUU.docKq(id);
    const can = (bai.can || []).map(c => {
      const l = c.lk ? LINHKIEN.theoId(c.lk) : LINHKIEN.tim(c.tim), co = coMon(c.tim, l);
      const chu = `<span class="can-chu"><span>${c.ten}${c.sl ? ` <span class="mo">× ${c.sl}</span>` : ''}</span><span class="pill ${co === null ? 'mo' : co ? 'ok' : 'xau'}">${co === null ? 'tự kiểm' : co ? 'có' : 'thiếu'}</span></span>`;
      return l ? `<li><a href="${R(`linh-kien/${l.id}`)}" title="Xem ${l.ten} trong thư viện">${l.anh}${chu}</a>${nutMua(l.id)}</li>` : `<li><div class="can-o"><span class="khong-hinh">chưa có hình</span>${chu}</div></li>`;
    }).join('');

    const soBuoc = bai.phan.reduce((t, p) => t + p.buoc.length, 0);
    app.innerHTML = `${dau}
      ${khungTen(`<div><dt>Phần · bước</dt><dd>${bai.phan.length} phần · ${soBuoc} bước</dd></div>${bai.poster ? `<div><dt>Poster 30 bài</dt><dd>bài ${bai.poster.join(', ')}</dd></div>` : ''}`)}
      <section class="khung to"><p class="lede">${bai.muc_tieu}</p>
        ${bai.poster ? `<p class="mo">Hình trên poster có chỗ sai. Ráp theo hình ở trang này.</p>` : ''}</section>
      ${vd ? `<section><h2>Video ráp thật</h2><div class="video-yt"><button type="button" data-yt="${esc(vd.yt)}" aria-label="Phát video ráp thật bài ${id}">
        <img src="https://i.ytimg.com/vi/${esc(vd.yt)}/hqdefault.jpg" alt="Ảnh video ráp thật bài ${id}" width="480" height="360" loading="lazy"><span class="video-play" aria-hidden="true"></span></button></div>
        <p class="mo">${vd.ghi ? `${esc(vd.ghi)} ` : ''}Video tải từ YouTube khi bạn bấm. <a href="https://www.youtube.com/watch?v=${esc(vd.yt)}" target="_blank" rel="noopener">Mở trên YouTube ↗</a></p></section>` : ''}
      <section><h2>Đồ cần</h2><ul class="can">${can}</ul><p class="mo">Đối chiếu với trang <a href="${R(`do`)}">Đồ đang có</a>. Bấm vào hình để xem cách nhận chân trong <a href="${R(`linh-kien`)}">thư viện linh kiện</a>.</p></section>
      ${bai.kien_thuc ? `<section><h2>Hiểu trước khi ráp</h2><div class="khung to">${bai.kien_thuc}</div></section>` : ''}
      ${bai.so_do ? `<section><h2>Sơ đồ</h2><div class="sd-luoi">${bai.so_do.map(s => `<figure class="sd-hinh to">${s.nhan ? `<span class="pill ${s.xau ? 'xau' : 'ok'}">${s.nhan}</span>` : ''}${s.svg}<figcaption>${s.chu}</figcaption></figure>`).join('')}</div></section>` : ''}
      ${bai.du_doan ? `<section><h2>Đoán trước</h2><div class="khung to">${bai.du_doan}</div></section>` : ''}
      ${(() => { const moi = cacPhan(bai); return bai.phan.map((p, pi) => {
        const tt = moi[pi];
        return `<section class="phan"><div class="phan-dau"><span class="chu-phan">${pi + 1}</span><h2>${p.ten}</h2></div>${p.gioi_thieu ? `<p class="lede">${p.gioi_thieu}</p>` : ''}
          <ol class="cac-buoc">${p.buoc.map((b, k) => veBuoc(b, tt[k], k + 1, pi, id)).join('')}</ol></section>`;
      }).join(''); })()}
      ${bai.code ? `<section><h2>Code</h2><p class="mo">Code chạy trên ESP32 cho bài này (<code>${bai.code.split('/').pop()}</code>).</p><div class="cuon"><pre class="code" id="code">đang tải…</pre></div></section>` : ''}
      ${bai.bang_do ? `<section><h2>Ghi số đo</h2><p class="mo">${LUU.noiLuu(id)} <span id="luu"></span></p>${bangDo(bai, kq)}</section>` : ''}
      ${bai.sau ? `<section><h2>Đào sâu</h2><div class="khung to sau">${bai.sau}</div></section>` : ''}
      ${bai.hoi ? `<section><h2>Tự kiểm</h2><ol class="hoi to">${bai.hoi.map(([q, d]) => `<li><p>${q}</p><details><summary>Xem đáp án</summary><div>${d}</div></details></li>`).join('')}</ol></section>` : ''}
      ${bai.bay ? `<section class="bay to"><h2>Bẫy của bài này</h2><ul>${bai.bay.map(x => `<li>${x}</li>`).join('')}</ul></section>` : ''}
      <section class="alarm to"><h2>Khi có khói, mùi khét hoặc thấy nóng</h2><p>${bai.khoi ? bai.khoi : gt.chuong.phan > 1 ? 'Rút cáp USB (và tháo pin nếu bài có hộp pin) ngay.' : 'Tháo pin khỏi hộp ngay.'} Không sờ vào linh kiện đó cho tới khi nguội hẳn. Linh kiện đã bốc khói thì bỏ đi, kể cả khi còn chạy. Tìm ra chỗ nối sai rồi mới ráp lại.</p></section>
      ${LUU.web ? `<section class="tien-do"><h2>Tiến độ của bạn</h2><p class="do-nut"><button type="button" data-td="dang"${gt.dangO ? ' aria-pressed="true"' : ''}>Đang học bài này</button> <button type="button" data-td="xong"${gt.xong ? ' aria-pressed="true"' : ''}>Đã xong</button> <button type="button" data-td="">Bỏ đánh dấu</button></p><p class="mo">Lưu trong trình duyệt của bạn, hiện ở danh sách bài.</p></section>` : ''}
      ${bai.robot ? `<section><h2>Dùng ở đâu trong robot</h2><ul>${bai.robot.map(x => `<li>${x}</li>`).join('')}</ul></section>` : ''}
      ${dieuHuong}`;

    // Chỉ nhúng iframe khi bấm: trang nhẹ, và YouTube không đặt cookie khi người xem chưa bấm (chinh-sach-rieng-tu).
    app.querySelectorAll('.video-yt button').forEach(n => n.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${n.dataset.yt}?autoplay=1&rel=0`;
      f.title = n.getAttribute('aria-label'); f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
      n.replaceWith(f);
    }));
    app.querySelectorAll('[data-td]').forEach(n => n.addEventListener('click', () => {
      const v = n.dataset.td;
      // "đang học" chỉ 1 bài một lúc, như "← đang ở đây" trong giáo trình
      if (v === 'dang') tatCaBai().forEach(b => { if (b.dangO && b.id !== id) LUU.datTienDo(b.id, null); });
      LUU.datTienDo(id, v || null); apTienDo(); trangBai(id);
    }));
    if (bai.code) fetch(LUU.url(bai.code)).then(r => (r.ok ? r.text() : Promise.reject(new Error(r.status)))).then(t => { document.getElementById('code').textContent = t; })
      .catch(e => { document.getElementById('code').textContent = `Không tải được ${bai.code} (${e.message}).`; });
    let hen;
    app.querySelectorAll('.bang-do input').forEach(inp => inp.addEventListener('input', () => {
      kq[inp.dataset.k] = inp.value;
      clearTimeout(hen);
      hen = setTimeout(() => LUU.ghiKq(id, kq).then(t => { document.getElementById('luu').textContent = t; }), 500);
    }));
  }

  async function trangMoPhong(h) {
    datMeta('Mô phỏng ghép mạch breadboard · Bàn Ráp', 'Ghép mạch trên breadboard ảo: pin, điện trở, LED, tụ, diode, transistor. Tính áp, dòng, báo nối tắt và linh kiện quá tải trước khi ráp thật.');
    const [, kieu, ...con] = h.split('/');
    let vao = null;
    if (kieu === 'm') {
      try { vao = MoPhongTrang.b64.giai(con.join('/')); } catch (_) { app.innerHTML = '<section class="alarm"><h2>Link hỏng</h2><p>Không đọc được mạch trong link này.</p></section>'; return; }
      vao.nguon = 'mạch từ link chia sẻ';
    } else if (kieu === 'bai') {
      const [id, pi, k] = con, bai = await taiBai(id), bd = cacPhan(bai)[+pi][+k];
      vao = { ...MoPhongTrang.tuBai(bd.items), cot: bd.cot, nguon: `bài ${id}, phần ${+pi + 1}, bước ${+k + 1}` };
    }
    // Mở từ link rồi thì về /mo-phong/: tải lại trang giữ mạch đang sửa (localStorage), không nạp lại bản gốc.
    if (vao) { S.route = 'mo-phong'; history.replaceState(null, '', R('mo-phong')); }
    MoPhongTrang.mo(app, vao);
  }

  // Nội dung ở xiaozhi.js; url() cho file (ảnh trong sandbox/), R() cho route.
  function trangXiaozhi(t = XIAOZHI) {
    datMeta(t.tieuDe, t.moTa);
    app.innerHTML = t.html(R, LUU.url);
  }

  // Giới thiệu, chính sách riêng tư (trang-phu.js)
  function trangPhu(h) {
    const t = TRANG_PHU[h];
    datMeta(t.tieuDe, t.moTa);
    app.innerHTML = t.html(R);
  }

  async function dinhTuyen() {
    // Link cũ dạng #/bai/2.3 (đã gửi anh em, link chia sẻ mô phỏng) → đổi sang đường dẫn thật, không tải lại trang.
    if (location.hash.startsWith('#/')) history.replaceState(null, '', R(location.hash.slice(2)));
    const h = S.route = routeCua(location.pathname);
    window.scrollTo(0, 0);
    const muc = h.split('/')[0];
    document.documentElement.lang = muc === 'en' ? 'en' : 'vi';
    document.querySelectorAll('.top nav a').forEach(a => a.toggleAttribute('aria-current', a.dataset.r === (['do', 'linh-kien', 'mo-phong', 'xiaozhi'].includes(muc) ? muc : muc === '' || muc === 'bai' ? '' : null)));
    try {
      if (!S.gt) await taiChung();
      const m = /^bai\/(\d+\.\d+)$/.exec(h);
      if (m) await trangBai(m[1]);
      else if (h === 'do') trangDo();
      else if (muc === 'linh-kien') trangLinhKien(h.split('/')[1]);
      else if (muc === 'mo-phong') await trangMoPhong(h);
      else if (h === 'xiaozhi') trangXiaozhi();
      else if (h === 'en/xiaozhi') trangXiaozhi(XIAOZHI_EN);
      else if (window.TRANG_PHU && Object.hasOwn(TRANG_PHU, h)) trangPhu(h);
      else trangChu();
    } catch (e) {
      app.innerHTML = `<section class="alarm"><h2>Lỗi tải trang</h2><p>${esc(e.message || e)}</p></section>`;
    }
  }
  // Lượt xem (chỉ bản web, worker.js + D1): mỗi phiên trình duyệt cộng 1 lần, các trang sau chỉ đọc số.
  function demXem() {
    const o = document.getElementById('luot-xem');
    if (!o || !LUU.web) return;
    let daDem = false;
    try { daDem = sessionStorage.getItem('banrap.da-dem') === '1'; } catch (_) { /* không có sessionStorage: đếm mỗi lần tải */ }
    fetch('api/xem', { method: daDem ? 'GET' : 'POST' }).then(r => (r.ok ? r.json() : Promise.reject())).then(d => {
      try { sessionStorage.setItem('banrap.da-dem', '1'); } catch (_) { /* bỏ qua */ }
      o.querySelector('b').textContent = d.n.toLocaleString('vi-VN');
      o.title = `${d.n.toLocaleString('vi-VN')} lượt xem`;
      o.hidden = false;
    }).catch(() => {});
  }
  demXem();
  // Bấm link nội bộ → pushState, không tải lại trang (giữ giáo trình đã tải). Ctrl/⌘-click, target, download: để trình duyệt lo.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !u.pathname.startsWith(LUU.goc) || !LA_ROUTE.test(routeCua(u.pathname))) return;
    e.preventDefault();
    if (u.pathname !== location.pathname) history.pushState(null, '', u.pathname);
    dinhTuyen();
  });
  addEventListener('popstate', dinhTuyen);
  dinhTuyen();
})();
