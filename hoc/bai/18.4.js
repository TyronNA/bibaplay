// Bài 18.4 — Lái từ máy tính + dừng khi mất kết nối. Mạch như cuối 17.1.
(function () {
  const sd = SD;
  const tl = sd.svg(380, 170, sd.mui
    + sd.day('20,60 360,60') + [0, 1, 2, 3, 4].map(i => K.mt(30 + i * 40, 30, 30 + i * 40, 56)).join('') + sd.chu(20, 22, 'lệnh B mỗi 100ms', 'sd-mo')
    + sd.chu(200, 50, '✕ mất kết nối', 'sd-chu') + `<rect x="190" y="70" width="100" height="16" class="sd-net sd-to" style="opacity:.4"/>` + sd.chu(196, 104, '0.5s không nghe gì', 'sd-mo')
    + sd.day('20,140 290,140') + sd.day('290,140 290,158 360,158') + sd.chu(20, 132, 'motor chạy', 'sd-mo') + sd.chu(300, 150, 'dừng', 'sd-mo'),
    'Trạm gửi lệnh mỗi 100ms; mất kết nối thì 0.5 giây sau robot tự dừng motor');

  BAI.dangKy({
    id: '18.4',
    muc_tieu: 'Giữ phím W A S D trên trạm để lái robot, và quan trọng hơn: robot tự dừng khi mất liên lạc. Robot không bao giờ được chạy tiếp theo lệnh cũ chỉ vì không nghe thấy lệnh mới.',
    nguon: 'USB (nạp) · pack 2S (chạy)',
    can: [K.can.robot17(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_18_4.c',
    kien_thuc: `
      <p>Đang giữ phím W thì trạm gửi <code>B 40 40</code> mỗi 100ms (duty trái, phải). Nhả phím thì gửi <code>B 0 0</code>. Nếu chỉ dựa vào đó, lúc gói <code>B 0 0</code> bị mất, hay WiFi rớt, hay máy tính treo, robot sẽ cứ thế chạy với lệnh cuối cùng nó nhận được.</p>
      <p>Cách chữa là <b>bộ đếm an toàn</b> (watchdog kiểu "người chết buông tay"): mỗi vòng robot xem đã bao lâu không nhận gói nào. Quá 500ms thì tự đặt duty về 0. Người lái phải liên tục nói "đi tiếp" thì robot mới đi tiếp. Gửi mỗi 100ms nghĩa là mất liền 4 gói robot vẫn chạy, mất gói thứ 5 thì dừng.</p>
      <p>Thêm một lớp nữa: có vật trước mặt (siêu âm &lt; 15cm, FC-51 hoặc cản va) thì code <b>bỏ phần đi tới</b> của lệnh, chỉ giữ phần quay. Bạn vẫn lùi hay quay ra được, nhưng không lái đâm vào tường được.</p>
      <p>Hai giới hạn này nằm trong firmware, sát motor. Trạm, trình duyệt, WiFi đều có thể hỏng. Chỉ code chạy ngay cạnh driver mới chắc chắn dừng được motor (cùng ý với 17.2).</p>`,
    so_do: [{ nhan: 'Mất kết nối', svg: tl, chu: 'Không có lệnh mới trong 0.5 giây thì robot tự dừng, không cần ai bảo.' }],
    du_doan: '<p>Giữ W: 2 bánh quay tiến, nhả là dừng. A/D: quay tại chỗ. Tay trước siêu âm rồi giữ W: bánh không tiến, giữ W + A thì vẫn quay. Giữ W rồi Ctrl+C tắt trạm: bánh dừng sau khoảng nửa giây, nhật ký trạm không kịp in gì (trạm đã tắt), còn đồ thị <code>im_ms</code> vọt lên nếu bạn chạy lại trạm.</p>',
    sau: `<h3>Chọn ngưỡng 500ms</h3>
      <p>Robot chạy 0.5m/s thì trong 500ms đi thêm 25cm trước khi tự dừng. Ngưỡng ngắn hơn thì dừng sớm hơn, nhưng WiFi nhà thường có những khoảng im 100–300ms (router bận, sóng yếu), và robot sẽ giật cục vì cứ dừng rồi chạy. Ngưỡng = 3–5 lần chu kỳ gửi là cách chọn thường gặp.</p>
      <h3>Vì sao trạm không được "giữ kết nối hộ"</h3>
      <p>Trạm tự gửi <code>H</code> mỗi 2 giây để robot nhớ địa chỉ (18.1). Nếu trạm gửi <code>H</code> mỗi 100ms, robot sẽ luôn thấy "có liên lạc" cả khi trình duyệt đã treo. Người đang lái mới là nguồn của lệnh, nên lệnh lái phải đi thẳng từ trình duyệt. Trạm chỉ chuyển tiếp.</p>
      <h3>Trộn tiến và quay</h3>
      <p>Trạm tính <code>trái = tiến − quay</code>, <code>phải = tiến + quay</code> với <code>quay = 0.6 × tốc độ</code>. Giữ W + A thì bánh trái chậm hơn, robot vẽ cung sang trái. Chặn phần tiến: <code>quay = (trái − phải)/2</code>, rồi ra <code>(quay, −quay)</code>, tức chỉ còn quay tại chỗ.</p>`,
    hoi: [
      ['Trạm gửi lệnh mỗi 100ms, ngưỡng 500ms. Mất liền bao nhiêu gói thì robot dừng?', 'Lần nhận cuối ở t = 0. Lệnh ở 100…400ms mất thì robot vẫn chạy. Tới 500ms vẫn không có gì thì dừng: tức mất liền <b>5</b> gói.'],
      ['Vì sao chặn tiến ở robot chứ không chặn trên trạm?', 'Trạm không thấy cảm biến ngay lúc đó (số liệu tới trễ, có khi mất). Code trên robot đọc cảm biến cùng vòng với lúc ra lệnh motor.'],
      ['Có vật trước mặt, bạn giữ S (lùi). Robot làm gì?', 'Lùi bình thường: t + p &lt; 0 nên không bị chặn. Chỉ phần đi tới mới bị bỏ.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nạp code (USB, không pack)', cot: 63,
        buoc: [
          { ten: 'Robot như cuối 17.1, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Không thêm dây.'], board: { them: [...K.robot17(), K.espRobot()] }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 18.4', ['menuconfig → Bai hoc → 18.4. <code>idf.py flash</code>. Nạp xong không cần monitor.'], {}, { thay: 'Nạp thành công.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Lái, bánh trên không', ke_thua: true,
        gioi_thieu: 'Chạy trạm trên máy tính, mở trang trạm và bấm vào trang cho nó nhận phím.',
        buoc: [
          K.camPack('Cắm P+, bánh trên không', ['Kê khung cho 2 bánh quay tự do. Chờ trạm thấy robot. Giữ W 2 giây, nhả. Giữ A, rồi D.'],
            { thay: 'W: 2 bánh quay tiến, nhả là dừng. A: bánh trái lùi, bánh phải tiến (duty chỉ 60% của W: bánh đứng yên thì kéo thanh tốc độ lên). Đồ thị dT, dP theo đúng phím.', neu_khong: 'Phím không có tác dụng: bấm vào trang trạm trước (ô lệnh đang giữ phím thì bấm ra ngoài). Một bánh quay ngược: đảo 2 dây motor đó như 17.1.' }),
          { ten: 'Chặn tiến khi có vật', cap_dien: true, lam: ['Để tay trước siêu âm ~10cm. Giữ W, rồi giữ W + A, rồi giữ S.'], kiem: { thay: 'W: bánh đứng. W + A: quay tại chỗ. S: lùi.', neu_khong: 'W vẫn tiến: đồ thị cm có ra ~10 không? Không thì kiểm siêu âm như 17.1.' } },
          { ten: 'Mất kết nối giữa chừng', cap_dien: true, lam: ['Giữ W cho bánh quay, tay kia bấm Ctrl+C tắt trạm trong Terminal. Vẫn giữ W.'], kiem: { thay: 'Bánh dừng sau khoảng nửa giây, dù phím W vẫn đang giữ.', neu_khong: '<b>Bánh không dừng: rút P+ ngay</b>, kiểm lại bài đã nạp có đúng 18.4 không.' } },
          { ten: 'Lái trên sàn', cap_dien: true, lam: ['Chạy lại trạm. Rút P+, đặt robot xuống sàn trống, cắm P+. Lái chậm (thanh tốc độ 30–40%).'], kiem: { thay: 'Robot đi theo phím, tự đứng lại trước tường.', neu_khong: '' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Thử an toàn', cot: ['Bánh làm gì', 'Sau bao lâu'], hang: [{ ten: 'Nhả W', du_doan: ['dừng', '< 0.1s'] }, { ten: 'Tắt trạm khi giữ W', du_doan: ['dừng', '≈ 0.5s'] }, { ten: 'Vật trước + W', du_doan: ['đứng yên', 'ngay'] }] }],
    bay: ['Robot chỉ dừng khi nhận được lệnh dừng: mất một gói là chạy mãi.', 'Trạm tự gửi "còn sống" thật dày thay cho người lái: trình duyệt treo mà robot vẫn chạy.', 'Lái lần đầu trên sàn ở tốc độ cao: robot phản ứng trễ 0.1–0.3s theo WiFi, dễ đâm.'],
    robot: ['Bài 20.3 dùng lại đúng hàm lái an toàn này để lái robot đi vẽ bản đồ. Chương 21: ROS 2 thay trạm gửi lệnh, cùng ngưỡng 500ms.'],
  });
})();
