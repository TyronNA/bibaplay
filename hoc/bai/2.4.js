// Bài 2.4 — Cầu phân áp. Pin: dây đỏ vào thanh + trên (T+), dây đen vào thanh − dưới (B-).
(function () {
  const PIN_RONG = { id: 'pin', loai: 'pin', cong: 'T+:1', tru: 'B-:1', trang_thai: 'rong' };
  const NAU_DEN_CAM = ['#6D4C41', '#222', '#EF6C00'];
  const DO_DEN_CAM = ['#C62828', '#222', '#EF6C00'];
  const R1 = { id: 'r1', loai: 'tro', p: ['10e', '10f'], nhan: 'R1 10k', vong: NAU_DEN_CAM };
  const R2 = { id: 'r2', loai: 'tro', p: ['10j', 'B-:10'], nhan: 'R2 10k', vong: NAU_DEN_CAM };
  const DH_AP = hien => ({ id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: '10h', den: 'r2.2', hien });
  const DH_OM = hien => ({ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-', hien });

  const sd = SD;
  const soDoCau = sd.svg(300, 230, sd.pin(50, 110, '4.78V')
    + sd.day('50,110 50,30 160,30 160,40') + sd.tro(160, 40, 64, 'R1 (trên)') + sd.day('160,104 160,120')
    + sd.cham(160, 112) + sd.day('160,112 262,112 262,128') + sd.dongHo(262, 144, 'V') + sd.day('262,160 262,210 160,210')
    + sd.tro(160, 120, 64, 'R2 (dưới)') + sd.day('160,184 160,210 50,210 50,120') + sd.cham(160, 210)
    + sd.chu(176, 106, 'giữa', 'sd-mo'),
    'Cầu phân áp: R1 trên, R2 dưới, đồng hồ đo áp điểm giữa so với −');
  const soDoLdr = sd.svg(300, 230, sd.mui + sd.pin(50, 110, '4.78V')
    + sd.day('50,110 50,30 160,30 160,40') + sd.tro(160, 40, 64, 'R1 10k') + sd.day('160,104 160,120')
    + sd.cham(160, 112) + sd.day('160,112 250,112 250,128') + sd.dongHo(250, 144, 'V') + sd.day('250,160 250,210 160,210')
    + sd.ldr(160, 120, 64, 'quang trở') + sd.day('160,184 160,210 50,210 50,120') + sd.cham(160, 210),
    'Quang trở ở dưới: trời tối thì điện trở quang trở tăng, áp điểm giữa tăng');

  BAI.dangKy({
    id: '2.4',
    poster: [15, 16, 17],
    muc_tieu: 'Hai điện trở nối tiếp chia áp pin theo tỉ lệ giá trị của chúng. Thay con dưới bằng quang trở là có ngay một cảm biến ánh sáng: thế giới thật đổi → điện trở đổi → áp đổi, và áp thì vi điều khiển đọc được.',
    can: [
      { ten: 'Điện trở 10k (nâu-đen-cam)', tim: 'Điện trở 1/4W', sl: 2 },
      { ten: 'Điện trở 20k (đỏ-đen-cam); không có thì dùng 22k', tim: 'Điện trở 1/4W', sl: 1 },
      { ten: 'Quang trở GL5528', tim: 'GL5528', sl: 1 },
      { ten: 'Dây nhảy đực–đực', tim: 'Dây nhảy', sl: 2 },
      { ten: 'Breadboard MB-102', tim: 'MB-102', sl: 1 },
      { ten: 'Hộp pin 3×AAA + 3 viên AAA', tim: 'hộp pin', sl: 1 },
      { ten: 'Đồng hồ vạn năng', tim: 'đồng hồ vạn năng', sl: 1 },
    ],
    kien_thuc: `
      <p>R1 và R2 nối tiếp nên có chung một dòng: <code>I = U / (R1 + R2)</code>. Áp trên R2 là <code>I · R2</code>, nên:</p>
      <p><code>U_giữa = U · R2 / (R1 + R2)</code></p>
      <p>Cách nhớ: <b>con ở dưới lớn lên thì áp giữa tăng</b>, con ở trên lớn lên thì áp giữa giảm. Công thức chỉ đúng khi không lấy dòng từ điểm giữa. Lấy dòng ra thì xem bài 2.5 và kiểu C của bài 2.3.</p>
      <p>Poster bài 16 vẽ quang trở ở <b>trên</b> nhưng lại ghi "trời tối thì Vout cao hơn". Vẽ vậy thì tối là Vout <b>thấp</b> hơn. Bài này đặt quang trở ở <b>dưới</b>, nên tối thì áp tăng.</p>
      <p>Điện trở kim loại 1% hay có 5 vòng: 10k là nâu-đen-đen-đỏ-nâu, 20k là đỏ-đen-đen-đỏ-nâu. Cứ đo Ω từng con trước khi cắm (bài 1.3) cho chắc.</p>`,
    so_do: [
      { nhan: 'Cầu phân áp', svg: soDoCau, chu: 'Đồng hồ đo điểm giữa so với −. Dòng qua cầu 10k + 10k ≈ 0.24 mA.' },
      { nhan: 'Quang trở ở dưới', svg: soDoLdr, chu: 'Tối → quang trở tăng → áp giữa tăng. Đây là cách đèn tự bật khi tối ở bài 5.4.' },
    ],
    du_doan: `<div class="cuon"><table><thead><tr><th>R1 (trên)</th><th>R2 (dưới)</th><th>Ω đo trước khi cấp điện</th><th>U_giữa</th></tr></thead><tbody>
      <tr><td>10k</td><td>10k</td><td>≈ 20.0</td><td>4.78 × 10/20 ≈ 2.39 V</td></tr>
      <tr><td>10k</td><td>20k</td><td>≈ 30.0</td><td>4.78 × 20/30 ≈ 3.19 V</td></tr>
      <tr><td>20k</td><td>10k</td><td>≈ 30.0</td><td>4.78 × 10/30 ≈ 1.59 V</td></tr>
      <tr><td>10k</td><td>quang trở</td><td>> 10.0, tuỳ ánh sáng</td><td>phòng ≈ 1.6–3.2 V · che tay ≈ 4.3–4.7 V · rọi đèn ≈ 0.4–1 V</td></tr>
      </tbody></table></div>
      <p>Dùng 22k thay 20k: 3.29 V và 1.49 V. Khoảng số của quang trở chỉ là ước lượng, vì nó tuỳ đèn phòng bạn; GL5528 cỡ vài kΩ tới vài chục kΩ khi sáng, lên cỡ MΩ khi tối.</p>`,
    sau: `<h3>Chọn R1 thế nào cho cảm biến "nhạy" nhất</h3>
      <p>Quang trở đổi từ R_sáng tới R_tối. Áp giữa: <code>U(R) = U·R / (R1 + R)</code>. Muốn chênh lệch giữa 2 trạng thái lớn nhất thì chọn R1 sao cho <code>U(R_tối) − U(R_sáng)</code> cực đại. Lấy đạo hàm theo R1 và cho bằng 0, ra:</p>
      <p><code>R1 = √(R_sáng · R_tối)</code> (trung bình nhân).</p>
      <p>Ví dụ quang trở 5k khi sáng phòng, 100k khi che tay: <code>R1 = √(5k × 100k) ≈ 22k</code>. Khi đó áp giữa chạy 4.78 × 5/27 ≈ 0.89V tới 4.78 × 100/122 ≈ 3.92V, chênh 3.0V. Dùng 10k thì 1.59 → 4.35V, chênh 2.76V: cũng tốt, chỉ kém chút ít.</p>
      <h3>Độ nhạy quanh một điểm</h3>
      <p>Đạo hàm <code>dU/dR = U·R1/(R1 + R)²</code>: lớn nhất khi R gần R1. Cầu phân áp đo tốt nhất ở vùng R ≈ R1, ở 2 đầu (R ≪ R1 hoặc R ≫ R1) áp gần như đứng yên dù R còn đổi.</p>`,
    hoi: [
      ['R1 = 10k ở trên, R2 = 4.7k ở dưới, pin 4.78V. U_giữa?', '4.78 × 4.7 / 14.7 ≈ <b>1.53V</b>.'],
      ['Quang trở chạy 2k (sáng) tới 200k (tối). Chọn R1 bao nhiêu?', '√(2k × 200k) = <b>20k</b>.'],
      ['Đặt quang trở ở trên, 10k ở dưới. Che tay thì áp giữa lên hay xuống?', '<b>Xuống</b>: con trên lớn lên thì áp giữa giảm.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · 10k + 10k',
        buoc: [
          { ten: 'Nối hộp pin rỗng', lam: ['Tháo hết pin. Dây đỏ vào thanh <b>+ trên</b>, dây đen vào thanh <b>− dưới</b>.'], board: { them: [PIN_RONG] } },
          {
            ten: 'Ráp cầu',
            lam: ['Đo Ω 2 con 10k trước khi cắm, ghi vào bảng.', 'Dây đỏ từ thanh + (cột 9) sang <b>10a</b>.', 'R1 vắt qua rãnh: <b>10e → 10f</b>.', 'R2 từ <b>10j</b> cắm thẳng xuống thanh − dưới.',
              'Điểm giữa là cả cột 10 phía dưới (10f–10j), chỗ chân dưới R1 và chân trên R2 gặp nhau.'],
            board: { them: [{ id: 'd1', loai: 'day', tu: 'T+:9', den: '10a', mau: 'do' }, R1, R2] },
          },
          {
            ten: 'Đo trước khi cấp điện', kiem_truoc: true,
            lam: ['Núm <code>Ω 200k</code>, 2 que chạm 2 tiếp điểm trong hộp pin.'],
            board: { them: [DH_OM('≈ 20.0')] },
            kiem: { thay: '≈ <code>20.0</code> (tổng 2 con vừa đo).', neu_khong: 'Gần 0: có chỗ nối tắt. Ra ≈ 10.0: một con đang bị nối tắt (2 chân chung cột). Không lắp pin.' },
          },
          {
            ten: 'Lắp pin, đo điểm giữa', cap_dien: true,
            lam: ['Lắp pin. Núm <code>DCV 20</code>. Que đỏ vào điểm giữa (chạm chân R2 ở 10j hoặc cắm vào 10h), que đen chạm chân dưới của R2.', 'Đo luôn áp pin, ghi cả hai.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' } }, them: [DH_AP('≈ 2.39')] },
            kiem: { thay: '≈ một nửa áp pin.', neu_khong: 'Ra bằng áp pin hoặc 0: que đang không chạm điểm giữa.' },
          },
        ],
      },
      {
        ten: 'Phần 2 · Đổi tỉ lệ', ke_thua: true,
        gioi_thieu: 'Mỗi lần đổi điện trở: tháo pin, đổi, đo Ω, rồi mới lắp pin.',
        buoc: [
          {
            ten: 'Tháo pin, thay R2 bằng 20k',
            lam: ['Tháo pin. Rút R2 ra, cắm con 20k vào đúng chỗ đó (10j → thanh −).'],
            board: { sua: { pin: { trang_thai: 'rong' }, r2: { nhan: 'R2 20k', vong: DO_DEN_CAM } } },
          },
          {
            ten: 'Đo trước khi cấp điện', kiem_truoc: true, lam: ['Như phần 1.'], board: { them: [DH_OM('≈ 30.0')] },
            kiem: { thay: '≈ <code>30.0</code> (32.0 nếu dùng 22k).', neu_khong: 'Gần 0 hoặc khác xa: kiểm lại chỗ cắm. Không lắp pin.' },
          },
          {
            ten: 'Lắp pin, đo', cap_dien: true, lam: ['Đo điểm giữa như phần 1.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' } }, them: [DH_AP('≈ 3.19')] },
            kiem: { thay: '≈ 3.19 V: R2 lớn lên thì áp giữa tăng.', neu_khong: 'Ra ≈ 1.59: đang cắm 20k ở trên. Tháo pin, kiểm lại.' },
          },
          {
            ten: 'Tháo pin, đổi chỗ: 20k lên trên, 10k xuống dưới',
            lam: ['Tháo pin. R1 = 20k (10e → 10f), R2 = 10k (10j → thanh −). Đo Ω trước khi cấp điện: ≈ 30.0. Lắp pin, đo điểm giữa.'],
            board: { sua: { pin: { trang_thai: 'rong' }, r1: { nhan: 'R1 20k', vong: DO_DEN_CAM }, r2: { nhan: 'R2 10k', vong: NAU_DEN_CAM } } },
            kiem: { thay: 'Ω ≈ 30.0, rồi áp giữa ≈ 1.59 V.', neu_khong: 'Ω gần 0: không lắp pin.' },
          },
        ],
      },
      {
        ten: 'Phần 3 · Quang trở thay cho R2', ke_thua: true,
        buoc: [
          {
            ten: 'Tháo pin, R1 = 10k, R2 = quang trở',
            lam: ['Tháo pin. R1 trả về 10k. Rút R2, cắm quang trở vào đúng chỗ đó: một chân <b>10j</b>, chân kia vào thanh − dưới. Quang trở không có chiều, cắm chân nào cũng được.'],
            board: { sua: { pin: { trang_thai: 'rong' }, r1: { nhan: 'R1 10k', vong: NAU_DEN_CAM } }, bo: ['r2'], them: [{ id: 'ldr', loai: 'ldr', p: ['10j', 'B-:10'], nhan: 'quang trở' }] },
          },
          {
            ten: 'Đo trước khi cấp điện', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>, đo ở hộp pin. Thử che tay lên quang trở trong lúc đo.'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-', hien: '> 10.0' }] },
            kiem: { thay: 'Luôn <b>lớn hơn 10.0</b>. Che tay thì số tăng, có thể vượt thang (<code>1</code>).', neu_khong: 'Dưới 10.0: R1 hoặc quang trở đang bị nối tắt. Không lắp pin.' },
          },
          {
            ten: 'Lắp pin, đo 3 điều kiện sáng', cap_dien: true,
            lam: ['Lắp pin. Đo điểm giữa ở 3 điều kiện: đèn phòng bình thường, lấy tay che kín quang trở, rọi đèn pin điện thoại sát vào.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' } }, them: [{ id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: '10h', den: 'ldr.2', hien: '?' }] },
            kiem: { thay: 'Che tay → áp <b>tăng</b>. Rọi đèn → áp <b>giảm</b>.', neu_khong: 'Ngược chiều: quang trở đang ở trên. Tháo pin, kiểm lại.' },
          },
        ],
      },
    ],
    bang_do: [
      { ten: 'Đo Ω từng điện trở trước khi cắm', cot: ['10k con 1', '10k con 2', '20k (hoặc 22k)'], hang: [{ ten: 'Ω đo được', du_doan: ['9.5–10.5', '9.5–10.5', '19–21'] }] },
      {
        ten: 'Áp điểm giữa', cot: ['Ω trước khi cấp điện', 'U pin', 'U_giữa'],
        hang: [
          { ten: '10k / 10k', du_doan: ['≈ 20.0', '≈ 4.78', '≈ 2.39'] },
          { ten: '10k trên / 20k dưới', du_doan: ['≈ 30.0', '≈ 4.78', '≈ 3.19'] },
          { ten: '20k trên / 10k dưới', du_doan: ['≈ 30.0', '≈ 4.78', '≈ 1.59'] },
        ],
      },
      { ten: 'Quang trở ở dưới', cot: ['U_giữa'], hang: [{ ten: 'Đèn phòng', du_doan: ['≈ 1.6–3.2'] }, { ten: 'Che tay kín', du_doan: ['≈ 4.3–4.7'] }, { ten: 'Rọi đèn pin', du_doan: ['≈ 0.4–1'] }] },
    ],
    bay: [
      'Đặt quang trở ở trên mà tưởng ở dưới: mọi thứ ngược chiều. Nhớ câu "con dưới lớn lên thì áp giữa tăng".',
      '2 chân một điện trở chung một cột: con đó bị nối tắt, áp giữa ra 0 hoặc bằng áp pin.',
      'Lấy điểm giữa để cấp điện cho LED hay motor: áp tụt ngay (bài 2.5). Cầu phân áp để đo, không để làm nguồn.',
    ],
    robot: [
      'Báo pin robot: pin 2S lithium (tới 8.4V) qua cầu phân áp xuống dưới 3.3V rồi vào ADC của ESP32 (chương 10). Chọn tỉ lệ sao cho pin đầy vẫn dưới 3.3V.',
      'Cảm biến ánh sáng, nhiệt điện trở (NTC), cảm biến uốn: đều là "một điện trở đổi theo thế giới thật" đặt vào cầu phân áp.',
    ],
  });
})();
