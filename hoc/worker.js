// Worker chạy trước mọi request (run_worker_first): gộp domain phụ về bibaplay.com, đếm lượt xem + click mua (D1),
// phát ban-rap.pdf từ R2 (PDF ~57MB vượt giới hạn 25 MiB/file của Workers Static Assets); còn lại là file tĩnh.
const PDF = '/ban-rap.pdf';
const CHINH = 'bibaplay.com';

// Header bảo mật cho mọi response. Không đặt CSP đầy đủ: trang có script inline + AdSense tải script/iframe từ
// hàng chục domain của Google, CSP chặt sẽ làm hỏng quảng cáo. frame-ancestors chỉ cấm trang khác nhúng bibaplay.
// HSTS không includeSubDomains: subdomain game cũ (ascension-war) không do worker này quản.
const BAO_MAT = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'content-security-policy': "frame-ancestors 'self'",
  'strict-transport-security': 'max-age=31536000',
};

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

// /mua/<id>?tu=<trang>: đếm click rồi 302 sang link Shopee affiliate trong mua.json (xuat-web.py sinh từ mua.js).
// Bảng tạo một lần: wrangler d1 execute ban-rap-hoc --remote --command
//   "CREATE TABLE IF NOT EXISTS bam (ngay TEXT NOT NULL, id TEXT NOT NULL, tu TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (ngay, id, tu))"
// Xem số: hoc/thong-ke.sh.
async function mua(request, env, ctx, id) {
  const url = new URL(request.url);
  const ds = await env.ASSETS.fetch(new URL('/mua.json', url)).then(r => (r.ok ? r.json() : {}));
  // hasOwn: id là chuỗi người gọi tự đặt — /mua/constructor mà tra thẳng ds[id] sẽ ra hàm của Object.prototype
  const dich = Object.hasOwn(ds, id) ? ds[id] : null;
  if (!dich) return Response.redirect(new URL(`/linh-kien/${id}/`, url).toString(), 302);
  // tu là route app.js gửi (bai/2.3, linh-kien/s8050, chu…); chuỗi khác gộp về 'khac' để không ai spam ra hàng nghìn dòng D1
  const tu0 = url.searchParams.get('tu') || '';
  const tu = /^[\w./-]{1,60}$/.test(tu0) ? tu0 : 'khac';
  // ngày theo giờ VN; ghi D1 sau khi đã trả redirect — lỗi đếm (chưa tạo bảng…) không được chặn người mua
  const ngay = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  ctx.waitUntil(env.DB.prepare('INSERT INTO bam (ngay, id, tu, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (ngay, id, tu) DO UPDATE SET n = n + 1')
    .bind(ngay, id, tu).run().catch(e => console.error('dem mua', e)));
  return new Response(null, { status: 302, headers: { location: dich, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

export default {
  async fetch(request, env, ctx) {
    const r = await xuLy(request, env, ctx);
    // Response của ASSETS / Response.redirect có header bất biến → dựng lại mới gắn thêm được
    const out = new Response(r.body, r);
    for (const [k, v] of Object.entries(BAO_MAT)) out.headers.set(k, v);
    return out;
  },
};

async function xuLy(request, env, ctx) {
  const url = new URL(request.url);
  // www.bibaplay.com, domain cũ hoc.talesofascension.com và http:// → https://bibaplay.com, giữ path + hash (hash do trình duyệt giữ).
  // Zone không bật "Always Use HTTPS", nên http://bibaplay.com phải tự chuyển ở đây.
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (!local && (url.hostname !== CHINH || url.protocol === 'http:')) {
    url.hostname = CHINH; url.protocol = 'https:'; url.port = '';
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname === '/api/xem') return luotXem(request, env);
  const m = /^\/mua\/([\w-]+)\/?$/.exec(url.pathname);
  if (m) return mua(request, env, ctx, m[1]);
  // Link chia sẻ mạch (/mo-phong/m/<mã>/) và "thử trên mô phỏng" (/mo-phong/bai/…) không có file tĩnh:
  // phát trang /mo-phong/ đã render sẵn, app.js đọc đường dẫn rồi nạp mạch.
  if (/^\/mo-phong\/.+/.test(url.pathname)) return env.ASSETS.fetch(new Request(new URL('/mo-phong/', url), request));
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
}

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
