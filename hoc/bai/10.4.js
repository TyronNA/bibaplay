// Bài 10.4 — Sai số ADC: mạch 10.1, đo nhiều mức sát 0 và sát đỉnh.
(function () {
  const BT = { id: 'bt', loai: 'bientro', A: '10d', W: '12d', B: '14d' };
  const DA = K.day('dA', 'T+:10', '10a', 'do'), DB = [K.day('dB1', '14e', '14f', 'den'), K.day('dB2', '14j', 'B-:14', 'den')];
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3', G1: '12b' });
  const muc = ['0.05', '0.2', '0.5', '1.0', '1.5', '2.0', '2.5', '2.8', '3.0', '3.2'];
  BAI.dangKy({
    id: '10.4',
    muc_tieu: 'Lập bảng lệch giữa ADC và đồng hồ trên cả dải, thấy ADC kém ở sát 0 và trên ~2.9V, và thấy hiệu chuẩn sửa được bao nhiêu.',
    can: [...K.coBanEsp(4), K.can.bientro()],
    kien_thuc: `<p>Datasheet: DNL ±4 LSB, INL ±8 LSB; sau hiệu chuẩn, sai số tổng ±50mV ở dải 0–2900mV (suy hao 12dB). Muốn chính xác hơn ở áp nhỏ thì dùng suy hao nhỏ hơn (0dB đo tới 850mV, ±5mV).</p>
      <p>Code đã lấy trung bình 32 lần mỗi số để bớt nhiễu. Đồng hồ vạn năng cũng có sai số (~0.5% + vài chữ số): đây là so 2 dụng cụ, không có "số thật".</p>`,
    code: 'sandbox/esp32-bai/main/bai_10_1.c',
    du_doan: '<p>Giữa dải: mV hiệu chuẩn lệch đồng hồ vài chục mV. Dưới ~0.05V: ADC có thể đọc 0. Trên ~2.9V: đứng ở 4095. Cột tính thẳng lệch lớn nhất ở giữa–cao.</p>',
    phan: [{
      ten: 'Phần 1 · 10 mức',
      buoc: [
        { ten: 'Mạch 10.1', lam: ['Như bài 10.1: biến trở kiểu B cấp 3V3, W → GPIO1.'], board: { them: [BT, DA, ...DB, ESP] } },
        K.buocOmEsp('≈ 10k song song mốc, vặn không đổi.', 'Gần 0 hoặc vặn mà đổi: W đang nối vào thanh nguồn.', ['Vặn qua lại trong lúc đo.']),
        K.camUsb('Cắm USB, nạp 10.1', ['<code>idf.py menuconfig</code> → 10.1, <code>flash monitor</code>.'], {}, { thay: 'Số chạy khi vặn.', neu_khong: '' }),
        { ten: 'Ghi 10 mức', lam: ['Vặn tới từng mức trong bảng (theo đồng hồ, que đỏ 12c, que đen thanh −), ghi cả 3 số của monitor. Tính lệch = mV hiệu chuẩn − đồng hồ.'], board: { them: [K.dh('DCV 20', 'bt.W', 'B-:16', '?')] }, kiem: { thay: 'Bảng đủ 10 dòng.', neu_khong: '' } },
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Lệch ADC', cot: ['Đồng hồ (V)', 'Thô', 'mV hiệu chuẩn', 'Lệch (mV)'], hang: muc.map(v => ({ ten: `≈ ${v} V`, du_doan: [v, '', +v >= 2.9 ? 'đứng' : '', '≤ ±50'] })) }],
    bay: ['Tin số ADC ở sát 0V hoặc trên 2.9V.', 'Đo mà đồng hồ đang ở thang 200V: mất số lẻ.'],
    robot: ['Thiết kế cầu phân áp sao cho áp cần đo nằm giữa dải (0.3–2.5V), không sát 2 đầu.'],
  });
})();
