// Bài 15.2 — Đếm vòng bánh. DRV8833 (đọc chữ in): SLP 8a, IN1 9a, IN2 10a, OUT1 11a, OUT2 12a, VM 13a, GND 14a.
// Motor TT ăn hộp 3×AAA qua VM. Khe quang: VCC 20a, GND 21a, OUT 22a — cấp 3V3, đo OUT trước rồi mới GPIO11 → 22c.
(function () {
  const DRV = { id: 'drv', loai: 'mod', ten: 'DRV8833', mau: 'do', chan: [['SLP', '8a'], ['IN1', '9a'], ['IN2', '10a'], ['OUT1', '11a'], ['OUT2', '12a'], ['VM', '13a'], ['GND', '14a']] };
  const DD = [K.day('vm', 'T+:13', '13c', 'do', 3), K.day('gd', '14c', 'B-:14', 'den', 3)];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 560, chan: { 1: '11e', 2: '12e' }, mau: ['cam', 'tim'], nhan: 'motor TT + đĩa' };
  const KQ = { id: 'kq', loai: 'mod', ten: 'khe quang', mau: 'xanhduong', chan: [['VCC', '20a'], ['GND', '21a'], ['OUT', '22a']] };
  const SLP = K.day('slp', '20b', '8b', 'do', 4), GK = K.day('gk', '21e', 'B-:21', 'den', 3);
  const ESP0 = K.esp({ GND: 'B-:3', '3V3': '20c', G9: '9c', G10: '10c' }, { x: 180 });
  const ESP1 = K.esp({ GND: 'B-:3', '3V3': '20c', G9: '9c', G10: '10c', G11: '22c' }, { x: 180 });
  BAI.dangKy({
    id: '15.2',
    muc_tieu: 'Biết bánh xe đã quay bao nhiêu vòng. Một đĩa 20 lỗ gắn trên trục motor quay qua khe quang, mỗi lỗ đi qua là một xung. Xung được đếm bằng bộ đếm phần cứng PCNT của ESP32, không tốn CPU.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(6), K.can.pin(), K.can.drv8833(), K.can.motorTT(), K.can.kheQuang()],
    kien_thuc: `<p>Khe quang gồm một LED hồng ngoại và một phototransistor đặt đối diện nhau qua một khe. Khi lỗ của đĩa lọt vào khe, ánh sáng đi qua được và chân OUT đổi mức. Đĩa 20 lỗ cho 20 xung mỗi vòng, nên <code>vòng/phút = xung mỗi giây ÷ 20 × 60</code>.</p>
      <p><b>Module khe quang mỗi shop ghi một kiểu</b>, có loại chỉ chạy 5V và ra 5V (HC-020K). Hãy cấp 3V3 và đo OUT trước. Nếu OUT đổi mức được và ≤ 3.3V thì dùng thẳng. Nếu ở 3V3 mà OUT không đổi mức thì đó là loại 5V: dừng lại, vì cần cấp 5V và thêm cầu 10k/20k cho chân OUT (như bài 9.5), tức là mạch khác với hình trên trang này.</p>
      <p><b>DRV8833</b> (của TI) thay cho module "driver chung" của chương 13. VM chịu 2.7–10.8V nên chạy được với hộp pin 4.5V. IN1=1 IN2=0 là tiến, đưa PWM vào IN1 để chỉnh tốc độ, giống hệt code các bài 13.x. Chân ngủ <b>nSLEEP</b> (trên module in là EEP hoặc SLP) bị chip kéo xuống bên trong, nên <b>phải nối lên 3V3</b>, không thì motor không chạy.</p>
      <p>Motor TT của Adafruit quay 185 vòng/phút ở 4.5V khi không tải, kéo 150mA, và <b>kéo 1.2A khi bị kẹt</b>. Motor của shop khác thì phải đo mới biết. Dòng kẹt vượt xa sức chịu của S8050 (bài 7.4), đó là lý do phải dùng driver.</p>
      <p>PCNT là bộ đếm xung nằm sẵn trong chip, có bộ lọc bỏ các gai ngắn (code đặt 1µs). CPU chỉ việc đọc số đếm mỗi giây.</p>`,
    code: 'sandbox/esp32-bai/main/bai_15_2.c',
    du_doan: '<p>Duty 100% ở 4.5V: ≈ 185 vòng/phút ≈ 62 xung/s (motor Adafruit). Duty 60%: chậm hơn thấy rõ. Lấy tay hãm nhẹ bánh thì số giảm.</p>',
    so_do: [{ nhan: 'Đếm vòng bánh xe', svg: SD.svg(380, 250, SD.khoi(20, 40, 90, 'ESP32-S3', [], ['GPIO9 PWM', 'GPIO10', 'GPIO11', '3V3', 'GND']) + SD.khoi(230, 40, 80, 'DRV8833', ['IN1', 'IN2'], ['OUT1', 'OUT2'])
      + SD.day('122,60 218,60') + SD.day('122,80 218,80') + SD.day('322,60 350,60 350,72') + SD.motor(350, 88) + SD.day('322,80 338,80 338,110 350,110 350,104')
      + SD.khoi(230, 120, 80, 'khe quang', ['OUT', 'VCC', 'GND']) + SD.day('122,100 170,100 170,140 218,140') + SD.day('122,120 160,120 160,160 218,160') + SD.day('122,140 150,140 150,180 218,180')
      + SD.chu(230, 240, 'VM ← hộp pin, SLP → 3V3', 'sd-mo'),
      'GPIO9 và 10 điều khiển DRV8833 chạy motor; khe quang OUT vào GPIO11'), chu: 'Đo OUT khe quang ≤ 3.3V trước khi nối GPIO11.' }],
    sau: `<h3>Từ xung ra quãng đường</h3>
      <p>Đĩa 20 lỗ gắn trên trục bánh cho 20 xung mỗi vòng bánh. Bánh 65mm có chu vi π × 6.5 ≈ 20.4cm, nên mỗi xung ≈ <b>1.02cm</b>. 185 vòng/phút ≈ 3.08 vòng/s, tức 0.63m/s. Robot biết mình đã đi bao xa bằng cách đếm xung (gọi là odometry), nhưng sai số cộng dồn mỗi khi bánh trượt.</p>
      <h3>Đếm trong 1 giây hay đo chu kỳ</h3>
      <p>Đếm xung trong cửa sổ 1s thì sai số là ±1 xung. Ở 62 xung/s, sai số đó là ±1.6%, nhưng ở 5 xung/s là ±20%, và phải chờ cả giây mới có số. Ở tốc độ thấp nên đo <b>thời gian giữa 2 xung</b> (dùng ngắt + timer µs): chỉ cần 1 xung là có số ngay. Bộ điều khiển PID ở bài 15.4 cần số tốc độ mới mỗi 50–100ms, nên phải chọn: hoặc dùng cửa sổ ngắn và chấp nhận sai ±1, hoặc đo chu kỳ.</p>
      <h3>Vì sao cần bộ lọc gai</h3>
      <p>Motor chổi than phát nhiễu điện, tạo ra những gai ngắn vài trăm ns trên dây OUT, và các gai này bị đếm thành xung giả. Xung thật dài hàng ms, nên bộ lọc 1µs của PCNT bỏ được gai mà không mất xung thật nào.</p>`,
    hoi: [
      ['Đếm được 45 xung trong 1 giây. Vòng/phút và tốc độ robot (bánh 65mm)?', '45/20 × 60 = <b>135 vòng/phút</b>. Tốc độ 45 × 1.02cm ≈ <b>0.46m/s</b>.'],
      ['Cửa sổ đếm 100ms ở 62 xung/s. Sai số ±1 xung là bao nhiêu %?', 'Mỗi cửa sổ chỉ có ~6 xung, nên ±1/6 ≈ <b>±16%</b>.'],
      ['Robot đi thẳng 2m, bánh trái đếm 196 xung, bánh phải 200. Nó lệch về bên nào?', 'Bánh trái đi ít hơn, nên robot <b>lệch sang trái</b>.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Khe quang: nguồn, đo OUT, nối GPIO', cot: 30,
        buoc: [
          K.buocPin(),
          { ten: 'Cắm khe quang, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Module khe quang vào 20a, 21a, 22a. Đọc chữ in: cột 20 = ?, 21 = ?, 22 = ? Dây đen <b>21e → thanh −</b>.'], board: { them: [KQ, GK] },
            kiem: { thay: 'Biết chắc cột VCC, GND, OUT.', neu_khong: 'Thứ tự chân khác hình: đổi dây cho khớp chữ in.' } },
          { ten: 'Dây nguồn từ board', lam: ['<code>3V3</code> → <b>20c</b> (VCC khe quang). <code>GND</code> → thanh − dưới (cột 3).'], board: { them: [ESP0] } },
          K.buocOmEsp(),
          K.doOut('Đo OUT khe quang', ['Que đỏ 22d, que đen thanh −. Lấy một mảnh giấy cứng: đút vào khe (chắn sáng), rút ra.'], '22d', 'B-:22', '≈ 3.3 / 0', 'OUT đổi mức giữa ≈ 0V và ≈ 3.3V khi chắn/bỏ chắn, đèn nhỏ trên module đổi theo.'),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · DRV8833 + motor, đếm xung', ke_thua: true,
        buoc: [
          { ten: 'Cắm DRV8833, đọc chữ in', kiem_truoc: true, lam: ['Cắm module sao cho các chân SLP (hoặc EEP/STBY), IN1, IN2, OUT1, OUT2, VM, GND nằm ở cột 8–14 như hình. Module của bạn xếp chân khác thì ghi lại cột nào là chân nào, rồi nối theo tên.'], board: { them: [DRV] },
            kiem: { thay: 'Biết chắc cột SLP, IN1, IN2, OUT1, OUT2, VM, GND.', neu_khong: 'Module không có chân SLP/EEP: có thể module đã kéo lên sẵn. Ghi lại, bỏ qua dây SLP.' } },
          { ten: 'Nguồn motor, SLP, motor', lam: ['Dây đỏ thanh + (cột 13) → <b>13c</b> (VM). Dây đen <b>14c → thanh −</b>. Dây đỏ <b>20b → 8b</b> (SLP lên 3V3). Motor TT: 2 dây vào <b>11e</b>, <b>12e</b>. Gắn đĩa 20 lỗ lên trục thứ hai của motor, chỉnh cho đĩa quay lọt khe mà không cọ.'], board: { them: [...DD, SLP, M] } },
          { ten: 'Dây điều khiển', lam: ['USB rút. <code>9</code> → <b>9c</b> (IN1). <code>10</code> → <b>10c</b> (IN2). <code>11</code> → <b>22c</b> (OUT khe quang).'], board: { bo: ['esp'], them: [ESP1] } },
          K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở 2 tiếp điểm hộp pin.', 'Gần 0: VM chạm GND.', ['Thêm: 11d ↔ 12d ≈ điện trở motor (vài Ω). 8d ↔ thanh + (pin) phải lớn — SLP không được nối vào nguồn pin.']),
          K.camUsb('Cắm USB trước, nạp 15.2', ['<code>idf.py menuconfig</code> → 15.2, <code>flash monitor</code>. Hộp pin để trống. Xoay đĩa bằng tay 1 vòng.'], {}, { thay: 'Xoay tay 1 vòng: tổng xung tăng ≈ 20.', neu_khong: 'Không tăng: dây GPIO11 chưa vào 22c. Tăng gấp đôi (≈ 40): code đang đếm cả 2 cạnh, kiểm lại code.' }),
          K.lapPin('Rồi lắp pin', ['Code chạy motor 60% trong 5s, 100% trong 5s, nghỉ 3s. Ghi xung/s và vòng/phút ở mỗi mức. Lần 100% thứ hai: lấy ngón tay hãm nhẹ bánh.'], {}, { thay: '100%: vài chục xung/s (motor Adafruit ≈ 62). 60%: ít hơn thấy rõ. Hãm tay: số giảm.', neu_khong: 'Motor không quay: SLP chưa nối lên 3V3. DRV8833 nóng: tháo pin, có thể motor đang kẹt. Chip vỏ TSSOP rất nhỏ nên nóng nhanh.' }),
          { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
        ],
      },
    ],
    bang_do: [{ ten: 'Tốc độ', cot: ['Xung/s', 'Vòng/phút'], hang: [{ ten: 'Duty 60%', du_doan: ['< 62', '< 185'] }, { ten: 'Duty 100%', du_doan: ['≈ 62', '≈ 185'] }, { ten: '100% + hãm tay', du_doan: ['giảm', 'giảm'] }] }],
    bay: ['Quên nối SLP lên 3V3: DRV8833 ngủ, motor không chạy.', 'Nối SLP vào thanh + (pin): với hộp 4.5V ở mạch này thì chưa sao, vì chân này chịu tới 5.75V. Nhưng với pack 2S 8.4V thì hỏng chip.', 'Đĩa cọ khe: đếm sai và kẹt motor.', 'Nối thẳng module khe quang loại 5V vào GPIO: 5V đi vào chân chỉ chịu 3.3V.'],
    robot: ['Mỗi bánh một encoder: so xung 2 bên để đi thẳng (bánh nào nhanh hơn thì giảm duty bên đó), và tính quãng đường = số vòng × chu vi bánh.'],
  });
})();
