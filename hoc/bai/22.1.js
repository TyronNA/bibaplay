// Bài 22.1 — Server riêng trên laptop, chế độ echo, máy tính giả làm chip (server/fake_device.py). Không cần board.
// Log trong hình chép từ lần chạy thật 2026-10-02 (server/app.py + fake_device.py), IP thay bằng 192.168.x.y.
(function () {
  const T = K.term, sd = SD;
  const luong = sd.svg(520, 190, sd.hop(10, 20, 120, 135, 'chip giả') + sd.chu(70, 174, 'fake_device.py', 'sd-mo', 'middle')
    + sd.hop(390, 20, 120, 135, 'server') + sd.chu(450, 174, 'app.py · cổng 8000', 'sd-mo', 'middle')
    + sd.day('130,36 390,36') + sd.chu(260, 30, '① POST /xiaozhi/ota/', 'sd-mo', 'middle')
    + sd.day('390,56 130,56') + sd.chu(260, 72, '② địa chỉ WebSocket + token', 'sd-mo', 'middle')
    + sd.day('130,120 390,120') + sd.chu(260, 114, '③ WebSocket: tiếng nói (Opus)', 'sd-mo', 'middle')
    + sd.day('390,140 130,140') + sd.chu(260, 156, '④ echo: phát lại đúng câu đó', 'sd-mo', 'middle'),
    'Chip giả hỏi server địa chỉ WebSocket, mở WebSocket, gửi tiếng nói, server phát lại đúng câu đó');

  BAI.dangKy({
    id: '22.1',
    muc_tieu: 'Chạy server riêng trên laptop ở chế độ <b>echo</b> (nghe hết câu rồi phát lại), và cho máy tính giả làm chip để kiểm cả đường truyền. Chưa cần board, chưa cần key Gemini. Xong bài này là có IP mà firmware ở bài 22.3 cần.',
    nguon: 'Không cần board',
    can: [K.can.wifi(), { ten: 'Điện thoại cùng mạng Wi-Fi (để thử từ máy khác)', tim: 'điện thoại', sl: 1 }],
    kien_thuc: `
      <p>Firmware xiaozhi khi khởi động làm 2 việc với server:</p>
      <ol><li><b>Hỏi đường</b>: gọi <code>POST /xiaozhi/ota/</code>. Server trả về địa chỉ WebSocket và một token. Địa chỉ OTA này được ghi cứng trong firmware.</li>
      <li><b>Nói chuyện</b>: mở WebSocket (một kết nối giữ mở liên tục, gửi được cả 2 chiều), gửi tiếng nói thành từng khung 60ms đã nén Opus, nhận lại tiếng trả lời.</li></ol>
      <p>Chưa có key Gemini thì server ở chế độ echo: không có AI, chỉ phát lại câu vừa nói. Đủ để chắc mạng, cổng và giao thức đều chạy, trước khi đụng tới Google.</p>
      <p><b>IP LAN</b> là địa chỉ của laptop trong mạng nhà (dạng <code>192.168.x.y</code>), do router cấp. Chip phải gọi tới địa chỉ này. <code>127.0.0.1</code> chỉ có nghĩa là "chính máy này", nên chip không dùng được.</p>
      <p>Server không cho chip lạ vào: chỉ nhận chip có MAC nằm trong <code>ARES_DEVICES</code> (bài 22.4), hoặc kết nối từ chính laptop. Vì vậy chip giả chạy trên laptop thì vào được ngay.</p>
      ${K.nhoAI(`Đọc server/README.md và server/app.py. Giúp tôi cài và chạy server ở chế độ echo
trên máy này (máy tôi là [macOS / Ubuntu]), rồi chạy fake_device.py ở terminal khác,
phải ra PASS. Hỏi tôi trước mỗi lệnh sudo. Cuối cùng cho tôi biết IP LAN trong dòng OTA URL.`)}`,
    so_do: [{ nhan: 'Đường đi trong bài này', svg: luong, chu: 'Chip thật ở bài 22.4 đi đúng 4 bước này. Khác là nó ở máy khác, nên phải gọi bằng IP LAN.' }],
    du_doan: '<p>Server in 3 dòng: OTA URL có IP LAN của laptop, <code>chế độ: ECHO</code>, và chưa có chip nào được phép. Chip giả nói 1.2 giây tiếng "bíp", nhận lại khoảng 1.2–1.4 giây (server cắt theo khung 60ms nên dư một chút), rồi in <code>PASS</code>.</p>',
    phan: [
      {
        ten: 'Phần 1 · Cài và chạy server',
        gioi_thieu: 'Mở terminal <b>mới</b>, không phải terminal đã chạy <code>export.sh</code> của ESP-IDF: môi trường Python của IDF dễ lẫn vào server.',
        buoc: [
          { ten: 'Cài libopus', lam: ['Server cần thư viện <b>libopus</b> để nén/giải nén tiếng nói. macOS: dòng <code>brew</code>. Ubuntu/Debian/Raspberry Pi OS: dòng <code>apt</code> (kèm <code>python3-venv</code> để tạo môi trường Python riêng).', 'Windows: chưa thử. Nên chạy server trên Mac, Linux, hoặc máy chạy 24/7 ở bài 22.5.'],
            hinh: T(['$ brew install opus', '', '$ sudo apt install python3-venv libopus0']),
            kiem: { thay: 'Cài xong không báo lỗi.', neu_khong: 'Không có <code>brew</code>: cài Homebrew như bài 8.0.' } },
          { ten: 'Tạo môi trường Python, cài thư viện', lam: ['Repo đã tải ở bài 8.0 (<code>~/bibaplay</code>). <code>.venv</code> là thư mục chứa thư viện riêng của server, không đụng tới Python của máy.'],
            hinh: T(['$ cd ~/bibaplay/server', '$ python3 -m venv .venv', '$ .venv/bin/pip install -r requirements.txt', '…', 'Successfully installed aiohttp-… opuslib-… …']),
            kiem: { thay: '<code>Successfully installed …</code>.', neu_khong: '<code>No module named venv</code> trên Ubuntu: thiếu gói <code>python3-venv</code> (bước 1). Python dưới 3.10: cài bản mới hơn.' } },
          { ten: 'Chạy server', lam: ['Lần đầu trên Mac, máy hỏi có cho Python nhận kết nối mạng không: chọn <b>Allow</b>. Từ chối thì chip ở máy khác không vào được.', 'Chép lại địa chỉ <code>192.168.x.y</code> trong dòng OTA URL vào bảng số đo. Để terminal này chạy, đừng tắt.'],
            hinh: T(['$ .venv/bin/python app.py', '12:34:46 OTA URL cho firmware: http://192.168.x.y:8000/xiaozhi/ota/', '12:34:46 chế độ: ECHO (chưa có GEMINI_API_KEY)', '12:34:46 chip được phép: chưa có (ARES_DEVICES) — chỉ nhận kết nối từ máy này']),
            kiem: { thay: '3 dòng như hình, có IP dạng <code>192.168…</code> hoặc <code>10.…</code>.', neu_khong: '<code>address already in use</code>: cổng 8000 đang có chương trình khác (hoặc server cũ còn chạy). Tắt nó, hoặc chạy <code>app.py --port 8001</code> và nhớ đổi số cổng ở bài 22.3. <code>No module named opuslib</code>: quên bước 2. Lỗi tìm không thấy <code>libopus</code>: quên bước 1.' } },
        ],
      },
      {
        ten: 'Phần 2 · Máy tính giả làm chip',
        buoc: [
          { ten: 'Chạy chip giả', lam: ['Mở terminal thứ 2. <code>fake_device.py</code> đi đúng các bước firmware làm: hỏi OTA, mở WebSocket, chào (hello), nói 1.2 giây tiếng bíp, chờ trả lời.'],
            hinh: T(['$ cd ~/bibaplay/server', '$ .venv/bin/python fake_device.py', "OTA -> {'url': 'ws://192.168.x.y:8000/xiaozhi/v1/', 'token': '…', 'version': 1}", "hello <- {'type': 'hello', 'transport': 'websocket', … 'sample_rate': 16000 …}", "  <- {'type': 'stt', 'text': '(echo 1.3s)'}", "  <- {'type': 'tts', 'state': 'start'}", "  <- {'type': 'tts', 'state': 'stop'}", 'echo: nhận lại 1.32 s audio (đã nói 1.2 s)', 'PASS']),
            kiem: { thay: 'Dòng cuối <code>PASS</code>.', neu_khong: '<code>Connection refused</code>: server ở terminal 1 không chạy. <code>FAIL</code>: chép cả 2 terminal đi hỏi (hoặc nhờ AI, ô ở trên).' } },
          { ten: 'Đọc log server', lam: ['Quay lại terminal 1. Mỗi dòng ứng với một bước trong sơ đồ: hỏi đường (OTA), nối WebSocket, nghe hết câu, ngắt.', '<code>aa:bb:cc:dd:ee:ff</code> là MAC giả của chip giả. Chip thật sẽ hiện MAC thật ở chỗ này (bài 22.4).'],
            hinh: T(['12:34:47 OTA check device=aa:bb:cc:dd:ee:ff client=fake-0001 board=fake', '12:34:47 [b49938958d39] connect device=aa:bb:cc:dd:ee:ff protocol=1 mode=EchoSession', '12:34:47 [b49938958d39] listen start mode=auto', '12:34:47 [b49938958d39] hết câu: 22 frame = 1.3 s', '12:34:49 [b49938958d39] disconnect']),
            kiem: { thay: 'Có đủ OTA check → connect → hết câu → disconnect.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 3 · Thử từ máy khác trong nhà',
        gioi_thieu: 'Chip là một máy khác trong mạng. Thử bằng điện thoại trước: điện thoại vào được thì chip cũng vào được.',
        buoc: [
          { ten: 'Mở OTA URL trên điện thoại', lam: ['Điện thoại vào <b>cùng Wi-Fi</b> với laptop (không dùng 4G). Mở trình duyệt, gõ đúng OTA URL server in ra, ví dụ <code>http://192.168.x.y:8000/xiaozhi/ota/</code>.'],
            hinh: T(['(trình duyệt điện thoại)', 'device not allowed', '', '(terminal 1)', '12:34:49 từ chối Device-Id=None từ 192.168.x.z — là chip của bạn thì thêm vào ARES_DEVICES']),
            kiem: { thay: 'Điện thoại hiện <code>device not allowed</code>, log server có dòng <code>từ chối …</code>. Bị từ chối là <b>đúng</b>: điện thoại đã tới được server, chỉ là không phải chip được phép.', neu_khong: 'Trình duyệt quay mãi rồi báo không kết nối được: tường lửa của laptop chặn cổng 8000 (Mac: System Settings → Network → Firewall, cho phép Python), hoặc điện thoại đang ở Wi-Fi khách / 4G.' } },
          { ten: 'Tắt server', lam: ['Terminal 1: <kbd>Ctrl</kbd>+<kbd>C</kbd>. Bài 22.2 chạy lại với key.'] },
        ],
      },
    ],
    bang_do: [{ ten: 'Ghi lại', cot: ['Giá trị'], hang: [{ ten: 'IP LAN trong OTA URL', du_doan: ['192.168.x.y'] }, { ten: 'Echo nhận lại (s)', du_doan: ['1.2–1.4'] }, { ten: 'Điện thoại thấy', du_doan: ['device not allowed'] }] }],
    hoi: [
      ['Vì sao firmware không dùng được địa chỉ <code>http://127.0.0.1:8000</code>?', '<code>127.0.0.1</code> là "chính máy này". Trên chip, nó trỏ vào chính con chip, không phải laptop. Firmware phải ghi IP LAN của máy chạy server.'],
      ['Điện thoại mở OTA URL bị báo <code>device not allowed</code>. Hỏng chỗ nào?', 'Không hỏng gì. Điện thoại đã tới được server, nên mạng và tường lửa đều ổn. Server từ chối vì điện thoại không phải chip có trong <code>ARES_DEVICES</code>.'],
      ['Echo chạy được thì đã chắc Gemini chạy chưa?', 'Chưa. Echo chỉ chứng minh mạng, cổng và giao thức xiaozhi chạy. Gemini cần key và mạng ra Internet (bài 22.2).'],
    ],
    bay: ['Chạy server trong terminal đã bật ESP-IDF (<code>export.sh</code>): Python của IDF lẫn vào, lỗi thư viện khó hiểu. Dùng terminal riêng.', 'Laptop vừa nối Wi-Fi vừa cắm dây LAN: OTA URL có thể ra IP của card mạng mà chip không thấy. Kiểm bằng điện thoại (phần 3) trước khi build firmware.', 'Mở cổng 8000 trên router ra Internet "cho tiện": người lạ lấy được token và xài key Gemini của bạn. Server chỉ chạy trong mạng nhà.'],
    robot: ['Đây là "bộ não ngoài" của robot: mọi thứ chip nghe đều đi qua server này. Bài 22.2 nối nó với Gemini, bài 22.5 cho nó chạy 24/7.'],
  });
})();
