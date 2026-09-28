// Bài 0.3 — Gỡ mối hàn: gỡ R4 khỏi chuỗi của bài 0.1 rồi hàn con mới vào. Toạ độ PB giống 0.1 (mặt hàn).
// R4 nằm ở [1,3]–[4,3]; mối [4,3] có cả chân uốn của R3 → gỡ xong chân uốn đó nằm tự do, hàn lại cùng R4 mới.
(function () {
  const BO = { cot: 11, hang: 5, mat: 'duoi' };
  const R123 = [{ loai: 'tro', a: [1, 1], b: [4, 1] }, { loai: 'tro', a: [6, 1], b: [9, 1] }, { loai: 'tro', a: [6, 3], b: [9, 3] }];
  const R4 = { loai: 'tro', a: [1, 3], b: [4, 3], nhan: 'R4' };
  const UON = [{ loai: 'day', pts: [[4, 1], [6, 1]], thiec: true }, { loai: 'day', pts: [[9, 1], [9, 3]], thiec: true }, { loai: 'day', pts: [[6, 3], [4, 3]], thiec: true }];
  const moi = ps => ps.map(p => ({ loai: 'moi', p }));
  const CON = [[1, 1], [4, 1], [6, 1], [9, 1], [9, 3], [6, 3]];
  const ve = (items, moTa, them = {}) => PB.ve({ ...BO, items, ...them }, moTa);
  const hBom = ve([...R123, R4, ...UON, ...moi([...CON, [4, 3]]), { loai: 'moi', p: [1, 3], kieu: 'von' }, { loai: 'mohan', p: [1, 3] }, { loai: 'khoanh', p: [1, 3] }], 'Nung mối đầu chuỗi B rồi bơm hút');
  const hBac = ve([...R123, R4, ...UON, ...moi(CON), { loai: 'khoanh', p: [4, 3] }, { loai: 'day', pts: [[3.3, 3], [5, 3]], mau: '#C77B30' }, { loai: 'mohan', p: [4, 3] }], 'Đặt bấc lên mối có chân uốn, ép mũi hàn lên bấc');
  const hRut = ve([...R123, ...UON, ...moi(CON), { loai: 'chu', p: [2.5, 3], t: 'R4 đã rút · chân uốn R3 nằm tự do', dy: 22 }], 'R4 đã rút ra, chân uốn của R3 còn nằm trên pad', { them_duoi: 20 });
  const hLai = ve([...R123, R4, ...UON, ...moi([...CON, [4, 3], [1, 3]])], 'R4 mới đã hàn, đủ 8 mối');
  const hDo = (a, b, moTa, items) => ve([...items, { loai: 'que', p: a, mau: 'do', dx: 26, dy: -30 }, { loai: 'que', p: b, mau: 'den', dx: 26, dy: 30 }], moTa, { them_duoi: 20 });

  BAI.dangKy({
    id: '0.3',
    nguon: 'không (chỉ mỏ hàn 220V)',
    muc_tieu: 'Gỡ một linh kiện đã hàn mà không làm bong pad: hút thiếc bằng bơm và bằng bấc đồng, rút linh kiện, hàn con mới vào. Số đo trước/sau cho biết làm đúng chưa.',
    can: [
      K.can.moHan(), { ten: 'Bo chuỗi 4 × 1k của bài 0.1', tim: 'bo đục lỗ', lk: 'bo-duc-lo', sl: 1 }, K.can.tro('1k'),
      { ten: 'Bơm hút thiếc', tim: 'bơm hút thiếc', lk: 'bom-hut', sl: 1 }, { ten: 'Bấc hút thiếc 2–3mm', tim: 'hút thiếc', lk: 'bac-hut', sl: 1 },
      { ten: 'Kìm mỏ nhọn hoặc nhíp', tim: 'nhíp', lk: 'nhip', sl: 1 }, { ten: 'Thiếc hàn', tim: 'thiếc hàn', lk: 'thiec', sl: 1 }, K.can.dh(),
    ],
    kien_thuc: `
      <p>Không kéo linh kiện ra khi thiếc còn giữ chân: pad đồng chỉ dán lên bo bằng keo, kéo mạnh là pad bong theo. Phải lấy <b>thiếc</b> ra trước.</p>
      <p><b>Bơm hút</b>: nạp lò xo, nung chảy mối, áp đầu teflon sát mối, bấm nút — lò xo bật hút thiếc lỏng vào ống. Nhanh, hợp mối có nhiều thiếc. <b>Bấc đồng</b>: dây đồng bện có flux; đặt lên mối, ép mũi hàn lên bấc: thiếc chảy thấm vào bấc nhờ mao dẫn. Chậm hơn nhưng lấy sạch lớp cuối và gỡ được cầu thiếc giữa 2 pad.</p>
      <p>Mẹo ngược đời: mối ít thiếc khó hút hơn mối nhiều thiếc. Thêm một chút thiếc mới (có flux) vào mối cũ trước khi hút là thiếc chảy đều, hút sạch hơn.</p>`,
    so_do: [{ nhan: 'Chuỗi sau khi rút R4', svg: SD.chuoi('', [['tro', 'R1 1k'], ['tro', 'R2 1k'], ['tro', 'R3 1k']], 'Ba điện trở còn lại nối tiếp từ đầu A tới chân uốn của R3', { nguon: { ten: 'Ω', tren: 'đầu A', duoi: 'chân uốn R3' } }), chu: 'Rút R4 xong: đầu A tới chân uốn R3 ≈ 3k; đầu A tới đầu B hở.' }],
    du_doan: '<p>Trước khi gỡ: A ↔ B ≈ 4.0k. Sau khi rút R4: A ↔ B = 1 (OL), A ↔ chân uốn R3 ≈ 3.0k. Hàn R4 mới: A ↔ B về ≈ 4.0k.</p>',
    sau: `<h3>Vì sao pad bong</h3>
      <p>Pad đồng dày ~35µm dán lên sợi thuỷ tinh (FR4) hoặc giấy phíp. Keo dán yếu đi rất nhanh trên ~250°C. Nung lâu + lực kéo = pad bong. Quy tắc: mỗi lần nung ≤ 3–4 giây, lực kéo gần bằng 0 — chân ra được là vì thiếc đã hết, không phải vì kéo mạnh.</p>
      <h3>Mao dẫn trong bấc</h3>
      <p>Thiếc lỏng thấm vào khe giữa các sợi đồng nhỏ như nước thấm giấy: khe càng hẹp, lực mao dẫn càng mạnh. Flux trong bấc làm thiếc "ướt" đồng. Bấc đã đầy thiếc thì không hút nữa: cắt đoạn đó bỏ, dùng đoạn mới.</p>
      <h3>Pad đã bong thì sao</h3>
      <p>Bo đục lỗ thì bỏ lỗ đó, dùng lỗ bên cạnh + chân uốn nối sang. Module thật thì hàn một sợi dây nhỏ từ chân linh kiện thẳng tới điểm nối kế tiếp trên mạch (dây "vá"). Cách chữa tốt nhất vẫn là đừng làm bong.</p>`,
    hoi: [
      ['Bơm hút 2 lần mà chân vẫn dính. Làm gì tiếp?', 'Thêm một chút thiếc mới vào mối rồi hút lại, hoặc dùng bấc lấy lớp cuối. Không kéo chân ra.'],
      ['Vì sao đo A ↔ chân uốn R3 phải ra ≈ 3k sau khi rút R4?', 'Còn R1 + R2 + R3 nối tiếp giữa 2 điểm đó: 3 × 1k.'],
      ['Bấc đã chuyển màu bạc cả đoạn. Còn dùng được không?', 'Không: đoạn đó đã đầy thiếc. Cắt bỏ, dùng đoạn mới.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Đo trước, rồi gỡ',
        buoc: [
          { ten: 'Đo chuỗi trước khi gỡ', lam: ['Mỏ hàn chưa cắm. Thang <code>Ω 20k</code>: đầu A (chân trái R1) ↔ đầu B (chân trái R4).'], hinh: hDo([1, 1], [1, 3], 'Đo 2 đầu chuỗi trước khi gỡ', [...R123, R4, ...UON, ...moi([...CON, [4, 3], [1, 3]])]),
            kiem: { thay: '≈ 4.0.', neu_khong: 'Khác nhiều: sửa bo 0.1 cho đúng trước.' } },
          { ten: 'Bơm hút mối đầu B', cap_dien: true, lam: ['Mỏ hàn ~330°C. Nạp bơm (ấn pít-tông tới chốt).', 'Nung mối chân trái R4 tới khi thiếc bóng lỏng, áp đầu bơm sát mối, bấm nút ngay khi rút mũi hàn ra. Lặp nếu còn thiếc.'], hinh: hBom,
            kiem: { thay: 'Lỗ gần như sạch, chân lỏng trong lỗ.', neu_khong: 'Còn dính: thêm chút thiếc mới rồi hút lại.' } },
          { ten: 'Bấc cho mối có chân uốn', lam: ['Mối chân phải R4 (có cả chân uốn của R3): đặt bấc lên mối, ép mũi hàn lên bấc 2–3 giây, nhấc cả bấc lẫn mũi cùng lúc (không để bấc nguội dính vào mối).'], hinh: hBac },
          { ten: 'Rút R4', lam: ['Kìm mỏ nhọn kẹp thân R4, rút nhẹ. Chân nào còn giữ: nung lại mối đó 1–2 giây rồi rút — không bẻ.'], hinh: hRut,
            kiem: { thay: 'R4 ra, 2 pad còn nguyên trên bo, chân uốn R3 vẫn nằm trên pad.', neu_khong: 'Pad bong: dùng lỗ bên cạnh (xem Đào sâu).' } },
          { ten: 'Đo lại', lam: ['Gác mỏ hàn lên đế. A ↔ B, rồi A ↔ chân uốn R3.'], hinh: hDo([1, 1], [4, 3], 'Đo từ đầu A tới chân uốn R3', [...R123, ...UON, ...moi(CON)]),
            kiem: { thay: 'A ↔ B = 1 (OL). A ↔ chân uốn R3 ≈ 3.0.', neu_khong: 'A ↔ B vẫn có số: thiếc còn nối pad cũ, kiểm cầu thiếc.' } },
        ],
      },
      {
        ten: 'Phần 2 · Hàn con mới',
        buoc: [
          { ten: 'Cắm R4 mới, hàn 2 mối', cap_dien: true, lam: ['Cắm 1k mới vào đúng 2 lỗ cũ. Mối bên phải phải ôm cả chân R4 mới lẫn chân uốn của R3.'], hinh: hLai },
          { ten: 'Rút điện mỏ hàn, đo', lam: ['Gác mỏ, rút điện. A ↔ B.'],
            kiem: { thay: '≈ 4.0 như trước khi gỡ.', neu_khong: '≈ 1.0 hoặc 1 (OL): mối bên phải chưa ôm chân uốn R3 — hàn lại mối đó.' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Trước / sau', cot: ['A ↔ B (k)', 'A ↔ chân uốn R3 (k)'], hang: [{ ten: 'Trước khi gỡ', du_doan: ['≈ 4.0', '≈ 3.0'] }, { ten: 'Đã rút R4', du_doan: ['1 (OL)', '≈ 3.0'] }, { ten: 'Hàn R4 mới', du_doan: ['≈ 4.0', '≈ 3.0'] }] }],
    bay: ['Kéo linh kiện khi thiếc chưa chảy hết: pad bong theo.', 'Để bấc nguội dính vào mối rồi giật: kéo luôn pad.', 'Bơm hút chĩa vào mặt khi bấm: thiếc lỏng có thể bắn. Hướng bơm xuống bo, đeo kính.'],
    robot: ['Hàn nhầm chân module, thay linh kiện cháy trên mạch robot: đều bắt đầu bằng gỡ thiếc sạch.'],
    khoi: 'Rút điện mỏ hàn, gác lên đế.',
  });
})();
