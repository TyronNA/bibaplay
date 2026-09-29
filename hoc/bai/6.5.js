// Bài 6.5 — Bộ so sánh LM358. IC vắt qua rãnh, khuyết bên trái: chân 1 = 14f … 4 = 17f, 5 = 17e … 8 = 14e.
// VCC: T+:14 → 14a. GND: 17j → −. Op-amp B không dùng: 5 (17e) → GND qua dây 17d → 17g; 6 (16e) ↔ 7 (15e) bằng dây 16b → 15b.
// IN− (15) ← điểm giữa cầu thanh + → quang trở → 10k → [cột 21 dưới] → 10k → −, dây 21h → 15h.
// IN+ (16) ← con trượt biến trở: thanh + → 10k → A 4d, W 6d, B 8d → −; dây 6b → 16h. OUT (14) → LED 14i/13i → 470Ω 13j → −.
(function () {
  const IC = { id: 'ic', loai: 'ic', o: 14, chu: 'LM358' };
  const NGUON = [K.day('vcc', 'T+:14', '14a', 'do'), K.day('gnd', '17j', 'B-:17', 'den')];
  const B_KHONG = [K.day('b5', '17d', '17g', 'den', 2), K.day('b67', '16b', '15b', 'vang')];
  const LED = K.led('led', '14i', '13i', 'do'), R470 = K.tro('r470', ['13j', 'B-:13'], '470');
  const CAU = [{ id: 'ldr', loai: 'ldr', p: ['T+:21', '21a'], nhan: 'quang trở' }, K.tro('c1', ['21e', '21f'], '10k'), K.tro('c2', ['21j', 'B-:21'], '10k'), K.day('inm', '21h', '15h', 'xanh', 3)];
  const NGUONG = [K.tro('rt', ['T+:4', '4a'], '10k'), { id: 'bt', loai: 'bientro', A: '4d', W: '6d', B: '8d' }, K.day('btb', '8b', 'B-:8', 'den'), K.day('inp', '6b', '16h', 'cam', 4)];
  const TRE = K.tro('r100k', ['14g', '16g'], '100k', { nhan: '100k trễ' });

  const sd = SD;
  const soDo = sd.svg(380, 250, sd.mui + sd.day('20,30 350,30') + sd.chu(24, 22, '+4.78V', 'sd-pos') + sd.day('20,220 350,220') + sd.chu(24, 236, 'GND', 'sd-mo')
    + sd.ldr(60, 30, 50, '') + sd.chu(84, 60, 'quang trở', 'sd-mo') + sd.day('60,80 60,84') + sd.tro(60, 84, 40, '10k') + sd.day('60,124 60,136') + sd.cham(60, 130) + sd.tro(60, 136, 40, '10k') + sd.day('60,176 60,220')
    + sd.day('60,130 96,130') + sd.chu(100, 134, '→ IN−', 'sd-chu')
    + sd.tro(150, 30, 40, '10k') + sd.day('150,70 150,74') + sd.bienTro(150, 74, 60) + sd.day('150,134 150,220') + sd.day('190,104 210,104 210,122 230,122') + sd.cham(210, 110)
    + sd.chu(224, 94, 'IN−', 'sd-chu', 'end') + sd.day('226,98 230,98') + sd.opamp(250, 110, 'LM358') + sd.day('290,110 320,110 320,120') + sd.cham(300, 110)
    + sd.tro(320, 120, 40, '470Ω') + sd.day('320,160 320,166') + sd.led(320, 166) + sd.day('320,206 320,220')
    + sd.day('300,110 300,64 210,64 210,110').replace('sd-net', 'sd-net" stroke-dasharray="4 3') + sd.chu(214, 58, '100k (phần 2)', 'sd-mo'),
    'Cầu quang trở vào IN trừ, biến trở đặt ngưỡng vào IN cộng, ngõ ra qua 470 ôm vào LED; nét đứt là 100k trễ ở phần 2');

  BAI.dangKy({
    id: '6.5',
    muc_tieu: 'Dùng op-amp làm bộ so sánh: IN+ lớn hơn IN− thì ngõ ra lên cao, ngược lại thì xuống thấp, không có "lưng chừng" như mạch transistor 5.4. Thêm một điện trở phản hồi là có trễ, hết chập chờn ở ngưỡng. Đây chính là thứ nằm trong module FC-51 và TCRT5000.',
    can: [
      { ten: 'IC LM358 (DIP-8)', tim: 'LM358', lk: 'lm358', sl: 1 }, K.can.ldr(), K.can.bientro(), K.can.tro('10k', 3), K.can.tro('470'), K.can.tro('100k'), K.can.led(), ...K.coBan(10),
    ],
    kien_thuc: `
      <p>Op-amp khuếch đại hiệu <code>IN+ − IN−</code> lên khoảng 100 000 lần (LM358: ~100dB). Hiệu chỉ cần vài chục µV là ngõ ra đã chạm trần hoặc chạm sàn. Không có phản hồi âm thì nó không "khuếch đại" được gì hữu ích, mà trở thành <b>bộ so sánh</b>: IN+ &gt; IN− thì ra cao, IN+ &lt; IN− thì ra thấp.</p>
      <p>Trong bài này, IN− nối cầu quang trở (trời tối thì quang trở lớn, IN− thấp), còn IN+ là ngưỡng đặt bằng biến trở. Khi tối hơn ngưỡng, IN− &lt; IN+, ngõ ra lên cao và LED sáng.</p>
      <p>LM358 không chạy sát 2 đầu nguồn: ngõ ra lên cao nhất chỉ ≈ <b>VCC − 1.5V</b> (≈ 3.3V với pin 4.78V), và đầu vào chỉ so đúng trong khoảng 0 → VCC − 1.5V. Vì vậy cầu quang trở có thêm một con 10k (để IN− không bao giờ quá 2.39V), và biến trở cũng có một con 10k phía trên (để ngưỡng nằm trong 0 → 2.39V).</p>
      <p><b>Chiều IC</b>: khuyết (và chấm) nằm bên trái, chân 1 ở góc dưới-trái. Cắm ngược 180° là đảo VCC với GND, IC nóng rất nhanh. Nhìn khuyết trước khi cắm, và sờ IC ngay sau khi lắp pin.</p>
      <p>Trong vỏ còn op-amp thứ 2 không dùng tới. Đừng để chân của nó thả nổi, vì nó sẽ tự dao động, nóng lên và gây nhiễu cho con kia. Nối IN+ (chân 5) xuống GND, và nối ngõ ra (chân 7) vào IN− (chân 6).</p>`,
    so_do: [{ nhan: 'Bộ so sánh', svg: soDo, chu: 'Tối hơn ngưỡng: IN− < IN+ → OUT ≈ 3.3V → LED sáng. Nét đứt: điện trở trễ thêm ở phần 2.' }],
    du_doan: `<div class="cuon"><table><thead><tr><th>Điểm</th><th>Sáng phòng (quang trở ~10k)</th><th>Che tay (≥ 100k)</th></tr></thead><tbody>
      <tr><td>IN− (15i)</td><td>4.78 × 10/30 ≈ 1.6V</td><td>≈ 0.4V</td></tr>
      <tr><td>IN+ (16i), vặn cho ≈ 1.0V</td><td>≈ 1.0V</td><td>≈ 1.0V</td></tr>
      <tr><td>OUT (14h)</td><td>≈ 0V → LED tắt</td><td>≈ 3.2–3.3V → LED sáng, ≈ 2.8mA</td></tr>
      </tbody></table></div>
      <p>Ngưỡng 1.0V ứng với quang trở ≈ <code>4.78 × 10k / 1.0 − 20k ≈ 28k</code>. Phần 2 (100k trễ): ngưỡng tắt cao hơn ngưỡng bật khoảng 0.1V.</p>`,
    sau: `<h3>Vì sao không có vùng lưng chừng</h3>
      <p>Ở mạch 5.4, transistor chỉ khuếch đại ~hFE lần, và mối B–E là một đường cong mềm, nên quanh ngưỡng có cả một dải vài chục mV mà LED sáng dần. Op-amp khuếch đại ~10⁵ lần, dải chuyển tiếp chỉ cỡ 3.3V / 10⁵ ≈ 33µV, nhỏ hơn cả nhiễu. Vì vậy quanh ngưỡng nó không sáng lưng chừng mà <b>nháy</b> theo nhiễu. Cách chữa là thêm trễ.</p>
      <h3>Tính trễ của 100k</h3>
      <p>Nhìn từ con trượt, mạch ngưỡng là nguồn U_ng nối tiếp R_th. W ở vị trí cho 1.0V: R_th = (10k + 5.8k) ∥ 4.2k ≈ 3.3k. Con 100k nối OUT về IN+ kéo IN+ lên khi OUT cao, và kéo xuống khi OUT thấp: <code>ΔU ≈ ΔU_ra × R_th / (R_th + 100k) ≈ 3.2 × 3.3/103 ≈ 0.10V</code>. Tức là LED bật khi IN− xuống dưới ~1.0V, và tắt khi IN− lên trên ~1.1V. Đây là trigger Schmitt dựng bằng op-amp. Bài 10.2 làm y hệt bằng 2 ngưỡng trong code.</p>
      <h3>Module FC-51 / TCRT5000</h3>
      <p>Các module này dùng LM393, một bộ so sánh chuyên dụng. Ngõ ra của nó kiểu cực thu hở (chỉ kéo xuống được, mức cao có được nhờ điện trở kéo lên), và chuyển trạng thái nhanh hơn LM358. Biến trở xanh trên module là đúng biến trở ngưỡng của bài này.</p>`,
    hoi: [
      ['IN+ = 1.20V, IN− = 1.19V. OUT ở mức nào?', '<b>Cao</b> (≈ VCC − 1.5V), vì IN+ lớn hơn, dù chỉ hơn 10mV.'],
      ['Cấp LM358 bằng 3.3V. OUT lên cao nhất bao nhiêu? Có bật được LED xanh dương không?', '≈ 3.3 − 1.5 = <b>1.8V</b>. Không đủ cho LED xanh dương (~3V), LED đỏ cũng khó sáng (~1.9V).'],
      ['Muốn LED bật khi <b>sáng</b> thay vì khi tối. Sửa gì nhỏ nhất?', 'Đổi chỗ 2 dây vào IN+ và IN− (cầu quang trở vào IN+, ngưỡng vào IN−).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Ráp bộ so sánh', cot: 24,
        buoc: [
          K.buocPin(),
          { ten: 'Cắm IC, nguồn IC', lam: ['LM358 vắt qua rãnh, <b>khuyết bên trái</b>: chân 1 ở <b>14f</b>, chân 4 ở 17f, chân 8 ở 14e.', 'Dây đỏ thanh + (cột 14) → <b>14a</b> (chân 8 VCC). Dây đen <b>17j → thanh −</b> (chân 4 GND).'], board: { them: [IC, ...NGUON] } },
          { ten: 'Op-amp B không dùng', lam: ['Dây đen <b>17d → 17g</b> (chân 5 → GND). Dây vàng <b>16b → 15b</b> (chân 6 ↔ chân 7).'], board: { them: B_KHONG } },
          { ten: 'LED ở ngõ ra', lam: ['LED: <b>chân dài 14i</b>, chân ngắn 13i. 470Ω (' + K.tenVong('470') + ') từ <b>13j</b> xuống thanh −.'], board: { them: [LED, R470] } },
          { ten: 'Cầu quang trở vào IN−', lam: ['Quang trở: thanh + (cột 21) → <b>21a</b>. 10k vắt qua rãnh <b>21e → 21f</b>. 10k thứ hai <b>21j → thanh −</b>. Dây xanh <b>21h → 15h</b> (chân 2 IN−).'], board: { them: CAU } },
          { ten: 'Biến trở ngưỡng vào IN+', lam: ['10k: thanh + (cột 4) → <b>4a</b>. Biến trở: A 4d, W 6d, B 8d (chân W đã dò ở bài 2.3, con của bạn khác thì theo số đo). Dây đen <b>8b → thanh −</b>. Dây cam <b>6b → 16h</b> (chân 3 IN+).', 'W chỉ nối vào chân IC, nên vặn về đâu cũng không nối tắt gì.'], board: { them: NGUONG } },
          K.buocOm('Ω 200k', '≈ 12', 'Khoảng <code>8</code>–<code>18</code> (cầu quang trở ∥ nhánh biến trở, tuỳ ánh sáng), <b>không dưới 5</b>.', 'Dưới 5: có dây nối thẳng + xuống − (kiểm 2 dây đen 8b, 17d, và chiều IC). Gần 0: nối tắt.'),
          K.lapPin('Lắp pin, sờ IC ngay', ['Chạm mu ngón tay lên IC trong 2 giây đầu. Nóng thì <b>tháo pin ngay</b>: IC đang cắm ngược.', '<code>DCV 20</code>, que đen thanh −: đo IN− (15i), rồi vặn biến trở cho IN+ (16i) ≈ 1.0V.'], { them: [K.dh('DCV 20', '16i', 'B-:16', '≈ 1.0')] },
            { thay: 'IC nguội. IN− ≈ 1.2–2V (ánh sáng phòng), LED tắt.', neu_khong: 'LED sáng luôn: phòng tối hơn ngưỡng, vặn IN+ thấp xuống. IC nóng: tháo pin, xoay IC lại.' }),
          { ten: 'Che quang trở, đo OUT', cap_dien: true, lam: ['Lấy tay che kín quang trở. Đo OUT (que đỏ 14h).', 'Từ từ bỏ tay ra để đi qua ngưỡng, nhìn LED.'], board: { sua: { led: { sang: true } }, them: [K.dh('DCV 20', '14h', 'B-:16', '≈ 3.2')] },
            kiem: { thay: 'Che: OUT ≈ 3.2V, LED sáng hẳn. Bỏ tay: OUT ≈ 0V. Ở sát ngưỡng LED có thể <b>nháy</b>, phần 2 sẽ chữa.', neu_khong: 'OUT không đổi: dây IN− (21h → 15h) hoặc IN+ (6b → 16h) cắm sai cột.' } },
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 2 · Thêm trễ bằng 100k', ke_thua: true,
        buoc: [
          { ten: '100k từ OUT về IN+', lam: ['Hộp pin để trống. 100k (' + K.tenVong('100k') + ') cắm <b>14g → 16g</b> (chân 1 → chân 3), nằm vắt ngang qua cột 15.'], board: { sua: { led: { sang: false } }, them: [TRE] } },
          K.buocOm('Ω 200k', '≈ 12', 'Như phần 1: <code>8</code>–<code>18</code>, không dưới 5.', 'Khác hẳn phần 1: 100k cắm nhầm vào thanh nguồn.'),
          K.lapPin('Lắp pin, đi qua ngưỡng', ['Che/bỏ tay từ từ như phần 1. Đo IN+ (16i) lúc LED sáng và lúc LED tắt.'], { them: [K.dh('DCV 20', '16i', 'B-:16', '≈ 1.05')] },
            { thay: 'LED bật/tắt dứt khoát, không nháy ở ngưỡng. IN+ lúc LED sáng cao hơn lúc tắt khoảng 0.1V.', neu_khong: 'Vẫn nháy: có thể đèn phòng đang nhấp nháy (đèn LED rẻ), thử dưới ánh sáng ban ngày.' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Đo quanh ngưỡng', cot: ['IN− (V)', 'IN+ (V)', 'OUT (V)'], hang: [
      { ten: 'Sáng phòng', du_doan: ['≈ 1.6', '≈ 1.0', '≈ 0'] }, { ten: 'Che tay', du_doan: ['≈ 0.4', '≈ 1.0', '≈ 3.2'] },
      { ten: 'Có 100k, LED sáng', du_doan: ['', '≈ 1.05', '≈ 3.2'] }, { ten: 'Có 100k, LED tắt', du_doan: ['', '≈ 0.95', '≈ 0'] },
    ] }],
    bay: ['Cắm IC ngược 180°: VCC và GND đảo, IC nóng cháy trong vài giây. Luôn tìm khuyết/chấm trước.', 'Để op-amp thứ 2 thả nổi: dao động, IC ấm, ngõ ra con kia rung.', 'Để đầu vào vượt VCC − 1.5V (cầu quang trở thiếu con 10k): LM358 so sai.'],
    robot: ['Mọi module "báo có/không" (hồng ngoại, dò line, âm thanh, mưa) là cảm biến + bộ so sánh + biến trở ngưỡng như bài này.', 'Có ESP32 thì thường đọc thẳng áp tương tự bằng ADC rồi so trong code (bài 10.2). Cách đó linh hoạt hơn, nhưng bộ so sánh phần cứng phản ứng trong vài µs mà không tốn CPU.'],
  });
})();
