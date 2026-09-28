// Bài 3.2 — Tụ + LED. Dây đỏ hộp pin vào 2a, dây vàng 2c → T+ là công tắc. Nhánh LED: 1k 6e→6f, LED 6i/7i.
// Tụ 100µF: + ở 9c, − ở 10c, cột 10 xuống thanh − bằng 10e→10f và 10j→B-. Tụ thêm ở cột 13/14 và 17/18.
(function () {
  const PIN = { ...K.PIN, cong: '2a' }, CT = K.day('ct', '2c', 'T+:3', 'vang');
  const nhanh = [K.day('dA', 'T+:6', '6a', 'do'), K.tro('r', ['6e', '6f'], '1k'), K.led('led', '6i', '7i'), K.day('dK', '7j', 'B-:7', 'den')];
  const tu = (i, c) => [{ id: 'c' + i, loai: 'tu', p: [`${c}c`, `${c + 1}c`], nhan: '100µF' }, K.day('cp' + i, `T+:${c}`, `${c}a`, 'do'), K.day('cn' + i, `${c + 1}e`, `${c + 1}f`, 'den'), K.day('cm' + i, `${c + 1}j`, `B-:${c + 1}`, 'den')];
  BAI.dangKy({
    id: '3.2',
    poster: [21, 22],
    muc_tieu: 'Tụ làm kho điện nhỏ: rút nguồn thì LED còn sáng thêm một chút nhờ tụ. Ghép song song thêm tụ thì LED tắt chậm hơn.',
    can: [K.can.tro('1k'), K.can.led(), K.can.tuhoa('100µF', 3), ...K.coBan(12)],
    kien_thuc: `<p>Tụ nối thẳng qua pin nên nạp gần như tức thì. Rút nguồn: tụ xả qua 1k + LED. Hằng số thời gian 1k × 100µF = 0.1 giây, và LED tắt khi áp tụ xuống dưới ~1.8V → chỉ thấy tắt dần rất nhanh.</p>
      <p>Song song: điện dung cộng lại. 3 tụ = 300µF → tắt chậm gấp 3.</p>
      <p>Đếm số tụ 100µF trong gói trước (gói chưa rõ số cái). Có 1 con thì làm phần 1, có từ 2 con làm thêm phần 2.</p>
      <p>Dây vàng <b>2c → thanh +</b> là <b>công tắc</b>: bài này <b>rút</b> đúng dây đó khi có pin để "rút nguồn" — rút thì không nối tắt gì. <b>Cắm lại</b> dây đó chỉ khi hộp pin rỗng: rút dây ra rồi thì đo Ω ở hộp pin không còn đo tới mạch, nên phải cắm lại trước khi đo. Mọi thay đổi khác vẫn tháo pin trước.</p>`,
    du_doan: '<p>1 tụ: LED tắt dần trong ~0.2–0.3s. 3 tụ: ~0.7–1s.</p>',
    so_do: [{ nhan: 'Tụ làm kho điện', svg: SD.svg(320, 230, SD.pin(40, 110, '4.78V') + SD.day('40,110 40,30 110,30') + SD.chu(112, 22, 'dây công tắc', 'sd-mo')
      + SD.day('130,30 250,30') + '<circle cx="110" cy="30" r="3" class="sd-cham"/><circle cx="130" cy="30" r="3" class="sd-cham"/>' + SD.day('112,28 128,24')
      + SD.cham(170, 30) + SD.day('170,30 170,90') + SD.tu(170, 90, 50, '100µF', true) + SD.day('170,140 170,200')
      + SD.day('250,30 250,40') + SD.tro(250, 40, 60, '1k') + SD.day('250,100 250,112') + SD.led(250, 112) + SD.day('250,152 250,200 40,200 40,120') + SD.cham(170, 200),
      'Pin qua dây công tắc nạp tụ 100 micro fara; tụ song song nhánh 1k và LED'), chu: 'Rút dây công tắc: tụ thành nguồn duy nhất, xả qua 1k + LED.' }],
    sau: `<h3>Tụ xả qua LED không phải RC thuần</h3>
      <p>LED giữ lại ~1.8V, nên dòng qua nhánh là <code>i = (u − 1.8)/1k</code>. Phương trình: <code>C·du/dt = −(u − 1.8)/1k</code>, nghiệm:</p>
      <p><code>u(t) = 1.8 + (4.78 − 1.8)·e^(−t/τ)</code>, τ = 1k × 100µF = 0.1s.</p>
      <p>Tức là áp tụ tiến về 1.8V chứ không về 0, và dòng LED (tỉ lệ với độ sáng) giảm theo <code>e^(−t/τ)</code>. Dòng còn 10% lúc <code>t = τ·ln 10 ≈ 0.23s</code>: đúng khoảng "tắt dần trong 0.2–0.3s" ở phần đoán trước. 3 tụ song song: τ = 0.3s → ~0.7s.</p>
      <h3>Dùng ở đâu</h3>
      <p>Robot giữ ESP32 sống qua cú sụt áp ngắn bằng đúng cách này: tụ to sát nguồn nạp đầy lúc bình thường, xả bù lúc motor khởi động (bài 13.3). Tụ càng lớn và tải càng nhỏ thì càng giữ được lâu: thời gian ≈ C·ΔU / I.</p>`,
    hoi: [
      ['3 tụ 100µF song song. Điện dung tổng?', '<b>300µF</b> (song song cộng lại).'],
      ['Vì sao LED tắt hẳn trong khi tụ vẫn còn khoảng 1.8V?', 'Dưới ~1.8V LED không dẫn nữa (bài 4.1), nên tụ ngừng xả qua nhánh LED và giữ lại phần áp đó (tụt tiếp rất chậm qua dòng rò).'],
      ['Muốn LED mờ dần trong ~2 giây với 1k. Cần tụ khoảng bao nhiêu?', 't ≈ 2.3·RC → RC ≈ 0.87s → C ≈ 870µF: dùng tụ <b>1000µF</b>.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Một tụ',
        buoc: [
          { ten: 'Nối hộp pin rỗng: đỏ vào 2a, dây công tắc', lam: ['Hộp pin rỗng. Dây đỏ của hộp vào <b>2a</b>, dây đen vào thanh − dưới. Dây vàng 2c → thanh + (cột 3).'], board: { them: [PIN, CT] } },
          { ten: 'Nhánh LED', lam: ['Dây đỏ thanh + → 6a. 1k vắt qua rãnh 6e → 6f. LED: chân dài 6i, chân ngắn 7i. Dây đen 7j → thanh −.'], board: { them: nhanh } },
          { ten: 'Tụ 100µF', lam: ['Tụ: <b>chân dài (+) 9c</b>, chân ngắn 10c. Dây đỏ thanh + → 9a. Cột 10 xuống −: dây đen 10e → 10f qua rãnh, dây đen 10j → thanh −.'], board: { them: tu(1, 9) } },
          K.buocOm('Ω 200k', 'tăng → 1', 'Số tăng dần rồi tới 1 (OL): đồng hồ nạp tụ, LED chặn dòng nhỏ.', 'Đứng ở gần 0: nối tắt ở tụ hoặc dây.'),
          K.lapPin('Lắp pin', ['LED sáng.'], { sua: { led: { sang: true } } }, { thay: 'LED sáng, tụ nguội.', neu_khong: 'Tụ ấm: <b>tháo pin</b>, tụ đang cắm ngược.' }),
          { ten: 'Rút dây công tắc, nhìn LED', lam: ['Rút đầu dây vàng ở thanh +. Nhìn LED lúc rút.'], board: { bo: ['ct'], sua: { led: { sang: false } } }, kiem: { thay: 'LED không tắt phụt mà mờ dần rất nhanh.', neu_khong: 'Tắt phụt: tụ chưa nối vào mạch, kiểm cột 9/10.' } },
        ],
      },
      {
        ten: 'Phần 2 · Ghép thêm 2 tụ song song', ke_thua: true,
        buoc: [
          K.thaoPin(['Tụ 2 ở cột 13/14, tụ 3 ở cột 17/18, cắm y như tụ 1: + vào hàng c cột lẻ, cột chẵn xuống −.', 'Hộp vẫn rỗng: cắm lại dây vàng <b>2c → thanh +</b> (cột 3). Thiếu dây này thì bước đo sau luôn ra OL dù mạch có chập.'], { them: [...tu(2, 13), ...tu(3, 17), CT] }),
          K.buocOm('Ω 200k', 'tăng → 1', 'Tăng chậm hơn phần 1 (tụ to hơn) rồi tới OL.', 'Gần 0: nối tắt. Ra OL ngay lập tức: dây vàng 2c chưa cắm lại — cắm rồi đo lại.'),
          K.lapPin('Lắp pin', ['Lắp pin. LED sáng. Sờ nhanh 3 tụ sau 5 giây.'], { sua: { led: { sang: true } } }, { thay: 'LED sáng, 3 tụ nguội.', neu_khong: 'Tụ nào ấm: tháo pin, tụ đó ngược.' }),
          { ten: 'Rút dây công tắc, nhìn LED', lam: ['Rút đầu dây vàng ở thanh +. Nhìn LED lúc rút.'], board: { bo: ['ct'], sua: { led: { sang: false } } }, kiem: { thay: 'LED tắt dần chậm hơn rõ so với 1 tụ.', neu_khong: '' } },
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Thời gian LED tắt (ước lượng bằng mắt)', cot: ['Thời gian'], hang: [{ ten: '1 tụ', du_doan: ['~0.2–0.3 s'] }, { ten: '3 tụ', du_doan: ['~0.7–1 s'] }] }],
    bay: ['Tụ hoá cắm ngược: phồng, nổ. Sờ tụ sau khi lắp pin: ấm là ngược.', 'Rút/cắm thứ khác ngoài dây công tắc khi có pin.'],
    robot: ['Tụ to ở nguồn giữ cho chip sống qua lúc motor khởi động làm áp sụt (bài 13.3).'],
  });
})();
