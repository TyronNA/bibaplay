// Bài 7.4 — Motor qua transistor. Phần 1: đo dòng chạy của motor. Phần 2: S8050 E 12h B 13h C 14h; motor 14j ↔ 17j;
// 1N4007 A 14g (phía C) K 17g (phía +); cột 17 nối thanh + (T+:17 → 17a, 17e → 17f). Chân B: 470Ω 13e→13f, dây bật T+ → 13a, 10k kéo xuống.
(function () {
  const M1 = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 300, chan: { 1: '10j', 2: '14j' }, mau: ['do', 'den'], nhan: 'motor' };
  const P1 = [K.day('dA', 'T+:10', '10a', 'do'), K.day('cau', '10e', '10f', 'do'), K.day('dK', '14f', 'B-:15', 'den', 6)];
  const Q = { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, DE = K.day('dE', '12j', 'B-:12', 'den');
  const D = { id: 'd', loai: 'diode', kieu: '4007', a: '14g', k: '17g', nhan: '1N4007' };
  const VP = [K.day('vp', 'T+:17', '17a', 'do'), K.day('vc', '17e', '17f', 'do')];
  const M2 = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 330, chan: { 1: '17j', 2: '14j' }, mau: ['do', 'den'], nhan: 'motor' };
  const RB = K.tro('rb', ['13e', '13f'], '470'), RD = K.tro('rd', ['13j', 'B-:13'], '10k'), SW = K.day('sw', 'T+:13', '13a', 'vang');
  const sd = SD;
  const soDo = sd.svg(330, 220, sd.pin(30, 110, '') + sd.day('30,110 30,20 200,20 200,40') + sd.motor(200, 70) + sd.day('200,40 200,54') + sd.day('200,86 200,100') + sd.cham(200, 100)
    + sd.day('200,20 250,20 250,40') + `<path d="M240 76H260L250 60Z" class="sd-net sd-to"/><line x1="240" y1="60" x2="260" y2="60" class="sd-net" stroke-width="2.4"/>` + sd.day('250,40 250,100 200,100')
    + sd.day('200,100 200,110') + sd.npn(190, 140) + sd.day('200,170 200,200 30,200 30,120') + sd.troNgang(90, 140, 40, '470Ω') + sd.day('130,140 160,140') + sd.chu(262, 54, 'vạch về +', 'sd-mo'),
  'Motor ở chân C, diode 1N4007 song song motor với vạch hướng về cực dương');
  BAI.dangKy({
    id: '7.4',
    poster: [28, 29],
    muc_tieu: 'Bật motor bằng transistor, có diode chống xung ngược. Đo dòng motor trước để biết transistor có chịu được không.',
    can: [K.can.motor(), K.can.npn(), K.can.d4007(), K.can.tro('470'), K.can.tro('10k'), ...K.coBan(10)],
    kien_thuc: `<p>Cuộn dây motor đang có dòng mà bị ngắt đột ngột thì sinh xung áp rất cao (hàng chục volt) ở chân C: có thể giết transistor. Diode 1N4007 song song motor, <b>vạch (cathode) về phía +</b>, cho dòng đó chạy vòng qua diode rồi tắt dần.</p>
      <p><b>Cắm ngược diode là nối tắt:</b> lúc transistor dẫn, dòng đi thẳng + → diode → transistor → −, không qua motor. Diode và transistor nóng tới cháy. Bước 2.2 kiểm chiều diode bằng đồng hồ trước khi cắm motor.</p>
      <p>S8050 chịu ~0.5A liên tục. Phần 1 đo dòng motor chạy không tải: <b>trên 400mA thì dừng</b>, chờ driver (chương 13). Dòng khởi động (bài 7.3) lớn hơn nhưng chỉ vài trăm ms; <b>không để trục bị kẹt</b> khi dùng transistor.</p>
      <p>Chân B: tải ~0.3A, hFE ở dòng lớn ~100 → Ib ≥ 3mA, dư 3 lần → ~8mA → <code>(4.78 − 0.8)/8mA ≈ 500Ω</code>: dùng 470Ω.</p>`,
    so_do: [{ nhan: 'Sơ đồ', svg: soDo, chu: 'Motor ở phía C (phía +), transistor ở phía − (low-side).' }],
    du_doan: '<p>Dòng chạy không tải của motor quạt nhỏ: 0.1–0.3A. Bật: U_CE ≲ 0.3V, motor chạy gần như cắm thẳng pin.</p>',
    phan: [
      {
        ten: 'Phần 1 · Đo dòng motor cắm thẳng pin', cot: 24,
        buoc: [
          K.buocPin(),
          { ten: 'Motor giữa cột 10 và cột 14', lam: ['Dây đỏ thanh + → 10a, dây đỏ 10e → 10f. Motor: dây 1 (kẹp cá sấu) vào dây nhảy ở 10j, dây 2 vào dây nhảy ở 14j. Dây đen 14f → thanh −.'], board: { them: [...P1, M1] } },
          K.buocOm('Ω 200', '≈ R motor', '≈ số R motor đo ở 7.3 (vài Ω). Thấp là đúng: motor gần như một cuộn dây.', 'Dưới 1Ω: có dây nối tắt thanh + với thanh −, không phải motor.'),
          K.lapPin('Lắp pin 5 giây', ['Motor quay. Tháo pin.'], {}, { thay: 'Motor chạy.', neu_khong: '' }),
          K.thaoPin(['Rút dây đen 14f → thanh −.'], { bo: ['dK'] }),
          { ten: 'Đồng hồ ở 10A, kẹp vào chỗ hở', kiem_truoc: true, lam: ['Que đỏ sang lỗ <code>10A</code>, núm <code>10A</code> (DCA 10). Dây nhảy ở 14h và ở thanh −. Que đỏ vào dây 14h, que đen vào dây thanh −.'], board: { them: [K.dh('DCA 10A', '14h', 'B-:17', '—', '10A')] },
            kiem: { thay: 'Không que nào chạm thanh +.', neu_khong: 'Sửa trước khi lắp pin.' } },
          K.lapPin('Lắp pin, đọc dòng chạy', ['Đợi motor chạy đều 2 giây, đọc số (A). Tháo pin. <b>Trả que đỏ về VΩ, núm về DCV.</b>'], { them: [K.dh('DCA 10A', '14h', 'B-:17', '≈ 0.20', '10A')] },
            { thay: '≤ 0.40A → làm tiếp phần 2.', neu_khong: '<b>> 0.40A: dừng ở đây</b>, S8050 không đủ. Chờ driver (chương 13).' }),
        ],
      },
      {
        ten: 'Phần 2 · Motor qua S8050', cot: 24,
        buoc: [
          K.buocPin(),
          { ten: 'Transistor, diode, cột + ', lam: ['S8050: E 12h, B 13h, C 14h. Dây đen 12j → thanh −.', 'Cột 17 nối +: dây đỏ thanh + → 17a, dây đỏ 17e → 17f.', '1N4007: <b>anode 14g</b> (phía C), <b>vạch bạc 17g</b> (phía +).'], board: { them: [Q, DE, ...VP, D] } },
          { ten: 'Kiểm chiều diode trước khi cắm motor', kiem_truoc: true, lam: ['Thang diode. Que đỏ 14i, que đen 17i. Rồi đảo que.'], board: { them: [K.dh('diode ▶|', '14i', '17i', '≈ 0.55')] },
            kiem: { thay: 'Que đỏ ở 14 (anode): ~0.5–0.6. Đảo: 1.', neu_khong: 'Ngược lại: <b>diode cắm ngược, sửa ngay</b> — để vậy thì bật transistor là nối tắt pin.' } },
          { ten: 'Motor và chân B', lam: ['Motor: dây 1 vào 17j, dây 2 vào 14j.', '470Ω vắt qua rãnh 13e → 13f. 10k từ 13j xuống thanh −. <b>Chưa cắm dây bật.</b>'], board: { them: [M2, RB, RD] } },
          K.buocOm('Ω 200k', '1', '1 (OL): transistor tắt, diode chặn.', 'Vài Ω: C–E đang nối tắt hoặc motor nối thẳng xuống −.'),
          { ten: 'Cắm dây bật, đo lại', kiem_truoc: true, lam: ['Hộp vẫn rỗng. Cắm dây vàng thanh + → 13a. Đo lại 2 tiếp điểm hộp pin.'], board: { them: [SW, K.dh('Ω 200k', 'pin+', 'pin-', '> 0.4')] }, kiem: { thay: 'Lớn hơn ~400Ω (470Ω + B–E).', neu_khong: 'Vài Ω: có chỗ nối tắt, đừng lắp pin.' } },
          K.lapPin('Lắp pin: motor chạy, đo U_CE', ['<code>DCV 20</code>, que đỏ C (14h), que đen E (12h). Sau 5 giây chạm nhanh vào transistor.'], { them: [K.dh('DCV 20', 'q.C', 'q.E', '≈ 0.2')] },
            { thay: 'U_CE ≲ 0.3V. Transistor ấm nhẹ hoặc nguội.', neu_khong: 'U_CE > 0.8V hoặc transistor nóng: tháo pin — chưa bão hoà hoặc motor kéo quá dòng.' }),
          { ten: 'Rút dây bật', lam: ['Rút đầu dây vàng ở thanh +. Motor dừng.'], board: { bo: ['sw'] }, kiem: { thay: 'Motor dừng, không có gì nóng: diode đã hứng xung ngược.', neu_khong: '' } },
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Motor', cot: ['I chạy (10A)', 'U_CE khi bật', 'Transistor sau 5s'], hang: [{ ten: 'Số đo', du_doan: ['0.1–0.3 A', '≲ 0.3', 'nguội/ấm'] }] }],
    bay: ['Không diode: xung ngược giết transistor sau vài lần bật/tắt.', 'Diode cắm ngược: nối tắt pin qua transistor khi bật.', 'Dòng motor > 0.4A: S8050 nóng, chết.', 'Đo dòng motor ở lỗ mA: vượt 200mA, đứt cầu chì đồng hồ. Dùng lỗ 10A.'],
    robot: ['Đúng mạch này với GPIO thay dây bật (bài 11.3). Motor bánh xe robot thì dùng driver cầu H (chương 13) để đổi được chiều.'],
  });
})();
