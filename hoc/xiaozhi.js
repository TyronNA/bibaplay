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
      <p class="mo">Code tải ở ${gh('', 'github.com/TyronNA/bibaplay')}: ${gh('server')} (server), ${gh('firmware')} (board riêng), ${gh('sandbox')} (giả lập màn hình). Giấy phép MIT. Code do AI soạn, chưa chạy trên phần cứng thật.</p>
      <nav class="khung to xz-ml" aria-label="Mục lục"><p><b>Làm theo thứ tự</b>. Chưa có board vẫn làm được bước 3: máy tính giả làm chip.</p><p>Trang này là bản tóm tắt. Muốn làm từng bước, có hình terminal mẫu và nút đánh dấu đã xong: <a href="${R('bai/8.0')}">bài 8.0</a> (cài ESP-IDF) rồi <b>chương 22</b>, từ <a href="${R('bai/22.1')}">22.1</a> tới <a href="${R('bai/22.6')}">22.6</a>.</p><ol>
        <li><a href="#xz-luong">Hiểu luồng chạy</a>: chip, server, Gemini nói chuyện với nhau ra sao</li>
        <li><a href="#xz-phan-cung">Ráp phần cứng</a>: link sang bài 12.5</li>
        <li><a href="#xz-host">Host server trong nhà</a>: bài học từng bước, từ máy trắng tới chạy 24/7</li>
        <li><a href="#xz-firmware">Build và nạp firmware</a>: cần IP server ở bước 3</li>
        <li><a href="#xz-noi">Nối chip vào server</a>: cho phép chip, nói câu đầu tiên</li>
        <li><a href="#xz-ai">Nhờ Claude Code / Codex làm giúp</a>: prompt mẫu cho từng bước</li>
      </ol><p class="mo">Thêm: <a href="#xz-mat">mặt robot</a> · <a href="#xz-chay">cho robot chạy bằng giọng</a> · <a href="#xz-panel">sensor panel</a> · <a href="#xz-bay">bẫy</a></p></nav></section>

      <section id="xz-luong"><h2><span class="so">1</span> Hiểu luồng chạy</h2>
        <figure class="xz-hinh xz-hinh-so to"><div class="cuon">${SO_DO}</div>
        <figcaption>Chip không nói chuyện thẳng với Google. Key Gemini chỉ nằm trên server. Lúc khởi động, chip gọi <code>POST /xiaozhi/ota/</code>, server trả về địa chỉ WebSocket (kết nối mở liên tục 2 chiều) và một token. Sau đó chip gửi tiếng nói thành từng khung 60 ms, nén bằng Opus (chuẩn nén tiếng nói). Server giải nén ra PCM (âm thanh thô), đẩy lên Gemini, rồi nén tiếng trả lời 24 kHz lại để gửi xuống loa. Lúc test đo được: từ khi ngừng nói tới khi nghe trả lời mất khoảng 2.6s.</figcaption></figure>
        <p class="mo">Vì vậy thứ tự làm là: server chạy trước (bước 3), firmware ghi sẵn địa chỉ server (bước 4), rồi mới cắm chip (bước 5).</p>
      </section>

      <section id="xz-phan-cung"><h2><span class="so">2</span> Ráp phần cứng</h2>
        <div class="khung to"><p>ESP32-S3 bản <b>N16R8</b> (có PSRAM, tức RAM gắn thêm, firmware cần), mic <a href="${R('linh-kien/inmp441')}">INMP441</a>, ampli <a href="${R('linh-kien/max98357a')}">MAX98357A</a> + <a href="${R('linh-kien/loa')}">loa</a>, <a href="${R('linh-kien/oled')}">OLED 0.96" 128×64 I2C</a>, 3 nút, cáp USB-C có truyền data. Đi dây giống hệt board <code>bread-compact-wifi</code> của xiaozhi.</p>
        <p>Ráp theo <a href="${R('bai/12.5')}">bài 12.5</a>: có hình breadboard từng bước, và sau mỗi module phải đo Ω giữa 3V3 và GND rồi mới cắm USB. Nên làm 12.1–12.3 trước để chắc từng module chạy riêng được.</p></div>
      </section>

      <section id="xz-host"><h2><span class="so">3</span> Host server trong nhà · bài học</h2>
        <p class="mo">Server rất nhẹ, vì model chạy ở Google, server chỉ chuyển tiếp và nén/giải nén âm thanh. Nó chỉ cần <b>bật liên tục</b>, <b>cùng mạng Wi-Fi với robot</b> và giữ IP cố định. Không cần biết Python: chỉ chép lệnh vào Terminal.</p>
        <p class="mo">Bài từng bước: <a href="${R('bai/22.1')}">22.1</a> chạy echo, <a href="${R('bai/22.2')}">22.2</a> key Gemini, <a href="${R('bai/22.5')}">22.5</a> chạy 24/7.</p>

        <h3>3.1 · Chọn máy</h3>
        <div class="cuon"><table class="xz-bang"><thead><tr><th>Chỗ chạy</th><th>Hợp khi</th><th>Lưu ý</th></tr></thead><tbody>
          <tr><td><b>Máy tính đang dùng</b></td><td>Thử nghiệm, mới ráp xong</td><td>Tắt máy là robot câm. Đã chạy trên Mac và Ubuntu.</td></tr>
          <tr><td><b>Máy nhỏ trong nhà chạy 24/7</b><br><span class="mo">mini PC, Raspberry Pi, laptop cũ</span></td><td>Dùng hằng ngày: <span class="pill ok">nên chọn</span></td><td>Máy Linux có systemd thì bước 3.6 cài thành dịch vụ tự chạy. Đã thử trên Ubuntu, chưa thử Raspberry Pi.</td></tr>
          <tr><td><b>VPS / cloud</b></td><td>Mang robot ra khỏi nhà</td><td><span class="pill xau">chưa nên</span>, xem <a href="#xz-bay">bẫy đầu tiên</a>. Dịch vụ serverless (Cloudflare Workers, Lambda) không hợp, vì server cần giữ WebSocket mở lâu và cần libopus.</td></tr>
        </tbody></table></div>
        <p class="mo">Các bước 3.2–3.5 làm trên chính máy sẽ chạy server. Bắt đầu trên laptop cho quen cũng được, rồi bước 3.6 mới chuyển sang máy 24/7.</p>

        <h3>3.2 · Tải code + cài Python, libopus</h3>
        <div class="khung to"><p>Cần Python 3.10 trở lên (<code>python3 --version</code> để xem) và <b>libopus</b> để nén/giải nén Opus. Không dùng git thì vào trang GitHub bấm <i>Code → Download ZIP</i> rồi giải nén.</p></div>
        ${LENH(`git clone https://github.com/TyronNA/bibaplay && cd bibaplay/server
brew install opus                                     # macOS
sudo apt install python3-venv libopus0                # Ubuntu / Debian / Raspberry Pi OS
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`)}

        <h3>3.3 · Chạy thử chưa cần key (chế độ echo)</h3>
        <div class="khung to"><p>Chưa có key Gemini thì server chạy chế độ <b>echo</b>: nghe hết câu rồi phát lại. Đủ để kiểm đường truyền trước khi đụng tới Google.</p></div>
        ${LENH(`.venv/bin/python app.py
# phải thấy:  OTA URL cho firmware: http://192.168.x.y:8000/xiaozhi/ota/
#             chế độ: ECHO (chưa có GEMINI_API_KEY)

# mở Terminal thứ 2, cũng trong thư mục server/: máy tính giả làm chip
.venv/bin/python fake_device.py                       # dòng cuối phải là PASS`)}
        <p class="mo">Ghi lại địa chỉ <code>192.168.x.y</code> trong dòng OTA URL: đó là IP LAN của máy, bước 4 cần. Dừng server bằng <kbd>Ctrl</kbd>+<kbd>C</kbd>.</p>

        <h3>3.4 · Lấy key Gemini miễn phí, chạy thật</h3>
        <div class="khung to"><p>Lấy key ở <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey ↗</a> bằng tài khoản Google. Gói miễn phí dùng được Gemini Live nhưng giới hạn số lượt mỗi ngày và mỗi phút, và Google thay đổi mức này theo thời gian. Key là mật khẩu: không dán lên nhóm chat, không commit lên GitHub.</p></div>
        ${LENH(`GEMINI_API_KEY=dán-key-vào-đây .venv/bin/python app.py
# phải thấy:  chế độ: Gemini Live (...)

# Terminal thứ 2: gửi một câu hỏi thu sẵn, câu trả lời lưu ra reply.wav để mở nghe
.venv/bin/python fake_device.py --wav hoi-mau.wav

# có Mac: nói chuyện bằng mic + loa của máy
.venv/bin/pip install -r requirements-mac.txt && .venv/bin/python mac_device.py`)}
        <p class="mo">Tuỳ chọn: <code>ARES_PROMPT</code> để đổi tính cách, <code>GEMINI_VOICE</code> để đổi giọng. File <code>~/.config/ares/mcp.json</code> để nối thêm tool MCP (lịch, ghi chú…) cho robot dùng. <code>mac_device.py</code> tắt mic lúc robot đang nói, vì máy tính không lọc được tiếng vọng từ loa như chip.</p>

        <h3>3.5 · Giữ IP cố định</h3>
        <div class="khung to"><p>Firmware ghi cứng IP của server. Router cấp IP mới cho máy là chip không tìm thấy server nữa. Vào trang quản lý router (địa chỉ và mật khẩu in trên nhãn dưới đáy router), tìm mục <b>DHCP reservation</b> / <i>Static lease</i> / <i>Gán IP tĩnh</i>, chọn máy chạy server và giữ đúng IP đã ghi ở bước 3.3. Mỗi hãng router đặt tên mục này khác nhau.</p>
        <p>Máy có bật tường lửa (firewall) thì cho phép cổng <code>8000</code> trong mạng LAN. Mac sẽ tự hỏi lần đầu chạy server, chọn <i>Allow</i>.</p></div>

        <h3>3.6 · Chạy 24/7 trên máy Linux (mini PC, Pi)</h3>
        <div class="khung to"><p>Từ laptop, <code>server/deploy.sh</code> chép server lên máy Linux qua SSH, cài thành dịch vụ systemd: tự chạy khi bật máy, tự khởi động lại khi lỗi. Máy đích cần: SSH vào được bằng key, user có <code>sudo</code> không hỏi mật khẩu, đã cài <code>python3-venv</code>, <code>libopus0</code> và <code>rsync</code>. Chạy lại lệnh này mỗi khi cập nhật code.</p></div>
        ${LENH(`server/deploy.sh user@192.168.x.y                     # chạy trên laptop, trong thư mục bibaplay/
# xong phải in ra:  active

# trên máy đích: dán key + MAC chip vào file này (deploy.sh tạo sẵn, chỉ user đó đọc được)
nano ~/.config/ares/gemini.env
sudo systemctl restart ares-server
journalctl -u ares-server -f                          # xem log trực tiếp, Ctrl+C để thoát`)}
        <p class="mo">Không muốn cho sudo không hỏi mật khẩu thì làm tay: chạy bước 3.2–3.4 trên máy đó, rồi xem file mẫu ${gh('server/ares-server.service', 'ares-server.service')} để tự cài dịch vụ.</p>
        <p class="mo">Chi phí: key miễn phí cộng máy có sẵn là 0đ. Khi hết hạn mức miễn phí, hoặc muốn dữ liệu được giữ riêng tư, thì bật tính phí trong Google AI Studio. Server ghi số phút âm thanh và số token mỗi lượt vào SQLite, dùng <code>trace_report.py</code> để ước tiền.</p>
      </section>

      <section id="xz-firmware"><h2><span class="so">4</span> Build và nạp firmware</h2>
        <p class="mo">Bài từng bước: <a href="${R('bai/8.0')}">8.0</a> cài ESP-IDF, <a href="${R('bai/22.3')}">22.3</a> build, nạp, cài Wi-Fi cho chip.</p>
        <div class="khung to"><p>Cần <b>ESP-IDF v6.0.1 trở lên</b> (bộ công cụ build của Espressif; khuyên dùng v6.1, bản 5.x không build được xiaozhi hiện tại). Board riêng <code>ares-bread</code> là <code>bread-compact-wifi</code> 128×64, thêm mặt robot, tool bánh xe và địa chỉ server riêng. Đặt tên board riêng để tính năng tự cập nhật (OTA) của xiaozhi không bao giờ ghi đè firmware gốc lên.</p></div>
        ${LENH(`git clone https://github.com/TyronNA/bibaplay && cd bibaplay
git clone https://github.com/78/xiaozhi-esp32        # nằm trong bibaplay/, đã gitignore
# sửa SERVER_IP trong firmware/boards/ares-bread/config.json = IP server ở bước 3.3
firmware/setup.sh                                    # gắn board vào bản clone + áp patch Kconfig/CMake
. $IDF_PATH/export.sh
cd xiaozhi-esp32 && python3 scripts/build.py ares-bread --name ares-bread --language vi-VN
idf.py -p /dev/cu.usbmodem… flash monitor            # Linux: /dev/ttyACM0, Windows: COM3…`)}
        <p class="mo">Không cần mặt robot thì build board gốc <code>bread-compact-wifi-128x64</code>, vào <code>idf.py menuconfig</code> → <i>Xiaozhi Assistant</i> → <i>Default OTA URL</i>, đổi thành <code>http://IP-server:8000/xiaozhi/ota/</code>. Patch viết cho một phiên bản xiaozhi-esp32 cụ thể. Nếu bản gốc đổi nhiều, <code>setup.sh</code> sẽ báo lỗi <code>git apply</code> và phải sửa patch.</p>
      </section>

      <section id="xz-noi"><h2><span class="so">5</span> Nối chip vào server</h2>
        <p class="mo">Bài từng bước: <a href="${R('bai/22.4')}">22.4</a> câu nói đầu tiên, <a href="${R('bai/22.6')}">22.6</a> đọc lỗi khi chip không vào được.</p>
        <div class="khung to"><p>Server chỉ nhận chip có địa chỉ MAC (mã riêng của mỗi chip Wi-Fi) nằm trong <code>ARES_DEVICES</code>. Lần đầu chưa biết MAC thì cứ để chip kết nối: server từ chối và in ra log dòng <code>từ chối Device-Id=aa:bb:…</code>. Chép MAC đó vào rồi chạy lại server. Nhiều chip thì cách nhau dấu phẩy. Kết nối từ chính máy chạy server (chip giả ở bước 3) luôn được nhận.</p></div>
        ${LENH(`GEMINI_API_KEY=… ARES_DEVICES=aa:bb:cc:dd:ee:ff .venv/bin/python app.py   # chạy tay
# chạy bằng dịch vụ (3.6): thêm ARES_DEVICES=… vào ~/.config/ares/gemini.env, rồi
sudo systemctl restart ares-server`)}
        <p class="mo">Thấy log <code>OTA check device=…</code> rồi <code>Gemini Live sẵn sàng</code> là xong: nói với robot. Chip kẹt ở màn kết nối thì soát lại: IP trong firmware đúng chưa, chip và server có cùng Wi-Fi không (Wi-Fi khách của router thường chặn các máy thấy nhau), cổng 8000 có bị tường lửa chặn không.</p>
      </section>

      <section id="xz-ai"><h2><span class="so">6</span> Nhờ Claude Code / Codex làm giúp</h2>
        <div class="khung to"><p>Không rành Linux, Python hay ESP-IDF thì giao phần gõ lệnh cho trợ lý AI chạy trong Terminal: <a href="https://docs.claude.com/en/docs/claude-code/overview" target="_blank" rel="noopener">Claude Code ↗</a> hoặc <a href="https://github.com/openai/codex" target="_blank" rel="noopener">Codex CLI ↗</a> (cách cài ở trang của từng bên). Nó đọc code trong repo, chạy lệnh, đọc lỗi rồi tự sửa. Cách dùng: tải repo về, <code>cd bibaplay</code>, gõ <code>claude</code> hoặc <code>codex</code>, rồi dán prompt.</p>
        <p><b>Giữ an toàn:</b> đừng dán key Gemini vào khung chat, tự gõ nó vào file <code>gemini.env</code>. Đọc lệnh <code>sudo</code> trước khi cho chạy. Đừng để AI mở cổng router ra Internet. Phần đi dây vẫn theo bài 12.5 và đo Ω trước khi cắm: AI đọc nhầm chân là cháy thật.</p></div>
        ${LENH(`# bước 3: chạy server trên máy này
Đọc server/README.md và server/app.py. Giúp tôi cài và chạy server ở chế độ echo trên máy này,
rồi chạy fake_device.py để kiểm tra phải ra PASS. Máy tôi là [macOS / Ubuntu / Raspberry Pi].
Hỏi tôi trước mỗi lệnh sudo. Cuối cùng cho tôi biết IP LAN mà firmware cần.

# bước 3.6: chuyển lên máy 24/7
Tôi có máy Linux ở 192.168.x.y, SSH bằng user ___. Đọc server/deploy.sh, kiểm tra máy đó đủ
điều kiện chưa (python3-venv, libopus0, rsync, sudo), cài cái còn thiếu rồi chạy deploy.sh.
Không đụng tới key: tôi tự dán vào ~/.config/ares/gemini.env.

# bước 4: build firmware
Đọc firmware/boards/ares-bread/README.md. IP server là 192.168.x.y. Giúp tôi cài ESP-IDF v6.1,
build board ares-bread rồi nạp vào chip đang cắm USB. Lỗi thì đọc log và sửa, đừng sửa pin trong config.h.

# bước 5: không kết nối được
Đây là log server và log idf.py monitor của chip: [dán vào]. Vì sao chip không vào được server?`)}
        <p class="mo">Trợ lý AI cũng có thể sai. Nó báo xong thì tự kiểm lại bằng chính các dấu hiệu trong bài: <code>PASS</code>, <code>chế độ: Gemini Live</code>, <code>active</code>, và nghe robot trả lời.</p>
      </section>

      <section id="xz-mat"><h2>Mặt robot trên OLED 128×64</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/robot-face/sheet.png')}" width="1176" height="600" loading="lazy" alt="9 nét mặt robot trên màn OLED 128×64: ${CAM_XUC.join(', ')}">
        <figcaption>9 nét mặt, theo thứ tự: ${CAM_XUC.map(e => `<code>${e}</code>`).join(' ')}. Mặt vẽ bằng LVGL (thư viện giao diện cho vi điều khiển). OLED chỉ có điểm sáng hoặc tắt, không có màu xám. Mỗi lượt trả lời, Gemini gọi hàm <code>set_emotion</code> để chọn nét mặt. Dải 16 px trên cùng vẫn là thanh trạng thái Wi-Fi của xiaozhi.</figcaption></figure>
        <p class="mo">Cùng một file C chạy được ở 2 nơi: trong firmware, và trong một cửa sổ giả lập trên máy tính (dùng thư viện SDL). Nhờ vậy chỉnh mặt được cả khi chưa có board: ${gh('sandbox/robot-face')}.</p>
      </section>

      <section id="xz-chay"><h2>Cho robot chạy bằng giọng</h2>
        <p class="mo">Firmware <code>ares-bread</code> có thêm 2 tool trên chip: <code>self.robot.move</code> (hướng, tốc độ, thời gian) và <code>self.robot.stop</code>. Khi chip kết nối, server hỏi chip có những tool nào rồi báo cho Gemini. Bạn nói "tiến lên một giây", Gemini gọi tool, chip chạy 2 motor qua DRV8833 rồi tự dừng. Tốc độ tối đa 70% và mỗi lệnh chạy tối đa 3 giây. Hai giới hạn này nằm trong firmware, nên AI có nghe nhầm cũng không vượt được. Cách ráp motor và chạy thử khi bánh còn nhấc khỏi bàn: <a href="${R('bai/17.2')}">bài 17.2</a>. <b>Chưa thử trên chip thật.</b></p>
      </section>

      <section id="xz-panel"><h2>Sensor panel · bài tập LVGL</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/sensor-panel/shot.png')}" width="800" height="480" loading="lazy" alt="Màn hình 800×480 hiện nhiệt độ, tải CPU, GPU, RAM, ổ đĩa, quạt, mạng, đồng hồ, có hình robot ở giữa">
        <figcaption>Màn 800×480 hiện thông số máy tính (CPU, GPU, RAM, ổ đĩa, quạt, mạng), có robot vẽ bằng đa giác và quạt quay. Ảnh chụp từ bản giả lập trên Mac, số liệu lấy từ cảm biến thật của máy, không cần quyền sudo. Chạy với <code>--demo</code> thì dùng số giả.</figcaption></figure>
        <p class="mo">Code giao diện viết để chạy được trên ESP32-S3, chỉ khác phần khởi tạo màn hình và cảm ứng, nhưng <b>chưa thử trên chip</b>. Muốn chạy thật thì máy tính phải gửi số sang ESP32 qua USB hoặc Wi-Fi, phần này chưa làm. Mục đích là tập LVGL cho màn LCD của xiaozhi: ${gh('sandbox/sensor-panel')}.</p>
      </section>

      <section id="xz-bay" class="bay to"><h2>Bẫy</h2><ul>
        <li><b>Đừng mở cổng server ra Internet.</b> Firmware xiaozhi tự lấy token qua <code>/xiaozhi/ota/</code>, nên người lạ cũng lấy được. Thứ duy nhất chặn họ là danh sách MAC trong <code>ARES_DEVICES</code>, mà MAC thì giả được. Kết nối giữa chip và server (<code>ws://</code>) cũng không mã hoá. Chỉ chạy trong mạng nhà, không mở cổng (port-forward) trên router.</li>
        <li><b>Dùng key miễn phí thì Google được dùng dữ liệu</b> của bạn để cải thiện sản phẩm. Vì vậy đừng nối mail hay tài khoản công việc qua MCP khi đang dùng key miễn phí.</li>
        <li><b>IP server đổi</b> (router cấp IP mới) thì chip không tìm thấy server. Giữ IP cố định như bước 3.5, hoặc build lại firmware với IP mới.</li>
        <li><b>Mặt robot bị âm bản</b> khi tự viết code màn hình: thư viện màn hình của ESP-IDF bật điểm OLED ứng với màu <i>tối</i>, nên firmware vẽ mắt màu đen trên nền trắng. Muốn xem trước đúng như trên chip thì chạy bản giả lập với <code>--device</code>.</li>
        <li><b>Cáp USB chỉ sạc được</b>: cắm vào mà máy tính không thấy cổng serial thì đổi sang cáp có truyền data.</li>
      </ul></section>`,
  };
})();
