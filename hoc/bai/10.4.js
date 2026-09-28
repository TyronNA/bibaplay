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
    so_do: [{ nhan: 'ADC so với đồng hồ', svg: SD.svg(320, 220, SD.day('50,190 300,190') + SD.day('50,190 50,20') + SD.chu(300, 206, 'đồng hồ (V)', 'sd-mo', 'end') + SD.chu(56, 18, 'ADC hiệu chuẩn (mV)', 'sd-mo')
      + SD.day('50,190 270,30').replace('sd-net', 'sd-net" stroke-dasharray="4 4') + '<polyline points="50,190 58,190 70,178 120,142 170,106 230,64 245,52 262,52 300,52" class="sd-nong"/>'
      + SD.chu(300, 44, 'đứng ở ~2.9V', 'sd-xau', 'end') + SD.chu(78, 176, 'sát 0: đọc 0', 'sd-xau', 'start') + SD.chu(210, 100, 'lý tưởng', 'sd-mo'),
      'Đường cong đo được so với đường lý tưởng: sát 0 đọc 0, trên 2.9V đứng yên'), chu: 'Giữa dải bám đường lý tưởng; 2 đầu lệch. Hình minh hoạ, không phải số đo.' }],
    sau: `<h3>INL, DNL là gì</h3>
      <p><b>DNL</b> (phi tuyến vi phân): các bậc thang của ADC không đều nhau; bậc rộng nhất và hẹp nhất lệch bao nhiêu LSB so với 1 LSB. <b>INL</b> (phi tuyến tích phân): cả đường bậc thang cong so với đường thẳng lý tưởng bao nhiêu LSB. Datasheet: DNL ±4, INL ±8 LSB — tức đường cong lệch tối đa ~6mV so với đường thẳng; phần lệch lớn hơn nằm ở độ lệch gốc và độ dốc, thứ hiệu chuẩn sửa.</p>
      <h3>Hiệu chuẩn 2 điểm</h3>
      <p>Nếu chỉ có lệch gốc và lệch dốc: <code>U = a·N + b</code>. Đo 2 điểm (N₁, U₁), (N₂, U₂) bằng đồng hồ → <code>a = (U₂ − U₁)/(N₂ − N₁)</code>, <code>b = U₁ − a·N₁</code>. Chọn 2 điểm ở 20% và 80% dải, tránh 2 đầu. ESP-IDF làm việc này bằng số đo nhà máy ghi sẵn trong eFuse của từng chip.</p>
      <h3>Nhiều điểm: bình phương tối thiểu</h3>
      <p>Với 10 cặp số đo, tìm a, b sao cho tổng bình phương sai lệch nhỏ nhất: <code>a = Σ(N−N̄)(U−Ū) / Σ(N−N̄)²</code>, <code>b = Ū − a·N̄</code>. Bảng số đo của bạn đủ để tự làm trong bảng tính và so với kết quả hiệu chuẩn của ESP-IDF.</p>`,
    hoi: [
      ['Hai điểm hiệu chuẩn: N = 800 → 650mV, N = 3200 → 2560mV. Tính a, b.', 'a = 1910/2400 ≈ <b>0.796 mV/đơn vị</b>; b = 650 − 0.796 × 800 ≈ <b>13mV</b>.'],
      ['Vì sao không chọn điểm hiệu chuẩn ở 0V và 3.2V?', 'Hai đầu dải ADC bị phi tuyến/bão hoà (đọc 0, đứng ở 4095): điểm đó sai thì cả đường sai.'],
      ['Đồng hồ ±0.5% cũng có sai số. Vậy "số thật" ở đâu?', 'Không có: đây là so 2 dụng cụ. Muốn tốt hơn thì so với một nguồn chuẩn chính xác hơn cả hai.'],
    ],
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
