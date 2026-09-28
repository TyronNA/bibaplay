// Bài 0.4 — Mạch 4.2 (1N4007 + 220Ω + LED) hàn lên bo đục lỗ. Toạ độ PB [cột, hàng], mặt trên:
// header 2 chân: + [0,1], − [0,3]. 1N4007 A [1,1] → K (vạch) [4,1]. 220Ω [6,1]–[9,1]. LED A [10,1], K [10,2].
// Mặt dưới: cầu thiếc [0,1]–[1,1]; chân K diode uốn [4,1] → [6,1]; cầu [9,1]–[10,1]; chân K LED uốn [10,2] → [10,3], dây trần [10,3] → [0,3].
(function () {
  const BO = { cot: 11, hang: 5 };
  const LK = [
    { loai: 'header', p: [0, 1], n: 1 }, { loai: 'header', p: [0, 3], n: 1 },
    { loai: 'diode', a: [1, 1], b: [4, 1], nhan: '1N4007' }, { loai: 'tro', a: [6, 1], b: [9, 1], nhan: '220Ω' }, { loai: 'led', a: [10, 1], b: [10, 2], nhan: 'LED' },
    { loai: 'chu', p: [0, 1], t: '+', dx: -14, dy: 4 }, { loai: 'chu', p: [0, 3], t: '−', dx: -14, dy: 4 },
  ];
  const NOI = [{ loai: 'cau', a: [0, 1], b: [1, 1] }, { loai: 'day', pts: [[4, 1], [6, 1]], thiec: true }, { loai: 'cau', a: [9, 1], b: [10, 1] },
    { loai: 'day', pts: [[10, 2], [10, 3]], thiec: true }, { loai: 'day', pts: [[10, 3], [0, 3]], thiec: true }];
  const MOI = [[0, 1], [1, 1], [4, 1], [6, 1], [9, 1], [10, 1], [10, 2], [10, 3], [0, 3]].map(p => ({ loai: 'moi', p }));
  const ve = (mat, items, moTa, them = {}) => PB.ve({ ...BO, mat, items, ...them }, moTa);
  const hTren = ve('tren', LK, 'Mặt trên: header 2 chân, diode, điện trở, LED');
  const hDuoi = ve('duoi', [...LK.filter(x => x.loai !== 'chu'), ...NOI, ...MOI], 'Mặt hàn: 2 cầu thiếc, 2 chân uốn, 1 dây trần dọc hàng dưới');
  const hOm = (dao) => ve('tren', [...LK, { loai: 'que', p: [0, 1], mau: dao ? 'den' : 'do', dx: -8, dy: -34 }, { loai: 'que', p: [0, 3], mau: dao ? 'do' : 'den', dx: -8, dy: 34 }], dao ? 'Đảo que: que đỏ ở chân −' : 'Que đỏ ở chân +, que đen ở chân −', { them_duoi: 24 });
  const hKep = ve('tren', [...LK, { loai: 'que', p: [0, 1], mau: 'do', dx: -30, dy: -30 }, { loai: 'que', p: [0, 3], mau: 'den', dx: -30, dy: 30 }, { loai: 'chu', p: [3, 4], t: 'kẹp đỏ ← dây đỏ hộp pin · kẹp đen ← dây đen', dy: 18 }], 'Hai kẹp cá sấu từ hộp pin kẹp vào 2 chân header', { them_duoi: 24 });

  BAI.dangKy({
    id: '0.4',
    nguon: '3×AAA qua 2 kẹp cá sấu',
    muc_tieu: 'Chuyển một mạch đã chạy trên breadboard (bài 4.2) lên bo đục lỗ: sắp chỗ, hàn, đo Ω trước khi cấp pin, rồi thấy nó chạy y như cũ và không chập chờn khi lắc.',
    can: [
      K.can.moHan(), { ten: 'Thiếc hàn', tim: 'thiếc hàn', lk: 'thiec', sl: 1 }, { ten: 'Bo đục lỗ (miếng mới)', tim: 'bo đục lỗ', lk: 'bo-duc-lo', sl: 1 },
      K.can.d4007(), K.can.tro('220'), K.can.led(), { ten: 'Header đực (bẻ 2 chân đơn)', tim: 'header', lk: 'header', sl: 2 },
      K.can.pin(), K.can.kep(2), K.can.dh(), { ten: 'Kìm cắt chân', tim: 'kìm cắt', lk: 'kim-cat', sl: 1 },
    ],
    kien_thuc: `
      <p>Trên breadboard, lỗ tự thông theo cột. Trên bo đục lỗ, <b>không lỗ nào thông lỗ nào</b>: mọi đường nối do bạn tạo — cầu thiếc giữa 2 pad kề nhau, chân linh kiện uốn nằm dọc bo, hoặc dây. Vì vậy vẽ chỗ đặt trước (hình mặt trên), rồi vẽ đường nối ở mặt hàn (đã lật trái ↔ phải).</p>
      <p>Mạch: + → 1N4007 (vạch về phía LED) → 220Ω → LED → −. Như bài 4.2: <code>I ≈ (4.78 − 0.72 − 1.9)/220 ≈ 9.8mA</code>.</p>
      <p>Pin nối qua 2 chân header đơn bằng 2 kẹp cá sấu. Hai kẹp <b>không được chạm nhau</b>: hai hàm kẹp kim loại trần chạm nhau là nối tắt pin. Ở 4.78V chỉ nóng dây, nhưng tập thói quen trước khi tới pin lithium.</p>`,
    so_do: [{ nhan: 'Mạch 4.2', svg: SD.chuoi('4.78V', [['diode', '1N4007'], ['tro', '220Ω'], ['led']], 'Pin qua diode 1N4007, điện trở 220 ôm, LED'), chu: 'Diode chặn khi cắm ngược pin; LED sáng ≈ 10mA khi cắm đúng.' }],
    du_doan: '<p>Đo Ω 2 chân header (que đỏ +): <code>1</code> (OL) hoặc số lớn ≥ 0.22k — diode và LED chặn áp thử của đồng hồ. Đảo que: <code>1</code>. Không bao giờ gần 0. Lắp pin: LED sáng như bài 4.2, U_LED ≈ 1.9V.</p>',
    sau: `<h3>Sắp chỗ trên bo đục lỗ</h3>
      <p>Theo đúng thứ tự dòng chảy (+ → diode → điện trở → LED → −) và để đường về − chạy dọc một hàng riêng như "thanh nguồn tự làm". Linh kiện kề nhau thì dùng chân của chính nó làm dây nối — ít mối hơn, ít chỗ hỏng hơn. Dây trần dài chỉ nên chạy ở hàng không có pad nào khác được dùng.</p>
      <h3>Vì sao lắc bo là phép thử tốt</h3>
      <p>Mối lạnh vẫn tiếp xúc khi đứng yên, hở khi rung. Robot rung liên tục khi chạy. Lắc nhẹ bo khi LED đang sáng: chập chờn là có mối lạnh — dễ tìm ở đây hơn nhiều so với khi đã lắp vào robot.</p>
      <h3>Từ bo đục lỗ tới mạch in</h3>
      <p>Bo đục lỗ là mạch in làm tay: mỗi cầu thiếc là một đường mạch. Khi mạch ổn định, vẽ lại bằng phần mềm (KiCad, EasyEDA) và đặt làm mạch in thật — đường đồng thay cầu thiếc, không còn dây trần.</p>`,
    hoi: [
      ['Trên bo đục lỗ, 2 chân linh kiện cắm 2 lỗ cạnh nhau có tự thông không?', '<b>Không</b>. Phải hàn cầu thiếc hoặc uốn chân nối sang.'],
      ['Đo Ω 2 chân header ra 0.02. Có lắp pin được không?', '<b>Không</b>: gần 0 là nối tắt (thường là dây trần hàng dưới chạm pad hàng trên, hoặc cầu thiếc nhầm). Tìm và sửa trước.'],
      ['Kẹp pin ngược (đỏ vào −). LED ra sao? Vì sao không hỏng?', 'LED tắt; 1N4007 chặn chiều ngược (bài 4.2), mạch không nhận dòng.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Sắp chỗ và hàn',
        buoc: [
          { ten: 'Cắm linh kiện theo hình mặt trên', lam: ['Bẻ 2 chân header đơn, cắm ở cột 0 hàng 1 (+) và hàng 3 (−).', '1N4007: anode ở lỗ ngay cạnh chân + , <b>vạch</b> ở phía điện trở. 220Ω nằm tiếp theo trên hàng 1. LED: chân dài hàng 1, chân ngắn hàng 2, cuối hàng.'], hinh: hTren },
          { ten: 'Hàn và nối ở mặt dưới', cap_dien: true, lam: ['Lật bo. Hàn từng chân (bài 0.1). Cầu thiếc giữa pad header + và pad anode diode; chân vạch diode uốn sang pad chân trái 220Ω; cầu thiếc chân phải 220Ω sang pad chân dài LED.', 'Chân ngắn LED uốn xuống hàng dưới, rồi một đoạn chân linh kiện đã cắt (dây trần) chạy dọc hàng dưới về pad header −.'], hinh: hDuoi,
            kiem: { thay: 'Đủ 9 mối, bóng; dây trần hàng dưới không chạm pad hàng trên.', neu_khong: 'Cầu thiếc lan sai chỗ: gỡ bằng bấc (bài 0.3).' } },
          { ten: 'Rút điện mỏ hàn, cắt chân', lam: ['Gác mỏ, rút điện. Kính bảo hộ, cắt chân thừa (trừ những chân đang làm dây nối).'] },
        ],
      },
      {
        ten: 'Phần 2 · Đo rồi cấp pin',
        buoc: [
          { ten: 'Đo trước khi cấp điện', kiem_truoc: true, lam: ['Thang <code>Ω 2k</code>. Que đỏ chân header +, que đen chân header −.'], hinh: hOm(false),
            kiem: { thay: '<code>1</code> (OL) hoặc ≥ <code>0.220</code>. Không gần 0.', neu_khong: 'Gần 0: nối tắt — thường là dây trần hàng dưới chạm pad hàng 1 hoặc 2. <b>Không cấp pin</b>.' } },
          { ten: 'Đảo que, đo lại', kiem_truoc: true, lam: ['Que đỏ chân −, que đen chân +.'], hinh: hOm(true), kiem: { thay: '<code>1</code> (OL).', neu_khong: 'Có số nhỏ: diode cắm ngược hoặc bị cầu thiếc đi tắt.' } },
          { ten: 'Kẹp hộp pin rỗng vào', lam: ['Hộp pin <b>rỗng</b>. Kẹp cá sấu đỏ: dây đỏ hộp ↔ chân header +. Kẹp đen: dây đen hộp ↔ chân −. Đặt 2 kẹp cách xa nhau.', 'Đo Ω lại ở 2 tiếp điểm trong hộp pin: phải ra như bước đo đầu.'], hinh: hKep },
          { ten: 'Lắp pin, lắc nhẹ bo', cap_dien: true, lam: ['Lắp pin. <code>DCV 20</code> đo 2 chân LED. Cầm mép bo lắc nhẹ, gõ nhẹ vào từng mối bằng đầu nhựa của nhíp.'],
            kiem: { thay: 'LED sáng như bài 4.2, U_LED ≈ 1.9V; lắc không chập chờn.', neu_khong: 'Không sáng: LED ngược, hoặc mối hở (đo thông mạch từng mối khi đã tháo pin). Chập chờn khi lắc: mối lạnh, hàn lại.' } },
          { ten: 'Tháo pin', lam: ['Tháo pin khỏi hộp, rồi mới tháo kẹp.'] },
        ],
      },
    ],
    bang_do: [{ ten: 'Bo đục lỗ vs breadboard (bài 4.2)', cot: ['Ω trước (que đỏ +)', 'U_LED (V)'], hang: [{ ten: 'Bo đục lỗ', du_doan: ['1 hoặc ≥ 0.22', '≈ 1.9'] }, { ten: 'Breadboard 4.2', du_doan: ['', '≈ 1.9'] }] }],
    bay: ['Nghĩ lỗ bo đục lỗ tự thông như breadboard: mạch hở khắp nơi.', 'Dây trần dài chạy qua hàng có pad đang dùng: chạm là nối tắt.', 'Hai kẹp cá sấu chạm nhau khi đang có pin: nối tắt pin.', 'Hàn lúc đang kẹp pin: mũi hàn chạm 2 điểm là nối tắt, và mạch đang có điện.'],
    robot: ['Mọi mạch nhỏ trên robot (LED báo, cầu đo pin, cầu Echo HC-SR04) nên chuyển lên bo đục lỗ + header cái khi đã chạy trên breadboard.'],
    khoi: 'Tháo pin khỏi hộp ngay; mỏ hàn thì rút điện và gác lên đế.',
  });
})();
