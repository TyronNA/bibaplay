// Bài 5.1 — Tìm chân S8050 bằng thang diode (và lỗ hFE nếu đồng hồ có). Không pin.
(function () {
  const Q = { id: 'q', loai: 'npn', e: '10e', b: '11e', c: '12e', ten_chan: ['1', '2', '3'] };
  const sd = SD;
  const soDo = sd.svg(300, 150, sd.diode(110, 20, 60, '') + sd.diode(190, 20, 60, '') + sd.day('110,20 190,20') + sd.cham(150, 20) 
    + sd.chu(140, 16, 'B', 'sd-chu', 'end') + sd.chu(110, 100, 'E', 'sd-chu', 'middle') + sd.chu(190, 100, 'C', 'sd-chu', 'middle') + sd.chu(150, 130, '2 diode chung anode ở B', 'sd-mo', 'middle'),
  'NPN đo bằng thang diode trông như 2 diode chung anode ở chân B');
  BAI.dangKy({
    id: '5.1',
    poster: [24],
    muc_tieu: 'Xác định chân E, B, C của S8050 bằng đồng hồ. <b>Chưa có số đo xác nhận thì không làm các bài 5.x sau</b>: cắm nhầm chân là transistor không chạy hoặc nóng.',
    can: [K.can.npn(), K.can.bb(), K.can.dh()],
    kien_thuc: `<p>NPN nhìn từ đồng hồ giống 2 diode quay lưng vào nhau: B → E và B → C đều dẫn (~0.6–0.7V), còn E ↔ C thì không dẫn chiều nào.</p>
      <p>Tìm B: chân mà khi que <b>đỏ</b> đặt vào đó, que đen chạm 2 chân kia đều ra số. Phân biệt E và C: B–E thường cao hơn B–C vài chục mV.</p>
      <p>Đồng hồ có lỗ <code>hFE</code> (4 lỗ E B C E ghi NPN/PNP): cắm đúng chiều ra 100–400; E và C đảo chỗ thì ra số nhỏ (~5–20). Đây là cách xác nhận chắc nhất.</p>
      <p>Poster ghi B-C-E; S8050 TO-92 thường là <b>E-B-C</b> (mặt phẳng hướng về mình, chân chúc xuống, trái sang phải). Lô của ông phải đo mới biết.</p>`,
    so_do: [{ nhan: 'Nhìn bằng đồng hồ', svg: soDo, chu: 'Que đỏ ở B: dẫn sang cả E và C.' }],
    phan: [{
      ten: 'Phần 1 · Dò 6 cặp chân',
      buoc: [
        { ten: 'Cắm transistor', lam: ['Mặt phẳng có chữ hướng về phía mình, chân chúc xuống. Cắm 3 chân vào 10e, 11e, 12e. Gọi chân trái → phải là 1, 2, 3.'], board: { them: [Q] } },
        { ten: 'Que đỏ ở chân 2', lam: ['Thang diode. Que đỏ chân 2, que đen lần lượt chân 1 rồi chân 3.'], board: { them: [K.dh('diode ▶|', 'q.B', 'q.E', '≈ 0.70')] }, kiem: { thay: 'Nếu 2 là B: cả 2 lần ra ~0.6–0.7.', neu_khong: 'Ra 1: 2 chưa chắc là B, thử que đỏ ở chân 1 và chân 3 (bảng dưới).' } },
        { ten: 'Đo đủ 6 cặp', lam: ['Mỗi cặp đo 2 chiều, ghi vào bảng. Chân mà que đỏ đặt lên dẫn sang cả 2 chân kia là B. Cặp B–chân nào ra số cao hơn thì chân đó là E.'], board: { them: [K.dh('diode ▶|', 'q.E', 'q.C', '1')] }, kiem: { thay: 'Đúng 2 lần ra số (cùng que đỏ ở B), 4 lần ra 1.', neu_khong: 'Nhiều hơn 2 lần ra số, hoặc có cặp ra gần 0: transistor hỏng, lấy con khác.' } },
        { ten: 'Xác nhận bằng lỗ hFE (nếu có)', lam: ['Rút transistor, cắm vào lỗ <b>NPN</b> theo E-B-C vừa tìm. Núm về <code>hFE</code>. Rồi đổi chỗ E và C, đọc lại.'],
          hinh: sd.svg(300, 110, `<rect x="80" y="20" width="140" height="50" rx="6" class="sd-net"/>` + ['E', 'B', 'C', 'E'].map((c, i) => `<circle cx="${105 + i * 30}" cy="40" r="6" class="sd-net"/>` + sd.chu(105 + i * 30, 62, c, 'sd-chu', 'middle')).join('') + sd.chu(150, 94, 'lỗ hFE loại NPN trên đồng hồ', 'sd-mo', 'middle'), 'Lỗ đo hFE của đồng hồ'),
          kiem: { thay: 'Đúng chiều: 100–400. Đảo E/C: số nhỏ hẳn.', neu_khong: 'Cả 2 chiều đều nhỏ: B chưa đúng, đo lại thang diode.' } },
      ],
    }],
    bang_do: [
      { ten: 'Thang diode (que đỏ → que đen)', cot: ['1→2', '2→1', '1→3', '3→1', '2→3', '3→2'], hang: [{ ten: 'Số đo', du_doan: ['1', '≈ 0.70', '1', '1', '≈ 0.68', '1'] }] },
      { ten: 'Kết luận', cot: ['Chân 1', 'Chân 2', 'Chân 3', 'hFE đúng chiều', 'hFE đảo E/C'], hang: [{ ten: 'Của ông', du_doan: ['E?', 'B?', 'C?', '100–400', '< 30'] }] },
    ],
    bay: ['Tin thứ tự chân trên poster/hình mạng: mỗi hãng/lô một kiểu.', 'Đo lúc transistor còn trong mạch: đường song song làm số sai.'],
    robot: ['Mọi transistor/MOSFET mới mua: dò chân trước khi hàn.'],
  });
})();
