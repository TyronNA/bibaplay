// Bài 21.3 — SLAM bằng slam_toolbox. Robot như cuối 21.2, không đổi mạch, không đổi firmware.
(function () {
  const sd = SD;
  const vong = sd.svg(380, 220, sd.mui
    + `<path d="M60 170 C 60 40, 320 40, 320 150 C 320 200, 120 200, 72 176" class="sd-net" style="fill:none"/>` + K.mt(80, 178, 64, 172)
    + sd.cham(60, 170) + sd.chu(20, 196, 'bắt đầu', 'sd-chu') + sd.cham(72, 176)
    + sd.chu(90, 150, 'về gần chỗ cũ: scan mới khớp', 'sd-mo') + sd.chu(90, 166, 'với scan đầu → "khép vòng"', 'sd-mo')
    + sd.chu(150, 30, 'odometry trôi dần dọc đường', 'sd-mo') + sd.chu(150, 100, 'slam_toolbox sửa lại', 'sd-mo') + sd.chu(150, 116, 'cả đường đã đi', 'sd-mo'),
    'Robot đi một vòng quanh phòng; về gần chỗ cũ, scan mới khớp với scan đầu và cả vòng được sửa lại');

  BAI.dangKy({
    id: '21.3',
    muc_tieu: 'Cho slam_toolbox vừa vẽ bản đồ vừa tự định vị robot trên bản đồ đó bằng LiDAR. Lái chậm một vòng quanh phòng rồi về chỗ cũ, xem bản đồ tự "khép vòng": bức tường thấy lần hai trùng khít lần đầu. Đây là việc mà bản đồ radar của 20.3 không làm được. Cuối bài lưu bản đồ ra file.',
    nguon: 'pack 2S → LM2596 → board + LD19 · WiFi · máy Linux',
    can: [K.can.robot17(), K.can.ld19(), K.can.mayLinux(), K.can.wifi()],
    code: 'sandbox/esp32-bai/main/bai_21.c',
    code_may: 'sandbox/ros2-cau/slam.yaml',
    code_may_ghi: 'Tham số của slam_toolbox (file YAML, nạp khi chạy ./chay.sh slam)',
    kien_thuc: `
      <p><b>Odometry</b> nói robot đã đi bao xa so với lần trước, và sai số cứ cộng dồn (19.5, 20.3). <b>So khớp scan</b> (scan matching) thì so vòng quét LiDAR mới với các vòng cũ: dịch/xoay vòng mới tới chỗ nó khớp nhất với tường đã thấy. Chỗ khớp nhất đó cho biết robot thật đã đi bao xa, chính xác hơn odometry nhiều.</p>
      <p>slam_toolbox dùng odometry làm điểm đoán ban đầu, rồi so khớp để sửa. Nó giữ một <b>đồ thị tư thế</b>: mỗi nút là một chỗ robot đã đứng (kèm scan lúc đó), mỗi cạnh là "từ nút này tới nút kia đi bao nhiêu". Khi robot quay về gần một nút cũ và scan khớp được với scan cũ, nó thêm một cạnh <b>khép vòng</b> (loop closure), rồi chỉnh lại <b>toàn bộ</b> các nút trên vòng cho khớp với cạnh mới. Bản đồ vẽ lại theo các nút đã chỉnh.</p>
      <p>slam_toolbox phát <code>/map</code> (bản đồ lưới 5cm, cùng kiểu với 20.3) và TF <code>map → odom</code>. Cạnh này là phần sửa: robot ở đâu trên bản đồ = (map → odom) nối với (odom → base_link) của odometry.</p>
      <p>Tham số chính: ô 5cm, chỉ dùng điểm trong 8m, thêm scan mới vào đồ thị khi robot đã đi 15cm hoặc quay 0.15 rad.</p>`,
    so_do: [{ nhan: 'Khép vòng', svg: vong, chu: 'Về tới chỗ cũ là cả vòng được kéo cho khớp.' }],
    du_doan: '<p>Foxglove hiện /map lớn dần theo đường lái. Trước khi về tới chỗ cũ, bức tường ở đầu vòng có thể bị vẽ 2 lần lệch nhau vài cm. Về gần chỗ cũ vài giây: bản đồ "giật" một cái, tường gộp lại thành một. TF map → odom lúc đó nhảy đúng bằng lượng odometry đã trôi.</p>',
    sau: `<h3>So khớp scan là một bài toán tối ưu</h3>
      <p>Tìm phép dời (dx, dy, dθ) để các điểm scan mới rơi đúng lên ô "có vật" của bản đồ nhiều nhất. slam_toolbox (theo Karto) thử một lưới các phép dời quanh điểm đoán của odometry, chấm điểm từng phép, rồi tinh chỉnh quanh phép tốt nhất. Phòng trống, hành lang dài thẳng tắp là chỗ khó: dịch dọc hành lang thì scan vẫn khớp như nhau, và robot "trượt" trên bản đồ.</p>
      <h3>Đồ thị tư thế</h3>
      <p>Mỗi cạnh là một phép đo tương đối kèm độ tin. Khép vòng thêm một cạnh mâu thuẫn với chuỗi cạnh cũ (chuỗi cũ cộng lại lệch vì trôi). Bộ tối ưu tìm vị trí các nút sao cho tổng sai lệch bình phương trên mọi cạnh nhỏ nhất, và sai số trôi được chia đều ra cả vòng thay vì dồn hết vào chỗ cuối.</p>
      <h3>Vì sao lái chậm</h3>
      <p>Robot quay 1 rad/s thì trong 0.1 giây của một vòng quét, robot đã quay 5.7°: tường trong cùng một scan bị "vặn". Quay chậm (≤ 0.5 rad/s) và đi chậm (≤ 0.15 m/s) cho scan sắc hơn và so khớp chắc hơn.</p>`,
    hoi: [
      ['map → odom do ai phát, odom → base_link do ai phát?', 'map → odom: <b>slam_toolbox</b> (phần sửa sai). odom → base_link: <b>cau_robot</b> (odometry của robot).'],
      ['Lái dọc hành lang dài, thẳng, trơn: vì sao SLAM hay sai ở đây?', 'Mọi scan dọc hành lang giống nhau (2 bức tường song song). So khớp không biết robot đã đi bao xa theo chiều dọc, nên chỉ còn trông vào odometry.'],
      ['Quay 1 rad/s, LiDAR 10 vòng/s. Trong một vòng quét robot quay bao nhiêu độ?', '1 rad/s × 0.1s = 0.1 rad ≈ <b>5.7°</b>. Tường trong scan bị méo đi chừng đó.'],
    ],
    phan: [{
      ten: 'Phần 1 · Vẽ bản đồ phòng', cot: 63,
      gioi_thieu: 'Dọn sàn phòng. Robot đặt ở giữa, đánh dấu chỗ đặt.',
      buoc: [
        { ten: 'Robot như cuối 21.2, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Firmware 21.x.'], board: { them: [...K.robot17(), ...K.p4.nguon5().map(K.cu), ...K.p4.lidar().map(K.cu), K.cu(K.espRobot({ ...K.p4.encEsp, ...K.p4.imuEsp, ...K.p4.lidarEsp }))] }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
        K.buocOmRobot(['⑤ 16h ↔ thanh − dưới (5V LiDAR): không dưới 100Ω.']),
        K.camPack('Cắm P+, chạy 4 node', ['Robot để yên 2 giây. Máy Linux, 4 Terminal: <code>./chay.sh cau</code>, <code>./chay.sh slam</code>, <code>./chay.sh xem</code>, <code>./chay.sh lai</code>. Foxglove: panel 3D, khung hiển thị <code>map</code>, bật <code>/map</code> và <code>/scan</code>.'],
          { thay: 'Sau vài giây Foxglove hiện /map: vùng xám nhạt (trống), vạch đen (tường) quanh robot.', neu_khong: 'Không có /map: log slam có báo "message filter dropping" (lệch giờ hoặc thiếu TF base_link → laser)? Kiểm cau_robot đang chạy.' }),
        { ten: 'Lái một vòng chậm', cap_dien: true, lam: ['Teleop: hạ tốc (<code>x</code> nhiều lần tới ~0.12 m/s, <code>c</code> tới ~0.4 rad/s). Lái vòng quanh phòng, cách tường ~0.5m, rồi về đúng dấu lúc đầu. Dừng lại vài giây.'],
          kiem: { thay: 'Bản đồ lớn dần. Về tới dấu: tường đầu vòng gộp lại thành một, không còn 2 vạch.', neu_khong: 'Bản đồ xoay, nhân đôi tường ngay khi quay tại chỗ: quay chậm hơn nữa, kiểm gyro (19.4).' } },
        { ten: 'Lưu bản đồ', cap_dien: true, lam: ['Terminal thứ 5: <code>./chay.sh luu</code>.'], kiem: { thay: 'Thư mục ban-do có phong.pgm (ảnh xám mở bằng trình xem ảnh được) và phong.yaml.', neu_khong: '' } },
        K.rutPack(['Ctrl+C các Terminal.']),
      ],
    }],
    bang_do: [{ ten: 'Bản đồ phòng', cot: ['Tường gộp khi khép vòng?', 'Lệch 2 lần vẽ trước khi khép (cm)'], hang: [{ ten: 'Vòng 1', du_doan: ['có', '2–15'] }] }],
    bay: ['Lái nhanh, quay gắt: scan méo, bản đồ nhân đôi tường.', 'Gương, kính, tường đen bóng: laser dội đi hoặc xuyên qua, bản đồ thủng.', 'Người đi lại trong phòng lúc vẽ: bản đồ có "bóng ma".', 'Không lưu bản đồ trước khi tắt slam: mất hết.'],
    robot: ['Có bản đồ + vị trí đúng trên bản đồ, robot tự lập đường được. Bài 21.4.'],
  });
})();
