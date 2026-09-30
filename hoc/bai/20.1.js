// Bài 20.1 — Bám vạch bằng 2 TCRT5000 (AO trái → GPIO4, phải → GPIO5). Encoder + GY-521 của chương 19 giữ nguyên, hình không vẽ lại.
(function () {
  const sd = SD;
  const vach = sd.svg(380, 200, sd.mui
    + `<rect x="160" y="10" width="40" height="180" class="sd-net sd-to"/>` + sd.chu(206, 24, 'vạch đen 18mm', 'sd-mo')
    + `<circle cx="150" cy="120" r="12" class="sd-net"/><circle cx="210" cy="120" r="12" class="sd-net"/>` + sd.chu(94, 124, 'mắt trái', 'sd-chu') + sd.chu(228, 124, 'mắt phải', 'sd-chu')
    + sd.chu(10, 160, 'giữa vạch: 2 mắt thấy sàn, e = 0', 'sd-mo') + sd.chu(10, 180, 'vạch lệch trái: mắt trái đen hơn → e > 0 → quay trái', 'sd-mo')
    + K.mt(180, 150, 180, 100) + sd.chu(186, 90, 'robot đi', 'sd-mo'),
    'Hai mắt TCRT5000 nằm hai bên vạch đen; vạch lệch sang bên nào thì mắt bên đó đen hơn');
  const [TT, TP] = K.p4.tcrt();

  BAI.dangKy({
    id: '20.1',
    muc_tieu: 'Robot bám theo một vạch băng keo đen trên sàn sáng màu. Hai mắt TCRT5000 úp sát sàn, một bên trái một bên phải vạch. Mắt nào thấy đen hơn thì robot quay về phía đó. Đây là vòng điều khiển PD đầu tiên dùng số đo analog thay cho encoder.',
    nguon: 'USB (đo AO, nạp) · pack 2S (chạy)',
    can: [K.can.robot17(), { ...K.can.tcrt(), sl: 2 }, K.can.ducCai(6), K.can.bangKeoDen(), K.can.wifi(), K.can.usb(), K.can.dh()],
    code: 'sandbox/esp32-bai/main/bai_20_1.c',
    kien_thuc: `
      <p>TCRT5000 (14.4) chiếu hồng ngoại xuống sàn và đo lượng dội lại. Chân <b>AO</b> cho áp đổi liên tục: sàn sáng dội nhiều → AO thấp, băng keo đen dội ít → AO cao. Bài này dùng AO chứ không dùng DO, vì AO cho biết vạch lệch <b>bao nhiêu</b> chứ không chỉ có hay không.</p>
      <p>Mỗi mắt có mức sàn và mức vạch riêng (linh kiện lệch nhau, gắn cao thấp khác nhau). Lệnh <code>HC</code> cho robot quay qua lại trên vạch 4 giây, ghi mức thấp nhất và cao nhất của từng mắt, rồi quy về <b>độ đen</b> 0 (sàn) … 1 (vạch).</p>
      <p>Sai lệch <code>e = đen_trái − đen_phải</code>. Tốc độ quay <code>w = 3·e + 0.15·de/dt</code>, tốc độ đi cố định 120mm/s. Phần P quay về phía vạch. Phần D phanh lại khi e đang giảm nhanh, để robot không vượt qua vạch rồi lắc sang bên kia.</p>
      <p>Hai mắt gắn ở mũi robot, cao <b>3–8mm</b> trên mặt sàn (tầm tốt của TCRT5000 là 0.2–15mm), cách nhau bằng bề rộng vạch (~18–20mm). Robot ở giữa vạch thì cả hai mắt đều nhìn thấy sàn, mép vạch nằm sát hai mắt.</p>`,
    so_do: [{ nhan: '2 mắt ôm vạch', svg: vach, chu: 'Chỉ cần hiệu 2 mắt: dấu cho biết lệch bên nào, độ lớn cho biết lệch bao nhiêu.' }],
    du_doan: `<p>Đo AO trước khi nối GPIO: trên sàn sáng ~0.2–1V, trên băng keo đen ~2.5–3.3V. ADC chỉ đọc tới ~2.9V (10.x), nên mức vạch có thể đứng ở ~2900, không sao vì đã hiệu chuẩn.</p>
      <p>Chỉ có P (bạn thử KD = 0): robot lắc qua lại quanh vạch. Có D: êm hơn. Khúc cua gắt hơn ~90° ở 120mm/s: robot có thể văng ra, và dừng sau 0.5 giây mất vạch.</p>`,
    sau: `<h3>Vì sao P một mình thì lắc</h3>
      <p>Robot lệch khỏi vạch thì quay về, nhưng lúc về tới giữa vạch nó vẫn đang quay (hướng mũi còn chéo), nên vượt sang bên kia. Hệ này có "quán tính" ở chỗ hướng mũi là tích phân của w, còn vị trí ngang là tích phân của hướng mũi: 2 lần tích phân từ lệnh tới thứ đo được. Bộ P thuần trên hệ 2 lần tích phân luôn dao động. Phần D (tốc độ thay đổi của e) cho biết robot đang quay về vạch nhanh cỡ nào, để bớt quay trước khi tới.</p>
      <h3>Độ lệch analog từ 2 mắt</h3>
      <p>Mắt TCRT5000 nhìn một vệt sàn đường kính vài mm. Khi mép vạch đi qua vệt đó, độ đen chạy từ 0 lên 1 trên chừng ~5mm. Trong dải đó, e tỉ lệ gần tuyến tính với độ lệch ngang: đủ để làm P mượt. Ra ngoài dải thì e bão hoà ở ±1, và robot chỉ còn biết lệch trái hay phải. Robot đua bám vạch dùng 5–8 mắt thẳng hàng để dải tuyến tính rộng hơn.</p>
      <h3>Chọn tốc độ</h3>
      <p>Mắt đặt trước trục bánh một đoạn L. Khi robot quay góc φ, mắt lệch ngang ≈ L·φ. L lớn thì robot "nhìn trước" xa hơn, bám cua tốt hơn, nhưng nhạy với rung. Đi nhanh thì vào cua mà w không đủ lớn, robot văng. Tăng tốc từ 120 lên 200mm/s thì phải tăng KP, KD theo.</p>`,
    hoi: [
      ['Mắt trái đo 2400mV, min 400 / max 2800. Độ đen là bao nhiêu?', '(2400 − 400)/(2800 − 400) = 2000/2400 ≈ <b>0.83</b>.'],
      ['e = +0.5 và đang giảm với tốc độ 5/s. w bao nhiêu (KP = 3, KD = 0.15)?', 'w = 3 × 0.5 + 0.15 × (−5) = 1.5 − 0.75 = <b>0.75 rad/s</b> sang trái. Phần D đang phanh bớt vì robot đã quay về nhanh.'],
      ['Vì sao gắn mắt cao 2cm thì bám vạch hỏng?', 'TCRT5000 chỉ nhạy ở 0.2–15mm. Cao 2cm thì hồng ngoại dội về quá ít, vạch và sàn cho AO gần như bằng nhau, và độ đen chỉ còn là nhiễu.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Gắn và nối 2 TCRT5000 (P+ rút, USB rút)', cot: 63,
        gioi_thieu: 'Hình chỉ vẽ robot 17.1 và 2 mắt TCRT. Encoder và GY-521 của chương 19 vẫn cắm nguyên như cũ.',
        buoc: [
          { ten: 'Robot như cuối 19.4, P+ rút', kiem_truoc: true, lam: ['Rút P+, rút USB.'], board: { them: [...K.robot17(), K.cu(K.espRobot())] }, kiem: { thay: 'P+ và USB đều rút.', neu_khong: '' } },
          { ten: 'Gắn 2 mắt dưới mũi robot', lam: ['Bắt ốc hoặc dán 2 module dưới mũi khung, mắt úp xuống, cách sàn 3–8mm. 2 mắt cách nhau ~20mm, đối xứng qua giữa robot. Mắt <b>trái</b> theo chiều robot đi tới.'], kiem: { thay: 'Đặt robot trên sàn: mắt không chạm sàn, không cao quá 1 đốt ngón tay út.', neu_khong: '' } },
          { ten: 'Dây mắt trái', kiem_truoc: true, lam: ['Đọc chữ in: VCC, GND, DO, AO. Dây đực–cái: VCC → <b>thanh + dưới cột 49</b> (3V3), GND → <b>thanh − dưới cột 49</b>, AO → <b>50h</b>. DO để trống.'], board: { them: [TT] }, kiem: { thay: 'VCC ở thanh + <b>dưới</b>, không phải thanh pin.', neu_khong: '' } },
          { ten: 'Dây mắt phải', lam: ['VCC → thanh + dưới cột 51, GND → thanh − dưới cột 51, AO → <b>52h</b>.'], board: { them: [TP] } },
          K.buocOmRobot(['⑤ 50j ↔ thanh − dưới, 52j ↔ thanh − dưới: không gần 0.']),
          K.doOut('Cắm USB, đo AO 2 mắt', ['Robot đặt trên sàn sáng. Que đỏ <b>50j</b>, que đen thanh −. Rồi dán một mẩu băng keo đen dưới mắt trái, đo lại. Làm tương tự với <b>52j</b>.'], '50j', 'B-:50', '0.5 / 3.0', 'Sàn: AO thấp (~0.2–1V). Băng keo đen: AO cao (~2.5–3.3V). Không bao giờ trên 3.4V.'),
          K.rutUsb(),
          { ten: 'Dây tín hiệu', lam: ['USB rút. <code>4</code> → <b>50i</b> (trái), <code>5</code> → <b>52i</b> (phải).'], board: { bo: ['esp'], them: [K.espRobot(K.p4.tcrtEsp)] } },
        ],
      },
      {
        ten: 'Phần 2 · Nạp, hiệu chuẩn, bám vạch', ke_thua: true,
        gioi_thieu: 'Dán một vòng băng keo đen trên sàn sáng: hình bầu dục ~1m × 0.6m, bo cong rộng, không có góc nhọn.',
        buoc: [
          K.camUsb('Cắm USB, nạp 20.1', ['menuconfig → 20.1. <code>idf.py flash</code>. Chạy trạm. Kéo robot bằng tay qua vạch vài lần.'], {}, { thay: 'Đồ thị aT, aP vọt lên khi mắt tương ứng qua vạch.', neu_khong: 'Mắt trái qua vạch mà aP vọt: đổi chỗ 2 dây 50i/52i.' }),
          K.rutUsb(),
          K.camPack('Cắm P+, hiệu chuẩn', ['Đặt robot trên vạch, mũi dọc theo vạch. Bấm <b>HC</b>: robot quay trái 1s, phải 2s, trái 1s.'],
            { thay: 'Nhật ký in "xong: trai 300..2900 mV, phai …" (2 mức cách nhau &gt; 1000mV).', neu_khong: '2 mức gần nhau: mắt gắn cao quá, hoặc robot quay không qua vạch.' }),
          { ten: 'Bám vạch', cap_dien: true, lam: ['Đặt robot giữa vạch, bấm <b>CHAY</b> (hoặc nhấn công tắc va chạm). Nhấc robot lên hoặc bấm X để dừng.'], kiem: { thay: 'Robot đi theo vòng bầu dục, lắc nhẹ quanh vạch.', neu_khong: 'Quay ra khỏi vạch ngay: dấu e ngược, mắt trái/phải đang đổi chỗ. Lắc mạnh: giảm KP hoặc tăng KD trong code.' } },
          K.rutPack(),
        ],
      },
    ],
    bang_do: [{ ten: 'AO đo bằng đồng hồ (V)', cot: ['Sàn', 'Băng keo đen'], hang: [{ ten: 'Mắt trái', du_doan: ['0.2–1', '2.5–3.3'] }, { ten: 'Mắt phải', du_doan: ['0.2–1', '2.5–3.3'] }] }],
    bay: ['VCC TCRT vào thanh pin 8.4V: AO lên tới 8V vào GPIO.', 'Gắn mắt cao quá 1.5cm: vạch và sàn như nhau.', 'Nắng chiếu thẳng xuống sàn: hồng ngoại của mặt trời át mắt đo.', 'Hiệu chuẩn một chỗ, chạy chỗ khác (sàn đổi màu): mức sàn/vạch sai.'],
    robot: ['Robot kho hàng đời đầu đi theo vạch sơn trên sàn đúng kiểu này. Robot hút bụi dùng TCRT (14.4) để chống rơi cầu thang, cùng loại cảm biến.'],
  });
})();
