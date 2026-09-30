// Bài 20.2 — Radar siêu âm trên servo. Cầu 5V 16e → 16f + tụ 100µF; servo S → 54h (GPIO15 ở 54i), + → 16g, − → thanh −.
// HC-SR04 rời breadboard lên tay servo, 4 dây đực–cái cắm lại 18a–21a (các dây khác của 17.1 ở cột 18–21 giữ nguyên).
(function () {
  const sd = SD;
  const quat = sd.svg(380, 220, sd.mui
    + sd.hop(160, 170, 60, 36, 'robot') + [-60, -30, 0, 30, 60].map(g => { const a = (90 - g) * Math.PI / 180; return K.mt(190, 170, 190 + 140 * Math.cos(a), 170 - 140 * Math.sin(a)); }).join('')
    + sd.chu(40, 70, '+60° (trái)', 'sd-mo') + sd.chu(290, 70, '−60°', 'sd-mo') + sd.chu(196, 24, '0°', 'sd-mo')
    + sd.day('60,30 330,30') + sd.chu(250, 46, 'tường', 'sd-mo')
    + sd.chu(10, 214, 'mỗi 5° đo 2 lần, lấy số gần hơn', 'sd-mo'),
    'Servo quay cảm biến siêu âm từ trái 60 độ sang phải 60 độ, mỗi 5 độ đo khoảng cách một lần');
  const nen = [...K.robot17(), K.cu(K.espRobot())];
  const [C5, TU] = K.p4.nguon5();

  BAI.dangKy({
    id: '20.2',
    muc_tieu: 'Gắn HC-SR04 lên tay servo SG90 để nó quay qua lại từ −60° tới +60°, đo khoảng cách ở từng góc. Trạm vẽ mỗi lần đo thành một chấm. Robot đứng yên mà "nhìn" được cả một vùng phía trước.',
    nguon: 'USB (đo, nạp) · pack 2S → 5V cho board + servo',
    can: [K.can.robot17(), K.can.sg90(), K.can.tuhoa('100µF'), K.can.ducCai(6), K.can.day(2), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_20_2.c',
    kien_thuc: `
      <p>Servo cần 4.8–6V và có lúc kéo vài trăm mA (15.1). Robot đã có 5V từ LM2596 ở cột 16 nửa trên (a–e), nhưng các lỗ trống đã hết. Một dây ngắn <b>16e → 16f</b> đưa 5V sang nửa dưới cột 16, thêm 4 lỗ f–j. Tụ 100µF ở 16j (chân + ) giữ áp khi servo giật dòng lúc đổi góc.</p>
      <p>HC-SR04 rời breadboard, dán lên tay servo. 4 dây đực–cái cắm lại <b>đúng 4 lỗ cũ 18a–21a</b>, nên mọi dây còn lại của 17.1 (5V ở 18d, Trig ở 19c, cầu Echo ở 20c, GND ở 21e) giữ nguyên.</p>
      <p>Góc 0° = thẳng trước mặt. Góc dương = bên trái robot (cùng chiều với θ của odometry). Code để servo đứng ở 0° lúc bật, để bạn ấn tay quay vào cho HC-SR04 nhìn thẳng. Nhấn công tắc va chạm thì bắt đầu quét.</p>
      <p>Ở mỗi góc, code chờ servo tới nơi rồi đo 2 lần, lấy số gần hơn: tiếng vọng lạc (dội 2 lần) thường làm số đo xa ra chứ ít khi làm gần lại. Mỗi lần đo gửi <code>R goc=… cm=…</code> kèm vị trí robot lúc đo.</p>`,
    so_do: [{ nhan: 'Quạt quét', svg: quat, chu: '25 góc mỗi lượt, mỗi lượt ~5 giây.' }],
    du_doan: `<p>Đặt robot cách tường 50cm, mũi vuông góc với tường: các chấm vẽ thành một đường gần thẳng ở giữa, <b>cong lại ở hai đầu</b>. Ở góc 60°, tường thật cách 50/cos 60° = 100cm, nhưng búp sóng rộng ~15° chạm tường sớm hơn ở mép búp, nên số đo ngắn hơn 100.</p>
      <p>Chân ghế nhỏ ở 1m hiện thành một cung ngắn, rộng bằng cả búp sóng, chứ không phải một chấm.</p>`,
    sau: `<h3>Búp sóng làm "mờ" góc</h3>
      <p>HC-SR04 nghe tiếng vọng trong một hình nón ~15°. Ở góc quét g, nó báo khoảng cách tới vật <b>gần nhất</b> trong nón [g − 7.5°, g + 7.5°]. Một cột mảnh ở góc 20° vẫn bị thấy ở mọi g từ 12.5° tới 27.5°, cùng khoảng cách, nên hiện thành một cung rộng 15°. Độ phân giải góc thật của radar này vì thế là ~15°, dù servo bước 5°.</p>
      <h3>Tường xiên thì không thấy</h3>
      <p>Sóng siêu âm dội như ánh sáng trên gương: gặp tường xiên nhiều hơn ~30–40° thì dội đi chỗ khác, không về cảm biến, và số đo ra "không có tiếng vọng" hoặc xa bất thường. Vì vậy góc phòng hay bị thấy sai: sóng dội 2 lần vào 2 tường rồi mới về.</p>
      <h3>Thời gian một lượt</h3>
      <p>Mỗi góc: chờ servo 80ms + 2 lần đo, mỗi lần ≥ 60ms chờ tiếng vọng cũ tắt + ~6ms đo. Tổng ~210ms × 25 góc ≈ 5 giây một lượt. LiDAR ở chương 21 quét 450 điểm trong 0.1 giây.</p>`,
    hoi: [
      ['Robot cách tường 40cm, mũi vuông góc. Ở góc 45°, tường cách bao xa theo hướng đó?', '40 / cos 45° ≈ <b>57cm</b>. Số đo thực tế ngắn hơn chút vì búp sóng chạm tường sớm ở mép búp.'],
      ['Vì sao lấy số gần hơn trong 2 lần đo?', 'Tiếng vọng lạc (dội qua 2 bề mặt) đi đường dài hơn, nên làm số đo xa ra. Hiếm khi có thứ làm số đo gần lại, trừ khi có vật thật ở gần.'],
      ['Tụ 100µF ở cột 16 để làm gì?', 'Servo đổi góc thì kéo dòng mạnh trong vài ms. Dây từ LM2596 có điện trở, nên áp 5V sụt đúng lúc đó. Tụ sát chỗ cắm servo bù phần dòng này (8.4).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nguồn 5V nửa dưới + servo (P+ rút, USB rút)', cot: 63,
        gioi_thieu: 'Hình chỉ vẽ robot 17.1 và phần thêm của bài này. Encoder, GY-521, TCRT của các bài trước vẫn cắm nguyên.',
        buoc: [
          { ten: 'Robot như trước, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          { ten: 'Cầu 5V sang nửa dưới + tụ', lam: ['Dây đỏ ngắn <b>16e → 16f</b>. Tụ 100µF: chân dài (+) vào <b>16j</b>, chân ngắn (−, phía sọc) vào <b>thanh − dưới cột 17</b>.'], board: { them: [C5, TU] } },
          { ten: 'Đo cầu 5V trước khi cắm servo', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. 16i ↔ thanh − dưới: không dưới 100Ω. <b>16i ↔ thanh + dưới (3V3)</b>: phải rất lớn. 16i ↔ thanh + trên (pin): phải rất lớn.'], board: { them: [K.dh('Ω 200k', '16i', 'B-:16', '> 0.1')] },
            kiem: { thay: 'Đủ 3 số.', neu_khong: '16i nối 3V3 hoặc pin: có dây cắm nhầm hàng j (sát thanh nguồn dưới). 5V vào thanh 3V3 là cháy board.' } },
          { ten: 'Cắm servo', lam: ['Dây đực–cái: cam (tín hiệu) → <b>54h</b>, đỏ → <b>16g</b>, nâu → <b>thanh − dưới cột 15</b>. Chưa nối GPIO15.'], board: { them: K.p4.servo() } },
          { ten: 'Dời HC-SR04 lên tay servo', lam: ['Rút HC-SR04 khỏi 18a–21a. Dán nó lên tay servo (băng keo 2 mặt dày hoặc dây rút), 2 "mắt" nhìn cùng hướng với tay. Chưa ấn tay vào trục servo.', '4 dây đực–cái: VCC → <b>18a</b>, Trig → <b>19a</b>, Echo → <b>20a</b>, GND → <b>21a</b>, đúng như lúc module còn cắm trên board. Đọc chữ in trên HC-SR04.'], board: { bo: ['sr'], them: K.p4.srServo() } },
          { ten: 'Dây GPIO15', lam: ['<code>15</code> → <b>54i</b>.'], board: { bo: ['esp'], them: [K.espRobot(K.p4.servoEsp)] } },
          K.buocOmRobot(['⑤ 16i ↔ thanh − dưới: không dưới 100Ω (lúc này có cả servo).', '⑥ 18b ↔ 21b (VCC ↔ GND của HC-SR04): không gần 0. 4 dây đực–cái không bắt chéo.']),
        ],
      },
      {
        ten: 'Phần 2 · Nạp, lắp tay quay, quét', ke_thua: true,
        buoc: [
          K.camUsb('Cắm USB, nạp 20.2', ['menuconfig → 20.2. <code>idf.py flash</code>. Lúc cắm USB, chân 5V của board nối cột 16, nên servo ăn điện từ cổng USB của máy tính và có thể giật về 0°. Nạp xong rút USB ngay: servo chỉ nên chạy bằng pack.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
          { ten: 'Cắm P+, lắp tay quay ở 0°', cap_dien: true, lam: ['Không USB. Cắm P+ vào 44a. Servo tự quay về 0° và đứng giữ. Ấn tay quay (có HC-SR04) vào trục sao cho cảm biến nhìn <b>thẳng trước mũi robot</b>. Bắt vít giữa tay quay.'],
            kiem: { thay: 'Nhật ký trạm: "servo o 0 do…". Cảm biến nhìn thẳng trước.', neu_khong: 'Servo giật liên tục, board reset: thiếu tụ hoặc tụ cắm ngược. Rút P+ ngay.' } },
          { ten: 'Quét', cap_dien: true, lam: ['Đặt robot cách một bức tường ~50cm, mũi vuông góc với tường. Nhấn công tắc va chạm. Xem trạm, khung Bản đồ.'],
            kiem: { thay: 'Servo quay qua lại. Trạm vẽ các chấm cam thành một đường gần thẳng ở ~50cm trước robot. Khi servo quay sang <b>trái</b> robot, chấm mới xuất hiện ở bên trái.', neu_khong: 'Chấm hiện ở bên ngược với hướng cảm biến: menuconfig → Robot (Phan 4) → Dao chieu servo, nạp lại. Không có chấm: nhìn đồ thị, cm = −1 là không có tiếng vọng, kiểm 4 dây HC-SR04.' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Tường cách 50cm, mũi vuông góc', cot: ['cm đo', 'cm tính (50/cos g)'], hang: [{ ten: 'g = 0°', du_doan: ['≈ 50', '50'] }, { ten: 'g = 30°', du_doan: ['≈ 55', '58'] }, { ten: 'g = 60°', du_doan: ['< 100', '100'] }] }],
    bay: ['Cắm dây 5V hàng j nhầm sang thanh + dưới (3V3): 5V vào chân 3V3 của mọi thứ.', 'Tụ 100µF cắm ngược: nóng, phồng.', 'Lấy 5V servo từ chân 3V3: servo yếu, board reset.', 'Ấn tay quay lúc servo chưa về 0°: radar lệch góc, bản đồ xoay.', '4 dây HC-SR04 bắt chéo khi cắm lại: Trig/Echo đổi chỗ, đo không ra.'],
    robot: ['Bài 20.3 ghép các chấm này với vị trí robot (19.x) thành bản đồ.'],
  });
})();
