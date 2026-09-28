// Bài 2.3 — Biến trở. Pin: dây đỏ vào thanh + trên (T+), dây đen vào thanh − dưới (B-) cho cả bài.
(function () {
  const PIN_RONG = { id: 'pin', loai: 'pin', cong: 'T+:1', tru: 'B-:1', trang_thai: 'rong' };
  const BT = { id: 'bt', loai: 'bientro', A: '10d', W: '12d', B: '14d' };
  const DAY_A = { id: 'dA', loai: 'day', tu: 'T+:9', den: '10a', mau: 'do' };
  const R220 = { id: 'r', loai: 'tro', p: ['12e', '12f'], nhan: '220Ω', vong: ['#C62828', '#C62828', '#6D4C41'] };
  const LED = { id: 'led', loai: 'led', a: '12i', k: '13i', mau: 'do', nhan: 'LED đỏ' };
  const DAY_K = { id: 'dK', loai: 'day', tu: '13j', den: 'B-:13', mau: 'den' };
  const DAY_B1 = { id: 'dB1', loai: 'day', tu: '14e', den: '14f', mau: 'den' };
  const DAY_B2 = { id: 'dB2', loai: 'day', tu: '14j', den: 'B-:14', mau: 'den' };
  const cu = it => ({ ...it, moi: false });

  const sd = SD;
  const soDoA = sd.svg(300, 240, sd.mui
    + sd.pin(50, 110, '4.78V') + sd.day('50,110 50,40 170,40 170,50')
    + sd.bienTro(170, 50, 90) + sd.day('170,140 170,152') + sd.chu(162, 160, 'B: bỏ trống', 'sd-mo', 'end')
    + sd.day('210,95 250,95 250,100') + sd.tro(250, 100, 56, '220Ω') + sd.led(250, 156)
    + sd.day('250,196 250,215 50,215 50,120'),
    'Kiểu A: pin, đoạn A–W của biến trở, 220 ôm và LED nối tiếp');
  const soDoB = sd.svg(300, 240, sd.mui
    + sd.pin(50, 110, '4.78V') + sd.day('50,110 50,40 170,40 170,50')
    + sd.bienTro(170, 50, 120) + sd.day('170,170 170,215 50,215 50,120')
    + sd.day('210,110 255,110 255,128') + sd.dongHo(255, 144, 'V') + sd.day('255,160 255,215 170,215') + sd.cham(170, 215)
    + sd.chu(70, 30, 'I ≈ 0.48 mA, không đổi', 'sd-mo'),
    'Kiểu B: pin nối hai đầu A và B, con trượt W chỉ nối vào đồng hồ đo áp');
  const soDoChay = sd.svg(300, 240, sd.mui
    + sd.pin(50, 110) + sd.day('50,110 50,40 170,40 170,50', true)
    + sd.tro(170, 50, 60, '', true) + sd.tro(170, 110, 60) + sd.day('170,170 170,180')
    + sd.chu(184, 64, 'A') + sd.chu(184, 104, 'W') + sd.chu(162, 184, 'B: bỏ trống', 'sd-mo', 'end')
    + sd.day('236,110 182,110', true) + sd.day('236,110 236,215 50,215 50,120', true)
    + sd.chu(80, 30, 'vặn W về A → gần 0 Ω', 'sd-xau') + sd.chu(66, 234, '= nối tắt pin', 'sd-xau'),
    'Lần đã cháy: pin nối chân A và con trượt W, vặn W về A thì còn gần 0 ôm vắt qua pin');

  BAI.dangKy({
    id: '2.3',
    poster: [11, 12],
    muc_tieu: 'Biến trở làm được 2 việc: một điện trở chỉnh được (dùng 2 chân), và một bộ chia áp cho ra áp bất kỳ từ 0 tới áp pin (dùng 3 chân). Bài này làm cả hai, rồi cho bộ chia áp cấp điện cho một cái LED để thấy nó yếu thế nào khi có tải.',
    can: [
      { ten: 'Biến trở RM065 10k (<code>103</code>), lấy con mới', tim: 'RM065', sl: 1 },
      { ten: 'Điện trở 220Ω', tim: 'Điện trở 1/4W', sl: 1 },
      { ten: 'LED đỏ 5mm', tim: 'LED 5mm', sl: 1 },
      { ten: 'Dây nhảy đực–đực', tim: 'Dây nhảy', sl: 5 },
      { ten: 'Breadboard MB-102', tim: 'MB-102', sl: 1 },
      { ten: 'Hộp pin 3×AAA + 3 viên AAA', tim: 'hộp pin', sl: 1 },
      { ten: 'Đồng hồ vạn năng', tim: 'đồng hồ vạn năng', sl: 1 },
      { ten: 'Kẹp cá sấu', tim: 'kẹp cá sấu', sl: 2 },
    ],
    kien_thuc: `
      <p>Bên trong biến trở là một <b>dải than 10k</b>. Hai đầu dải nối ra 2 chân, gọi là <b>A</b> và <b>B</b>. Chân thứ 3 là <b>con trượt W</b>, tì lên dải than; vặn thì W chạy dọc dải.</p>
      <p>Nên lúc nào cũng có: <code>R(A–W) + R(W–B) = R(A–B) ≈ 10k</code>. Vặn W về sát A thì R(A–W) ≈ 0.</p>
      <p><code>103</code> nghĩa là 10 × 10³ = 10 000Ω. RM065 vặn được khoảng dưới 1 vòng và có chặn ở 2 đầu: tới chặn thì dừng, vặn cố là gãy.</p>
      <p>Chân nào là W phải <b>đo</b> mới biết (phần 1). Trên hình, W luôn ở cột 12. Nếu con của bạn cắm ra khác thì dùng số cột của bạn.</p>`,
    so_do: [
      { nhan: 'ĐÚNG · kiểu A', svg: soDoA, chu: 'Biến trở nối tiếp với 220Ω và LED. 220Ω giữ dòng khi biến trở vặn về 0.' },
      { nhan: 'ĐÚNG · kiểu B', svg: soDoB, chu: 'Dòng đi qua toàn bộ 10k từ A xuống B. Đồng hồ đo áp gần như không lấy dòng.' },
      { nhan: 'ĐÃ CHÁY · giữ dây kiểu A, bỏ 220Ω', xau: true, svg: soDoChay, chu: 'Pin chỉ còn đi qua đoạn A–W. Vặn W về A thì đoạn đó còn vài ôm, cả dòng lẫn nhiệt dồn vào một mẩu dải than.' },
    ],
    du_doan: `
      <p><b>Kiểu A:</b> <code>I = (U − U_LED) / (220 + R)</code>, với U ≈ 4.78V, U_LED ≈ 1.8–2.0V.</p>
      <div class="cuon"><table><thead><tr><th>R biến trở</th><th>I dự đoán</th><th>Thấy</th></tr></thead><tbody>
        <tr><td>0</td><td>≈ 12.6 mA</td><td>sáng nhất</td></tr>
        <tr><td>1k</td><td>≈ 2.3 mA</td><td>vẫn sáng rõ</td></tr>
        <tr><td>5k</td><td>≈ 0.55 mA</td><td>mờ</td></tr>
        <tr><td>10k</td><td>≈ 0.29 mA</td><td>le lói</td></tr></tbody></table></div>
      <p>R tăng đều nhưng độ sáng tụt gần hết trong <b>đoạn vặn đầu tiên</b>: dòng tỉ lệ nghịch với R, còn mắt nhìn độ sáng theo kiểu log.</p>
      <p><b>Kiểu B:</b> <code>U_W = U × R(W–B) / 10k</code>, chạy liên tục 0 → 4.78V. Dòng qua biến trở luôn <code>4.78 / 10k ≈ 0.48 mA</code>, công suất ≈ 2 mW nên luôn nguội.</p>
      <p><b>Kiểu C:</b> nhìn từ W, biến trở như một nguồn <code>U·x</code> nối tiếp điện trở <code>x·(1−x)·10k</code>, với x là vị trí W (0 ở B, 1 ở A). LED chỉ sáng khi U·x vượt ≈ 1.8V, tức x > 0.4: gần nửa vòng đầu LED tắt hẳn.</p>`,
    sau: `<h3>Nhìn từ con trượt: nguồn Thevenin</h3>
      <p>Với W ở vị trí x (0 ở B, 1 ở A), nhìn từ W xuống −, biến trở giống một nguồn <code>U·x</code> nối tiếp điện trở <code>R_th = x·(1−x)·10k</code> (hai nửa dải than song song). R_th lớn nhất ở giữa: <b>2.5k</b>. Nối tải R_L vào W: <code>U_W = U·x · R_L / (R_th + R_L)</code>.</p>
      <p>Ví dụ W ở giữa, tải 10k xuống −: <code>2.39 × 10 / 12.5 ≈ 1.91V</code> thay vì 2.39V. Đó là kiểu C của bài này, và là bài 2.5 viết gọn.</p>
      <h3>Loại A và loại B</h3>
      <p>Biến trở "B" (tuyến tính): R(W–B) tăng đều theo góc vặn. Biến trở "A" (log) tăng chậm lúc đầu rồi nhanh, dùng cho núm âm lượng vì tai nghe theo kiểu log. RM065 ghi <code>103</code> là loại tuyến tính.</p>
      <h3>Lần cháy ở bài này, bằng số</h3>
      <p>W nối về −, A nối +, vặn W về sát A: giữa + và − chỉ còn đoạn than vài Ω + nội trở pin ~0.5Ω → dòng vài A qua một đoạn than bé xíu chịu ~0.1W. Công suất cỡ vài W dồn vào một điểm: than cháy đỏ trong vài giây.</p>`,
    hoi: [
      ['Kiểu B, W ở giữa, mắc thêm tải 10k từ W xuống −. Áp W còn bao nhiêu?', 'R_th = 0.5 × 0.5 × 10k = 2.5k; U = 2.39 × 10/(2.5 + 10) ≈ <b>1.91V</b>.'],
      ['Vì sao kiểu A cần 220Ω nối tiếp?', 'Vặn biến trở về 0Ω thì chỉ còn 220Ω hạn dòng cho LED: (4.78 − 2)/220 ≈ 12.6mA. Không có nó, LED cắm thẳng vào pin và cháy.'],
      ['Đo A–W được 3.2k. Đoán W–B.', '10k − 3.2k ≈ <b>6.8k</b> (tổng luôn ≈ 10k).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Xác định chân',
        gioi_thieu: 'Chưa dùng pin. Chỉ biến trở và đồng hồ.',
        buoc: [
          {
            ten: 'Cắm biến trở, không có dây nào',
            lam: ['Cắm biến trở mới sao cho 3 chân vào <b>3 cột khác nhau</b>: cột 10, 12, 14, hàng d. Chưa cắm dây, chưa cắm hộp pin.',
              'Mỗi cột 5 lỗ a–e thông nhau (phần tô xanh). 2 chân chung một cột là bị breadboard nối tắt sẵn.'],
            board: { them: [{ ...BT, ten_chan: ['1', '2', '3'] }] },
          },
          {
            ten: 'Đo 3 cặp chân',
            lam: ['Núm đồng hồ về <code>Ω 200k</code>. Que đỏ cắm lỗ VΩ, que đen cắm COM.',
              'Chạm que vào chân kim loại của biến trở: cặp 1–2, cặp 2–3, cặp 1–3. Mỗi cặp vặn thử qua lại, xem số có đổi không. Ghi vào bảng ở cuối trang.',
              'Ở thang 200k, số hiện là kΩ: <code>10.0</code> nghĩa là 10 000Ω.'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'bt.A', den: 'bt.B', hien: '≈ 10.0 ?' }] },
            kiem: {
              thay: 'Đúng 1 cặp ra ≈ <code>10.0</code> và vặn thế nào cũng <b>không đổi</b>: đó là A và B. Chân còn lại là W; 2 cặp có W thì vặn là đổi số, và cộng lại ≈ 10.0.',
              neu_khong: 'Một cặp luôn ra <code>00.0</code>: 2 chân đó đang chung cột, rút ra cắm lại. Cả 3 cặp ra 0: 2 que đang chạm nhau hoặc chạm 2 chân cùng lúc, kẹp cá sấu mỗi que vào 1 chân rồi đo lại. Vẫn sai thì <b>chưa đi tiếp</b>: lấy biến trở khác, đo lại.',
            },
          },
        ],
      },
      {
        ten: 'Phần 2 · Kiểu A: biến trở làm điện trở chỉnh được',
        gioi_thieu: 'Dùng 2 chân A và W. Chân B bỏ trống.',
        buoc: [
          {
            ten: 'Nối hộp pin rỗng vào breadboard',
            lam: ['Tháo hết pin ra khỏi hộp. Dây đỏ của hộp cắm vào thanh <b>+ phía trên</b>, dây đen cắm vào thanh <b>− phía dưới</b>.',
              'Thanh nào + thanh nào − thì theo vạch đỏ/xanh in trên board của bạn. Có loại board mà thanh nguồn đứt ở giữa chiều dài, nên cắm mọi thứ ở nửa trái.'],
            board: { them: [PIN_RONG] },
          },
          {
            ten: 'Cắm biến trở và dây vào chân A',
            lam: ['Biến trở: A vào 10d, W vào 12d, B vào 14d.', 'Dây đỏ từ thanh + (cột 9) sang lỗ <b>10a</b>, tức cùng cột với chân A. Cột 14 (chân B) không có dây nào.'],
            board: { them: [BT, DAY_A] },
          },
          {
            ten: 'Cắm 220Ω, LED và dây về −',
            lam: ['Điện trở 220Ω (đỏ-đỏ-nâu nếu 4 vòng; đỏ-đỏ-đen-đen-nâu nếu 5 vòng) vắt qua rãnh giữa: một chân ở <b>12e</b> (chung cột với W), chân kia ở <b>12f</b>.',
              'LED: chân dài (+) vào <b>12i</b>, chân ngắn vào <b>13i</b>.', 'Dây đen từ <b>13j</b> xuống thanh − dưới.'],
            board: { them: [R220, LED, DAY_K] },
            mo_ta: 'Kiểu A đã ráp xong, hộp pin còn rỗng',
          },
          {
            ten: 'Đo trước khi cấp điện',
            kiem_truoc: true,
            lam: ['Núm về <code>Ω 200k</code>. Chạm 2 que vào 2 tiếp điểm kim loại <b>trong hộp pin</b>: một đầu là chỗ dây đỏ nối vào, đầu kia là chỗ dây đen. Đo ở đây là đo cả mạch nhìn từ phía pin.',
              'Làm 2 lần: vặn hết về một phía, rồi vặn hết về phía kia. Hộp có công tắc thì bật ON; hộp đang rỗng nên không có điện.'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-', hien: '1  (OL)' }] },
            kiem: {
              thay: '<code>1</code> (OL), hoặc một số lớn, ở cả 2 lần. LED chặn dòng nhỏ của đồng hồ nên mạch trông như hở; LED có thể le lói rất mờ, vậy là bình thường.',
              neu_khong: 'Dưới <code>0.20</code> (200Ω) ở lần nào đó: có chỗ nối tắt, 220Ω đang bị bỏ qua. <b>Không lắp pin</b>, dò lại từng dây với hình.',
            },
          },
          {
            ten: 'Lắp pin, vặn thử',
            cap_dien: true,
            lam: ['Lắp 3 viên pin vào hộp. LED sáng. Vặn từ từ: một phía sáng dần, phía kia tối dần.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' }, led: { sang: true } } },
            kiem: { thay: 'LED đổi độ sáng khi vặn. Biến trở và điện trở sờ vào vẫn nguội.', neu_khong: 'Không sáng: tháo pin, kiểm chiều LED (chân dài ở 12i). Có mùi hoặc nóng: tháo pin ngay.' },
          },
          {
            ten: 'Đo 3 áp ở vị trí sáng nhất và tối nhất',
            lam: ['Núm về <code>DCV 20</code>. Đo áp là chạm 2 que <b>song song</b> lên linh kiện, không phải tháo gì.',
              'Ở mỗi vị trí đo 3 chỗ: LED (que đỏ chân dài, que đen chân ngắn), 220Ω (que đỏ 12e, que đen 12f), biến trở (que đỏ chân A, que đen chân W). Ghi vào bảng.',
              'Dòng tính từ áp trên 220Ω: <code>I = U_220 / 220</code>. Ở vị trí tối nhất U_220 rất nhỏ, chuyển núm về <code>DCV 2</code> để đọc được số lẻ.'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: 'led.A', den: 'led.K', hien: '≈ 2.0' }] },
            kiem: { thay: 'Cộng 3 áp ≈ áp pin ở cả 2 vị trí (Kirchhoff về áp). Áp LED gần như đứng yên 1.8–2.0V.', neu_khong: 'Cộng lệch nhiều so với áp pin: đo lại áp pin, và kiểm que có tì chắc vào chân không.' },
          },
          {
            ten: 'Tháo pin, rút hết mạch',
            lam: ['Tháo pin khỏi hộp. Rút <b>hết</b> dây, điện trở, LED và biến trở ra. Kiểu B ráp lại từ đầu, không sửa trên mạch này.'],
            board: { sua: { pin: { trang_thai: 'rong' }, led: { sang: false } } },
          },
        ],
      },
      {
        ten: 'Phần 3 · Kiểu B: chia áp',
        gioi_thieu: 'Dùng 2 chân đầu A và B nối vào pin. Con trượt W chỉ chạm que đo.',
        buoc: [
          {
            ten: 'Ráp lại từ đầu, hộp pin rỗng',
            lam: ['Hộp pin rỗng: dây đỏ vào thanh + trên, dây đen vào thanh − dưới.', 'Biến trở: A vào 10d, W vào 12d, B vào 14d. Dây đỏ từ thanh + (cột 9) sang <b>10a</b>.',
              'Chân B xuống thanh −: dây đen ngắn <b>14e → 14f</b> vắt qua rãnh giữa, rồi dây đen <b>14j</b> xuống thanh − dưới.',
              '<b>Cột 12 (W) không có dây nào.</b> Đường gạch đỏ trên hình là dây <b>không được</b> cắm.'],
            board: { them: [PIN_RONG, BT, DAY_A, DAY_B1, DAY_B2, { id: 'cam', loai: 'cam', tu: '12a', den: 'T+:12', nhan: 'KHÔNG nối W' }] },
          },
          {
            ten: 'Đo trước khi cấp điện',
            kiem_truoc: true,
            lam: ['Núm <code>Ω 200k</code>, 2 que chạm 2 tiếp điểm trong hộp pin như ở kiểu A. Vặn biến trở qua lại trong lúc đo.'],
            board: { bo: ['cam'], them: [{ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-', hien: '≈ 10.0' }] },
            kiem: {
              thay: '≈ <code>10.0</code> (bằng số cặp A–B ở phần 1), và vặn thì số <b>không đổi</b>.',
              neu_khong: 'Gần <code>00.0</code>, hoặc vặn mà số thay đổi: W đang nối vào pin, đúng kiểu lần đã cháy. <b>Không lắp pin</b>, rút hết ráp lại từ đầu theo hình.',
            },
          },
          {
            ten: 'Lắp pin, đo áp ở con trượt',
            cap_dien: true,
            lam: ['Lắp pin. Núm <code>DCV 20</code>. Que đen chạm chân B, que đỏ chạm chân W.',
              'Vặn từ từ từ đầu này sang đầu kia, tới chặn thì dừng. Ghi 3 số: hết về phía B, nửa đường, hết về phía A.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' } }, them: [{ id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: 'bt.W', den: 'bt.B', hien: '0.00 → 4.78' }] },
            kiem: { thay: 'Số chạy liên tục từ ≈ 0.00 lên ≈ 4.78. Biến trở nguội.', neu_khong: 'Ấm, có mùi, có khói: tháo pin ngay.' },
          },
        ],
      },
      {
        ten: 'Phần 4 · Kiểu C: chia áp rồi cấp cho LED',
        gioi_thieu: 'Giữ nguyên mạch kiểu B và chỉ <b>thêm</b> một nhánh từ W, qua 220Ω, tới LED. Lần này sửa trên mạch cũ là đúng, vì W chỉ nối vào 220Ω chứ không nối thẳng vào pin.',
        buoc: [
          {
            ten: 'Tháo pin, thêm nhánh W → 220Ω → LED',
            lam: ['Tháo pin khỏi hộp.', 'Thêm điện trở 220Ω <b>12e → 12f</b>, LED chân dài <b>12i</b> chân ngắn <b>13i</b>, dây đen <b>13j</b> xuống thanh −.',
              'Giữ nguyên dây của A và B. 220Ω là thứ duy nhất đứng giữa W và LED, <b>không được bỏ</b>.'],
            board: { them: [cu(PIN_RONG), cu(BT), cu(DAY_A), cu(DAY_B1), cu(DAY_B2), R220, LED, DAY_K] },
          },
          {
            ten: 'Đo trước khi cấp điện',
            kiem_truoc: true,
            lam: ['Núm <code>Ω 200k</code>, 2 que chạm 2 tiếp điểm trong hộp pin. Vặn hết về 2 phía.'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-', hien: '≈ 10.0' }] },
            kiem: {
              thay: 'Thường ≈ <code>10.0</code>. Ở vài vị trí vặn số có thể thấp hơn (LED dẫn chút xíu dưới áp của đồng hồ). Chỉ cần <b>không dưới <code>0.20</code></b>.',
              neu_khong: 'Dưới <code>0.20</code>: 220Ω đang bị bỏ qua hoặc có chỗ nối tắt. Không lắp pin.',
            },
          },
          {
            ten: 'Lắp pin, vặn từ B sang A',
            cap_dien: true,
            lam: ['Lắp pin. Vặn W từ sát B sang sát A thật chậm, nhìn LED.',
              'Ở các vị trí trong bảng, đo U_W (que đỏ W, que đen B) khi <b>có</b> LED. Sau đó tháo pin, rút LED ra, lắp pin lại, đo U_W ở <b>đúng vị trí đó</b> (không đụng núm).'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' }, led: { sang: true } }, them: [{ id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: 'bt.W', den: 'bt.B', hien: '?' }] },
            kiem: {
              thay: 'Gần nửa vòng đầu LED tắt hẳn, rồi sáng vọt lên ở cuối. U_W khi có LED <b>thấp hơn</b> khi không có LED: bộ chia áp bị tải kéo xuống.',
              neu_khong: 'LED sáng ngay từ đầu: có thể A và B đang đảo, vặn ngược lại xem. Có mùi hoặc nóng: tháo pin.',
            },
          },
        ],
      },
    ],
    bang_do: [
      { ten: 'Phần 1 · Đo chân (Ω 200k)', cot: ['cặp 1–2', 'cặp 2–3', 'cặp 1–3'], hang: [{ ten: 'Vặn hết một phía' }, { ten: 'Vặn hết phía kia' }] },
      {
        ten: 'Đo trước khi cấp điện (Ω giữa 2 tiếp điểm hộp pin)', cot: ['Ω đo được'],
        hang: [{ ten: 'Kiểu A', du_doan: ['OL, > 0.20'] }, { ten: 'Kiểu B', du_doan: ['≈ 10.0, không đổi'] }, { ten: 'Kiểu C', du_doan: ['> 0.20'] }],
      },
      {
        ten: 'Kiểu A · áp (DCV)', cot: ['U biến trở (A–W)', 'U_220', 'U_LED', 'Cộng 3 số'],
        hang: [{ ten: 'Sáng nhất', du_doan: ['≈ 0', '≈ 2.78', '≈ 2.0', '≈ 4.78'] }, { ten: 'Tối nhất', du_doan: ['≈ 2.93', '≈ 0.064', '≈ 1.8', '≈ 4.78'] }],
      },
      {
        ten: 'Kiểu B · áp con trượt (W so với B)', cot: ['U_W'],
        hang: [{ ten: 'Hết về phía B', du_doan: ['≈ 0.00'] }, { ten: 'Nửa đường', du_doan: ['≈ 2.4'] }, { ten: 'Hết về phía A', du_doan: ['≈ 4.78'] }],
      },
      {
        ten: 'Kiểu C · áp con trượt có / không có LED', cot: ['U_W có LED', 'U_W không LED'],
        hang: [{ ten: 'Nửa đường', du_doan: ['≈ 1.85', '≈ 2.4'] }, { ten: '~70% về phía A', du_doan: ['≈ 2.0', '≈ 3.35'] }, { ten: 'Hết về phía A', du_doan: ['≈ 4.78', '≈ 4.78'] }],
      },
    ],
    bay: [
      'Chuyển kiểu A sang B mà giữ dây cũ: W vẫn nối vào pin, vặn về A là nối tắt. Đã cháy 1 con vì lỗi này.',
      'Kiểu A và C mà bỏ 220Ω: vặn về 0 là LED cắm thẳng vào pin, cháy LED.',
      '2 chân biến trở chung một cột: breadboard nối tắt sẵn 2 chân đó.',
      'Đo 10k ở thang <code>2k</code>: màn hình hiện <code>1</code> nghĩa là quá thang, không phải 1Ω.',
      'Vặn quá chặn: gãy biến trở.',
    ],
    robot: [
      'ESP32 đọc áp ở W bằng ADC (chương 10) = núm xoay, cần điều khiển. Joystick module là 2 biến trở. Lúc đó cấp biến trở bằng <b>3.3V</b>, không phải 5V: chân ADC không chịu áp cao hơn nguồn của chip.',
      'Servo (vd board otto-robot) có biến trở gắn vào trục để biết mình đang ở góc nào.',
      'Kiểu C là lý do không lấy áp từ bộ chia áp để nuôi tải: muốn cấp điện thì dùng ổn áp (chương 8).',
    ],
  });
})();
