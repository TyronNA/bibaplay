// Bài 5.6 — PNP phía trên tải. S8550 ở nửa trên: E 12c, B 13c, C 14c (thứ tự thường gặp; dò ở phần 1).
// E → thanh + (dây T+:12 → 12a). C → LED (A 14e, K 14f) → 220Ω 14j → −. B → 10k 13e–13f → dây điều khiển 13j → đâu đó.
// Phần 3: cầu 10k (T+:18 → 18a) + 20k (18e–18f) + dây 18j → − cho điểm 3.19V ở cột 18 trên. Mô phỏng coi npn là NPN → khong_mp.
(function () {
  const Q = { id: 'q', loai: 'npn', chu: 'S8550', e: '12c', b: '13c', c: '14c', khong_mp: true };
  const DE = K.day('dE', 'T+:12', '12a', 'do');
  const L = K.led('led', '14e', '14f', 'do');
  const RC = K.tro('rc', ['14j', 'B-:14'], '220');
  const RB = K.tro('rb', ['13e', '13f'], '10k');
  const DK = den => K.day('dk', '13j', den, 'vang');
  const CAU = [K.tro('c1', ['T+:18', '18a'], '10k'), K.tro('c2', ['18e', '18f'], '20k'), K.day('c3', '18j', 'B-:18', 'den')];

  const sd = SD;
  const soDo = sd.svg(320, 260, sd.pin(40, 130, '4.78V') + sd.day('40,130 40,30 210,30 210,80') + sd.pnp(200, 110) + sd.day('210,140 210,146') + sd.led(210, 146)
    + sd.day('210,186 210,190') + sd.tro(210, 190, 40, '220Ω') + sd.day('210,230 210,240 40,240 40,140') + sd.troNgang(110, 110, 60, '10k') + sd.day('110,110 90,110 90,150')
    + '<circle cx="90" cy="150" r="3" class="sd-cham"/>' + sd.chu(84, 170, 'nối − : bật', 'sd-chu', 'end') + sd.chu(84, 186, 'nối + : tắt', 'sd-chu', 'end'),
    'PNP: E nối cực dương, C qua LED và 220 ôm xuống cực âm, B qua 10k tới dây điều khiển');

  BAI.dangKy({
    id: '5.6',
    muc_tieu: 'Transistor PNP đặt phía trên tải (giữa + và tải): kéo chân B xuống thì bật. Rồi thấy cái bẫy khi điều khiển nó bằng một mức "1" thấp hơn nguồn — đúng chuyện xảy ra khi GPIO 3.3V điều khiển tải 5V.',
    can: [
      { ten: 'Transistor S8550 (PNP)', tim: 'S8550', lk: 's8550', sl: 1 },
      K.can.led(), K.can.tro('220'), K.can.tro('10k', 2), { ten: 'Điện trở 20k (đỏ-đen-cam); không có thì 2 con 10k nối tiếp', tim: 'Điện trở 1/4W', lk: 'dien-tro', sl: 1 }, ...K.coBan(6),
    ],
    kien_thuc: `
      <p>PNP là NPN lật ngược: mũi tên ở E chỉ <b>vào</b>, dòng chạy từ E ra C, và chân B phải <b>thấp hơn</b> E khoảng 0.65V thì mới dẫn. E nối +, tải nằm giữa C và −. Bật: kéo B xuống (qua điện trở). Tắt: đưa B lên bằng E.</p>
      <p>Vì sao cần PNP: công tắc NPN (bài 5.3) nằm dưới tải, tải luôn nối + — "ngắt đất". Có lúc cần ngắt phía + (cắt nguồn cả một module, để mạch đo pin không tốn điện khi tắt): đó là việc của PNP hoặc MOSFET kênh P.</p>
      <p>Cái bẫy: B cách E bao nhiêu mới là "tắt"? Phải gần như <b>bằng</b> E. Đưa B lên 3.2V trong khi E ở 4.78V thì B vẫn thấp hơn E 1.6V — dư sức để dẫn. Phần 3 dùng cầu 10k + 20k làm "GPIO mức 1 = 3.2V" để thấy tận mắt.</p>
      <p>Chân S8550 phải dò như 5.1 nhưng đảo que (phần 1). Chưa có số đo xác nhận thì không cắm vào mạch.</p>`,
    so_do: [{ nhan: 'PNP phía trên', svg: soDo, chu: 'Dòng B chạy từ E ra B rồi qua 10k xuống chỗ dây điều khiển cắm.' }],
    du_doan: `<div class="cuon"><table><thead><tr><th>Dây điều khiển (13j) nối</th><th>U_B</th><th>LED</th><th>Vì sao</th></tr></thead><tbody>
      <tr><td>thanh −</td><td>≈ 4.1V (E − 0.65)</td><td>sáng hết cỡ ≈ 11.7mA</td><td>Ib ≈ (4.78 − 0.65)/10k ≈ 0.41mA → bão hoà</td></tr>
      <tr><td>thanh +</td><td>≈ 4.78V</td><td>tắt</td><td>B = E: không có dòng B</td></tr>
      <tr><td>điểm 3.19V của cầu</td><td>≈ 4.1V</td><td><b>vẫn sáng</b>, gần hết cỡ</td><td>Ib ≈ (4.78 − 0.65 − 3.19)/(10k + 6.7k) ≈ 56µA; × hFE 200 ≈ 11mA</td></tr>
      </tbody></table></div>`,
    sau: `<h3>Tính khi B nối vào cầu phân áp</h3>
      <p>Cầu 10k + 20k từ 4.78V: nhìn từ điểm giữa là nguồn 3.19V nối tiếp 6.67k (bài 2.5). Dòng B đi từ E (4.78V) qua mối B–E (0.65V), qua 10k, qua 6.67k về điểm 3.19V: <code>Ib = (4.78 − 0.65 − 3.19) / 16.67k ≈ 56µA</code>. Với hFE 200, transistor muốn cho 11mA — bằng mức LED + 220Ω cho phép (≈ 11.7mA). LED gần như sáng hết cỡ.</p>
      <h3>Muốn GPIO 3.3V điều khiển PNP nối 5V thì làm gì</h3>
      <p>Thêm một NPN nhỏ làm tầng đệm: GPIO bật NPN, NPN kéo B của PNP xuống GND; NPN tắt thì một điện trở kéo B của PNP lên bằng E. Hoặc dùng MOSFET kênh P + NPN. Module "high-side switch" bán sẵn là đúng mạch này.</p>
      <h3>Áp "tắt" an toàn bao nhiêu</h3>
      <p>Transistor bắt đầu dẫn đáng kể khi U_EB ≈ 0.5V. Muốn tắt chắc thì U_EB ≲ 0.2V, tức B phải ở trên <code>E − 0.2V</code>. Với E = 5V: B ≥ 4.8V. GPIO 3.3V không bao giờ làm được.</p>`,
    hoi: [
      ['Dò S8550 bằng thang diode: que nào đặt ở chân B thì B dẫn sang 2 chân kia?', '<b>Que đen</b> ở B (PNP: B là cathode của cả 2 "diode").'],
      ['E ở 5V, B nối GPIO 3.3V qua 10k, GPIO mức 1. Transistor tắt không?', '<b>Không</b>: U_EB = 1.7V &gt; 0.65V, dòng B ≈ (5 − 0.65 − 3.3)/10k ≈ 0.1mA → vẫn dẫn.'],
      ['Vì sao người ta vẫn dùng PNP / MOSFET P ở phía trên tải?', 'Để cắt hẳn nguồn + của tải (tải không còn nối nguồn khi tắt), vd tắt nguồn một module cảm biến để tiết kiệm pin.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Dò chân S8550 (chưa có pin)',
        buoc: [
          { ten: 'Cắm transistor', lam: ['Chưa nối hộp pin. S8550 cắm vào <b>12c, 13c, 14c</b>, mặt phẳng có chữ quay về phía bạn.'], board: { them: [Q] } },
          {
            ten: 'Tìm B: que đen ở chân giữa', kiem_truoc: true,
            lam: ['Thang diode. Que <b>đen</b> ở chân 13 (13d). Que đỏ lần lượt 12d và 14d.', 'Rồi đủ 6 cặp như bài 5.1 để chắc.'],
            board: { them: [K.dh('diode ▶|', '12d', '13d', '≈ 0.65')] },
            kiem: { thay: 'Que đen ở 13: cả 12 và 14 ra ~0.6–0.7V; đảo que ra 1. → chân 13 là B, loại PNP. E là chân có số cao hơn vài chục mV, thường ở 12.', neu_khong: 'Chân B không ở giữa: xoay/đổi chỗ transistor cho B vào cột 13, E vào 12, C vào 14 rồi mới làm tiếp. Que đỏ ở B mới ra số: đây là NPN (S8050), lấy nhầm con.' },
          },
        ],
      },
      {
        ten: 'Phần 2 · Bật và tắt', ke_thua: true,
        buoc: [
          K.buocPin(),
          { ten: 'E lên +, LED và 220Ω ở C', lam: ['Dây đỏ thanh + (cột 12) → <b>12a</b> (E).', 'LED vắt qua rãnh: <b>chân dài 14e</b>, chân ngắn 14f. 220Ω từ <b>14j</b> xuống thanh −.'], board: { them: [DE, L, RC] } },
          { ten: '10k ở chân B, dây điều khiển xuống −', lam: ['10k vắt qua rãnh <b>13e → 13f</b>. Dây vàng <b>13j → thanh −</b> (cột 13).'], board: { them: [RB, DK('B-:13')] } },
          K.buocOm('Ω 20k', '≥ 10', 'Không dưới <code>10</code>: 10k nối tiếp mối E–B (dẫn một chiều như diode); số cụ thể tuỳ đồng hồ, thường 10–15.', 'Dưới 1: E–C hoặc dây vàng đang đi tắt qua 10k. Gần 0: nối tắt.'),
          K.lapPin('Lắp pin: LED sáng, đo U_EB, U_EC, U_220', ['<code>DCV 20</code>. Que đỏ E (12b), que đen B (13b): U_EB. Rồi que đỏ E, que đen C (14b): U_EC. Rồi 2 đầu 220Ω.'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', 'q.E', 'q.B', '≈ 0.7')] },
            { thay: 'U_EB ≈ 0.65–0.75V; U_EC ≈ 0.1–0.2V (bão hoà); U_220 ≈ 2.5–2.6V.', neu_khong: 'LED tắt: chân transistor sai (quay lại phần 1) hoặc LED ngược. Transistor ấm: tháo pin, kiểm 10k.' }),
          K.thaoPin(),
          { ten: 'Dây điều khiển lên +', lam: ['Hộp pin rỗng. Rút đầu dây vàng ở thanh −, cắm vào <b>thanh +</b> (cột 13).'], board: { bo: ['dk'], sua: { led: { sang: false } }, them: [DK('T+:13')] } },
          K.buocOm('Ω 20k', '1', '<code>1</code> (OL): không còn đường nào từ + xuống −.', 'Có số: LED/220Ω đang nối thẳng từ + xuống −, hoặc E–C chạm nhau.'),
          K.lapPin('Lắp pin: LED tắt', ['Đo U_EB.'], { them: [K.dh('DCV 20', 'q.E', 'q.B', '≈ 0.00')] }, { thay: 'LED tắt; U_EB ≈ 0V.', neu_khong: '' }),
          K.thaoPin(),
        ],
      },
      {
        ten: 'Phần 3 · Bẫy: "mức 1" chỉ có 3.2V', ke_thua: true,
        buoc: [
          { ten: 'Cầu 10k + 20k làm "GPIO 3.2V"', lam: ['Hộp pin rỗng. 10k: thanh + (cột 18) → <b>18a</b>. 20k vắt qua rãnh <b>18e → 18f</b>. Dây đen <b>18j → thanh −</b>. Điểm giữa là cột 18 nửa trên.'], board: { them: CAU } },
          { ten: 'Dây điều khiển vào điểm 3.2V', lam: ['Rút đầu dây vàng ở thanh +, cắm vào <b>18b</b>.'], board: { bo: ['dk'], them: [DK('18b')] } },
          K.buocOm('Ω 200k', '≈ 25', '≈ <code>20</code>–<code>30</code> (cầu 30k song song đường qua B).', 'Dưới 10: dây vàng cắm nhầm thanh −.'),
          K.lapPin('Lắp pin: LED sáng hay tắt?', ['Đo áp điểm giữa (que đỏ 18c, que đen thanh −), rồi U_EB.'], { sua: { led: { sang: true } }, them: [K.dh('DCV 20', '18c', 'B-:20', '≈ 3.1')] },
            { thay: 'Điểm giữa ≈ 3.1V (thấp hơn 3.19V chút vì dòng B chảy vào), LED <b>vẫn sáng</b> gần như hết cỡ, U_EB ≈ 0.65V.', neu_khong: 'LED tắt: kiểm dây vàng đã ở 18b chưa, và hFE (5.1).' }),
          K.thaoPin(),
        ],
      },
    ],
    bang_do: [{ ten: 'Theo dây điều khiển', cot: ['U_EB (V)', 'U_EC (V)', 'LED'], hang: [
      { ten: 'Nối −', du_doan: ['≈ 0.7', '≈ 0.15', 'sáng'] }, { ten: 'Nối +', du_doan: ['≈ 0', '≈ 3', 'tắt'] }, { ten: 'Nối 3.2V', du_doan: ['≈ 0.65', 'nhỏ', 'vẫn sáng'] },
    ] }],
    bay: ['Chân B nối thẳng xuống − không qua 10k: dòng B không giới hạn, transistor chết.', 'Dùng S8050 thay S8550 (vỏ giống hệt): mạch không bật. Đọc chữ trên thân, dò lại bằng đồng hồ.', 'Nghĩ GPIO mức 1 tắt được PNP nối nguồn cao hơn 3.3V: tải luôn bật.'],
    robot: ['Công tắc nguồn cho module cảm biến (tắt hẳn khi robot ngủ để đỡ tốn pin): PNP/MOSFET P ở phía +, điều khiển qua một NPN nhỏ từ GPIO.'],
  });
})();
