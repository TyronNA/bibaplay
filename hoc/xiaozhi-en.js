// Trang /en/xiaozhi/: bản tiếng Anh của xiaozhi.js — cùng nội dung, dịch tay. Sửa xiaozhi.js thì sửa cả file này.
// Chỉ trang này có bản tiếng Anh (chủ đề hẹp, người nước ngoài có tìm); phần còn lại của site là tiếng Việt.
(function () {
  const GH = 'https://github.com/TyronNA/bibaplay';
  const gh = (p, chu) => `<a href="${GH}/tree/main/${p}" target="_blank" rel="noopener">${chu || p} ↗</a>`;
  // thứ tự ô trong ảnh ghép = thứ tự EMO[] trong robot_face.c (lưới 3 cột)
  const CAM_XUC = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'sleepy', 'winking', 'confused'];
  const VI = ' <span class="mo">(Vietnamese)</span>';

  const SO_DO = `<svg class="xz-sodo" viewBox="0 0 780 230" role="img" aria-label="Data flow: the ESP32 streams speech over WebSocket to a server at home, the server talks to Gemini Live and sends speech and facial expression back to the chip">
    <defs><marker id="xz-mui" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="xz-mui"/></marker></defs>
    <g class="xz-hop"><rect x="10" y="40" width="200" height="150" rx="3"/><rect x="290" y="40" width="200" height="150" rx="3"/><rect x="570" y="40" width="200" height="150" rx="3"/></g>
    <g class="xz-ten"><text x="110" y="68">ESP32-S3 (robot)</text><text x="390" y="68">Server at home</text><text x="670" y="68">Gemini Live</text></g>
    <g class="xz-chu">
      <text x="110" y="96">INMP441 mic → Opus 16 kHz</text><text x="110" y="118">speaker ← MAX98357A</text><text x="110" y="140">OLED: robot face</text><text x="110" y="162">self-built xiaozhi firmware</text>
      <text x="390" y="96">Python · aiohttp</text><text x="390" y="118">Opus ↔ PCM</text><text x="390" y="140">holds the Gemini key</text><text x="390" y="162">MCP tools (optional)</text>
      <text x="670" y="96">listens, thinks, speaks</text><text x="670" y="118">in one model</text><text x="670" y="140">returns 24 kHz PCM</text><text x="670" y="162">calls set_emotion</text>
    </g>
    <g class="xz-day"><path d="M212 100H288" marker-end="url(#xz-mui)"/><path d="M288 140H212" marker-end="url(#xz-mui)"/><path d="M492 100H568" marker-end="url(#xz-mui)"/><path d="M568 140H492" marker-end="url(#xz-mui)"/></g>
    <g class="xz-nhan"><text x="250" y="30">WebSocket ws://</text><text x="250" y="214">same Wi-Fi network</text><text x="530" y="30">WebSocket wss://</text><text x="530" y="214">Internet · API key</text></g>
  </svg>`;

  const LENH = (s) => `<div class="cuon"><pre class="code">${s}</pre></div>`;

  window.XIAOZHI_EN = {
    tieuDe: 'Self-hosted xiaozhi AI robot: ESP32-S3 + Gemini Live, your own server · Bàn Ráp',
    moTa: 'A xiaozhi voice assistant on a breadboard: build the ESP32-S3 firmware yourself with a robot face on the OLED, and run your own server that talks to Gemini Live with a free API key, instead of xiaozhi.me.',
    html: (R, url) => `
      <section class="dau"><p class="eyebrow">Project · <a href="${R('xiaozhi')}" hreflang="vi" lang="vi">Tiếng Việt</a></p>
      <h1>Self-hosted xiaozhi AI robot</h1>
      <p class="lede">An ESP32-S3 with a microphone, speaker and OLED on a breadboard, holding a voice conversation through Gemini Live. The firmware is built from the <a href="https://github.com/78/xiaozhi-esp32" target="_blank" rel="noopener">xiaozhi-esp32 ↗</a> source. The server runs at home too, replacing the xiaozhi cloud, so you need neither prebuilt firmware nor a xiaozhi.me account.</p>
      <p class="xz-tt"><span class="pill ok">working</span> server talks to Gemini Live, using a Mac's mic and speaker as a fake chip
        <span class="pill kiem">built</span> firmware, robot face, sensor panel (running in a desktop simulator)
        <span class="pill canh">not yet</span> flashed to a real chip</p>
      <p class="mo">This page and the code were drafted by AI and have not run on real hardware yet. The rest of this site is a Vietnamese electronics course; lesson links below point to it. Code on ${gh('', 'github.com/TyronNA/bibaplay')}: ${gh('server')} (server), ${gh('firmware')} (custom board), ${gh('sandbox')} (display simulators). MIT license.</p>
      <nav class="khung to xz-ml" aria-label="Contents"><p><b>Follow in order</b>. No board yet? Step 3 still works: your computer plays the chip.</p><p>This page is the summary. The step-by-step lessons with sample terminal output are <a href="${R('bai/8.0')}">lesson 8.0</a> (install ESP-IDF) and <b>chapter 22</b>, <a href="${R('bai/22.1')}">22.1</a> to <a href="${R('bai/22.6')}">22.6</a>${VI}.</p><ol>
        <li><a href="#xz-luong">How it works</a>: how the chip, the server and Gemini talk</li>
        <li><a href="#xz-phan-cung">Wire the hardware</a>: links to lesson 12.5</li>
        <li><a href="#xz-host">Host the server at home</a>: step-by-step lesson, from a blank machine to running 24/7</li>
        <li><a href="#xz-firmware">Build and flash the firmware</a>: needs the server IP from step 3</li>
        <li><a href="#xz-noi">Connect the chip to the server</a>: allow the chip, say the first sentence</li>
        <li><a href="#xz-ai">Let Claude Code / Codex do it</a>: sample prompts for each step</li>
      </ol><p class="mo">Also: <a href="#xz-mat">robot face</a> · <a href="#xz-chay">drive by voice</a> · <a href="#xz-panel">sensor panel</a> · <a href="#xz-bay">traps</a></p></nav></section>

      <section id="xz-luong"><h2><span class="so">1</span> How it works</h2>
        <figure class="xz-hinh xz-hinh-so to"><div class="cuon">${SO_DO}</div>
        <figcaption>The chip never talks to Google directly; the Gemini key lives only on the server. At boot the chip calls <code>POST /xiaozhi/ota/</code> and the server answers with a WebSocket address and a token. The chip then streams speech in 60 ms Opus frames. The server decodes them to PCM, forwards them to Gemini, and re-encodes the 24 kHz reply for the speaker. Measured in testing: about 2.6 s from when you stop talking to when you hear the answer.</figcaption></figure>
        <p class="mo">So the order is: server first (step 3), firmware with the server address baked in (step 4), then plug in the chip (step 5).</p>
      </section>

      <section id="xz-phan-cung"><h2><span class="so">2</span> Wire the hardware</h2>
        <div class="khung to"><p>ESP32-S3 <b>N16R8</b> (with PSRAM, which the firmware needs), <a href="${R('linh-kien/inmp441')}">INMP441</a>${VI} mic, <a href="${R('linh-kien/max98357a')}">MAX98357A</a>${VI} amplifier + <a href="${R('linh-kien/loa')}">speaker</a>${VI}, <a href="${R('linh-kien/oled')}">0.96" 128×64 I2C OLED</a>${VI}, 3 buttons, a USB-C cable that carries data. Wiring is identical to xiaozhi's <code>bread-compact-wifi</code> board.</p>
        <p>Step-by-step breadboard pictures are in <a href="${R('bai/12.5')}">lesson 12.5</a>${VI}. After adding each module, measure the resistance between 3V3 and GND before plugging in USB: it must never read close to 0 Ω.</p></div>
      </section>

      <section id="xz-host"><h2><span class="so">3</span> Host the server at home · lesson</h2>
        <p class="mo">The server is light: the model runs at Google, the server only relays and transcodes audio. It just has to be <b>always on</b>, <b>on the same Wi-Fi as the robot</b>, with a fixed IP. No Python knowledge needed: you only paste commands into a terminal.</p>

        <h3>3.1 · Pick a machine</h3>
        <div class="cuon"><table class="xz-bang"><thead><tr><th>Where</th><th>Good for</th><th>Notes</th></tr></thead><tbody>
          <tr><td><b>Your everyday computer</b></td><td>Trying it out, first assembly</td><td>Computer off means the robot goes silent. Run on Mac and Ubuntu so far.</td></tr>
          <tr><td><b>A small 24/7 box at home</b><br><span class="mo">mini PC, Raspberry Pi, old laptop</span></td><td>Daily use: <span class="pill ok">recommended</span></td><td>On Linux with systemd, step 3.6 installs it as a service that starts by itself. Tested on Ubuntu, not yet on Raspberry Pi.</td></tr>
          <tr><td><b>VPS / cloud</b></td><td>Taking the robot outside your home</td><td><span class="pill xau">not yet</span>, see the <a href="#xz-bay">first trap</a>. Serverless (Cloudflare Workers, Lambda) doesn't fit: the server keeps a long-lived WebSocket and needs libopus.</td></tr>
        </tbody></table></div>
        <p class="mo">Steps 3.2–3.5 run on the machine that will host the server. Starting on your laptop to get familiar is fine; step 3.6 moves it to the 24/7 box.</p>

        <h3>3.2 · Get the code, install Python and libopus</h3>
        <div class="khung to"><p>Needs Python 3.10+ (check with <code>python3 --version</code>) and <b>libopus</b> for Opus encoding. Not using git? On the GitHub page click <i>Code → Download ZIP</i> and unzip it.</p></div>
        ${LENH(`git clone https://github.com/TyronNA/bibaplay && cd bibaplay/server
brew install opus                                     # macOS
sudo apt install python3-venv libopus0                # Ubuntu / Debian / Raspberry Pi OS
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`)}

        <h3>3.3 · Test run without a key (echo mode)</h3>
        <div class="khung to"><p>Without a Gemini key the server runs in <b>echo</b> mode: it listens to a full sentence and plays it back. Enough to check the whole path before involving Google.</p></div>
        ${LENH(`.venv/bin/python app.py
# expect:  OTA URL cho firmware: http://192.168.x.y:8000/xiaozhi/ota/
#          chế độ: ECHO (chưa có GEMINI_API_KEY)
# (the server logs in Vietnamese: "OTA URL for the firmware", "mode: ECHO (no GEMINI_API_KEY yet)")

# second terminal, also in server/: the computer plays the chip
.venv/bin/python fake_device.py                       # last line must be PASS`)}
        <p class="mo">Note the <code>192.168.x.y</code> address in the OTA URL line: that is the machine's LAN IP, step 4 needs it. Stop the server with <kbd>Ctrl</kbd>+<kbd>C</kbd>.</p>

        <h3>3.4 · Get a free Gemini key, run for real</h3>
        <div class="khung to"><p>Get a key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey ↗</a> with a Google account. The free tier includes Gemini Live with daily and per-minute limits that Google changes over time. The key is a password: don't paste it into group chats or commit it to GitHub.</p>
        <p><b>The default prompt makes the robot answer in Vietnamese.</b> For English, set <code>ARES_PROMPT</code>, for example <code>ARES_PROMPT="You are ARES, a small desk robot assistant. Always answer in short spoken English."</code></p></div>
        ${LENH(`GEMINI_API_KEY=paste-key-here .venv/bin/python app.py
# expect:  chế độ: Gemini Live (...)

# second terminal: send a recorded question, the answer is saved to reply.wav
.venv/bin/python fake_device.py --wav hoi-mau.wav

# on a Mac: talk through the Mac's mic + speaker
.venv/bin/pip install -r requirements-mac.txt && .venv/bin/python mac_device.py`)}
        <p class="mo">Optional: <code>GEMINI_VOICE</code> changes the voice, <code>~/.config/ares/mcp.json</code> adds MCP tools (calendar, notes…) for the robot. <code>mac_device.py</code> mutes the mic while the robot speaks, because a computer doesn't cancel speaker echo the way the chip does.</p>

        <h3>3.5 · Keep the IP fixed</h3>
        <div class="khung to"><p>The firmware hard-codes the server IP. If the router hands the machine a new IP, the chip can't find the server. Open your router's admin page (address and password are on the sticker underneath), find <b>DHCP reservation</b> / <i>Static lease</i>, pick the server machine and keep the IP you noted in step 3.3. Every router vendor names this differently.</p>
        <p>If the machine has a firewall, allow port <code>8000</code> on the LAN. A Mac asks the first time the server runs: choose <i>Allow</i>.</p></div>

        <h3>3.6 · Run 24/7 on a Linux box (mini PC, Pi)</h3>
        <div class="khung to"><p>From your laptop, <code>server/deploy.sh</code> copies the server to a Linux machine over SSH and installs a systemd service: it starts at boot and restarts on failure. The target needs: SSH login with a key, a user with passwordless <code>sudo</code>, and <code>python3-venv</code>, <code>libopus0</code> and <code>rsync</code> installed. Re-run the same command whenever you update the code.</p></div>
        ${LENH(`server/deploy.sh user@192.168.x.y                     # run on the laptop, inside bibaplay/
# must end with:  active

# on the target: put the key + chip MAC in this file (deploy.sh creates it, readable only by that user)
nano ~/.config/ares/gemini.env
sudo systemctl restart ares-server
journalctl -u ares-server -f                          # live log, Ctrl+C to quit`)}
        <p class="mo">Don't want passwordless sudo? Do it by hand: run steps 3.2–3.4 on that machine, then install the service from the template ${gh('server/ares-server.service', 'ares-server.service')}.</p>
        <p class="mo">Cost: free key plus a machine you already own is zero. When you outgrow the free tier, or want your data kept private, enable billing in Google AI Studio. The server logs audio minutes and tokens per turn to SQLite; <code>trace_report.py</code> estimates the bill.</p>
      </section>

      <section id="xz-firmware"><h2><span class="so">4</span> Build and flash the firmware</h2>
        <div class="khung to"><p>Needs <b>ESP-IDF v6.0.1 or newer</b> (v6.1 recommended; 5.x cannot build current xiaozhi). The custom board <code>ares-bread</code> is <code>bread-compact-wifi</code> 128×64 plus the robot face, wheel tools and your own server address. It has its own board name so xiaozhi's OTA update never overwrites it with the stock firmware.</p></div>
        ${LENH(`git clone https://github.com/TyronNA/bibaplay && cd bibaplay
git clone https://github.com/78/xiaozhi-esp32        # inside bibaplay/, gitignored
# set SERVER_IP in firmware/boards/ares-bread/config.json = server IP from step 3.3
firmware/setup.sh                                    # link the board into the clone + apply Kconfig/CMake patches
. $IDF_PATH/export.sh
cd xiaozhi-esp32 && python3 scripts/build.py ares-bread --name ares-bread --language en-US
idf.py -p /dev/cu.usbmodem… flash monitor            # Linux: /dev/ttyACM0, Windows: COM3…`)}
        <p class="mo">Don't need the robot face? Build the stock <code>bread-compact-wifi-128x64</code> board, then in <code>idf.py menuconfig</code> → <i>Xiaozhi Assistant</i> → <i>Default OTA URL</i> set <code>http://server-IP:8000/xiaozhi/ota/</code>. The patches target a specific xiaozhi-esp32 version; if upstream changes a lot, <code>setup.sh</code> fails at <code>git apply</code> and the patch needs updating.</p>
      </section>

      <section id="xz-noi"><h2><span class="so">5</span> Connect the chip to the server</h2>
        <div class="khung to"><p>The server only accepts chips whose MAC address (each Wi-Fi chip's unique ID) is in <code>ARES_DEVICES</code>. Don't know the MAC yet? Let the chip connect: the server rejects it and logs <code>từ chối Device-Id=aa:bb:…</code> ("rejected"). Copy that MAC in and restart the server. Several chips: separate with commas. Connections from the server machine itself (the fake chip in step 3) are always accepted.</p></div>
        ${LENH(`GEMINI_API_KEY=… ARES_DEVICES=aa:bb:cc:dd:ee:ff .venv/bin/python app.py   # run by hand
# as a service (3.6): add ARES_DEVICES=… to ~/.config/ares/gemini.env, then
sudo systemctl restart ares-server`)}
        <p class="mo">Once the log shows <code>OTA check device=…</code> and then <code>Gemini Live sẵn sàng</code> ("ready"), talk to the robot. Chip stuck on the connecting screen? Check that the IP in the firmware is right, that chip and server are on the same Wi-Fi (a router's guest network usually keeps devices from seeing each other), and that no firewall blocks port 8000.</p>
      </section>

      <section id="xz-ai"><h2><span class="so">6</span> Let Claude Code / Codex do it</h2>
        <div class="khung to"><p>Not at home with Linux, Python or ESP-IDF? Hand the typing to an AI assistant that runs in your terminal: <a href="https://docs.claude.com/en/docs/claude-code/overview" target="_blank" rel="noopener">Claude Code ↗</a> or <a href="https://github.com/openai/codex" target="_blank" rel="noopener">Codex CLI ↗</a> (install instructions on each project's page). It reads the code in the repo, runs commands, reads the errors and fixes them. Usage: download the repo, <code>cd bibaplay</code>, type <code>claude</code> or <code>codex</code>, then paste a prompt.</p>
        <p><b>Stay safe:</b> don't paste your Gemini key into the chat, type it into <code>gemini.env</code> yourself. Read every <code>sudo</code> command before allowing it. Don't let the AI open router ports to the Internet. Wiring still follows lesson 12.5 with the Ω check before power: an AI that misreads a pin burns real parts.</p></div>
        ${LENH(`# step 3: run the server on this machine
Read server/README.md and server/app.py. Help me install and run the server in echo mode on this machine,
then run fake_device.py and check it prints PASS. My machine is [macOS / Ubuntu / Raspberry Pi].
Ask me before every sudo command. At the end tell me the LAN IP the firmware needs.

# step 3.6: move it to the 24/7 box
I have a Linux machine at 192.168.x.y, SSH user ___. Read server/deploy.sh, check that machine meets
the requirements (python3-venv, libopus0, rsync, sudo), install what's missing, then run deploy.sh.
Don't touch the key: I'll paste it into ~/.config/ares/gemini.env myself.

# step 4: build the firmware
Read firmware/boards/ares-bread/README.md. The server IP is 192.168.x.y. Help me install ESP-IDF v6.1,
build the ares-bread board and flash the chip on USB. On errors read the log and fix them; don't change pins in config.h.

# step 5: it won't connect
Here are the server log and the chip's idf.py monitor log: [paste]. Why can't the chip reach the server?`)}
        <p class="mo">AI assistants get things wrong too. When it says it's done, check for yourself with the signs in this lesson: <code>PASS</code>, <code>chế độ: Gemini Live</code>, <code>active</code>, and the robot answering out loud.</p>
      </section>

      <section id="xz-mat"><h2>Robot face on a 128×64 OLED</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/robot-face/sheet.png')}" width="1176" height="600" loading="lazy" alt="9 robot facial expressions on a 128×64 OLED: ${CAM_XUC.join(', ')}">
        <figcaption>9 expressions, in order: ${CAM_XUC.map(e => `<code>${e}</code>`).join(' ')}. Drawn with LVGL (a GUI library for microcontrollers). The OLED only has pixels on or off, no grey. On every reply Gemini calls <code>set_emotion</code> to pick a face. The top 16 px stay xiaozhi's Wi-Fi status bar.</figcaption></figure>
        <p class="mo">The same C file runs in two places: inside the firmware, and in a desktop simulator window (SDL). So you can tune the face before you have a board: ${gh('sandbox/robot-face')}.</p>
      </section>

      <section id="xz-chay"><h2>Drive the robot by voice</h2>
        <p class="mo">The <code>ares-bread</code> firmware adds two on-chip tools: <code>self.robot.move</code> (direction, speed, duration) and <code>self.robot.stop</code>. When the chip connects, the server asks which tools it has and passes them to Gemini. Say "go forward for one second", Gemini calls the tool, the chip drives two motors through a DRV8833 and stops by itself. Speed is capped at 70% and each command at 3 seconds. Both limits live in the firmware, so a misheard command can't exceed them. Motor wiring and a wheels-off-the-table test: <a href="${R('bai/17.2')}">lesson 17.2</a>${VI}. <b>Not yet tested on a real chip.</b></p>
      </section>

      <section id="xz-panel"><h2>Sensor panel · LVGL exercise</h2>
        <figure class="xz-hinh to"><img src="${url('sandbox/sensor-panel/shot.png')}" width="800" height="480" loading="lazy" alt="800×480 screen showing temperature, CPU, GPU, RAM, disk, fan, network load and a clock, with a robot in the middle">
        <figcaption>An 800×480 screen showing computer stats (CPU, GPU, RAM, disk, fans, network), with a polygon robot and spinning fans. Screenshot from the Mac simulator with real sensor readings, no sudo needed; <code>--demo</code> uses fake numbers.</figcaption></figure>
        <p class="mo">The UI code is written to run on the ESP32-S3, differing only in display and touch init, but <b>has not run on a chip</b>. Running it for real also needs the computer to send numbers over USB or Wi-Fi, which isn't done yet. The point is LVGL practice for xiaozhi's LCD: ${gh('sandbox/sensor-panel')}.</p>
      </section>

      <section id="xz-bay" class="bay to"><h2>Traps</h2><ul>
        <li><b>Don't expose the server to the Internet.</b> xiaozhi firmware fetches its token from <code>/xiaozhi/ota/</code>, so a stranger can too. The only gate is the MAC list in <code>ARES_DEVICES</code>, and MACs can be spoofed. The chip-to-server link (<code>ws://</code>) is unencrypted as well. Keep it on your home network, no port-forwarding.</li>
        <li><b>On the free key, Google may use your data</b> to improve its products. Don't connect mail or work accounts over MCP while on the free tier.</li>
        <li><b>If the server's IP changes</b> (router hands out a new one), the chip can't find it. Keep it fixed as in step 3.5, or rebuild the firmware with the new one.</li>
        <li><b>Inverted robot face</b> when writing your own display code: ESP-IDF's panel driver lights OLED pixels for <i>dark</i> colours, so the firmware draws black eyes on white. Run the simulator with <code>--device</code> to preview exactly what the chip shows.</li>
        <li><b>Charge-only USB cable</b>: if the computer shows no serial port, switch to a cable that carries data.</li>
      </ul></section>`,
  };
})();
