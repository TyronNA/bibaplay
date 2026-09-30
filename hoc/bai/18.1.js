// Bài 18.1 — Số liệu qua WiFi. Mạch giữ nguyên như cuối 17.1; chỉ đổi code + thêm trạm trên máy tính.
(function () {
  const sd = SD;
  const luong = sd.svg(380, 200, sd.mui
    + sd.hop(10, 20, 100, 44, 'robot (ESP32)') + K.mt(110, 42, 158, 42) + sd.chu(114, 34, 'UDP 4210', 'sd-mo')
    + sd.hop(160, 20, 90, 44, 'router WiFi') + K.mt(250, 42, 278, 42)
    + sd.hop(280, 20, 90, 44, 'trạm (Python)') + K.mt(325, 64, 325, 112) + sd.hop(270, 114, 110, 40, 'trình duyệt')
    + sd.chu(10, 100, 'T pin=7810 cm=42 ir=0 va=0', 'sd-mo') + sd.chu(10, 120, '10 dòng mỗi giây, mỗi dòng ~40 byte', 'sd-mo')
    + K.mt(280, 56, 112, 56) + sd.chu(150, 76, '"H", lệnh (cổng 4211)', 'sd-mo'),
    'Robot gửi dòng số liệu qua router tới chương trình trạm trên máy tính, trạm vẽ lên trình duyệt; lệnh đi theo chiều ngược lại');
  const nen = [...K.robot17(), K.espRobot()];

  BAI.dangKy({
    id: '18.1',
    muc_tieu: 'Robot đang chạy trên sàn thì không cắm được cáp USB, nên cũng không đọc được số in ra. Bài này cho robot gửi số liệu cảm biến lên máy tính qua WiFi, 10 lần mỗi giây. Chương trình "trạm" trên máy tính vẽ các số đó thành đồ thị. Mọi bài Phần 4 sau đều dùng cách này để nhìn vào bên trong robot.',
    nguon: 'USB (nạp code) · pack 2S → LM2596 5V → board (chạy)',
    can: [K.can.robot17(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_18_1.c',
    code_may: 'sandbox/robot-may/tram.py',
    code_may_ghi: 'Trạm: chỉ cần Python 3 có sẵn, không cài thêm gì. Đi kèm tram.html (giao diện) và gia_robot.py (robot giả để thử)',
    kien_thuc: `
      <p><b>UDP</b> là cách gửi gói tin qua mạng không cần bắt tay: robot cứ gửi, gói nào tới thì tới, mất thì thôi. Với số liệu cảm biến, mất một gói không sao vì 0.1 giây sau đã có gói mới. Đổi lại, gửi UDP không bao giờ bắt robot đứng chờ. TCP thì khác: TCP gửi lại gói bị mất, và trong lúc gửi lại, vòng lặp của robot có thể bị kẹt vài trăm ms.</p>
      <p>Lúc mới bật, robot chưa biết máy tính của bạn ở đâu, nên gửi <b>quảng bá</b> (broadcast) tới cả mạng, cổng 4210. Trạm nhận được gói đầu tiên thì gửi lại chữ <code>H</code> tới cổng 4211 của robot. Từ lúc đó robot biết địa chỉ trạm và chỉ gửi thẳng tới đó.</p>
      <p>Mỗi gói là một dòng chữ, ví dụ <code>T t=12.3 pin=7810 cm=42 ir=0 va=0</code>. Chữ cái đầu cho biết loại dòng: <b>T</b> là số liệu (trạm vẽ mỗi khoá thành một đồ thị), <b>S</b> là sự kiện (hiện ở khung nhật ký), <b>R</b> là điểm radar (chương 20). Dòng chữ tốn chỗ hơn gửi số nhị phân, nhưng đọc được bằng mắt, và 10 dòng mỗi giây chỉ là vài trăm byte.</p>
      <p>Mạch điện giữ nguyên như cuối bài 17.1. Robot chỉ đứng yên gửi số, motor không chạy.</p>`,
    so_do: [{ nhan: 'Đường đi của số liệu', svg: luong, chu: 'Số liệu đi lên theo UDP, lệnh đi xuống cổng khác. Trạm chỉ mở trang web trên chính máy tính của bạn.' }],
    du_doan: `<p>Chạy bằng USB: trạm thấy robot. Đồ thị <code>pin</code> ≈ 0, vì pack chưa nối nên cầu đo pin không có áp. Đưa tay trước HC-SR04 thì <code>cm</code> giảm, che FC-51 thì <code>ir</code> lên 1, nhấn công tắc thì <code>va</code> lên 1.</p>
      <p>Rút USB rồi cắm pack: sau 3–5 giây (board khởi động và vào WiFi) đồ thị chạy tiếp, <code>pin</code> ≈ 7400–8400.</p>`,
    sau: `<h3>Băng thông cần bao nhiêu</h3>
      <p>Mỗi dòng ~40 byte, cộng ~28 byte đầu gói UDP/IP, tức ~70 byte. 10 dòng/giây là 700 byte/s ≈ 5.6 kbit/s. WiFi 2.4GHz chậm nhất cũng vài Mbit/s, nên còn dư hàng trăm lần. Chương 21 gửi LiDAR 13.5 kB/s, cũng vẫn dư.</p>
      <h3>Gói quảng bá đi chậm hơn</h3>
      <p>Router gửi gói quảng bá ở tốc độ thấp nhất để máy yếu sóng nhất cũng nhận được, và không gửi lại khi mất. Vì vậy robot chỉ quảng bá lúc chưa biết trạm, sau đó gửi thẳng. Một số router bật "cách ly máy khách" (client isolation, hay gặp ở WiFi khách): các máy cùng mạng không thấy nhau, và trạm sẽ không bao giờ thấy robot.</p>
      <h3>Vì sao trạm chào lại mỗi 2 giây</h3>
      <p>Robot khởi động lại (hết pin, nhấn RST) thì quên địa chỉ trạm. Trạm cứ 2 giây gửi <code>H</code> một lần để robot nhận lại địa chỉ. 2 giây là thưa hơn hẳn ngưỡng 0.5 giây của bài 18.4, nên <code>H</code> không thể giữ robot tiếp tục chạy khi người lái đã ngừng gửi lệnh.</p>`,
    hoi: [
      ['Vì sao chọn UDP chứ không phải TCP cho số liệu cảm biến?', 'Mất một gói không sao vì gói sau tới ngay. TCP gửi lại gói mất nên có lúc bắt chương trình đứng chờ, còn UDP không bao giờ chặn vòng lặp của robot.'],
      ['Chạy bằng USB, đồ thị pin ≈ 0. Có phải cầu đo pin hỏng?', 'Không. Pack chưa nối nên thanh + trên không có áp, cầu 20k/10k ra 0. Code coi dưới 1000mV là "đang chạy USB".'],
      ['Trạm không bao giờ thấy robot dù robot in "co IP". Nghi gì trước?', 'Robot và máy tính khác mạng (máy tính dùng WiFi 5GHz riêng hay mạng khách), hoặc router bật cách ly máy khách. Cho cả hai vào cùng một mạng 2.4GHz thường.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Chạy trạm với robot giả (chưa cần robot)', cot: 63,
        gioi_thieu: 'Làm quen trạm trước khi đụng vào robot thật.',
        buoc: [
          { ten: 'Tải trạm về máy tính', lam: ['Lấy 3 file <code>tram.py</code>, <code>tram.html</code>, <code>gia_robot.py</code> trong thư mục <code>sandbox/robot-may</code> ở mã nguồn trên GitHub (link ở chân trang), để chung một thư mục.', 'Mở Terminal ở thư mục đó, chạy <code>python3 tram.py --gia</code>, rồi mở trình duyệt vào <code>http://localhost:8008</code>.'],
            kiem: { thay: 'Góc trên ghi "robot 127.0.0.1". Khung Số liệu hiện các đồ thị x, y, th, cm. Bấm nút <b>VUONG 500</b>: tam giác đỏ vẽ một hình vuông.', neu_khong: 'Báo cổng 4210 đang bận: còn một trạm khác đang chạy, tắt nó đi (Ctrl+C).' } },
          { ten: 'Tắt robot giả', lam: ['Ctrl+C trong Terminal. Lần sau chạy <code>python3 tram.py</code> (không có <code>--gia</code>) để chờ robot thật.'] },
        ],
      },
      {
        ten: 'Phần 2 · Nạp code, chạy bằng USB (motor không có điện)', cot: 63,
        gioi_thieu: 'Hình chỉ vẽ breadboard của robot như cuối 17.1. Motor, công tắc va chạm, LM2596 nằm ngoài board, nối như cũ.',
        buoc: [
          { ten: 'Robot như cuối bài 17.1, P+ rút', kiem_truoc: true, lam: ['Không thêm dây nào. Rút P+ khỏi 44a, rút cáp USB. Kiểm lại từng dây theo hình (dây đỏ 44c → thanh + trên là chỗ cắm P+).'], board: { them: nen },
            kiem: { thay: 'Robot khớp hình, P+ và USB đều rút.', neu_khong: 'Thiếu dây nào thì làm lại bài 17.1 phần đó.' } },
          K.buocOmRobot(),
          { ten: 'Đặt tên WiFi + chọn bài', lam: ['<code>idf.py menuconfig</code> → <b>Robot (Phan 4)</b>: điền WiFi SSID và mật khẩu. Mạng phải là <b>2.4GHz</b> (ESP32-S3 không có 5GHz), và máy tính cũng vào đúng mạng đó. → <b>Bai hoc</b>: chọn 18.1.', 'Mật khẩu WiFi được lưu vào file cấu hình <code>sdkconfig</code> trên máy bạn. Đừng đưa file này lên mạng.'] },
          K.camUsb('Cắm USB, nạp 18.1', ['Terminal khác đang chạy <code>python3 tram.py</code>. Rồi <code>idf.py flash monitor</code>.'], {},
            { thay: 'Monitor in "WiFi: co IP …", rồi "(tram da ket noi)". Trạm hiện robot và 5 đồ thị: t, pin ≈ 0, cm, ir, va. Tay trước siêu âm: cm giảm. Che FC-51: ir = 1. Nhấn công tắc: va = 1.', neu_khong: '"15s chua vao duoc mang": sai tên/mật khẩu, hoặc mạng 5GHz. Có IP mà trạm không thấy: máy tính khác mạng, hoặc router cách ly máy khách (xem Đào sâu).' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 3 · Chạy bằng pack, xem qua WiFi', ke_thua: true,
        buoc: [
          K.camPack('Cắm P+ (không có USB)', ['Kê robot để bánh không chạm bàn, dù bài này motor không chạy. Tập thói quen cho các bài sau. Nhìn trạm.'],
            { thay: 'Sau 3–5 giây đồ thị chạy tiếp, pin ≈ 7400–8400. LM2596, driver không ấm.', neu_khong: 'Trạm không thấy lại robot: board chưa lên (đo 16b ≈ 5V). Có gì nóng: rút P+.' }),
          { ten: 'Làm mất gói thử', cap_dien: true, lam: ['Tắt WiFi của máy tính 5 giây rồi bật lại.'],
            kiem: { thay: 'Đồ thị đứng yên rồi chạy tiếp, trong khi robot vẫn chạy bình thường suốt lúc đó. Mất gói không làm robot kẹt.', neu_khong: 'Trạm không thấy lại robot sau 10 giây: tải lại trang, hoặc chạy lại trạm.' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Số trên trạm', cot: ['pin (mV)', 'cm (tay 10cm)', 'ir khi che'], hang: [{ ten: 'Chạy USB', du_doan: ['≈ 0', '≈ 10', '1'] }, { ten: 'Chạy pack', du_doan: ['7400–8400', '≈ 10', '1'] }] }],
    bay: ['WiFi 5GHz hoặc WiFi khách: robot có IP nhưng trạm không thấy.', 'Đưa file cấu hình có mật khẩu WiFi lên GitHub.', 'Cắm USB khi P+ đang nối: 2 nguồn đấu nhau trên chân 5V (17.1).', 'In số bằng printf trong vòng điều khiển để "xem cho tiện": xem bài 18.2 để biết giá phải trả.'],
    robot: ['Từ đây robot chạy trên sàn mà vẫn nhìn được bên trong. Bài 18.4 dùng đúng đường này theo chiều ngược lại để lái robot.'],
  });
})();
