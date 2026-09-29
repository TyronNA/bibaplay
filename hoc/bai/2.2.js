// Bài 2.2 — Kirchhoff. Phần 1: 1k + 2.2k + 4.7k nối tiếp. Phần 2: 1k ∥ 2.2k, đo dòng từng nhánh ở phía dưới (xa thanh +).
(function () {
  const sd = SD;
  const soDoAp = sd.svg(300, 200, sd.pin(40, 100, '4.78V') + sd.day('40,100 40,20 150,20') + sd.tro(150, 20, 50, '1k') + sd.tro(150, 70, 50, '2.2k') + sd.tro(150, 120, 50, '4.7k')
    + sd.day('150,170 150,185 40,185 40,110') + sd.chu(210, 49, 'U1', 'sd-mo') + sd.chu(210, 99, 'U2', 'sd-mo') + sd.chu(210, 149, 'U3', 'sd-mo'), 'Ba điện trở nối tiếp: U1 + U2 + U3 = U pin');
  const soDoDong = sd.svg(300, 200, sd.pin(40, 100, '4.78V') + sd.day('40,100 40,20 220,20') + sd.cham(120, 20) + sd.day('120,20 120,40') + sd.tro(120, 40, 60, '1k')
    + sd.day('220,20 220,40') + sd.tro(220, 40, 60, '2.2k') + sd.day('120,100 120,130 220,130 220,100') + sd.cham(170, 130) + sd.day('170,130 170,185 40,185 40,110')
    + sd.chu(90, 125, 'I1', 'sd-mo') + sd.chu(230, 125, 'I2', 'sd-mo') + sd.chu(180, 165, 'I = I1+I2', 'sd-mo'), 'Hai nhánh song song: dòng tổng bằng tổng dòng hai nhánh');
  const DA = K.day('dA', 'T+:3', '3a', 'do');
  const r1 = K.tro('r1', ['3b', '7b'], '1k'), r2 = K.tro('r2', ['7c', '11c'], '2.2k'), r3 = K.tro('r3', ['11e', '11f'], '4.7k');
  const DK = K.day('dK', '11j', 'B-:11', 'den');
  // phần 2
  const D2 = K.day('dA', 'T+:5', '5a', 'do'), n1 = K.tro('n1', ['5e', '5f'], '1k'), n2a = K.tro('n2', ['5c', '9c'], '2.2k'), cau = K.day('cau', '9e', '9f', 'vang');
  const w1 = K.day('w1', '5j', '14g', 'xanh', 5), w2 = K.day('w2', '9j', '14h', 'cam', 4), wt = K.day('wt', '14j', 'B-:14', 'den');
  const kep = (tu, den) => K.dh('DCA 20m', tu, den, '—', 'mA');
  const buocDong = (ten, bo, tu, den, hien, thay, lai) => [
    K.thaoPin([`Rút dây ${bo === 'wt' ? 'đen 14j → thanh −' : bo === 'w1' ? 'xanh 5j → 14g' : 'cam 9j → 14h'}. Cắm lại dây đã rút ở lần trước (nếu có).`], { bo: [bo], them: lai || [] }),
    { ten: 'Kẹp đồng hồ mA vào chỗ hở', kiem_truoc: true, lam: [`Que đỏ lỗ mA, núm <code>DCA 20m</code>. Que đỏ vào dây ở ${tu}, que đen vào dây ở ${den.replace(/^B-:(\d+)$/, 'thanh − dưới (cột $1)')}.`], board: { them: [kep(tu, den)] },
      kiem: { thay: 'Không que nào chạm thanh +.', neu_khong: 'Sửa trước khi lắp pin.' } },
    K.lapPin(ten, ['Đọc, ghi, tháo pin.'], { them: [K.dh('DCA 20m', tu, den, hien, 'mA')] }, { thay, neu_khong: 'Số âm: đảo que, không sao.' }),
  ];
  const bo = x => ({ ...x, moi: true });
  BAI.dangKy({
    id: '2.2',
    poster: [5],
    muc_tieu: 'Kiểm 2 định luật Kirchhoff bằng số đo: tổng áp trên các điện trở nối tiếp bằng áp nguồn, và dòng vào một nút bằng tổng dòng ra.',
    can: [K.can.tro('1k', 2), K.can.tro('2.2k'), K.can.tro('4.7k'), ...K.coBan(8)],
    kien_thuc: `<p><b>Kirchhoff áp:</b> đi một vòng kín, tổng áp lên bằng tổng áp xuống. Mạch nối tiếp: <code>U1 + U2 + U3 = U_pin</code>, và con to hơn ăn áp nhiều hơn theo đúng tỉ lệ R.</p>
      <p><b>Kirchhoff dòng:</b> điện không tích lại ở một nút, nên dòng đi vào bằng tổng dòng đi ra.</p>
      <p>Phần 2 đo dòng ở 3 chỗ, cả 3 chỗ đều ở <b>phía dưới</b>, xa thanh +. Nhờ vậy lúc đồng hồ ở chế độ mA, không bao giờ phải kẹp que vào thanh +.</p>`,
    so_do: [{ nhan: 'Phần 1 · áp', svg: soDoAp, chu: 'Cùng một dòng đi qua cả 3 con.' }, { nhan: 'Phần 2 · dòng', svg: soDoDong, chu: 'Nút dưới: 2 dòng nhánh gộp lại.' }],
    du_doan: `<p>Phần 1: <code>I = 4.78 / 7.9k ≈ 0.605mA</code>, nên U1 ≈ 0.61V, U2 ≈ 1.33V, U3 ≈ 2.84V.</p>
      <p>Phần 2: I1 = 4.78/1k ≈ 4.78mA, I2 = 4.78/2.2k ≈ 2.17mA, I tổng ≈ 6.95mA. R cụm = 1k∥2.2k ≈ 688Ω.</p>`,
    sau: `<h3>Kirchhoff là bảo toàn</h3>
      <p>Định luật dòng là <b>bảo toàn điện tích</b>: điện tích không tự sinh ra hay mất đi ở một điểm nối, nên vào bao nhiêu ra bấy nhiêu. Định luật áp là <b>bảo toàn năng lượng</b>: một điện tích đi hết một vòng kín về chỗ cũ thì năng lượng nhận được bằng năng lượng mất đi.</p>
      <h3>Giải một mạch bằng định luật dòng</h3>
      <p>Mạch ví dụ: pin 4.78V qua 1k tới điểm X, từ X có 2 nhánh xuống −: 2.2k và 4.7k. Gọi áp tại X là V, rồi viết "dòng vào = dòng ra" tại X:</p>
      <p><code>(4.78 − V)/1k = V/2.2k + V/4.7k</code> → <code>V·(1/1k + 1/2.2k + 1/4.7k) = 4.78/1k</code> → <b>V ≈ 2.87V</b>.</p>
      <p>Đây là phương pháp điện áp nút: mỗi nút một phương trình, giải hệ là ra hết. Trang mô phỏng của web giải mạch đúng theo cách này, chỉ là với nhiều nút hơn và thêm mô hình cho LED, transistor.</p>`,
    hoi: [
      ['Phần 1 đo U1 = 0.60V, U2 = 1.32V, pin 4.77V. Đoán U3 trước khi đo.', 'U3 = 4.77 − 0.60 − 1.32 = <b>2.85V</b> (định luật áp).'],
      ['Dòng tổng vào cụm song song 6.9mA, nhánh 1k đo 4.75mA. Nhánh 2.2k bao nhiêu?', '6.9 − 4.75 = <b>2.15mA</b> (định luật dòng).'],
      ['Mạch ví dụ ở trên: dòng qua con 1k bằng bao nhiêu?', '(4.78 − 2.87)/1k ≈ <b>1.91mA</b>. Kiểm lại: 2.87/2.2k + 2.87/4.7k ≈ 1.30 + 0.61 = 1.91mA.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Kirchhoff áp: 3 con nối tiếp',
        buoc: [
          K.buocPin(),
          { ten: 'Cắm chuỗi 1k → 2.2k → 4.7k', lam: ['Dây đỏ thanh + → 3a. 1k: 3b → 7b. 2.2k (' + K.tenVong('2.2k') + '): 7c → 11c. 4.7k (' + K.tenVong('4.7k') + '): 11e → 11f vắt qua rãnh. Dây đen 11j → thanh −.'], board: { them: [DA, r1, r2, r3, DK] } },
          K.buocOm('Ω 20k', '≈ 7.90', '≈ 7.9k.', 'Nhỏ hơn nhiều: có con nào bị nối tắt (2 chân chung cột).'),
          K.lapPin('Lắp pin, đo 3 áp và áp pin', ['<code>DCV 20</code>. Đo lần lượt: chân 3b–7b, 7c–11c, 11e–11f. Rồi đo thanh + với thanh −.'], { them: [K.dh('DCV 20', 'r1.1', 'r1.2', '≈ 0.61')] },
            { thay: '3 số cộng lại ≈ áp pin (lệch ≤ 0.02V).', neu_khong: 'Lệch nhiều: que tì chưa chắc, đo lại từng con.' }),
          K.thaoPin(['Rút hết. Phần 2 ráp lại từ đầu.']),
        ],
      },
      {
        ten: 'Phần 2 · Kirchhoff dòng: 1k ∥ 2.2k', cot: 24,
        buoc: [
          K.buocPin(),
          { ten: 'Ráp 2 nhánh', lam: ['Dây đỏ thanh + → 5a. Nhánh 1: 1k vắt qua rãnh 5e → 5f. Nhánh 2: 2.2k 5c → 9c, rồi dây vàng 9e → 9f qua rãnh.', 'Nút dưới ở cột 14: dây xanh 5j → 14g, dây cam 9j → 14h, dây đen 14j → thanh −.'],
            board: { them: [D2, n1, n2a, cau, w1, w2, wt] } },
          K.buocOm('Ω 2k', '≈ 688', '≈ 690Ω.', 'Dưới 600Ω: có chỗ nối tắt.'),
          ...buocDong('Lắp pin, đọc I tổng', 'wt', '14j', 'B-:16', '≈ 6.95', '≈ 6.9–7.0 mA.'),
          ...buocDong('Lắp pin, đọc I1 (nhánh 1k)', 'w1', '5j', '14g', '≈ 4.78', '≈ 4.8 mA.', [bo(wt)]),
          ...buocDong('Lắp pin, đọc I2 (nhánh 2.2k)', 'w2', '9j', '14h', '≈ 2.17', '≈ 2.2 mA. I1 + I2 ≈ I tổng.', [bo(w1)]),
          K.thaoPin(['Trả que đỏ về VΩ, núm về DCV.']),
        ],
      },
    ],
    bang_do: [
      { ten: 'Kirchhoff áp', cot: ['U 1k', 'U 2.2k', 'U 4.7k', 'Cộng', 'U pin'], hang: [{ ten: 'Số đo', du_doan: ['≈ 0.61', '≈ 1.33', '≈ 2.84', '≈ 4.78', '≈ 4.78'] }] },
      { ten: 'Kirchhoff dòng', cot: ['I tổng', 'I1', 'I2', 'I1 + I2'], hang: [{ ten: 'mA', du_doan: ['≈ 6.95', '≈ 4.78', '≈ 2.17', '≈ 6.95'] }] },
    ],
    bay: ['Đo dòng mà kẹp que vào thanh +: một que trượt sang thanh − là nối tắt qua đồng hồ. Bài này chỉ đo dòng ở phía dưới.', 'Chuyển từ đo dòng về đo áp mà quên que đỏ ở lỗ mA.'],
    robot: ['Dòng tổng của robot bằng tổng dòng của từng khối (ESP32, motor, loa). Tính ra con số này để chọn pin và ổn áp đủ sức.'],
  });
})();
