// Bài 1.1 — Đo áp (đã xong; soạn lại để có hình). Pin: đỏ → T+, đen → B-.
(function () {
  const sd = SD;
  const soDo = sd.svg(300, 170, sd.pin(60, 70, '4.78V') + sd.day('60,70 60,30 200,30 200,69') + sd.dongHo(200, 85, 'V')
    + sd.day('200,101 200,140 60,140 60,80') + sd.chu(222, 60, 'que đỏ', 'sd-pos') + sd.chu(222, 124, 'que đen', 'sd-mo'),
  'Đồng hồ thang V chạm song song lên 2 cực pin');

  BAI.dangKy({
    id: '1.1',
    poster: [2, 5],
    muc_tieu: 'Đo áp một chiều (DCV) và đo thông mạch. Hai việc này dùng ở <b>mọi</b> bài sau: đo áp để so với số đã đoán, đo thông mạch để biết lỗ nào nối với lỗ nào.',
    can: [K.can.pin(), K.can.dh(), K.can.bb(), K.can.day(2)],
    kien_thuc: `
      <p>Áp là <b>chênh lệch</b> giữa 2 điểm, nên đo áp luôn chạm 2 que. Que đen (COM) là mốc 0, số hiện là áp que đỏ trừ áp que đen: đảo que thì ra số âm, không hỏng gì.</p>
      <p>Ở thang V, bên trong đồng hồ gần như hở mạch (~10MΩ) nên chạm đâu cũng an toàn. <b>Chỉ đúng khi que đỏ ở lỗ VΩ và núm ở DCV.</b> Núm ở mA/A mà chạm 2 cực pin là nối tắt (bài 1.2).</p>
      <p>Thang đo chọn lớn hơn số dự đoán: pin ~4.8V thì dùng <code>DCV 20</code>. Màn hiện <code>1</code> ở bên trái = quá thang, lên thang lớn hơn.</p>`,
    so_do: [{ nhan: 'ĐÚNG · song song', svg: soDo, chu: 'Đo áp: 2 que đặt song song với thứ cần đo.' }],
    du_doan: '<p>3 viên AAA mới: mỗi viên ~1.55–1.6V → hộp ≈ 4.7–4.8V. Pin gần hết: ~1.1V/viên → ~3.3V.</p>',
    sau: `<h3>Đồng hồ có "ăn" điện của mạch không?</h3>
      <p>Có, nhưng rất ít. Ở thang V, giữa 2 que là khoảng <b>10MΩ</b>. Đặt que lên một điểm là mắc thêm 10MΩ song song với phần mạch bên dưới điểm đó.</p>
      <p>Đo điểm giữa cầu 10k + 10k: phía dưới thành <code>10k ∥ 10M ≈ 9.99k</code>, áp đo lệch cỡ 0.03%, coi như không có. Đo cầu <b>1M + 1M</b>: phía dưới thành <code>1M ∥ 10M ≈ 909k</code>, nên
      <code>U = 4.78 × 909k / (1M + 909k) ≈ 2.28V</code> thay vì 2.39V, <b>thấp hơn 5%</b>. Quy tắc tay: điện trở của mạch ở chỗ đo nhỏ hơn 10MΩ cỡ 100 lần thì số đo tin được.</p>
      <h3>Đọc màn hình cho đúng</h3>
      <p>Thang DCV 20 hiện tối đa 19.99 và lẻ được 0.01V. Độ chính xác đồng hồ rẻ thường ghi cỡ <code>±(0.5% + 2 chữ số)</code>: số 4.78 thật ra nằm trong khoảng 4.78 ± (0.024 + 0.02) ≈ 4.74–4.82V. Vì vậy trong giáo trình, lệch dưới ~1% so với số đoán là "khớp".</p>`,
    hoi: [
      ['Pin đo ~4.78V mà núm để ở <code>DCV 2</code>. Màn hình hiện gì, và có hỏng gì không?', 'Hiện <code>1</code> ở bên trái: quá thang (thang 2 chỉ tới 1.999). Không hỏng; vặn lên DCV 20.'],
      ['Que đỏ chạm cực −, que đen chạm cực +. Màn hiện <code>-4.78</code>. Nghĩa là gì?', 'Đồng hồ hiện áp que đỏ trừ áp que đen. Que đỏ đang ở điểm thấp hơn 4.78V. Không hỏng gì, chỉ đổi dấu.'],
      ['Đo điểm giữa cầu 1M + 1M nối pin 4.78V bằng đồng hồ 10MΩ. Đoán số hiện ra.', 'Nửa dưới thành 1M ∥ 10M ≈ 909k → U ≈ 4.78 × 0.909 / 1.909 ≈ <b>2.28V</b>, thấp hơn 2.39V khoảng 5%, do đồng hồ lấy dòng.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Đo áp hộp pin',
        buoc: [
          K.buocPin(),
          {
            ten: 'Kiểm đồng hồ trước khi chạm vào pin', kiem_truoc: true,
            lam: ['Que đen cắm lỗ <code>COM</code>, que đỏ cắm lỗ <code>VΩ</code> (không phải lỗ mA hay 10A). Núm về <code>DCV 20</code>.'],
            board: { them: [K.dh('DCV 20', 'pin+', 'pin-', '0.00')] },
            kiem: { thay: 'Chưa lắp pin, 2 que chạm 2 tiếp điểm: màn hiện <code>0.00</code>.', neu_khong: 'Que đỏ đang ở lỗ mA/10A hoặc núm không ở DCV: sửa lại. <b>Không lắp pin</b> tới khi đúng.' },
          },
          K.lapPin('Lắp pin, đo áp 2 tiếp điểm', ['Lắp 3 viên pin. Que đỏ chạm tiếp điểm + (chỗ dây đỏ), que đen chạm tiếp điểm −.'],
            { them: [K.dh('DCV 20', 'pin+', 'pin-', '≈ 4.78')] },
            { thay: '≈ 4.7–4.8V với pin mới.', neu_khong: 'Dưới 4.2V: pin yếu, đo từng viên (mỗi viên ~1.5V). Số âm: 2 que đang đảo.' }),
          { ten: 'Đảo que', lam: ['Que đỏ chạm tiếp điểm −, que đen chạm tiếp điểm +.'], board: { them: [K.dh('DCV 20', 'pin-', 'pin+', '-4.78')] }, kiem: { thay: 'Cùng số nhưng có dấu trừ.', neu_khong: 'Khác số: que tì chưa chắc, chạm lại.' } },
          { ten: 'Đo trên thanh nguồn của breadboard', lam: ['Cắm 1 dây nhảy vào thanh + ở cột 10, 1 dây vào thanh − dưới ở cột 10. Chạm que đỏ vào đầu dây +, que đen vào đầu dây −.'], board: { them: [K.dh('DCV 20', 'T+:10', 'B-:10', '≈ 4.78')] }, kiem: { thay: 'Bằng số ở tiếp điểm hộp pin: thanh nguồn dẫn điện suốt chiều dài.', neu_khong: '0: board của bạn có thanh nguồn đứt ở giữa, đo lại ở cột gần dây pin hơn.' } },
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 2 · Đo thông mạch: lỗ nào nối lỗ nào',
        gioi_thieu: 'Không có pin. Đồng hồ tự phát một dòng nhỏ để dò.',
        buoc: [
          {
            ten: 'Chuyển sang thang thông mạch', kiem_truoc: true,
            lam: ['Tháo pin ra khỏi hộp (nếu còn). Núm về thang có hình <b>loa / diode</b>. Chạm 2 đầu que vào nhau: phải kêu bíp.'],
            board: { them: [K.dh('thông mạch', '5a', '5e', 'bíp')] },
            kiem: { thay: 'Chạm 2 que: kêu. Tách ra: màn hiện <code>1</code>.', neu_khong: 'Đồng hồ không có thang kêu: dùng <code>Ω 200</code>, chạm nhau ra gần 0.' },
          },
          { ten: 'Cùng cột, cùng nửa: 5a và 5e', lam: ['Cắm 2 dây nhảy vào lỗ 5a và 5e, chạm que vào đầu kim loại của 2 dây.'], board: { them: [K.dh('thông mạch', '5a', '5e', 'bíp')] }, kiem: { thay: 'Kêu: 5 lỗ a–e cùng cột nối với nhau (phần tô xanh).', neu_khong: 'Không kêu: dây cắm chưa sâu.' } },
          { ten: 'Khác cột: 5a và 6a', lam: ['Dời dây ở 5e sang 6a.'], board: { them: [K.dh('thông mạch', '5a', '6a', '1')] }, kiem: { thay: 'Không kêu: cùng hàng chữ nhưng khác cột là không nối (poster bài 1 vẽ sai chỗ này).', neu_khong: 'Kêu: dây đang chạm nhau ở ngoài.' } },
          { ten: 'Qua rãnh giữa: 5e và 5f', lam: ['Dây ở 5a và dây kia ở 5f.'], board: { them: [K.dh('thông mạch', '5e', '5f', '1')] }, kiem: { thay: 'Không kêu: rãnh giữa cắt đôi mỗi cột.', neu_khong: '' } },
        ],
      },
    ],
    bang_do: [
      { ten: 'Đo áp (DCV 20)', cot: ['Tiếp điểm hộp', 'Đảo que', 'Thanh nguồn'], hang: [{ ten: 'Số đo', du_doan: ['≈ 4.78', '≈ -4.78', '≈ 4.78'] }] },
      { ten: 'Thông mạch', cot: ['5a–5e', '5a–6a', '5e–5f'], hang: [{ ten: 'Kêu?', du_doan: ['kêu', 'không', 'không'] }] },
    ],
    bay: ['Núm ở mA/A hoặc que đỏ ở lỗ mA mà đo áp pin: nối tắt, cháy cầu chì đồng hồ.', 'Đo thông mạch trên mạch đang có pin: kết quả sai và có thể hỏng thang đo. Luôn tháo pin trước.'],
    robot: ['Đo áp pin robot để biết lúc nào phải sạc (bài 10.3 cho ESP32 tự đo).', 'Đo thông mạch sau khi hàn: chân nối đúng pad, 2 chân cạnh nhau không dính.'],
  });
})();
