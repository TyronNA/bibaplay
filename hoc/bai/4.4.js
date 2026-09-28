// Bài 4.4 — LED RGB chung cathode: chân R 10f, chung 11f, G 12f, B 13f (thứ tự thường gặp — dò ở phần 1).
// Chung → dây 11j → −. Mỗi màu 1 điện trở vắt qua rãnh (10d–10h, 12d–12h, 13d–13h), đầu trên nối thanh + bằng dây = công tắc màu đó.
// Phần 3 cho loại chung anode. Mô phỏng chưa có LED RGB (loai 'rgb') nên không có link mô phỏng.
(function () {
  const RGB = { id: 'rgb', loai: 'rgb', p: ['10f', '11f', '12f', '13f'], nhan: 'LED RGB' };
  const DC = K.day('dc', '11j', 'B-:11', 'den');
  const RR = K.tro('rr', ['10d', '10h'], '220', { nhan: '' }), RG = K.tro('rg', ['12d', '12h'], '150', { nhan: '' }), RB = K.tro('rb', ['13d', '13h'], '150', { nhan: '' });
  const SR = K.day('sr', 'T+:10', '10a', 'do'), SG = K.day('sg', 'T+:12', '12a', 'xanh'), SB = K.day('sb', 'T+:13', '13a', 'tim');
  const DIODE = (do_, hien) => K.dh('diode ▶|', do_, 'rgb.C', hien);
  // chung anode (phần 3): chân chung lên thanh +, điện trở từ chân màu xuống thanh −
  const RGBA = { ...RGB, id: 'rgba', ten_chan: { C: '+' } };
  const DA = K.day('da', 'T+:11', '11h', 'do');
  const RA = [K.tro('ra1', ['10j', 'B-:10'], '220'), K.tro('ra2', ['12j', 'B-:12'], '150'), K.tro('ra3', ['13j', 'B-:13'], '150')];

  const sd = SD;
  const soDo = sd.svg(340, 230, sd.pin(30, 120, '4.78V') + sd.day('30,120 30,30 300,30')
    + [[110, '220Ω', 'đỏ'], [200, '150Ω', 'lục'], [290, '150Ω', 'lam']].map(([x, r, m]) => sd.cham(x, 30) + sd.day(`${x},30 ${x},40`) + sd.tro(x, 40, 50, r) + sd.day(`${x},90 ${x},100`) + sd.led(x, 100) + sd.chu(x - 14, 160, m, 'sd-mo', 'end') + sd.day(`${x},140 ${x},170 200,170`)).join('')
    + sd.cham(200, 170) + sd.day('200,170 200,200 30,200 30,130') + sd.chu(206, 190, 'chân chung (cathode)', 'sd-mo'),
    'Ba LED đỏ, lục, lam chung cathode, mỗi LED một điện trở riêng nối cực dương');

  BAI.dangKy({
    id: '4.4',
    muc_tieu: 'Một vỏ LED chứa 3 LED đỏ, lục, lam. Bật từng màu, rồi bật chung để thấy trộn màu cộng: đỏ + lục = vàng, cả ba = trắng. Và thấy vì sao mỗi màu phải có điện trở riêng.',
    can: [
      { ten: 'LED RGB 5mm chung cathode', tim: 'LED RGB', lk: 'led-rgb', sl: 1 },
      K.can.tro('220'), K.can.tro('150', 2), ...K.coBan(6),
    ],
    kien_thuc: `
      <p>Bên trong là 3 chip LED. Loại <b>chung cathode</b>: 3 cathode nối chung ra chân dài nhất, chân đó về −; mỗi anode ra một chân riêng. Loại <b>chung anode</b> ngược lại: chân dài về +. Nhìn bề ngoài giống hệt nhau: phải dò (phần 1). Chưa biết chắc loại nào thì không cấp điện.</p>
      <p>Mỗi màu có áp thuận khác nhau: đỏ ~2.0V, lục và lam ~3.0V (bài 4.1). Nên mỗi màu một điện trở: đỏ <code>(4.78 − 2.0)/220 ≈ 12.6mA</code>; lục, lam <code>(4.78 − 3.0)/150 ≈ 11.9mA</code>. Không có 150Ω thì dùng 220Ω: lục, lam còn ~8mA, sáng yếu hơn chút.</p>
      <p>Dùng chung 1 điện trở ở chân chung thì 3 LED song song trực tiếp: LED đỏ (áp thấp nhất) kẹp điểm chung ở ~2V, lục và lam không đủ áp để sáng. Đó là bẫy hay gặp nhất với LED RGB.</p>
      <p>Mỗi dây từ thanh + xuống đầu trên một điện trở là công tắc cho màu đó. Chỉ cắm/rút dây này khi <b>hộp pin rỗng</b>.</p>`,
    so_do: [{ nhan: 'Chung cathode', svg: soDo, chu: 'Mỗi màu một nhánh riêng: 3 dòng không giành nhau.' }],
    du_doan: `<div class="cuon"><table><thead><tr><th>Bật</th><th>Màu thấy</th><th>Dòng tổng qua chân chung</th></tr></thead><tbody>
      <tr><td>đỏ</td><td>đỏ</td><td>≈ 12.6mA</td></tr>
      <tr><td>đỏ + lục</td><td>vàng (hơi cam/hơi xanh tuỳ con)</td><td>≈ 24.5mA</td></tr>
      <tr><td>đỏ + lục + lam</td><td>trắng (thường ngả hồng/xanh)</td><td>≈ 36mA</td></tr>
      </tbody></table></div>
      <p>Trắng hiếm khi trắng tinh: 3 chip không sáng đều nhau ở cùng dòng. Chỉnh bằng điện trở (hoặc PWM riêng mỗi màu ở chương 11).</p>`,
    sau: `<h3>Trộn màu cộng</h3>
      <p>Mắt có 3 loại tế bào nón nhạy khoảng đỏ, lục, lam. Ánh sáng đỏ + lục kích thích cả 2 loại đó cùng lúc, não hiểu là vàng — dù không có photon "vàng" nào (bước sóng ~580nm). Màn hình điện thoại làm đúng như vậy với hàng triệu cụm RGB nhỏ.</p>
      <h3>Điều chỉnh tỉ lệ bằng dòng</h3>
      <p>Độ sáng mỗi chip gần tỉ lệ với dòng. Muốn màu cam: đỏ đủ, lục ~1/3. Bằng điện trở: lục thay 150Ω bằng ~470Ω → <code>(4.78 − 2.9)/470 ≈ 4mA</code>. Bằng PWM (chương 11): 3 kênh duty khác nhau, đổi màu bằng code không phải thay linh kiện. Robot dùng LED RGB báo trạng thái: xanh = sẵn sàng, vàng = pin yếu, đỏ = lỗi.</p>
      <h3>Dòng qua chân chung</h3>
      <p>Chân chung gánh tổng 3 màu (~36mA). Mỗi chip vẫn ≤ 20mA nên trong mức; nhưng nếu nối chân chung vào GPIO (loại chung anode nối GPIO 3.3V) thì 36mA vượt 20mA mỗi chân — phải qua transistor.</p>`,
    hoi: [
      ['Dò bằng thang diode: que đen ở chân dài, que đỏ chạm 3 chân kia đều thấy sáng mờ. Loại nào?', '<b>Chung cathode</b>: chân dài là cathode (−) chung.'],
      ['Chỉ có điện trở 220Ω, dùng cho cả lục và lam. Dòng mỗi màu?', '(4.78 − 3.0)/220 ≈ <b>8mA</b>.'],
      ['Nối 3 anode chung lại qua 1 điện trở 100Ω. Màu nào sáng, vì sao?', 'Chỉ <b>đỏ</b>: LED đỏ dẫn ở ~2V, kẹp điểm chung ở đó; lục/lam cần ~3V nên không sáng.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Dò loại và chân (chưa có pin)',
        buoc: [
          { ten: 'Cắm LED RGB', lam: ['Chưa nối hộp pin. Cắm 4 chân vào <b>10f, 11f, 12f, 13f</b>: chân dài nhất ở <b>11f</b>.'], board: { them: [RGB] } },
          {
            ten: 'Thang diode: que đen ở chân dài', kiem_truoc: true,
            lam: ['Núm thang diode (▶|). Que đen chạm chân ở <b>11g</b> (chân dài). Que đỏ lần lượt chạm 10g, 12g, 13g, nhìn LED.'],
            board: { them: [DIODE('rgb.R', '≈ 1.8')] },
            kiem: { thay: 'Mỗi chân sáng mờ một màu (đỏ, rồi lục, rồi lam; lam có thể không sáng nếu đồng hồ yếu nhưng vẫn ra số): <b>chung cathode</b>. Ghi lại cột nào màu gì. Làm tiếp phần 2.', neu_khong: 'Không chân nào sáng, cả 3 hiện 1: có thể là <b>chung anode</b>. Đảo que (que đỏ ở chân dài, que đen chạm từng chân): sáng thì là chung anode → bỏ qua phần 2, làm phần 3. Cả 2 cách đều không sáng: LED hỏng hoặc chân dài không ở 11f.' },
          },
        ],
      },
      {
        ten: 'Phần 2 · Chung cathode: bật từng màu', ke_thua: true,
        gioi_thieu: 'Chỉ làm phần này khi phần 1 xác nhận chung cathode. Nếu màu của bạn ở cột khác, đổi điện trở cho khớp: con 220Ω luôn nằm ở cột màu đỏ.',
        buoc: [
          { ...K.buocPin(), board: { them: [K.PIN] } },
          { ten: 'Dây chung và 3 điện trở', lam: ['Dây đen <b>11j → thanh −</b>.', 'Vắt qua rãnh: 220Ω <b>10d → 10h</b> (đỏ), 150Ω <b>12d → 12h</b> (lục), 150Ω <b>13d → 13h</b> (lam). Chưa cắm dây nào từ thanh +.'], board: { them: [DC, RR, RG, RB] } },
          { ten: 'Dây đỏ: bật màu đỏ', lam: ['Dây đỏ thanh + (cột 10) → <b>10a</b>.'], board: { them: [SR] } },
          K.buocOm('Ω 2k', '≥ 0.22', 'Không dưới <code>0.220</code>; thường ra <code>1</code> (OL) vì LED chặn áp thử.', 'Gần 0: chân chung hoặc điện trở cắm chung cột với thanh +.'),
          K.lapPin('Lắp pin: đỏ', ['<code>DCV 20</code> đo 2 chân 220Ω (10b và 10i) → dòng = U / 220.'], { sua: { rgb: { sang: '#E5372C' } }, them: [K.dh('DCV 20', '10b', '10i', '≈ 2.8')] }, { thay: 'Sáng đỏ; U_220 ≈ 2.7–2.9V (≈ 12.6mA).', neu_khong: 'Sáng màu khác: thứ tự màu khác hình — ghi lại, đổi điện trở cho đúng cột. Không sáng: dây chung 11j chưa về −.' }),
          K.thaoPin(),
          { ten: 'Thêm dây: bật lục', lam: ['Hộp pin rỗng. Dây xanh thanh + (cột 12) → <b>12a</b>.'], board: { sua: { rgb: { sang: false } }, them: [SG] } },
          K.buocOm('Ω 2k', '≥ 0.09', 'Không dưới <code>0.089</code> (220Ω ∥ 150Ω là trường hợp xấu nhất); thường ra 1.', 'Gần 0: nối tắt.'),
          K.lapPin('Lắp pin: đỏ + lục', ['Nhìn màu. Đo 2 chân 150Ω của lục (12b, 12i).'], { sua: { rgb: { sang: '#E8C020' } }, them: [K.dh('DCV 20', '12b', '12i', '≈ 1.8')] }, { thay: 'Màu vàng; U_150 ≈ 1.7–1.9V (≈ 12mA).', neu_khong: '' }),
          K.thaoPin(),
          { ten: 'Thêm dây: bật lam', lam: ['Hộp pin rỗng. Dây tím thanh + (cột 13) → <b>13a</b>.'], board: { sua: { rgb: { sang: false } }, them: [SB] } },
          K.buocOm('Ω 2k', '≥ 0.06', 'Không dưới <code>0.062</code> (3 nhánh song song); thường ra 1.', 'Gần 0: nối tắt.'),
          K.lapPin('Lắp pin: cả ba', ['Nhìn màu. Rút lần lượt từng dây màu (tháo pin trước mỗi lần rút) để thử các cặp: đỏ + lam, lục + lam.'], { sua: { rgb: { sang: '#F4F4F4' } } }, { thay: 'Gần trắng; đỏ + lam = tím hồng, lục + lam = xanh ngọc.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 3 · Chỉ khi là chung anode',
        gioi_thieu: 'Ráp lại từ đầu, hộp pin rỗng: chân chung lên +, mỗi màu một điện trở xuống −.',
        buoc: [
          K.buocPin(),
          { ten: 'LED, dây chung lên +, 3 điện trở xuống −', lam: ['LED RGB ở 10f–13f, chân dài 11f. Dây đỏ thanh + (cột 11) → <b>11h</b>.', 'Điện trở từ chân màu xuống thanh −: 220Ω <b>10j</b> (màu đỏ), 150Ω <b>12j</b>, 150Ω <b>13j</b> — đầu kia vào thanh − cùng cột.'], board: { them: [RGBA, DA, ...RA] } },
          K.buocOm('Ω 2k', '≥ 0.06', 'Không dưới <code>0.062</code>; thường ra 1.', 'Gần 0: dây chung cắm nhầm xuống thanh −.'),
          K.lapPin('Lắp pin: cả ba', ['Muốn tắt một màu: tháo pin, rút điện trở của màu đó.'], { sua: { rgba: { sang: '#F4F4F4' } } }, { thay: 'Gần trắng.', neu_khong: 'Không sáng: có thể là chung cathode — quay lại phần 1.' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Dòng từng màu', cot: ['U điện trở (V)', 'I (mA)', 'Màu'], hang: [
      { ten: 'Đỏ (220Ω)', du_doan: ['≈ 2.8', '≈ 12.6', 'đỏ'] }, { ten: 'Lục (150Ω)', du_doan: ['≈ 1.8', '≈ 12', ''] }, { ten: 'Lam (150Ω)', du_doan: ['≈ 1.8', '≈ 12', ''] },
    ] }],
    bay: ['Không dò loại mà cắm: chung anode cắm theo sơ đồ chung cathode thì không sáng gì (không hỏng ở 4.78V, nhưng mất công tìm lỗi).', 'Dùng 1 điện trở cho cả 3 màu: chỉ đỏ sáng.', 'Nhìn thẳng LED ở 12mA ở cự ly gần lâu: chói mắt. Đặt tờ giấy trắng làm tấm tản sáng.'],
    robot: ['Đèn trạng thái robot: 3 chân GPIO + 3 điện trở (loại chung cathode) — code đổi màu theo pin, lỗi, chế độ.', 'Board ESP32-S3 thường có sẵn LED RGB địa chỉ (WS2812) ở GPIO48/38: 1 chân điều khiển được cả chuỗi, khác loại 4 chân ở bài này.'],
  });
})();
