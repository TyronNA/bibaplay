// Bài 17.2 — Xiaozhi điều khiển bánh xe qua MCP. Mạch xiaozhi của 12.5 giữ nguyên trên breadboard của nó;
// breadboard này chỉ có DRV8833 + 2 motor như 17.1 (SLP 4a, IN1–IN4 5a–8a, OUT1–4 9a–12a, VM 13a, GND 14a), motor ăn hộp 3×AAA.
// Chân khớp firmware ares-bread (config.h): motor trái IN1/IN2 = GPIO9/10, motor phải IN3/IN4 = GPIO14/21.
(function () {
  const DRV = { id: 'drv', loai: 'mod', ten: 'DRV8833', mau: 'do', chan: [['SLP', '4a'], ['IN1', '5a'], ['IN2', '6a'], ['IN3', '7a'], ['IN4', '8a'], ['OUT1', '9a'], ['OUT2', '10a'], ['OUT3', '11a'], ['OUT4', '12a'], ['VM', '13a'], ['GND', '14a']] };
  const DD = [K.day('vm', 'T+:13', '13c', 'do', 3), K.day('gd', '14c', 'B-:14', 'den', 3)];
  const MT = { id: 'mt', loai: 'ngoai', kieu: 'motor', x: 560, chan: { 1: '9e', 2: '10e' }, mau: ['cam', 'tim'], nhan: 'motor trái' };
  const MP = { id: 'mp', loai: 'ngoai', kieu: 'motor', x: 640, chan: { 1: '11e', 2: '12e' }, mau: ['cam', 'tim'], nhan: 'motor phải' };
  const ESP = K.esp({ GND: 'B-:3', '3V3': '4c', G9: '5c', G10: '6c', G14: '7c', G21: '8c' }, { x: 30 });
  const sd = SD;
  const luong = sd.svg(380, 210, sd.hop(10, 20, 80, 36, 'bạn nói') + sd.day('90,38 120,38') + sd.hop(120, 20, 110, 36, 'chip: mic') + sd.day('230,38 260,38') + sd.hop(260, 20, 110, 36, 'server riêng')
    + sd.day('315,56 315,80') + sd.hop(260, 80, 110, 36, 'Gemini Live') + sd.day('260,98 200,98 200,140') + sd.chu(206, 124, 'gọi tool chip__self_robot_move', 'sd-mo')
    + sd.hop(120, 140, 160, 36, 'server → chip: tools/call') + sd.day('120,158 70,158 70,188') + sd.chu(76, 204, 'chip bật motor, hẹn giờ tắt', 'sd-chu'),
    'Bạn nói, mic trên chip gửi tiếng lên server, Gemini quyết định gọi tool, server chuyển lời gọi xuống chip, chip chạy motor');

  BAI.dangKy({
    id: '17.2',
    muc_tieu: 'Nói "tiến lên một giây" thì bánh xe quay. Firmware tự build đăng ký một tool trên chip, server riêng báo tool đó cho Gemini, và Gemini gọi tool khi nghe lệnh. Đây là mục tiêu cuối của lộ trình: điều khiển robot xiaozhi bằng giọng nói.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [K.can.esp(), K.can.usb(), K.can.ducCai(8), K.can.bb(), K.can.day(4), K.can.dh(), K.can.pin(), K.can.drv8833(), K.can.motorTT(2),
      { ten: 'Mạch xiaozhi của bài 12.5 (mic, ampli, OLED, nút)', tim: 'INMP441', lk: 'inmp441', sl: 1 }],
    code: 'firmware/boards/ares-bread/ares_bread_board.cc',
    kien_thuc: `
      <p><b>MCP</b> (Model Context Protocol) là cách để mô hình AI biết mình có những công cụ (tool) nào và gọi chúng. Trong xiaozhi, <b>chip là MCP server</b>: chip đăng ký các tool, mỗi tool có tên, mô tả và tham số. <b>Server riêng là MCP client</b>: khi chip kết nối, server gửi <code>initialize</code> rồi <code>tools/list</code> để lấy danh sách tool, sau đó đưa danh sách này cho Gemini như những hàm được phép gọi.</p>
      <p>Khi nghe "tiến lên một giây", Gemini quyết định gọi <code>self.robot.move</code> với <code>huong = tien, thoi_gian_ms = 1000</code>. Server chuyển lời gọi này thành tin <code>tools/call</code> gửi xuống chip, đi chung WebSocket đang truyền tiếng nói.</p>
      <p>Tool trên chip (firmware board riêng), rút gọn:</p>
      <pre class="code">mcp.AddTool("self.robot.move", "Cho robot bánh xe chạy một đoạn ngắn rồi tự dừng…",
    PropertyList({ Property("huong", kPropertyTypeString),
                   Property("toc_do", kPropertyTypeInteger, 50, 0, 70),
                   Property("thoi_gian_ms", kPropertyTypeInteger, 800, 100, 3000) }),
    [this](const PropertyList& p) -> ToolResult {
        …tính a, b theo hướng…
        SetMotors(a, b);                                   // đổi duty PWM 4 chân IN
        esp_timer_start_once(motor_stop_timer_, ms * 1000); // tự tắt, không chờ
        return true;
    });</pre>
      <p>Có 2 giới hạn nằm <b>trong firmware</b>, AI không đổi được: tốc độ tối đa 70% và mỗi lệnh chạy tối đa 3 giây. Nếu mô hình nghe nhầm, robot cũng chỉ đi một đoạn ngắn rồi tự dừng.</p>
      <p>Tool chạy trên luồng chính của xiaozhi, nên không được đứng chờ hết 1 giây, vì chờ như vậy thì tiếng sẽ bị giật. Thay vào đó, tool bật motor rồi hẹn một timer phần cứng để tắt.</p>
      <p>Cách build firmware có tool này và chạy server riêng nằm ở trang <a href="xiaozhi/">Robot AI tự build</a>. Motor dùng đúng các chân như bài 17.1, không trùng chân nào của mic, ampli hay OLED.</p>`,
    so_do: [{ nhan: 'Đường đi của một lệnh', svg: luong, chu: 'Lời gọi tool đi ngược lại đúng con đường mà tiếng nói đi lên: từ Gemini qua server rồi xuống chip.' }],
    du_doan: '<p>Lúc chip kết nối, log server in <code>chip có 3+ tool: [… self.robot.move, self.robot.stop …]</code>, kèm các tool có sẵn của xiaozhi như chỉnh âm lượng.</p><p>Nói "tiến lên một giây": robot trả lời, 2 bánh quay cùng chiều khoảng 1 giây rồi dừng, log server in <code>tool chip chip__self_robot_move {"huong": "tien", …}</code>. Nói "quay trái": 2 bánh quay ngược chiều nhau.</p>',
    sau: `<h3>Một lời gọi tool trên dây</h3>
      <p>Server gửi xuống chip tin sau, bọc trong <code>{"type": "mcp", "payload": …}</code>:</p>
      <pre class="code">{"jsonrpc": "2.0", "method": "tools/call", "id": 7,
 "params": {"name": "self.robot.move", "arguments": {"huong": "tien", "thoi_gian_ms": 1000}}}</pre>
      <p>Chip trả lời: <code>{"jsonrpc": "2.0", "id": 7, "result": {"content": [{"type": "text", "text": "true"}], "isError": false}}</code>. Trường <code>id</code> giúp server biết câu trả lời này thuộc lời gọi nào, vì có thể nhiều lời gọi đang chờ cùng lúc.</p>
      <h3>Vì sao giới hạn phải nằm ở chip</h3>
      <p>Mô hình ngôn ngữ đôi khi hiểu sai, hoặc gọi tool với tham số lạ. Chỗ duy nhất chắc chắn giữ được giới hạn là code chạy ngay cạnh motor: kiểm tham số (0–70%, 100–3000ms), từ chối hướng lạ và tự tắt bằng timer. Server và prompt chỉ là lớp nhắc thêm.</p>
      <h3>Độ trễ</h3>
      <p>Từ lúc bạn ngừng nói tới lúc bánh quay, phần lớn thời gian là Gemini nghe hết câu và quyết định (khoảng 1–3s). Một vòng WebSocket chỉ mất vài chục ms. Như vậy là quá chậm để lái né vật cản, nên việc né vẫn do vòng lặp cảm biến trên chip đảm nhận (bài 17.1). Giọng nói hợp với lệnh tổng quát như "đi tới bàn", "quay lại", "dừng".</p>`,
    hoi: [
      ['Ai là MCP server, ai là MCP client trong bài này?', 'Chip (firmware xiaozhi) là <b>server</b>, vì nó có tool. Server riêng là <b>client</b>: nó hỏi danh sách tool và gọi tool thay cho Gemini.'],
      ['Gemini gọi move với thoi_gian_ms = 10000. Chuyện gì xảy ra?', 'Chip từ chối vì giá trị nằm ngoài khoảng 100–3000 (xiaozhi tự kiểm tham số) và trả về lỗi. Motor không chạy.'],
      ['Vì sao tool không dùng vTaskDelay(1000) rồi tắt motor?', 'Tool chạy trên luồng chính của xiaozhi. Chặn luồng này 1 giây thì tiếng và màn hình đứng hình. Dùng timer phần cứng để tắt motor thì luồng chính được rảnh ngay.'],
    ],
    phan: [{
      ten: 'Phần 1 · Bánh trên không, ra lệnh bằng giọng', cot: 24,
      gioi_thieu: 'Giữ nguyên mạch xiaozhi của bài 12.5 (đã nói chuyện được với server riêng). Breadboard dưới đây chỉ thêm driver và 2 motor. Motor lấy điện từ hộp pin, board lấy điện từ USB.',
      buoc: [
        K.buocPin(),
        { ten: 'Cắm DRV8833, đọc chữ in', kiem_truoc: true, lam: ['Rút USB. Cắm module sao cho các chân SLP, IN1–IN4, OUT1–OUT4, VM, GND nằm ở cột 4–14 như hình. Nếu module của bạn xếp chân khác thứ tự thì nối theo tên in trên module.'], board: { them: [DRV] },
          kiem: { thay: 'Biết chắc cột từng chân.', neu_khong: '' } },
        { ten: 'Nguồn motor, 2 motor', lam: ['Dây đỏ thanh + (cột 13) → <b>13c</b> (VM). Dây đen <b>14c → thanh −</b>.', 'Motor trái vào <b>9e, 10e</b> (OUT1, OUT2), motor phải vào <b>11e, 12e</b> (OUT3, OUT4). Kê khung lên để 2 bánh quay trên không.'], board: { them: [...DD, MT, MP] } },
        { ten: 'Dây từ board', lam: ['<code>3V3</code> → <b>4c</b> (SLP). <code>9</code> → 5c, <code>10</code> → 6c, <code>14</code> → 7c, <code>21</code> → 8c. <code>GND</code> → thanh − dưới (cột 3). Giữ nguyên các dây mic, ampli, OLED của bài 12.5.'], board: { them: [ESP] } },
        K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω ở 2 tiếp điểm hộp pin.', 'Gần 0: VM chạm GND.', ['Đo thêm 4d với thanh + (pin): phải ra số lớn, vì SLP không được nối vào nguồn pin.', 'Đo 3V3–GND của board như bài 12.5: vẫn gần số mốc.']),
        K.camUsb('Cắm USB, nạp firmware có tool bánh xe', ['Build firmware board riêng có tool <code>self.robot.move</code> theo trang Robot AI tự build, rồi nạp lên chip. Server riêng phải đang chạy, và là bản có chuyển tool của chip cho Gemini.', 'Hộp pin vẫn để trống. Đợi OLED báo sẵn sàng rồi xem log server.'], {},
          { thay: 'Log server có dòng "chip có … tool" liệt kê self.robot.move và self.robot.stop.', neu_khong: 'Không có dòng đó: firmware hoặc server đang là bản cũ, chưa có tool. Nếu log in "không lấy được tool của chip" thì chip không trả lời MCP, xem log của chip.' }),
        K.lapPin('Rồi lắp pin (bánh trên không)', ['Nhấn nút nói (hoặc gọi wake word) rồi nói: "Tiến lên một giây". Sau đó thử "quay trái nửa giây", "lùi lại", "dừng lại".'], {},
          { thay: 'Robot trả lời bằng giọng, 2 bánh quay đúng hướng rồi tự dừng, log server in "tool chip chip__self_robot_move …".', neu_khong: 'Robot nói mà bánh không quay: kiểm SLP đã nối 3V3 chưa, và các dây GPIO 9/10/14/21. Quay sai hướng: đảo 2 dây của motor đó. Bánh quay mãi không dừng: tháo pin ngay, vì firmware không tắt được motor, rồi kiểm lại bản vừa nạp.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Lệnh bằng giọng', cot: ['Tool được gọi (log server)', 'Bánh thấy gì'], hang: [
      { ten: '"Tiến lên một giây"', du_doan: ['move tien 1000', '2 bánh cùng chiều ~1s'] }, { ten: '"Quay trái"', du_doan: ['move trai', '2 bánh ngược nhau'] }, { ten: '"Dừng lại"', du_doan: ['stop', 'dừng ngay'] },
    ] }],
    bay: ['Thử lần đầu khi bánh chạm bàn: robot lao xuống đất. Lần đầu luôn để bánh quay trên không.', 'Nới giới hạn trong firmware (tốc độ 100%, 30 giây) cho tiện: chỉ cần nghe nhầm một lần là robot chạy tới khi đâm vào đâu đó.', 'Dùng key Gemini miễn phí cho tool nối vào tài khoản công việc: Google được dùng dữ liệu đó (xem trang Robot AI tự build).'],
    robot: ['Kết hợp với bài 17.1: giọng nói chọn chế độ (đi tuần, về chỗ, dừng), còn vòng lặp cảm biến trên chip vẫn lo né vật trong từng mili giây.', 'Thêm tool đọc cảm biến (khoảng cách siêu âm, pin còn bao nhiêu) để robot trả lời được câu "trước mặt có gì".'],
  });
})();
