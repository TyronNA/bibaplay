// Chỗ lưu khi chạy local qua hoc/server.py: số đo ghi vào hoc/ket-qua/<id>.json để Claude đọc được,
// tiến độ + đồ đang có đọc thẳng từ notes/*.md. Bản web publish dùng luu-web.js thay file này.
window.LUU = {
  web: false,
  goc: '/hoc/',
  url: p => '/' + p,
  dsBai: () => fetch('/api/bai').then(r => r.json()).catch(() => []),
  docKq: id => fetch(`/api/ket-qua/${id}`).then(r => r.json()).catch(() => ({})),
  ghiKq: (id, kq) => fetch(`/api/ket-qua/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kq) })
    .then(r => (r.ok ? 'Đã lưu.' : 'Lưu không được, server báo lỗi.'), () => 'Lưu không được: server không chạy.'),
  noiLuu: id => `Gõ số vào là tự lưu vào <code>hoc/ket-qua/${id}.json</code>, Claude đọc được file đó.`,
};
