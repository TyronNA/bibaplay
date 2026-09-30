// Bài 21.2 — LiDAR LD19: P5V → 16h (cầu 5V của 20.2), GND → thanh −, PWM → thanh − (tài liệu LD19: không điều tốc ngoài thì PWM nối GND),
// Tx → 56h, GPIO16 ở 56i. Firmware 21.x đã có sẵn phần chuyển byte LiDAR.
(function () {
  const sd = SD;
  const o = (x, w, t) => `<rect x="${x}" y="30" width="${w}" height="30" class="sd-net sd-to"/>` + sd.chu(x + w / 2, 50, t, 'sd-mo', 'middle');
  const goi = sd.svg(380, 170, o(4, 30, '54') + o(34, 30, '2C') + o(64, 40, 'tốc độ') + o(104, 44, 'góc đầu') + o(148, 110, '12 × (mm, cường độ)') + o(258, 44, 'góc cuối') + o(302, 40, 'mốc ms') + o(342, 32, 'CRC')
    + sd.chu(4, 20, '47 byte / gói, 375 gói/s', 'sd-mo') + sd.chu(4, 90, 'góc: 0.01°, tăng theo chiều kim đồng hồ nhìn từ trên', 'sd-mo')
    + sd.chu(4, 110, 'góc từng điểm: nội suy đều từ góc đầu tới góc cuối', 'sd-mo') + sd.chu(4, 130, 'CRC-8 (đa thức 0x4D) của 46 byte đầu', 'sd-mo')
    + sd.chu(4, 150, 'ROS: góc ngược chiều kim đồng hồ → đổi dấu', 'sd-mo'),
    'Cấu trúc một gói LD19: đầu 54 2C, tốc độ, góc đầu, 12 điểm, góc cuối, mốc thời gian, CRC');
  const nen = [...K.robot17(), K.cu(K.espRobot())];
  const [C5, TU] = K.p4.nguon5();

  BAI.dangKy({
    id: '21.2',
    muc_tieu: 'Gắn LiDAR LD19 lên robot. LiDAR quay 10 vòng/giây, mỗi vòng đo ~450 khoảng cách bằng laser. Robot không tự đọc số liệu này, chỉ chuyển nguyên từng byte lên máy Linux qua WiFi. Node cau_robot giải gói, kiểm CRC rồi phát <code>/scan</code>. Sau 0.1 giây là thấy đủ 360° quanh robot.',
    nguon: 'pack 2S → LM2596 5V → board + LD19 (~180mA) · WiFi',
    can: [K.can.robot17(), K.can.ld19(), K.can.tuhoa('100µF'), K.can.ducCai(4), K.can.day(2), K.can.mayLinux(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_21.c',
    code_may: 'sandbox/ros2-cau/cau_robot.py',
    code_may_ghi: 'Giải gói LD19 ở lớp DocLD19 và hàm phat_scan (thử không cần ROS: python3 cau_robot.py --tu-kiem)',
    kien_thuc: `
      <p><b>LD19</b> (LDROBOT) đo khoảng cách bằng thời gian bay của xung laser hồng ngoại (DTOF), 4500 lần/giây, đầu đo quay 10 vòng/giây. Tầm 0.02–12m, laser <b>Class 1</b> (an toàn cho mắt khi dùng bình thường). Nguồn 4.5–5.5V, ~180mA. Nó tự gửi số liệu qua UART 230400 baud ngay khi có điện, không cần lệnh.</p>
      <p>4 chân (đầu cắm ZH 1.5mm): <b>Tx</b> (ra số liệu, mức 0–3.3V, tối đa 3.5V), <b>PWM</b> (điều tốc từ ngoài), <b>GND</b>, <b>P5V</b>. Theo tài liệu hãng, không dùng điều tốc ngoài thì chân PWM <b>phải nối GND</b>. Đo Tx trước khi nối vào GPIO như mọi module khác.</p>
      <p>Mỗi gói 47 byte chứa 12 điểm. ESP32 gom 10 gói (470 byte) vào một gói UDP gửi lên máy Linux, cổng 4212. ESP32 vẫn giải gói để đếm số gói tốt/hỏng và tốc độ quay, báo trong nhật ký mỗi 2 giây, nhưng không làm gì thêm với các điểm.</p>
      <p>LiDAR phải nhìn thoáng 360°, nên gắn trên cùng, ở giữa robot (dùng cột đồng / tấm mica làm tầng 2). Mũi tên ▵ trên nắp quay là hướng 0°: xoay cho nó chỉ về <b>mũi robot</b>. Nếu LiDAR lệch khỏi trục bánh xe về phía trước L mét thì chạy cầu nối với <code>LIDAR_X=L ./chay.sh cau</code>.</p>`,
    so_do: [{ nhan: 'Một gói LD19', svg: goi, chu: 'Số 2 byte đều là byte thấp trước (little-endian).' }],
    du_doan: '<p>Đo Tx (chưa nối GPIO): DCV ≈ 3.2–3.3V (UART nghỉ ở mức 1, đồng hồ đo trung bình nên hơi thấp hơn khi đang có số liệu). Nhật ký cầu nối: "lidar ~375 goi/s (hong ~0), ~10.0 vong/s". Foxglove: thêm topic /scan, thấy các chấm vẽ đúng hình tường phòng. Đặt hộp trước mũi robot: chấm hiện <b>trước</b> mũi base_link.</p>',
    sau: `<h3>Băng thông</h3>
      <p>230400 baud, 10 bit/byte = 23040 byte/s tối đa. LD19 dùng 375 × 47 = 17625 byte/s, tức ~77% đường UART. Lên WiFi, cộng đầu gói UDP/IP (28 byte mỗi 470 byte) là ~18.7 kB/s ≈ 150 kbit/s: WiFi thừa sức, nhưng quảng bá thì không, nên robot chỉ gửi LiDAR khi đã biết địa chỉ máy nhận.</p>
      <h3>Góc từng điểm</h3>
      <p>Gói chỉ ghi góc đầu và góc cuối. Điểm thứ i (0…11) có góc <code>đầu + i·(cuối − đầu)/11</code>. Qua mốc 360° thì góc cuối nhỏ hơn góc đầu, phải cộng 360 trước khi nội suy. LD19 tăng góc theo chiều kim đồng hồ (hệ tay trái), ROS tăng ngược chiều, nên cầu nối đổi dấu góc. Mỗi vòng ~450 điểm được xếp vào 450 ô 0.8°, ô nào có nhiều điểm thì giữ điểm gần nhất.</p>
      <h3>CRC</h3>
      <p>Byte cuối là CRC-8 của 46 byte trước. Bảng 256 số trong tài liệu hãng chính là CRC-8 với đa thức 0x4D. Gói hỏng (nhiễu dây, mất byte) thì CRC sai và bị bỏ, và bộ đọc dò lại đầu gói <code>54 2C</code> từ byte kế tiếp. Không kiểm CRC thì một byte lệch làm cả vòng quét ra điểm rác.</p>`,
    hoi: [
      ['10 vòng/giây, 4500 điểm/giây. Mỗi vòng bao nhiêu điểm, cách nhau bao nhiêu độ?', '4500/10 = <b>450</b> điểm, 360/450 = <b>0.8°</b>. Ở 3m, hai điểm cạnh nhau cách 3000 × 0.014 ≈ 42mm.'],
      ['Gói có góc đầu 355.00°, góc cuối 5.00°. Điểm thứ 6 (i = 6) ở góc nào?', 'Cuối < đầu nên cuối = 365. Bước = 10/11 ≈ 0.909°. Điểm 6: 355 + 6 × 0.909 ≈ 360.45 → <b>0.45°</b>.'],
      ['Vì sao chân PWM phải nối GND chứ không để hở?', 'Tài liệu LD19: không điều tốc ngoài thì PWM phải nối GND để LiDAR dùng điều tốc bên trong (10 vòng/s). Để hở thì chân thả nổi, có thể bị hiểu là tín hiệu điều tốc.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nối LD19 (P+ rút, USB rút)', cot: 63,
        gioi_thieu: 'Hình chỉ vẽ robot 17.1 và phần của bài này. Encoder, GY-521 vẫn cắm nguyên. Đã làm 20.2 thì cầu 5V (16e → 16f) và tụ 100µF đã có sẵn.',
        buoc: [
          { ten: 'Robot như trước, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          { ten: 'Cầu 5V nửa dưới + tụ (bỏ qua nếu đã có từ 20.2)', lam: ['Dây đỏ <b>16e → 16f</b>. Tụ 100µF: chân + vào <b>16j</b>, chân − vào thanh − dưới cột 17.'], board: { them: [C5, TU] } },
          { ten: 'Gắn LD19 lên tầng trên', lam: ['Bắt LD19 ở giữa robot, cao hơn mọi thứ khác, mũi tên ▵ chỉ về mũi robot. Không để dây, cột, bánh xe che tầm quét.', 'Đọc thứ tự chân in trên vỏ LD19 hoặc tài liệu kèm dây: 1 Tx, 2 PWM, 3 GND, 4 P5V. Dây kèm theo có màu thì ghi lại màu nào là chân nào, <b>đừng đoán theo màu</b>.'],
            kiem: { thay: 'Biết chắc dây nào là Tx, PWM, GND, P5V.', neu_khong: 'Không chắc: hỏi shop / tìm tài liệu đúng mã sản phẩm. Cắm nhầm P5V vào Tx là hỏng.' } },
          { ten: 'Nối 4 dây', kiem_truoc: true, lam: ['P5V → <b>16h</b>. GND → <b>thanh − dưới cột 58</b>. PWM → <b>thanh − dưới cột 57</b>. Tx → <b>56h</b>. Chưa nối GPIO16.'], board: { them: K.p4.lidar() },
            kiem: { thay: 'P5V ở 16h (5V), không phải thanh + dưới (3V3) hay thanh + trên (pin).', neu_khong: '' } },
          K.buocOmRobot(['⑤ 16h ↔ thanh − dưới: không dưới 100Ω.', '⑥ 56j (Tx) ↔ thanh − dưới: không gần 0.']),
          { ten: 'Cắm P+, đo Tx', cap_dien: true, kiem_truoc: true, lam: ['Không USB. Cắm P+ vào 44a: LD19 bắt đầu quay. Núm <code>DCV 20</code>, que đỏ <b>56j</b>, que đen thanh − dưới.'], board: { them: [K.packRobot(), K.dh('DCV 20', '56j', 'B-:56', '≈ 3.3')] },
            kiem: { thay: 'LD19 quay đều, êm. Tx ≈ 3.1–3.3V, không bao giờ trên 3.5V. 16i ≈ 5.0V.', neu_khong: 'Tx trên 3.6V: <b>không nối GPIO</b>, rút P+. LD19 không quay: đo 16i, kiểm P5V/GND.' } },
          K.rutPack(),
          { ten: 'Dây GPIO16', lam: ['P+ đã rút. <code>16</code> → <b>56i</b>.'], board: { bo: ['esp'], them: [K.espRobot(K.p4.lidarEsp)] } },
        ],
      },
      {
        ten: 'Phần 2 · Xem /scan (firmware 21.x đã nạp ở 21.1)', ke_thua: true,
        buoc: [
          K.camPack('Cắm P+, chạy cầu nối', ['Robot đặt trên sàn giữa phòng, để yên 2 giây. Máy Linux: <code>./chay.sh cau</code> và <code>./chay.sh xem</code>. Foxglove: panel 3D, khung hiển thị <code>base_link</code>, bật topic <code>/scan</code>.'],
            { thay: 'Nhật ký cau_robot: "robot: lidar ~375 goi/s (hong ~0), ~10 vong/s". Foxglove vẽ các chấm thành hình tường phòng.', neu_khong: '0 gói/s: byte LiDAR không tới GPIO16, kiểm dây 56h/56i và Tx. Có gói/s mà Foxglove không có /scan: kiểm khung hiển thị là base_link, và topic /scan đã bật. Hỏng nhiều: dây Tx dài hoặc lỏng.' }),
          { ten: 'Kiểm hướng', cap_dien: true, lam: ['Đặt một hộp cách mũi robot ~50cm, rồi dời sang bên trái robot.'], kiem: { thay: 'Chấm của hộp hiện trước mũi base_link (trục x đỏ), rồi sang phía trục y (xanh lá), tức bên trái.', neu_khong: 'Hộp trước mặt mà chấm ở sau: LD19 gắn ngược, chạy lại với <code>LIDAR_YAW=180</code>. Hộp bên trái mà chấm bên phải: LD19 đang gắn lộn ngược (nắp quay xuống), lật lại cho nắp quay lên trên.' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'LD19', cot: ['Tx (V)', 'gói/s', 'vòng/s'], hang: [{ ten: 'Đo được', du_doan: ['3.1–3.3', '≈ 375', '≈ 10'] }] }],
    bay: ['Đoán chân LD19 theo màu dây: dây chuyển của mỗi shop một kiểu.', 'Để chân PWM hở: tài liệu yêu cầu nối GND khi không điều tốc.', 'LiDAR thấp, bị cột hay dây che: vòng quét có "bóng" cố định, SLAM hiểu nhầm là vật.', 'Nhìn thẳng vào đầu laser lâu ở khoảng cách sát: Class 1 là an toàn khi dùng bình thường, đừng thử giới hạn.', 'Lấy 5V của LD19 từ chân 3V3: LiDAR không quay nổi.'],
    robot: ['Robot hút bụi đời mới có đúng loại LiDAR tam giác/DTOF quay này ở nắp. Bài 21.3 cho slam_toolbox dùng /scan để vẽ bản đồ.'],
  });
})();
