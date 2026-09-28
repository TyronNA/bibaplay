// Bài 13.4 — MOSFET IRLZ44N thay S8050 ở mạch 11.3. TO-220, mặt chữ về phía bạn: G 12h, D 13h, S 14h.
// S: 14j → −. G: 220Ω 12e → 12f, GPIO14 → 12a, 10k 12j → −. D: motor 13j ↔ 17j, 1N4007 A 13i, K (vạch) 17i; cột 17 ← thanh +.
(function () {
  const Q = { id: 'q', loai: 'npn', chu: 'IRLZ44N', to220: true, ten_chan: ['G', 'D', 'S'], e: '12h', b: '13h', c: '14h', khong_mp: true };
  const DS = K.day('dS', '14j', 'B-:14', 'den');
  const RG = K.tro('rg', ['12e', '12f'], '220'), RD = K.tro('rd', ['12j', 'B-:12'], '10k');
  const D = { id: 'd', loai: 'diode', kieu: '4007', a: '13i', k: '17i', nhan: '1N4007' };
  const VP = [K.day('vp', 'T+:17', '17a', 'do'), K.day('vc', '17e', '17f', 'do')];
  const M = { id: 'm', loai: 'ngoai', kieu: 'motor', x: 420, chan: { 1: '17j', 2: '13j' }, mau: ['do', 'den'], nhan: 'motor' };
  const ESP = K.esp({ G14: '12a', GND: 'B-:22' }, { x: 250 });
  const sd = SD;
  const soDo = sd.svg(360, 240, sd.khoi(20, 60, 80, 'ESP32-S3', [], ['GPIO14', 'GND']) + sd.day('112,80 130,80 130,150') + sd.troNgang(130, 150, 60, '220Ω') + sd.day('190,150 210,150') + sd.cham(200, 150)
    + sd.day('200,150 200,155') + sd.tro(200, 155, 50) + sd.chu(186, 186, '10k', 'sd-chu', 'end') + sd.day('200,205 200,220') + sd.mosfet(240, 150) + sd.day('250,180 250,220')
    + sd.pin(320, 110) + sd.chu(330, 150, 'hộp pin', 'sd-mo', 'middle') + sd.day('320,110 320,30 250,30 250,62') + sd.motor(250, 78) + sd.day('250,94 250,120') + sd.cham(290, 30) + sd.cham(250, 110)
    + sd.day('290,30 290,50') + sd.diodeLen(290, 50, 50, '1N4007') + sd.day('290,100 290,110 250,110') + sd.day('320,120 320,220 112,220') + sd.day('112,100 120,100 120,220') + sd.cham(250, 220) + sd.cham(200, 220),
    'GPIO14 qua 220 ôm vào G của IRLZ44N, 10k kéo G xuống S; motor và diode ngược từ cực dương pin xuống D; S về GND chung');

  BAI.dangKy({
    id: '13.4',
    muc_tieu: 'MOSFET làm công tắc cho motor thay transistor lưỡng cực: điều khiển bằng áp chứ không bằng dòng, lúc dẫn gần như không mất áp. Đo U_DS so với U_CE của S8050 ở bài 11.3.',
    nguon: 'USB (board) + 3×AAA (motor)',
    can: [...K.coBanEsp(2), K.can.pin(), K.can.motor(), { ten: 'MOSFET IRLZ44N', tim: 'IRLZ44N', lk: 'irlz44n', sl: 1 }, K.can.d4007(), K.can.tro('220'), K.can.tro('10k')],
    code: 'sandbox/esp32-bai/main/bai_11_3.c',
    kien_thuc: `
      <p>MOSFET kênh N: cổng G cách điện với kênh D–S bằng một lớp ô-xít mỏng. Áp G–S vượt ngưỡng (IRLZ44N: 1–2V) thì kênh dẫn; G gần như <b>không ăn dòng</b> một chiều. Dẫn hẳn thì D–S như một điện trở rất nhỏ R_DS(on) — datasheet bảo đảm ≤ 0.035Ω ở U_GS = 4V. Ở 3.3V của GPIO datasheet không bảo đảm; với motor nhỏ (≤ 1A) thường vẫn dẫn tốt — bài này đo để biết.</p>
      <p>So với S8050 (bài 11.3): S8050 cần dòng B vài mA từ GPIO và lúc bão hoà vẫn mất U_CE ~0.1–0.3V; IRLZ44N lúc dẫn chỉ mất <code>I × R_DS(on)</code> — 0.3A × ~0.05Ω ≈ 15mV. Mất ít áp = ít nhiệt: <code>P = I² × R_DS</code>.</p>
      <p><b>10k từ G xuống S</b>: lúc ESP32 đang khởi động, chân GPIO chưa cấu hình, thả nổi — G thả nổi thì MOSFET có thể dẫn lưng chừng và nóng. 10k giữ G ở 0. <b>220Ω nối tiếp G</b>: G như một tụ vài nF; mỗi lần bật GPIO phải nạp tụ đó, 220Ω giới hạn cú dòng nạp.</p>
      <p>Code dùng lại bài 11.3 (PWM 1kHz ở GPIO14: 30% → 60% → 100% → 0%, mỗi mức 5s). Diode ngược song song motor vẫn bắt buộc; diode có sẵn trong thân MOSFET nằm sai chỗ để thay nó.</p>`,
    so_do: [{ nhan: 'MOSFET phía dưới motor', svg: soDo, chu: 'G điều khiển bằng áp. 10k giữ G ở 0 khi chip chưa chạy.' }],
    du_doan: '<p>Duty 100%: U_DS ≈ 10–50mV (so với U_CE ~0.1–0.3V của S8050 ở 11.3); MOSFET nguội. U_GS ≈ 3.3V. Ở 30% motor có thể chỉ rung như 11.3 — MOSFET không đổi được điều đó, đó là việc của motor.</p>',
    sau: `<h3>Tại sao G "ăn" dòng lúc chuyển mạch</h3>
      <p>G–S là tụ C_iss (IRLZ44N cỡ 1.7nF theo datasheet). Nạp tụ đó lên 3.3V mỗi lần bật: <code>Q = C·U ≈ 5.6nC</code>. Qua 220Ω, τ = 220 × 1.7nF ≈ 0.4µs: bật trong ~1µs. Ở PWM 1kHz, dòng trung bình để nạp/xả G chỉ ~11µA — nhưng đỉnh lúc chuyển là <code>3.3/220 ≈ 15mA</code>. Không có 220Ω, đỉnh đó bị giới hạn bởi chính điện trở trong của chân GPIO.</p>
      <h3>Khi nào MOSFET cần driver cổng</h3>
      <p>Ở PWM 20–100kHz với MOSFET lớn (C_iss hàng chục nF), GPIO không nạp/xả G kịp: MOSFET đi qua vùng lưng chừng lâu, tổn hao chuyển mạch tăng (bài 11.3). Khi đó dùng IC driver cổng (dòng đỉnh vài A) hoặc MOSFET "logic-level" nhỏ hơn. Module DRV8833 đã có sẵn tất cả những thứ này bên trong.</p>
      <h3>So nhiệt với S8050</h3>
      <p>Motor 0.3A: S8050 bão hoà U_CE 0.2V → 60mW; IRLZ44N R_DS 0.05Ω → 4.5mW. Ở 2A (motor TT kẹt): S8050 chết (quá 0.5A), IRLZ44N 0.2W — vỏ TO-220 ấm, không cần tản nhiệt.</p>`,
    hoi: [
      ['R_DS(on) = 0.04Ω, dòng 1.5A. MOSFET đốt bao nhiêu W? U_DS bao nhiêu?', 'P = 1.5² × 0.04 = <b>0.09W</b>; U_DS = 1.5 × 0.04 = <b>60mV</b>.'],
      ['Bỏ 10k rồi rút dây GPIO khi đang có pin. Chuyện gì có thể xảy ra?', 'G thả nổi, giữ điện tích cũ hoặc bắt nhiễu → MOSFET có thể còn dẫn hoặc dẫn lưng chừng và nóng. Motor không tắt chắc.'],
      ['Vì sao vẫn cần 1N4007 dù MOSFET có diode trong thân?', 'Diode trong thân nối D–S, chỉ bảo vệ khi D xuống dưới S. Xung ngược của motor đẩy D lên cao hơn nguồn; phải có diode song song motor để kẹp.'],
    ],
    phan: [{
      ten: 'Phần 1 · MOSFET chạy motor', cot: 34,
      buoc: [
        K.buocPin(),
        { ten: 'Cắm MOSFET, S xuống −', kiem_truoc: true, lam: ['Cầm IRLZ44N ở thân/tai, không chạm 3 chân (tĩnh điện). Mặt có chữ về phía bạn, chân chúc xuống: <b>G · D · S</b> từ trái sang (datasheet). Cắm G 12h, D 13h, S 14h.', 'Dây đen <b>14j → thanh −</b>.'], board: { them: [Q, DS] },
          kiem: { thay: 'Chữ IRLZ44N đọc được, mặt chữ quay ra ngoài.', neu_khong: 'Chữ khác (IRFZ44N, IRF540…): đó <b>không</b> phải loại logic-level, 3.3V không mở đủ — đừng dùng cho bài này.' } },
        { ten: 'G: 220Ω và 10k', lam: ['220Ω vắt qua rãnh <b>12e → 12f</b>. 10k từ <b>12j</b> xuống thanh −.'], board: { them: [RG, RD] } },
        { ten: 'Cột +, diode', lam: ['Dây đỏ thanh + → <b>17a</b>, dây đỏ <b>17e → 17f</b>. 1N4007: anode 13i, <b>vạch 17i</b>.'], board: { them: [...VP, D] } },
        { ten: 'Kiểm chiều diode trước khi cắm motor', kiem_truoc: true, lam: ['Thang diode: que đỏ 13g, que đen 17g → ~0.55. Đảo que → 1.'], board: { them: [K.dh('diode ▶|', '13g', '17g', '≈ 0.55')] }, kiem: { thay: 'Đúng như trên.', neu_khong: '<b>Diode ngược, sửa ngay.</b>' } },
        { ten: 'Motor', lam: ['Motor: dây 1 → <b>17j</b>, dây 2 → <b>13j</b>.'], board: { them: [M] } },
        { ten: 'Dây từ board', lam: ['<code>14</code> → <b>12a</b>. <code>GND</code> → thanh − dưới (cột 22).'], board: { them: [ESP] } },
        K.buocOm('Ω 200k', '1', '1 (OL) ở tiếp điểm hộp pin: MOSFET tắt, D–S hở.', 'Vài Ω: D–S chạm nhau hoặc motor nối thẳng xuống −.', ['Thêm: que đỏ 12c (G), que đen thanh − → ≈ 10k (điện trở kéo xuống). Que đỏ 12c, que đen thanh + → 1 (OL).']),
        K.camUsb('Cắm USB trước, nạp 11.3', ['<code>idf.py menuconfig</code> → 11.3 (dùng lại code PWM GPIO14), <code>flash monitor</code>. Hộp pin vẫn rỗng.'], {}, { thay: 'Monitor in "motor duty …%".', neu_khong: '' }),
        K.lapPin('Rồi lắp pin, đo lúc 100%', ['Khi monitor báo 100%: <code>DCV 2</code>, que đỏ D (13g), que đen S (14g): U_DS. Rồi <code>DCV 20</code>, que đỏ G (12g), que đen S: U_GS. Chạm nhanh vào MOSFET.'], { them: [K.dh('DCV 2', '13g', '14g', '≈ 0.02')] },
          { thay: 'U_DS vài chục mV, U_GS ≈ 3.3V, MOSFET nguội. Tốc độ theo duty như 11.3.', neu_khong: 'U_DS &gt; 0.3V hoặc MOSFET ấm: G chưa đủ áp (kiểm 220Ω/dây 12a) hoặc không phải loại logic-level. Motor không bao giờ dừng: G thả nổi — kiểm 10k.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Công tắc motor ở 100%', cot: ['U mất trên công tắc', 'Nóng?'], hang: [{ ten: 'S8050 (bài 11.3, U_CE)', du_doan: ['≈ 0.1–0.3 V', 'ấm nhẹ'] }, { ten: 'IRLZ44N (U_DS)', du_doan: ['≈ 0.01–0.05 V', 'nguội'] }] }],
    bay: ['Mua nhầm IRFZ44N / IRF540 (cần 10V ở G): 3.3V chỉ mở một chút, MOSFET nóng.', 'Không có 10k G → S: motor giật lúc cắm USB (chân chưa cấu hình).', 'Chạm tay vào chân G khi cầm: tĩnh điện có thể thủng lớp ô-xít — cầm ở tai kim loại.', 'Bỏ diode ngược vì "MOSFET có diode trong thân".'],
    robot: ['Bơm, quạt, dải LED 12V, nam châm điện một chiều: một MOSFET logic-level + 10k + diode là đủ, rẻ hơn module driver.', 'Motor cần 2 chiều thì vẫn là cầu H (DRV8833 bên trong là 4 MOSFET).'],
  });
})();
