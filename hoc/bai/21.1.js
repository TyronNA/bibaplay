// Bài 21.1 — ROS 2 lái robot. Robot chạy firmware "21.x" (encoder + GY-521 như cuối 19.4); ROS 2 Jazzy trong Docker trên máy Linux.
(function () {
  const sd = SD;
  const dt = sd.svg(380, 240, sd.mui
    + sd.hop(10, 20, 110, 40, 'robot (ESP32)') + sd.hop(170, 20, 110, 40, 'cau_robot') + K.mt(120, 34, 170, 34) + K.mt(170, 48, 120, 48) + sd.chu(124, 28, 'T x y θ', 'sd-mo') + sd.chu(124, 62, 'V v w', 'sd-mo')
    + K.mt(225, 60, 225, 100) + sd.chu(232, 86, '/odom, /tf', 'sd-mo') + sd.hop(170, 100, 110, 34, 'foxglove_bridge') + K.mt(280, 117, 330, 117) + sd.chu(300, 110, 'ws', 'sd-mo') + sd.hop(300, 140, 76, 34, 'Foxglove')
    + sd.hop(10, 180, 130, 34, 'teleop (bàn phím)') + sd.day('140,197 300,197 300,40 280,40') + sd.chu(150, 214, '/cmd_vel (m/s, rad/s)', 'sd-mo')
    + sd.chu(10, 100, 'UDP qua WiFi', 'sd-mo') + sd.chu(10, 120, 'mọi thứ bên phải', 'sd-mo') + sd.chu(10, 136, 'chạy trong Docker', 'sd-mo'),
    'Robot gửi odometry cho node cau_robot; cau_robot phát lên ROS 2; teleop gửi lệnh tốc độ; Foxglove xem qua foxglove_bridge');
  const nen = [...K.robot17(), ...K.p4.enc().map(K.cu), ...K.p4.imu().map(K.cu), K.cu(K.espRobot({ ...K.p4.encEsp, ...K.p4.imuEsp }))];

  BAI.dangKy({
    id: '21.1',
    muc_tieu: 'Đưa robot vào ROS 2, bộ "hệ điều hành" chung mà robot nghiên cứu và công nghiệp dùng. Robot vẫn tự lo phần sát phần cứng (PI bánh xe, odometry, dừng khi mất lệnh). Một node trên máy Linux chuyển số liệu của robot thành các topic chuẩn của ROS 2. Sau bài này, mọi công cụ ROS 2 có sẵn (lái bằng bàn phím, xem 3D, vẽ bản đồ, tìm đường) đều dùng được với robot của bạn.',
    nguon: 'pack 2S → LM2596 → board · WiFi · máy Linux',
    can: [K.can.robot17(), K.can.mayLinux(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_21.c',
    code_may: 'sandbox/ros2-cau/cau_robot.py',
    code_may_ghi: 'Node ROS 2 (Python, rclpy) chạy trong Docker trên máy Linux. Đi kèm Dockerfile, chay.sh, slam.yaml, sua_nav2.py',
    kien_thuc: `
      <p><b>ROS 2</b> chia robot thành nhiều <b>node</b> (chương trình nhỏ) nói chuyện với nhau qua <b>topic</b> (kênh có tên và kiểu tin cố định). Node lái bằng bàn phím phát <code>/cmd_vel</code> (tốc độ thẳng m/s + tốc độ quay rad/s). Node của robot phát <code>/odom</code> (vị trí ước lượng) và <b>TF</b> (khung toạ độ này nằm ở đâu so với khung kia). Node nào cũng không cần biết node kia là ai, chỉ cần đúng tên topic.</p>
      <p>ESP32 không chạy ROS 2 (cần Linux, nhiều RAM). Node <code>cau_robot</code> chạy trên máy Linux làm cầu nối: nhận dòng <code>T x y θ v w</code> từ robot rồi phát <code>/odom</code> + TF <code>odom → base_link</code>, và nghe <code>/cmd_vel</code> rồi gửi <code>V v w</code> xuống robot 20 lần/giây. Firmware 21 giữ nguyên các giới hạn an toàn: kẹp 300mm/s và 2 rad/s, mất lệnh 0.5 giây là dừng, cản va bị đè thì không tiến.</p>
      <p>Cài ROS 2 thẳng lên máy dễ làm rối máy. Bài này để ROS 2 Jazzy (bản cho Ubuntu 24.04) trong <b>Docker</b>: <code>./chay.sh dung</code> build một lần, mỗi lệnh <code>./chay.sh cau | xem | lai | slam | nav2</code> chạy một thứ trong container riêng, mở một Terminal cho mỗi lệnh. <code>--net=host</code> cho container dùng thẳng mạng của máy để nhận gói UDP của robot.</p>
      <p>Xem robot bằng <b>Foxglove</b> (app trên máy tính của bạn, kết nối tới <code>ws://&lt;IP máy Linux&gt;:8765</code>) hoặc <b>RViz2</b> nếu máy Linux có màn hình. Tắt trạm (18.1) trước: robot gửi số liệu cho bên nào gửi lệnh gần nhất, 2 bên cùng gửi thì robot bị giằng co.</p>`,
    so_do: [{ nhan: 'Các node', svg: dt, chu: 'Robot chỉ nói chuyện với cau_robot. Mọi node khác chỉ thấy topic chuẩn.' }],
    du_doan: '<p>Chạy cau_robot: log in "thay robot o log in "thay robot o 192.168.x.x"lt;IP robotlog in "thay robot o 192.168.x.x"gt;", rồi mỗi 2 giây một dòng "robot: lidar 0.0 goi/s … gyro co …" (chưa có LiDAR). Foxglove: mũi tên base_link chạy theo robot thật khi lái bằng teleop. Ctrl+C cau_robot: robot dừng ngay (cầu gửi X khi thoát), hoặc chậm nhất 0.5 giây.</p>',
    sau: `<h3>Vì sao phải có TF</h3>
      <p>Mỗi thứ trên robot có khung toạ độ riêng: tâm bánh xe (<code>base_link</code>), LiDAR (<code>laser</code>, 21.2), điểm bắt đầu (<code>odom</code>), bản đồ (<code>map</code>, 21.3). Điểm LiDAR đo trong khung laser, muốn vẽ lên bản đồ phải đi qua cả chuỗi <code>map → odom → base_link → laser</code>. TF là cây các phép biến đổi này, mỗi cạnh do một node phát: cau_robot phát odom → base_link (và base_link → laser, cố định), slam_toolbox phát map → odom.</p>
      <h3>Góc thành quaternion</h3>
      <p>ROS 2 lưu hướng 3D bằng quaternion (x, y, z, w). Robot chỉ quay quanh trục thẳng đứng góc θ, nên quaternion là <code>(0, 0, sin(θ/2), cos(θ/2))</code>. Dùng nửa góc để tránh điểm kỳ dị của cách lưu bằng 3 góc (Euler).</p>
      <h3>Đơn vị</h3>
      <p>ROS dùng mét, radian, giây (REP 103), trục x hướng tới trước, y sang trái, z lên trên, góc dương ngược chiều kim đồng hồ. Robot gửi mm và độ, cau_robot đổi: <code>/1000</code> và <code>radians()</code>. <code>/cmd_vel</code> 0.2 m/s thành <code>V 200 …</code>.</p>`,
    hoi: [
      ['teleop phát linear.x = 0.5 m/s. Robot chạy bao nhiêu?', 'cau_robot gửi <code>V 500 …</code>, firmware kẹp ở <b>300mm/s</b>. Giới hạn nằm ở robot, không phụ thuộc node nào gửi lệnh.'],
      ['θ = 90°. Quaternion của base_link trong odom là gì?', '(0, 0, sin 45°, cos 45°) ≈ <b>(0, 0, 0.707, 0.707)</b>.'],
      ['Vì sao cau_robot gửi "V 0 0" khi 0.5 giây không có /cmd_vel, thay vì im lặng?', 'Robot vẫn nhận gói nên biết trạm còn sống (không báo mất kết nối), nhưng đứng yên. Im lặng cũng dừng được (sau 0.5s), nhưng gửi 0 thì dừng ngay và rõ ràng hơn.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Dựng ROS 2 trên máy Linux (chưa cần robot)', cot: 63,
        buoc: [
          { ten: 'Cài Docker, lấy thư mục cầu nối', lam: ['Trên máy Linux: cài Docker theo tài liệu chính thức của Docker cho Ubuntu. Lấy thư mục <code>sandbox/ros2-cau</code> và file <code>gia_robot.py</code> (trong <code>sandbox/robot-may</code>) từ mã nguồn trên GitHub.', 'Trong thư mục ros2-cau: <code>./chay.sh dung</code>. Lần đầu tải ~1–2GB, mất 10–30 phút.'],
            kiem: { thay: 'Build xong, in "da sua: … robot_radius×… max_velocity×…".', neu_khong: 'In "CANH BAO: khong thay khoa …": file tham số Nav2 gốc đã đổi, bài 21.4 phải sửa tay (chưa ảnh hưởng 21.1–21.3).' } },
          { ten: 'Thử với robot giả', lam: ['Terminal 1: <code>python3 gia_robot.py</code>. Terminal 2: <code>./chay.sh cau</code>. Terminal 3: <code>./chay.sh lai</code>, giữ phím <code>i</code> vài giây, rồi <code>k</code>.'],
            kiem: { thay: 'cau_robot in "thay robot o 127.0.0.1". Terminal 1 không báo lỗi. <code>./chay.sh lenh ros2 topic echo /odom --once</code> in vị trí đã đổi.', neu_khong: '"Address already in use": trạm hoặc một cau_robot khác đang giữ cổng 4210, tắt nó đi.' } },
          { ten: 'Tắt robot giả', lam: ['Ctrl+C ở cả 3 Terminal.'] },
        ],
      },
      {
        ten: 'Phần 2 · Robot thật, bánh trên không', cot: 63,
        buoc: [
          { ten: 'Robot có encoder + GY-521, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 21.x', ['menuconfig → Bai hoc → <b>21.x Cau noi ROS 2</b>. <code>idf.py flash</code>, rồi rút USB.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
          K.camPack('Cắm P+, chạy cầu nối', ['Kê bánh trên không. Robot để yên 2 giây (đo gyro). Máy Linux: <code>./chay.sh cau</code>, <code>./chay.sh xem</code>, <code>./chay.sh lai</code> (3 Terminal). Máy tính của bạn: mở Foxglove, kết nối <code>ws://&lt;IP máy Linux&gt;:8765</code>, thêm panel 3D, chọn khung hiển thị <code>odom</code>.'],
            { thay: 'cau_robot in "thay robot o …" và "robot: … gyro co …". Foxglove hiện trục base_link.', neu_khong: 'Không thấy robot: máy Linux và robot khác mạng, hoặc trạm 18.1 còn chạy ở đâu đó.' }),
          { ten: 'Lái bằng teleop', cap_dien: true, lam: ['Ở Terminal teleop: bấm <code>x</code> 5–6 lần để hạ tốc xuống ~0.25 m/s. Giữ <code>i</code> (tiến), <code>j</code> / <code>l</code> (quay), <code>k</code> (dừng).'], kiem: { thay: 'Bánh quay theo phím, trục base_link trên Foxglove chạy theo.', neu_khong: 'Bánh không quay: <code>./chay.sh lenh ros2 topic echo /cmd_vel</code> có thấy lệnh không.' } },
          { ten: 'Tắt cầu giữa lúc chạy', cap_dien: true, lam: ['Giữ <code>i</code> cho bánh quay, rồi Ctrl+C cau_robot.'], kiem: { thay: 'Bánh dừng ngay hoặc trong 0.5 giây.', neu_khong: '<b>Không dừng: rút P+ ngay</b>, kiểm lại firmware đã nạp.' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Kiểm cầu nối', cot: ['Thấy gì', 'Thời gian'], hang: [{ ten: 'Tắt cau_robot khi đang tiến', du_doan: ['robot dừng', '≤ 0.5s'] }, { ten: 'teleop 0.5 m/s', du_doan: ['robot ~0.3 m/s', ''] }] }],
    bay: ['Trạm 18.1 còn chạy cùng lúc: robot giằng co giữa 2 bên.', 'Cài ROS 2 thẳng lên máy đang chạy việc khác: vỡ gói Python hệ thống. Để trong Docker.', 'Lái lần đầu ở tốc độ mặc định của teleop trên sàn: 0.5 m/s là nhanh với robot nhỏ.', 'Mở cổng 8765 của foxglove_bridge ra Internet: ai cũng lái được robot của bạn.'],
    robot: ['Bài 21.2 thêm LiDAR (/scan), 21.3 vẽ bản đồ, 21.4 tự đi. Không bài nào phải sửa firmware nữa.'],
  });
})();
