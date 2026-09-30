// Bài 20.3 — Vẽ bản đồ lưới: lái (18.4) / đi tới điểm (19.5), dừng, quét radar (20.2). Mạch như cuối 20.2.
(function () {
  const sd = SD;
  const o = 22, luoi = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 7; j++) luoi.push(`<rect x="${40 + i * o}" y="${20 + j * o}" width="${o}" height="${o}" class="sd-net" style="fill:none;opacity:.35"/>`);
  const tia = [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3]].map(([i, j], k) => `<rect x="${40 + i * o}" y="${20 + j * o}" width="${o}" height="${o}" style="fill:#4caf50;opacity:.35"/>`).join('');
  const ban = sd.svg(380, 220, luoi.join('') + tia + `<rect x="${40 + 8 * o}" y="${20 + 3 * o}" width="${o}" height="${o}" class="sd-net sd-to"/>`
    + sd.cham(40 + o * 0.5, 20 + o * 3.5) + sd.chu(10, 190, 'ô trên đường tia: trống (xanh)', 'sd-mo') + sd.chu(10, 210, 'ô ở cuối tia: có vật (đậm)', 'sd-mo')
    + sd.chu(250, 190, 'ô 5cm', 'sd-mo'),
    'Lưới ô vuông; một tia siêu âm từ robot đi qua các ô trống rồi dừng ở ô có vật');
  const nen = [...K.robot17().filter(i => i.id !== 'sr'), ...K.p4.nguon5().map(K.cu), ...K.p4.servo().map(K.cu), ...K.p4.srServo().map(K.cu), K.cu(K.espRobot(K.p4.servoEsp))];

  BAI.dangKy({
    id: '20.3',
    muc_tieu: 'Ghép radar (20.2) với vị trí robot (19.x): mỗi chấm radar được đặt lên bản đồ theo chỗ robot đứng lúc đo. Lái robot quanh phòng, dừng lại quét ở vài chỗ, và trạm vẽ ra bản đồ lưới: ô nào trống, ô nào có vật. Rồi quay lại chỗ cũ để thấy odometry trôi làm bản đồ nhoè ra sao.',
    nguon: 'pack 2S → LM2596 → board + servo · WiFi',
    can: [K.can.robot17(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_20_3.c',
    code_may: 'sandbox/robot-may/tram.html',
    code_may_ghi: 'Phần vẽ bản đồ lưới nằm trong giao diện trạm, chạy trên trình duyệt (hàm capNhatLuoi)',
    kien_thuc: `
      <p>Chia sàn thành ô 5cm × 5cm. Mỗi ô giữ một con số: âm là "tin là trống", dương là "tin là có vật", 0 là chưa biết. Mỗi lần radar đo khoảng cách d ở góc g, trạm vẽ một tia từ chỗ cảm biến theo hướng <code>θ_robot + g</code>. Các ô trên tia (trước khoảng d) bị <b>trừ</b> một chút vì sóng đã đi qua chúng mà không dội lại. Ô ở cuối tia được <b>cộng</b> nhiều hơn vì có vật ở đó.</p>
      <p>Cộng trừ dồn dần chứ không ghi đè: một lần đo sai không xoá được điều mà 10 lần đo trước đã thấy. Cách này gọi là <b>bản đồ lưới chiếm chỗ</b> (occupancy grid), và bản đồ của robot hút bụi, của ROS 2 (21.3) đều là loại này.</p>
      <p>Robot phải <b>đứng yên</b> lúc quét. Đang đi thì mỗi chấm đo ở một vị trí khác nhau, mà odometry lại cập nhật trễ hơn radar, nên bản đồ nhoè. Code dừng robot, chờ 0.3 giây, rồi mới quét −80° → +80°.</p>
      <p>Lệnh: giữ W A S D để lái (như 18.4), <code>QUET</code> để quét, <code>D x y</code> để đi tới điểm (19.5), <code>Z</code> đặt lại gốc bản đồ.</p>`,
    so_do: [{ nhan: 'Một tia trên lưới', svg: ban, chu: 'Mỗi lần đo cập nhật cả dải ô, không chỉ một ô.' }],
    du_doan: `<p>Quét 3–4 chỗ trong một phòng nhỏ: trạm hiện hình phòng, với các cạnh tường dày ~15–25cm (búp sóng + sai số), góc phòng bị bo tròn hoặc thủng.</p>
      <p>Lái một vòng quanh phòng về chỗ cũ rồi quét lại: bức tường lần 2 lệch lần 1 vài cm tới hơn chục cm, và lệch theo một góc. Đó là odometry trôi (19.5), giờ hiện ngay trên bản đồ.</p>`,
    sau: `<h3>Log-odds</h3>
      <p>Số của mỗi ô là log-odds <code>l = ln(p / (1 − p))</code>, với p là xác suất ô có vật. Theo quy tắc Bayes, mỗi lần đo độc lập chỉ cần <b>cộng</b> thêm một lượng vào l (dương nếu đo "có vật", âm nếu "trống"), thay vì nhân xác suất. l = 0 ứng với p = 0.5 (chưa biết). Trạm cộng +1.2 cho ô cuối tia, −0.3 cho ô trên đường, và kẹp l trong ±4 (p từ 0.02 tới 0.98) để một vật dời đi vẫn xoá được khỏi bản đồ sau vài lần đo.</p>
      <h3>Vì sao trừ ít, cộng nhiều</h3>
      <p>Một tia đi qua 10–40 ô trống nhưng chỉ chạm 1 ô có vật. Nếu cộng trừ bằng nhau, vài tia chéo qua một bức tường mảnh sẽ xoá nó đi. Trừ ít giúp tường giữ được, dù vẫn bị các tia đi sượt làm mòn dần.</p>
      <h3>Bản đồ nhoè: bài toán SLAM</h3>
      <p>Bản đồ đúng khi vị trí robot đúng, mà vị trí robot chỉ sửa được khi có bản đồ đúng để so. Làm cả hai cùng lúc là <b>SLAM</b> (Simultaneous Localization And Mapping). Radar siêu âm 5 giây một lượt, 25 điểm mờ 15°, là quá ít để so khớp. LiDAR (21.2) cho 450 điểm sắc nét mỗi 0.1 giây, đủ để slam_toolbox (21.3) làm việc này.</p>`,
    hoi: [
      ['Ô đang ở l = −1.2. Có 2 lần đo thấy vật ở ô đó (+1.2 mỗi lần). l mới bao nhiêu, p bao nhiêu?', 'l = −1.2 + 2.4 = 1.2. p = 1 / (1 + e<sup>−1.2</sup>) ≈ <b>0.77</b>.'],
      ['Vì sao phải dừng robot trước khi quét?', 'Một lượt quét mất vài giây. Đang đi thì mỗi điểm đo ở một vị trí khác, trong khi mỗi chấm được đặt theo vị trí đọc ra lúc đó, vốn trễ và lệch. Bản đồ nhoè thành vệt.'],
      ['Tường vẽ lần 2 lệch lần 1 một góc 8°. Thứ gì trong odometry sai?', 'Hướng θ đã trôi 8° (sai b, bánh trượt, gyro trôi). Sai hướng làm mọi chấm đo sau đó xoay quanh robot, nên cả bức tường xoay theo.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nạp code', cot: 63,
        gioi_thieu: 'Mạch như cuối 20.2. Hình chỉ vẽ phần servo + radar. Encoder và GY-521 phải còn cắm, vì bài này cần vị trí robot.',
        buoc: [
          { ten: 'Robot như cuối 20.2, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút; encoder, GY-521 còn cắm.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 20.3', ['menuconfig → 20.3. <code>idf.py flash</code>, rút USB ngay (servo không nên chạy bằng USB).'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Vẽ bản đồ một phòng', ke_thua: true,
        gioi_thieu: 'Phòng nhỏ hoặc một góc phòng, dọn đồ nhỏ trên sàn. Đặt robot ở giữa, đánh dấu chỗ đặt.',
        buoc: [
          { ten: 'Cắm P+, để yên 2 giây', cap_dien: true, lam: ['Không USB. Cắm P+ vào 44a. Chờ nhật ký "co gyro". Bấm <b>Z</b>, rồi <b>QUET</b>.'], kiem: { thay: 'Servo quét 1 lượt, khung Bản đồ hiện một vùng xanh (trống) hình quạt và các ô xám (tường) ở cuối.', neu_khong: '' } },
          { ten: 'Lái và quét thêm', cap_dien: true, lam: ['Lái chậm (tốc độ 30%) tới chỗ khác, nhả phím, bấm <b>QUET</b>. Lặp 4–6 chỗ, xoay mũi robot về các hướng khác nhau.'], kiem: { thay: 'Bản đồ ghép dần ra hình phòng.', neu_khong: 'Robot không nhận phím sau khi quét xong: bấm vào trang trạm một lần.' } },
          { ten: 'Quay về chỗ cũ', cap_dien: true, lam: ['Lái robot về đúng dấu lúc đầu (bằng mắt), quay mũi đúng hướng cũ, bấm <b>QUET</b>.'], kiem: { thay: 'Tường lần này lệch tường lần đầu, và tam giác robot trên trạm không nằm đúng chỗ bắt đầu: odometry đã trôi.', neu_khong: '' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Sau khi về chỗ cũ', cot: ['Trạm nói robot ở (mm)', 'Lệch hướng (°)'], hang: [{ ten: 'Lần 1', du_doan: ['cách (0,0) 50–300', '2–15'] }] }],
    bay: ['Quét khi robot đang chạy: bản đồ thành vệt.', 'Quên Z khi đặt robot lại chỗ đầu: bản đồ mới vẽ chồng lên bản đồ cũ lệch gốc.', 'Chạy trên thảm: bánh trượt, odometry trôi nhanh gấp mấy lần.', 'Rèm, đệm mềm: sóng không dội về, bản đồ coi là trống.'],
    robot: ['Bài 20.4 cho robot tự đi phủ một vùng. Chương 21 thay radar bằng LiDAR và để ROS 2 tự sửa trôi.'],
  });
})();
