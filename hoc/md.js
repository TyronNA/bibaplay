// Đọc markdown của notes/ — chỉ đủ cho các file ở đó (tiêu đề, bảng, danh sách, đoạn văn, **đậm**, `code`).
// Web không chép nội dung notes: sửa file .md là web đổi theo.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dong = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>');
  const o = line => line.split('|').slice(1, -1).map(x => x.trim());

  function khoi(md) {
    const L = md.replace(/<!--[\s\S]*?-->/g, '').split('\n'), out = [];
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (/^#{1,4} /.test(l)) { const n = l.match(/^#+/)[0].length; out.push(`<h${n + 1}>${dong(l.slice(n + 1))}</h${n + 1}>`); continue; }
      if (l.startsWith('|')) {
        const rows = [];
        while (i < L.length && L[i].startsWith('|')) rows.push(L[i++]);
        i--;
        const [h, , ...b] = rows;
        out.push('<div class="cuon"><table><thead><tr>' + o(h).map(c => `<th>${dong(c)}</th>`).join('') + '</tr></thead><tbody>'
          + b.map(r => '<tr>' + o(r).map(c => `<td>${dong(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
        continue;
      }
      if (/^- /.test(l)) {
        const it = [];
        while (i < L.length && /^(- |  )/.test(L[i])) { if (L[i].startsWith('- ')) it.push(L[i].slice(2)); else it[it.length - 1] += ' ' + L[i].trim(); i++; }
        i--;
        out.push('<ul>' + it.map(x => `<li>${dong(x)}</li>`).join('') + '</ul>');
        continue;
      }
      if (l.trim()) {
        let p = l;
        while (i + 1 < L.length && L[i + 1].trim() && !/^(#|\||- )/.test(L[i + 1])) p += ' ' + L[++i];
        out.push(`<p>${dong(p)}</p>`);
      }
    }
    return out.join('\n');
  }

  // Giáo trình: "## 1. Tên chương" + bảng "| 1.1 ✅ | Bài | Làm gì | Đo / thấy gì |".
  function giaoTrinh(md) {
    // Phần 1 không có tiêu đề riêng; "## Phần N — tên" mở phần mới, đoạn văn ngay sau nó là lời dặn của phần.
    const chuong = [], xuyenSuot = [], phan = { 1: { ten: 'Nền tảng điện trên breadboard', dan: [] } };
    let c = null, trongXS = false, ph = 1, trongPhan = false;
    md.split('\n').forEach(l => {
      const h = /^## (\d+)\. (.+)$/.exec(l);
      if (h) { c = { so: h[1], ten: h[2], bai: [], phan: ph }; chuong.push(c); trongXS = false; trongPhan = false; return; }
      const p = /^## Phần (\d+)\s*[—-]\s*(.+)$/.exec(l);
      if (p) { ph = +p[1]; phan[ph] = { ten: p[2], dan: [] }; c = null; trongXS = false; trongPhan = true; return; }
      if (/^## /.test(l)) { c = null; trongXS = /Xuyên suốt/.test(l); trongPhan = false; return; }
      if (trongPhan && l.trim()) { phan[ph].dan.push(l.trim()); return; }
      if (trongXS && /^- /.test(l)) { xuyenSuot.push(l.slice(2)); return; }
      if (trongXS && /^  \S/.test(l) && xuyenSuot.length) { xuyenSuot[xuyenSuot.length - 1] += ' ' + l.trim(); return; }
      if (c && l.trim() && !l.startsWith('|')) { (c.dan = c.dan || []).push(l.trim()); return; }
      if (!c || !l.startsWith('|')) return;
      const cells = o(l), m = /^(\d+\.\d+)/.exec(cells[0] || '');
      if (!m) return;
      c.bai.push({
        id: m[1], xong: cells[0].includes('✅'),
        dangO: /đang ở đây/.test(cells[1]),
        ten: cells[1].replace(/←.*$/, '').replace(/\*\*/g, '').trim(),
        lam: cells[2] || '', thay: cells[3] || '',
      });
    });
    return { chuong, xuyenSuot, phan };
  }

  window.MD = { khoi, dong, giaoTrinh, esc };
})();
