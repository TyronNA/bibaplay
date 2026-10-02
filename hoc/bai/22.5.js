// Bài 22.5 — Server chạy 24/7 trên máy Linux trong nhà bằng server/deploy.sh (rsync + systemd ares-server).
// deploy.sh dùng sudo -n (không hỏi mật khẩu), tạo ~/.config/ares/gemini.env (600) nếu chưa có, in `systemctl is-active`.
// Đã chạy trên Ubuntu; chưa thử Raspberry Pi.
(function () {
  const T = K.term;
  BAI.dangKy({
    id: '22.5',
    muc_tieu: 'Chuyển server từ laptop sang một máy Linux nhỏ chạy 24/7 trong nhà (mini PC, Raspberry Pi, laptop cũ), cài thành dịch vụ: tự chạy khi bật máy, tự khởi động lại khi lỗi. Tắt laptop thì robot vẫn nói được.',
    nguon: 'Không cần board',
    can: [{ ten: 'Máy Linux bật 24/7 (mini PC, Raspberry Pi, laptop cũ cài Ubuntu)', tim: 'máy Linux', sl: 1 }, K.can.wifi()],
    kien_thuc: `
      <p>Server rất nhẹ: model chạy ở Google, server chỉ chuyển tiếng và giải/nén âm thanh. Máy cũ nhất trong nhà cũng đủ. Nó chỉ cần 3 thứ: <b>bật liên tục</b>, <b>cùng mạng với robot</b>, và <b>IP không đổi</b>.</p>
      <p><b>systemd</b> là phần quản lý dịch vụ của Linux. Cài server thành dịch vụ <code>ares-server</code> thì systemd lo: chạy khi máy khởi động, chạy lại sau 3 giây nếu server chết, ghi log vào <code>journalctl</code>.</p>
      <p><code>server/deploy.sh</code> chạy trên laptop, làm hết qua SSH: chép code sang <code>/opt/ares-server</code>, tạo môi trường Python, tạo sẵn file key trống, cài và khởi động dịch vụ. Sửa code xong chạy lại lệnh đó là cập nhật.</p>
      <p><b>IP cố định</b>: router cấp IP cho từng máy (DHCP), và có thể đổi sau khi khởi động lại. Firmware ghi cứng IP server, nên phải bảo router luôn cấp đúng một IP cho máy này. Mục này thường tên <i>DHCP reservation</i>, <i>Static lease</i>, hoặc <i>Gán IP tĩnh</i>, mỗi hãng router đặt một chỗ khác nhau.</p>
      <p>Không mở cổng router (port-forward) cho server. Robot mang ra khỏi nhà là chuyện khác, chưa nên làm (xem trang Robot AI).</p>
      ${K.nhoAI(`Tôi có máy Linux ở 192.168.x.y, SSH bằng user ___. Đọc server/deploy.sh, kiểm máy đó
đủ điều kiện chưa (python3-venv, libopus0, rsync, sudo không hỏi mật khẩu), chỉ tôi cài phần
còn thiếu, rồi chạy deploy.sh. Không đụng tới key: tôi tự dán vào ~/.config/ares/gemini.env.`)}`,
    du_doan: '<p><code>deploy.sh</code> in <code>active</code> ở cuối. Lúc đó server ở chế độ echo vì file key còn trống. Dán key, khởi động lại dịch vụ: log ra <code>chế độ: Gemini Live</code>. Rút điện máy, cắm lại: robot nói được mà không phải đụng gì.</p>',
    phan: [
      {
        ten: 'Phần 1 · Chuẩn bị máy 24/7',
        gioi_thieu: 'Các lệnh có <code>(máy 24/7)</code> gõ trên máy đó (bàn phím + màn hình, hoặc SSH). Còn lại gõ trên laptop.',
        buoc: [
          { ten: 'Cài gói cần thiết, xem IP', lam: ['Ubuntu/Debian/Raspberry Pi OS. <code>openssh-server</code> để laptop SSH vào được. <code>hostname -I</code> in IP của máy: chép lại.'],
            hinh: T(['(máy 24/7)', '$ sudo apt update', '$ sudo apt install python3-venv libopus0 rsync openssh-server', '$ hostname -I', '192.168.x.y']),
            kiem: { thay: 'Có IP dạng <code>192.168…</code>.', neu_khong: '' } },
          { ten: 'Giữ IP cố định trên router', lam: ['Vào trang quản lý router (địa chỉ và mật khẩu in trên nhãn dưới đáy router). Tìm mục <i>DHCP reservation</i> / <i>Static lease</i> / <i>Gán IP tĩnh</i>, chọn máy 24/7 (theo tên máy hoặc MAC), giữ đúng IP vừa chép.', 'Không vào được router (nhà thuê, router nhà mạng khoá): khởi động lại máy vài lần xem IP có giữ nguyên không. Đổi thì phải build lại firmware mỗi lần đổi.'],
            kiem: { thay: 'Router liệt kê máy 24/7 với IP cố định.', neu_khong: '' } },
          { ten: 'SSH từ laptop không cần mật khẩu', lam: ['Chưa có SSH key thì tạo (<code>ssh-keygen</code>, cứ Enter). <code>ssh-copy-id</code> chép key sang máy 24/7, hỏi mật khẩu một lần cuối.'],
            hinh: T(['$ ssh-keygen -t ed25519', '$ ssh-copy-id user@192.168.x.y', '$ ssh user@192.168.x.y true && echo ok', 'ok']),
            kiem: { thay: '<code>ok</code>, không hỏi mật khẩu.', neu_khong: '<code>Connection refused</code>: máy 24/7 chưa cài hoặc chưa bật <code>openssh-server</code>.' } },
          { ten: 'Cho sudo không hỏi mật khẩu', lam: ['<code>deploy.sh</code> chạy <code>sudo</code> qua SSH nên không gõ mật khẩu được. Dòng dưới cho user này dùng <code>sudo</code> không cần mật khẩu. Đổi <code>user</code> thành tên user thật.', 'Như vậy ai SSH được vào user này là có quyền root trên máy đó. Chỉ làm trên máy riêng trong nhà. Không muốn vậy thì xem bước cuối của phần 2.'],
            hinh: T(['(máy 24/7)', '$ echo "user ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/ares-deploy', '$ sudo chmod 440 /etc/sudoers.d/ares-deploy', '', '(laptop)', '$ ssh user@192.168.x.y "sudo -n true && echo ok"', 'ok']),
            kiem: { thay: '<code>ok</code>.', neu_khong: '<code>sudo: a password is required</code>: sai tên user trong dòng <code>echo</code>.' } },
        ],
      },
      {
        ten: 'Phần 2 · Cài dịch vụ',
        buoc: [
          { ten: 'Chạy deploy.sh', lam: ['Trên laptop, trong thư mục <code>bibaplay</code>. Lần đầu cài thư viện Python mất vài phút.', 'Tắt server đang chạy trên laptop (bài 22.2) cho khỏi nhầm hai server.'],
            hinh: T(['$ cd ~/bibaplay', '$ server/deploy.sh user@192.168.x.y', 'active', '… OTA URL cho firmware: http://192.168.x.y:8000/xiaozhi/ota/', '… chế độ: ECHO (chưa có GEMINI_API_KEY)']),
            kiem: { thay: '<code>active</code>, chế độ ECHO (file key còn trống).', neu_khong: '<code>sudo: a password is required</code>: làm lại bước cuối phần 1. <code>failed</code>: xem log bằng lệnh <code>journalctl</code> ở bước sau.' } },
          { ten: 'Dán key và MAC chip', lam: ['<code>deploy.sh</code> đã tạo sẵn file, chỉ user này đọc được. Điền 2 dòng như bài 22.2 và 22.4, lưu, khởi động lại dịch vụ.', '<code>journalctl -f</code> xem log trực tiếp, <kbd>Ctrl</kbd>+<kbd>C</kbd> để thoát.'],
            hinh: T(['(máy 24/7)', '$ nano ~/.config/ares/gemini.env', 'GEMINI_API_KEY=…', 'ARES_DEVICES=aa:bb:cc:dd:ee:ff', '$ sudo systemctl restart ares-server', '$ journalctl -u ares-server -n 5 --no-pager -o cat', 'chế độ: Gemini Live (…)', 'chip được phép: aa:bb:cc:dd:ee:ff']),
            kiem: { thay: '<code>chế độ: Gemini Live</code> và MAC chip trong danh sách.', neu_khong: '' } },
          { ten: 'Đổi IP trong firmware (nếu khác laptop)', lam: ['IP máy 24/7 khác IP laptop ghi ở bài 22.3: sửa <code>config.json</code>, build và nạp lại như bài 22.3 (phần 2 làm lại từ bước đo trước khi cắm USB). Wi-Fi đã cài thì chip vẫn nhớ.'],
            kiem: { thay: 'Chip khởi động, log máy 24/7 có <code>OTA check device=…</code> rồi <code>connect …</code>.', neu_khong: 'Không có dòng nào: chip vẫn đang gọi IP cũ, kiểm lại <code>config.json</code> và đã build lại chưa.' } },
          { ten: 'Thử mất điện', lam: ['Khởi động lại máy 24/7 (hoặc rút điện, cắm lại). Chờ máy lên, rồi bấm <code>BOOT</code> trên robot và nói.'],
            hinh: T(['(máy 24/7)', '$ sudo reboot', '… (chờ máy lên) …', '$ systemctl is-active ares-server', 'active']),
            kiem: { thay: '<code>active</code> mà không phải chạy lệnh gì, robot nói được.', neu_khong: 'Không active: <code>journalctl -u ares-server -b --no-pager</code> xem lỗi lúc khởi động. Robot không vào được: IP máy đã đổi, xem lại bước giữ IP cố định.' } },
          { ten: 'Không muốn sudo không mật khẩu', lam: ['Bỏ qua <code>deploy.sh</code>. Trên máy 24/7: làm bài 22.1 (phần 1) và 22.2 (phần 1) y như trên laptop. Rồi dùng file mẫu <code>server/ares-server.service</code>: thay <code>@USER@</code> và <code>@HOME@</code>, chép vào <code>/etc/systemd/system/</code>, chạy <code>sudo systemctl daemon-reload</code> rồi <code>sudo systemctl enable --now ares-server</code>. File mẫu chạy code ở <code>/opt/ares-server</code>, nên chép thư mục <code>server</code> tới đó.'],
            kiem: { thay: '<code>systemctl is-active ares-server</code> ra <code>active</code>.', neu_khong: '' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Máy 24/7', cot: ['Giá trị'], hang: [{ ten: 'IP cố định', du_doan: ['192.168.x.y'] }, { ten: 'Sau khởi động lại', du_doan: ['active'] }, { ten: 'Robot nói được sau mất điện', du_doan: ['có'] }] }],
    sau: `<h3>Cập nhật server</h3>
      <p>Trên laptop: <code>git pull</code> trong <code>bibaplay</code>, rồi chạy lại <code>server/deploy.sh user@192.168.x.y</code>. Lệnh chỉ chép phần đổi, cài lại thư viện nếu cần, khởi động lại dịch vụ. File key không bị đụng tới.</p>
      <h3>Xem tiền và lượt nói</h3>
      <p>Trên máy 24/7: <code>cd /opt/ares-server && .venv/bin/python trace_report.py</code> in chi phí theo ngày (ước tính nếu trả phí) và các phiên gần đây.</p>`,
    hoi: [
      ['Vì sao chạy server trên máy trong nhà chứ không thuê VPS?', 'Chip nói chuyện với server bằng <code>ws://</code> không mã hoá, và lớp chặn duy nhất là MAC (giả được). Trong mạng nhà thì người lạ không với tới. Đặt ngoài Internet thì ai cũng thử được, và xài key Gemini của bạn.'],
      ['Rút điện máy 24/7 rồi cắm lại, có phải SSH vào chạy lại server không?', 'Không. Dịch vụ đã <code>enable</code> nên systemd tự chạy lúc khởi động. Đó là việc của bước "Thử mất điện".'],
      ['Sửa <code>gemini.env</code> xong robot vẫn dùng key cũ. Quên gì?', '<code>sudo systemctl restart ares-server</code>. Dịch vụ chỉ đọc file lúc khởi động.'],
    ],
    bay: ['Để server cũ trên laptop vẫn chạy: hai server cùng nhận chip, rất khó đoán chip đang nói với cái nào. Tắt cái trên laptop.', 'Raspberry Pi chạy thẻ nhớ rẻ, mất điện liên tục: thẻ hỏng là mất cả hệ điều hành. Ghi sẵn các bước bài này để cài lại nhanh.', 'Mở cổng 8000 trên router để "xài ngoài đường": xem câu hỏi đầu tiên ở phần Tự kiểm.'],
    robot: ['Từ giờ robot luôn có "bộ não" chạy sẵn trong nhà. Bài 17.2 thêm bánh xe, server không phải đổi gì.'],
  });
})();
