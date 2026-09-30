// Bài 19.5 — Đi tới điểm, hình vuông. Mạch như cuối 19.4 (encoder + GY-521).
(function () {
  const sd = SD;
  const hh = sd.svg(380, 230, sd.mui
    + sd.cham(60, 180) + sd.chu(40, 200, 'robot', 'sd-chu') + K.mt(60, 180, 150, 130) + sd.chu(100, 142, 'θ', 'sd-mo')
    + sd.cham(300, 50) + sd.chu(290, 38, 'đích', 'sd-chu') + sd.day('60,180 300,50') + sd.chu(190, 100, 'khoảng cách', 'sd-mo')
    + `<path d="M 110 152 A 55 55 0 0 0 105 145" class="sd-net"/>` + sd.chu(118, 170, 'lệch = góc tới đích − θ', 'sd-mo')
    + sd.chu(10, 20, 'w = 2·lệch (quay về phía đích)', 'sd-chu') + sd.chu(10, 40, 'v = min(200, khoảng cách)·max(0, cos lệch)', 'sd-chu'),
    'Robot ở một điểm, mũi hướng θ; đích ở xa; góc lệch giữa hướng tới đích và θ quyết định tốc độ quay, khoảng cách quyết định tốc độ đi');

  BAI.dangKy({
    id: '19.5',
    muc_tieu: 'Cho robot tự đi tới một toạ độ: mỗi 50ms tính còn cách đích bao xa và mũi đang lệch bao nhiêu, rồi ra tốc độ đi và tốc độ quay. Đi một hình vuông 50cm rồi về chỗ cũ, đo bằng thước xem robot thật về cách điểm xuất phát bao xa trong khi odometry nói đã về đúng (0, 0).',
    nguon: 'pack 2S → LM2596 → board · WiFi',
    can: [K.can.robot17(), K.can.thuoc(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_19_5.c',
    kien_thuc: `
      <p>Robot ở (x, y), hướng θ. Đích ở (x_d, y_d). Góc tới đích là <code>atan2(y_d − y, x_d − x)</code>. Mũi đang lệch <code>lệch = góc tới đích − θ</code>, gói về khoảng −180°…180° (lệch 350° thực ra là lệch −10°).</p>
      <p>Hai luật đơn giản: <b>quay</b> <code>w = 2·lệch</code> (rad/s, kẹp ±2), và <b>đi</b> <code>v = min(200, khoảng cách)·max(0, cos lệch)</code> (mm/s). Hệ số cos làm robot không lao đi khi đích đang ở sau lưng (cos &lt; 0 → v = 0, chỉ quay). Lệch nhỏ thì cos ≈ 1, đi hết tốc. Tới gần thì v nhỏ dần theo khoảng cách. Cách đích dưới 3cm là coi như tới.</p>
      <p>Robot đổi (v, w) thành tốc độ 2 bánh: <code>trái = v − w·b/2</code>, <code>phải = v + w·b/2</code>, rồi 2 vòng PI (19.2) bám theo. Góc θ lấy từ bộ lọc bù (19.4).</p>
      <p>Lệnh: <code>D 1000 0</code> đi tới x = 1m. <code>VUONG 500</code>: 4 đỉnh (500, 0) → (500, 500) → (0, 500) → (0, 0), ngược chiều kim đồng hồ. Có vật trước mặt thì huỷ lệnh.</p>`,
    so_do: [{ nhan: 'Đi tới điểm', svg: hh, chu: 'Chỉ cần 2 số: còn bao xa, và mũi lệch bao nhiêu.' }],
    du_doan: `<p><code>VUONG 500</code>: trạm vẽ một hình vuông khép kín (odometry tin là đã về đúng chỗ). Robot thật về cách điểm đầu <b>2–8cm</b>. Ở mỗi góc, robot quay tại chỗ rồi mới đi (cos lệch ≈ 0 lúc lệch 90°).</p>
      <p>Chạy 3 hình vuông liền: sai số chồng lên, lệch 5–20cm.</p>`,
    sau: `<h3>Vì sao robot tự ổn định được</h3>
      <p>Chỉ xét góc: <code>dθ/dt = w = 2·lệch</code>, mà lệch = góc đích − θ, nên <code>d(lệch)/dt = −2·lệch</code> (đích đứng yên, robot ở xa). Lệch co lại theo e<sup>−2t</sup>: sau 0.5s còn 37%, sau 1.5s còn 5%. Hệ số lớn hơn thì nhanh hơn, nhưng vòng PI bánh xe và độ thô của encoder không kịp theo, và robot lắc.</p>
      <h3>Thử nghiệm hình vuông 2 chiều (UMBmark)</h3>
      <p>Borenstein (1995) đề xuất: đi hình vuông 4m theo chiều kim đồng hồ 5 lần và ngược chiều 5 lần, ghi điểm dừng. Sai do <b>b</b> (khoảng cách bánh) làm 2 chiều lệch <b>đối xứng</b> nhau. Sai do 2 bánh <b>khác đường kính</b> làm 2 chiều lệch <b>cùng phía</b>. Từ 2 cụm điểm tính được cả hai hệ số sửa. Robot nhỏ thì làm với 50cm cũng đủ thấy.</p>
      <h3>Đi theo đường chứ không theo điểm</h3>
      <p>Luật trên đi <b>tới điểm</b>, và giữa 2 điểm có thể bị đẩy lệch khỏi đường thẳng nối chúng. Robot thật (Nav2 ở 21.4) bám theo cả <b>đường</b>: chọn một điểm phía trước trên đường cách robot một khoảng cố định rồi đuổi theo điểm đó (pure pursuit).</p>`,
    hoi: [
      ['Robot ở (0, 0), θ = 0. Đích (0, 500). lệch, v, w lúc đầu là bao nhiêu?', 'Góc tới đích 90°, lệch = 90° = 1.57 rad. w = 2 × 1.57 = 3.14 → kẹp <b>2 rad/s</b>. cos 90° = 0 → <b>v = 0</b>: quay tại chỗ trước.'],
      ['Góc đích 170°, θ = −170°. lệch thật là bao nhiêu?', '170 − (−170) = 340° → gói lại = <b>−20°</b>. Robot quay phải 20°, không phải quay trái 340°.'],
      ['Odometry nói robot đã về (0, 0), thước nói cách 6cm. Cái nào đúng, và vì sao hai số khác nhau?', 'Thước đúng. Odometry chỉ cộng dồn số đo của chính nó, nên không bao giờ tự thấy sai số của mình. Muốn biết robot thật ở đâu thì cần một thứ nhìn ra bên ngoài: bản đồ và cảm biến khoảng cách (chương 20, 21).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nạp code', cot: 63,
        buoc: [
          { ten: 'Robot như cuối 19.4, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Encoder và GY-521 giữ nguyên.'], board: { them: [...K.robot17(), ...K.p4.enc().map(K.cu), ...K.p4.imu().map(K.cu), K.cu(K.espRobot({ ...K.p4.encEsp, ...K.p4.imuEsp }))] }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 19.5', ['menuconfig → 19.5 (giữ mm/xung và b đã hiệu chuẩn). <code>idf.py flash</code>.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Hình vuông trên sàn', ke_thua: true,
        gioi_thieu: 'Sàn trống ít nhất 1m × 1m. Đánh dấu chỗ đặt robot bằng băng keo: một vạch dưới tâm bánh, một vạch dưới mũi.',
        buoc: [
          K.camPack('Cắm P+, để yên 2 giây', ['Robot đặt đúng dấu. Chờ "co gyro". Bấm <b>Z</b>, rồi <b>VUONG 500</b>.'],
            { thay: 'Robot đi 4 cạnh, quay tại chỗ ở mỗi góc, về gần dấu. Trạm vẽ hình vuông khép kín. Nhật ký in "xong: odometry noi dang o (≈0, ≈0)".', neu_khong: 'Robot quay vòng vòng không đi: dấu θ ngược (b âm? encoder đổi bên?), kiểm lại 19.1, 19.4. Robot lao đi thẳng: bấm X, nhấc lên.' }),
          { ten: 'Đo lệch thật', cap_dien: true, lam: ['Không chạm robot. Đo bằng thước: tâm bánh cách vạch bao nhiêu theo dọc (x) và ngang (y). Làm thêm 2 lần (đặt lại đúng dấu, Z, VUONG 500).'], kiem: { thay: 'Mỗi lần lệch 2–8cm, các lần lệch về cùng một phía.', neu_khong: '' } },
          { ten: 'Đi tới một điểm', cap_dien: true, lam: ['Z, rồi <b>D 800 300</b>. Đo điểm dừng thật.'], kiem: { thay: 'Robot quay về phía đích, đi tới, dừng cách (800, 300) vài cm.', neu_khong: '' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Hình vuông 500mm: điểm dừng thật (mm)', cot: ['lệch x', 'lệch y'], hang: [{ ten: 'Lần 1', du_doan: ['±20–80', '±20–80'] }, { ten: 'Lần 2', du_doan: ['cùng phía lần 1', ''] }, { ten: 'Lần 3', du_doan: ['cùng phía lần 1', ''] }] }],
    bay: ['Quên gói góc về ±180°: đích sau lưng một chút là robot quay gần hết 1 vòng.', 'Không có cos(lệch): robot lao đi ngay khi đích ở sau, vẽ một vòng lớn.', 'Chạy trên thảm: bánh trượt lúc quay tại chỗ, lệch lớn gấp mấy lần.'],
    robot: ['Bài 20.3, 20.4 dùng lại đúng hàm đi tới điểm này. Nav2 (21.4) làm cùng việc nhưng trên bản đồ, biết né.'],
  });
})();
