// Bài 18.2 — Vòng điều khiển đúng nhịp. Không đổi mạch; chạy bằng USB là đủ (motor không chạy).
(function () {
  const sd = SD;
  const truc = (y, nhan) => sd.day(`40,${y} 370,${y}`) + sd.chu(4, y + 4, nhan, 'sd-chu');
  const moc = y => [0, 1, 2, 3, 4, 5].map(i => sd.day(`${50 + i * 60},${y - 6} ${50 + i * 60},${y + 6}`)).join('');
  const viec = (x, y, w, lop) => `<rect x="${x}" y="${y - 9}" width="${w}" height="18" class="sd-net sd-to"${lop ? ' style="opacity:.5"' : ''}/>`;
  const thoi = sd.svg(380, 190, truc(40, 'A') + moc(40) + viec(50, 40, 36) + viec(140, 40, 36) + viec(230, 40, 36) + viec(320, 40, 36)
    + truc(100, 'B') + moc(100) + viec(50, 100, 36) + viec(110, 100, 36) + viec(170, 100, 36) + viec(230, 100, 36) + viec(290, 100, 36)
    + sd.chu(50, 20, 'mốc 20ms', 'sd-mo') + sd.chu(50, 140, 'A: việc xong mới đếm 20ms → mỗi vòng 30ms', 'sd-mo')
    + sd.chu(50, 160, 'B: đếm từ mốc trước → đúng 20ms dù việc dài 12ms', 'sd-mo'),
    'Dòng thời gian: cách A mỗi vòng dài 30ms vì chờ 20ms sau khi làm xong việc; cách B bắt đầu đúng mỗi mốc 20ms');

  BAI.dangKy({
    id: '18.2',
    muc_tieu: 'PI tốc độ (15.4), odometry (19.3) và mọi vòng điều khiển khác đều giả định chúng chạy đúng nhịp. Bài này đo nhịp thật của một vòng 50Hz theo 3 cách viết, để thấy tận mắt vì sao code robot dùng vTaskDelayUntil và không in chữ trong vòng điều khiển.',
    nguon: 'USB (board) · motor không chạy',
    can: [K.can.robot17(), K.can.usb(), K.can.dh(), K.can.wifi()],
    code: 'sandbox/esp32-bai/main/bai_18_2.c',
    kien_thuc: `
      <p>Vòng điều khiển 50Hz nghĩa là cứ 20ms làm một lần: đọc encoder, tính, ra PWM. Công thức PI và odometry đều nhân với <code>dt</code>. Nhịp lệch mà code vẫn tưởng là 20ms thì mọi phép tính lệch theo.</p>
      <p><code>vTaskDelay(20ms)</code> nghĩa là "ngủ 20ms <b>kể từ bây giờ</b>". Nếu việc mất 12ms thì mỗi vòng dài 12 + 20 = 32ms. FreeRTOS của ESP-IDF mặc định đếm nhịp (tick) 10ms một lần và chỉ đánh thức đúng lúc tick, nên thực tế ra 30ms. <code>vTaskDelayUntil(&amp;moc, 20ms)</code> nghĩa là "ngủ tới <b>mốc kế tiếp</b>": mốc nằm cách mốc trước đúng 20ms, bất kể việc mất bao lâu. Việc dài 12ms thì vòng ngủ 8ms.</p>
      <p><code>printf</code> gửi chữ ra cổng UART ở 115200 baud: mỗi ký tự 10 bit, tức ~11.5 ký tự/ms. Bộ đệm phần cứng chỉ chứa 128 ký tự. In dài hơn thế thì printf phải <b>đứng chờ</b> cho đệm rút bớt, và chờ luôn cả khi không có ai đọc cổng USB.</p>
      <p>Code chạy 3 cách, mỗi cách 500 vòng. Cứ 50 vòng lại gửi nhịp ngắn nhất, dài nhất, trung bình và tổng lệch so với 50 × 20ms lên trạm (bài 18.1). Monitor cũng in các số này, trừ lúc chạy cách C.</p>`,
    so_do: [{ nhan: 'Hai cách ngủ', svg: thoi, chu: 'Ô đậm là 12ms "việc". A ngủ 20ms sau khi làm xong, B ngủ tới mốc.' }],
    du_doan: `<p><b>A</b>: trung bình ≈ 30ms, tổng lệch tăng ~10ms mỗi vòng (≈ 5 giây sau 500 vòng).</p>
      <p><b>B</b>: trung bình 20.0ms, lệch dao động quanh 0.</p>
      <p><b>C</b>: mỗi dòng ~300 ký tự, cần ~26ms để truyền, nên trung bình ≈ 26ms và tổng lệch tăng ~6ms mỗi vòng. Vòng điều khiển bị printf lái chứ không còn do code quyết định.</p>`,
    sau: `<h3>Tick 10ms và làm tròn</h3>
      <p>Với <code>CONFIG_FREERTOS_HZ = 100</code>, <code>pdMS_TO_TICKS(15)</code> ra 1 tick: xin ngủ 15ms thì chỉ được 10ms. Chu kỳ nào không phải bội của 10ms (vd 25ms) đều không có được bằng vTaskDelay. Muốn nhịp mịn hơn thì tăng lên 1000Hz (tốn thêm chút CPU cho ngắt tick), hoặc dùng timer phần cứng (bài 9.8) cho vòng cần chính xác cỡ µs.</p>
      <h3>Tính nhịp của cách C</h3>
      <p>Mỗi vòng in ~300 ký tự. Ở tốc độ 11.52 ký tự/ms, UART cần 300 / 11.52 ≈ 26ms để truyền hết. Đòi truyền 26ms mỗi 20ms là quá sức, nên đệm luôn đầy, và printf chờ cho tới khi UART theo kịp: mỗi vòng dài đúng bằng thời gian truyền. Xem được ra sao thì cứ in, nhưng in ở task riêng, ít và thưa.</p>
      <h3>dt thật trong code robot</h3>
      <p>Vòng 50Hz của robot (từ 19.x) vẫn đo <code>dt</code> thật bằng <code>esp_timer_get_time()</code> mỗi vòng, rồi nhân với dt đó thay vì hằng số 0.02. Nếu có lúc WiFi hay việc khác làm trễ một vòng, phép tính vẫn đúng.</p>`,
    hoi: [
      ['Việc trong vòng mất 5ms, tick 10ms, dùng vTaskDelay(20ms). Nhịp thật bao nhiêu?', 'Thức ở tick, làm 5ms, rồi chờ 2 tick nữa → thức ở tick thứ 2 kể từ lúc bắt đầu = <b>20ms</b>. Việc ngắn hơn 1 tick thì vTaskDelay chưa lộ lỗi. Việc 12ms thì lộ ngay: 30ms.'],
      ['Vì sao 128 ký tự đầu của printf gần như không tốn thời gian?', 'Chúng vào bộ đệm phần cứng (FIFO) của UART. Phần cứng tự truyền dần, CPU làm tiếp. Chỉ khi đệm đầy printf mới phải chờ.'],
      ['Tổng lệch sau 500 vòng của cách A là +5000ms. Robot đang tính odometry với dt = 0.02 cố định thì sai thế nào?', 'Mỗi vòng thật dài 0.03s mà tính 0.02s. Quãng đi thì encoder đếm đúng (không phụ thuộc dt), nhưng tốc độ và mọi phần tích phân (I của PI, góc gyro) lệch 1.5 lần. Vì vậy code robot đo dt thật.'],
    ],
    phan: [{
      ten: 'Phần 1 · Nạp và đo bằng USB', cot: 63,
      gioi_thieu: 'Pack không nối: motor không có điện, chỉ board chạy.',
      buoc: [
        { ten: 'Robot như cuối bài 17.1, P+ rút', kiem_truoc: true, lam: ['Không thêm dây. Rút P+, rút USB.'], board: { them: [...K.robot17(), K.espRobot()] },
          kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
        K.buocOmRobot(),
        K.camUsb('Cắm USB, nạp 18.2', ['<code>idf.py menuconfig</code> → Bai hoc → 18.2 (WiFi đã đặt ở 18.1). Chạy trạm, rồi <code>idf.py flash monitor</code>. Chờ đủ 3 cách (~60 giây).'], {},
          { thay: 'Cách A: dt_tb ≈ 30, lech_ms tăng dần tới ~5000. Cách B: dt_tb ≈ 20.0, lech_ms quanh 0. Cách C: monitor tràn dòng chấm, trạm báo dt_tb ≈ 26.', neu_khong: 'Cách B không ra 20: có task khác chiếm CPU lâu. Chạy lại sau khi nhấn RST, ghi số vào bảng.' }),
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Sau 500 vòng mỗi cách', cot: ['dt trung bình (ms)', 'dt dài nhất (ms)', 'tổng lệch (ms)'], hang: [{ ten: 'A vTaskDelay', du_doan: ['≈ 30', '≈ 30', '≈ +5000'] }, { ten: 'B vTaskDelayUntil', du_doan: ['≈ 20', '≈ 20–21', '≈ 0'] }, { ten: 'C DelayUntil + printf', du_doan: ['≈ 26', '≈ 26–28', '≈ +3000'] }] }],
    bay: ['Nhân với dt cố định 0.02 trong khi vòng thật dài hơn: PI và góc gyro sai theo.', 'In log trong vòng điều khiển "chỉ để xem": nhịp phụ thuộc số ký tự in ra.', 'Xin ngủ 5ms với tick 10ms: pdMS_TO_TICKS ra 0, task không ngủ và chiếm CPU.'],
    robot: ['Vòng điều khiển bánh xe của Phần 4 chạy ở task riêng 50Hz với vTaskDelayUntil, đo dt thật, và không in gì. Số liệu gửi qua UDP ở task khác.'],
  });
})();
