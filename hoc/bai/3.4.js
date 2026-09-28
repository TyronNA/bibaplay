// Bài 3.4 — Tụ gốm 104 thay tụ hoá trong mạch 3.1. Tụ gốm không có cực.
(function () {
  const DA = K.day('dA', 'T+:5', '5a', 'do'), R = K.tro('r', ['5e', '5f'], '100k');
  const C = { id: 'c', loai: 'tu', kieu: 'gom', p: ['5h', '6h'], nhan: '100nF' }, DK = K.day('dK', '6j', 'B-:6', 'den');
  BAI.dangKy({
    id: '3.4',
    muc_tieu: 'Làm lại 3.1 với tụ gốm 100nF: nạp xong trong nháy mắt. Tụ gốm không để trữ điện mà để lọc nhiễu nhanh.',
    can: [K.can.tro('100k'), K.can.tugom(), ...K.coBan(3)],
    kien_thuc: `<p><code>104</code> = 10 × 10⁴ pF = 100 000pF = 100nF = 0.1µF, nhỏ hơn 100µF một nghìn lần. τ = 100k × 100nF = 10ms.</p>
      <p>Tụ gốm không có cực, cắm chiều nào cũng được. Nó nhỏ nhưng phản ứng rất nhanh: đặt sát chân nguồn chip để bù những cú sụt áp chỉ vài nano giây mà tụ hoá không theo kịp.</p>`,
    du_doan: '<p>Đồng hồ cập nhật 2–3 lần/giây: thấy nhảy lên ≈ 4.78 ngay.</p>',
    phan: [{
      ten: 'Phần 1 · Mạch 3.1 với tụ gốm',
      buoc: [
        K.buocPin(),
        { ten: 'Cắm 100k, tụ gốm và dây', lam: ['Như 3.1, thay tụ hoá bằng tụ gốm <code>104</code> ở 5h và 6h (chiều nào cũng được).'], board: { them: [DA, R, C, DK] } },
        K.buocOm('Ω 200k', '1', '1 (OL) gần như ngay: tụ nhỏ nạp xong tức thì.', 'Gần 0: nối tắt.'),
        K.lapPin('Lắp pin, đọc áp trên tụ', ['Que ở 2 chân tụ, <code>DCV 20</code>.'], { them: [K.dh('DCV 20', 'c.1', 'c.2', '≈ 4.78')] }, { thay: 'Lên ≈ 4.78 ngay.', neu_khong: '' }),
        K.thaoPin(),
      ],
    }],
    bang_do: [{ ten: 'So với 3.1', cot: ['τ tính', 'Thấy'], hang: [{ ten: 'Tụ hoá 100µF', du_doan: ['10 s', 'lên từ từ'] }, { ten: 'Tụ gốm 100nF', du_doan: ['10 ms', 'lên ngay'] }] }],
    bay: ['Đọc nhầm 104 thành 104µF hay 10⁴µF: đơn vị gốc là pF.'],
    robot: ['Mỗi chân nguồn IC/module một tụ 100nF sát chân + một tụ hoá chung cho cả mạch (bài 8.4).'],
  });
})();
