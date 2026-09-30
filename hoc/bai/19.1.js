// Bài 19.1 — Encoder 2 bánh. Thêm 2 khe quang (trái → GPIO11, phải → GPIO13) vào robot 17.1.
// Khe quang gắn trên khung, dây đực–cái: VCC → thanh + dưới (3V3), GND → thanh − dưới, OUT → 46h / 48h; ESP32 → 46i / 48i.
(function () {
  const sd = SD;
  const dia = sd.svg(380, 190, sd.mui
    + '<circle cx="90" cy="95" r="70" class="sd-net"/>' + '<circle cx="90" cy="95" r="10" class="sd-net"/>'
    + Array.from({ length: 20 }, (_, i) => { const a = i * Math.PI / 10; return `<rect x="${90 + 55 * Math.cos(a) - 4}" y="${95 + 55 * Math.sin(a) - 4}" width="8" height="8" class="sd-net" transform="rotate(${i * 18} ${90 + 55 * Math.cos(a)} ${95 + 55 * Math.sin(a)})"/>`; }).join('')
    + sd.hop(130, 30, 30, 50, '') + sd.chu(166, 40, 'khe quang', 'sd-chu') + sd.chu(166, 58, 'đèn ↓ thu', 'sd-mo')
    + sd.chu(200, 100, '20 lỗ × 2 cạnh = 40 xung/vòng', 'sd-mo') + sd.chu(200, 120, 'bánh Ø65mm: 204mm/vòng', 'sd-mo') + sd.chu(200, 140, '→ 5.1mm mỗi xung', 'sd-chu')
    + sd.chu(200, 170, '1m ≈ 196 xung', 'sd-mo'),
    'Đĩa 20 lỗ quay qua khe quang; mỗi lỗ cho 2 cạnh xung, 40 xung mỗi vòng bánh');
  const nen = [...K.robot17(), K.espRobot()];
  const [ET, EP] = K.p4.enc();

  BAI.dangKy({
    id: '19.1',
    muc_tieu: 'Gắn khe quang cho cả 2 bánh để robot đếm được mỗi bánh đã lăn bao xa. Rồi đẩy tay robot đúng 1 mét dọc thước, đếm xung, tính ra mỗi xung ứng với bao nhiêu mm. Con số này là nền của mọi bài định vị sau.',
    nguon: 'USB (đo OUT, nạp) · pack 2S (đẩy thử)',
    can: [K.can.robot17(), { ...K.can.kheQuang(), sl: 2 }, K.can.ducCai(8), K.can.thuoc(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_19_1.c',
    kien_thuc: `
      <p>Bài 15.2 đã đếm vòng một motor trên bàn. Giờ gắn lên robot, mỗi bánh một khe quang. Đĩa 20 lỗ của bộ khung lắp vào trục thứ hai của motor TT, phía trong khung. Khe quang gắn sao cho mép đĩa quay lọt giữa 2 càng của khe, <b>không cọ</b>.</p>
      <p>Code đếm cả cạnh lên lẫn cạnh xuống nên được 40 xung/vòng. Bánh Ø65mm có chu vi π × 65 ≈ 204mm, tức mỗi xung ≈ 5.1mm và 1m ≈ 196 xung. Đường kính bánh thật (lốp cao su bị đè xuống) lệch vài %, nên bài đo lại thay vì tin số này.</p>
      <p>Khe quang chỉ có một kênh, nên <b>không biết bánh quay chiều nào</b>. Code lấy chiều theo lệnh motor gần nhất. Lúc đẩy tay (không có lệnh), code chỉ đếm số xung, không có dấu.</p>
      <p>Thanh nguồn của một số breadboard <b>đứt ở giữa</b>. Bài này là lần đầu robot dùng thanh nguồn ở cột 45 trở đi, nên phải đo thông mạch trước.</p>`,
    so_do: [{ nhan: 'Đĩa + khe quang', svg: dia, chu: 'Mỗi lỗ chạy qua khe cho 1 cạnh lên (hết che) và 1 cạnh xuống (che lại).' }],
    du_doan: '<p>Quay tay 1 vòng bánh trái: <code>nT</code> tăng ~40, <code>nP</code> đứng yên. Đẩy robot đúng 1m: mỗi bánh ~190–200 xung, và hai bánh lệch nhau vài xung. Lệnh BT: chỉ bánh trái quay, chỉ nT tăng.</p>',
    sau: `<h3>Độ phân giải</h3>
      <p>5.1mm mỗi xung là thô: robot đi chậm 100mm/s chỉ có ~20 xung/s, tức 0.4 xung mỗi vòng điều khiển 20ms. Vì vậy code đo tốc độ bằng tổng xung trong 200ms gần nhất (~4 xung, sai ±1 xung = ±25%). Motor TT có loại gắn sẵn encoder từ (Hall) 2 kênh, 11 xung × tỉ số 1:48 × 4 cạnh ≈ 2000 xung/vòng, mịn hơn 50 lần và biết cả chiều quay.</p>
      <h3>Encoder 2 kênh biết chiều thế nào</h3>
      <p>Hai cảm biến đặt lệch nhau 1/4 chu kỳ lỗ (kênh A, B). Quay xuôi thì A lên trước B, quay ngược thì B lên trước A. Bộ đếm PCNT của ESP32 đọc được kiểu này trực tiếp (chế độ quadrature). Đĩa 20 lỗ của bộ khung chỉ có một khe nên phải đoán chiều theo lệnh.</p>
      <h3>Từ xung ra mm</h3>
      <p><code>mm/xung = quãng đẩy (mm) ÷ số xung</code>. Đẩy 1000mm được 198 xung → 5.05mm/xung → điền <b>5050</b> vào menuconfig (đơn vị µm cho khỏi số thập phân). Đẩy 2–3 lần rồi lấy trung bình: mỗi lần lệch 1–2 xung là ±1%.</p>`,
    hoi: [
      ['Bánh Ø66mm, đĩa 20 lỗ, đếm 2 cạnh. Đi 1m được bao nhiêu xung?', 'Chu vi π × 66 ≈ 207mm. 1000 / 207 ≈ 4.82 vòng × 40 ≈ <b>193 xung</b>.'],
      ['Đẩy tay robot lùi 50cm rồi tiến 50cm. nT_tuyet_doi ra bao nhiêu, và odometry sẽ nghĩ robot ở đâu?', 'Đếm không dấu: ~196 xung như đi 1m. Odometry lấy chiều theo lệnh motor, mà lúc đẩy tay không có lệnh, nên nó sẽ nghĩ robot đã đi <b>tới</b> 1m. Encoder 1 kênh không phân biệt được.'],
      ['Vì sao phải đo thông mạch thanh nguồn từ cột 3 tới cột 50?', 'Có loại breadboard mà thanh nguồn đứt ở giữa. Khi đó khe quang ở cột 45 trở đi không có 3V3/GND, OUT thả nổi và đếm bậy.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Gắn và nối khe quang (P+ rút, USB rút)', cot: 63,
        buoc: [
          { ten: 'Robot như cuối bài 17.1', kiem_truoc: true, lam: ['Rút P+ khỏi 44a, rút USB. Mạch giữ nguyên như hình.'], board: { them: nen }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          { ten: 'Thanh nguồn dưới có liền suốt không', kiem_truoc: true, lam: ['Núm <code>thông mạch</code>. Que đỏ thanh + dưới cột 3, que đen thanh + dưới cột 50. Rồi thanh − dưới cột 2 ↔ cột 50.'], board: { them: [K.dh('thông mạch', 'B+:3', 'B+:50', 'kêu')] },
            kiem: { thay: 'Cả 2 cặp đều kêu.', neu_khong: 'Không kêu: thanh đứt giữa. Cắm dây ngắn nối thanh bên trái với thanh bên phải chỗ đứt (+ với +, − với −), rồi đo lại.' } },
          { ten: 'Gắn đĩa + khe quang lên khung', lam: ['Đĩa 20 lỗ vào trục thứ hai của mỗi motor. Khe quang bắt ốc (hoặc băng keo 2 mặt dày) lên khung sao cho mép đĩa nằm giữa 2 càng khe. Xoay tay bánh 1 vòng: đĩa không được cọ vào khe.', '<b>Bánh trái</b> là bánh nối OUT1/OUT2 của driver (bài 17.1).'],
            kiem: { thay: 'Bánh quay tự do, đĩa không chạm khe.', neu_khong: 'Cọ: nới ốc, chỉnh lại. Đĩa cọ là đếm sai và mòn đĩa.' } },
          { ten: 'Dây khe quang trái', kiem_truoc: true, lam: ['Đọc chữ in trên module: VCC, GND, OUT (thứ tự tuỳ shop). Dây đực–cái: VCC → <b>thanh + dưới cột 45</b> (3V3), GND → <b>thanh − dưới cột 45</b>, OUT → <b>46h</b>.', 'Không cắm VCC vào thanh + <b>trên</b>: đó là pin 8.4V.'], board: { them: [ET] },
            kiem: { thay: 'VCC ở thanh có vạch đỏ phía <b>dưới</b>.', neu_khong: '' } },
          { ten: 'Dây khe quang phải', lam: ['VCC → thanh + dưới cột 47, GND → thanh − dưới cột 47, OUT → <b>48h</b>.'], board: { them: [EP] } },
          K.buocOmRobot(['⑤ 46j ↔ thanh − dưới và 48j ↔ thanh − dưới: <b>không gần 0</b> (OUT không chạm GND).']),
          K.doOut('Cắm USB, đo OUT từng khe', ['Pack chưa nối, motor không có điện. Que đỏ <b>46j</b>, que đen thanh − dưới. Xoay tay bánh trái thật chậm. Rồi que đỏ <b>48j</b>, xoay bánh phải.'], '46j', 'B-:46', '≈ 3.3 / 0', 'Mỗi khe: OUT đổi qua lại giữa ≈ 0V và ≈ 3.3V khi xoay bánh, không bao giờ trên 3.4V.'),
          K.rutUsb(),
          { ten: 'Dây tín hiệu', lam: ['USB rút. <code>11</code> → <b>46i</b> (trái), <code>13</code> → <b>48i</b> (phải).'], board: { bo: ['esp'], them: [K.espRobot(K.p4.encEsp)] } },
        ],
      },
      {
        ten: 'Phần 2 · Đếm xung (USB, motor không có điện)', ke_thua: true,
        buoc: [
          K.camUsb('Cắm USB, nạp 19.1', ['menuconfig → Bai hoc → 19.1. Chạy trạm, <code>idf.py flash monitor</code>. Bấm <b>Z</b> trên trạm. Xoay tay bánh trái đúng 1 vòng (đánh dấu bằng băng keo trên lốp). Rồi bánh phải.'], {},
            { thay: 'Bánh trái: nT tăng ~40, nP đứng yên. Bánh phải: ngược lại.', neu_khong: 'Xoay trái mà nP tăng: đổi chỗ 2 dây 46i/48i. Không tăng: kiểm dây GPIO. Tăng lung tung khi đứng yên: khe quang chưa có 3V3 (thanh đứt?).' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 3 · Đẩy 1m, kiểm bên (pack)', ke_thua: true,
        gioi_thieu: 'Dán 2 vạch băng keo giấy trên sàn cách nhau đúng 1000mm, đặt thước dọc theo.',
        buoc: [
          K.camPack('Cắm P+, đẩy 1m', ['Đặt tâm bánh ngay vạch 0. Bấm <b>Z</b>. Đẩy robot thật chậm, thẳng dọc thước, tới khi tâm bánh ngay vạch 1000. Đọc nT, nP. Làm 3 lần.'],
            { thay: 'Mỗi lần nT, nP ~190–200 và 3 lần lệch nhau ≤ 2 xung. Đồ thị "mm_moi_xung_neu_1m" ≈ 5.0–5.3.', neu_khong: 'Lệch nhiều giữa các lần: bánh trượt khi đẩy (đẩy chậm hơn) hoặc đĩa cọ.' }),
          { ten: 'Kiểm bên bằng motor', cap_dien: true, lam: ['Nhấc robot, kê bánh trên không. Bấm <b>BT</b>, chờ 3 giây, rồi <b>BP</b>.'], kiem: { thay: 'BT: chỉ bánh trái quay, chỉ nT tăng. BP: chỉ bánh phải, chỉ nP.', neu_khong: 'BT làm bánh phải quay: motor 2 bên cắm đổi chỗ ở OUT của driver. Sửa dây motor (rút P+ trước), không sửa dây encoder.' } },
          K.rutPack(['Tính <code>µm/xung = 1 000 000 ÷ (trung bình nT, nP của 3 lần)</code>. menuconfig → Robot (Phan 4) → Quang duong moi xung: điền số đó. Các bài sau đều dùng.']),
        ],
      },
    ],
    bang_do: [{ ten: 'Đẩy 1m', cot: ['nT', 'nP'], hang: [{ ten: 'Lần 1', du_doan: ['≈ 196', '≈ 196'] }, { ten: 'Lần 2', du_doan: ['≈ 196', '≈ 196'] }, { ten: 'Lần 3', du_doan: ['≈ 196', '≈ 196'] }] }],
    bay: ['VCC khe quang cắm vào thanh + trên (pin 8.4V): OUT lên 8.4V vào GPIO.', 'Thanh nguồn đứt giữa: khe quang không có điện, đếm bậy.', 'Đĩa cọ vào khe: số xung sai, đĩa mòn.', 'Encoder trái nối vào GPIO13: mọi bài sau quay ngược.'],
    robot: ['Bài 19.2 dùng số xung để đi thẳng, 19.3 để biết robot đang ở đâu.'],
  });
})();
