// Bài 21.4 — Tự tìm đường bằng Nav2 trên bản đồ của slam_toolbox. Robot như cuối 21.2.
(function () {
  const sd = SD;
  const nav = sd.svg(380, 230, sd.mui
    + sd.hop(10, 20, 100, 34, 'đích (bấm)') + K.mt(110, 37, 140, 37) + sd.hop(140, 20, 100, 34, 'planner') + sd.chu(146, 70, 'đường trên bản đồ', 'sd-mo')
    + K.mt(240, 37, 270, 37) + sd.hop(270, 20, 100, 34, 'controller') + K.mt(320, 54, 320, 94) + sd.hop(270, 94, 100, 34, 'smoother')
    + K.mt(270, 111, 230, 111) + sd.hop(130, 94, 100, 34, 'cau_robot') + sd.chu(150, 146, '/cmd_vel', 'sd-mo')
    + sd.hop(10, 170, 150, 34, 'costmap (bản đồ + /scan)') + sd.day('160,187 190,187 190,54') + sd.chu(196, 190, 'vật mới → vẽ lại đường', 'sd-mo'),
    'Nav2: đích đi vào planner lập đường trên costmap, controller bám đường ra lệnh tốc độ, smoother làm mượt, cầu nối gửi xuống robot');

  BAI.dangKy({
    id: '21.4',
    muc_tieu: 'Bấm một điểm trên bản đồ, robot tự lập đường đi, tự lái tới, và vẽ lại đường khi có vật mới chắn giữa đường. Nav2 là bộ điều hướng chuẩn của ROS 2, dùng trên cả robot kho hàng. Bài này chạy Nav2 cùng slam_toolbox (vừa vẽ vừa đi) với tham số hạ xuống cho robot 2 bánh nhỏ.',
    nguon: 'pack 2S → LM2596 → board + LD19 · WiFi · máy Linux',
    can: [K.can.robot17(), K.can.ld19(), K.can.mayLinux(), K.can.wifi()],
    code: 'sandbox/esp32-bai/main/bai_21.c',
    code_may: 'sandbox/ros2-cau/sua_nav2.py',
    code_may_ghi: 'Đổi tham số Nav2 mặc định cho robot nhỏ (chạy tự động lúc ./chay.sh dung)',
    kien_thuc: `
      <p>Nav2 chia việc thành các khối. <b>Costmap</b>: bản đồ của slam_toolbox cộng các điểm /scan mới nhất, rồi "phồng" mỗi vật cản ra thêm một vùng (inflation) để robot không đi sát. <b>Planner</b>: tìm đường ngắn nhất trên costmap từ robot tới đích (A* / Dijkstra trên lưới). <b>Controller</b>: bám đường đó, mỗi nhịp ra một lệnh (v, w), một bản nâng cấp của hàm đi tới điểm ở 19.5. <b>Velocity smoother</b>: giới hạn tốc độ, gia tốc. Kết quả là <code>/cmd_vel</code>, và cau_robot chuyển xuống robot như 21.1.</p>
      <p>Các khối này được điều khiển bởi một <b>cây hành vi</b> (behavior tree): đi theo đường, nếu kẹt thì xoá costmap, lùi, quay tại chỗ, lập đường lại… Đó là máy trạng thái xếp tầng (18.3) viết theo cách khác.</p>
      <p>Tham số mặc định của Nav2 dành cho robot to hơn, nhanh hơn. Lúc build (21.1), <code>sua_nav2.py</code> đã đổi: bán kính robot 0.10m, phồng vật 0.25m, tốc độ tối đa 0.20m/s tới / 0.10m/s lùi, quay 1.5rad/s. Firmware vẫn kẹp 300mm/s và vẫn dừng khi mất lệnh, dù Nav2 có đòi gì.</p>
      <p>Đặt đích trong Foxglove: panel 3D → phần cài đặt Publish → kiểu <b>Pose</b>, topic <code>/goal_pose</code>. Rồi dùng công cụ publish trên panel, bấm-kéo lên bản đồ (bấm = vị trí, kéo = hướng mũi lúc tới).</p>`,
    so_do: [{ nhan: 'Các khối Nav2', svg: nav, chu: 'Planner nghĩ đường xa (1–2 lần/giây), controller lái từng nhịp (~20 lần/giây).' }],
    du_doan: '<p>Bấm đích cách robot 2m qua chỗ trống: Foxglove vẽ đường /plan, robot quay về phía đường rồi đi theo, dừng gần đích và xoay đúng hướng đã kéo. Đặt một hộp chắn giữa đường khi robot đang đi: costmap hiện hộp (đã phồng), đường vẽ lại vòng qua hộp. Chặn kín lối: robot dừng, thử lùi / quay, rồi báo không tới được.</p>',
    sau: `<h3>Phồng vật cản</h3>
      <p>Planner coi robot là một điểm. Để một điểm đi được mà robot tròn bán kính r không chạm vật, mọi vật được phồng thêm r (không bao giờ đi vào), rồi thêm một vùng giá giảm dần tới bán kính phồng (đi được nhưng "đắt", planner tránh nếu có đường khác). Bán kính 0.10m + phồng 0.25m: robot đi giữa lối rộng 50cm nhưng vẫn chui được khe 25cm nếu không còn cách nào khác.</p>
      <h3>A* trên lưới</h3>
      <p>Mỗi ô 5cm là một nút, nối với 8 ô quanh nó. A* mở rộng dần từ ô robot, luôn chọn ô có <code>quãng đã đi + ước lượng còn lại</code> nhỏ nhất. Ước lượng là đường chim bay, không bao giờ lớn hơn quãng thật, nên đường tìm được là ngắn nhất. Phòng 5m × 5m có 10 000 ô: máy Linux tìm xong trong vài ms.</p>
      <h3>Vì sao firmware vẫn giữ giới hạn</h3>
      <p>Nav2 có thể bị cấu hình sai, WiFi có thể trễ, máy Linux có thể treo. Giới hạn tốc độ, cản va chặn tiến, dừng khi mất lệnh 0.5 giây nằm ở code chạy sát motor (18.4). Đó là lớp an toàn cuối, không phụ thuộc phần mềm nào ở trên.</p>`,
    hoi: [
      ['Robot bán kính 0.10m. Lối đi rộng 18cm có qua được không?', 'Không. Tâm robot cần cách mỗi bên ≥ 0.10m, tức lối ≥ 20cm. Costmap phồng vật 0.10m nên lối 18cm bị lấp kín.'],
      ['Planner và controller khác nhau thế nào?', 'Planner tìm <b>đường</b> trên bản đồ (hiếm khi, tốn tính toán). Controller ra <b>lệnh tốc độ</b> để bám đường đó (liên tục, nhanh), và né vật nhỏ xuất hiện đột ngột.'],
      ['Nav2 gửi /cmd_vel 0.5 m/s do cấu hình sai. Robot chạy bao nhiêu?', 'Tối đa <b>0.3 m/s</b>: firmware kẹp ở 300mm/s.'],
    ],
    phan: [{
      ten: 'Phần 1 · Tự đi trên bản đồ', cot: 63,
      gioi_thieu: 'Phòng đã dọn. Làm lại được 21.3 trước (bản đồ khép vòng tốt) rồi mới làm bài này.',
      buoc: [
        { ten: 'Robot như cuối 21.2, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: [...K.robot17(), ...K.p4.nguon5().map(K.cu), ...K.p4.lidar().map(K.cu), K.cu(K.espRobot({ ...K.p4.encEsp, ...K.p4.imuEsp, ...K.p4.lidarEsp }))] }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
        K.buocOmRobot(['⑤ 16h ↔ thanh − dưới (5V LiDAR): không dưới 100Ω.']),
        K.camPack('Cắm P+, chạy cầu + slam + nav2', ['Robot để yên 2 giây. Máy Linux: <code>./chay.sh cau</code>, <code>./chay.sh slam</code>, <code>./chay.sh xem</code>, rồi <code>./chay.sh nav2</code>. Lái teleop một vòng ngắn để có bản đồ quanh robot, tắt teleop (2 bên cùng gửi /cmd_vel thì giằng co).'],
          { thay: 'Log nav2 in "Managed nodes are active". Foxglove bật được /global_costmap/costmap (bản đồ có viền phồng).', neu_khong: 'Nav2 báo thiếu TF map → base_link: slam chưa chạy, hoặc chưa có scan nào.' }),
        { ten: 'Đặt đích', cap_dien: true, lam: ['Foxglove: cài Publish của panel 3D thành Pose, topic <code>/goal_pose</code>. Bấm-kéo một đích cách robot ~1.5m trên vùng trống.', 'Tay sẵn sàng nhấc robot. Muốn dừng gấp: Ctrl+C cau_robot (robot dừng ≤ 0.5s) hoặc rút P+.'],
          kiem: { thay: 'Hiện /plan (đường), robot đi theo, dừng gần đích, xoay đúng hướng.', neu_khong: 'Robot quay vòng tại chỗ không đi: hướng odometry ngược (kiểm 19.4), hoặc tốc độ quay quá nhỏ so với ma sát. Robot đi lệch hẳn khỏi đường: controller cần chỉnh, ghi lại log.' } },
        { ten: 'Chặn đường', cap_dien: true, lam: ['Đặt đích xa hơn. Khi robot đang đi, đặt một hộp giấy giữa đường, cách robot ~60cm.'], kiem: { thay: 'Costmap hiện hộp, /plan vẽ lại vòng qua hộp, robot đi vòng.', neu_khong: 'Robot vẫn lao vào hộp: /scan có thấy hộp không (hộp thấp hơn tầm quét của LiDAR thì không thấy). Cản va chặn tiến sẽ dừng robot.' } },
        K.rutPack(['Ctrl+C các Terminal.']),
      ],
    }],
    bang_do: [{ ten: 'Đi tới đích', cot: ['Tới được?', 'Cách đích (cm)'], hang: [{ ten: 'Vùng trống 1.5m', du_doan: ['có', '< 10'] }, { ten: 'Có hộp chắn', du_doan: ['có, đi vòng', '< 10'] }] }],
    bay: ['Chạy teleop song song với Nav2: 2 nguồn /cmd_vel giằng nhau.', 'Vật thấp hơn mặt phẳng quét của LiDAR (dây điện, chân ghế thấp): costmap không thấy.', 'Bán kính robot đặt nhỏ hơn thật: robot quệt góc tường.', 'Tin Nav2 là an toàn rồi bỏ lớp an toàn trong firmware.'],
    robot: ['Đây là toàn bộ bộ não của robot hút bụi LiDAR: bản đồ (21.3), định vị, lập đường, né vật. Phần còn lại (hút, chổi, về đế sạc) là thêm motor và thêm trạng thái vào cây hành vi.'],
  });
})();
