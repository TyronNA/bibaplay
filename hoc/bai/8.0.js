// Bài 8.0 — Cài ESP-IDF v6.1 lên máy tính, build hello_world. Không cần board: bài 8.1 mới nạp lên chip.
// Lệnh lấy theo docs ESP-IDF v6.1 (docs/en/get-started/linux-macos-setup-legacy.rst, start-project.rst, eim-install-idf.rst).
// Cách git + install.sh (không dùng EIM) trên macOS/Linux: mọi bài sau đều gọi export.sh từ ~/esp/esp-idf.
(function () {
  const T = K.term;
  BAI.dangKy({
    id: '8.0',
    muc_tieu: 'Cài bộ công cụ build cho ESP32 (ESP-IDF v6.1) lên máy tính và build thử chương trình đầu tiên. Chưa cần board: build là việc của máy tính, bài 8.1 mới nạp lên chip. Mọi bài từ 8.1 trở đi đều cần bài này.',
    nguon: 'Không cần board',
    can: [{ ten: 'Máy tính macOS, Linux hoặc Windows, còn trống khoảng 6GB, có mạng', tim: 'máy tính', sl: 1 }],
    kien_thuc: `
      <p><b>ESP-IDF</b> là bộ công cụ chính thức của Espressif (hãng làm chip ESP32). Nó gồm trình biên dịch C cho chip, thư viện Wi-Fi/I2C/I2S…, và lệnh <code>idf.py</code> để build (dịch code thành file nạp được), nạp (<code>flash</code>) và xem chip in gì (<code>monitor</code>).</p>
      <p>Dùng <b>v6.1</b>: firmware xiaozhi ở chương 22 cần v6.0.1 trở lên, bản 5.x không build được. Code các bài trong repo đã build thử với v6.1.</p>
      <p>Cài xong, mỗi lần mở terminal mới phải chạy <code>. ~/esp/esp-idf/export.sh</code> để "bật" môi trường. Quên bước này thì máy báo <code>idf.py: command not found</code>. Không nên ghi lệnh đó vào file khởi động shell: Espressif khuyên không làm, vì nó bật môi trường Python của IDF cho mọi terminal.</p>
      <p>Bộ cài tải về khoảng 5–6GB (trình biên dịch, Python, mã nguồn), mạng chậm thì mất cả tiếng. Cứ để chạy.</p>
      ${K.nhoAI(`Giúp tôi cài ESP-IDF v6.1 cho chip esp32s3 theo cách git clone vào ~/esp/esp-idf
rồi ./install.sh esp32s3 (máy tôi là [macOS / Ubuntu]). Cài các gói nền còn thiếu,
hỏi tôi trước mỗi lệnh sudo. Xong thì build ví dụ hello_world cho esp32s3 để kiểm.`)}`,
    du_doan: '<p><code>idf.py --version</code> in ra <code>ESP-IDF v6.1</code>. Build hello_world lần đầu mất vài phút (dịch cả thư viện), lần sau chỉ vài giây vì chỉ dịch lại file đã sửa. Cuối cùng in <code>Project build complete. To flash, run:</code>.</p>',
    phan: [
      {
        ten: 'Phần 1 · macOS và Linux',
        gioi_thieu: 'Windows: bỏ qua phần này, sang phần 2.',
        buoc: [
          { ten: 'Cài các gói nền', lam: ['macOS: cài <a href="https://brew.sh" target="_blank" rel="noopener">Homebrew ↗</a> nếu chưa có, rồi chạy dòng <code>brew</code> trong hình.', 'Ubuntu/Debian (cả Raspberry Pi OS): chạy dòng <code>apt-get</code>. Máy hỏi mật khẩu là mật khẩu đăng nhập máy.', 'Kiểm Python: <code>python3 --version</code> phải từ 3.10 trở lên.'],
            hinh: T(['$ brew install cmake ninja dfu-util ccache python', '', '$ sudo apt-get install git wget flex bison gperf python3 python3-pip python3-venv \\', '    cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0', '', '$ python3 --version', 'Python 3.12.3']),
            kiem: { thay: 'Lệnh chạy xong không báo lỗi, Python ≥ 3.10.', neu_khong: 'brew/apt báo không tìm thấy gói: chạy <code>brew update</code> hoặc <code>sudo apt-get update</code> rồi thử lại.' } },
          { ten: 'Tải ESP-IDF v6.1', lam: ['Tải mã nguồn vào thư mục <code>~/esp/esp-idf</code>. <code>--recursive</code> kéo theo các thư viện con, thiếu nó thì build lỗi.'],
            hinh: T(['$ mkdir -p ~/esp && cd ~/esp', '$ git clone -b v6.1 --recursive https://github.com/espressif/esp-idf.git', 'Cloning into \'esp-idf\'...', '…', 'Submodule path \'components/…\': checked out …']),
            kiem: { thay: 'Có thư mục <code>~/esp/esp-idf</code>, không có dòng <code>fatal:</code>.', neu_khong: 'Đứt mạng giữa chừng: <code>cd ~/esp/esp-idf && git submodule update --init --recursive</code> để tải tiếp phần còn thiếu.' } },
          { ten: 'Cài công cụ cho ESP32-S3', lam: ['<code>install.sh esp32s3</code> chỉ tải trình biên dịch cho dòng chip mình dùng, đỡ tốn chỗ hơn cài cho mọi chip.'],
            hinh: T(['$ cd ~/esp/esp-idf', '$ ./install.sh esp32s3', 'Installing ESP-IDF tools', '…', 'Installing Python environment and packages', '…', 'All done! You can now run:', '', '  . ~/esp/esp-idf/export.sh']),
            kiem: { thay: 'Dòng cuối <code>All done! You can now run:</code>.', neu_khong: 'Lỗi Python: kiểm lại Python ≥ 3.10 ở bước 1. Lỗi tải: chạy lại <code>./install.sh esp32s3</code>, nó tải tiếp chứ không làm lại từ đầu.' } },
          { ten: 'Bật môi trường, kiểm phiên bản', lam: ['Chạy <code>. ~/esp/esp-idf/export.sh</code> (có dấu chấm và dấu cách ở đầu). Lệnh này chỉ có tác dụng trong terminal đang mở.', 'Cho đỡ gõ: thêm dòng <code>alias get_idf=\'. $HOME/esp/esp-idf/export.sh\'</code> vào <code>~/.zshrc</code> (Mac) hoặc <code>~/.bashrc</code> (Linux). Mở terminal mới thì gõ <code>get_idf</code>.'],
            hinh: T(['$ . ~/esp/esp-idf/export.sh', '…', 'Done! You can now compile ESP-IDF projects.', '$ idf.py --version', 'ESP-IDF v6.1']),
            kiem: { thay: '<code>ESP-IDF v6.1</code>.', neu_khong: '<code>command not found</code>: chưa chạy export.sh trong terminal này. Ra số khác 6.1: đang có bản ESP-IDF cũ ở chỗ khác, kiểm <code>echo $IDF_PATH</code> phải là <code>~/esp/esp-idf</code>.' } },
        ],
      },
      {
        ten: 'Phần 2 · Windows',
        gioi_thieu: 'Trên Windows, Espressif khuyên dùng bộ cài có giao diện (EIM). Các bài sau ghi lệnh kiểu Mac/Linux; trên Windows gõ y như vậy trong cửa sổ IDF Terminal, chỉ đổi tên cổng (COM3… thay cho /dev/cu.usbmodem…).',
        buoc: [
          { ten: 'Cài bằng ESP-IDF Installation Manager', lam: ['Tải bộ cài ở <a href="https://dl.espressif.com/dl/eim/" target="_blank" rel="noopener">dl.espressif.com/dl/eim ↗</a> (bản GUI, online). Mở lên, <i>New Installation</i> → <i>Start Installation</i>.', 'Chọn <i>Custom Installation</i> để chọn đúng phiên bản <b>v6.1</b> (<i>Easy Installation</i> cài bản mới nhất, có thể khác v6.1). Bấm <i>Start Installation</i>, đợi tới trang <i>Installation Complete</i>.'],
            kiem: { thay: 'Trang <i>Installation Complete</i>.', neu_khong: 'Lỗi: bấm <i>Logs</i> ở cuối cửa sổ xem chi tiết, sửa rồi <i>Try Again</i>.' } },
          { ten: 'Mở IDF Terminal', lam: ['Mở lại EIM → <i>Manage Installations</i> → <i>Open Dashboard</i> → chọn v6.1 → <i>Open IDF Terminal</i>. Cửa sổ này đã bật sẵn môi trường. Gõ <code>idf.py --version</code>.'],
            hinh: T(['$ idf.py --version', 'ESP-IDF v6.1']),
            kiem: { thay: '<code>ESP-IDF v6.1</code>.', neu_khong: 'Gõ trong cửa sổ PowerShell thường thì không chạy được: phải mở từ <i>Open IDF Terminal</i>.' } },
        ],
      },
      {
        ten: 'Phần 3 · Build chương trình đầu tiên',
        gioi_thieu: 'Mọi máy đều làm phần này, trong terminal đã bật môi trường (phần 1 bước 4, hoặc IDF Terminal trên Windows).',
        buoc: [
          { ten: 'Build hello_world', lam: ['Chép ví dụ có sẵn ra chỗ riêng (không sửa thẳng trong <code>esp-idf/</code>). <code>set-target esp32s3</code> báo cho IDF biết dòng chip, vì mỗi dòng chip dùng trình biên dịch khác nhau.'],
            hinh: T(['$ cp -r $IDF_PATH/examples/get-started/hello_world ~/esp/', '$ cd ~/esp/hello_world', '$ idf.py set-target esp32s3', '$ idf.py build', '…', 'Project build complete. To flash, run:', ' idf.py flash']),
            kiem: { thay: '<code>Project build complete</code>.', neu_khong: 'Lỗi build ngay ví dụ có sẵn thì lỗi nằm ở bản cài, không ở code: chạy lại <code>./install.sh esp32s3</code>.' } },
          { ten: 'Tải repo bài học, build code các bài', lam: ['Code của mọi bài ESP32 nằm trong một project, chọn bài bằng <code>idf.py menuconfig</code> (bài 8.1 sẽ làm). Build một lần để chắc máy đã sẵn sàng. Repo đã đặt sẵn chip esp32s3, không cần <code>set-target</code>.'],
            hinh: T(['$ cd ~ && git clone https://github.com/TyronNA/bibaplay', '$ cd bibaplay/sandbox/esp32-bai', '$ idf.py build', '…', 'Project build complete. To flash, run:']),
            kiem: { thay: '<code>Project build complete</code>.', neu_khong: 'Không có git: tải ZIP trên trang GitHub (<i>Code → Download ZIP</i>) rồi giải nén.' } },
        ],
      },
    ],
    hoi: [
      ['Mở terminal mới gõ <code>idf.py build</code> thì báo <code>command not found</code>. Vì sao?', 'Chưa bật môi trường trong terminal này: chạy <code>. ~/esp/esp-idf/export.sh</code> (hoặc <code>get_idf</code>).'],
      ['Vì sao build lần đầu lâu, lần sau nhanh?', 'Lần đầu phải dịch cả thư viện của ESP-IDF (Wi-Fi, FreeRTOS…). Các lần sau chỉ dịch lại file đã đổi.'],
      ['Build xong thì chip đã có chương trình chưa?', 'Chưa. Build chỉ tạo file <code>.bin</code> trên máy tính. Phải <code>idf.py flash</code> qua cáp USB thì chip mới có (bài 8.1).'],
    ],
    bay: ['Cài ESP-IDF 5.x theo một hướng dẫn cũ trên mạng: build bài thường được, nhưng tới chương 22 firmware xiaozhi báo lỗi. Dùng v6.1 ngay từ đầu.', 'Đường dẫn có dấu cách hoặc chữ có dấu (vd <code>Tài liệu</code>): một số công cụ build lỗi. Để ở <code>~/esp</code>.', 'Ghi <code>export.sh</code> vào file khởi động shell: terminal nào cũng chạy Python của IDF, làm lệch các dự án Python khác (như server ở chương 22).'],
    robot: ['Mọi firmware từ đây tới robot đều build bằng đúng bộ này: bài ESP32, xiaozhi (chương 22), robot (Phần 3, 4).'],
  });
})();
