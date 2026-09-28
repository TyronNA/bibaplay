// Bài 9.8 — Ngắt. Nút như 9.4 (cột 10/12, 12j → −, GPIO12 → 10c, pull-up nội) + LED như 9.1 dời sang cột 16:
// GPIO13 → 16a, 330Ω 16e → 16f, LED chân dài 16i, chân ngắn 17i, 17j → −.
(function () {
  const ESP = K.esp({ GND: 'B-:3', G12: '10c', G13: '16a' });
  const NUT = { id: 'nut', loai: 'nut', o: '10e', nhan: 'nút' }, DG = K.day('dG', '12j', 'B-:12', 'den');
  const R = K.tro('r', ['16e', '16f'], '330'), L = K.led('led', '16i', '17i'), DK = K.day('dK', '17j', 'B-:17', 'den');
  const sd = SD;
  const dong = sd.svg(360, 180, sd.day('20,40 330,40') + sd.chu(20, 30, 'vòng lặp chính: việc A · việc B · việc C …', 'sd-mo')
    + sd.day('120,40 120,100').replace('sd-net', 'sd-nong') + sd.chu(126, 70, 'cạnh xuống ở GPIO12', 'sd-xau')
    + sd.hop(90, 100, 110, 34, 'hàm ngắt ~µs') + sd.day('200,117 250,117') + sd.hop(250, 100, 90, 34, 'hàng đợi') + sd.day('295,134 295,160 60,160 60,40') + sd.chu(70, 176, 'task đợi hàng đợi → đảo LED', 'sd-mo'),
    'Cạnh xuống ở chân nút cắt ngang vòng lặp chính để chạy hàm ngắt, hàm ngắt gửi thời điểm vào hàng đợi cho task xử lý');

  BAI.dangKy({
    id: '9.8',
    muc_tieu: 'Ngắt: phần cứng tự gọi một hàm ngắn ngay khi có sự kiện (cạnh xuống ở chân nút, timer đến giờ), thay vì code phải liên tục hỏi. So tận mắt: hỏi vòng thì trễ và sót, ngắt thì tức thì.',
    can: [...K.coBanEsp(3), K.can.nut(), K.can.tro('330'), K.can.led()],
    code: 'sandbox/esp32-bai/main/bai_9_8.c',
    kien_thuc: `
      <p><b>Hỏi vòng</b> (polling): vòng lặp đọc chân nút mỗi 250ms. Nhấn và nhả trong 100ms giữa 2 lần đọc là mất hẳn; nhấn đúng lúc vừa đọc xong thì phải chờ tới 250ms mới thấy.</p>
      <p><b>Ngắt</b> (interrupt): cấu hình chân báo ngắt ở cạnh xuống. Khi cạnh tới, CPU tạm dừng việc đang làm, chạy <b>hàm ngắt</b> (ISR), xong quay lại. Hàm ngắt phải cực ngắn: không <code>printf</code>, không chờ. Ở đây nó chỉ ghi thời điểm vào hàng đợi FreeRTOS; một task chờ hàng đợi làm phần còn lại (đảo LED, in log).</p>
      <p>Chống dội trong hàm ngắt bằng thời gian: cạnh nào cách cạnh trước dưới 30ms thì bỏ (nảy tiếp điểm, bài 9.4).</p>
      <p>Code còn chạy một <b>timer phần cứng</b> 1kHz: mỗi 1ms gọi một hàm ngắt chỉ để đếm. Mỗi giây in số nhịp: phải ≈ 1000, dù vòng lặp chính đang ngủ hay đang bận.</p>`,
    so_do: [{ nhan: 'Nút + LED', svg: sd.svg(320, 200, sd.khoi(20, 40, 90, 'ESP32-S3', [], ['GPIO12', 'GPIO13', 'GND']) + sd.chu(20, 140, 'pull-up nội ở GPIO12', 'sd-mo')
      + sd.day('122,60 280,60 280,70') + sd.nut(280, 70, 50, 'nút') + sd.day('280,120 280,176')
      + sd.day('122,80 200,80 200,84') + sd.tro(200, 84, 30, '330Ω') + sd.day('200,114 200,118') + sd.led(200, 118) + sd.day('200,158 200,176')
      + sd.day('122,100 135,100 135,176 280,176') + sd.cham(200, 176),
      'Nút từ GPIO12 xuống GND; GPIO13 qua 330 ôm vào LED'), chu: 'Nút kéo GPIO12 xuống 0 (pull-up nội giữ ở 1 khi nhả).' },
      { nhan: 'Đường đi của một lần nhấn', svg: dong, chu: 'Hàm ngắt chen ngang ngay lập tức; việc tốn thời gian để task làm.' }],
    du_doan: `<p><b>Hỏi vòng</b>: bấm thật nhanh 10 lần trong 2 giây → đếm được ít hơn 10; LED đổi trễ rõ (tới ¼ giây). <b>Ngắt</b>: đếm đủ (trừ khi bấm nhanh hơn 30ms/lần), LED đổi gần như ngay, in <code>tu ngat toi task</code> cỡ vài chục µs. Timer: <code>1000 nhip/s</code> (±1) ở cả 2 chế độ.</p>`,
    sau: `<h3>Độ trễ ngắt → task</h3>
      <p>Từ lúc hàm ngắt gửi vào hàng đợi tới lúc task chạy: nếu task đó ưu tiên cao hơn task đang chạy, <code>portYIELD_FROM_ISR</code> chuyển thẳng sang nó ngay khi thoát ngắt — cỡ vài µs tới vài chục µs (in ra là thấy). Nếu không, phải đợi tới nhịp tick kế tiếp (1–10ms). Đó là lý do có cờ "có task cao hơn vừa được đánh thức" trong code.</p>
      <h3>Biến chia sẻ với hàm ngắt</h3>
      <p>Biến đếm nhịp khai báo <code>volatile</code>: bảo trình biên dịch mỗi lần đọc phải đọc lại từ RAM, vì nó có thể đổi bất cứ lúc nào bởi ngắt. Thiếu <code>volatile</code>, vòng lặp có thể giữ bản sao cũ trong thanh ghi và không bao giờ thấy số mới. Hàm ngắt đặt trong IRAM (<code>IRAM_ATTR</code>) để chạy được cả lúc flash đang bận ghi.</p>
      <h3>Hỏi vòng nhanh hơn thì sao</h3>
      <p>Đọc mỗi 1ms thì hết sót nút, nhưng CPU thức dậy 1000 lần/giây chỉ để nhìn một chân — tốn điện và tốn thời gian của việc khác. Với 20 cảm biến cần phản ứng nhanh, ngắt gọn hơn nhiều. Cảm biến đổi chậm (nhiệt độ, pin) thì hỏi vòng mỗi giây là hợp lý.</p>`,
    hoi: [
      ['Hỏi vòng mỗi 250ms. Nhấn giữ 100ms rồi nhả. Xác suất bị sót?', 'Sót nếu cả 100ms nằm gọn giữa 2 lần đọc: ≈ (250 − 100)/250 = <b>60%</b>.'],
      ['Vì sao không printf trong hàm ngắt?', 'printf chậm (hàng trăm µs–ms), dùng khoá và bộ đệm: chặn các ngắt khác, có thể treo hoặc crash. Hàm ngắt chỉ ghi dữ liệu rồi thoát.'],
      ['Biến đếm cập nhật trong ngắt mà thiếu volatile. Hậu quả?', 'Vòng lặp có thể đọc mãi một giá trị cũ (trình biên dịch tối ưu), số in ra đứng yên.'],
    ],
    phan: [{
      ten: 'Phần 1 · Hỏi vòng rồi ngắt', cot: 24,
      buoc: [
        { ten: 'Nút và LED', lam: ['USB rút. Nút vắt qua rãnh ở cột 10/12 (hướng đã kiểm ở 6.1), dây đen <b>12j → thanh −</b>.', '330Ω vắt qua rãnh <b>16e → 16f</b>. LED: <b>chân dài 16i</b>, chân ngắn 17i. Dây đen <b>17j → thanh −</b>.'], board: { them: [NUT, DG, R, L, DK] } },
        { ten: 'Dây từ board', lam: ['<code>12</code> → <b>10c</b>. <code>13</code> → <b>16a</b>. <code>GND</code> → thanh − dưới (cột 3). Không nối 3V3: nút dùng pull-up nội.'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Cáp USB chưa cắm. <code>Ω 200k</code>: que đỏ 16c (dây GPIO13), que đen thanh −. Rồi que đỏ 10d (GPIO12), cả lúc nhấn nút.'], board: { them: [K.dh('Ω 200k', '16c', 'B-:20', '> 0.33')] },
          kiem: { thay: 'GPIO13: không dưới 0.33k (330Ω + LED). GPIO12: lớn khi nhả, gần 0 khi nhấn — đúng, vì nút nối GPIO12 xuống GND.', neu_khong: 'GPIO13 gần 0: dây LED về − đi tắt qua 330Ω. <b>Không cắm USB</b>.' } },
        K.camUsb('Cắm USB, nạp 9.8', ['<code>idf.py menuconfig</code> → 9.8, <code>flash monitor</code>.', 'Chế độ <b>HOI VONG</b> (10s): bấm thật nhanh 10 lần, đếm số lần LED đổi.', 'Chế độ <b>NGAT</b> (10s kế): bấm lại 10 lần như vậy, đọc độ trễ in ra.'], { sua: { led: { sang: true } } },
          { thay: 'Hỏi vòng: đếm thiếu, LED đổi trễ. Ngắt: đủ 10, độ trễ vài chục µs. Timer ≈ 1000 nhịp/s.', neu_khong: 'Không đếm gì: dây GPIO12 ở sai cột. Ngắt đếm dư: nút nảy lâu hơn 30ms — hiếm, thử nút khác.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: '10 lần bấm nhanh', cot: ['Đếm được', 'Trễ LED'], hang: [{ ten: 'Hỏi vòng 250ms', du_doan: ['< 10', 'tới ¼ giây'] }, { ten: 'Ngắt', du_doan: ['10', 'vài chục µs'] }, { ten: 'Timer 1kHz', du_doan: ['≈ 1000 nhịp/s', ''] }] }],
    bay: ['Làm việc nặng (printf, delay, I2C) trong hàm ngắt: treo hoặc watchdog reset.', 'Quên chống dội trong ngắt: 1 lần nhấn thành nhiều lần (bài 9.4).', 'Biến chung giữa ngắt và code thường thiếu volatile.'],
    robot: ['Cản va chạm (14.1) nên dùng ngắt: robot phải dừng ngay khi đâm, không đợi vòng lặp tới lượt.', 'Encoder bánh xe (15.2) dùng bộ đếm phần cứng PCNT — còn tốt hơn ngắt: không tốn CPU cho từng xung.'],
  });
})();
