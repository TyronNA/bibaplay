// Bài 22.3 — Build firmware board ares-bread (xiaozhi-esp32 + firmware/), nạp lên mạch 12.5, cho chip vào Wi-Fi.
// Patch firmware/xiaozhi-ares.patch soạn trên xiaozhi-esp32 commit 64b57d0: upstream đổi thì setup.sh báo lỗi git apply.
// Chữ trên OLED lấy từ xiaozhi-esp32 main/assets/locales/vi-VN/language.json; MAC in lúc nạp là MAC Wi-Fi STA = Device-Id
// (system_info.cc đọc ESP_MAC_WIFI_STA). Chưa nạp lên chip thật khi soạn bài.
(function () {
  const T = K.term;
  BAI.dangKy({
    id: '22.3',
    muc_tieu: 'Build firmware xiaozhi có mặt robot (board riêng <code>ares-bread</code>), ghi sẵn địa chỉ server của bài 22.1, nạp lên mạch đã ráp ở bài 12.5, rồi cho chip vào Wi-Fi nhà. Bài soạn theo code, <b>chưa nạp thử lên chip thật</b>.',
    can: [K.can.esp(), K.can.usb(), { ten: 'Mạch xiaozhi đã ráp ở bài 12.5 (mic, ampli, OLED, nút)', tim: 'INMP441', lk: 'inmp441', sl: 1 }, { ten: 'Điện thoại (để cài Wi-Fi cho chip)', tim: 'điện thoại', sl: 1 }],
    kien_thuc: `
      <p><b>xiaozhi-esp32</b> là firmware mã nguồn mở cho trợ lý giọng nói, hỗ trợ sẵn rất nhiều board. Board <code>bread-compact-wifi</code> chính là kiểu ráp trên breadboard của bài 12.5.</p>
      <p>Repo này thêm một board riêng tên <code>ares-bread</code>: đi dây y hệt <code>bread-compact-wifi</code> bản OLED 128×64, thêm 3 thứ:</p>
      <ul><li>Mặt robot trên OLED (9 nét mặt, Gemini chọn nét mặt mỗi lượt trả lời).</li>
      <li>Tool bánh xe cho bài 17.2.</li>
      <li>Địa chỉ OTA trỏ về server của bạn, thay cho xiaozhi.me.</li></ul>
      <p>Đặt tên board riêng vì tính năng tự cập nhật (OTA) của xiaozhi chọn firmware theo tên board. Tên riêng thì không bao giờ bị firmware gốc đè lên.</p>
      <p><code>firmware/setup.sh</code> nối board riêng vào bản clone xiaozhi bằng symlink, rồi áp một patch nhỏ (thêm board vào danh sách build). Patch viết cho đúng một phiên bản xiaozhi. Bản mới đổi nhiều thì <code>git apply</code> báo lỗi: lùi về commit <code>64b57d0</code> là chạy.</p>
      ${K.nhoAI(`Đọc firmware/boards/ares-bread/README.md và firmware/setup.sh. IP server của tôi là
192.168.x.y. Giúp tôi clone xiaozhi-esp32 vào thư mục này, điền IP vào config.json,
chạy setup.sh rồi build board ares-bread (ESP-IDF ở ~/esp/esp-idf). Lỗi thì đọc log và sửa,
nhưng không sửa số chân trong config.h. Đừng nạp: tôi tự cắm board và nạp.`)}`,
    du_doan: '<p>Lúc nạp, máy in <code>Connected to ESP32-S3</code> và một dòng <code>MAC: …</code>: đó là MAC mà bài 22.4 cần. Lần đầu khởi động, chip chưa biết Wi-Fi nào nên phát Wi-Fi riêng tên <code>Xiaozhi-…</code> để bạn cài. Vào được Wi-Fi nhà xong, chip gọi server và <b>bị từ chối</b>, vì MAC chưa có trong <code>ARES_DEVICES</code>. Từ chối ở bước này là đúng, bài 22.4 sửa.</p>',
    phan: [
      {
        ten: 'Phần 1 · Build trên máy tính',
        gioi_thieu: 'Chưa cần cắm board. Dùng terminal đã bật ESP-IDF (bài 8.0: <code>. ~/esp/esp-idf/export.sh</code> hoặc <code>get_idf</code>).',
        buoc: [
          { ten: 'Tải xiaozhi-esp32', lam: ['Clone vào trong thư mục <code>bibaplay</code>. Repo đã để sẵn tên này trong <code>.gitignore</code>.'],
            hinh: T(['$ cd ~/bibaplay', '$ git clone https://github.com/78/xiaozhi-esp32']),
            kiem: { thay: 'Có thư mục <code>~/bibaplay/xiaozhi-esp32</code>.', neu_khong: '' } },
          { ten: 'Ghi IP server vào firmware', lam: ['Mở <code>firmware/boards/ares-bread/config.json</code>, thay chữ <code>SERVER_IP</code> bằng IP LAN đã ghi ở bài 22.1. Giữ nguyên <code>:8000/xiaozhi/ota/</code>.', 'Server sẽ chạy 24/7 trên máy khác (bài 22.5)? Ghi IP của máy đó luôn, đỡ phải build lại.'],
            hinh: T(['(firmware/boards/ares-bread/config.json)', '"CONFIG_OTA_URL=\\"http://192.168.x.y:8000/xiaozhi/ota/\\""']),
            kiem: { thay: 'Dòng <code>CONFIG_OTA_URL</code> có IP thật, không còn chữ <code>SERVER_IP</code>.', neu_khong: '' } },
          { ten: 'Gắn board riêng vào xiaozhi', lam: ['Chạy lại được nhiều lần. Mỗi lần <code>git pull</code> bản xiaozhi mới thì chạy lại.'],
            hinh: T(['$ firmware/setup.sh', 'đã áp patch', '', '(lỗi git apply? lùi xiaozhi về đúng bản patch đã viết)', '$ cd xiaozhi-esp32 && git checkout 64b57d0 && cd ..', '$ firmware/setup.sh']),
            kiem: { thay: '<code>đã áp patch</code> hoặc <code>patch đã áp sẵn</code>.', neu_khong: '<code>error: patch failed</code>: bản xiaozhi mới đã đổi đúng chỗ patch sửa. Lùi về <code>64b57d0</code> như trong hình.' } },
          { ten: 'Build', lam: ['<code>--language vi-VN</code>: chữ trên OLED và câu thông báo bằng tiếng Việt. Lần đầu build khá lâu (dịch cả thư viện âm thanh, giao diện).'],
            hinh: T(['$ cd ~/bibaplay/xiaozhi-esp32', '$ python3 scripts/build.py ares-bread --name ares-bread --language vi-VN', '…', 'Project build complete. To flash, run:']),
            kiem: { thay: '<code>Project build complete</code>.', neu_khong: 'Lỗi có nhắc tới phiên bản ESP-IDF: đang dùng bản cũ, kiểm <code>idf.py --version</code> phải là v6.1 (bài 8.0). Báo <code>Variant not found</code>: chưa chạy <code>setup.sh</code>.' } },
        ],
      },
      {
        ten: 'Phần 2 · Nạp lên chip',
        gioi_thieu: 'Dùng nguyên mạch của bài 12.5, không ráp thêm gì.',
        buoc: [
          { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Cáp USB <b>chưa cắm</b>. Như bước đo cuối của bài 12.5: núm <code>Ω 200k</code>, que đỏ thanh + (3V3), que đen thanh − (GND).'],
            kiem: { thay: 'Gần số đã ghi ở bài 12.5, <b>không dưới 100Ω</b>.', neu_khong: 'Gần 0: có dây chạm từ lần ráp trước. <b>Không cắm USB</b>, soát lại theo bài 12.5.' } },
          { ten: 'Cắm USB, tìm tên cổng', cap_dien: true, lam: ['Mac: <code>ls /dev/cu.usb*</code>. Linux: <code>ls /dev/ttyACM* /dev/ttyUSB*</code>. Windows: Device Manager → Ports.', 'Linux báo <code>Permission denied</code> khi nạp: thêm user vào nhóm <code>dialout</code> (<code>sudo usermod -a -G dialout $USER</code>), đăng xuất rồi đăng nhập lại.'],
            hinh: T(['$ ls /dev/cu.usb*', '/dev/cu.usbmodem1101']),
            kiem: { thay: 'Có 1 cổng mới xuất hiện khi cắm board.', neu_khong: 'Không có cổng nào: cáp chỉ sạc, đổi cáp (bài 8.1). Board nóng hoặc có mùi: rút USB ngay.' } },
          { ten: 'Nạp + xem log', lam: ['Thay tên cổng bằng cổng của bạn. Trong mấy dòng đầu, tìm dòng <code>MAC:</code> và chép vào bảng số đo: bài 22.4 cần đúng chuỗi này.', 'Xem log xong thì thoát bằng <kbd>Ctrl</kbd>+<kbd>]</kbd>. Board vẫn chạy.'],
            hinh: T(['$ idf.py -p /dev/cu.usbmodem1101 flash monitor', 'Connected to ESP32-S3 on /dev/cu.usbmodem1101:', 'Chip type:          ESP32-S3 (QFN56) …', 'MAC:                aa:bb:cc:dd:ee:ff', '…', 'Hash of data verified.', 'Hard resetting via RTS pin...']),
            kiem: { thay: 'Có <code>Hash of data verified</code>, chip khởi động lại, OLED sáng.', neu_khong: '<code>Failed to connect</code>: giữ nút <code>BOOT</code>, nhấn rồi thả <code>RST</code>, thả <code>BOOT</code>, nạp lại. OLED tối: soát dây OLED theo bài 12.1.' } },
          { ten: 'Cho chip vào Wi-Fi nhà', lam: ['Lần đầu, OLED hiện <i>Chế độ cấu hình Wi-Fi</i>, tên điểm phát sóng <code>Xiaozhi-…</code> và một URL cấu hình.', 'Điện thoại vào Wi-Fi <code>Xiaozhi-…</code>, mở trình duyệt vào đúng URL trên OLED. Chọn Wi-Fi nhà, gõ mật khẩu. Chip <b>chỉ bắt được Wi-Fi 2.4GHz</b>: router chia 2 tên (vd <code>…_5G</code>) thì chọn tên không có 5G.', 'Muốn cài lại Wi-Fi về sau: bấm nút <code>BOOT</code> ngay lúc chip đang khởi động.'],
            kiem: { thay: 'Chip khởi động lại, OLED hiện <i>Đã kết nối đến …</i> tên Wi-Fi nhà, rồi <i>Kiểm tra phiên bản mới thất bại, sẽ thử lại sau … giây</i>. Dòng thất bại này là <b>đúng</b> ở bước này: server chưa cho phép chip (bài 22.4).', neu_khong: 'Không thấy Wi-Fi <code>Xiaozhi-…</code>: rút USB cắm lại. Vào Wi-Fi nhà mãi không được: sai mật khẩu, hoặc đang chọn Wi-Fi 5GHz.' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Ghi lại', cot: ['Giá trị'], hang: [{ ten: 'Cổng serial', du_doan: ['/dev/cu.usbmodem…'] }, { ten: 'MAC của chip', du_doan: ['xx:xx:xx:xx:xx:xx'] }, { ten: 'IP server trong config.json', du_doan: ['192.168.x.y'] }] }],
    hoi: [
      ['Vì sao không dùng firmware dựng sẵn của xiaozhi rồi đổi server trong menu?', 'Được, với board gốc <code>bread-compact-wifi-128x64</code>: đổi <i>Default OTA URL</i> trong <code>idf.py menuconfig</code>. Nhưng sẽ không có mặt robot và tool bánh xe. Và OTA của xiaozhi có thể đè lên bằng bản gốc, vì cùng tên board.'],
      ['Router đổi IP của laptop chạy server. Chip ra sao?', 'Chip vẫn gọi IP cũ ghi trong firmware, nên không thấy server. Giữ IP cố định cho máy chạy server (bài 22.5), hoặc build lại với IP mới.'],
      ['Wi-Fi nhà chỉ có 5GHz. Có cách nào không?', 'ESP32-S3 chỉ có Wi-Fi 2.4GHz. Bật băng 2.4GHz trên router (hầu hết router đều có), hoặc dùng điện thoại phát Wi-Fi 2.4GHz.'],
    ],
    bay: ['Commit file <code>config.json</code> có IP thật lên GitHub công khai: lộ cấu trúc mạng nhà. Sửa ở máy, đừng commit.', 'Cắm USB lúc đang sửa dây: luôn rút USB rồi mới đụng vào breadboard.', 'Cài Wi-Fi bằng Wi-Fi 5GHz hoặc Wi-Fi khách: chip không vào được, hoặc vào được mà không thấy server (Wi-Fi khách thường chặn các máy thấy nhau).'],
    robot: ['Firmware này cũng là firmware của robot bánh xe ở bài 17.2: tool <code>self.robot.move</code> đã có sẵn, chỉ chờ nối motor.'],
  });
})();
