// Bài 19.4 — Trộn gyro vào góc. Thêm GY-521 (như 15.3) lên breadboard robot, cột 53–60 nửa trên.
(function () {
  const sd = SD;
  const loc = sd.svg(380, 200, sd.mui
    + sd.hop(10, 20, 100, 36, 'gyro: θ + ω·dt') + K.mt(110, 38, 170, 38) + sd.chu(118, 30, '× a', 'sd-mo')
    + sd.hop(10, 110, 100, 36, 'encoder: θ_enc') + K.mt(110, 128, 170, 128) + sd.chu(118, 120, '× (1 − a)', 'sd-mo')
    + '<circle cx="190" cy="83" r="16" class="sd-net"/>' + sd.chu(190, 88, '+', 'sd-chu', 'middle') + sd.day('170,38 190,38 190,67') + sd.day('170,128 190,128 190,99')
    + K.mt(206, 83, 260, 83) + sd.hop(260, 65, 110, 36, 'θ đã trộn') + sd.day('315,101 315,170 60,170 60,56') + sd.chu(120, 188, 'vòng sau lấy θ này làm gốc', 'sd-mo'),
    'Bộ lọc bù: θ mới = a nhân (θ cũ cộng góc gyro vừa quay) cộng (1 trừ a) nhân góc encoder');
  const nen = [...K.robot17(), ...K.p4.enc().map(K.cu), K.cu(K.espRobot(K.p4.encEsp))];
  const [IMU, IV, IG] = K.p4.imu();

  BAI.dangKy({
    id: '19.4',
    muc_tieu: 'Encoder đo góc quay bằng hiệu quãng 2 bánh, nên sai khi bánh trượt. Gyro đo tốc độ quay thật của thân robot, nhưng để lâu thì trôi. Bài này gắn GY-521 lên robot, đặt 3 góc cạnh nhau trên trạm (chỉ encoder, chỉ gyro, đã trộn) rồi thử từng kiểu làm chúng sai.',
    nguon: 'USB (nạp, kiểm I2C) · pack 2S (chạy)',
    can: [K.can.robot17(), K.can.gy521(), K.can.ducCai(4), K.can.day(2), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_19_4.c',
    kien_thuc: `
      <p><b>Encoder</b> tính góc từ <code>(d_P − d_T)/b</code>. Không trôi khi đứng yên, nhưng bánh trượt (sàn trơn, quay gắt, bị nhấc lên) là sai, và sai giữ nguyên mãi.</p>
      <p><b>Gyro</b> (15.3) đo tốc độ quay ω của thân robot, cộng dồn <code>ω·dt</code> ra góc. Không quan tâm bánh có trượt không. Nhưng mỗi độ/giây sai lệch còn sót (sau khi đã trừ số đo lúc đứng yên) cộng dồn thành vài độ mỗi phút.</p>
      <p><b>Bộ lọc bù</b> trộn cả hai: <code>θ = a·(θ + ω·dt) + (1 − a)·θ_enc</code>. Mỗi vòng, θ đi theo gyro, rồi bị kéo nhẹ về phía góc encoder. Với a = 0.998 ở 50Hz, thời gian kéo về ≈ dt·a/(1 − a) ≈ <b>10 giây</b>: trong vài giây tin gyro (bắt được trượt bánh), về lâu dài bám encoder (gyro không trôi mãi).</p>
      <p>GY-521 cắm vào breadboard robot, cột 53–60, <b>mặt chip ngửa lên</b>, đặt phẳng. Robot phải nằm yên 2 giây lúc bật để code đo sai lệch của gyro. Lệnh <code>A n</code> đổi a ngay trên trạm: <code>A 0</code> chỉ encoder, <code>A 1000</code> chỉ gyro.</p>`,
    so_do: [{ nhan: 'Bộ lọc bù', svg: loc, chu: 'a gần 1: tin gyro trong ngắn hạn. Phần (1 − a) nhỏ kéo dần về encoder.' }],
    du_doan: `<p><b>Nhấc robot, xoay tay bánh trái</b> vài vòng: đồ thị <code>enc</code> chạy (tưởng robot đang quay), <code>gyro</code> đứng yên, <code>tron</code> nhích chậm theo enc.</p>
      <p><b>Xoay cả robot 90° bằng tay</b> (nhấc lên, bánh không lăn): gyro ≈ +90 (quay trái), enc ≈ 0.</p>
      <p><b>Để yên 1 phút</b>: gyro trôi 0.5–3°, enc đứng yên.</p>
      <p><b>Q 4 trên sàn trơn</b> (quay theo gyro): robot thật quay gần đúng 4 vòng, còn enc báo nhiều hơn vì bánh trượt khi quay gắt.</p>`,
    sau: `<h3>Hằng số thời gian của bộ lọc</h3>
      <p>Coi góc encoder đứng yên ở θ_e, gyro đứng yên (ω = 0). Mỗi vòng: <code>θ − θ_e ← a·(θ − θ_e)</code>, tức khoảng cách tới θ_e nhân a mỗi 20ms. Sau n vòng còn aⁿ. Thời gian để còn 1/e ≈ 37%: n = −1/ln a ≈ 1/(1 − a) = 500 vòng = 10 giây. Tổng quát: <code>τ ≈ dt·a/(1 − a)</code>.</p>
      <h3>Gọi là "bù" vì sao</h3>
      <p>Với tín hiệu đổi nhanh (nhanh hơn 1/τ), đường gyro đi qua gần nguyên vẹn còn đường encoder gần như bị chặn. Với tín hiệu đổi chậm thì ngược lại. Hai bộ lọc bù trừ nhau vừa khít: lọc thông cao cho gyro, lọc thông thấp cho encoder, và tổng hai bộ lọc đúng bằng 1. Bộ lọc Kalman làm việc tương tự, nhưng chọn a tự động theo độ tin của từng cảm biến.</p>
      <h3>Gyro trôi bao nhiêu</h3>
      <p>Sai lệch còn sót 0.05°/s cộng dồn 1 phút = 3°. Nhiệt độ chip đổi (vừa bật, đang ấm dần) làm sai lệch đổi theo, nên đo sai lệch ngay lúc bật chưa đủ. Robot để lâu nên đo lại khi đang đứng yên.</p>`,
    hoi: [
      ['a = 0.99 ở 50Hz. Hằng số thời gian bao nhiêu?', 'τ ≈ 0.02 × 0.99 / 0.01 ≈ <b>2 giây</b>.'],
      ['Nhấc robot lên, xoay tay bánh phải 1 vòng tiến. enc đổi bao nhiêu độ (b = 135mm, bánh 204mm/vòng)?', 'dθ = (204 − 0)/135 ≈ 1.51 rad ≈ <b>+87°</b>, trong khi robot không hề quay.'],
      ['Vì sao lệnh Q của bài này quay theo góc gyro chứ không theo encoder?', 'Quay tại chỗ là lúc bánh dễ trượt nhất. Gyro đo góc thân robot thật, nên robot quay đủ góc dù bánh trượt.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Gắn GY-521 (P+ rút, USB rút)', cot: 63,
        buoc: [
          { ten: 'Robot như cuối 19.1', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          { ten: 'Cắm GY-521, đọc chữ in', kiem_truoc: true, lam: ['8 chân vào <b>53a–60a</b>, chip ngửa lên. Đọc chữ in từ cột 53: VCC, GND, SCL, SDA, XDA, XCL, AD0, INT. Module của bạn xếp khác thì nối theo tên in.'], board: { them: [IMU] },
            kiem: { thay: 'Biết chắc cột VCC, GND, SCL, SDA.', neu_khong: '' } },
          { ten: 'Nguồn GY-521', lam: ['Dây đỏ <b>53e → thanh + dưới</b> (3V3). Dây đen <b>54e → thanh − dưới</b>. Không dùng thanh + trên (pin 8.4V).'], board: { them: [IV, IG] } },
          { ten: 'Dây I2C', lam: ['<code>42</code> → <b>55c</b> (SCL), <code>41</code> → <b>56c</b> (SDA). AD0, INT, XDA, XCL để trống.'], board: { bo: ['esp'], them: [K.espRobot({ ...K.p4.encEsp, ...K.p4.imuEsp })] } },
          K.buocOmRobot(['⑤ 53d (VCC GY-521) ↔ thanh − dưới: không dưới 100Ω.']),
        ],
      },
      {
        ten: 'Phần 2 · Nạp, kiểm chiều gyro (USB)', ke_thua: true,
        buoc: [
          K.camUsb('Cắm USB, nạp 19.4', ['Robot nằm yên trên bàn. menuconfig → 19.4, <code>idf.py flash monitor</code>, chạy trạm. Chờ nhật ký "gyro san sang". Nhấc cả robot (không để bánh lăn) và xoay 90° sang trái (ngược chiều kim đồng hồ nhìn từ trên).'], {},
            { thay: 'Đồ thị gyro lên ≈ +90, enc ≈ 0.', neu_khong: '"khong thay GY-521": kiểm 41/42 đúng SDA/SCL, VCC, GND. Gyro ra −90: module đang úp, gắn lại cho chip ngửa lên.' }),
          { ten: 'Xoay tay một bánh', cap_dien: true, lam: ['Robot vẫn nhấc lên. Xoay tay bánh trái vài vòng.'], kiem: { thay: 'enc chạy, gyro đứng yên, tron nhích dần theo enc.', neu_khong: '' } },
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 3 · Trên sàn: quay 4 vòng, để yên', ke_thua: true,
        buoc: [
          K.camPack('Cắm P+, để yên 2 giây', ['Robot trên sàn trơn (gạch men), không chạm vào nó cho tới khi nhật ký in "gyro san sang". Để yên thêm 1 phút, xem gyro trôi.'],
            { thay: 'Sau 1 phút: gyro lệch 0.5–3°, enc đứng yên ở 0.', neu_khong: 'Gyro trôi hơn 10°/phút: robot bị động lúc đo sai lệch. Rút P+, cắm lại, để thật yên.' }),
          { ten: 'Quay 4 vòng theo gyro', cap_dien: true, lam: ['Bấm <b>Z</b>, rồi <b>Q 4</b>. Đếm số vòng thật bằng vạch dưới mũi.'], kiem: { thay: 'Vòng thật ≈ 4 (±1/8). enc báo lớn hơn gyro vài chục độ nếu bánh trượt.', neu_khong: '' } },
          { ten: 'Thử hệ số trộn', cap_dien: true, lam: ['Nhấc robot, xoay tay một bánh 2 vòng, đặt xuống. Làm 3 lần với <b>A 0</b>, <b>A 1000</b>, <b>A 998</b> (bấm Z trước mỗi lần), xem đồ thị tron.'], kiem: { thay: 'A 0: tron = enc (sai theo bánh). A 1000: tron = gyro (không sai). A 998: tron gần gyro lúc đầu rồi trôi dần về enc sau ~10 giây.', neu_khong: '' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Góc (độ)', cot: ['enc', 'gyro', 'tron (a = 998)'], hang: [{ ten: 'Xoay robot 90° trên tay', du_doan: ['≈ 0', '≈ 90', '≈ 90 rồi trôi về 0'] }, { ten: 'Để yên 1 phút', du_doan: ['0', '0.5–3', '≈ 0'] }, { ten: 'Sau Q 4 (sàn trơn)', du_doan: ['> 1440', '≈ 1440', 'giữa hai số'] }] }],
    bay: ['GY-521 úp ngược: gyro ra dấu ngược, bộ lọc cộng 2 góc ngược chiều.', 'Động vào robot trong 2 giây đầu: sai lệch đo sai, gyro trôi nhanh.', 'Gắn GY-521 lỏng, rung theo motor: gyro nhiễu.', 'VCC GY-521 vào thanh pin 8.4V: hỏng module.'],
    robot: ['Robot hút bụi đời đầu (không LiDAR) dùng đúng bộ đôi encoder + gyro này để đi luống thẳng hàng.'],
  });
})();
