// Bài 19.3 — Odometry x, y, θ. Mạch như cuối 19.1.
(function () {
  const sd = SD;
  const hh = sd.svg(380, 230, sd.mui
    + sd.day('30,200 360,200') + sd.day('30,200 30,20') + sd.chu(362, 214, 'x', 'sd-chu') + sd.chu(16, 20, 'y', 'sd-chu')
    + `<g transform="rotate(-30 170 130)"><rect x="130" y="100" width="80" height="60" rx="6" class="sd-net"/><rect x="150" y="88" width="40" height="12" class="sd-net sd-to"/><rect x="150" y="160" width="40" height="12" class="sd-net sd-to"/></g>`
    + K.mt(170, 130, 240, 90) + sd.chu(244, 86, 'hướng θ', 'sd-chu') + sd.chu(80, 70, 'bánh trái: d_T', 'sd-mo') + sd.chu(200, 190, 'bánh phải: d_P', 'sd-mo')
    + sd.chu(210, 140, 'b = khoảng cách 2 bánh', 'sd-mo') + sd.cham(170, 130),
    'Robot 2 bánh trong hệ toạ độ x, y; hướng θ; mỗi vòng điều khiển 2 bánh đi được d_T, d_P');

  BAI.dangKy({
    id: '19.3',
    muc_tieu: 'Mỗi 20ms cộng quãng 2 bánh vừa đi ra vị trí mới của robot (x, y) và hướng θ. Cách này gọi là odometry. Trạm vẽ đường robot đi. Sau đó hiệu chuẩn khoảng cách 2 bánh bằng cách cho robot quay 5 vòng tại chỗ, vì một sai số nhỏ ở con số này làm hướng robot sai rất nhanh.',
    nguon: 'pack 2S → LM2596 → board · WiFi',
    can: [K.can.robot17(), K.can.thuoc(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/robot.c',
    kien_thuc: `
      <p>Trong 20ms, bánh trái đi <code>d_T</code>, bánh phải đi <code>d_P</code> (xung × mm/xung, dấu theo chiều lệnh). Tâm robot đi <code>d = (d_T + d_P)/2</code> và quay một góc <code>dθ = (d_P − d_T)/b</code>, với b là khoảng cách giữa 2 bánh. Bánh phải đi xa hơn thì robot quay trái (θ tăng).</p>
      <p>Cộng dồn: <code>x += d·cos(θ + dθ/2)</code>, <code>y += d·sin(θ + dθ/2)</code>, <code>θ += dθ</code>. Lấy góc ở giữa đoạn (θ + dθ/2) cho đúng hơn khi robot vừa đi vừa quay. Code nằm trong vòng 50Hz của file dùng chung cho cả Phần 4 (hiện bên dưới), bài nào cũng có sẵn.</p>
      <p>Lệnh trên trạm: <code>F 1000</code> đi thẳng 1m, <code>Q 5</code> quay tại chỗ 5 vòng sang trái (theo odometry), <code>Z</code> đặt lại vị trí về (0, 0, 0°).</p>
      <p><b>Hiệu chuẩn b</b>: robot dừng khi odometry tính đã quay đủ 5 vòng. Nếu thực tế robot quay hơn hay kém 5 vòng thì b đang sai: <code>b mới = b cũ × 5 ÷ số vòng thật</code>.</p>`,
    so_do: [{ nhan: 'Robot 2 bánh', svg: hh, chu: 'Chỉ cần 2 số đo quãng của 2 bánh và khoảng cách b giữa chúng.' }],
    du_doan: `<p><code>F 1000</code>: trạm vẽ đoạn thẳng ~1000mm. Đo thật bằng thước: 980–1020mm (sai số mm/xung của 19.1).</p>
      <p><code>Q 5</code> với b đo bằng thước: robot thật quay 4.8–5.2 vòng. Lệch 0.1 vòng ≈ 36°, tức b sai 2%.</p>`,
    sau: `<h3>Suy ra dθ</h3>
      <p>Robot quay quanh một tâm tức thời cách tâm robot R. Bánh trái cách tâm quay R − b/2, bánh phải R + b/2, cùng quay góc dθ: <code>d_T = (R − b/2)·dθ</code>, <code>d_P = (R + b/2)·dθ</code>. Trừ vế: <code>d_P − d_T = b·dθ</code> → <code>dθ = (d_P − d_T)/b</code>. Cộng vế: <code>d_T + d_P = 2R·dθ</code> → tâm robot đi <code>R·dθ = (d_T + d_P)/2</code>.</p>
      <h3>Sai b thì sai hướng bao nhiêu</h3>
      <p>Quay 5 vòng tại chỗ: mỗi bánh đi quãng <code>π·b·5</code>. Odometry tính θ = 2·(quãng)/b_code. Nếu b_code nhỏ hơn b thật 5%, odometry tưởng đã quay đủ 5 vòng trong khi robot thật mới quay 5 × 0.95 = 4.75 vòng: hụt 0.25 vòng = <b>90°</b>. Quay tại chỗ nhiều vòng là cách phóng đại sai số để đo cho dễ.</p>
      <h3>Sai hướng thì sai vị trí ra sao</h3>
      <p>Hướng sai 2° rồi đi thẳng 3m thì lệch ngang 3000 × sin 2° ≈ <b>105mm</b>. Sai số góc là nguồn lớn nhất làm odometry trôi, và nó tích luỹ, không bao giờ tự hết. Bài 19.4 thêm gyro để đo góc bằng một cách khác.</p>`,
    hoi: [
      ['Trong 20ms: d_T = 5mm, d_P = 7mm, b = 135mm. Tâm robot đi bao xa, quay bao nhiêu độ?', 'd = 6mm. dθ = 2/135 ≈ 0.0148 rad ≈ <b>0.85°</b> sang trái.'],
      ['Q 5 xong, robot thật quay 5.2 vòng. b trong menuconfig đang 135mm. Sửa thành bao nhiêu?', 'b mới = 135 × 5 ÷ 5.2 ≈ <b>130mm</b>. Robot quay quá nghĩa là odometry tính góc quá chậm, tức b trong code quá lớn.'],
      ['Vì sao đo b bằng thước chưa đủ?', 'Điểm bánh chạm sàn không đúng ở giữa lốp (lốp cao su bẹt, 2 mép lốp cách nhau ~2cm), nên b "hiệu dụng" lệch vài mm so với số đo thước, tức lệch 2–5%.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Đo b bằng thước, nạp code', cot: 63,
        buoc: [
          { ten: 'Robot như cuối 19.1, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Đo bằng thước khoảng cách từ <b>giữa lốp trái</b> tới <b>giữa lốp phải</b> (mm).'], board: { them: [...K.robot17(), ...K.p4.enc().map(K.cu), K.cu(K.espRobot(K.p4.encEsp))] }, kiem: { thay: 'Có số b (thường 120–160mm).', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 19.3', ['menuconfig: Bai hoc → 19.3; Robot (Phan 4) → Khoang cach 2 banh = số vừa đo. <code>idf.py flash</code>.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Trên sàn: đi thẳng, quay 5 vòng', ke_thua: true,
        gioi_thieu: 'Dán một mẩu băng keo lên mũi robot và một vạch trên sàn ngay dưới mũi, để đếm vòng quay.',
        buoc: [
          K.camPack('Cắm P+ (robot trên sàn)', ['Bấm <b>Z</b>, rồi <b>F 1000</b>. Đo quãng thật bằng thước.'],
            { thay: 'Robot đi thẳng ~1m rồi dừng. Trạm vẽ đoạn thẳng, nhật ký in "xong: x=… y=…".', neu_khong: 'Quãng thật khác 1000 quá 3%: đo lại mm/xung (19.1).' }),
          { ten: 'Quay 5 vòng', cap_dien: true, lam: ['Bấm <b>Z</b>, rồi <b>Q 5</b>. Đếm số vòng robot thật quay nhờ vạch dưới mũi (ước phần lẻ bằng góc: 1/4 vòng = 90°).'],
            kiem: { thay: 'Robot dừng sau ~20 giây. Số vòng thật 4.8–5.2.', neu_khong: 'Robot vừa quay vừa trôi đi xa: 2 bánh không đều, ghi lại, bài 19.4 xử lý.' } },
          K.rutPack(['Tính <code>b mới = b cũ × 5 ÷ số vòng thật</code>, điền vào menuconfig, nạp lại, làm lại Q 5. Lặp tới khi hụt/dư dưới 1/8 vòng (45°).']),
        ],
      },
    ],
    bang_do: [{ ten: 'Hiệu chuẩn', cot: ['b trong code (mm)', 'Vòng thật sau Q 5'], hang: [{ ten: 'Lần 1 (b đo thước)', du_doan: ['≈ 135', '4.8–5.2'] }, { ten: 'Lần 2 (b đã sửa)', du_doan: ['', '≈ 5.0'] }] }],
    bay: ['Đo b từ mép ngoài lốp này tới mép ngoài lốp kia: lớn hơn b thật cả bề rộng lốp.', 'Quay trên thảm: bánh trượt, số vòng đo được không phản ánh b.', 'Đẩy robot bằng tay trong lúc đang chạy: odometry không biết, vị trí sai hẳn từ đó.'],
    robot: ['Từ giờ robot biết mình ở đâu so với chỗ bắt đầu, nhưng sai số cứ lớn dần. Mọi robot thật đều có vấn đề này, và 3 chương sau là 3 cách chống trôi: gyro, bản đồ, LiDAR.'],
  });
})();
