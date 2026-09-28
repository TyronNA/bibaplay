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
