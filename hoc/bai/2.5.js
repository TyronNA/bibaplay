// Bài 2.5 — Cầu phân áp bị tải. R1 10k: 6e → 6f; R2 10k: 6j → thanh −; tải: 6i → thanh − (cột 9).
(function () {
  const DA = K.day('dA', 'T+:6', '6a', 'do');
  const R1 = K.tro('r1', ['6e', '6f'], '10k'), R2 = K.tro('r2', ['6j', 'B-:6'], '10k');
  const tai = gt => K.tro('rl', ['6i', 'B-:9'], gt, { nhan: 'tải ' + gt + 'Ω' });
  const sd = SD;
  const soDo = sd.svg(300, 200, sd.pin(40, 100, '4.78V') + sd.day('40,100 40,20 140,20') + sd.tro(140, 20, 70, '10k') + sd.tro(140, 90, 70, '10k')
    + sd.cham(140, 90) + sd.day('140,90 220,90 220,100') + sd.tro(220, 100, 60, 'tải') + sd.day('140,160 140,180 40,180 40,110') + sd.day('220,160 220,180 140,180') + sd.chu(150, 84, 'U giữa', 'sd-mo'),
  'Cầu 10k + 10k, tải mắc song song với con phía dưới');
  BAI.dangKy({
    id: '2.5',
    muc_tieu: 'Thấy áp ở giữa cầu phân áp tụt khi có tải lấy dòng từ nó. Vì thế cầu phân áp dùng để <b>đo</b> (ADC, đồng hồ lấy rất ít dòng) chứ không dùng làm nguồn.',
    can: [K.can.tro('10k', 3), K.can.tro('100k'), K.can.tro('1k'), ...K.coBan(2)],
    kien_thuc: `<p>Không tải: <code>U_giữa = U · R2/(R1+R2)</code> = 2.39V. Tải R_L song song với R2 làm "R2" nhỏ đi thành <code>R2∥R_L</code>, nên U_giữa tụt.</p>
      <p>Tải càng nhỏ (lấy càng nhiều dòng) càng tụt. Quy tắc tay: tải phải lớn hơn R2 cỡ 10 lần thì áp mới gần đúng.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'R_L là tải: 100k, 10k, rồi 1k.' }],
    du_doan: '<p>Không tải 2.39V · 100k: 2.28V · 10k: 1.59V · 1k: 0.40V.</p>',
    phan: [
      {
        ten: 'Phần 1 · Cầu không tải',
        buoc: [
          K.buocPin(),
          { ten: 'Cắm cầu 10k + 10k', lam: ['Dây đỏ thanh + → 6a. R1 10k vắt qua rãnh 6e → 6f. R2 10k từ <b>6j</b> cắm thẳng xuống thanh − (cột 6).', 'Cột 6 phía dưới (6f–6j) là điểm giữa.'], board: { them: [DA, R1, R2] } },
          K.buocOm('Ω 200k', '≈ 20.0', '≈ 20k.', 'Gần 10k: R1 hoặc R2 đang bị nối tắt.'),
          K.lapPin('Lắp pin, đo U giữa', ['<code>DCV 20</code>, que đỏ 6h, que đen thanh −.'], { them: [K.dh('DCV 20', '6h', 'B-:11', '≈ 2.39')] }, { thay: '≈ 2.39V (một nửa áp pin).', neu_khong: '' }),
        ],
      },
      {
        ten: 'Phần 2 · Thêm tải 100k → 10k → 1k', ke_thua: true,
        buoc: [
          K.thaoPin(['Tải 100k: từ <b>6i</b> xuống thanh − ở cột 9.'], { them: [tai('100k')] }),
          K.buocOm('Ω 200k', '≈ 19.1', '≈ 19.1k.', 'Dưới 10k: có chỗ nối tắt.'),
          K.lapPin('Lắp pin, đo U giữa', ['Que đỏ 6h, que đen thanh −.'], { them: [K.dh('DCV 20', '6h', 'B-:11', '≈ 2.28')] }, { thay: '≈ 2.28V: tụt ít.', neu_khong: '' }),
          K.thaoPin(['Đổi tải thành <b>10k</b>, cùng chỗ 6i → thanh −.'], { bo: ['rl'], them: [tai('10k')] }),
          K.buocOm('Ω 200k', '≈ 15.0', '≈ 15k.', 'Dưới 10k: kiểm lại.'),
          K.lapPin('Lắp pin, đo U giữa', ['Như trên.'], { them: [K.dh('DCV 20', '6h', 'B-:11', '≈ 1.59')] }, { thay: '≈ 1.59V: tụt 1/3.', neu_khong: '' }),
          K.thaoPin(['Đổi tải thành <b>1k</b>.'], { bo: ['rl'], them: [tai('1k')] }),
          K.buocOm('Ω 20k', '≈ 10.9', '≈ 10.9k (R1 10k + phần dưới ~0.9k).', 'Dưới 10k: 1k đang nối thẳng từ thanh + xuống.'),
          K.lapPin('Lắp pin, đo U giữa', ['Như trên.'], { them: [K.dh('DCV 20', '6h', 'B-:11', '≈ 0.40')] }, { thay: '≈ 0.40V: gần như sập.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'U giữa theo tải', cot: ['Ω trước khi cấp', 'U giữa'], hang: [
      { ten: 'Không tải', du_doan: ['≈ 20k', '≈ 2.39'] }, { ten: 'Tải 100k', du_doan: ['≈ 19.1k', '≈ 2.28'] }, { ten: 'Tải 10k', du_doan: ['≈ 15k', '≈ 1.59'] }, { ten: 'Tải 1k', du_doan: ['≈ 10.9k', '≈ 0.40'] }] }],
    bay: ['Cắm tải từ 6i lên thanh + thay vì xuống thanh −: tải song song R1, áp giữa lại tăng — không cháy nhưng kết quả ngược.', 'Lấy áp giữa cầu để nuôi LED/module: áp sập ngay khi tải lấy dòng (bài 2.3 kiểu C).'],
    robot: ['Cầu phân áp đo áp pin cho ESP32 (bài 10.3): ADC lấy rất ít dòng nên áp không tụt.', 'Muốn cấp điện 3.3V thì dùng ổn áp (bài 8.2), không dùng cầu phân áp.'],
  });
})();
