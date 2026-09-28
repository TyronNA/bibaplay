// Worker chạy trước mọi request (run_worker_first): gộp domain phụ về bibaplay.com, đếm lượt xem (D1),
// phát ban-rap.pdf từ R2 (PDF ~57MB vượt giới hạn 25 MiB/file của Workers Static Assets); còn lại là file tĩnh.
const PDF = '/ban-rap.pdf';
const CHINH = 'bibaplay.com';

// Lượt xem: một dòng đếm trong D1 (bảng dem, tạo tay một lần — xem wrangler.jsonc).
// POST cộng 1 (app.js chỉ gửi 1 lần mỗi phiên trình duyệt), GET chỉ đọc.
async function luotXem(request, env) {
  const cong = request.method === 'POST';
  if (!cong && request.method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });
  const row = cong
    ? await env.DB.prepare("UPDATE dem SET n = n + 1 WHERE k = 'xem' RETURNING n").first()
    : await env.DB.prepare("SELECT n FROM dem WHERE k = 'xem'").first();
  return Response.json({ n: row ? row.n : 0 }, { headers: { 'cache-control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // www.bibaplay.com và domain cũ hoc.talesofascension.com → bibaplay.com, giữ path + hash (hash do trình duyệt giữ).
    if (url.hostname !== CHINH && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      url.hostname = CHINH; url.protocol = 'https:'; url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/api/xem') return luotXem(request, env);
    if (url.pathname !== PDF) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }
    const key = PDF.slice(1);
    if (request.method === 'HEAD') {
      const head = await env.PDF.head(key);
      if (!head) return new Response('Not Found', { status: 404 });
      const headers = dau(head);
      headers.set('content-length', String(head.size));
      return new Response(null, { headers });
    }
    // Range: trình xem PDF của trình duyệt tải từng khúc; không có thì phải chờ đủ 50MB mới thấy trang 1.
    const obj = await env.PDF.get(key, { range: request.headers, onlyIf: request.headers });
    if (!obj) return new Response('Not Found', { status: 404 });
    const headers = dau(obj);
    if (!('body' in obj) || !obj.body) {
      // precondition trượt: If-None-Match khớp → 304; If-Match lệch (file đã đổi giữa chừng) → 412
      return new Response(null, { status: request.headers.has('if-match') ? 412 : 304, headers });
    }
    const ranged = obj.range && request.headers.has('range');
    if (ranged) {
      const offset = obj.range.offset ?? 0;
      const length = obj.range.length ?? obj.size - offset;
      headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    }
    return new Response(obj.body, { status: ranged ? 206 : 200, headers });
  },
};

function dau(obj) {
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('accept-ranges', 'bytes');
  // Tên file cố định, nội dung đổi mỗi lần deploy → cho cache ngắn, hết hạn thì hỏi lại bằng ETag.
  h.set('cache-control', 'public, max-age=3600');
  h.set('content-disposition', 'inline; filename="ban-rap.pdf"');
  return h;
}
