// Bài 12.5 — Ráp xiaozhi bread-compact-wifi-128x64. 3V3 → thanh + trên, GND → thanh − trên; GND2 → thanh − dưới (cho nút).
// OLED cột 4–7, mic cột 11–16, ampli cột 21–27, 3 nút vắt rãnh ở 32/34, 36/38, 40/42. Thứ tự chân module là giả định — đọc chữ in.
(function () {
  const OLED = { id: 'oled', loai: 'mod', ten: 'OLED', chan: [['GND', '4a'], ['VCC', '5a'], ['SCL', '6a'], ['SDA', '7a']] };
  const MIC = { id: 'mic', loai: 'mod', ten: 'INMP441', chan: [['VDD', '11a'], ['GND', '12a'], ['SD', '13a'], ['SCK', '14a'], ['WS', '15a'], ['LR', '16a', 'L/R']] };
  const AMP = { id: 'amp', loai: 'mod', ten: 'MAX98357A', mau: 'tim', chan: [['LRC', '21a'], ['BCLK', '22a'], ['DIN', '23a'], ['GAIN', '24a'], ['SD', '25a'], ['GND', '26a'], ['VIN', '27a']] };
  const NGUON = [K.day('o1', 'T-:3', '4c', 'den'), K.day('o2', 'T+:2', '5c', 'do', -4), K.day('m1', 'T+:10', '11c', 'do'), K.day('m2', 'T-:9', '12c', 'den', 4),
    K.day('m3', '16c', 'T-:17', 'den'), K.day('a1', 'T-:28', '26c', 'den', 6)];
  const NUT = [32, 36, 40].flatMap((c, i) => [{ id: 'n' + i, loai: 'nut', o: `${c}e`, nhan: ['TOUCH', 'VOL+', 'VOL−'][i] }, K.day('ng' + i, `${c + 2}j`, `B-:${c + 2}`, 'den')]);
  const ESP = K.esp({ '3V3': 'T+:1', GND: 'T-:1', GND2: 'B-:30', '5V': '27c', G42: '6c', G41: '7c', G6: '13c', G5: '14c', G4: '15c', G16: '21c', G15: '22c', G7: '23c', G47: '32b', G40: '36b', G39: '40b' });
  const BO = ['esp'];
  const buocOm = (ten, them) => ({
    ten, kiem_truoc: true, lam: ['USB rút. <code>Ω 200k</code>. Que đỏ thanh + trên (3V3), que đen thanh − trên (GND). Rồi que đỏ cột VIN ampli (27d), que đen thanh −.', 'So số 3V3–GND với số mốc của bài 8.1: mỗi module thêm vào làm số giảm chút ít, nhưng không bao giờ gần 0.'],
    board: { them: [K.dh('Ω 200k', 'T+:30', 'T-:30', '> 0.1'), ...(them || [])] },
    kiem: { thay: 'Cả 2 số không dưới ~100Ω.', neu_khong: 'Gần 0: module vừa cắm có VCC chạm GND, thường là do cắm đảo chiều. <b>Không cắm USB</b>, rút module vừa thêm ra rồi đo lại.' },
  });
  BAI.dangKy({
    id: '12.5',
    muc_tieu: 'Ráp đủ mic, ampli, OLED và 3 nút theo board <code>bread-compact-wifi</code> (bản 128×64), nạp firmware tự build, rồi nói chuyện với server riêng. Đây là mục tiêu đầu tiên của lộ trình.',
    can: [...K.coBanEsp(15), { ten: 'OLED 0.96" 128×64', tim: 'OLED', lk: 'oled', sl: 1 }, { ten: 'Mic INMP441', tim: 'INMP441', lk: 'inmp441', sl: 1 }, { ten: 'Ampli MAX98357A + loa', tim: 'MAX98357A', lk: 'max98357a', sl: 1 }, K.can.nut(3)],
    kien_thuc: `<p>Làm 12.1, 12.2, 12.3 trước. Từng module đã chạy riêng được thì lúc ghép, có lỗi mới biết nằm ở đâu.</p>
      <p>Chân lấy theo board <code>bread-compact-wifi</code> của xiaozhi:</p>
      <ul><li>Mic: WS=4, SCK=5, SD=6.</li><li>Ampli: DIN=7, BCLK=15, LRC=16.</li><li>OLED: SDA=41, SCL=42.</li><li>Nút: TOUCH=47, VOL+=40, VOL−=39 (nút BOOT=0 có sẵn trên board).</li></ul>
      <p>Mỗi nút nối giữa chân GPIO và GND, firmware bật pull-up nội, nên nhấn là chân xuống 0 (active-low).</p>
      <p>Nguồn: thanh + trên là <b>3V3</b> (cho OLED và mic), thanh − trên và dưới là GND. <b>5V chỉ đi đúng 1 dây thẳng vào VIN của ampli</b>, không cắm vào thanh nguồn nào.</p>
      <p>Ráp từng module, và đo Ω sau mỗi module. Có thể cắm board lên 2 breadboard ghép lại. Hình vẽ để board ở ngoài và nối bằng dây đực–cái.</p>`,
    so_do: [{ nhan: 'Sơ đồ khối xiaozhi', svg: SD.svg(360, 260, SD.hop(130, 90, 100, 70, 'ESP32-S3') + SD.hop(10, 20, 90, 40, 'OLED') + SD.hop(10, 110, 90, 40, 'mic INMP441') + SD.hop(260, 20, 90, 40, 'ampli') + SD.hop(260, 200, 90, 40, 'loa')
      + SD.hop(10, 200, 90, 40, '3 nút') + SD.hop(160, 200, 80, 40, 'USB 5V')
      + SD.day('100,40 150,40 150,90') + SD.chu(106, 34, 'I2C 41/42', 'sd-mo') + SD.day('100,130 130,130') + SD.chu(104, 150, 'I2S 4/5/6', 'sd-mo')
      + SD.day('260,40 210,40 210,90') + SD.chu(216, 76, 'I2S 7/15/16', 'sd-mo') + SD.day('305,60 305,200') + SD.day('100,220 150,220 150,160') + SD.chu(104, 214, '47/40/39', 'sd-mo')
      + SD.day('200,200 200,160') + SD.chu(206, 186, '5V', 'sd-pos'),
      'ESP32 ở giữa: OLED qua I2C, mic và ampli qua I2S, 3 nút, nguồn USB 5V; ampli ra loa'), chu: 'Chân theo bread-compact-wifi (xiaozhi). 5V chỉ vào VIN ampli; OLED và mic ăn 3V3.' }],
    sau: `<h3>Ngân sách dòng trên cổng USB</h3>
      <p>Lúc chip phát WiFi, dòng đỉnh lên vài trăm mA. Ampli nói to vào loa 8Ω kéo đỉnh ~0.3–0.5A từ 5V. OLED dùng ~20mA, mic ~1.5mA. Cộng các đỉnh lại, có lúc chạm mức 500mA của cổng USB 2.0. Vì vậy nếu board reset khi đang nói câu dài và to, đó là dấu hiệu nguồn không đủ, không phải lỗi firmware. Cách chữa: dùng cổng USB 3 hoặc cục sạc 5V 2A, gắn tụ 100–470µF sát VIN của ampli, hoặc giảm âm lượng tối đa.</p>
      <h3>Độ trễ đi đâu</h3>
      <p>Server riêng đo được ~2.6s từ lúc ngừng nói tới lúc có tiếng trả lời. Phần của mạch chiếm rất ít: I2S đệm vài chục ms, mã hoá Opus ~20–60ms mỗi khung. Phần lớn thời gian nằm ở mạng, ở việc chờ biết bạn đã nói hết câu, và ở việc mô hình nghĩ rồi nói. Muốn nhanh hơn thì phải sửa phía server, không phải sửa dây.</p>
      <h3>Ghép từng khối</h3>
      <p>Ráp từng module và đo Ω sau mỗi module giúp khoanh vùng lỗi: hỏng ở bước nào thì chỉ cần nghi phần vừa thêm vào.</p>`,
    hoi: [
      ['Board reset đúng lúc xiaozhi nói to. Nghi gì đầu tiên?', 'Nguồn 5V bị sụt vì ampli kéo dòng đỉnh lớn mà cổng USB không cấp đủ, dẫn tới brownout.'],
      ['Vì sao OLED và mic ăn 3V3 còn ampli ăn 5V?', 'OLED và mic là chip logic 3.3V (mic chịu tối đa ~3.6V). Ampli cần công suất lớn cho loa nên lấy thẳng từ 5V.'],
      ['Ráp cả bộ rồi mới đo Ω, thấy gần 0. Làm gì?', 'Rút từng module ra rồi đo lại, cho tới khi hết gần 0: module vừa rút là thủ phạm. Lần sau nhớ đo sau mỗi module.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Nguồn + OLED', cot: 44,
        buoc: [
          { ten: 'Dây nguồn từ board', lam: ['USB rút. <code>3V3</code> → thanh + trên (cột 1). <code>GND</code> → thanh − trên (cột 1). Một chân <code>GND</code> khác → thanh − dưới (cột 30).'], board: { them: [K.esp({ '3V3': 'T+:1', GND: 'T-:1', GND2: 'B-:30' })] } },
          { ten: 'OLED + dây', lam: ['OLED cột 4–7, đọc chữ in. Cột GND ← dây đen từ thanh − trên (3). Cột VCC ← dây đỏ từ thanh + trên (2). <code>42</code> → SCL, <code>41</code> → SDA.'], board: { bo: BO, them: [OLED, NGUON[0], NGUON[1], K.esp({ '3V3': 'T+:1', GND: 'T-:1', GND2: 'B-:30', G42: '6c', G41: '7c' })] } },
          buocOm('Đo sau OLED'),
        ],
      },
      {
        ten: 'Phần 2 · Mic', ke_thua: true,
        buoc: [
          { ten: 'Mic + dây', lam: ['Mic cột 11–16. VDD ← dây đỏ thanh + (10). GND ← dây đen thanh − (9). L/R → dây đen sang thanh − (17). <code>6</code> → SD, <code>5</code> → SCK, <code>4</code> → WS.'],
            board: { bo: BO, them: [MIC, NGUON[2], NGUON[3], NGUON[4], K.esp({ '3V3': 'T+:1', GND: 'T-:1', GND2: 'B-:30', G42: '6c', G41: '7c', G6: '13c', G5: '14c', G4: '15c' })] } },
          buocOm('Đo sau mic'),
        ],
      },
      {
        ten: 'Phần 3 · Ampli + loa', ke_thua: true,
        buoc: [
          { ten: 'Ampli + dây', lam: ['Ampli cột 21–27. GND ← dây đen thanh − trên (28). <code>5V</code> → VIN (27c). <code>16</code> → LRC, <code>15</code> → BCLK, <code>7</code> → DIN. Loa vào cầu đấu của ampli.'],
            board: { bo: BO, them: [AMP, NGUON[5], K.esp({ '3V3': 'T+:1', GND: 'T-:1', GND2: 'B-:30', '5V': '27c', G42: '6c', G41: '7c', G6: '13c', G5: '14c', G4: '15c', G16: '21c', G15: '22c', G7: '23c' })] } },
          buocOm('Đo sau ampli'),
        ],
      },
      {
        ten: 'Phần 4 · 3 nút, nạp firmware, nói chuyện', ke_thua: true,
        buoc: [
          { ten: '3 nút', lam: ['3 nút vắt qua rãnh ở cột 32/34, 36/38, 40/42 (hướng đã kiểm như 6.1). Cột 34, 38, 42: dây đen hàng j → thanh − dưới. <code>47</code> → 32b, <code>40</code> → 36b, <code>39</code> → 40b.'], board: { bo: BO, them: [...NUT, ESP] } },
          buocOm('Đo lần cuối, cả lúc nhấn từng nút', []),
          { ...K.camUsb('Cắm USB, build + nạp firmware', ['Board cần một server xiaozhi đang chạy để kết nối tới. Làm theo chương 22: chạy server trên laptop (<a href="bai/22.1/">22.1</a>, <a href="bai/22.2/">22.2</a>), build và nạp firmware có mặt robot (<a href="bai/22.3/">22.3</a>), rồi cho chip vào server (<a href="bai/22.4/">22.4</a>).'], {}, { thay: 'OLED hiện thanh trạng thái, nói vào mic thì nghe trả lời qua loa.', neu_khong: 'Từng module đã chạy ở 12.1–12.3 thì lỗi nằm ở phần ghép: so từng dây với bảng chân. OLED hoặc ampli ấm lên: rút USB.' }) },
          K.rutUsb(),
        ],
      },
    ],
    bang_do: [{ ten: 'Ω 3V3–GND sau mỗi module', cot: ['Ω'], hang: [{ ten: 'Mốc 8.1', du_doan: [''] }, { ten: '+ OLED', du_doan: ['≤ mốc'] }, { ten: '+ mic', du_doan: ['≤ trên'] }, { ten: '+ ampli', du_doan: ['≤ trên'] }, { ten: '+ nút (nhấn từng nút)', du_doan: ['như trên'] }] }],
    bay: ['Cắm 5V vào thanh + (đang là 3V3): 2 nguồn đấu nhau, OLED và mic nhận 5V.', 'Cắm module đảo chiều (VCC ↔ GND): đo Ω sau từng module để bắt được ngay.', 'Nối nút vào thanh + thay vì GND: nhấn là cấp 3.3V vào chân đang bật pull-up. Không hỏng gì, nhưng nút không ăn.'],
    robot: ['Bước tiếp theo: chương 22 (<a href="bai/22.1/">22.1</a>) cho mạch này nói chuyện qua server riêng. Sau đó <a href="bai/17.2/">bài 17.2</a> thêm driver + 2 motor, xiaozhi nhận lệnh bằng giọng rồi chạy bánh xe.'],
  });
})();
