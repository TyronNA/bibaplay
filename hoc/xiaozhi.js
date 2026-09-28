// Trang /xiaozhi/: robot trợ lý tự build (firmware ares-bread + server riêng nối Gemini Live).
// Chỉ trang này link GitHub — người xem cần code server/firmware để làm theo; các trang bài vẫn không link.
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
      <section class="dau"><p class="eyebrow">Dự án · đích đến của Phần 2</p>
      <h1>Robot AI tự build</h1>
      <p class="lede">ESP32-S3 + mic + loa + OLED trên breadboard, nói chuyện tiếng Việt bằng Gemini Live. Firmware tự build từ source <a href="https://github.com/78/xiaozhi-esp32" target="_blank" rel="noopener">xiaozhi-esp32 ↗</a>, server tự chạy trong nhà thay cho server của xiaozhi: không dùng firmware dựng sẵn, không cần tài khoản xiaozhi.me.</p>
      <p class="xz-tt"><span class="pill ok">đã chạy</span> server + Gemini Live, nói chuyện qua mic/loa máy Mac giả làm chip
        <span class="pill kiem">đã build</span> firmware, mặt robot, màn sensor panel (giả lập trên máy tính)
        <span class="pill canh">chưa làm</span> nạp lên chip thật</p>
      <p class="mo">Code: ${gh('', 'github.com/TyronNA/bibaplay')} — thư mục ${gh('firmware')}, ${gh('server')}, ${gh('sandbox')}. MIT, do AI soạn, chưa chạy trên phần cứng thật.</p></section>

      <section><h2>Mặt robot trên OLED 128×64</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/robot-face/sheet.png')}" width="1176" height="600" loading="lazy" alt="9 nét mặt robot trên màn OLED 128×64: ${CAM_XUC.join(', ')}">
        <figcaption>9 nét mặt, vẽ bằng LVGL từng điểm sáng/tắt (OLED không có điểm xám). Theo thứ tự: ${CAM_XUC.map(e => `<code>${e}</code>`).join(' ')}. Gemini chọn nét mặt mỗi lượt trả lời bằng cách gọi hàm <code>set_emotion</code>; trên chip, 16 px trên cùng vẫn là thanh trạng thái Wi-Fi của xiaozhi.</figcaption></figure>
        <p class="mo">Cùng một file C chạy ở 2 nơi: trong firmware, và trong cửa sổ giả lập trên máy tính (SDL) để chỉnh mặt khi chưa có board — ${gh('sandbox/robot-face')}.</p>
      </section>

      <section><h2>Sensor panel · bài tập LVGL</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/sensor-panel/shot.png')}" width="800" height="480" loading="lazy" alt="Màn hình 800×480 hiện nhiệt độ, tải CPU, GPU, RAM, ổ đĩa, quạt, mạng, đồng hồ, có hình robot ở giữa">
        <figcaption>Màn 800×480 hiện thông số máy tính (CPU, GPU, RAM, ổ đĩa, quạt, mạng), robot vẽ bằng đa giác, quạt quay. Ảnh này chụp từ bản giả lập chạy trên Mac, số là cảm biến thật của máy (đọc SMC, không cần sudo); <code>--demo</code> dùng số giả.</figcaption></figure>
        <p class="mo">Code UI viết để chạy được trên ESP32-S3 (chỉ phần tạo màn hình/cảm ứng khác), <b>chưa thử trên chip</b>. Trên máy thật, PC phải gửi số sang ESP32 qua USB/Wi-Fi — phần đó chưa làm. Mục đích là tập LVGL cho màn LCD của xiaozhi — ${gh('sandbox/sensor-panel')}.</p>
      </section>

      <section><h2>Chạy thế nào</h2>
        <figure class="xz-hinh xz-hinh-so to"><div class="cuon">${SO_DO}</div>
        <figcaption>Chip không nói chuyện thẳng với Google: key Gemini chỉ nằm trên server. Lúc khởi động chip gọi <code>POST /xiaozhi/ota/</code>, server trả địa chỉ WebSocket + token; từ đó chip gửi tiếng nói từng khung 60 ms (Opus), server chuyển thành PCM đẩy lên Gemini, nhận tiếng trả lời 24 kHz nén lại gửi xuống loa. Trễ đo được lúc test: ~2,6 s từ lúc ngừng nói tới lúc có tiếng trả lời.</figcaption></figure>
      </section>

      <section><h2>1 · Phần cứng</h2>
        <div class="khung to"><p>ESP32-S3 <b>N16R8</b> (có PSRAM — firmware cần), mic <a href="${R('linh-kien/inmp441')}">INMP441</a>, ampli <a href="${R('linh-kien/max98357a')}">MAX98357A</a> + <a href="${R('linh-kien/loa')}">loa</a>, <a href="${R('linh-kien/oled')}">OLED 0.96" 128×64 I2C</a>, 3 nút, cáp USB-C có truyền data. Đi dây y hệt board <code>bread-compact-wifi</code> của xiaozhi.</p>
        <p>Ráp từng module theo <a href="${R('bai/12.5')}">bài 12.5</a>: hình breadboard từng bước, đo Ω giữa 3V3 và GND sau mỗi module, trước khi cắm USB. Làm 12.1–12.3 trước để biết từng module chạy riêng đã.</p></div>
      </section>

      <section><h2>2 · Firmware</h2>
        <div class="khung to"><p>Cần <b>ESP-IDF v6.0.1 trở lên</b> (khuyên v6.1; bản 5.x không build được xiaozhi bản hiện tại). Board riêng <code>ares-bread</code> = <code>bread-compact-wifi</code> 128×64 + mặt robot + địa chỉ server riêng; có tên board riêng để cơ chế OTA của xiaozhi không bao giờ đè bằng firmware gốc.</p></div>
        ${LENH(`git clone https://github.com/TyronNA/bibaplay && cd bibaplay
git clone https://github.com/78/xiaozhi-esp32        # nằm trong bibaplay/, đã gitignore
# sửa SERVER_IP trong firmware/boards/ares-bread/config.json = IP LAN của máy chạy server
firmware/setup.sh                                    # gắn board vào bản clone + áp patch Kconfig/CMake
. $IDF_PATH/export.sh
cd xiaozhi-esp32 && python3 scripts/build.py ares-bread --name ares-bread --language vi-VN
idf.py -p /dev/cu.usbmodem… flash monitor            # Linux: /dev/ttyACM0, Windows: COM3…`)}
        <p class="mo">Không cần mặt robot: build board gốc <code>bread-compact-wifi-128x64</code>, vào <code>idf.py menuconfig</code> → <i>Xiaozhi Assistant</i> → <i>Default OTA URL</i> đổi thành <code>http://IP-server:8000/xiaozhi/ota/</code>. Patch viết cho một bản xiaozhi-esp32 cụ thể: upstream đổi nhiều thì <code>setup.sh</code> báo lỗi <code>git apply</code>, phải sửa patch.</p>
      </section>

      <section><h2>3 · Server + key Gemini miễn phí</h2>
        <div class="khung to"><p>Server một file Python (${gh('server')}): Python ≥ 3.10 và thư viện hệ thống <b>libopus</b> (macOS <code>brew install opus</code>, Ubuntu/Debian/Pi <code>sudo apt install libopus0</code>).</p>
        <p>Key: vào <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey ↗</a> bằng tài khoản Google, tạo key — gói miễn phí dùng được Gemini Live, có giới hạn số lượt theo ngày/phút (Google đổi theo thời gian). Chưa có key thì server chạy chế độ <b>echo</b>: nghe hết câu rồi phát lại, đủ để kiểm mic/loa/mạng.</p></div>
        ${LENH(`cd server
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
GEMINI_API_KEY=… ARES_TOKEN=chuoi-bi-mat .venv/bin/python app.py      # in ra OTA URL cho firmware

# chưa có board: máy tính giả làm chip, đi đúng giao thức firmware
.venv/bin/python fake_device.py                       # tự kiểm, không cần mic
.venv/bin/pip install -r requirements-mac.txt && .venv/bin/python mac_device.py   # mic + loa máy Mac`)}
        <p class="mo">Tuỳ chọn: <code>ARES_PROMPT</code> đổi tính cách, <code>GEMINI_VOICE</code> đổi giọng, file <code>~/.config/ares/mcp.json</code> nối thêm tool MCP (lịch, mail, Jira…) cho robot gọi. <code>mac_device.py</code> chỉ nửa song công (tắt mic lúc robot nói) vì máy tính không khử vọng như chip.</p>
      </section>

      <section><h2>4 · Host ở đâu</h2>
        <p class="mo">Server nhẹ: chỉ chuyển tiếp audio và nén/giải nén Opus, model chạy ở Google. Cái nó cần là <b>bật liên tục</b> và <b>cùng mạng Wi-Fi với robot</b>, IP không đổi.</p>
        <div class="cuon"><table class="xz-bang"><thead><tr><th>Chỗ chạy</th><th>Hợp khi</th><th>Lưu ý</th></tr></thead><tbody>
          <tr><td><b>Máy tính đang dùng</b></td><td>Thử nghiệm, mới ráp xong</td><td>Tắt máy là robot câm. Mac/Linux/Windows đều được.</td></tr>
          <tr><td><b>Máy nhỏ trong nhà chạy 24/7</b><br><span class="mo">mini PC, Raspberry Pi, laptop cũ</span></td><td>Dùng hằng ngày — <span class="pill ok">nên chọn</span></td><td>Server này đang chạy 24/7 trên một mini PC Ubuntu bằng systemd (${gh('server', 'deploy-mini-pc.sh + ares-server.service')}; sửa <code>User=</code>, đường dẫn cho máy bạn). Raspberry Pi chưa thử. Đặt IP tĩnh cho máy trong router (DHCP reservation).</td></tr>
          <tr><td><b>VPS / cloud</b></td><td>Robot mang ra khỏi nhà</td><td><span class="pill xau">chưa nên</span> — xem bẫy đầu tiên bên dưới. Serverless (Cloudflare Workers, Lambda) không hợp: cần giữ WebSocket lâu và thư viện libopus.</td></tr>
        </tbody></table></div>
        <p class="mo">Chi phí: key miễn phí + máy sẵn có = 0đ. Hết hạn mức miễn phí hoặc cần giữ dữ liệu riêng tư thì bật tính phí trong Google AI Studio; server có ghi số phút audio + token từng lượt vào SQLite để ước tiền (<code>trace_report.py</code>).</p>
      </section>

      <section class="bay to"><h2>Bẫy</h2><ul>
        <li><b>Đừng mở cổng server ra Internet.</b> Ai gọi <code>/xiaozhi/ota/</code> cũng nhận được token WebSocket (firmware xiaozhi cần thế để tự kết nối), nên token không chặn được người lạ: biết IP + cổng là xài key Gemini của bạn. Kết nối chip ↔ server là <code>ws://</code>, không mã hoá. Chỉ chạy trong mạng nhà, không port-forward.</li>
        <li><b>Key miễn phí: Google được dùng dữ liệu</b> để cải thiện sản phẩm. Đừng nối mail/Jira/Slack công ty qua MCP khi đang dùng key miễn phí.</li>
        <li><b>IP server đổi</b> (router cấp IP mới) → chip không tìm thấy server. Đặt IP tĩnh cho máy chạy server, hoặc build lại firmware.</li>
        <li><b>Mặt robot bị âm bản</b> khi tự viết màn hình: thư viện màn hình của ESP-IDF bật điểm OLED khi màu <i>tối</i>, nên firmware vẽ mắt màu đen trên nền trắng. Xem trước đúng như trên chip bằng bản giả lập với <code>--device</code>.</li>
        <li><b>Cáp USB chỉ sạc</b>: cắm vào mà máy không thấy cổng serial → đổi cáp có truyền data.</li>
      </ul></section>`,
  };
})();
