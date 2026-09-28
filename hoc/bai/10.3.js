// Bài 10.3 — Đo áp hộp pin: cầu 10k (6e→6f) + 10k (6j→−) chia đôi; điểm giữa cột 6 dưới → GPIO1. GND board ↔ − hộp pin.
(function () {
  const DA = K.day('dA', 'T+:6', '6a', 'do'), R1 = K.tro('r1', ['6e', '6f'], '10k'), R2 = K.tro('r2', ['6j', 'B-:6'], '10k');
  const ESP = K.esp({ GND: 'B-:20', G1: '6h' }, { x: 270 });
  BAI.dangKy({
    id: '10.3',
    muc_tieu: 'Robot tự biết pin yếu: cầu phân áp chia đôi áp hộp pin cho vừa dải ADC, code nhân 2.',
    nguon: 'USB (board) + 3×AAA (đo)',
    can: [...K.coBanEsp(2), K.can.pin(), K.can.tro('10k', 2)],
    kien_thuc: `<p>Pin 4.78V vượt dải ADC (≤ 2.9V) và vượt 3.6V chịu tối đa. Cầu 10k + 10k: <code>4.78/2 = 2.39V</code>, nằm gọn trong dải.</p>
      <p>Dây GND board ↔ − hộp pin là bắt buộc (bài 8.3). <b>+ hộp pin không bao giờ nối vào board.</b></p>
      <p>Thứ tự cấp điện: <b>cắm USB trước, lắp pin sau; tháo pin trước, rút USB sau</b>. Chip chưa có điện mà chân đã nhận áp từ pin là không tốt cho chip.</p>
      <p>Cầu 20k tổng lấy ~0.24mA liên tục từ pin: với robot thật thì dùng điện trở lớn hơn (100k + 100k) để đỡ tốn pin.</p>`,
    code: 'sandbox/esp32-bai/main/bai_10_3.c',
    du_doan: '<p>Điểm giữa ≈ 2.39V; code in pin ≈ 4.78V (±0.1V).</p>',
    phan: [{
      ten: 'Phần 1 · Đo điểm giữa bằng đồng hồ trước, rồi mới nối GPIO', cot: 34,
      buoc: [
        K.buocPin(),
        { ten: 'Cầu 10k + 10k', lam: ['Dây đỏ thanh + → 6a. 10k vắt qua rãnh 6e → 6f. 10k từ 6j cắm thẳng xuống thanh −.'], board: { them: [DA, R1, R2] } },
        K.buocOm('Ω 200k', '≈ 20.0', '≈ 20k.', 'Gần 10k: một con bị đi tắt.'),
        K.lapPin('Lắp pin, đo điểm giữa', ['Chưa nối board. <code>DCV 20</code>, que đỏ 6h, que đen thanh −.'], { them: [K.dh('DCV 20', '6h', 'B-:10', '≈ 2.39')] }, { thay: '≈ 2.3–2.45V, <b>dưới 2.9V</b>.', neu_khong: 'Trên 2.9V: sai điện trở. Không nối GPIO.' }),
        K.thaoPin(),
        { ten: 'Nối board: GND và GPIO1', lam: ['USB rút, hộp rỗng. Dây đực–cái: <code>GND</code> → thanh − dưới (cột 20). <code>1</code> → <b>6h</b>.'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cấp điện', kiem_truoc: true, lam: ['<code>Ω 200k</code>: 2 tiếp điểm hộp pin (≈ 20k như trước). Que đỏ 6g, que đen thanh + → phải ≈ 10k (GPIO không chạm thẳng +).'], board: { them: [K.dh('Ω 200k', '6g', 'T+:10', '≈ 10.0')] }, kiem: { thay: '≈ 20k và ≈ 10k.', neu_khong: 'Gần 0: dây GPIO cắm nhầm vào cột/thanh +. Sửa ngay.' } },
        { ...K.camUsb('Cắm USB, nạp 10.3', ['<code>idf.py menuconfig</code> → 10.3, <code>flash</code>.'], {}, { thay: '', neu_khong: '' }), ten: 'Cắm USB trước, nạp 10.3' },
        K.lapPin('Rồi mới lắp pin, xem monitor', ['<code>idf.py monitor</code>. So "pin = … mV" với đồng hồ đo thẳng 2 cực pin.'], {}, { thay: 'Lệch ≤ ~0.1V.', neu_khong: 'Lệch nhiều: 2 con 10k lệch nhau, đo từng con và sửa hệ số trong code.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Áp pin', cot: ['Đồng hồ (2 cực pin)', 'Điểm giữa', 'Code in'], hang: [{ ten: 'Số đo', du_doan: ['≈ 4.78', '≈ 2.39', '≈ 4780 mV'] }] }],
    bay: ['Nối + pin thẳng vào GPIO: 4.78V > 3.6V.', 'Quên GND chung: số đọc vô nghĩa.', 'Lắp pin khi board chưa cắm USB.'],
    robot: ['Robot báo pin yếu / tự về sạc. Pin lithium 2 cell (8.4V) thì cầu phải chia 3–4 lần, tính lại cho ≤ 2.9V.'],
  });
})();
