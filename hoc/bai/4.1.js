// Bài 4.1 — Diode: chiều dẫn và sụt áp. Phần 1 thang diode, không pin. Phần 2: 1N4148 + R thay đổi, đo áp diode.
(function () {
  const D = { id: 'd', loai: 'diode', kieu: '4148', a: '5c', k: '9c', nhan: '1N4148' };
  const DA = K.day('dA', 'T+:5', '5a', 'do'), DK = K.day('dK', '9j', 'B-:9', 'den');
  const R = gt => K.tro('r', ['5e', '5f'], gt);
  const D2 = { id: 'd', loai: 'diode', kieu: '4148', a: '5h', k: '9h', nhan: '1N4148' };
  BAI.dangKy({
    id: '4.1',
    poster: [10, 18, 19, 20],
    muc_tieu: 'Đo sụt áp thuận của diode silicon và 5 màu LED, và thấy áp đó gần như đứng yên khi dòng đổi khoảng 45 lần. Đó là lý do U/I của LED không phải hằng số.',
    can: [K.can.d4148(), K.can.d4007(), K.can.led('5 màu', 5), K.can.tro('220'), K.can.tro('1k'), K.can.tro('10k'), ...K.coBan(3)],
    kien_thuc: `<p>Diode chỉ cho dòng đi một chiều: từ <b>anode</b> sang <b>cathode</b> (đầu có vạch). Khi dẫn, nó "ăn" một áp gần như cố định: silicon ~0.6–0.7V, LED đỏ ~1.8–2V, LED xanh dương/trắng ~2.8–3.2V.</p>
      <p>Thang diode (ký hiệu ▶|) của đồng hồ đẩy một dòng nhỏ (~1mA) và hiện <b>áp</b> trên diode, đơn vị mV hoặc V. Chiều ngược hiện <code>1</code>.</p>
      <p>LED xanh dương/trắng có thể hiện <code>1</code> ở cả 2 chiều nếu áp thử của đồng hồ thấp hơn ~3V: không phải LED hỏng.</p>`,
    du_doan: '<p>1N4148 và 1N4007: 0.55–0.7V ở thang diode. Phần 2: với 10k (≈0.4mA) ≈ 0.6V, với 1k (≈4mA) ≈ 0.68V, với 220Ω (≈18mA) ≈ 0.75V: dòng đổi 45 lần, áp đổi ~0.15V.</p>',
    phan: [
      {
        ten: 'Phần 1 · Thang diode, không pin',
        buoc: [
          { ten: 'Cắm 1N4148', lam: ['Diode 1N4148 (thân thuỷ tinh đỏ cam): <b>đầu có vạch đen</b> (cathode) vào 9c, đầu kia (anode) vào 5c.'], board: { them: [D] } },
          { ten: 'Đo chiều thuận', lam: ['Núm thang diode. Que đỏ chân anode (5c), que đen chân cathode (9c).'], board: { them: [K.dh('diode ▶|', 'd.A', 'd.K', '≈ 0.60')] }, kiem: { thay: '≈ 0.55–0.70 (có đồng hồ hiện 550–700).', neu_khong: '1: đảo que. Gần 0 cả 2 chiều: diode chết (chập).' } },
          { ten: 'Đo chiều ngược', lam: ['Đảo 2 que.'], board: { them: [K.dh('diode ▶|', 'd.K', 'd.A', '1')] }, kiem: { thay: '1: không dẫn.', neu_khong: 'Ra số: diode hỏng.' } },
          { ten: 'Lặp lại với 1N4007 và 5 LED', lam: ['Thay diode bằng 1N4007 (thân đen, vạch bạc = cathode), rồi từng LED (chân dài = anode). Ghi số cả 2 chiều.', 'LED đỏ/vàng có thể le lói khi đo chiều thuận: bình thường.'], board: { bo: ['d'], them: [{ ...D, kieu: '4007', nhan: '1N4007' }, K.dh('diode ▶|', 'd.A', 'd.K', '≈ 0.55')] }, kiem: { thay: 'Số của từng loại ghi vào bảng.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 2 · Có pin: áp diode theo dòng',
        buoc: [
          K.buocPin(),
          { ten: 'Ráp: thanh + → 10k → 1N4148 → thanh −', lam: ['Dây đỏ thanh + → 5a. 10k vắt qua rãnh 5e → 5f. 1N4148: anode 5h, <b>vạch 9h</b>. Dây đen 9j → thanh −.'], board: { them: [DA, R('10k'), D2, DK] } },
          K.buocOm('Ω 200k', '> 10', 'Số lớn hơn 10k (điện trở cộng diode ở dòng nhỏ), hoặc 1.', 'Dưới 10k: có chỗ nối tắt bỏ qua điện trở.'),
          K.lapPin('Lắp pin, đo áp diode', ['<code>DCV 2</code> (hoặc 20). Que đỏ 5h, que đen 9h.'], { them: [K.dh('DCV 20', 'd.A', 'd.K', '≈ 0.60')] }, { thay: '≈ 0.6V.', neu_khong: '≈ 4.78: diode cắm ngược (không dẫn).' }),
          K.thaoPin(['Đổi 10k thành <b>1k</b>.'], { bo: ['r'], them: [R('1k')] }),
          K.buocOm('Ω 20k', '> 1', 'Lớn hơn 1k.', 'Dưới 1k: nối tắt.'),
          K.lapPin('Lắp pin, đo áp diode', ['Như trên.'], { them: [K.dh('DCV 20', 'd.A', 'd.K', '≈ 0.68')] }, { thay: '≈ 0.68V.', neu_khong: '' }),
          K.thaoPin(['Đổi 1k thành <b>220Ω</b>.'], { bo: ['r'], them: [R('220')] }),
          K.buocOm('Ω 2k', '> 220', 'Lớn hơn 220Ω.', 'Dưới 200Ω: nối tắt, diode sẽ nhận dòng lớn.'),
          K.lapPin('Lắp pin, đo áp diode', ['Như trên.'], { them: [K.dh('DCV 20', 'd.A', 'd.K', '≈ 0.75')] }, { thay: '≈ 0.72–0.78V.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [
      { ten: 'Thang diode', cot: ['Chiều thuận', 'Chiều ngược'], hang: [
        { ten: '1N4148', du_doan: ['≈ 0.60', '1'] }, { ten: '1N4007', du_doan: ['≈ 0.55', '1'] }, { ten: 'LED đỏ', du_doan: ['≈ 1.8', '1'] }, { ten: 'LED vàng', du_doan: ['≈ 1.9', '1'] },
        { ten: 'LED xanh lá', du_doan: ['2.0–3.0', '1'] }, { ten: 'LED xanh dương', du_doan: ['≈ 2.8 hoặc 1', '1'] }, { ten: 'LED trắng', du_doan: ['≈ 2.8 hoặc 1', '1'] }] },
      { ten: 'Áp 1N4148 theo dòng', cot: ['I tính = (4.78 − U_D)/R', 'U_D đo'], hang: [{ ten: '10k', du_doan: ['≈ 0.42 mA', '≈ 0.60'] }, { ten: '1k', du_doan: ['≈ 4.1 mA', '≈ 0.68'] }, { ten: '220Ω', du_doan: ['≈ 18.3 mA', '≈ 0.75'] }] },
    ],
    bay: ['Cắm diode thẳng vào pin không có điện trở: dòng chỉ bị nội trở pin chặn, diode nóng, 1N4148 chết (~200mA).', 'Nhầm chiều: vạch = cathode = phía −.'],
    robot: ['Diode chống xung ngược motor (bài 7.4), diode chống cắm ngược pin (bài 4.2).', 'Chọn điện trở cho LED phải trừ áp LED: (U − U_LED)/I.'],
  });
})();
