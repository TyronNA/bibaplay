// Bài 1.3 — Đo điện trở. Không dùng pin.
(function () {
  const R1 = K.tro('r1', ['3c', '7c'], '220'), R2 = K.tro('r2', ['10c', '14c'], '1k'), R3 = K.tro('r3', ['17c', '21c'], '10k');
  const sd = SD;
  const soDoSai = sd.svg(300, 150, sd.day('40,30 260,30') + sd.day('40,120 260,120') + sd.tro(110, 30, 90, '10k') + sd.tro(200, 30, 90, '10k')
    + sd.dongHo(40, 75, 'Ω') + sd.day('40,30 40,59') + sd.day('40,91 40,120') + sd.chu(160, 142, 'đồng hồ thấy 5k, không phải 10k', 'sd-xau', 'middle'),
  'Đo một điện trở còn nằm song song với điện trở khác thì ra giá trị của cả cụm');

  BAI.dangKy({
    id: '1.3',
    poster: [4],
    muc_tieu: 'Đọc giá trị điện trở bằng vòng màu, đo lại bằng đồng hồ, và thấy vì sao phải đo khi điện trở <b>không</b> nằm trong mạch.',
    can: [K.can.tro('220', 1), K.can.tro('1k', 1), K.can.tro('10k', 3), K.can.bb(), K.can.dh()],
    kien_thuc: `
      <p>Kit 4 vòng: 2 vòng đầu là 2 chữ số, vòng 3 là số mũ của 10, vòng 4 (vàng kim) là sai số ±5%. Ví dụ đỏ-đỏ-nâu = 22 × 10¹ = 220Ω. Kit 5 vòng: 3 vòng số + vòng mũ + vòng sai số (nâu = ±1%).</p>
      <p>Thang Ω: đồng hồ tự đẩy một dòng nhỏ qua điện trở rồi đo áp. Nên <b>không có pin</b> nào trong mạch lúc đo, và không có đường nào khác song song với con đang đo.</p>`,
    so_do: [{ nhan: 'SAI · đo trong mạch', xau: true, svg: soDoSai, chu: 'Hai con 10k cùng cột: đồng hồ đo cả cụm = 5k.' }],
    du_doan: '<p>Mỗi con nằm trong ±5% giá trị ghi: 220Ω → 209–231; 1k → 950–1050; 10k → 9.5k–10.5k.</p>',
    sau: `<h3>Vì sao giá trị điện trở "lạ" như 2.2k, 4.7k</h3>
      <p>Giá trị điện trở đi theo dãy E, chia đều theo <b>tỉ lệ</b> chứ không theo hiệu. Dãy E12 (±10%) có 12 giá trị mỗi thập phân: 1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2. Mỗi giá trị lớn hơn con trước khoảng <code>10^(1/12) ≈ 1.21</code> lần.</p>
      <p>Chia như vậy để các dải sai số nối vừa khít nhau: 4.7k ±10% phủ 4.23–5.17k, 5.6k ±10% phủ 5.04–6.16k. Con nào ra khỏi dải của mình thì rơi vào dải con kế bên, nhà máy không phải bỏ con nào. Dãy E24 (±5%) chia mịn hơn: 1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2…</p>
      <h3>Thang Ω hoạt động thế nào</h3>
      <p>Đồng hồ tự đẩy một dòng nhỏ đã biết qua điện trở rồi đo áp: <code>R = U / I</code>. Nên có pin trong mạch là đồng hồ đo lẫn áp của pin. Có đường song song là nó đo cả đường đó. Cầm 2 que bằng 2 tay khi đo 100k: người (~1MΩ) song song, ra <code>100k ∥ 1M ≈ 91k</code>.</p>`,
    hoi: [
      ['Vòng màu vàng · tím · đỏ · vàng kim là bao nhiêu, và số đo hợp lệ nằm trong khoảng nào?', '47 × 10² = <b>4.7kΩ</b>, ±5% → 4.47–4.94kΩ.'],
      ['Đo con 1M trong khi 2 tay giữ 2 chân (tay ~1MΩ). Số hiện ra khoảng bao nhiêu?', '1M ∥ 1M = <b>500k</b>. Đó là lý do không cầm cả 2 chân khi đo con lớn.'],
      ['Một con ghi 220Ω ±5% đo ra 226Ω. Hỏng không?', 'Không. Khoảng hợp lệ là 209–231Ω.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Đo từng con, không có gì khác trong mạch',
        buoc: [
          { ten: 'Cắm 3 điện trở, mỗi con 2 cột riêng', lam: [`220Ω (${K.tenVong('220')}) 3c–7c, 1k (${K.tenVong('1k')}) 10c–14c, 10k (${K.tenVong('10k')}) 17c–21c. Không có dây, không có pin.`], board: { them: [R1, R2, R3] } },
          { ten: 'Đo 220Ω', lam: ['Núm <code>Ω 2k</code>. Chạm que vào 2 chân. Tay không chạm vào kim loại của que.'], board: { them: [K.dh('Ω 2k', 'r1.1', 'r1.2', '≈ 220')] }, kiem: { thay: '209–231.', neu_khong: 'Ra 1 (quá thang): đang ở thang nhỏ hơn. Ra số khác hẳn: đọc lại vòng màu (xoay chiều đọc, vòng vàng kim ở bên phải).' } },
          { ten: 'Đo 1k', lam: ['Giữ <code>Ω 2k</code>.'], board: { them: [K.dh('Ω 2k', 'r2.1', 'r2.2', '≈ 1000')] }, kiem: { thay: '950–1050.', neu_khong: '' } },
          { ten: 'Đo 10k', lam: ['Núm <code>Ω 20k</code>.'], board: { them: [K.dh('Ω 20k', 'r3.1', 'r3.2', '≈ 10.00')] }, kiem: { thay: '9.5–10.5.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 2 · Vì sao phải đo ngoài mạch',
        buoc: [
          { ten: 'Thêm một 10k song song', lam: ['Cắm thêm 1 con 10k vào <b>17d–21d</b>: cùng 2 cột với con 10k cũ, tức 2 con song song.'], board: { them: [K.cu(R1), K.cu(R2), K.cu(R3), K.tro('r4', ['17d', '21d'], '10k')] } },
          { ten: 'Đo lại con 10k cũ', lam: ['Chạm que vào 2 chân con 10k ở hàng c.'], board: { them: [K.dh('Ω 20k', 'r3.1', 'r3.2', '≈ 5.00')] }, kiem: { thay: '≈ 5k: đồng hồ đo cả 2 con, <code>10k·10k/(10k+10k)</code>.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 3 · Điện trở cơ thể',
        buoc: [{
          ten: 'Cầm 2 que bằng 2 tay', lam: ['Rút hết khỏi breadboard. Núm <code>Ω 2M</code> (hoặc 2000k). Tay trái bóp đầu que đỏ, tay phải bóp đầu que đen.', 'Làm lại với tay hơi ướt.'],
          hinh: sd.svg(300, 120, sd.dongHo(150, 30, 'Ω') + sd.day('134,30 70,30 70,80') + sd.day('166,30 230,30 230,80') + sd.chu(70, 100, 'tay trái', 'sd-chu', 'middle') + sd.chu(230, 100, 'tay phải', 'sd-chu', 'middle'), 'Hai tay nắm hai que đo'),
          kiem: { thay: 'Vài trăm kΩ tới vài MΩ, số trôi liên tục; tay ướt thì nhỏ đi rõ.', neu_khong: '1 (quá thang): da khô quá, bóp chặt hơn.' },
        }],
      },
    ],
    bang_do: [{ ten: 'Vòng màu vs đo', cot: ['Đọc vòng màu', 'Đo được', 'Lệch %'], hang: [{ ten: '220Ω', du_doan: ['220', '209–231', '≤ 5'] }, { ten: '1k', du_doan: ['1000', '950–1050', '≤ 5'] }, { ten: '10k', du_doan: ['10000', '9.5k–10.5k', '≤ 5'] }, { ten: '2 con 10k song song', du_doan: ['', '≈ 5k', ''] }, { ten: 'Cơ thể (khô / ướt)', du_doan: ['', 'MΩ / trăm kΩ', ''] }] }],
    bay: ['Đo điện trở trong mạch đang có pin: số sai, có thể hỏng thang Ω.', 'Cầm cả 2 chân điện trở bằng tay khi đo con lớn (≥ 100k): đồng hồ đo luôn cả người, số thấp hơn thật.', 'Đọc vòng màu ngược chiều: vòng sai số (vàng kim/bạc) luôn ở bên phải.'],
    robot: ['Kiểm điện trở trước khi hàn vào mạch: một con sai giá trị là cả mạch lệch mà khó tìm.'],
  });
})();
