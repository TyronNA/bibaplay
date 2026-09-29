// Trang /xiaozhi/: robot trợ lý tự build (firmware ares-bread + server riêng nối Gemini Live).
// Link GitHub ở đây trỏ thẳng vào thư mục server/firmware — người xem cần code để làm theo (footer có link repo chung).
// Số và hành vi ghi ở đây lấy từ server/app.py, firmware/boards/ares-bread/, sandbox/*: sửa code thì soát lại trang.
(function () {
  const GH = 'https://github.com/TyronNA/bibaplay';
  const gh = (p, chu) => `<a href="${GH}/tree/main/${p}" target="_blank" rel="noopener">${chu || p} ↗</a>`;
  // thứ tự ô trong ảnh ghép = thứ tự EMO[] trong robot_face.c (lưới 3 cột)
  const CAM_XUC = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'sleepy', 'winking', 'confused'];

  const SO_DO = `<svg class="xz-sodo" viewBox="0 0 780 230" role="img" aria-label="Luồng dữ liệu: ESP32 gửi tiếng nói qua WebSocket tới server trong nhà, server nối Gemini Live, trả tiếng nói và nét mặt về chip">
    <defs><marker id="xz-mui" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="xz-mui"/></marker></defs>
    <g class="xz-hop"><rect x="10" y="40" width="200" height="150" rx="3"/><rect x="290" y="40" width="200" height="150" rx="3"/><rect x="570" y="40" width="200" height="150" rx="3"/></g>
    <g class="xz-ten"><text x="110" y="68">ESP32-S3 (robot)</text><text x="390" y="68">Server trong nhà</text><text x="670" y="68">Gemini Live</text></g>
    <g class="xz-chu">
      <text x="110" y="96">mic INMP441 → Opus 16 kHz</text><text x="110" y="118">loa ← MAX98357A</text><text x="110" y="140">OLED: mặt robot</text><text x="110" y="162">firmware xiaozhi tự build</text>
      <text x="390" y="96">Python · aiohttp</text><text x="390" y="118">giải/nén Opus ↔ PCM</text><text x="390" y="140">giữ key Gemini</text><text x="390" y="162">tool MCP (tuỳ chọn)</text>
      <text x="670" y="96">nghe + nghĩ + nói</text><text x="670" y="118">trong một model</text><text x="670" y="140">trả PCM 24 kHz</text><text x="670" y="162">gọi hàm set_emotion</text>
    </g>
    <g class="xz-day"><path d="M212 100H288" marker-end="url(#xz-mui)"/><path d="M288 140H212" marker-end="url(#xz-mui)"/><path d="M492 100H568" marker-end="url(#xz-mui)"/><path d="M568 140H492" marker-end="url(#xz-mui)"/></g>
    <g class="xz-nhan"><text x="250" y="30">WebSocket ws://</text><text x="250" y="214">cùng mạng Wi-Fi</text><text x="530" y="30">WebSocket wss://</text><text x="530" y="214">Internet · API key</text></g>
  </svg>`;

  const LENH = (s) => `<div class="cuon"><pre class="code">${s}</pre></div>`;

  window.XIAOZHI = {
    tieuDe: 'Robot AI tự build: ESP32-S3 + Gemini Live, server riêng · Bàn Ráp',
    moTa: 'Trợ lý giọng nói xiaozhi ráp trên breadboard: tự build firmware ESP32-S3 có mặt robot trên OLED, server riêng nối Gemini Live bằng key miễn phí, chạy trên máy trong nhà. Cách build, lấy key, chọn chỗ host.',
    html: (R, url) => `
      <section class="dau"><p class="eyebrow">Dự án · đích đến của Phần 2 và 3 · <a href="${R('en/xiaozhi')}" hreflang="en" lang="en">English</a></p>
      <h1>Robot AI tự build</h1>
      <p class="lede">ESP32-S3 cùng mic, loa và màn OLED ráp trên breadboard, nói chuyện tiếng Việt nhờ Gemini Live. Firmware (chương trình nạp vào chip) tự build từ mã nguồn <a href="https://github.com/78/xiaozhi-esp32" target="_blank" rel="noopener">xiaozhi-esp32 ↗</a>. Server cũng tự chạy trong nhà, thay cho server của xiaozhi, nên không cần firmware dựng sẵn hay tài khoản xiaozhi.me.</p>
      <p class="xz-tt"><span class="pill ok">đã chạy</span> server nói chuyện được với Gemini Live, dùng mic và loa của máy Mac giả làm chip
        <span class="pill kiem">đã build</span> firmware, mặt robot, màn sensor panel (chạy giả lập trên máy tính)
        <span class="pill canh">chưa làm</span> nạp lên chip thật</p>
      <p class="mo">Code: ${gh('', 'github.com/TyronNA/bibaplay')}, trong các thư mục ${gh('firmware')}, ${gh('server')}, ${gh('sandbox')}. Giấy phép MIT. Code do AI soạn, chưa chạy trên phần cứng thật.</p></section>

      <section><h2>Mặt robot trên OLED 128×64</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/robot-face/sheet.png')}" width="1176" height="600" loading="lazy" alt="9 nét mặt robot trên màn OLED 128×64: ${CAM_XUC.join(', ')}">
        <figcaption>9 nét mặt, theo thứ tự: ${CAM_XUC.map(e => `<code>${e}</code>`).join(' ')}. Mặt vẽ bằng LVGL (thư viện giao diện cho vi điều khiển). OLED chỉ có điểm sáng hoặc tắt, không có màu xám. Mỗi lượt trả lời, Gemini gọi hàm <code>set_emotion</code> để chọn nét mặt. Dải 16 px trên cùng vẫn là thanh trạng thái Wi-Fi của xiaozhi.</figcaption></figure>
        <p class="mo">Cùng một file C chạy được ở 2 nơi: trong firmware, và trong một cửa sổ giả lập trên máy tính (dùng thư viện SDL). Nhờ vậy chỉnh mặt được cả khi chưa có board: ${gh('sandbox/robot-face')}.</p>
      </section>

      <section><h2>Chạy thế nào</h2>
        <figure class="xz-hinh xz-hinh-so to"><div class="cuon">${SO_DO}</div>
        <figcaption>Chip không nói chuyện thẳng với Google. Key Gemini chỉ nằm trên server. Lúc khởi động, chip gọi <code>POST /xiaozhi/ota/</code>, server trả về địa chỉ WebSocket (kết nối mở liên tục 2 chiều) và một token. Sau đó chip gửi tiếng nói thành từng khung 60 ms, nén bằng Opus (chuẩn nén tiếng nói). Server giải nén ra PCM (âm thanh thô), đẩy lên Gemini, rồi nén tiếng trả lời 24 kHz lại để gửi xuống loa. Lúc test đo được: từ khi ngừng nói tới khi nghe trả lời mất khoảng 2.6s.</figcaption></figure>
      </section>

      <section><h2>1 · Phần cứng</h2>
        <div class="khung to"><p>ESP32-S3 bản <b>N16R8</b> (có PSRAM, tức RAM gắn thêm, firmware cần), mic <a href="${R('linh-kien/inmp441')}">INMP441</a>, ampli <a href="${R('linh-kien/max98357a')}">MAX98357A</a> + <a href="${R('linh-kien/loa')}">loa</a>, <a href="${R('linh-kien/oled')}">OLED 0.96" 128×64 I2C</a>, 3 nút, cáp USB-C có truyền data. Đi dây giống hệt board <code>bread-compact-wifi</code> của xiaozhi.</p>
        <p>Ráp theo <a href="${R('bai/12.5')}">bài 12.5</a>: có hình breadboard từng bước, và sau mỗi module phải đo Ω giữa 3V3 và GND rồi mới cắm USB. Nên làm 12.1–12.3 trước để chắc từng module chạy riêng được.</p></div>
      </section>

      <section><h2>2 · Firmware</h2>
        <div class="khung to"><p>Cần <b>ESP-IDF v6.0.1 trở lên</b> (bộ công cụ build của Espressif; khuyên dùng v6.1, bản 5.x không build được xiaozhi hiện tại). Board riêng <code>ares-bread</code> là <code>bread-compact-wifi</code> 128×64, thêm mặt robot, tool bánh xe và địa chỉ server riêng. Đặt tên board riêng để tính năng tự cập nhật (OTA) của xiaozhi không bao giờ ghi đè firmware gốc lên.</p></div>
        ${LENH(`git clone https://github.com/TyronNA/bibaplay && cd bibaplay
git clone https://github.com/78/xiaozhi-esp32        # nằm trong bibaplay/, đã gitignore
# sửa SERVER_IP trong firmware/boards/ares-bread/config.json = IP LAN của máy chạy server
firmware/setup.sh                                    # gắn board vào bản clone + áp patch Kconfig/CMake
. $IDF_PATH/export.sh
cd xiaozhi-esp32 && python3 scripts/build.py ares-bread --name ares-bread --language vi-VN
idf.py -p /dev/cu.usbmodem… flash monitor            # Linux: /dev/ttyACM0, Windows: COM3…`)}
        <p class="mo">Không cần mặt robot thì build board gốc <code>bread-compact-wifi-128x64</code>, vào <code>idf.py menuconfig</code> → <i>Xiaozhi Assistant</i> → <i>Default OTA URL</i>, đổi thành <code>http://IP-server:8000/xiaozhi/ota/</code>. Patch viết cho một phiên bản xiaozhi-esp32 cụ thể. Nếu bản gốc đổi nhiều, <code>setup.sh</code> sẽ báo lỗi <code>git apply</code> và phải sửa patch.</p>
      </section>

      <section><h2>3 · Server + key Gemini miễn phí</h2>
        <div class="khung to"><p>Server là một file Python (${gh('server')}). Cần Python 3.10 trở lên và thư viện <b>libopus</b> để nén/giải nén Opus: trên macOS chạy <code>brew install opus</code>, trên Ubuntu/Debian/Pi chạy <code>sudo apt install libopus0</code>.</p>
        <p>Lấy key ở <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey ↗</a> bằng tài khoản Google. Gói miễn phí dùng được Gemini Live nhưng giới hạn số lượt mỗi ngày và mỗi phút, và Google thay đổi mức này theo thời gian. Chưa có key thì server chạy chế độ <b>echo</b>: nghe hết câu rồi phát lại, đủ để kiểm mic, loa và mạng.</p></div>
        ${LENH(`cd server
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
GEMINI_API_KEY=… ARES_DEVICES=aa:bb:cc:dd:ee:ff .venv/bin/python app.py   # MAC chip; in ra OTA URL cho firmware

# chưa có board: máy tính giả làm chip, đi đúng giao thức firmware
.venv/bin/python fake_device.py                       # tự kiểm, không cần mic
.venv/bin/pip install -r requirements-mac.txt && .venv/bin/python mac_device.py   # mic + loa máy Mac`)}
        <p class="mo"><code>ARES_DEVICES</code> là danh sách địa chỉ MAC (mã riêng của mỗi chip Wi-Fi) được phép kết nối, cách nhau bằng dấu phẩy. Chưa biết MAC thì cứ cắm chip vào: server sẽ từ chối và in MAC đó ra log, chép vào đây rồi chạy lại. Kết nối từ chính máy chạy server, như chip giả ở trên, luôn được nhận.</p>
        <p class="mo">Tuỳ chọn: <code>ARES_PROMPT</code> để đổi tính cách, <code>GEMINI_VOICE</code> để đổi giọng. File <code>~/.config/ares/mcp.json</code> để nối thêm tool MCP (lịch, mail, ghi chú…) cho robot dùng. <code>mac_device.py</code> tắt mic lúc robot đang nói, vì máy tính không lọc được tiếng vọng từ loa như chip.</p>
      </section>

      <section><h2>4 · Host ở đâu</h2>
        <p class="mo">Server rất nhẹ, vì model chạy ở Google, server chỉ chuyển tiếp và nén/giải nén âm thanh. Nó chỉ cần <b>bật liên tục</b>, <b>cùng mạng Wi-Fi với robot</b> và giữ IP cố định.</p>
        <div class="cuon"><table class="xz-bang"><thead><tr><th>Chỗ chạy</th><th>Hợp khi</th><th>Lưu ý</th></tr></thead><tbody>
          <tr><td><b>Máy tính đang dùng</b></td><td>Thử nghiệm, mới ráp xong</td><td>Tắt máy là robot câm. Mac, Linux hay Windows đều được.</td></tr>
          <tr><td><b>Máy nhỏ trong nhà chạy 24/7</b><br><span class="mo">mini PC, Raspberry Pi, laptop cũ</span></td><td>Dùng hằng ngày: <span class="pill ok">nên chọn</span></td><td>Với máy Linux có systemd, <code>server/deploy.sh &lt;ssh-host&gt;</code> chép server lên và cài thành dịch vụ tự chạy (${gh('server', 'server/')}). Đã thử trên Ubuntu, chưa thử Raspberry Pi. Nên giữ IP cố định cho máy này trong cài đặt router (DHCP reservation).</td></tr>
          <tr><td><b>VPS / cloud</b></td><td>Mang robot ra khỏi nhà</td><td><span class="pill xau">chưa nên</span>, xem bẫy đầu tiên bên dưới. Dịch vụ serverless (Cloudflare Workers, Lambda) không hợp, vì server cần giữ WebSocket mở lâu và cần libopus.</td></tr>
        </tbody></table></div>
        <p class="mo">Chi phí: key miễn phí cộng máy có sẵn là 0đ. Khi hết hạn mức miễn phí, hoặc muốn dữ liệu được giữ riêng tư, thì bật tính phí trong Google AI Studio. Server ghi số phút âm thanh và số token mỗi lượt vào SQLite, dùng <code>trace_report.py</code> để ước tiền.</p>
      </section>

      <section><h2>5 · Cho robot chạy bằng giọng</h2>
        <p class="mo">Firmware <code>ares-bread</code> có thêm 2 tool trên chip: <code>self.robot.move</code> (hướng, tốc độ, thời gian) và <code>self.robot.stop</code>. Khi chip kết nối, server hỏi chip có những tool nào rồi báo cho Gemini. Bạn nói "tiến lên một giây", Gemini gọi tool, chip chạy 2 motor qua DRV8833 rồi tự dừng. Tốc độ tối đa 70% và mỗi lệnh chạy tối đa 3 giây. Hai giới hạn này nằm trong firmware, nên AI có nghe nhầm cũng không vượt được. Cách ráp motor và chạy thử khi bánh còn nhấc khỏi bàn: <a href="${R('bai/17.2')}">bài 17.2</a>. <b>Chưa thử trên chip thật.</b></p>
      </section>

      <section><h2>Sensor panel · bài tập LVGL</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/sensor-panel/shot.png')}" width="800" height="480" loading="lazy" alt="Màn hình 800×480 hiện nhiệt độ, tải CPU, GPU, RAM, ổ đĩa, quạt, mạng, đồng hồ, có hình robot ở giữa">
        <figcaption>Màn 800×480 hiện thông số máy tính (CPU, GPU, RAM, ổ đĩa, quạt, mạng), có robot vẽ bằng đa giác và quạt quay. Ảnh chụp từ bản giả lập trên Mac, số liệu lấy từ cảm biến thật của máy, không cần quyền sudo. Chạy với <code>--demo</code> thì dùng số giả.</figcaption></figure>
        <p class="mo">Code giao diện viết để chạy được trên ESP32-S3, chỉ khác phần khởi tạo màn hình và cảm ứng, nhưng <b>chưa thử trên chip</b>. Muốn chạy thật thì máy tính phải gửi số sang ESP32 qua USB hoặc Wi-Fi, phần này chưa làm. Mục đích là tập LVGL cho màn LCD của xiaozhi: ${gh('sandbox/sensor-panel')}.</p>
      </section>

      <section class="bay to"><h2>Bẫy</h2><ul>
        <li><b>Đừng mở cổng server ra Internet.</b> Firmware xiaozhi tự lấy token qua <code>/xiaozhi/ota/</code>, nên người lạ cũng lấy được. Thứ duy nhất chặn họ là danh sách MAC trong <code>ARES_DEVICES</code>, mà MAC thì giả được. Kết nối giữa chip và server (<code>ws://</code>) cũng không mã hoá. Chỉ chạy trong mạng nhà, không mở cổng (port-forward) trên router.</li>
        <li><b>Dùng key miễn phí thì Google được dùng dữ liệu</b> của bạn để cải thiện sản phẩm. Vì vậy đừng nối mail hay tài khoản công việc qua MCP khi đang dùng key miễn phí.</li>
        <li><b>IP server đổi</b> (router cấp IP mới) thì chip không tìm thấy server. Giữ IP cố định cho máy chạy server, hoặc build lại firmware với IP mới.</li>
        <li><b>Mặt robot bị âm bản</b> khi tự viết code màn hình: thư viện màn hình của ESP-IDF bật điểm OLED ứng với màu <i>tối</i>, nên firmware vẽ mắt màu đen trên nền trắng. Muốn xem trước đúng như trên chip thì chạy bản giả lập với <code>--device</code>.</li>
        <li><b>Cáp USB chỉ sạc được</b>: cắm vào mà máy tính không thấy cổng serial thì đổi sang cáp có truyền data.</li>
      </ul></section>`,
  };
})();
