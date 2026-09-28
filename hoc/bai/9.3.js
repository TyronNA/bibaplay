// Bài 9.3 — Đọc nút. 3V3 → thanh +, GND → thanh −. 10k: thanh + → 10a. Nút ở cột 10/12. Cột 12 → −. GPIO12 → 10c.
(function () {
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3', G12: '10c' });
  const NUT = { id: 'nut', loai: 'nut', o: '10e', nhan: 'nút' }, RU = K.tro('ru', ['T+:10', '10a'], '10k'), DG = K.day('dG', '12j', 'B-:12', 'den');
  BAI.dangKy({
    id: '9.3',
    poster: [13, 14],
    muc_tieu: 'Làm lại 6.1 với GPIO: nút + pull-up 10k vào GPIO12, in 0/1 ra màn hình. Rồi bỏ 10k và dùng pull-up nội của chip.',
    can: [...K.coBanEsp(3), K.can.nut(), K.can.tro('10k')],
    kien_thuc: `<p>Nhả = 1, nhấn = 0 (pull-up). Code đổi pull-up nội bật/tắt mỗi 10 giây và in ra để thấy cả 2 trường hợp mà không phải nạp lại.</p>
      <p>Pull-up nội ~45kΩ (datasheet). Không có điện trở ngoài và tắt pull-up nội → chân thả nổi, đọc lung tung (chạm tay vào dây thì nhảy loạn).</p>
      <p><b>Nút luôn đi qua điện trở hoặc nối GND</b>. Nối nút thẳng giữa 3V3 và GND: nhấn là nối tắt 3V3. Bước đo Ω phải làm cả lúc nhấn.</p>
      <p>Nút cắm cùng hướng đã kiểm ở 6.1 (nhả: cột 10 ↔ 12 không thông).</p>`,
    code: 'sandbox/esp32-bai/main/bai_9_3.c',
    du_doan: '<p>Có 10k: nhả in 1, nhấn in 0, bất kể pull-up nội. Không 10k: pull-up nội TẮT → số lung tung; BẬT → như có 10k.</p>',
    so_do: [{ nhan: 'Nút + pull-up vào GPIO', svg: SD.svg(300, 200, SD.khoi(20, 40, 80, 'ESP32-S3', [], ['3V3', 'GPIO12', 'GND']) + SD.day('112,60 200,60') + SD.tro(200, 60, 50, '10k')
      + SD.day('200,110 200,125') + SD.cham(200, 120) + SD.day('112,80 160,80 160,120 200,120') + SD.nut(200, 125, 50, 'nút') + SD.day('200,175 135,175 135,100 112,100'),
      'Chân 3V3 qua 10k tới điểm nối GPIO12, nút từ điểm đó xuống GND'), chu: 'Nhả: GPIO12 = 3.3V (đọc 1). Nhấn: nối GND (đọc 0), 10k hạn dòng 0.33mA.' }],
    sau: `<h3>Ngưỡng đọc 0/1 tính từ đâu</h3>
      <p>Datasheet ESP32-S3: mức 1 khi ≥ <code>0.75 × VDD</code> = 2.475V, mức 0 khi ≤ <code>0.25 × VDD</code> = 0.825V. Giữa hai ngưỡng là vùng không xác định: chip có thể đọc ra 0 hoặc 1, và đổi qua lại theo nhiễu. Mạch tốt là mạch không bao giờ để chân nằm lâu trong vùng đó.</p>
      <h3>Pull-up nội yếu hơn 10k</h3>
      <p>Pull-up nội ~45k: nhấn nút tốn <code>3.3/45k ≈ 73µA</code> — tiết kiệm. Đổi lại, cạnh lên chậm hơn và chân dễ bị nhiễu hơn khi dây dài. Nút cạnh board: pull-up nội là đủ. Dây nút chạy dài dọc thân robot, gần motor: thêm 10k ngoài cho chắc.</p>
      <h3>Chân thả nổi đọc ra gì</h3>
      <p>Tay bạn và dây nhảy như ăng-ten bắt nhiễu điện lưới 50Hz. Chân thả nổi dao động quanh vùng giữa, code in 0/1 lẫn lộn theo nhịp nhiễu. Không phải chip hỏng: chân đó không được nối với "sự thật" nào.</p>`,
    hoi: [
      ['Áp ở GPIO12 đo được 1.6V. Chip đọc ra gì?', 'Không chắc: 1.6V nằm giữa 0.825V và 2.475V (vùng không xác định).'],
      ['Nhấn giữ nút có pull-up nội 45k. Dòng bao nhiêu?', '3.3/45k ≈ <b>73µA</b>.'],
      ['Nối nút từ GPIO lên 3V3 (thay vì xuống GND) và bật pull-up nội. Nhấn thì đọc ra gì?', 'Luôn 1 (cả nhả lẫn nhấn). Muốn nối lên 3V3 thì phải dùng pull-down.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Pull-up ngoài 10k',
        buoc: [
          { ten: 'Nút, 10k, dây GND', lam: ['USB rút. Nút vắt qua rãnh 10e/12e/10f/12f. 10k từ thanh + (cột 10) cắm thẳng xuống 10a. Dây đen 12j → thanh −.'], board: { them: [NUT, RU, DG] } },
          { ten: 'Dây từ board', lam: ['<code>3V3</code> → thanh + trên (cột 3). <code>GND</code> → thanh − dưới (cột 3). <code>12</code> → <b>10c</b>.'], board: { them: [ESP] } },
          K.buocOmEsp('Nhả: gần mốc 8.1. <b>Nhấn: ≈ 10k</b> (song song với mốc). Không bao giờ dưới 100Ω.', 'Nhấn ra gần 0: nút đang nối thẳng 3V3 với GND.', ['Đo 2 lần: nhả và giữ nhấn.']),
          K.camUsb('Cắm USB, nạp bài 9.3', ['<code>idf.py menuconfig</code> → 9.3, <code>flash monitor</code>. Nhấn/nhả vài lần trong mỗi đợt 10 giây.'], {}, { thay: 'Cả 2 đợt (pull-up nội BAT/TAT): nhả in 1111…, nhấn in 000….', neu_khong: 'Luôn 0: nút sai hướng hoặc dây GPIO ở cột 12. Luôn 1: dây GPIO chưa vào cột 10.' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Bỏ 10k', ke_thua: true,
        buoc: [
          { ten: 'Rút 10k', lam: ['USB đã rút. Rút 10k ra.'], board: { bo: ['ru'] } },
          K.buocOmEsp('Gần mốc 8.1 cả lúc nhấn: giờ không còn đường nào từ 3V3 qua nút.', 'Gần 0 khi nhấn: kiểm lại.', ['Đo lúc nhả và lúc nhấn.']),
          K.camUsb('Cắm USB, xem 2 đợt', ['Không nhấn gì. Xem đợt TẮT rồi đợt BẬT. Trong đợt TẮT, chạm ngón tay vào dây GPIO.'], {}, { thay: 'Đợt TẮT: số lung tung hoặc đổi khi chạm tay. Đợt BẬT: nhả 1, nhấn 0.', neu_khong: 'Đợt TẮT vẫn đều 1: chân giữ mức cũ một lúc, chạm tay hoặc nhấn nút 1 lần rồi xem.' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: 'In ra', cot: ['Nhả', 'Nhấn'], hang: [{ ten: '10k ngoài', du_doan: ['1', '0'] }, { ten: 'Không 10k, pull-up nội TẮT', du_doan: ['lung tung', '0'] }, { ten: 'Không 10k, pull-up nội BẬT', du_doan: ['1', '0'] }] }],
    bay: ['Nút giữa 3V3 và GND không điện trở: nhấn = nối tắt 3V3.', 'Dùng chân GPIO0 (nút BOOT) làm nút thường: giữ lúc cấp điện là vào chế độ nạp (bài 9.6).'],
    robot: ['Nút xiaozhi (47/40/39): nối chân ↔ GND, code bật pull-up nội — đúng đợt BẬT ở đây.'],
  });
})();
