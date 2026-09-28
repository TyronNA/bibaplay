// Bài 14.3 — HC-SR04. Module VCC 10a, Trig 11a, Echo 12a, GND 13a (thứ tự in trên board gốc).
// 5V board → 10c (cột riêng, không phải thanh). GND board → thanh −; 13e → thanh − (dây đen).
// Echo hạ áp: 10k 12d → 16d, 20k 16e → 16f, 16j → thanh −. Trig ← GPIO17 (11c). Điểm giữa 16b → GPIO18.
(function () {
  const SR = { id: 'sr', loai: 'mod', ten: 'HC-SR04', mau: 'xanhduong', chan: [['VCC', '10a'], ['Trig', '11a'], ['Echo', '12a'], ['GND', '13a']] };
  const R1 = K.tro('r1', ['12d', '16d'], '10k'), R2 = K.tro('r2', ['16e', '16f'], '20k'), D2 = K.day('d2', '16j', 'B-:16', 'den'), DG = K.day('dg', '13e', 'B-:13', 'den', 3);
  const ESP0 = K.esp({ '5V': '10c', GND: 'B-:3' });
  const ESP1 = K.esp({ '5V': '10c', GND: 'B-:3', G17: '11c', G18: '16b' });
  const sd = SD;
  const soDo = sd.svg(300, 200, sd.hop(20, 40, 80, 70, 'HC-SR04') + sd.chu(106, 58, 'Trig ← GPIO17', 'sd-chu') + sd.day('100,80 150,80') + sd.chu(106, 76, 'Echo (5V)', 'sd-mo')
    + sd.tro(150, 80, 40, '10k') + sd.cham(150, 120) + sd.day('150,120 240,120') + sd.chu(246, 124, 'GPIO18', 'sd-chu') + sd.chu(196, 136, '≈ 3.3V', 'sd-mo') + sd.tro(150, 120, 40, '20k') + sd.day('150,160 150,172') + sd.dat(150, 172),
  'Echo 5V qua cầu 10k/20k xuống ~3.3V vào GPIO18');
  BAI.dangKy({
    id: '14.3',
    muc_tieu: 'Đo khoảng cách bằng tiếng vang: phát 8 xung siêu âm 40kHz, đếm thời gian tới lúc nghe dội về. Nối module 5V vào chip 3.3V bằng cầu phân áp của bài 9.5.',
    can: [...K.coBanEsp(4), K.can.sr04(), K.can.tro('10k'), K.can.tro('20k')],
    kien_thuc: `<p>Theo datasheet Elecfreaks: đưa chân <b>Trig</b> lên mức cao ≥ 10µs → module phát 8 chu kỳ 40kHz → chân <b>Echo</b> lên cao và giữ cao cho tới khi nghe tiếng dội. Độ dài xung Echo = thời gian đi + về. <code>khoảng cách (cm) = µs / 58</code> (âm thanh 340m/s, chia 2 vì đi và về).</p>
      <p>Module chạy <b>5V</b> (15mA) nên Echo ra mức 5V → cầu 10k/20k như bài 9.5: <code>5 × 20/30 = 3.33V</code>. Trig thì ngược lại: GPIO đưa 3.3V vào module. Đa số module nhận 3.3V là mức cao; datasheet chỉ ghi "TTL". Nếu đo mãi ra 0 thì đây là chỗ nghi đầu tiên.</p>
      <p>Mỗi lần đo cách nhau ≥ 60ms, để tiếng vang lần trước tắt hẳn. Đo được 2–400cm, góc ~15°. Vật mềm (rèm, gối) hoặc mặt đặt xiên thì sóng dội đi chỗ khác → đo ra rất xa hoặc hết giờ.</p>
      <p>Dây 5V từ board chỉ cắm <b>cột 10</b> (cột VCC module), không cắm thanh nguồn, để 5V không bao giờ lẫn vào chỗ khác.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Chỉ nối GPIO18 sau khi đo Ω cầu phân áp đúng.' }],
    code: 'sandbox/esp32-bai/main/bai_14_3.c',
    du_doan: '<p>Tường cách 20cm: xung Echo ≈ 20 × 58 = 1160µs, in ≈ 20cm. 50cm → ≈ 2900µs.</p>',
    sau: `<h3>Hằng số 58 đến từ đâu</h3>
      <p>Âm đi rồi về: <code>2d = v·t</code> → <code>d(cm) = t(µs) × v / 2 / 10⁴</code>. Với v = 343m/s (20°C): d = t / 58.3. Tốc độ âm tăng theo nhiệt độ: <code>v ≈ 331.3 + 0.606·T(°C)</code> m/s. Phòng 32°C: v ≈ 350.7 → hằng số 57.0. Dùng 58 cho mọi nhiệt độ thì lệch ~2% — 1m đo thành 98cm. Robot cần chính xác hơn thì đọc nhiệt độ rồi sửa.</p>
      <h3>Vì sao gần quá thì "mù"</h3>
      <p>Sau khi phát 8 chu kỳ 40kHz (200µs), màng loa còn rung thêm một lúc. Tiếng vang về trước khi màng im thì module không phân biệt được: khoảng dưới ~2cm (≈ 120µs) là vùng mù.</p>
      <h3>Góc chùm và vật xiên</h3>
      <p>Góc ~15° nghĩa là ở 1m chùm rộng cỡ ±26cm: module báo khoảng cách tới vật gần nhất trong vùng đó, không nhất thiết là vật thẳng trước mặt. Mặt phẳng nghiêng thì sóng dội đi chỗ khác như gương: đo ra rất xa hoặc hết giờ.</p>`,
    hoi: [
      ['Echo dài 2320µs ở 20°C. Khoảng cách?', '2320/58.3 ≈ <b>39.8cm</b>.'],
      ['Đo mỗi 60ms thì mỗi giây được mấy lần? Robot chạy 0.5m/s đi được bao xa giữa 2 lần đo?', '~<b>16 lần/giây</b>; 0.5 × 0.06 = <b>3cm</b>.'],
      ['Vì sao Echo cần cầu 10k/20k còn Trig thì không?', 'Echo là ngõ ra 5V của module đi vào chip 3.3V (quá áp). Trig là ngõ ra 3.3V của chip đi vào module — module hiểu 3.3V là mức cao.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Module + cầu phân áp, chưa nối GPIO', cot: 24,
        buoc: [
          { ten: 'Cắm HC-SR04, đọc chữ in', kiem_truoc: true, lam: ['USB rút. Cắm 4 chân vào 10a–13a, 2 ống tròn hướng ra ngoài mép board. Đọc chữ in: phải là VCC · Trig · Echo · GND từ cột 10 tới 13.'], board: { them: [SR] },
            kiem: { thay: 'Cột 10 = VCC, 11 = Trig, 12 = Echo, 13 = GND.', neu_khong: 'Thứ tự khác: vẫn cắm vào 10–13 nhưng ghi lại cột nào là chân nào, rồi đổi số lỗ ở mọi bước sau theo tên chân.' } },
          { ten: 'Cầu phân áp cho Echo', lam: ['Đo Ω con 10k và con 20k rời trước khi cắm (bài 1.3), ghi lại: R1 = ?, R2 = ?', '10k (nâu-đen-cam) từ <b>12d → 16d</b>. 20k (đỏ-đen-cam) vắt qua rãnh <b>16e → 16f</b>. Dây đen <b>16j → thanh −</b>. Dây đen <b>13e → thanh −</b> (GND module).'], board: { them: [R1, R2, D2, DG] } },
          { ten: 'Dây 5V và GND từ board', lam: ['<code>5V</code> → <b>10c</b> (cột VCC, không phải thanh +). <code>GND</code> → thanh − dưới (cột 3). Chưa nối Trig/Echo vào GPIO.'], board: { them: [ESP0] } },
          { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. (1) Que đỏ 10b (5V), que đen thanh −. (2) Que đỏ 16b, que đen thanh −. (3) Que đỏ 12b, que đen 16b.'], board: { them: [K.dh('Ω 200k', '16b', 'B-:18', '≤ 20')] },
            kiem: { thay: '(1) không dưới 100Ω. (2) ≤ 20k (20k song song với phía module). (3) ≈ 10k.', neu_khong: '(1) gần 0: 5V chạm GND. (2) gần 0: dây đen 16j sai lỗ. (3) gần 0: 10k chưa cắm, Echo nối thẳng cột 16.' } },
          K.camUsb('Cắm USB, đo 5V, tính áp Echo', ['Chưa nối Trig/Echo vào GPIO. <code>DCV 20</code>: que đỏ 10b (5V), que đen thanh −.', 'Xung Echo lên cao bằng VCC module, ngắn quá đồng hồ không bắt được, nên tính: <code>U_Echo = U_5V × R2 / (R1 + R2)</code> với R1, R2 vừa đo. Phải ≤ 3.45V.'], { them: [K.dh('DCV 20', '10b', 'B-:18', '≈ 5.0')] },
            { thay: 'U_5V 4.8–5.1V → U_Echo tính ra ≈ 3.2–3.4V, không quá 3.45V.', neu_khong: '<b>Trên 3.45V: không nối GPIO18.</b> Rút USB, thay 20k bằng con nhỏ hơn (15k–18k) hoặc thêm 2.2k nối tiếp con 10k, tính lại.' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Nối Trig, Echo, đo', ke_thua: true,
        buoc: [
          { ten: '2 dây tín hiệu', lam: ['USB rút. Chân <code>17</code> → <b>11c</b> (Trig). Chân <code>18</code> → <b>16b</b> (điểm giữa cầu, <b>không phải</b> cột 12).'], board: { bo: ['esp'], them: [ESP1] } },
          { ten: 'Đo lại chỗ dây GPIO18', kiem_truoc: true, lam: ['Núm <code>Ω 200k</code>. Que đỏ 12b (Echo), que đen 16a (dây GPIO18).'], board: { them: [K.dh('Ω 200k', '12b', '16a', '≈ 10.0')] },
            kiem: { thay: '≈ 10k: GPIO18 đang sau điện trở 10k, không nhận thẳng 5V.', neu_khong: 'Gần 0: dây GPIO18 đang ở cột 12. Sửa trước khi cắm USB.' } },
          K.camUsb('Cắm USB, nạp 14.3', ['<code>idf.py menuconfig</code> → 14.3, <code>flash monitor</code>. Đặt board cách tường 20cm (đo bằng thước), rồi 50cm, rồi xoay module xiên 45°.'], {}, { thay: '20cm → in 19–21cm; 50cm → 48–52cm. Xiên 45°: số nhảy lung tung hoặc "het gio".', neu_khong: 'Luôn "het gio": Trig chưa vào 11c, hoặc module không nhận 3.3V ở Trig. Luôn ≈ 0: Echo không về — kiểm cầu phân áp.' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: 'Khoảng cách', cot: ['Thước (cm)', 'Xung (µs)', 'In ra (cm)'], hang: [{ ten: 'Gần', du_doan: ['20', '≈ 1160', '≈ 20'] }, { ten: 'Xa', du_doan: ['50', '≈ 2900', '≈ 50'] }, { ten: 'Xiên 45°', du_doan: ['50', '?', 'sai / hết giờ'] }] }],
    bay: ['Echo nối thẳng GPIO: 5V vào chân 3.3V.', 'Dây 5V cắm thanh + đang có 3V3: 2 nguồn đấu nhau.', 'Đo liên tục không nghỉ: tiếng vang lần trước lẫn vào lần sau → số nhảy.', 'Vật dưới 2cm: module "mù".'],
    robot: ['17.1: HC-SR04 ở mũi robot, dưới 20cm thì dừng và quay. Robot hút bụi thật dùng cảm biến laser (LDS) quay 360° — cùng ý tưởng đo thời gian bay.'],
  });
})();
