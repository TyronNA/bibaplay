// Bài 22.4 — Cho chip thật vào server: MAC vào ARES_DEVICES, bấm nút nói câu đầu tiên.
// Nút: BOOT (GPIO0) bấm = bật/tắt hội thoại; nút TOUCH (GPIO47) giữ = nói, thả = thôi (ares_bread_board.cc).
// Log server lấy từ server/app.py (allowed/refuse, ota, websocket, GeminiSession). Chưa chạy với chip thật khi soạn bài.
(function () {
  const T = K.term;
  BAI.dangKy({
    id: '22.4',
    muc_tieu: 'Cho server nhận chip thật: lấy MAC của chip, thêm vào danh sách được phép, rồi bấm nút và nói câu đầu tiên với robot. Xong bài này là xong mục tiêu đầu tiên của lộ trình. Bài soạn theo code, <b>chưa chạy với chip thật</b>.',
    can: [K.can.esp(), K.can.usb(), { ten: 'Mạch xiaozhi đã nạp firmware ở bài 22.3', tim: 'INMP441', lk: 'inmp441', sl: 1 }, K.can.wifi()],
    kien_thuc: `
      <p>Lúc khởi động, firmware gọi <code>/xiaozhi/ota/</code> và gửi kèm <code>Device-Id</code>, chính là MAC Wi-Fi của chip. Server so MAC đó với <code>ARES_DEVICES</code>:</p>
      <ul><li><b>Có trong danh sách</b>: trả địa chỉ WebSocket + token, chip nối vào và sẵn sàng nghe.</li>
      <li><b>Không có</b>: trả <code>403</code> và in MAC ra log. Chip báo kiểm tra phiên bản thất bại, rồi tự thử lại sau ít giây.</li></ul>
      <p>Vì sao phải có danh sách này: token thì ai gọi OTA cũng lấy được (firmware cần vậy để tự kết nối), nên token không chặn được người lạ. MAC là lớp chặn duy nhất, mà MAC thì giả được. Vì vậy server chỉ nên chạy trong mạng nhà.</p>
      <p><b>Nút trên mạch 12.5</b>: <code>BOOT</code> bấm một lần để bắt đầu nói chuyện, bấm lần nữa để thôi. Nút <code>TOUCH</code> (GPIO47) giữ trong lúc nói, thả ra khi nói xong. Hai nút <code>VOL+</code>/<code>VOL−</code> (GPIO40/39) chỉnh âm lượng.</p>
      ${K.nhoAI(`Server xiaozhi của tôi đang chạy (server/app.py), chip đã nạp firmware ares-bread nhưng
bị từ chối. Đây là log server: [dán vào]. Chỉ tôi thêm đúng MAC vào ARES_DEVICES trong
~/.config/ares/gemini.env (đừng in key ra), rồi chạy lại server.`)}`,
    du_doan: '<p>Trước khi thêm MAC: log server có <code>từ chối Device-Id=…</code> đúng với MAC đã ghi ở bài 22.3. Sau khi thêm: <code>OTA check</code> → <code>connect … mode=GeminiSession</code> → <code>chip có … tool</code> (có <code>self.robot.move</code>). Bấm <code>BOOT</code>, nói "xin chào": OLED chuyển sang đang nghe, rồi đang nói, mặt robot đổi nét, loa trả lời.</p>',
    phan: [
      {
        ten: 'Phần 1 · Cho phép chip',
        gioi_thieu: 'Server chạy trên laptop như bài 22.2 (hoặc trên máy 24/7 nếu đã làm bài 22.5 trước). Board cắm USB, đã vào Wi-Fi nhà ở bài 22.3.',
        buoc: [
          { ten: 'Xem server từ chối chip', lam: ['Chạy server như bài 22.2. Rút USB của board rồi cắm lại để chip khởi động lại và gọi server.'],
            hinh: T(['$ set -a; . ~/.config/ares/gemini.env; set +a', '$ .venv/bin/python app.py', '… chế độ: Gemini Live (…)', '… chip được phép: chưa có (ARES_DEVICES) — chỉ nhận kết nối từ máy này', '… từ chối Device-Id=aa:bb:cc:dd:ee:ff từ 192.168.x.z — là chip của bạn thì thêm vào ARES_DEVICES']),
            kiem: { thay: 'Dòng <code>từ chối Device-Id=…</code> có MAC trùng với MAC đã ghi lúc nạp ở bài 22.3.', neu_khong: 'Không có dòng nào khi chip khởi động: chip chưa tới được server. Sang bài 22.6, phần "server không thấy gì".' } },
          { ten: 'Thêm MAC vào danh sách', lam: ['Mở <code>~/.config/ares/gemini.env</code>, điền MAC vào dòng <code>ARES_DEVICES=</code>. Nhiều chip thì cách nhau dấu phẩy. Chữ hoa hay chữ thường đều được.', 'Dừng server (<kbd>Ctrl</kbd>+<kbd>C</kbd>), chạy lại đúng 2 lệnh của bước trước.'],
            hinh: T(['(~/.config/ares/gemini.env)', 'GEMINI_API_KEY=…', 'ARES_DEVICES=aa:bb:cc:dd:ee:ff', '', '$ .venv/bin/python app.py', '… chip được phép: aa:bb:cc:dd:ee:ff']),
            kiem: { thay: '<code>chip được phép: …</code> có MAC của chip.', neu_khong: 'Vẫn ra <code>chưa có</code>: chưa chạy lại dòng <code>set -a …</code> sau khi sửa file.' } },
          { ten: 'Chip nối vào', lam: ['Chờ chip tự thử lại (OLED đếm giây), hoặc rút USB cắm lại cho nhanh.'],
            hinh: T(['… OTA check device=aa:bb:cc:dd:ee:ff client=… board=…', '… [3f9c…] connect device=aa:bb:cc:dd:ee:ff protocol=… mode=GeminiSession', "… [3f9c…] chip có … tool: [… 'self.robot.move', 'self.robot.stop' …]"]),
            kiem: { thay: 'Đủ 3 dòng: <code>OTA check</code>, <code>connect … GeminiSession</code>, <code>chip có … tool</code>. OLED hiện trạng thái <i>Chờ</i> và mặt robot.', neu_khong: 'Có <code>OTA check</code> mà không có <code>connect</code>: chip lấy được địa chỉ nhưng không mở được WebSocket. Đọc log chip (<code>idf.py -p … monitor</code>) và xem bài 22.6.' } },
        ],
      },
      {
        ten: 'Phần 2 · Câu đầu tiên',
        buoc: [
          { ten: 'Bấm BOOT, nói "xin chào"', lam: ['Bấm nút <code>BOOT</code> một lần. OLED hiện <i>Đang lắng nghe...</i>. Nói "xin chào, bạn tên gì?", rồi im để robot biết bạn đã nói xong.', 'Hoặc giữ nút <code>TOUCH</code> trong lúc nói, nói xong thì thả.'],
            hinh: T(['… [3f9c…] listen start mode=…', '… [3f9c…] Gemini Live sẵn sàng (…, giọng Kore, 0 tool MCP, … tool chip)', '… [3f9c…] set_emotion happy']),
            kiem: { thay: 'OLED chuyển <i>Đang nói...</i>, mặt robot đổi nét, loa trả lời bằng tiếng Việt. Log có <code>Gemini Live sẵn sàng</code>.', neu_khong: 'OLED báo lỗi <i>Không nối được Gemini</i>: log server có dòng <code>Gemini setup thất bại</code>, kiểm key như bài 22.2. Robot trả lời mà loa im: soát ampli theo bài 12.3. Robot không nghe thấy gì: soát mic theo bài 12.2.' } },
          { ten: 'Nói thêm vài câu, chỉnh âm lượng', lam: ['Hỏi vài câu khác. Thử ngắt lời robot đang nói. Chỉnh <code>VOL+</code>/<code>VOL−</code> vừa nghe: loa nhỏ kêu to quá thì rè.', 'Ghi độ trễ ước lượng (đếm nhẩm từ lúc bạn dứt câu tới lúc nghe tiếng) vào bảng.'],
            kiem: { thay: 'Nói chuyện qua lại được nhiều lượt.', neu_khong: '' } },
          { ten: 'Rút USB', lam: ['Rút cáp USB trước khi đụng vào dây trên breadboard. Để board chạy luôn cũng được nếu sang ngay bài 22.5.'] },
        ],
      },
    ],
    bang_do: [{ ten: 'Nói chuyện', cot: ['Robot trả lời đúng ý?', 'Độ trễ ước lượng (s)'], hang: [{ ten: '"Xin chào, bạn tên gì?"', du_doan: ['có', '2–3'] }, { ten: 'Câu hỏi tự chọn', du_doan: ['', '2–3'] }] }],
    hoi: [
      ['Chip có trong <code>ARES_DEVICES</code> rồi. Người khác trong nhà cầm điện thoại gọi <code>/xiaozhi/ota/</code> có lấy được token không?', 'Không, nếu họ không biết MAC của chip: server từ chối như bài 22.1. Nhưng ai biết MAC thì giả được. Vì vậy chỉ chạy trong mạng nhà, không mở ra Internet.'],
      ['Log có <code>OTA check</code> mà không có <code>connect</code>. Chip đã tới server chưa?', 'Tới rồi: OTA là HTTP tới chính server đó. Lỗi nằm ở bước mở WebSocket. Đọc log của chip để biết nó báo gì.'],
      ['Vì sao server cần hỏi chip "có những tool nào"?', 'Để báo cho Gemini biết robot làm được gì (bài 17.2). Firmware mới thêm tool thì server tự biết, không phải sửa server.'],
    ],
    bay: ['Chép nhầm MAC của chip giả (<code>aa:bb:cc:dd:ee:ff</code>) vào danh sách: chip thật vẫn bị từ chối. Chép từ dòng <code>từ chối Device-Id=…</code> của chính chip.', 'Sửa <code>gemini.env</code> mà không chạy lại <code>set -a …</code> và server: server vẫn dùng danh sách cũ.', 'Để volume tối đa với loa nhỏ: rè, và ampli nóng. Vặn nhỏ lại, sờ thấy ampli nóng thì rút USB.'],
    robot: ['Robot đã nói chuyện được. Bài 22.5 cho server chạy 24/7 để robot không phụ thuộc laptop. Bài 17.2 nối thêm bánh xe.'],
  });
})();
