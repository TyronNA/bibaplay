// Chỉ nhận request không khớp file tĩnh nào; việc duy nhất: phát ban-rap.pdf từ R2
// (PDF ~50MB vượt giới hạn 25 MiB/file của Workers Static Assets).
const PDF = '/ban-rap.pdf';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
