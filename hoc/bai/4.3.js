// Bài 4.3 — Zener giữ áp. 100Ω thanh + → 8a; zener K (vạch) 8e, A 8f; dây đen 8j → −. Điểm đo = cột 8 phía trên.
// Tải nối từ cột 8 qua dây 8c → 11c, tải 11e → 11f, dây 11j → −. Mô phỏng chưa có mô hình đánh thủng zener → khong_mp.
(function () {
  const R1 = K.tro('r1', ['T+:8', '8a'], '100');
  const Z = { id: 'z', loai: 'diode', kieu: 'zener', a: '8f', k: '8e', nhan: 'zener 3.3V', khong_mp: true };
  const ZN = { ...Z, id: 'zn', a: '8e', k: '8f', nhan: 'zener (thuận)' };
  const D8 = K.day('d8', '8j', 'B-:8', 'den');
  const DL = [K.day('dl', '8c', '11c', 'vang'), K.day('dl2', '11j', 'B-:11', 'den')];
  const tai = gt => K.tro('rl', ['11e', '11f'], gt, { nhan: 'tải ' + gt + 'Ω' });
  const AP = hien => K.dh('DCV 20', '8b', 'B-:4', hien);
  const OM = (hien, thay, neu) => ({ ...K.buocOm('Ω 2k', hien, thay, neu) });

  const sd = SD;
  const soDo = sd.svg(320, 240, sd.pin(40, 120, '4.78V') + sd.day('40,120 40,30 160,30') + sd.tro(160, 30, 60, '100Ω') + sd.day('160,90 160,110') + sd.cham(160, 104)
    + sd.zener(160, 110, 60, 'zener 3.3V') + sd.day('160,170 160,210 40,210 40,130') + sd.day('160,104 270,104 270,120') + sd.tro(270, 120, 60, 'tải') + sd.day('270,180 270,210 160,210') + sd.cham(160, 210)
    + sd.chu(176, 100, 'U_z', 'sd-mo'),
    'Pin qua 100 ôm tới điểm nối; zener mắc ngược từ điểm nối xuống cực âm; tải song song zener');

  BAI.dangKy({
    id: '4.3',
    muc_tieu: 'Diode zener mắc ngược giữ áp gần như cố định trên nó, dù tải đổi. Thấy luôn giới hạn: tải lấy quá nhiều dòng thì zener "đói" và mất tác dụng.',
    can: [
      { ten: 'Diode zener 3.3V (1N4728A)', tim: 'zener', lk: 'zener', sl: 1 },
      K.can.tro('100', 2), K.can.tro('1k'), K.can.tro('330'), ...K.coBan(4),
    ],
    kien_thuc: `
      <p>Diode thường mắc ngược thì chặn tới khi bị đánh thủng ở áp rất cao (1N4007: 1000V) và hỏng. Zener được làm để <b>đánh thủng ở một áp thấp, chính xác</b> (ở đây 3.3V) mà không hỏng, miễn là dòng và công suất trong giới hạn. Khi đó áp trên nó gần như đứng yên dù dòng đổi nhiều.</p>
      <p>Vì vậy zener luôn mắc <b>ngược</b>: vạch (cathode) về phía +, và luôn có điện trở nối tiếp để hạn dòng. Điện trở ăn phần áp dư: <code>I = (U_pin − U_z) / 100Ω</code>. Tải mắc song song zener chia bớt dòng đó: zener còn <code>I_z = I − I_tải</code>. Khi I_tải đòi nhiều hơn I, zener không còn dòng để đánh thủng, áp sập xuống như cầu phân áp thường.</p>
      <p>1N4728A ghi 3.3V ở dòng thử 76mA. Ở ~15mA như bài này áp thật thường thấp hơn, cỡ 2.9–3.2V: zener áp thấp có "gối" mềm. Con số của bạn đo mới biết; điều cần thấy là <b>nó ít đổi</b> khi tải đổi.</p>
      <p>Công suất: không tải, zener ăn cỡ 3.1V × 17mA ≈ 0.05W, điện trở 100Ω ăn 1.7²/100 ≈ 0.03W: đều nguội. Phần 3 (zener cắm thuận) dòng lên ~40mA, 100Ω ăn 0.16W: chỉ lắp pin ≤ 10 giây.</p>`,
    so_do: [{ nhan: 'Zener + tải', svg: soDo, chu: 'Tải càng nhỏ (lấy càng nhiều dòng), zener càng ít dòng. Hết dòng thì hết giữ áp.' }],
    du_doan: `<div class="cuon"><table><thead><tr><th>Tải</th><th>Ω đo trước (thang 2k)</th><th>U_z</th><th>Dòng qua 100Ω</th></tr></thead><tbody>
      <tr><td>không tải</td><td>≥ 0.100 (thường 1 = OL)</td><td>≈ 2.9–3.2V</td><td>≈ 16–19mA, toàn bộ qua zener</td></tr>
      <tr><td>1k</td><td>≈ 1.10</td><td>gần như không đổi (lệch vài chục mV)</td><td>tải ~3mA, zener ~14mA</td></tr>
      <tr><td>330Ω</td><td>≈ 0.43</td><td>tụt nhẹ</td><td>tải ~9mA, zener ~8mA</td></tr>
      <tr><td>100Ω</td><td>≈ 0.20</td><td>≈ 2.39V: zener tắt</td><td>≈ 24mA, toàn bộ qua tải</td></tr>
      <tr><td>zener cắm thuận</td><td>≥ 0.100</td><td>≈ 0.7–0.8V</td><td>≈ 40mA (≤ 10 giây)</td></tr>
      </tbody></table></div>
      <p>Dòng tính từ áp đo trên 100Ω: <code>I = U_100 / 100</code>. Tải 100Ω: nếu zener không dẫn thì 100Ω + 100Ω chia đôi 4.78V = 2.39V, dưới 3.3V — đúng là zener không dẫn.</p>`,
    sau: `<h3>Điện trở động của zener</h3>
      <p>Quanh điểm làm việc, zener như một nguồn áp nối tiếp một điện trở nhỏ <code>r_z = ΔU/ΔI</code>. Datasheet 1N4728A: 10Ω ở 76mA, lên tới 400Ω ở 1mA (vùng gối). Từ số đo không tải và tải 1k: <code>r_z ≈ (U_không tải − U_1k) / (I_z,không tải − I_z,1k)</code>. Ví dụ 3.08V → 3.05V khi I_z giảm 17 → 14mA: r_z ≈ 10Ω.</p>
      <h3>Hệ số ổn áp</h3>
      <p>Pin tụt từ 4.78V xuống 4.2V: dòng qua 100Ω giảm từ ~17mA xuống ~11mA, U_z chỉ đổi khoảng <code>r_z × 6mA ≈ 0.06V</code> trong khi pin đổi 0.58V — giảm gần 10 lần. Ổn áp AMS1117 (bài 8.2) làm tốt hơn nhiều vì có mạch khuếch đại so sánh bên trong.</p>
      <h3>Chọn điện trở nối tiếp</h3>
      <p>Hai điều kiện: tải lớn nhất vẫn để lại cho zener ≥ vài mA (<code>(U_min − U_z)/R ≥ I_tải,max + I_z,min</code>), và lúc không tải zener không quá công suất (<code>U_z × (U_max − U_z)/R ≤ P_z</code>). Hai điều kiện kéo R ngược chiều nhau: đó là vì sao zener chỉ hợp cho tải nhỏ, ổn định.</p>`,
    hoi: [
      ['Pin 4.78V, 100Ω, zener 3.1V. Tải lớn nhất bao nhiêu mA để zener vẫn còn ~3mA?', 'I = 1.68/100 = 16.8mA → tải tối đa ≈ <b>13.8mA</b> (tức tải ≥ ~225Ω).'],
      ['Vì sao zener cắm thuận chỉ ra ~0.7V?', 'Cắm thuận nó là diode silicon thường: dẫn ở ~0.7V (bài 4.1).'],
      ['Muốn kẹp bảo vệ chân GPIO không quá 3.3V khi dây tín hiệu có thể lên 5V. Mắc zener + điện trở thế nào?', 'Điện trở nối tiếp trên dây tín hiệu (vd 1k), zener từ chân GPIO xuống GND, vạch về phía GPIO. Tín hiệu lên 5V thì zener dẫn, dòng bị 1k giới hạn ~1.7mA.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Zener, chưa có tải',
        buoc: [
          K.buocPin(),
          {
            ten: 'Cắm 100Ω và zener',
            lam: ['100Ω (' + K.tenVong('100') + '): một chân vào thanh + (cột 8), chân kia vào <b>8a</b>.',
              'Zener vắt qua rãnh: <b>vạch ở 8e</b> (phía trên, về phía 100Ω), chân kia ở 8f. Nhìn kỹ vạch trước khi cắm: vạch xuống dưới là cắm thuận, phần 1 sẽ đo ra ~0.7V.',
              'Dây đen <b>8j → thanh −</b>.'],
            board: { them: [R1, Z, D8] },
          },
          OM('≥ 0.10', 'Không dưới <code>0.100</code>: 100Ω luôn nằm trên đường. Nhiều đồng hồ ra <code>1</code> (OL) vì áp thử không đủ làm zener dẫn.', 'Dưới 0.100 hoặc gần 0: zener có 2 chân cùng cột, hoặc dây đen đang cắm vào nửa trên cột 8.'),
          K.lapPin('Lắp pin, đo áp zener và áp 100Ω', ['<code>DCV 20</code>. Que đỏ <b>8b</b>, que đen thanh −: đó là U_z.', 'Rồi que đỏ ở thanh + (cột 8), que đen 8b: đó là U_100. Dòng = U_100 / 100.'], { them: [AP('≈ 3.05')] },
            { thay: 'U_z trong khoảng 2.9–3.3V; U_100 ≈ 1.6–1.9V.', neu_khong: 'Ra ~0.7V: zener cắm thuận (vạch xuống dưới). Ra ≈ 4.7V: dây đen 8j chưa về thanh −. Tháo pin rồi sửa.' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 2 · Thêm tải, nhẹ rồi nặng dần', ke_thua: true,
        buoc: [
          { ten: 'Tải 1k', lam: ['Hộp pin rỗng. Dây vàng <b>8c → 11c</b>. 1k (' + K.tenVong('1k') + ') vắt qua rãnh <b>11e → 11f</b>. Dây đen <b>11j → thanh −</b>.'], board: { them: [...DL, tai('1k')] } },
          OM('≈ 1.10', '≈ <code>1.10</code> (100Ω + 1k; zener gần như không dẫn ở áp thử của đồng hồ).', 'Gần 0.100: tải đang bị nối tắt (dây 11j cắm nhầm nửa trên). Gần 0: có chỗ nối tắt.'),
          K.lapPin('Lắp pin, đo U_z và U_100', ['Như phần 1: que đỏ 8b cho U_z, rồi 2 đầu 100Ω.'], { them: [AP('≈ 3.03')] }, { thay: 'U_z gần như bằng lúc không tải (lệch vài chục mV).', neu_khong: '' }),
          K.thaoPin(),
          { ten: 'Đổi tải thành 330Ω', lam: ['Hộp pin rỗng. Rút 1k ở 11e–11f, cắm 330Ω (' + K.tenVong('330') + ') vào đúng chỗ đó.'], board: { bo: ['rl'], them: [tai('330')] } },
          OM('≈ 0.43', '≈ <code>0.43</code> (100Ω + 330Ω).', 'Gần 0.100: tải bị nối tắt. Gần 0: nối tắt.'),
          K.lapPin('Lắp pin, đo lại', ['U_z và U_100.'], { them: [AP('≈ 2.98')] }, { thay: 'U_z tụt nhẹ so với 1k.', neu_khong: '' }),
          K.thaoPin(),
          { ten: 'Đổi tải thành 100Ω — zener "đói"', lam: ['Hộp pin rỗng. Rút 330Ω, cắm con 100Ω thứ hai vào 11e–11f.'], board: { bo: ['rl'], them: [tai('100')] } },
          OM('≈ 0.20', '≈ <code>0.20</code> (100Ω + 100Ω).', 'Gần 0.100 hoặc gần 0: nối tắt.'),
          K.lapPin('Lắp pin, đo lại', ['U_z và U_100. Tải 100Ω ở 2.4V ăn ~0.06W: nguội.'], { them: [AP('≈ 2.39')] },
            { thay: 'U_z sập về ≈ 2.4V (một nửa áp pin): zener hết dòng, mạch chỉ còn là cầu 100Ω + 100Ω.', neu_khong: 'Vẫn ≈ 3V: tải chưa vào mạch — kiểm dây 8c → 11c.' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 3 · Zener cắm thuận', ke_thua: true,
        gioi_thieu: 'Sửa mạch đang có, khi hộp pin rỗng: rút tải và 2 dây tải, rồi xoay zener 180°.',
        buoc: [
          { ten: 'Rút tải, xoay zener', lam: ['Hộp pin rỗng. Rút 100Ω (tải) ở 11e–11f, dây 8c–11c và dây 11j.', 'Rút zener, xoay lại: <b>vạch ở 8f</b> (phía dưới), chân kia 8e.'], board: { bo: ['rl', 'dl', 'dl2', 'z'], them: [ZN] } },
          OM('≥ 0.10', 'Không dưới <code>0.100</code>.', 'Gần 0: zener có 2 chân cùng cột.'),
          K.lapPin('Lắp pin ≤ 10 giây, đo U_z', ['Que đỏ 8b, que đen thanh −. Đọc xong tháo pin ngay: 100Ω đang ăn ~0.16W.'], { them: [AP('≈ 0.75')] }, { thay: '≈ 0.7–0.8V: cắm thuận thì zener chỉ là một diode.', neu_khong: '' }),
          K.thaoPin(['Xoay zener lại đúng chiều (vạch lên trên) trước khi cất, để lần sau khỏi nhầm.']),
        ],
      },
    ],
    bang_do: [{ ten: 'Zener theo tải', cot: ['Ω trước', 'U_z (V)', 'U_100 (V) → I'], hang: [
      { ten: 'Không tải', du_doan: ['≥ 0.10', '≈ 3.0', '≈ 1.7 → 17mA'] },
      { ten: 'Tải 1k', du_doan: ['≈ 1.10', '≈ 3.0', ''] },
      { ten: 'Tải 330Ω', du_doan: ['≈ 0.43', '≈ 3.0', ''] },
      { ten: 'Tải 100Ω', du_doan: ['≈ 0.20', '≈ 2.39', '≈ 2.39 → 24mA'] },
      { ten: 'Cắm thuận', du_doan: ['≥ 0.10', '≈ 0.75', '≈ 4.0 → 40mA'] },
    ] }],
    bay: ['Zener không có điện trở nối tiếp: nối tắt pin qua zener, nóng, cháy.', 'Cắm zener thuận mà tưởng ngược: đo ra 0.7V, tưởng zener hỏng.', 'Dùng zener làm nguồn cho ESP32: dòng tải lớn, thay đổi liên tục — zener đói, áp sập. Việc đó của ổn áp (bài 8.2).'],
    robot: ['Zener nhỏ kẹp chân tín hiệu từ cảm biến 5V không vượt 3.3V (kèm điện trở nối tiếp).', 'Mạch đo pin: zener làm áp chuẩn thô để so với áp pin khi chưa có vi điều khiển.'],
  });
})();
