// Bài 9.4 — Chống dội phím: mạch 9.3 dùng pull-up nội; phần 2 thêm tụ gốm 100nF song song nút (10h ↔ 12h).
(function () {
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3', G12: '10c' });
  const NUT = { id: 'nut', loai: 'nut', o: '10e', nhan: 'nút' }, DG = K.day('dG', '12j', 'B-:12', 'den');
  const C = { id: 'c', loai: 'tu', kieu: 'gom', p: ['10h', '12h'], nhan: '100nF' };
  BAI.dangKy({
    id: '9.4',
    muc_tieu: 'Nhấn 1 lần mà chip đếm ra nhiều lần: tiếp điểm kim loại nảy. Sửa bằng code (chờ 20ms) và bằng tụ.',
    can: [...K.coBanEsp(3), K.can.nut(), K.can.tugom()],
    kien_thuc: `<p>Lúc nhấn, 2 lá kim loại chạm–nảy–chạm vài lần trong vài ms. Chip đọc hàng triệu lần/giây nên thấy từng lần nảy là một lần nhấn.</p>
      <p>Code đếm 2 kiểu cùng lúc: <b>thô</b> (ngắt ở mỗi cạnh xuống) và <b>chống dội</b> (thấy đổi mức thì chờ 20ms, còn đổi mới tính).</p>
      <p>Tụ 100nF song song nút cùng pull-up nội 45k thành mạch RC τ ≈ 4.5ms: cạnh xuống/lên bị làm mượt, nảy ngắn bị nuốt.</p>`,
    code: 'sandbox/esp32-bai/main/bai_9_4.c',
    du_doan: '<p>Không tụ: thô > chống dội thỉnh thoảng (nút rẻ nảy nhiều). Có tụ: thô gần bằng chống dội.</p>',
    phan: [
      {
        ten: 'Phần 1 · Đếm thô và chống dội',
        buoc: [
          { ten: 'Nút + dây (không 10k)', lam: ['USB rút. Nút ở cột 10/12, dây đen 12j → thanh −. <code>3V3</code> → thanh +, <code>GND</code> → thanh −, <code>12</code> → 10c. Code bật pull-up nội.'], board: { them: [NUT, DG, ESP] } },
          K.buocOmEsp(null, null, ['Đo cả lúc nhấn: vẫn gần mốc (nút chỉ nối GPIO xuống GND).']),
          K.camUsb('Cắm USB, nạp 9.4, nhấn 20 lần', ['<code>idf.py menuconfig</code> → 9.4, <code>flash monitor</code>. Nhấn dứt khoát 20 lần, đếm bằng miệng.'], {}, { thay: '"chong doi" = 20. "tho" ≥ 20, thường lớn hơn.', neu_khong: 'Cả 2 = 0: dây GPIO ở sai cột.' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Thêm tụ 100nF', ke_thua: true,
        buoc: [
          { ten: 'Tụ song song nút', lam: ['Tụ gốm 104: chân 10h và 12h (cột 10 = GPIO, cột 12 = GND).'], board: { them: [C] } },
          K.buocOmEsp(null, null, ['Đo cả lúc nhấn.']),
          K.camUsb('Cắm USB, nhấn 20 lần', ['Nhấn reset (RST) để đếm từ 0, rồi nhấn 20 lần.'], {}, { thay: '"tho" gần bằng 20 hơn phần 1.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: '20 lần nhấn', cot: ['Thô', 'Chống dội'], hang: [{ ten: 'Không tụ', du_doan: ['≥ 20', '20'] }, { ten: 'Có tụ 100nF', du_doan: ['≈ 20', '20'] }] }],
    bay: ['Tụ to (10µF) song song nút có pull-up yếu: τ ~0.5s, nút phản ứng chậm.'],
    robot: ['Nút xiaozhi: thư viện button của ESP-IDF đã chống dội bằng code. Công tắc hành trình/cảm biến va chạm của robot cũng nảy.'],
  });
})();
