// Bài 6.1 — Pull-up / pull-down. Nút ở cột 10/12 vắt qua rãnh (chân 10e, 12e, 10f, 12f).
// Pull-up: 10k từ thanh + xuống 10a; cột 12 → thanh −. Điểm đo: cột 10.
(function () {
  const NUT = { id: 'nut', loai: 'nut', o: '10e', nhan: 'nút' };
  const RU = K.tro('ru', ['T+:10', '10a'], '10k'), DG = K.day('dG', '12j', 'B-:12', 'den');
  const RD = K.tro('rd', ['10j', 'B-:10'], '10k'), DV = K.day('dV', 'T+:12', '12a', 'do');
  const sd = SD;
  const soDo = sd.svg(300, 200, sd.pin(40, 100, '') + sd.day('40,100 40,20 150,20') + sd.tro(150, 20, 60, '10k') + sd.cham(150, 80) + sd.nut(150, 80, 80, 'nút')
    + sd.day('150,160 150,185 40,185 40,110') + sd.day('150,80 230,80 230,100') + sd.dongHo(230, 116, 'V') + sd.day('230,132 230,185 150,185') + sd.chu(160, 76, 'điểm đo', 'sd-mo'),
  'Pull-up: 10k kéo điểm đo lên +, nút kéo xuống −');
  BAI.dangKy({
    id: '6.1',
    poster: [13, 14],
    muc_tieu: 'Biến nút nhấn thành tín hiệu 0/1 chắc chắn bằng điện trở kéo lên (pull-up) hoặc kéo xuống (pull-down), và xác định cặp chân của nút 4 chân.',
    can: [K.can.nut(), K.can.tro('10k', 2), ...K.coBan(4)],
    kien_thuc: `<p>Nút 4 chân: 2 cặp chân <b>luôn thông</b> với nhau bên trong; nhấn thì nối 2 cặp lại. Cặp nào là cặp nào thì phải đo (phần 1).</p>
      <p>Pull-up: điểm đo nối lên + qua 10k, nút nối điểm đo xuống −. Nhả: không có dòng, điểm đo = +. Nhấn: điểm đo = 0, dòng qua 10k = 0.48mA.</p>
      <p><b>Không bao giờ</b> nối nút thẳng giữa + và − mà không có điện trở: nhấn là nối tắt pin. Bước đo Ω phải làm <b>cả lúc nhấn</b>.</p>
      <p>Bỏ điện trở thì điểm đo "thả nổi": không nối chắc vào đâu. Đồng hồ (~10MΩ) tự kéo nó về 0 nên ở đây chỉ thấy số trôi khi chạm tay; ở bài 9.3, GPIO sẽ đọc ra 0/1 lung tung.</p>`,
    so_do: [{ nhan: 'Pull-up', svg: soDo, chu: 'Nhả = 1 (≈ U pin), nhấn = 0.' }],
    du_doan: '<p>Pull-up: nhả ≈ 4.78V, nhấn ≈ 0V. Pull-down: ngược lại.</p>',
    phan: [
      {
        ten: 'Phần 1 · Tìm cặp chân của nút',
        buoc: [
          { ten: 'Cắm nút vắt qua rãnh', lam: ['Nút cắm chân vào 10e, 12e, 10f, 12f. Không pin, không dây.'], board: { them: [NUT] } },
          { ten: 'Đo thông mạch cột 10 ↔ cột 12', lam: ['Thang thông mạch (hoặc Ω 200). Que vào lỗ 10c và 12c. Đo lúc nhả rồi lúc nhấn.'], board: { them: [K.dh('thông mạch', '10c', '12c', 'nhả: 1')] },
            kiem: { thay: 'Nhả: không kêu. Nhấn: kêu. Tức cột 10 và cột 12 chỉ nối khi nhấn.', neu_khong: 'Kêu cả lúc nhả: cặp luôn thông đang nằm ngang. Rút nút, <b>xoay 90°</b>, cắm lại, đo lại. Chưa đúng thì chưa đi tiếp.' } },
        ],
      },
      {
        ten: 'Phần 2 · Pull-up', ke_thua: true,
        buoc: [
          { ten: 'Nối hộp pin rỗng, cắm 10k và dây', lam: ['Hộp pin rỗng: đỏ → thanh + trên, đen → thanh − dưới.', '10k từ thanh + (cột 10) cắm thẳng xuống <b>10a</b>. Dây đen <b>12j</b> → thanh −.'], board: { them: [K.PIN, RU, DG] } },
          K.buocOm('Ω 200k', 'nhả: 1 · nhấn: 10.0', 'Nhả: 1 (OL). <b>Nhấn: ≈ 10k</b>, không bao giờ gần 0.', 'Nhấn ra gần 0: nút đang nối thẳng + với − (10k bị đi tắt).', ['Đo 2 lần: nhả và giữ nhấn.']),
          K.lapPin('Lắp pin, đo điểm giữa', ['<code>DCV 20</code>, que đỏ 10c, que đen thanh −. Nhả rồi nhấn.'], { them: [K.dh('DCV 20', '10c', 'B-:15', 'nhả ≈ 4.78')] }, { thay: 'Nhả ≈ 4.78, nhấn ≈ 0.00.', neu_khong: '' }),
          K.thaoPin(['Rút 10k ra (giữ nút và dây đen).'], { bo: ['ru'] }),
          K.lapPin('Lắp pin, đo lại khi không có 10k', ['Que đỏ 10c, que đen thanh −. Nhả. Chạm ngón tay vào đầu que đỏ.'], { them: [K.dh('DCV 20', '10c', 'B-:15', '≈ 0 ?')] }, { thay: 'Nhả mà ra ≈ 0 (đồng hồ tự kéo xuống), chạm tay thì số trôi: điểm này không còn ra "1" chắc chắn.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 3 · Pull-down', ke_thua: true,
        gioi_thieu: 'Đảo vai: nút nối lên +, 10k kéo xuống −.',
        buoc: [
          { ten: 'Đổi mạch khi hộp rỗng', lam: ['Rút dây đen 12j. Cắm dây đỏ thanh + → <b>12a</b>. 10k từ <b>10j</b> cắm thẳng xuống thanh −.'], board: { bo: ['dG'], them: [DV, RD] } },
          K.buocOm('Ω 200k', 'nhả: 1 · nhấn: 10.0', 'Nhả: 1. Nhấn: ≈ 10k.', 'Nhấn ra gần 0: nối tắt.', ['Đo lúc nhả và lúc nhấn.']),
          K.lapPin('Lắp pin, đo điểm giữa', ['Que đỏ 10c, que đen thanh −.'], { them: [K.dh('DCV 20', '10c', 'B-:15', 'nhả ≈ 0')] }, { thay: 'Nhả ≈ 0, nhấn ≈ 4.78.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Điểm đo (V)', cot: ['Nhả', 'Nhấn'], hang: [{ ten: 'Pull-up', du_doan: ['≈ 4.78', '≈ 0'] }, { ten: 'Không điện trở', du_doan: ['≈ 0, trôi', '≈ 0'] }, { ten: 'Pull-down', du_doan: ['≈ 0', '≈ 4.78'] }] }],
    bay: ['Nút nối thẳng + và −: nhấn là nối tắt pin. Luôn có điện trở trên đường đó.', 'Cắm nút sai hướng 90°: cặp luôn thông nối sẵn 2 cột, "nhả" cũng như nhấn.'],
    robot: ['GPIO ESP32 có sẵn pull-up/pull-down ~45k bên trong (bài 9.3). Nút xiaozhi (47/40/39) dùng pull-up nội, nhấn = 0.'],
  });
})();
