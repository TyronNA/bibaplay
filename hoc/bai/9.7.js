// Bài 9.7 — UART tự gửi tự nhận: GPIO10 (TX) → 10a, GPIO11 (RX) → 13a, 1k 10c → 13c, GND → thanh −.
// 1k nối tiếp: nếu lỡ cấu hình cả 2 chân là ngõ ra, 2 chân đấu nhau qua 1k (≤ 3.3mA) chứ không chập thẳng.
(function () {
  const ESP = K.esp({ G10: '10a', G11: '13a', GND: 'B-:3' });
  const R = K.tro('r', ['10c', '13c'], '1k');
  const sd = SD;
  const soDo = sd.svg(320, 150, sd.khoi(20, 30, 100, 'ESP32-S3', [], ['GPIO10 TX', 'GPIO11 RX', 'GND']) + sd.day('132,50 170,50') + sd.troNgang(170, 50, 60, '1k') + sd.day('230,50 260,50 260,70 132,70'),
    'Chân TX GPIO10 qua 1k nối về chân RX GPIO11 của cùng board');
  const khung = sd.svg(340, 140, (() => {
    // khung 1 byte 0x78 ('x'): nghỉ 1, start 0, 8 bit LSB trước 0 0 0 1 1 1 1 0, stop 1
    const b = [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1], x0 = 20, w = 26;
    let p = `${x0},40`, y = 40;
    b.forEach((v, i) => { const yy = v ? 40 : 90; p += ` ${x0 + i * w},${yy} ${x0 + (i + 1) * w},${yy}`; y = yy; });
    const nhan = ['nghỉ', 'start', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'stop', 'nghỉ'];
    return sd.day(p) + nhan.map((t, i) => sd.chu(x0 + i * w + w / 2, 116, t, 'sd-mo', 'middle')).join('') + sd.chu(x0, 24, '3.3V = 1', 'sd-mo') + sd.chu(x0, 104, '0V', 'sd-mo');
  })(), 'Khung truyền một byte chữ x: bit start mức 0, 8 bit dữ liệu từ bit thấp, bit stop mức 1');

  BAI.dangKy({
    id: '9.7',
    muc_tieu: 'UART: 2 thiết bị nói chuyện qua 1 dây mỗi chiều, không cần dây clock — hai bên hẹn trước tốc độ (baud). Board tự gửi một dòng chữ ra chân TX rồi tự đọc lại ở chân RX.',
    can: [...K.coBanEsp(3), K.can.tro('1k')],
    code: 'sandbox/esp32-bai/main/bai_9_7.c',
    kien_thuc: `
      <p>Lúc nghỉ, dây TX ở mức <b>1</b> (3.3V). Gửi một byte: kéo xuống 0 đúng 1 nhịp (bit <b>start</b>), rồi 8 bit dữ liệu, bit thấp trước, rồi 1 nhịp mức 1 (bit <b>stop</b>). Bên nhận thấy cạnh xuống của bit start là bắt đầu đếm nhịp theo baud đã hẹn, lấy mẫu giữa mỗi bit.</p>
      <p>115200 baud = 115 200 nhịp/giây → mỗi bit ≈ 8.68µs, mỗi byte 10 bit ≈ 87µs. Dòng "xin chao 12⏎" 12 byte ≈ 1.04ms.</p>
      <p>Log bạn thấy trên monitor đi đường USB riêng (cổng USB của chip hoặc UART0 qua chip USB-serial trên board), không dính gì tới UART1 của bài này. Chân GPIO10/11 tự chọn; UART1 của ESP32-S3 gán được ra hầu hết chân nhờ ma trận GPIO.</p>
      <p>Nối 2 thiết bị khác nhau thì <b>chéo</b>: TX bên này → RX bên kia, và <b>chung GND</b> (bài 8.3). Thiết bị 5V (Arduino Uno, module GPS cũ) thì TX của nó vào RX của ESP32 phải qua hạ áp (bài 9.5).</p>`,
    so_do: [{ nhan: 'Tự gửi tự nhận', svg: soDo, chu: 'TX → 1k → RX trên cùng board.' }, { nhan: 'Một byte trên dây', svg: khung, chu: 'Chữ "x" = 0x78 = 0111 1000, gửi bit thấp trước.' }],
    du_doan: '<p>Monitor mỗi giây in <code>gui 11 byte, nhan lai DUNG sau ~1000 us</code> (11–12 byte × 87µs + chút thời gian driver). Đồng hồ ở chân TX lúc nghỉ ≈ 3.3V. Rút 1k: <code>HET GIO</code>.</p>',
    sau: `<h3>Hai bên lệch baud bao nhiêu thì hỏng</h3>
      <p>Bên nhận lấy mẫu giữa bit, và đồng bộ lại ở mỗi bit start. Tới bit stop (bit thứ 10), sai lệch tích luỹ phải &lt; nửa bit: <code>10 × lệch &lt; 0.5</code> → tổng lệch 2 bên ≲ 5%, thực tế nên &lt; 2–3%. Clock thạch anh lệch cỡ 0.005% nên dư xa; bộ dao động RC bên trong chip rẻ lệch 1–2% là bắt đầu lỗi ở baud cao.</p>
      <h3>Tốc độ thật</h3>
      <p>8 bit dữ liệu tốn 10 nhịp → hiệu suất 80%: 115200 baud ≈ 11 520 byte/s. Âm thanh 16kHz × 16 bit = 32 000 byte/s không đi qua UART 115200 được — vì thế mic dùng I2S (bài 12.2). UART hợp cho lệnh, log, GPS, module AT.</p>
      <h3>Không có clock thì đồng bộ bằng gì</h3>
      <p>Bằng cạnh xuống của bit start và bằng việc 2 bên tin nhau về baud. I2C, SPI, I2S có dây clock riêng nên không cần hẹn tốc độ chính xác — đổi lại tốn thêm dây.</p>`,
    hoi: [
      ['9600 baud. Một byte mất bao lâu? Gửi 100 byte?', '10 bit / 9600 ≈ <b>1.04ms</b>; 100 byte ≈ <b>104ms</b>.'],
      ['Nối ESP32 với module GPS: TX nối TX, RX nối RX. Có chạy không?', '<b>Không</b>: phải chéo, TX → RX. Và chung GND.'],
      ['Monitor in HET GIO dù dây vẫn cắm. Nghi gì?', 'Dây 1k cắm lệch cột (không nối 10 với 13), hoặc chân trên board không đúng số 10/11 (đếm theo chữ in).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Tự gửi tự nhận',
        buoc: [
          { ten: 'Dây từ board và 1k', lam: ['USB rút. <code>10</code> → <b>10a</b>, <code>11</code> → <b>13a</b>, <code>GND</code> → thanh − dưới (cột 3).', '1k (' + K.tenVong('1k') + ') nằm ngang <b>10c → 13c</b>.'], board: { them: [ESP, R] } },
          { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['Cáp USB chưa cắm. <code>Ω 200k</code>: que đỏ 10d, que đen thanh −. Rồi que đỏ 13d.'], board: { them: [K.dh('Ω 200k', '10d', 'B-:6', '> 1')] },
            kiem: { thay: 'Cả hai lớn hơn 1k (thường vài chục k trở lên, số chạy dần). Không gần 0.', neu_khong: 'Gần 0: dây GPIO cắm nhầm vào thanh −. <b>Không cắm USB</b>.' } },
          K.camUsb('Cắm USB, nạp 9.7', ['<code>idf.py menuconfig</code> → 9.7, <code>flash monitor</code>.'], {}, { thay: 'Mỗi giây: <code>gui … byte, nhan lai DUNG sau ~1000 us</code>.', neu_khong: 'HET GIO: kiểm 1k có nối cột 10 với 13 không, dây ở đúng chân 10/11 chưa.' }),
          { ten: 'Đo chân TX lúc nghỉ', cap_dien: true, lam: ['<code>DCV 20</code>, que đỏ 10e, que đen thanh −.'], board: { them: [K.dh('DCV 20', '10e', 'B-:6', '≈ 3.29')] },
            kiem: { thay: '≈ 3.3V: dây nghỉ ở mức 1. Mỗi giây dây chỉ bận ~1ms nên đồng hồ gần như không thấy.', neu_khong: '' } },
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Rút dây', ke_thua: true,
        buoc: [
          { ten: 'Rút 1k', lam: ['USB rút. Rút con 1k ra.'], board: { bo: ['r'] } },
          K.camUsb('Cắm USB, xem monitor', ['Không cần nạp lại.'], {}, { thay: '<code>HET GIO / SAI: nhan duoc 0/… byte</code> sau 100ms mỗi lần.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: 'UART 115200', cot: ['Thời gian (µs)', 'TX nghỉ (V)'], hang: [{ ten: 'Có 1k', du_doan: ['≈ 1000', '≈ 3.3'] }, { ten: 'Không 1k', du_doan: ['hết giờ', '≈ 3.3'] }] }],
    bay: ['Nối TX với TX: không ai nghe ai.', 'Quên GND chung khi nối 2 thiết bị: bên nhận đọc rác.', 'Nối TX 5V của thiết bị khác thẳng vào RX ESP32: quá 3.6V.', 'Hai bên khác baud: nhận ra ký tự rác (thường thấy "�").'],
    robot: ['Module GPS, cảm biến bụi, LiDAR rẻ, module âm thanh… nói UART. ESP32-S3 có 3 bộ UART gán được ra hầu hết chân.'],
  });
})();
