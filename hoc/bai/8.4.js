// Bài 8.4 — Tụ lọc sát nguồn. 3V3 → thanh + trên, GND → thanh − dưới. Tụ hoá 10µF: + 8c, − 9c. Tụ gốm 100nF: 12c / 13c.
(function () {
  const ESP = K.esp({ '3V3': 'T+:3', GND: 'B-:3' });
  const TH = [{ id: 'c1', loai: 'tu', p: ['8c', '9c'], nhan: '10µF' }, K.day('c1p', 'T+:8', '8a', 'do'), K.day('c1a', '9e', '9f', 'den'), K.day('c1b', '9j', 'B-:9', 'den')];
  const TG = [{ id: 'c2', loai: 'tu', kieu: 'gom', p: ['12c', '13c'], nhan: '100nF' }, K.day('c2p', 'T+:12', '12a', 'do'), K.day('c2a', '13e', '13f', 'den'), K.day('c2b', '13j', 'B-:13', 'den')];
  BAI.dangKy({
    id: '8.4',
    muc_tieu: 'Đặt tụ sát nguồn 3.3V và xem đồng hồ vạn năng thấy được gì (và không thấy được gì) khi WiFi làm chip kéo dòng thành từng đợt.',
    can: [...K.coBanEsp(2), K.can.tuhoa('10µF'), K.can.tugom(), { ten: 'Máy hiện sóng DSO138 (nếu có)', tim: 'DSO138', lk: 'dso138', sl: 1 }],
    kien_thuc: `<p>WiFi phát làm chip kéo thêm vài trăm mA trong vài ms. Dây và ổn áp có điện trở → áp 3V3 sụt một chút đúng lúc đó. Tụ sát chân nguồn là kho nhỏ bù dòng tức thời: tụ gốm 100nF cho những cú rất nhanh, tụ hoá 10µF cho những cú dài hơn.</p>
      <p>Đồng hồ vạn năng cập nhật 2–3 lần/giây và hiện <b>trung bình</b>: cú sụt vài ms gần như không thấy. Có máy hiện sóng (DSO138) thì kẹp vào 3V3 mới thấy gai sụt. Bài này vẫn đáng làm để biết giới hạn của đồng hồ.</p>
      <p>Board đã có sẵn tụ lọc trên đó; tụ thêm ở đây nằm xa chip hơn nên tác dụng nhỏ. Điều cần nhớ là <b>cách đặt</b>: + tụ hoá vào 3V3, − vào GND.</p>`,
    code: 'sandbox/esp32-bai/main/bai_8_4.c',
    du_doan: '<p>Đồng hồ: 3V3 gần như đứng yên cả lúc WiFi bật lẫn tắt (lệch vài mV). Máy hiện sóng: gai sụt vài chục mV lúc quét WiFi, nhỏ đi khi có tụ.</p>',
    so_do: [{ nhan: 'Tụ sát nguồn', svg: SD.svg(320, 190, SD.khoi(20, 40, 80, 'ESP32-S3', [], ['3V3', 'GND']) + SD.day('112,60 300,60') + SD.day('112,80 125,80 125,160 300,160')
      + SD.cham(190, 60) + SD.cham(190, 160) + SD.tu(190, 60, 100, '100nF') + SD.cham(260, 60) + SD.cham(260, 160) + SD.tu(260, 60, 100, '10µF', true),
      'Tụ gốm 100nF và tụ hoá 10 micro fara mắc giữa 3V3 và GND'), chu: '+ tụ hoá về 3V3. Tụ gốm lo cú nhanh, tụ hoá lo cú dài hơn.' }],
    sau: `<h3>Tụ giữ áp được bao lâu</h3>
      <p>Tụ cấp dòng I trong thời gian Δt thì tụt <code>ΔU = I·Δt / C</code>. Một cú WiFi 0.3A kéo dài 1ms mà chỉ trông vào tụ 10µF: ΔU = 0.3 × 10⁻³ / 10⁻⁵ = 30V — nghĩa là tụ cạn ngay. Tụ không thay được ổn áp. Việc của nó là cấp trong <b>vài µs</b> ổn áp cần để phản ứng: 0.3A × 5µs / 10µF ≈ 0.15V.</p>
      <h3>Điện trở trong của tụ</h3>
      <p>Tụ hoá nhỏ có ESR cỡ 0.5–2Ω: cú 0.3A làm sụt ngay 0.15–0.6V trên chính ESR, trước cả khi tụ kịp xả. Tụ gốm ESR vài mΩ. Vì thế đặt cả hai song song: tụ gốm cho cú nhanh, tụ hoá cho năng lượng.</p>
      <h3>Đồng hồ thấy gì</h3>
      <p>Đồng hồ lấy mẫu vài lần mỗi giây và lọc. Gai sụt 50mV kéo dài 1ms, lặp 10 lần/giây làm trung bình chỉ lệch 50mV × 1% = 0.5mV: chìm trong chữ số cuối. Muốn thấy phải có máy hiện sóng.</p>`,
    hoi: [
      ['Tụ 100µF cấp 0.2A trong 0.5ms. Áp tụt bao nhiêu (bỏ qua ESR)?', '0.2 × 0.5×10⁻³ / 10⁻⁴ = <b>1V</b>.'],
      ['Tụ hoá ESR 1Ω, dòng tăng đột ngột 0.3A. Sụt tức thì trên ESR?', '<b>0.3V</b> — vì vậy cần tụ gốm ESR thấp song song.'],
      ['Vì sao đồng hồ vạn năng không thấy gai sụt khi WiFi phát?', 'Nó lấy mẫu chậm (2–3 lần/s) và lấy trung bình; gai vài ms chỉ đổi trung bình vài phần nghìn volt.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Chưa có tụ thêm',
        buoc: [
          { ten: 'Nối 3V3 và GND ra thanh nguồn', lam: ['USB rút. Dây đực–cái: <code>3V3</code> → thanh + trên (cột 3), <code>GND</code> → thanh − dưới (cột 3).', '<b>Không</b> nối chân 5V vào đâu.'], board: { them: [ESP] } },
          K.buocOmEsp(),
          K.camUsb('Cắm USB, nạp bài 8.4, đo 3V3', ['<code>idf.py menuconfig</code> → 8.4, <code>flash monitor</code>. Monitor in "WiFi BAT" / "WiFi TAT" mỗi 10s.', '<code>DCV 20</code>, que đỏ thanh +, que đen thanh −. Ghi số lúc BAT và lúc TAT.'], { them: [K.dh('DCV 20', 'T+:6', 'B-:6', '≈ 3.30')] }, { thay: 'Hai số gần như bằng nhau.', neu_khong: '' }),
          K.rutUsb(),
        ],
      },
      {
        ten: 'Phần 2 · Thêm tụ hoá + tụ gốm', ke_thua: true,
        buoc: [
          { ten: 'Cắm 2 tụ', lam: ['Tụ hoá 10µF: <b>chân dài 8c</b>, chân ngắn 9c. Dây đỏ thanh + → 8a; cột 9 xuống −: dây đen 9e → 9f, 9j → thanh −.', 'Tụ gốm 100nF: 12c, 13c. Dây đỏ thanh + → 12a; cột 13 xuống −: 13e → 13f, 13j → thanh −.'], board: { them: [...TH, ...TG] } },
          K.buocOmEsp('Số bắt đầu thấp rồi tăng dần (tụ đang nạp), rồi đứng ở gần mốc 8.1. <b>Không dưới 100Ω</b>.'),
          K.camUsb('Cắm USB, đo lại', ['Code đã nạp, chạy lại. Đo như phần 1. Sờ tụ hoá sau 30 giây.'], { them: [K.dh('DCV 20', 'T+:6', 'B-:6', '≈ 3.30')] }, { thay: 'Số như phần 1; tụ nguội.', neu_khong: 'Tụ ấm: <b>rút USB</b>, tụ đang ngược.' }),
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: '3V3 (DCV)', cot: ['WiFi BẬT', 'WiFi TẮT'], hang: [{ ten: 'Không tụ thêm', du_doan: ['≈ 3.30', '≈ 3.30'] }, { ten: 'Có tụ', du_doan: ['≈ 3.30', '≈ 3.30'] }] }],
    bay: ['Tụ hoá cắm ngược giữa 3V3 và GND: nóng, phồng.', 'Nối nhầm chân 5V vào thanh + đang nối 3V3: 2 nguồn đấu nhau.', 'Kẹp mass (GND) máy hiện sóng vào 3V3: nối tắt 3V3 xuống GND qua máy.'],
    robot: ['Mỗi module (mic, ampli, OLED, driver) có tụ 100nF sát chân nguồn; ampli và motor thêm tụ hoá to (100µF+) vì kéo dòng thành từng cú lớn.'],
  });
})();
