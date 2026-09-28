// Web tự học: danh sách bài lấy từ notes/giao-trinh-dien.md, chi tiết từng bài ở hoc/bai/<id>.js.
(function () {
  const { esc, dong } = MD;
  const app = document.getElementById('app');
  const S = { gt: null, soan: [], doText: '', bai: {} };

  window.BAI = { dangKy: b => { S.bai[b.id] = b; } };

  async function taiChung() {
    const [gt, soan, doText] = await Promise.all([
      fetch('/notes/giao-trinh-dien.md').then(r => r.text()),
      fetch('/api/bai').then(r => r.json()).catch(() => []),
      fetch('/notes/do-dang-co.md').then(r => r.text()),
    ]);
    S.gt = MD.giaoTrinh(gt); S.soan = soan; datDo(doText);
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

  const tatCaBai = () => S.gt.chuong.flatMap(c => c.bai.map(b => ({ ...b, chuong: c })));

  function taiBai(id) {
    if (S.bai[id]) return Promise.resolve(S.bai[id]);
    return new Promise((ok, loi) => {
      const s = document.createElement('script');
      s.src = `bai/${id}.js?t=${Date.now()}`;
      s.onload = () => ok(S.bai[id]);
      s.onerror = loi;
      document.head.appendChild(s);
    });
  }

  function trangThai(b) {
    if (b.xong) return '<span class="pill ok">xong</span>';
    if (b.dangO) return '<span class="pill dang">đang học</span>';
    if (S.soan.includes(b.id)) return '<span class="pill soan">có hướng dẫn</span>';
    return '<span class="pill mo">chưa soạn</span>';
  }

  function khungAnToan() {
    return `<section class="antoan to"><h2>Ghi chú chung · an toàn, áp dụng cho mọi bài</h2><ol>${S.gt.xuyenSuot.map(x => `<li><span>${dong(x)}</span></li>`).join('')}</ol></section>`;
  }

  function trangChu() {
    document.title = 'Bàn Ráp';
    app.innerHTML = `
      <section class="dau"><p class="eyebrow">Giáo trình điện · nghiêng về robot + nhúng</p>
      <h1>Học điện trên breadboard</h1>
      <p class="lede">Bài nào cũng đi theo một vòng: đoán trước bằng công thức, ráp khi chưa có pin, đo Ω rồi mới cấp điện, sau đó đo và so với số đã đoán. Danh sách bài đọc thẳng từ <code>notes/giao-trinh-dien.md</code>.</p></section>
      ${khungAnToan()}
      ${Object.entries(S.gt.phan).map(([so, ph]) => `
      <section><h2><span class="so">Phần ${so}</span><span>${dong(ph.ten.replace(/\s*\(.*\)\s*$/, ''))}</span></h2>
      ${ph.dan.length ? `<div class="khung to dan-phan">${ph.dan.map(x => `<p>${dong(x)}</p>`).join('')}</div>` : ''}
      <div class="danh-muc">${S.gt.chuong.filter(c => String(c.phan) === so).map(c => `
        <div class="chuong to"><div class="dm-dau"><span class="so">${String(c.so).padStart(2, '0')}</span><h3>${dong(c.ten)}</h3>
          <span class="dem">${c.bai.filter(b => b.xong).length}/${c.bai.length} xong</span></div>
        <ol class="ds">${c.bai.map(b => `
          <li><a href="#/bai/${b.id}" class="${b.dangO ? 'dang-o' : ''}">
            <span class="id">${b.id}</span><span class="ten">${dong(b.ten)}</span>${trangThai(b)}
          </a></li>`).join('')}</ol></div>`).join('')}</div></section>`).join('')}`;
  }

  const coLK = l => coTim(l.tim);
  // Các dòng bảng trong do-dang-co.md có cột "Món" chứa chuỗi tìm của linh kiện → [món, số lượng, ghi chú].
  const dongBang = (md, tim) => md.split('\n').filter(d => /^\|/.test(d) && !/^\|\s*-/.test(d))
    .map(d => d.split('|').slice(1, -1).map(c => c.trim())).filter(c => c[0] && c[0].toLowerCase().includes(tim.toLowerCase()));

  function trangDo() {
    document.title = 'Đồ đang có · Bàn Ráp';
    fetch('/notes/do-dang-co.md').then(r => r.text()).then(t => {
      datDo(t);
      const co = LINHKIEN.ds.filter(coLK);
      app.innerHTML = `<section class="dau"><p class="eyebrow">Đọc thẳng từ notes/do-dang-co.md</p><h1>Đồ đang có</h1>
        <p class="lede">${co.length} loại đồ, mỗi món có hình. Bấm vào để xem cách nhận chân, giới hạn và bẫy trong <a href="#/linh-kien">thư viện linh kiện</a>.</p></section>
        <section><h2>Hình từng món</h2><ul class="do-luoi">${co.map(l => {
          let dong = dongBang(t, l.tim);
          // món không nằm trong bảng (dụng cụ, nguồn): lấy nguyên câu chứa nó trong file md
          if (!dong.length) { const c = t.split('\n').find(d => d.toLowerCase().includes(l.tim.toLowerCase())); if (c) dong = [[c.replace(/^[-*]\s*/, '')]]; }
          return `<li><a class="to" href="#/linh-kien/${l.id}"><figure>${l.anh}</figure>
            <div class="do-chu"><b>${l.ten}</b>${dong.map(c => `<span class="mo">${MD.dong(c[0])}${c[1] ? ` · <b class="sl">${MD.dong(c[1])}</b>` : ''}</span>`).join('')}</div></a></li>`;
        }).join('')}</ul></section>
        <section><h2>Bản gốc</h2><article class="md to">${MD.khoi(t)}</article></section>`;
    });
  }

  function trangLinhKien(chon) {
    document.title = 'Thư viện linh kiện · Bàn Ráp';
    const tatCa = tatCaBai();
    const tenBai = id => { const b = tatCa.find(x => x.id === id); return b ? `<a href="#/bai/${id}">${id} ${dong(b.ten)}</a>` : id; };
    const the = l => `<article class="lk-the to${l.id === chon ? ' chon' : ''}" id="lk-${l.id}">
      <header><h3>${l.ten}</h3>${coLK(l) ? '<span class="pill ok">có</span>' : `${l.mua ? `<span class="pill mo">${l.mua}</span>` : ''}<span class="pill xau">chưa có</span>`}</header>
      <div class="lk-hinh${l.kh ? '' : ' mot'}"><figure>${l.anh}<figcaption>Hình minh hoạ</figcaption></figure>${l.kh ? `<figure>${l.kh}<figcaption>Ký hiệu trên sơ đồ</figcaption></figure>` : ''}</div>
      <dl class="lk-tt">
        <div><dt>Nhận chân / cực</dt><dd><ul>${l.chan.map(x => `<li>${x}</li>`).join('')}</ul></dd></div>
        ${l.gioi_han ? `<div><dt>Giới hạn</dt><dd>${l.gioi_han}</dd></div>` : ''}
        ${l.bay ? `<div class="bay-lk"><dt>Bẫy</dt><dd>${l.bay}</dd></div>` : ''}
        <div><dt>Dùng ở bài</dt><dd>${l.bai === null ? 'mọi bài' : l.bai.length ? l.bai.map(tenBai).join(' · ') : 'chưa có bài'}</dd></div>
      </dl></article>`;
    app.innerHTML = `<section class="dau"><p class="eyebrow">Thư viện linh kiện · ${LINHKIEN.ds.length} món</p><h1>Linh kiện</h1>
      <p class="lede">Mỗi món có hình minh hoạ với chú thích chân, ký hiệu trên sơ đồ mạch, cách nhận chân và bẫy. Chỗ nào ghi <b>đo mới biết</b> là chỗ hình không dám vẽ chắc: phải đo trước khi ráp.</p></section>
      ${Object.entries(LINHKIEN.nhom).map(([k, ten]) => `<section><h2>${ten}</h2><div class="lk-luoi">${LINHKIEN.ds.filter(l => l.nhom === k).map(the).join('')}</div></section>`).join('')}`;
    if (chon) { const el = document.getElementById('lk-' + chon); if (el) el.scrollIntoView({ block: 'start' }); }
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

  function veBuoc(b, bd, n, pi, id) {
    const kiem = b.kiem ? `<div class="gate">
      <b class="y">Phải thấy</b><span>${b.kiem.thay}</span>
      <b class="n">Nếu không</b><span>${b.kiem.neu_khong}</span></div>` : '';
    const so = `${id}·P${pi + 1}·${String(n).padStart(2, '0')}`;
    return `<li class="buoc to${b.cap_dien ? ' cap-dien' : ''}${b.kiem_truoc ? ' kiem-truoc' : ''}">
      <h4><span class="tag" title="Bước ${n} của phần ${pi + 1}"><b>${n}</b><i>P${pi + 1}</i></span>${b.cap_dien ? '<span class="pill canh">cấp điện</span>' : ''}${b.kiem_truoc ? '<span class="pill kiem">đo trước khi cấp điện</span>' : ''} ${b.ten}</h4>
      <div class="buoc-noidung">
        <div class="buoc-chu">${(b.lam || []).map(x => `<p>${x}</p>`).join('')}${kiem}</div>
        ${b.board ? `<figure><div class="cuon">${Board.ve(bd, b.mo_ta || b.ten)}</div><figcaption><span class="so-hinh">Hình ${so}</span><span>Breadboard sau bước ${n} · khung vàng = vừa cắm thêm${bd.items.some(i => i.loai === 'esp') ? ' · board ESP32 vẽ tách ra, chỉ các chân bài dùng, nối bằng dây đực–cái' : ''}</span></figcaption></figure>`
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
    document.title = `${id} ${gt.ten.replace(/[*`]/g, '')} · Bàn Ráp`;
    const truoc = ds[i - 1], sau = ds[i + 1];
    const dieuHuong = `<nav class="dh-bai">${truoc ? `<a href="#/bai/${truoc.id}">← ${truoc.id} ${dong(truoc.ten)}</a>` : '<span></span>'}${sau ? `<a href="#/bai/${sau.id}">${sau.id} ${dong(sau.ten)} →</a>` : ''}</nav>`;
    const ph = S.gt.phan[gt.chuong.phan], danPhan = gt.chuong.phan > 1 ? ph.dan : [];
    const danChuong = [...danPhan, ...(gt.chuong.dan || [])];
    const dau = `<section class="dau"><p class="eyebrow">Phần ${gt.chuong.phan} · Chương ${gt.chuong.so} · ${dong(gt.chuong.ten)}</p>
      <h1><span class="so">${id}</span>${dong(gt.ten)}</h1></section>
      ${danChuong.length ? `<section class="khung to dan-phan"><p class="nhan-dan">Dặn của chương</p>${danChuong.map(x => `<p>${dong(x)}</p>`).join('')}</section>` : ''}`;
    let nguon = '';
    const khungTen = (them = '') => `<dl class="tb to">
      <div><dt>Bài</dt><dd>${id}</dd></div><div><dt>Chương</dt><dd>${gt.chuong.so}</dd></div>
      <div><dt>Trạng thái</dt><dd>${trangThai(gt)}</dd></div><div><dt>Nguồn</dt><dd>${nguon || (gt.chuong.phan > 1 ? 'USB 5V · GPIO 3.3V' : '3×AAA · đo 4.78 V')}</dd></div>${them}</dl>`;

    if (!S.soan.includes(id)) {
      app.innerHTML = `${dau}${khungTen()}<section class="khung to"><p><b>Làm gì:</b> ${dong(gt.lam)}</p><p><b>Đo / thấy gì:</b> ${dong(gt.thay)}</p>
        <p class="mo">Bài này chưa có hướng dẫn từng bước. Nhờ Claude soạn <code>hoc/bai/${id}.js</code> trước khi ráp.</p></section>${khungAnToan()}${dieuHuong}`;
      return;
    }
    const bai = await taiBai(id);
    nguon = bai.nguon || '';
    const kq = await fetch(`/api/ket-qua/${id}`).then(r => r.json()).catch(() => ({}));
    const can = (bai.can || []).map(c => {
      const co = coTim(c.tim), l = c.lk ? LINHKIEN.theoId(c.lk) : LINHKIEN.tim(c.tim);
      const chu = `<span class="can-chu"><span>${c.ten}${c.sl ? ` <span class="mo">× ${c.sl}</span>` : ''}</span><span class="pill ${co ? 'ok' : 'xau'}">${co ? 'có' : 'thiếu'}</span></span>`;
      return l ? `<li><a href="#/linh-kien/${l.id}" title="Xem ${l.ten} trong thư viện">${l.anh}${chu}</a></li>` : `<li><div class="can-o"><span class="khong-hinh">chưa có hình</span>${chu}</div></li>`;
    }).join('');

    const soBuoc = bai.phan.reduce((t, p) => t + p.buoc.length, 0);
    app.innerHTML = `${dau}
      ${khungTen(`<div><dt>Phần · bước</dt><dd>${bai.phan.length} phần · ${soBuoc} bước</dd></div>${bai.poster ? `<div><dt>Poster 30 bài</dt><dd>bài ${bai.poster.join(', ')}</dd></div>` : ''}`)}
      <section class="khung to"><p class="lede">${bai.muc_tieu}</p>
        ${bai.poster ? `<p class="mo">Hình trên poster có chỗ sai, đã ghi trong <code>notes/poster-30-bai.md</code>. Ráp theo hình ở trang này.</p>` : ''}</section>
      <section><h2>Đồ cần</h2><ul class="can">${can}</ul><p class="mo">Đối chiếu với trang <a href="#/do">Đồ đang có</a>. Bấm vào hình để xem cách nhận chân trong <a href="#/linh-kien">thư viện linh kiện</a>.</p></section>
      ${bai.kien_thuc ? `<section><h2>Hiểu trước khi ráp</h2><div class="khung to">${bai.kien_thuc}</div></section>` : ''}
      ${bai.so_do ? `<section><h2>Sơ đồ</h2><div class="sd-luoi">${bai.so_do.map(s => `<figure class="sd-hinh to">${s.nhan ? `<span class="pill ${s.xau ? 'xau' : 'ok'}">${s.nhan}</span>` : ''}${s.svg}<figcaption>${s.chu}</figcaption></figure>`).join('')}</div></section>` : ''}
      ${bai.du_doan ? `<section><h2>Đoán trước</h2><div class="khung to">${bai.du_doan}</div></section>` : ''}
      ${(() => { let cuoi = [], cot = 24; return bai.phan.map((p, pi) => {
        const tt = cacTrangThai(p, p.ke_thua ? cuoi : [], cot);
        if (tt.length) { cuoi = tt[tt.length - 1].items; cot = tt[0].cot; }
        return `<section class="phan"><div class="phan-dau"><span class="chu-phan">${pi + 1}</span><h2>${p.ten}</h2></div>${p.gioi_thieu ? `<p class="lede">${p.gioi_thieu}</p>` : ''}
          <ol class="cac-buoc">${p.buoc.map((b, k) => veBuoc(b, tt[k], k + 1, pi, id)).join('')}</ol></section>`;
      }).join(''); })()}
      ${bai.code ? `<section><h2>Code</h2><p class="mo">Đọc thẳng từ <code>${bai.code}</code> — build + nạp: <code>sandbox/esp32-bai/README.md</code>.</p><div class="cuon"><pre class="code" id="code">đang tải…</pre></div></section>` : ''}
      ${bai.bang_do ? `<section><h2>Ghi số đo</h2><p class="mo">Gõ số vào là tự lưu vào <code>hoc/ket-qua/${id}.json</code>, Claude đọc được file đó. <span id="luu"></span></p>${bangDo(bai, kq)}</section>` : ''}
      ${bai.bay ? `<section class="bay to"><h2>Bẫy của bài này</h2><ul>${bai.bay.map(x => `<li>${x}</li>`).join('')}</ul></section>` : ''}
      <section class="alarm to"><h2>Khi có khói, mùi khét hoặc thấy nóng</h2><p>${gt.chuong.phan > 1 ? 'Rút cáp USB (và tháo pin nếu bài có hộp pin) ngay.' : 'Tháo pin khỏi hộp ngay.'} Không sờ vào linh kiện đó cho tới khi nguội hẳn. Linh kiện đã bốc khói thì bỏ đi, kể cả khi còn chạy. Tìm ra chỗ nối sai rồi mới ráp lại.</p></section>
      ${bai.robot ? `<section><h2>Dùng ở đâu trong robot</h2><ul>${bai.robot.map(x => `<li>${x}</li>`).join('')}</ul></section>` : ''}
      ${dieuHuong}`;

    if (bai.code) fetch('/' + bai.code).then(r => (r.ok ? r.text() : Promise.reject(new Error(r.status)))).then(t => { document.getElementById('code').textContent = t; })
      .catch(e => { document.getElementById('code').textContent = `Không tải được ${bai.code} (${e.message}).`; });
    let hen;
    app.querySelectorAll('.bang-do input').forEach(inp => inp.addEventListener('input', () => {
      kq[inp.dataset.k] = inp.value;
      clearTimeout(hen);
      hen = setTimeout(() => fetch(`/api/ket-qua/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kq) })
        .then(r => { document.getElementById('luu').textContent = r.ok ? 'Đã lưu.' : 'Lưu không được, server báo lỗi.'; })
        .catch(() => { document.getElementById('luu').textContent = 'Lưu không được: server không chạy.'; }), 500);
    }));
  }

  async function dinhTuyen() {
    const h = location.hash.replace(/^#\/?/, '');
    window.scrollTo(0, 0);
    const muc = h.split('/')[0];
    document.querySelectorAll('.top nav a').forEach(a => a.toggleAttribute('aria-current', a.dataset.r === (['do', 'linh-kien'].includes(muc) ? muc : '')));
    try {
      if (!S.gt) await taiChung();
      const m = /^bai\/(\d+\.\d+)$/.exec(h);
      if (m) await trangBai(m[1]);
      else if (h === 'do') trangDo();
      else if (muc === 'linh-kien') trangLinhKien(h.split('/')[1]);
      else trangChu();
    } catch (e) {
      app.innerHTML = `<section class="alarm"><h2>Lỗi tải trang</h2><p>${esc(e.message || e)}</p></section>`;
    }
  }
  addEventListener('hashchange', dinhTuyen);
  dinhTuyen();
})();
