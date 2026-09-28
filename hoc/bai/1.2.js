// Bài 1.2 — Đo dòng. Pin: dây đỏ vào thanh + trên (T+), dây đen vào thanh − dưới (B-).
(function () {
  const PIN_RONG = { id: 'pin', loai: 'pin', cong: 'T+:1', tru: 'B-:1', trang_thai: 'rong' };
  const sd = SD;
  const soDoDung = sd.svg(300, 215, sd.pin(50, 110, '4.78V')
    + sd.day('50,110 50,40 80,40') + sd.troNgang(80, 40, 70, '220Ω') + sd.day('150,40 184,40')
    + sd.dongHo(200, 40, 'mA') + sd.chu(178, 72, 'đỏ', 'sd-pos', 'middle') + sd.chu(222, 72, 'đen', 'sd-mo', 'middle')
    + sd.day('216,40 260,40 260,62') + sd.led(260, 62) + sd.day('260,102 260,190 50,190 50,120'),
    'Đúng: đồng hồ ở thang mA nằm nối tiếp giữa điện trở và LED');
  const soDoSai = sd.svg(330, 215, sd.pin(50, 110)
    + sd.day('50,110 50,40 160,40 160,62', true) + sd.dongHo(160, 78, 'mA') + sd.day('160,94 160,190 50,190 50,120', true)
    + sd.chu(186, 74, 'đồng hồ mA ≈ vài Ω', 'sd-xau') + sd.chu(186, 92, '→ nối tắt pin', 'sd-xau'),
    'Sai: đồng hồ ở thang mA chạm thẳng hai cực pin');

  BAI.dangKy({
    id: '1.2',
    poster: [3, 6, 7],
    muc_tieu: 'Đo dòng chạy trong mạch LED bằng đồng hồ, rồi so với số tính bằng định luật Ohm. Bài này chủ yếu tập <b>cách cắm đồng hồ ở chế độ đo dòng mà không nối tắt pin</b>.',
    can: [
      { ten: 'Điện trở 220Ω', tim: 'Điện trở 1/4W', sl: 1 },
      { ten: 'LED đỏ 5mm', tim: 'LED 5mm', sl: 1 },
      { ten: 'Dây nhảy đực–đực', tim: 'Dây nhảy', sl: 5 },
      { ten: 'Breadboard MB-102', tim: 'MB-102', sl: 1 },
      { ten: 'Hộp pin 3×AAA + 3 viên AAA', tim: 'hộp pin', sl: 1 },
      { ten: 'Đồng hồ vạn năng', tim: 'đồng hồ vạn năng', sl: 1 },
      { ten: 'Kẹp cá sấu', tim: 'kẹp cá sấu', sl: 2 },
    ],
    kien_thuc: `
      <p><b>Đo áp</b> là so 2 điểm, nên chạm que <b>song song</b> lên linh kiện. Ở chế độ V, bên trong đồng hồ gần như hở mạch (cỡ 10MΩ), nên chạm đâu cũng không sao.</p>
      <p><b>Đo dòng</b> là bắt dòng chạy <b>xuyên qua</b> đồng hồ, nên phải mở mạch ra một chỗ và đặt đồng hồ vào chỗ hở, tức <b>nối tiếp</b>. Ở chế độ mA, bên trong đồng hồ gần như một sợi dây (vài Ω).</p>
      <p>Vì thế đồng hồ đang ở chế độ mA mà chạm thẳng 2 cực pin là <b>nối tắt pin qua đồng hồ</b>: cháy cầu chì trong đồng hồ, có khi hỏng luôn thang đo.</p>
      <p>Lỗ cắm que đỏ khác nhau tuỳ đồng hồ. Nhìn mặt đồng hồ của bạn: có lỗ riêng ghi <code>mA</code> thì chuyển que đỏ sang đó; lỗ đỏ ghi chung <code>VΩmA</code> thì giữ nguyên, chỉ vặn núm. <b>Không dùng lỗ 10A</b> cho bài này.</p>`,
    so_do: [
      { nhan: 'ĐÚNG · nối tiếp', svg: soDoDung, chu: 'Dòng đi từ + qua 220Ω, vào que đỏ, qua đồng hồ, ra que đen, qua LED về −.' },
      { nhan: 'SAI · chạm 2 cực pin', xau: true, svg: soDoSai, chu: 'Không có gì cản dòng ngoài vài ôm bên trong đồng hồ.' },
    ],
    du_doan: `<p><code>I = (U − U_LED) / R = (4.78 − 2.0) / 220 ≈ 12.6 mA</code>. Số này khớp với số đã suy ra ở bài 2.3 lúc biến trở vặn về 0.</p>
      <p>Đồng hồ chèn vào có thêm vài ôm, nên số đo có thể thấp hơn một chút, nhưng không đáng kể so với 220Ω.</p>`,
    sau: `<h3>Bên trong thang mA là một điện trở nhỏ</h3>
      <p>Đồng hồ không "đếm" dòng trực tiếp. Ở thang mA, dòng chạy qua một <b>điện trở shunt</b> rất nhỏ bên trong, đồng hồ đo áp trên shunt rồi chia cho R: <code>I = U_shunt / R_shunt</code>. Thang 20mA thường có shunt cỡ 10Ω, thang 200mA cỡ 1Ω (tuỳ máy).</p>
      <p>Shunt cũng là một điện trở nối tiếp trong mạch, nên chèn đồng hồ vào làm dòng giảm một chút. Với shunt 10Ω: <code>I = (4.78 − 2.0) / (220 + 10) ≈ 12.1mA</code> thay vì 12.6mA, <b>thấp hơn ~4%</b>. Áp mất trên shunt (≈ 0.12V) gọi là áp gánh (burden voltage). Mạch dòng lớn điện áp thấp thì áp gánh này đáng kể; lên thang lớn hơn thì shunt nhỏ hơn, lệch ít hơn nhưng lẻ ít số hơn.</p>
      <h3>Vì sao chạm thẳng pin thì cháy cầu chì</h3>
      <p>Qua thang 200mA: pin (nội trở ~0.5Ω) + shunt ~1Ω + dây → <code>I ≈ 4.78 / 1.5 ≈ 3A</code>, gấp 15 lần cầu chì 200mA. Cầu chì đứt trong tích tắc: đó là việc nó được thiết kế để làm, và thay cầu chì rẻ hơn thay đồng hồ.</p>`,
    hoi: [
      ['Vì sao đo dòng phải mở mạch và nối đồng hồ nối tiếp, còn đo áp thì chạm song song?', 'Dòng phải chạy <b>xuyên qua</b> đồng hồ mới đo được, nên đồng hồ phải nằm trên đường đi của dòng. Áp là chênh lệch giữa 2 điểm, nên chỉ cần chạm 2 điểm đó.'],
      ['Đồng hồ ở thang mA (shunt ~1Ω) chạm thẳng 2 cực pin 4.78V nội trở 0.5Ω. Dòng cỡ bao nhiêu?', '≈ 4.78 / (0.5 + 1) ≈ <b>3A</b> → đứt cầu chì 200mA ngay.'],
      ['Thang 20mA có shunt 10Ω. Mạch LED + 220Ω, pin 4.78V, LED 2.0V. Đồng hồ hiện khoảng bao nhiêu?', '(4.78 − 2.0) / 230 ≈ <b>12.1mA</b> (không có đồng hồ là 12.6mA). LED cũng tụt áp nhẹ khi dòng giảm nên số thật có thể nhích lên chút.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Mạch LED thường, tính dòng từ áp',
        buoc: [
          { ten: 'Nối hộp pin rỗng', lam: ['Tháo hết pin khỏi hộp. Dây đỏ vào thanh <b>+ trên</b>, dây đen vào thanh <b>− dưới</b>.'], board: { them: [PIN_RONG] } },
          {
            ten: 'Ráp mạch, có dây cầu tạm',
            lam: ['Dây đỏ từ thanh + (cột 4) sang <b>5a</b>.', 'Điện trở 220Ω vắt qua rãnh: <b>5e → 5f</b>.', 'LED: chân dài <b>9h</b>, chân ngắn <b>10h</b>. Dây đen <b>10j</b> xuống thanh −.',
              'Dây vàng <b>5i → 9i</b> là cầu tạm nối điện trở sang LED. Phần 2 sẽ rút dây này ra, đặt đồng hồ vào đúng chỗ đó.'],
            board: {
              them: [{ id: 'd1', loai: 'day', tu: 'T+:4', den: '5a', mau: 'do' }, { id: 'r', loai: 'tro', p: ['5e', '5f'], nhan: '220Ω', vong: ['#C62828', '#C62828', '#6D4C41'] },
                { id: 'led', loai: 'led', a: '9h', k: '10h', mau: 'do', nhan: 'LED đỏ' }, { id: 'dK', loai: 'day', tu: '10j', den: 'B-:10', mau: 'den' },
                { id: 'cau', loai: 'day', tu: '5i', den: '9i', mau: 'vang', cong: 9 }],
            },
          },
          {
            ten: 'Đo trước khi cấp điện', kiem_truoc: true,
            lam: ['Núm <code>Ω 200k</code>, que đỏ ở VΩ. Chạm 2 que vào 2 tiếp điểm kim loại trong hộp pin (chỗ dây đỏ và dây đen nối vào).'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-', hien: '1  (OL)' }] },
            kiem: { thay: '<code>1</code> (OL) hoặc một số lớn. LED chặn dòng nhỏ của đồng hồ nên mạch trông như hở.', neu_khong: 'Dưới <code>0.20</code>: có chỗ nối tắt. Không lắp pin.' },
          },
          {
            ten: 'Lắp pin, đo áp trên 220Ω', cap_dien: true,
            lam: ['Lắp pin, LED sáng. Núm <code>DCV 20</code>. Que đỏ chạm chân điện trở ở 5e, que đen chạm chân ở 5f.', 'Tính <code>I = U_220 / 220</code>, ghi vào bảng.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' }, led: { sang: true } }, them: [{ id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: 'r.1', den: 'r.2', hien: '≈ 2.78' }] },
            kiem: { thay: 'U_220 ≈ 2.7–2.8V, tức I ≈ 12–13 mA.', neu_khong: 'Lệch nhiều: đo lại áp pin trước.' },
          },
        ],
      },
      {
        ten: 'Phần 2 · Chèn đồng hồ vào mạch để đo dòng', ke_thua: true,
        gioi_thieu: 'Chỉ đổi đúng một chỗ: thay dây cầu vàng bằng đồng hồ. Làm đúng thứ tự: tháo pin, chuẩn bị đồng hồ, kẹp que, kiểm lại, rồi mới lắp pin.',
        buoc: [
          {
            ten: 'Tháo pin, rút dây cầu vàng',
            lam: ['Tháo pin khỏi hộp. Rút dây vàng 5i–9i ra. Giờ mạch hở giữa cột 5 và cột 9, LED không thể sáng.'],
            board: { bo: ['cau'], sua: { pin: { trang_thai: 'rong' }, led: { sang: false } } },
          },
          {
            ten: 'Chuẩn bị đồng hồ ở chế độ mA, kẹp que', kiem_truoc: true,
            lam: ['Que đỏ sang lỗ đo mA (xem phần "Hiểu trước khi ráp"). Núm về <code>DCA 200m</code>, là thang lớn hơn số dự đoán.',
              'Cắm 1 dây nhảy vào <b>5j</b>, 1 dây nhảy vào <b>9j</b>. Kẹp cá sấu que <b>đỏ</b> vào đầu kia của dây ở <b>5j</b> (phía điện trở), que <b>đen</b> vào dây ở <b>9j</b> (phía LED).',
              'Kẹp xong cả 2 que mới đi tiếp. Không để đầu dây nào thả tự do.'],
            board: { them: [{ id: 'dh', loai: 'dh', che_do: 'DCA 200m', cong: 'mA', do_: '5j', den: '9j', hien: '—' }] },
            kiem: {
              thay: 'Đọc to lại 3 điều: que đỏ ở lỗ mA, núm ở DCA, 2 que chỉ nối vào 5j và 9j, <b>không chạm thanh nguồn</b>.',
              neu_khong: 'Có que nào chạm thanh + hay −, hoặc núm đang ở chỗ khác: sửa lại. Không lắp pin.',
            },
          },
          {
            ten: 'Lắp pin, đọc dòng', cap_dien: true,
            lam: ['Lắp pin. LED sáng lại, vì dòng giờ chạy xuyên qua đồng hồ. Đọc số (đơn vị mA).', 'Nếu số dưới 20, chuyển núm xuống <code>DCA 20m</code> để có thêm số lẻ. Ghi cả hai.'],
            board: { sua: { pin: { trang_thai: 'day', ap: '≈ 4.78 V' }, led: { sang: true } }, them: [{ id: 'dh', loai: 'dh', che_do: 'DCA 200m', cong: 'mA', do_: '5j', den: '9j', hien: '≈ 12.6' }] },
            kiem: { thay: '≈ 12–13 mA, khớp với số tính ở phần 1.', neu_khong: 'Hiện 0: cầu chì mA của đồng hồ có thể đã đứt, hoặc que đang ở lỗ V. Số âm: 2 que đảo, không sao, đổi lại.' },
          },
          {
            ten: 'Tháo pin, trả đồng hồ về chế độ đo áp',
            lam: ['Tháo pin. <b>Chuyển que đỏ về lỗ VΩ, núm về DCV hoặc OFF.</b>',
              'Tập thành thói quen: lần sau cầm đồng hồ đo áp mà quên nó đang ở mA, chạm vào pin là nối tắt.'],
            board: { sua: { pin: { trang_thai: 'rong' }, led: { sang: false } } },
          },
        ],
      },
    ],
    bang_do: [
      { ten: 'So dòng tính và dòng đo', cot: ['U pin', 'U_220', 'I tính = U_220/220', 'I đo (200m)', 'I đo (20m)'], hang: [{ ten: 'Số đo', du_doan: ['≈ 4.78', '≈ 2.78', '≈ 12.6 mA', '≈ 12.6', '≈ 12.60'] }] },
    ],
    bay: [
      'Chế độ mA mà chạm 2 cực pin: nối tắt qua đồng hồ, cháy cầu chì.',
      'Đo xong quên trả que đỏ về VΩ: lần đo áp sau thành nối tắt.',
      'Chọn thang nhỏ hơn dòng thật (vd 2m cho 12mA): đồng hồ báo quá thang, có đồng hồ còn đứt cầu chì. Luôn bắt đầu từ thang lớn.',
      'Dùng lỗ 10A cho dòng mA: không hỏng gì nhưng số quá thô, gần như đọc ra 0.',
    ],
    robot: [
      'Đo dòng motor lúc chạy và lúc bị kẹt (bài 7.3–7.4) để chọn driver chịu đủ dòng.',
      'Đo dòng ESP32 lúc nghỉ và lúc phát WiFi để tính pin robot chạy được bao lâu.',
    ],
  });
})();
