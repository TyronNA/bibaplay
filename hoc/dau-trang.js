// Đầu trang: nút sáng/tối, menu gập trên màn hẹp, hỏi lại trước khi tải PDF.
// File riêng chứ không nằm trong app.js: 404.html (xuat-web.py) bỏ app.js nhưng vẫn cần đầu trang chạy.
(function () {
  const KHOA = 'banrap.giao-dien';
  const html = document.documentElement;
  const top = document.querySelector('.top');
  if (!top) return;

  // Sáng/tối: mặc định theo máy; bấm thì ghim lựa chọn. Script inline trong <head> của index.html đọc lại khoá này
  // trước khi vẽ để trang không nháy nền sáng rồi mới tối.
  const toiHeThong = matchMedia('(prefers-color-scheme: dark)');
  const dangToi = () => (html.dataset.theme ? html.dataset.theme === 'dark' : toiHeThong.matches);
  const nutMau = top.querySelector('#nut-mau');
  const veNutMau = () => {
    const toi = dangToi();
    nutMau.setAttribute('aria-pressed', String(toi));
    nutMau.title = toi ? 'Đang tối · bấm để chuyển sang sáng' : 'Đang sáng · bấm để chuyển sang tối';
  };
  if (nutMau) {
    veNutMau();
    toiHeThong.addEventListener('change', veNutMau);
    nutMau.addEventListener('click', () => {
      html.dataset.theme = dangToi() ? 'light' : 'dark';
      try { localStorage.setItem(KHOA, html.dataset.theme); } catch (_) { /* không lưu được: chỉ đổi cho lần xem này */ }
      veNutMau();
    });
  }

  // Menu gập (CSS chỉ ẩn nav khi màn ≤ 640px). Chọn một mục, bấm ra ngoài hoặc Esc thì gập lại.
  const nutMenu = top.querySelector('#nut-menu');
  const nav = top.querySelector('nav');
  const dong = () => { top.classList.remove('mo-menu'); nutMenu && nutMenu.setAttribute('aria-expanded', 'false'); };
  if (nutMenu && nav) {
    nutMenu.addEventListener('click', () => {
      const mo = top.classList.toggle('mo-menu');
      nutMenu.setAttribute('aria-expanded', String(mo));
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) dong(); });
    document.addEventListener('click', e => { if (!top.contains(e.target)) dong(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && top.classList.contains('mo-menu')) { dong(); nutMenu.focus(); } });
  }

  // PDF ~57 MB: bấm nhầm trên 4G là mất cả chục phút và dung lượng → hỏi lại. capture để chạy trước bộ định tuyến của app.js.
  // Tìm hộp lúc bấm: xuat-web.py chèn nó sau các thẻ <script>, lúc file này chạy nó chưa có trong DOM.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-hoi]'), hop = document.getElementById('hoi-pdf');
    if (!a || !hop || typeof hop.showModal !== 'function' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    hop.returnValue = '';
    hop.showModal();
    hop.addEventListener('close', () => {
      if (hop.returnValue !== 'tai') return;
      const t = document.createElement('a');
      t.href = a.href; t.download = '';
      document.body.appendChild(t); t.click(); t.remove();
    }, { once: true });
  }, true);
})();
