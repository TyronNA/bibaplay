// Bài 18.3 — Máy trạng thái. Mạch như cuối 17.1; code viết lại hành vi né vật.
(function () {
  const sd = SD;
  const o = (x, y, t) => sd.hop(x, y, 74, 30, t);
  const may = sd.svg(380, 250, sd.mui
    + o(10, 20, 'CHỜ') + K.mt(84, 35, 116, 35) + sd.chu(86, 26, 'nhấn', 'sd-mo') + o(116, 20, 'SẮP CHẠY') + K.mt(190, 35, 222, 35) + sd.chu(194, 26, '2s', 'sd-mo') + o(222, 20, 'ĐI')
    + K.mt(259, 50, 259, 92) + sd.chu(264, 76, 'có vật', 'sd-mo') + o(222, 92, 'DỪNG') + K.mt(222, 107, 190, 107) + sd.chu(192, 98, '0.1s', 'sd-mo')
    + o(116, 92, 'LÙI') + K.mt(153, 122, 153, 160) + sd.chu(158, 146, '0.4s', 'sd-mo') + o(116, 160, 'QUAY')
    + sd.day('190,175 300,175 300,35') + K.mt(300, 35, 296, 35) + sd.chu(222, 192, '0.35s, hết vật → ĐI', 'sd-mo')
    + o(10, 160, 'PIN YẾU') + sd.chu(10, 212, 'từ bất kỳ đâu khi pin < 6.6V', 'sd-mo') + sd.chu(10, 232, 'lệnh X: về CHỜ', 'sd-mo'),
    'Máy trạng thái: CHỜ, nhấn công tắc sang SẮP CHẠY, 2 giây sau ĐI; có vật thì DỪNG, LÙI, QUAY rồi lại ĐI; pin yếu thì PIN YẾU');

  BAI.dangKy({
    id: '18.3',
    muc_tieu: 'Viết lại hành vi né vật của bài 17.1 thành máy trạng thái: robot luôn ở đúng một trạng thái (CHỜ, ĐI, DỪNG, LÙI, QUAY, PIN YẾU), và mỗi vòng 20ms chỉ xét có nên chuyển sang trạng thái khác không. Không còn đoạn code nào đứng chờ, nên đang lùi vẫn đọc được cảm biến và nhận được lệnh dừng.',
    nguon: 'USB (nạp) · pack 2S (chạy)',
    can: [K.can.robot17(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_18_3.c',
    kien_thuc: `
      <p>Code 17.1 né vật bằng một chuỗi lệnh: <code>dừng; chờ 0.1s; lùi; chờ 0.4s; quay; chờ 0.35s</code>. Suốt 0.85 giây đó chương trình đứng yên trong <code>cho_ms()</code>: không đọc cảm biến, không nghe lệnh. Robot đang lùi mà đụng tường phía sau thì cũng không biết.</p>
      <p>Máy trạng thái tách việc làm hai nửa. Nửa thứ nhất quyết định <b>chuyển</b>: đang ĐI mà thấy vật thì sang DỪNG, đang LÙI đủ 0.4s thì sang QUAY… "Chờ 0.4s" thành phép so <code>đã ở trạng thái này bao lâu &gt; 400ms</code>. Nửa thứ hai <b>ra lệnh</b> motor theo trạng thái hiện tại. Mỗi vòng chạy cả hai nửa rồi ngủ 20ms.</p>
      <p>Mỗi lần chuyển, robot gửi lên trạm một dòng như <code>S DI -&gt; DUNG (sieu am)</code>. Nhật ký này cho biết robot đã làm gì và <b>vì sao</b>, chuyện rất khó đoán nếu chỉ nhìn robot chạy.</p>
      <p>Robot không tự chạy khi vừa có điện. Nó chờ bạn nhấn công tắc va chạm (hoặc bấm nút CHAY trên trạm) rồi mới đi sau 2 giây, đủ để bạn rút tay ra. Lần tới nhấn công tắc là đang ở trạng thái ĐI, nên robot hiểu đó là va chạm.</p>`,
    so_do: [{ nhan: 'Các trạng thái', svg: may, chu: 'Mỗi mũi tên là một điều kiện xét trong mỗi vòng 20ms.' }],
    du_doan: '<p>Bánh trên không, nhấn công tắc: nhật ký in <code>CHO -&gt; SAP_CHAY</code>, 2 giây sau <code>SAP_CHAY -&gt; DI</code>, 2 bánh quay tiến. Tay trước siêu âm: <code>DI -&gt; DUNG (sieu am)</code>, <code>DUNG -&gt; LUI</code>, <code>LUI -&gt; QUAY</code>, rồi quay lại ĐI. Mỗi lần né, robot quay theo chiều ngược với lần trước. Bấm X: <code>-&gt; CHO</code>, bánh dừng ngay, dù đang lùi giữa chừng.</p>',
    sau: `<h3>Trạng thái + sự kiện = bảng</h3>
      <p>Mọi máy trạng thái viết được thành bảng: hàng là trạng thái, cột là sự kiện (có vật, hết giờ, nhấn, pin yếu, lệnh X), ô là trạng thái kế tiếp. Ô trống nghĩa là "đứng yên". Viết ra bảng rồi tìm ô bị bỏ sót, vd đang QUAY mà vẫn còn vật thì sao? Code chọn quay về DỪNG để lùi thêm lần nữa chứ không lao tới.</p>
      <h3>Vì sao cần cạnh xuống của công tắc</h3>
      <p>Mức công tắc là "đang nhấn", còn thứ cần bắt là "vừa nhấn". Nếu dùng mức, giữ tay 1 giây thì CHỜ → SẮP CHẠY ngay, rồi… vẫn đang nhấn. Code lưu mức của vòng trước, và chỉ coi là một lần nhấn khi vòng trước nhả mà vòng này nhấn.</p>
      <h3>Robot thật xếp máy trạng thái thành tầng</h3>
      <p>Robot hút bụi có một máy ở tầng trên (DỌN PHÒNG, VỀ ĐẾ, SẠC, LỖI), và mỗi trạng thái đó lại là một máy nhỏ hơn. ROS 2 Nav2 (bài 21.4) dùng cây hành vi (behavior tree), một cách xếp tầng khác nhưng chung ý tưởng.</p>`,
    hoi: [
      ['Đang ở LÙI được 0.2s thì bạn bấm X. Code 17.1 và code 18.3 phản ứng khác nhau thế nào?', 'Code 17.1 đang kẹt trong cho_ms(400), không nghe được lệnh nào, nên lùi nốt rồi mới xét. Code 18.3 đọc lệnh ngay ở vòng 20ms kế tiếp và sang CHỜ.'],
      ['"Chờ 0.4s" trong máy trạng thái được viết ra sao?', 'Lưu thời điểm vào trạng thái. Mỗi vòng so <code>bây giờ − lúc vào &gt; 400ms</code>, đúng thì chuyển.'],
      ['PIN YẾU không có mũi tên nào đi ra. Vì sao?', 'Pin đã dưới 3.3V/cell. Chạy tiếp là xả sâu cell. Robot đứng hẳn cho tới khi bạn rút P+ đi sạc, không cho một lệnh nào đánh thức nó.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nạp code, thử trạng thái bằng USB', cot: 63,
        gioi_thieu: 'Chưa có pack: motor không quay, chỉ xem nhật ký trạng thái.',
        buoc: [
          { ten: 'Robot như cuối 17.1, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB. Không thêm dây.'], board: { them: [...K.robot17(), K.espRobot()] }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          K.buocOmRobot(),
          K.camUsb('Cắm USB, nạp 18.3', ['menuconfig → Bai hoc → 18.3. Chạy trạm, <code>idf.py flash monitor</code>. Nhấn công tắc va chạm một lần, chờ 2 giây, rồi đưa tay trước siêu âm.'], {},
            { thay: 'Nhật ký trạm và monitor in đủ chuỗi CHO → SAP_CHAY → DI → DUNG → LUI → QUAY → DI. Bấm X: về CHO.', neu_khong: 'Nhấn công tắc không có gì: kiểm dây GPIO12 như 17.1. Nhật ký trống: trạm chưa thấy robot (bài 18.1).' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Chạy bằng pack, bánh trên không rồi xuống sàn', ke_thua: true,
        buoc: [
          K.camPack('Cắm P+, bánh trên không', ['Kê khung lên hộp cho 2 bánh quay tự do. Nhấn công tắc, rút tay, chờ 2 giây. Thử tay trước siêu âm, che FC-51, gạt công tắc lúc đang ĐI.'],
            { thay: 'Bánh quay tiến, gặp vật thì dừng, lùi, quay (lần sau quay ngược chiều lần trước), rồi tiến lại. Nhật ký in lý do từng lần.', neu_khong: 'Bánh quay khi đang CHỜ: rút P+ ngay, kiểm lại bài đã nạp đúng 18.3. Có gì nóng: rút P+.' }),
          { ten: 'Lệnh X giữa lúc lùi', cap_dien: true, lam: ['Che FC-51 cho robot bắt đầu lùi, rồi bấm nút <b>X dừng</b> trên trạm ngay.'], kiem: { thay: 'Bánh dừng ngay, nhật ký in <code>LUI -&gt; CHO (lenh X)</code>.', neu_khong: '' } },
          { ten: 'Thả xuống sàn', cap_dien: true, lam: ['Rút P+. Đặt robot trên sàn trống, xa cầu thang. Cắm P+, nhấn công tắc, rút tay. Muốn dừng: bấm X hoặc nhấc robot lên rút P+.'], kiem: { thay: 'Robot né như 17.1. Nhật ký cho biết từng lần né là do cảm biến nào.', neu_khong: '' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'Nhật ký khi thử (bánh trên không)', cot: ['Chuỗi trạng thái', 'Lý do in ra'], hang: [{ ten: 'Tay trước siêu âm', du_doan: ['DI→DUNG→LUI→QUAY→DI', 'sieu am'] }, { ten: 'Che FC-51', du_doan: ['như trên', 'hong ngoai'] }, { ten: 'X khi đang lùi', du_doan: ['LUI→CHO', 'lenh X'] }] }],
    bay: ['Dùng mức công tắc thay vì cạnh: giữ tay lâu là robot hiểu thành nhiều lần nhấn.', 'Quên trường hợp "đang quay mà vẫn còn vật": robot lao thẳng vào vật.', 'Để robot tự chạy ngay khi có điện: tay còn đang cầm P+ thì robot đã lao đi.'],
    robot: ['Mọi hành vi phức tạp hơn (bám vạch, đi phủ, về đế) đều là máy trạng thái xếp tầng. Bài 20.4 dùng lại đúng khuôn này.'],
  });
})();
