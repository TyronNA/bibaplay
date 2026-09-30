// Bài 20.4 — Đi phủ kín kiểu robot hút bụi (luống cày). Mạch như cuối 19.4 (encoder + GY-521); servo nếu có thì để yên.
(function () {
  const sd = SD;
  const luong = [];
  for (let i = 0; i < 6; i++) {
    const y = 180 - i * 28, tr = i % 2 === 0;
    luong.push(K.mt(tr ? 40 : 340, y, tr ? 340 : 40, y));
    if (i < 5) luong.push(sd.day(`${tr ? 340 : 40},${y} ${tr ? 340 : 40},${y - 28}`));
  }
  const cay = sd.svg(380, 220, sd.mui + `<rect x="30" y="30" width="320" height="160" class="sd-net" style="fill:none"/>` + luong.join('')
    + sd.chu(34, 208, 'luống cách nhau 12cm < bề ngang robot', 'sd-mo') + sd.cham(40, 180) + sd.chu(10, 24, 'vùng 1.5m × 1m', 'sd-mo'),
    'Robot đi các luống song song qua lại trong một hình chữ nhật, như cày ruộng');
  const nen = [...K.robot17(), ...K.p4.enc().map(K.cu), ...K.p4.imu().map(K.cu), K.cu(K.espRobot({ ...K.p4.encEsp, ...K.p4.imuEsp }))];

  BAI.dangKy({
    id: '20.4',
    muc_tieu: 'Cho robot tự đi phủ kín một vùng chữ nhật theo kiểu robot hút bụi đời đầu: các luống song song qua lại như cày ruộng, gặp vật thì bỏ phần còn lại của luống. Trạm tô vệt robot đi qua để thấy chỗ nào sót.',
    nguon: 'pack 2S → LM2596 → board · WiFi',
    can: [K.can.robot17(), K.can.thuoc(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_20_4.c',
    kien_thuc: `
      <p>Vùng cần phủ là hình chữ nhật dài × rộng, robot đặt ở góc dưới-trái, mũi dọc theo cạnh dài. Luống 0 đi từ x = 0 tới x = dài ở y = 0. Luống 1 đi ngược về ở y = 12cm, luống 2 lại đi xuôi ở y = 24cm… Mỗi luống gồm 2 việc: đi tới đầu luống, rồi đi hết luống, cả hai dùng hàm đi tới điểm của 19.5.</p>
      <p>Luống cách nhau 12cm, nhỏ hơn bề ngang robot (~15cm), để 2 vệt liền kề chồng lên nhau một chút. Sai số hướng làm các luống không còn song song, và phần chồng này là để bù.</p>
      <p>Gặp vật (siêu âm &lt; 15cm, FC-51, cản va) thì robot lùi 10cm, bỏ phần còn lại của luống đó và sang luống kế. Máy trạng thái nhỏ (18.3) gồm: TỚI ĐẦU LUỐNG → CHẠY LUỐNG → (LÙI) → luống kế → … → XONG.</p>
      <p>Lệnh: <code>PHU 1500 1000</code> (mm). Trên trạm, tick "vệt phủ" và đặt bề rộng 140mm để tô phần robot đã đi qua.</p>`,
    so_do: [{ nhan: 'Luống cày', svg: cay, chu: '9 luống cho vùng rộng 1m.' }],
    du_doan: `<p>Vùng 1.5m × 1m: 9 luống, ~15m đường đi, mất khoảng 2 phút. Trạm tô gần kín (vì trạm vẽ theo odometry, nó luôn tin là kín). Vệt robot thật để lại (rắc bột mì mỏng hoặc giấy vụn lên sàn trước khi chạy) thì <b>hở dần</b> ở các luống cuối: sai hướng vài độ làm luống sau lệch khỏi chỗ đáng lẽ phải tới.</p>`,
    sau: `<h3>Bao nhiêu luống</h3>
      <p>Số luống = rộng ÷ 12cm + 1. Vùng rộng 1m: 1000/120 + 1 ≈ 9 luống. Quãng đi ≈ 9 × 1.5m + 8 × 12cm ≈ 14.5m. Ở 200mm/s cộng thời gian quay đầu (~2 giây mỗi đầu luống) là ~110 giây.</p>
      <h3>Sai hướng làm hở bao nhiêu</h3>
      <p>Hướng trôi 2° thì cuối luống dài 1.5m lệch ngang 1500 × sin 2° ≈ 52mm. Phần chồng giữa 2 luống chỉ có 150 − 120 = 30mm, nên sai 2° đã đủ để hở. Robot hút bụi không LiDAR dùng gyro tốt, đi sát tường để "đặt lại" hướng, và chấp nhận sót. Robot có LiDAR thì định vị lại trên bản đồ sau mỗi luống.</p>
      <h3>Phủ vùng có vật cản</h3>
      <p>Cách bài này "bỏ phần luống bị chặn" là cách thô nhất. Cách làm đúng là chia vùng thành các ô không có vật (phân rã boustrophedon, Choset 2000), phủ từng ô bằng luống cày, rồi nối các ô bằng đường đi ngắn nhất trên bản đồ.</p>`,
    hoi: [
      ['Vùng 2m × 0.6m, luống cách 12cm. Bao nhiêu luống, robot kết thúc ở góc nào?', '600/120 + 1 = <b>6 luống</b> (0, 1, …, 5). Luống chẵn đi xuôi, lẻ đi về. Luống 5 là lẻ, nên kết thúc ở x = 0, y = 600: góc <b>trên-trái</b>.'],
      ['Vì sao luống cách nhau nhỏ hơn bề ngang robot?', 'Để 2 vệt liền kề chồng lên nhau. Sai số hướng và vị trí làm luống lệch vài cm, và phần chồng che bớt chỗ hở.'],
      ['Trạm tô kín mà thực tế còn hở. Vì sao trạm không thấy chỗ hở?', 'Trạm vẽ theo vị trí odometry báo. Odometry không biết mình trôi, nên vệt vẽ luôn đúng luống "dự định", không phải chỗ robot thật đã đi.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nạp code', cot: 63,
        buoc: [
          { ten: 'Robot có encoder + GY-521, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Servo radar (nếu đã gắn ở 20.2) để nguyên, bài này không dùng.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 20.4', ['menuconfig → 20.4. <code>idf.py flash</code>, rồi rút USB.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Phủ vùng 1.5m × 1m', ke_thua: true,
        gioi_thieu: 'Dán băng keo giấy viền một hình chữ nhật 1.5m × 1m trên sàn trống. Muốn thấy vệt thật: rắc một lớp bột mì thật mỏng (hoặc giấy vụn) trong vùng.',
        buoc: [
          K.camPack('Cắm P+, để yên 2 giây', ['Đặt robot ở góc dưới-trái của vùng, mũi dọc theo cạnh 1.5m, cạnh phải của robot sát viền dưới. Chờ "co gyro". Trên trạm tick <b>vệt phủ</b>, bề rộng 140. Bấm <b>PHU 1500 1000</b>.'],
            { thay: 'Robot đi luống qua lại, nhật ký in "phu 1500 x 1000 mm: 9 luong" rồi "xong phu". Trạm tô gần kín.', neu_khong: 'Robot đi ra ngoài vùng ngay luống đầu: mũi đặt lệch, hoặc b / mm/xung chưa hiệu chuẩn (19.1, 19.3).' }),
          { ten: 'So vệt thật với vệt trên trạm', cap_dien: true, lam: ['Rút P+ khi xong. Nhìn sàn: chỗ bột mì còn nguyên là chỗ sót. Đo khe hở lớn nhất giữa 2 luống.'], kiem: { thay: 'Luống đầu liền, luống sau hở dần vài cm.', neu_khong: '' } },
          { ten: 'Thêm một vật cản', cap_dien: true, lam: ['Đặt một hộp giấy giữa vùng. Cắm lại P+ ở góc cũ, Z trên trạm (bấm nút Z), <b>PHU 1500 1000</b>.'], kiem: { thay: 'Mỗi lần gặp hộp: nhật ký in "vat can o (…): bo luong n", robot lùi rồi sang luống kế. Phía sau hộp bị sót.', neu_khong: '' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Vùng 1.5m × 1m', cot: ['Thời gian (s)', 'Khe hở lớn nhất (mm)'], hang: [{ ten: 'Không vật cản', du_doan: ['≈ 110', '0–60'] }, { ten: 'Có hộp giữa vùng', du_doan: ['< 110', 'sót sau hộp'] }] }],
    bay: ['Đặt robot mũi lệch vài độ: cả vùng phủ bị xoay theo.', 'Chưa hiệu chuẩn b (19.3): quay đầu luống sai góc, luống sau chéo hẳn.', 'Vùng sát cầu thang mà không có TCRT chống rơi (14.4): robot không biết mép vực.'],
    robot: ['Đây là "bộ não" của robot hút bụi đời đầu. Đời mới thay luống mù bằng bản đồ LiDAR (chương 21) và đường đi lập trên bản đồ.'],
  });
})();
