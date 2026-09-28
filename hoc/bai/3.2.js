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
      <p>Dây vàng <b>2c → thanh +</b> là <b>công tắc</b>: bài này rút/cắm đúng dây đó khi có pin để "rút nguồn". Mạch đã đo Ω nên rút dây đó không nối tắt gì. Mọi thay đổi khác vẫn tháo pin trước.</p>`,
    du_doan: '<p>1 tụ: LED tắt dần trong ~0.2–0.3s. 3 tụ: ~0.7–1s.</p>',
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
          K.thaoPin(['Tụ 2 ở cột 13/14, tụ 3 ở cột 17/18, cắm y như tụ 1: + vào hàng c cột lẻ, cột chẵn xuống −.'], { them: [...tu(2, 13), ...tu(3, 17)] }),
          K.buocOm('Ω 200k', 'tăng → 1', 'Tăng chậm hơn phần 1 (tụ to hơn) rồi tới OL.', 'Gần 0: nối tắt.'),
          K.lapPin('Lắp pin, cắm dây công tắc', ['Lắp pin, cắm lại dây vàng 2c → thanh +. Đợi 2 giây, rút dây vàng.'], { them: [CT], sua: { led: { sang: true } } }, { thay: 'LED tắt dần chậm hơn rõ so với 1 tụ.', neu_khong: 'Tụ nào ấm: tháo pin, tụ đó ngược.' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Thời gian LED tắt (ước lượng bằng mắt)', cot: ['Thời gian'], hang: [{ ten: '1 tụ', du_doan: ['~0.2–0.3 s'] }, { ten: '3 tụ', du_doan: ['~0.7–1 s'] }] }],
    bay: ['Tụ hoá cắm ngược: phồng, nổ. Sờ tụ sau khi lắp pin: ấm là ngược.', 'Rút/cắm thứ khác ngoài dây công tắc khi có pin.'],
    robot: ['Tụ to ở nguồn giữ cho chip sống qua lúc motor khởi động làm áp sụt (bài 13.3).'],
  });
})();
