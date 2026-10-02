// Bài 22.2 — Key Gemini miễn phí, server chạy thật, câu trả lời đầu tiên (fake_device --wav, mac_device). Không cần board.
// Key để trong ~/.config/ares/gemini.env: đúng file mà server/deploy.sh (bài 22.5) đọc, nên không phải chép key lần 2.
// Chưa chạy lại với key thật khi soạn bài (2026-10-02): các dòng log lấy từ code server/app.py, fake_device.py.
(function () {
  const T = K.term;
  BAI.dangKy({
    id: '22.2',
    muc_tieu: 'Lấy key Gemini miễn phí, chạy server với key, và nghe câu trả lời đầu tiên của robot. Chip vẫn là máy tính giả: gửi một câu hỏi thu sẵn, hoặc nói thẳng vào mic của Mac.',
    nguon: 'Không cần board',
    can: [K.can.wifi(), { ten: 'Tài khoản Google', tim: 'tài khoản Google', sl: 1 }],
    kien_thuc: `
      <p><b>Gemini Live</b> là model của Google nghe, nghĩ và nói trong cùng một lượt: nhận thẳng âm thanh, trả về âm thanh. Server chỉ chuyển tiếng qua lại và giải/nén Opus, nên chạy nhẹ trên máy yếu.</p>
      <p><b>API key</b> là chuỗi bí mật để Google biết ai đang dùng (và tính hạn mức cho ai). Ai có key là xài được hạn mức của bạn. Vì vậy key chỉ nằm trên server, không bao giờ nằm trong firmware: chip mà bị lấy mất thì key vẫn an toàn.</p>
      <p>Gói miễn phí giới hạn số lượt mỗi phút và mỗi ngày, và Google thay đổi mức này theo thời gian. Với gói miễn phí, Google được dùng dữ liệu để cải thiện sản phẩm: đừng nói chuyện riêng tư hay nối tài khoản công việc vào robot khi đang dùng key miễn phí.</p>
      <p>Bài này cất key vào file <code>~/.config/ares/gemini.env</code>, không gõ thẳng trên dòng lệnh. Gõ thẳng thì key nằm lại trong lịch sử terminal. Bài 22.5 cũng đọc đúng file này.</p>
      ${K.nhoAI(`Tôi đã tự dán key Gemini vào ~/.config/ares/gemini.env (đừng in nội dung file ra).
Đọc server/README.md, chạy server/app.py với biến môi trường lấy từ file đó, rồi chạy
fake_device.py --wav hoi-mau.wav ở terminal khác. Báo tôi log server có "Gemini Live sẵn sàng" không.`)}`,
    du_doan: '<p>Server in <code>chế độ: Gemini Live (…)</code>. Gửi câu hỏi thu sẵn (4.3 giây), khoảng 1–3 giây sau khi câu hỏi dứt thì có tiếng đầu tiên trả về. Câu trả lời lưu ra <code>reply.wav</code>, mở nghe được.</p>',
    phan: [
      {
        ten: 'Phần 1 · Key',
        buoc: [
          { ten: 'Tạo key ở Google AI Studio', lam: ['Mở <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey ↗</a>, đăng nhập Google, bấm nút tạo key mới. Google có thể đổi chữ trên nút, nhưng trang này luôn là trang quản lý key.', 'Chép key (chuỗi dài bắt đầu bằng chữ cái). Không dán lên nhóm chat, không chụp màn hình gửi ai.'],
            kiem: { thay: 'Có một chuỗi key trong clipboard.', neu_khong: 'Trang báo vùng của bạn không được hỗ trợ: đăng nhập tài khoản Google khác, hoặc đọc phần điều khoản ở trang đó.' } },
          { ten: 'Cất key vào file riêng', lam: ['Tạo thư mục và file, dán key vào sau dấu <code>=</code> (không có dấu cách, không có ngoặc kép). <code>chmod 600</code>: chỉ user của bạn đọc được file này.', 'Lưu file trong <code>nano</code>: <kbd>Ctrl</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd>, rồi <kbd>Ctrl</kbd>+<kbd>X</kbd>.'],
            hinh: T(['$ mkdir -p ~/.config/ares && chmod 700 ~/.config/ares', '$ nano ~/.config/ares/gemini.env', '', '(nội dung file)', 'GEMINI_API_KEY=dán-key-vào-đây', 'ARES_DEVICES=', '', '$ chmod 600 ~/.config/ares/gemini.env']),
            kiem: { thay: 'File có dòng <code>GEMINI_API_KEY=…</code>.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 2 · Câu trả lời đầu tiên',
        buoc: [
          { ten: 'Chạy server với key', lam: ['<code>set -a</code> … <code>set +a</code>: nạp mọi dòng trong file thành biến môi trường cho lệnh chạy sau đó. Key không hiện ra màn hình.'],
            hinh: T(['$ cd ~/bibaplay/server', '$ set -a; . ~/.config/ares/gemini.env; set +a', '$ .venv/bin/python app.py', '… OTA URL cho firmware: http://192.168.x.y:8000/xiaozhi/ota/', '… chế độ: Gemini Live (gemini-…-live)']),
            kiem: { thay: '<code>chế độ: Gemini Live</code>.', neu_khong: 'Vẫn ra <code>ECHO</code>: key chưa vào biến môi trường. Kiểm file có đúng chữ <code>GEMINI_API_KEY=</code>, và đã chạy dòng <code>set -a</code> trong <b>cùng terminal</b>.' } },
          { ten: 'Gửi câu hỏi thu sẵn', lam: ['Terminal 2. <code>hoi-mau.wav</code> là một câu hỏi thu sẵn có trong repo. Câu trả lời ghi ra <code>reply.wav</code>. Mac: <code>afplay reply.wav</code> để nghe. Linux: <code>aplay reply.wav</code>.', 'Dòng <code>tiếng đầu tiên sau … s</code> là <b>độ trễ</b>: từ lúc dứt câu hỏi tới lúc có tiếng trả lời. Ghi vào bảng.'],
            hinh: T(['$ cd ~/bibaplay/server', '$ .venv/bin/python fake_device.py --wav hoi-mau.wav', "hello <- {… 'sample_rate': 24000 …}", '  (tiếng đầu tiên sau … s kể từ lúc nói xong)', '…', 'câu trả lời: … s -> reply.wav', '$ afplay reply.wav']),
            kiem: { thay: 'Có dòng <code>câu trả lời: … s -> reply.wav</code> và nghe được câu trả lời. Log server có <code>Gemini Live sẵn sàng</code>.', neu_khong: 'Log server có <code>Gemini setup thất bại: …</code>: key sai, key bị thu hồi, hoặc hết hạn mức miễn phí. Đọc phần chữ sau dấu hai chấm. <code>sample_rate</code> ra 16000 thay vì 24000: server vẫn ở chế độ echo.' } },
          { ten: 'Nói bằng mic của Mac (tuỳ chọn)', lam: ['Chỉ Mac. Cài thêm thư viện thu/phát âm thanh rồi chạy <code>mac_device.py</code>: nói vào mic, robot trả lời qua loa. Lần đầu macOS hỏi quyền micro cho Terminal: phải cho phép, không thì mic chỉ thu im lặng.', 'Mic tự tắt lúc robot đang nói, vì máy tính không lọc được tiếng vọng từ loa như chip. Nên chưa ngắt lời robot được. Thoát: <kbd>Ctrl</kbd>+<kbd>C</kbd>.', 'Bỏ <code>--no-face</code> để mở cửa sổ mặt robot, cần build trước: <code>cd ~/bibaplay/sandbox/robot-face && make -j8 face</code>.'],
            hinh: T(['$ .venv/bin/pip install -r requirements-mac.txt', '$ .venv/bin/python mac_device.py --no-face']),
            kiem: { thay: 'Nói "xin chào", nghe robot trả lời.', neu_khong: 'Robot không nghe thấy gì: kiểm System Settings → Privacy & Security → Microphone, bật cho Terminal.' } },
        ],
      },
      {
        ten: 'Phần 3 · Đổi tính cách và giọng (tuỳ chọn)',
        buoc: [
          { ten: 'Thêm ARES_PROMPT, GEMINI_VOICE', lam: ['Thêm vào <code>gemini.env</code> rồi chạy lại server. <code>ARES_PROMPT</code> là lời dặn robot phải là ai, nói thế nào. <code>GEMINI_VOICE</code> là tên giọng của Gemini (mặc định <code>Kore</code>).', 'Prompt có dấu cách thì bọc trong ngoặc kép.'],
            hinh: T(['(thêm vào ~/.config/ares/gemini.env)', 'ARES_PROMPT="Bạn là ARES, robot nhỏ trên bàn học. Trả lời ngắn, vui, bằng tiếng Việt."', 'GEMINI_VOICE=Kore']),
            kiem: { thay: 'Chạy lại bước "Gửi câu hỏi thu sẵn", giọng hoặc cách nói đổi theo.', neu_khong: '' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Độ trễ', cot: ['Tiếng đầu tiên sau (s)', 'Câu trả lời dài (s)'], hang: [{ ten: 'Lần 1', du_doan: ['1–3', ''] }, { ten: 'Lần 2', du_doan: ['1–3', ''] }, { ten: 'Lần 3', du_doan: ['1–3', ''] }] }],
    sau: `<h3>Độ trễ nằm ở đâu</h3>
      <p>Phần lớn là Gemini chờ chắc chắn bạn đã dứt câu (nó cần nghe một khoảng lặng ngắn), rồi nghĩ. Đi qua server và Internet chỉ tốn vài chục tới vài trăm ms. Khi tác giả thử, từ lúc ngừng nói tới lúc nghe trả lời mất khoảng 2.6 giây.</p>
      <h3>Server tính tiền thế nào</h3>
      <p>Mỗi lượt, server ghi số phút âm thanh vào/ra và số token vào SQLite (<code>~/.local/share/ares/trace.db</code>). <code>.venv/bin/python trace_report.py</code> tóm tắt lại và ước tiền nếu bật trả phí. Gói miễn phí thì 0đ.</p>`,
    hoi: [
      ['Vì sao không ghi key vào firmware cho gọn, để chip gọi thẳng Gemini?', 'Firmware đọc ra được từ chip. Ai cầm chip là lấy được key. Để key trên server trong nhà thì chip chỉ biết đường tới server.'],
      ['<code>sample_rate</code> trong hello là 24000. Điều đó cho biết gì?', 'Server đang ở chế độ Gemini: Gemini trả tiếng 24 kHz. Chế độ echo trả 16000, đúng tần số chip gửi lên.'],
      ['Log ra <code>Gemini setup thất bại</code>, mạng vẫn ổn. Kiểm gì trước?', 'Key: đúng chưa, còn hiệu lực không, còn hạn mức miễn phí không (xem trên AI Studio). Server đã tới được Google, chỉ là Google từ chối.'],
    ],
    bay: ['Gõ key thẳng trên dòng lệnh (<code>GEMINI_API_KEY=… python app.py</code>): key nằm lại trong lịch sử terminal. Dùng file <code>gemini.env</code>.', 'Commit file có key lên GitHub: bot quét key công khai trong vài phút. Lỡ đẩy lên thì xoá key đó trên AI Studio ngay, tạo key mới.', 'Dùng key miễn phí rồi nối robot vào mail/lịch công việc qua MCP: Google được dùng dữ liệu đó.'],
    robot: ['Từ đây robot đã "biết nói". Bài 22.3 nạp firmware cho chip thật, bài 22.4 cho chip thay chỗ máy tính giả.'],
  });
})();
