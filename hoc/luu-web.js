// Chỗ lưu cho bản web publish (hoc/xuat-web.py): không có server, mọi thứ cá nhân — số đo, tiến độ,
// đồ đang có — nằm trong localStorage của từng người xem, không ai thấy của ai.
// localStorage có thể ném lỗi (cửa sổ ẩn danh, bị chặn) → rơi về bộ nhớ tạm, mất khi tải lại.
(function () {
  const tam = {};
  const doc = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return tam[k] || null; } };
  const ghi = (k, v) => { tam[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  window.LUU = {
    web: true,
    url: p => p,
    dsBai: () => fetch('bai/ds.json').then(r => r.json()).catch(() => []),
    docKq: id => Promise.resolve(doc('banrap.kq.' + id) || {}),
    ghiKq: (id, kq) => Promise.resolve(ghi('banrap.kq.' + id, kq) ? 'Đã lưu trong trình duyệt này.' : 'Trình duyệt chặn lưu: số đo mất khi tải lại trang.'),
    noiLuu: () => 'Gõ số vào là tự lưu trong trình duyệt của bạn (chỉ máy này thấy).',
    // { "1.1": "xong" | "dang" }
    tienDo: () => doc('banrap.tien-do') || {},
    datTienDo: (id, v) => { const t = LUU.tienDo(); if (v) t[id] = v; else delete t[id]; ghi('banrap.tien-do', t); },
    // id linh kiện trong LINHKIEN
    doCo: () => new Set(doc('banrap.do-co') || []),
    datDoCo: s => ghi('banrap.do-co', [...s]),
  };
})();
