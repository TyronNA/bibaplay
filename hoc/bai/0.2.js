// Bài 0.2 — Hàn header lên module. Ví dụ module 6 chân (INMP441 loại 1 hàng); module khác làm y hệt.
// Breadboard làm đồ gá: header cắm đầu dài xuống hàng 10–15 cột e, module đặt lên đầu ngắn. Hình mặt trên module = PB 6×1.
(function () {
  const BO = { cot: 6, hang: 1 };
  const HEADER_BB = { id: 'hd', loai: 'mod', ten: 'module (đặt lên header)', mau: 'xanhduong', chan: [['1', '10a'], ['2', '11a'], ['3', '12a'], ['4', '13a'], ['5', '14a'], ['6', '15a']] };
  const pad = i => [i, 0];
  const ve = (items, moTa, them = {}) => PB.ve({ ...BO, items: [{ loai: 'header', p: [0, 0], n: 6 }, ...items], them_duoi: 24, ...them }, moTa);
  const MOI = [0, 1, 2, 3, 4, 5].map(i => ({ loai: 'moi', p: pad(i) }));
  const hDau = ve([{ loai: 'moi', p: pad(0) }, { loai: 'mohan', p: pad(0) }, { loai: 'chu', p: pad(0), t: 'mối 1', dy: 30 }], 'Hàn chân đầu tiên');
  const hHai = ve([{ loai: 'moi', p: pad(0) }, { loai: 'moi', p: pad(5) }, { loai: 'chu', p: pad(5), t: 'mối 2: chân cuối', dy: 30, neo: 'end' }], 'Hàn chân cuối, kiểm module nằm phẳng');
  const hXong = ve(MOI, 'Đủ 6 mối');
  const hDo = ve([...MOI, { loai: 'que', p: pad(2), mau: 'do', dx: 20, dy: -30 }, { loai: 'que', p: pad(3), mau: 'den', dx: 20, dy: 30 }], 'Hai que ở hai chân cạnh nhau', { them_duoi: 34 });

  BAI.dangKy({
    id: '0.2',
    nguon: 'không (chỉ mỏ hàn 220V)',
    muc_tieu: 'Hàn hàng rào chân (header) lên một module để cắm được vào breadboard: thẳng, vuông góc, không chân nào dính sang chân bên cạnh.',
    can: [
      K.can.moHan(), { ten: 'Thiếc hàn', tim: 'thiếc hàn', lk: 'thiec', sl: 1 }, { ten: 'Module kèm header rời (vd mic INMP441)', tim: 'INMP441', lk: 'inmp441', sl: 1 },
      { ten: 'Header đực 2.54mm (thường kèm module)', tim: 'header', lk: 'header', sl: 1 }, K.can.bb(), { ten: 'Kìm cắt / kìm mỏ nhọn (bẻ header)', tim: 'kìm mỏ nhọn', lk: 'kim-mo-nhon', sl: 1 },
      { ten: 'Kính bảo hộ', tim: 'kính bảo hộ', lk: 'kinh-bao-ho', sl: 1 }, K.can.dh(),
    ],
    kien_thuc: `
      <p>Header đực: một thanh nhựa giữ các chân kim loại cách nhau 2.54mm — đúng bước lỗ breadboard. Đầu <b>ngắn</b> đi vào lỗ module và được hàn; đầu <b>dài</b> cắm xuống breadboard.</p>
      <p>Mẹo làm thẳng: cắm header vào breadboard trước (đầu dài xuống), đặt module lên, hàn 2 chân ở 2 đầu, kiểm module nằm phẳng rồi mới hàn nốt. Breadboard giữ các chân thẳng hàng giúp bạn.</p>
      <p>Nhựa breadboard chịu nhiệt kém: mỗi mối ≤ 3 giây, để nguội vài giây giữa các mối kề nhau. Nếu tiếc breadboard thì dùng một mẩu breadboard cũ riêng làm đồ gá.</p>
      <p>Trước khi hàn, đo <b>mốc</b> trên module trần: những chân nào vốn thông nhau trên mạch module (hay gặp: 2 chân GND). Sau khi hàn chỉ được thêm "không thông" — cặp nào mới kêu là cầu thiếc.</p>`,
    so_do: [{ nhan: 'Header lên module', svg: SD.svg(320, 170, SD.hop(60, 30, 200, 40, 'module') + [0, 1, 2, 3, 4, 5].map(i => SD.day(`${90 + i * 28},70 ${90 + i * 28},140`)).join('') + '<rect x="78" y="86" width="164" height="14" rx="2" class="sd-net sd-to"/>'
      + SD.chu(270, 60, 'mặt trên: hàn ở đây', 'sd-mo') + SD.chu(270, 96, 'thanh nhựa', 'sd-mo') + SD.chu(270, 132, 'đầu dài → breadboard', 'sd-mo'), 'Module nằm trên thanh header, đầu ngắn xuyên lên mặt trên để hàn, đầu dài xuống dưới'), chu: 'Hàn ở mặt module có pad (mặt trên), không hàn ở phía thanh nhựa.' }],
    du_doan: '<p>Mỗi chân ↔ pad của nó: kêu (thông). Hai chân cạnh nhau: không kêu, trừ những cặp đã kêu từ lúc đo mốc trên module trần.</p>',
    sau: `<h3>Mối hàn trên lỗ mạ</h3>
      <p>Lỗ trên module là <b>lỗ mạ</b>: thành lỗ phủ đồng nối 2 mặt. Thiếc tốt sẽ chảy vào trong lỗ nhờ mao dẫn và lộ ra một chút ở mặt dưới. Đó là mối chắc nhất: thiếc bám cả trong lòng lỗ, không chỉ trên mặt.</p>
      <h3>Cầu thiếc vì đâu</h3>
      <p>Bước 2.54mm, pad cỡ 1.5–1.8mm: khe giữa 2 pad chỉ ~0.8mm. Thiếc thừa hoặc kéo mũi hàn ngang qua pad kế bên là dính cầu. Tránh bằng cách dùng thiếc vừa đủ (1–2mm dây thiếc 0.8mm mỗi mối) và rút mũi hàn theo hướng thẳng lên dọc chân, không kéo ngang.</p>
      <h3>Vì sao đo mốc trước khi hàn</h3>
      <p>Không có mốc thì một tiếng "bíp" giữa GND và L/R không biết là cầu thiếc hay mạch module nối sẵn. Đo trước rồi so sau là cách kiểm A/B: chỉ thứ thay đổi là mối hàn.</p>`,
    hoi: [
      ['Vì sao hàn chân đầu và chân cuối trước, kiểm rồi mới hàn nốt?', 'Hàn hết rồi mới thấy lệch thì phải gỡ 6 mối. Sau 2 mối vẫn còn nung lại 1 mối để chỉnh.'],
      ['Sau khi hàn, chân 3 và 4 kêu bíp, trong khi lúc đo mốc thì không. Làm gì?', 'Có cầu thiếc giữa pad 3 và 4: kéo mũi hàn sạch giữa 2 pad hoặc dùng bấc hút, rồi đo lại.'],
      ['Hàn header ngược (đầu dài vào module). Hậu quả?', 'Phần cắm xuống breadboard quá ngắn, lỏng, dễ tuột; mối hàn dài xấu. Phải gỡ ra (bài 0.3).'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Đo mốc và gá',
        buoc: [
          { ten: 'Đo mốc trên module trần', lam: ['Thang thông mạch. Chạm lần lượt từng cặp pad cạnh nhau trên module (chưa có header). Ghi lại cặp nào kêu — đó là mạch module nối sẵn.'],
            kiem: { thay: 'Có danh sách cặp "vốn thông" (có thể rỗng).', neu_khong: '' } },
          { ten: 'Bẻ header, cắm vào breadboard', lam: ['Đếm số lỗ module (vd 6). Bẻ header đúng số chân bằng kìm, ở khe giữa 2 chân.', 'Cắm header vào breadboard, đầu dài xuống: <b>10a → 15a</b> (6 cột liền nhau). Đặt module lên, các đầu ngắn xuyên qua lỗ module.'], board: { them: [HEADER_BB] } },
        ],
      },
      {
        ten: 'Phần 2 · Hàn',
        buoc: [
          { ten: 'Bật mỏ hàn, hàn chân đầu', cap_dien: true, lam: ['Mỏ hàn ~330°C, mũi đã tin. Mũi chạm cùng lúc pad và chân số 1, đưa thiếc vào chỗ tiếp xúc, ≤ 3 giây.'], hinh: hDau },
          { ten: 'Hàn chân cuối, kiểm phẳng', lam: ['Hàn chân số 6. Nhìn ngang: module phải song song mặt breadboard.', 'Lệch: nung lại 1 trong 2 mối, lấy ngón tay (không phải chỗ vừa hàn) ấn module cho phẳng, giữ tới khi thiếc đông.'], hinh: hHai },
          { ten: 'Hàn các chân còn lại', lam: ['Hàn 2, 3, 4, 5. Mỗi mối ≤ 3 giây, nghỉ vài giây giữa 2 mối cạnh nhau cho nhựa breadboard khỏi chảy.'], hinh: hXong,
            kiem: { thay: 'Mỗi mối bóng, hình nón, không lan sang pad bên cạnh.', neu_khong: 'Dính cầu: kéo mũi sạch giữa 2 pad hoặc dùng bấc (bài 0.3).' } },
          { ten: 'Rút điện mỏ hàn, gỡ module', lam: ['Gác mỏ lên đế, rút điện. Nguội rồi lay nhẹ 2 đầu module cho header ra khỏi breadboard, không bẻ cong.'], board: { bo: ['hd'] } },
        ],
      },
      {
        ten: 'Phần 3 · Kiểm',
        buoc: [
          { ten: 'Mỗi chân ↔ pad của nó', lam: ['Thang thông mạch. Một que ở đầu dài của chân, que kia chạm pad cùng chân ở mặt trên.'],
            kiem: { thay: 'Cả 6 chân kêu.', neu_khong: 'Không kêu: mối hở hoặc lạnh, hàn lại.' } },
          { ten: 'Hai chân cạnh nhau', lam: ['Chạm 2 que vào 2 chân cạnh nhau, lần lượt 1–2, 2–3, … 5–6.'], hinh: hDo,
            kiem: { thay: 'Chỉ kêu ở những cặp đã kêu lúc đo mốc.', neu_khong: 'Cặp mới kêu: cầu thiếc, gỡ rồi đo lại. <b>Không cắm module có cầu thiếc vào mạch có điện</b>: nếu đó là VCC–GND là nối tắt nguồn.' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Kiểm từng cặp', cot: ['Mốc (trước hàn)', 'Sau hàn'], hang: [1, 2, 3, 4, 5].map(i => ({ ten: `Chân ${i}–${i + 1}`, du_doan: ['', ''] })) }],
    bay: ['Không đo mốc trước: một tiếng bíp sau khi hàn không biết là lỗi hay là mạch nối sẵn.', 'Giữ mũi hàn lâu trên chân cắm breadboard: nhựa chảy, lỗ breadboard hỏng vĩnh viễn.', 'Hàn ở phía thanh nhựa (mặt dưới module): thiếc không vào lỗ, nhựa header chảy, chân xê dịch.'],
    robot: ['Mic INMP441, ampli MAX98357A, OLED, GY-521, DRV8833 thường bán kèm header rời: đây là việc đầu tiên khi đồ về.', 'Lắp lên robot thì dùng header cái trên bo đục lỗ để còn tháo module ra thay được.'],
    khoi: 'Rút điện mỏ hàn, gác lên đế.',
  });
})();
