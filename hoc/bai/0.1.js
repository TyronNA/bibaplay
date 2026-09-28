// Bài 0.1 — Mối hàn đầu tiên: 4 điện trở 1k nối tiếp trên bo đục lỗ, uốn chân làm dây nối.
// Toạ độ PB: [cột, hàng] tính từ 0. R1 [1,1]–[4,1], R2 [6,1]–[9,1], R3 [6,3]–[9,3], R4 [1,3]–[4,3].
// Chân uốn ở mặt dưới: R1 [4,1] → [6,1], R2 [9,1] → [9,3], R3 [6,3] → [4,3]. Hai đầu chuỗi: [1,1] và [1,3].
(function () {
  const BO = { cot: 11, hang: 5 };
  const R = [
    { loai: 'tro', a: [1, 1], b: [4, 1], nhan: 'R1' }, { loai: 'tro', a: [6, 1], b: [9, 1], nhan: 'R2' },
    { loai: 'tro', a: [6, 3], b: [9, 3], nhan: 'R3' }, { loai: 'tro', a: [1, 3], b: [4, 3], nhan: 'R4' },
  ];
  const UON = [{ loai: 'day', pts: [[4, 1], [6, 1]], thiec: true }, { loai: 'day', pts: [[9, 1], [9, 3]], thiec: true }, { loai: 'day', pts: [[6, 3], [4, 3]], thiec: true }];
  const PAD = [[1, 1], [4, 1], [6, 1], [9, 1], [9, 3], [6, 3], [4, 3], [1, 3]];
  const MOI = PAD.map(p => ({ loai: 'moi', p }));
  const ve = (mat, items, moTa, them = {}) => PB.ve({ ...BO, mat, items, ...them }, moTa);

  const hTren = ve('tren', [...R, { loai: 'chu', p: [1, 4], t: 'đầu chuỗi A = chân trái R1 · B = chân trái R4', neo: 'start', dy: 20 }], 'Mặt trên bo: 4 điện trở nằm thành 2 hàng', { them_duoi: 16 });
  const hUon = ve('duoi', [...R, ...UON], 'Mặt hàn: 3 chân được uốn nằm dọc bo, chạm chân điện trở kế bên');
  const hHan = ve('duoi', [...R, ...UON, ...MOI.slice(0, 3), { loai: 'mohan', p: [6, 1] }], 'Mặt hàn: đang hàn mối thứ ba, mũi hàn chạm cả pad lẫn chân');
  const hXong = ve('duoi', [...R, ...UON, ...MOI], 'Mặt hàn: đủ 8 mối');
  const hDo = ve('duoi', [...R, ...UON, ...MOI, { loai: 'que', p: [1, 1], mau: 'do', dx: 26, dy: -30 }, { loai: 'que', p: [1, 3], mau: 'den', dx: 26, dy: 30 }], 'Que đỏ ở đầu chuỗi A, que đen ở đầu chuỗi B', { them_duoi: 20 });
  const hSoi = PB.ve({ cot: 3, hang: 1, items: [{ loai: 'moi', p: [0, 0] }, { loai: 'moi', p: [1, 0], kieu: 'von' }, { loai: 'moi', p: [2, 0], kieu: 'lanh' },
    { loai: 'khoanh', p: [0, 0] }, { loai: 'chu', p: [0, 0], t: 'đạt', dy: 30 }, { loai: 'chu', p: [1, 0], t: 'vón', dy: 30, xau: true }, { loai: 'chu', p: [2, 0], t: 'lạnh', dy: 30, xau: true }], them_duoi: 20 }, 'Ba kiểu mối hàn: đạt, vón cục, hàn lạnh');

  BAI.dangKy({
    id: '0.1',
    nguon: 'không (chỉ mỏ hàn 220V)',
    muc_tieu: 'Hàn 8 mối đầu tiên trên bo đục lỗ: 4 điện trở 1k nối tiếp, chân thừa uốn làm dây nối. Mạch không cần pin — số đo cuối cùng (≈ 4k) cho biết cả 8 mối đều tốt.',
    can: [
      K.can.moHan(), { ten: 'Thiếc hàn 0.6–0.8mm có lõi nhựa thông', tim: 'thiếc hàn', lk: 'thiec', sl: 1 }, { ten: 'Bo đục lỗ 2.54mm (một miếng nhỏ)', tim: 'bo đục lỗ', lk: 'bo-duc-lo', sl: 1 },
      K.can.tro('1k', 4), { ten: 'Kìm cắt chân', tim: 'kìm cắt', lk: 'kim-cat', sl: 1 }, { ten: 'Kính bảo hộ', tim: 'kính bảo hộ', lk: 'kinh-bao-ho', sl: 1 },
      { ten: 'Thảm silicon (hoặc tấm gỗ/giấy bìa dày)', tim: 'thảm silicon', lk: 'tham-silicon', sl: 1 }, K.can.dh(),
    ],
    kien_thuc: `
      <p>Mối hàn là thiếc lỏng chảy vào khe giữa chân linh kiện và pad đồng rồi đông lại, <b>dính chặt vào cả hai</b>. Muốn thiếc dính thì cả chân lẫn pad phải đủ nóng: mỏ hàn làm nóng chúng, rồi thiếc chạm vào chúng (không chạm vào mũi) mới tan và lan ra. Nhựa thông trong lõi thiếc tẩy lớp ô-xít mỏng trên đồng để thiếc bám.</p>
      <p>Mối đạt: bóng, hình nón (như cái núi lửa nhỏ) ôm quanh chân, viền lan mịn ra pad. Mối <b>vón</b> tròn như hạt, không bám pad: pad chưa đủ nóng. Mối <b>lạnh</b> xám sần: bị lay lúc thiếc đang đông, hoặc thiếu nhiệt — dẫn chập chờn, là nguồn lỗi khó tìm nhất.</p>
      <p>An toàn: mũi và thân mỏ hàn ~330°C — không chạm, luôn gác lên đế. Khói bốc lên là nhựa thông: quạt hút hoặc mở cửa sổ, đừng cúi mặt sát. Thiếc có chì thì không ăn uống lúc hàn, rửa tay sau đó. Chân cắt văng: đeo kính. Không để pin (nhất là lithium) trên bàn hàn.</p>`,
    so_do: [{ nhan: 'Chuỗi 4 × 1k', svg: SD.chuoi('', [['tro', 'R1 1k'], ['tro', 'R2 1k'], ['tro', 'R3 1k'], ['tro', 'R4 1k']], 'Bốn điện trở 1k nối tiếp giữa hai đầu đo', { nguon: { ten: 'Ω', tren: 'đầu A', duoi: 'đầu B' } }), chu: 'Không có nguồn: chỉ đo Ω giữa 2 đầu chuỗi. Mối nào hở là ra 1 (OL).' }],
    du_doan: '<p>Đo 2 đầu chuỗi: <code>4 × 1k = 4.0k</code> (±5% mỗi con → 3.8–4.2k). Mối hàn tốt gần như 0Ω nên không làm đổi số. Ra 1 (OL): có mối hở. Số nhảy khi ấn nhẹ bo: có mối lạnh.</p>',
    sau: `<h3>Vì sao thiếc Sn63/Pb37 dễ hàn</h3>
      <p>Hợp kim 63% thiếc, 37% chì là hợp kim <b>eutectic</b>: chảy và đông ở đúng một nhiệt độ (183°C), không có giai đoạn "sệt". Thiếc không chì (SAC305: thiếc–bạc–đồng) chảy ở ~217–220°C và đông qua một khoảng nhiệt: dễ thành mối lạnh nếu bị lay, cần mỏ hàn nóng hơn. Người mới dùng Sn63 ít lỗi hơn hẳn.</p>
      <h3>Nhiệt đi đâu</h3>
      <p>Mũi hàn phải truyền đủ nhiệt để đưa chân + pad lên trên 183°C trong 1–2 giây. Mũi nhỏ quá hoặc nhiệt thấp: phải giữ lâu, nhiệt lan sang thân linh kiện và làm bong pad. Nhiệt cao quá (&gt; 380°C): nhựa thông cháy ngay, thiếc ô-xi hoá, mũi đen nhanh. 320–350°C với mũi dẹt nhỏ là vùng dễ nhất cho chân THT.</p>
      <h3>Một mối hàn có điện trở bao nhiêu</h3>
      <p>Mối tốt cỡ vài mΩ — không đồng hồ vạn năng nào thấy được. Nên đồng hồ chỉ bắt được mối <b>hở</b> hoặc <b>chập chờn</b>, không đánh giá được mối "hơi kém". Mắt (bóng, hình nón) vẫn là cách kiểm chính.</p>`,
    hoi: [
      ['Thiếc tan trên mũi hàn rồi nhỏ xuống thành hạt tròn trên pad. Lỗi gì?', 'Đưa thiếc vào mũi thay vì vào chỗ tiếp xúc; pad chưa đủ nóng nên thiếc không bám — mối <b>vón</b>. Hơ lại: mũi chạm cả pad lẫn chân 1–2 giây rồi mới đưa thiếc vào.'],
      ['Đo 2 đầu chuỗi ra 3.0k. Nghi gì?', 'Một điện trở bị nối tắt: thiếc dính cầu giữa 2 pad của nó, hoặc chân uốn chạm nhầm pad.'],
      ['Vì sao rút thiếc trước rồi mới rút mỏ hàn?', 'Rút mỏ trước thì thiếc đông lại dính đầu cuộn thiếc vào mối hàn.'],
    ],
    phan: [
      {
        ten: 'Phần 1 · Chuẩn bị',
        buoc: [
          { ten: 'Dọn bàn hàn', lam: ['Thảm silicon (hoặc tấm gỗ) lót bàn. Đế mỏ hàn đặt bên tay cầm mỏ, búi đồng trong đế. Dây mỏ hàn đi phía sau, không vắt ngang chỗ tay.', 'Mở cửa sổ hoặc bật quạt hút. Đeo kính. Cất hết pin khỏi bàn.'] },
          { ten: 'Bật mỏ hàn, "tin" mũi', cap_dien: true, lam: ['Cắm điện, đặt ~330°C, gác lên đế, chờ 1–2 phút.', 'Lau mũi vào búi đồng, rồi chạm đầu cuộn thiếc vào mũi: thiếc tan ngay và phủ bóng mũi là đủ nóng. Mũi bóng dẫn nhiệt tốt hơn mũi xỉn.'],
            kiem: { thay: 'Thiếc tan trong chưa tới 1 giây, mũi bóng.', neu_khong: 'Thiếc tan chậm: chờ thêm hoặc tăng lên 350°C. Mũi đen không bám thiếc: lau búi đồng rồi tin lại nhiều lần.' } },
          { ten: 'Cắm 4 điện trở', lam: ['Uốn chân 4 con 1k (' + K.tenVong('1k') + ') vuông góc, cách thân ~2mm, cho vừa 3 lỗ khoảng cách (bước 7.62mm).', 'Cắm từ mặt trên theo hình: R1, R2 hàng trên; R3, R4 hàng dưới. Thân áp sát bo.'], hinh: hTren },
          { ten: 'Lật bo, uốn chân làm dây nối', lam: ['Lật bo (mặt hàn lên). Hình mặt hàn đã lật trái ↔ phải so với mặt trên.', 'Uốn 3 chân nằm sát bo, đầu chân chạm pad kế tiếp: chân phải R1 sang pad chân trái R2; chân phải R2 xuống pad chân phải R3; chân trái R3 sang pad chân phải R4. Các chân còn lại bẻ nghiêng ~30° cho điện trở khỏi rơi.'], hinh: hUon },
        ],
      },
      {
        ten: 'Phần 2 · Hàn 8 mối',
        buoc: [
          { ten: 'Hàn từng mối', cap_dien: true, lam: ['Mũi hàn chạm <b>cùng lúc</b> pad và chân, giữ 1 giây.', 'Đưa thiếc vào chỗ chân gặp pad (phía đối diện mũi), cho tới khi thiếc lan tròn quanh chân — cỡ 1–2mm thiếc.', 'Rút thiếc ra trước, rồi rút mỏ hàn. Đừng thổi, đừng lay bo trong 3 giây.', 'Mối nào có chân uốn: thiếc phải ôm cả 2 chân.'], hinh: hHan,
            kiem: { thay: 'Mỗi mối xong trong ≤ 3 giây.', neu_khong: 'Giữ quá 5 giây mà thiếc vẫn không bám: rút ra, để nguội, lau và tin lại mũi rồi làm lại.' } },
          { ten: 'Đủ 8 mối', lam: ['Gác mỏ hàn lên đế. Đếm đủ 8 mối.'], hinh: hXong },
          { ten: 'Soi mối hàn', lam: ['Nhìn nghiêng từng mối dưới đèn sáng (kính lúp càng tốt).', 'Mối vón hoặc lạnh: hơ lại bằng mũi sạch, thêm một chút thiếc, giữ yên tới khi đông.'], hinh: hSoi,
            kiem: { thay: 'Cả 8 mối bóng, hình nón, viền lan ra pad.', neu_khong: 'Thiếc dính sang pad bên cạnh (cầu): kéo mũi hàn sạch ra giữa 2 pad, hoặc dùng bấc hút (bài 0.3).' } },
          { ten: 'Cắt chân thừa', lam: ['Kính bảo hộ. Mặt phẳng của kìm áp về phía mối hàn, cắt sát đỉnh mối. Tay kia che trên chỗ cắt: chân văng rất nhanh.', '<b>Không cắt</b> 3 chân đang làm dây nối. Hai đầu chuỗi (chân trái R1, chân trái R4) để dài ~5mm làm chỗ kẹp que đo.'] },
        ],
      },
      {
        ten: 'Phần 3 · Đo',
        buoc: [
          { ten: 'Rút điện mỏ hàn', lam: ['Rút phích, gác mỏ lên đế cho nguội. Bo đã nguội mới cầm.'] },
          { ten: 'Đo 2 đầu chuỗi', lam: ['Thang <code>Ω 20k</code>. Que đỏ vào chân trái R1, que đen vào chân trái R4 (kẹp cá sấu cho chắc).', 'Ấn nhẹ lên từng điện trở trong lúc nhìn số.'], hinh: hDo,
            kiem: { thay: '≈ <code>4.0</code> (3.8–4.2), số không nhảy khi ấn.', neu_khong: '1 (OL): có mối hở — đo từng điện trở trên bo để khoanh vùng. ≈ 3.0: một con bị chập. Số nhảy khi ấn: mối lạnh, hàn lại.' } },
          { ten: 'Kiểm 2 pad cạnh nhau không thông', lam: ['Thang thông mạch. Chạm lần lượt các cặp pad kề nhau mà <b>không</b> được nối (vd chân phải R1 với pad ngay dưới nó).'],
            kiem: { thay: 'Không kêu ở mọi cặp không được nối.', neu_khong: 'Kêu: có cầu thiếc giữa 2 pad đó, gỡ bằng bấc (bài 0.3).' } },
        ],
      },
    ],
    bang_do: [{ ten: 'Chuỗi 4 × 1k', cot: ['Ω (k)'], hang: [{ ten: '2 đầu chuỗi', du_doan: ['≈ 4.0'] }, { ten: 'R1 (trên bo)', du_doan: ['≈ 1.0'] }, { ten: 'R4 (trên bo)', du_doan: ['≈ 1.0'] }] }],
    bay: ['Chạm vào thân mỏ hàn hay mũi để "thử nóng": bỏng ngay. Thử bằng thiếc.', 'Để mỏ hàn nằm trên bàn/thảm thay vì đế: lăn đi, cháy dây, cháy đồ.', 'Giữ mũi lâu trên một pad (&gt; 5 giây): pad bong khỏi bo — hết sửa được.', 'Cắt chân không che tay, không kính: chân văng vào mắt.'],
    robot: ['Mạch chạy thử trên breadboard xong, lên robot là phải hàn: breadboard rung thì tuột dây. Bài 0.4 chuyển một mạch thật lên bo.', 'Hàn header cho module (bài 0.2) là việc đầu tiên khi mua mic, ampli, OLED về.'],
    khoi: 'Rút điện mỏ hàn, gác lên đế.',
  });
})();
