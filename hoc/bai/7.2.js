// Bài 7.2 — Motor cuộn dây tự quấn. Không breadboard: 1 viên AAA, 2 kẹp giấy làm giá, nam châm.
(function () {
  const sd = SD;
  const svg = (w, h, s, nhan) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${nhan}" class="sd">${s}</svg>`;
  const h1 = svg(360, 150, `<ellipse cx="160" cy="70" rx="36" ry="36" style="fill:none;stroke:#C0733A;stroke-width:5"/>` + `<line x1="60" y1="70" x2="124" y2="70" style="stroke:#C0733A;stroke-width:2.5"/><line x1="196" y1="70" x2="260" y2="70" style="stroke:#C0733A;stroke-width:2.5"/>`
    + sd.chu(70, 100, 'đầu trái: cạo HẾT men', 'sd-chu') + sd.chu(190, 124, 'đầu phải: cạo NỬA trên', 'sd-xau') + `<rect x="210" y="64" width="40" height="6" style="fill:#E0B070"/>` + sd.chu(160, 18, '15 vòng, đường kính ~2.5cm', 'sd-mo', 'middle'), 'Cuộn 15 vòng, hai đầu làm trục; một đầu cạo hết men, đầu kia chỉ cạo nửa');
  const h2 = svg(360, 190, `<rect x="70" y="140" width="180" height="30" rx="4" style="fill:#3B4652"/>` + sd.chu(160, 160, 'AAA nằm ngang', 'lk-trang', 'middle')
    + `<path d="M80 140 V60 q0 -8 8 -8" class="sd-net" stroke-width="2.5"/><path d="M240 140 V60 q0 -8 -8 -8" class="sd-net" stroke-width="2.5"/>` + `<circle cx="160" cy="135" r="14" style="fill:#6E767E"/>` + sd.chu(160, 124, 'nam châm', 'sd-mo', 'middle')
    + `<ellipse cx="160" cy="60" rx="24" ry="30" style="fill:none;stroke:#C0733A;stroke-width:4"/><line x1="88" y1="54" x2="232" y2="54" style="stroke:#C0733A;stroke-width:2"/>`
    + sd.chu(40, 70, 'kẹp giấy', 'sd-mo') + sd.chu(40, 84, 'uốn móc', 'sd-mo') + sd.chu(248, 110, 'dây thun giữ', 'sd-mo'), 'Hai kẹp giấy dựng trên 2 cực pin làm giá đỡ và tiếp điểm, nam châm nằm trên thân pin dưới cuộn dây');
  BAI.dangKy({
    id: '7.2',
    muc_tieu: 'Tự làm motor DC đơn giản nhất: cuộn dây quay giữa từ trường nam châm. Nửa lớp men còn lại ngắt dòng mỗi nửa vòng, giống cổ góp của motor robot.',
    nguon: '1 viên AAA kiềm · chạy ≤ 20 giây',
    can: [{ ten: 'Dây đồng emay, ~60cm', tim: 'emay', lk: 'day-emay', sl: 1 }, { ten: 'Nam châm tròn', tim: 'nam châm', lk: 'nam-cham', sl: 1 }, { ten: 'Kẹp giấy (2) + giấy nhám + dây thun', tim: 'đinh sắt', lk: 'dinh-kep', sl: 1 }, { ten: 'Pin AAA <b>kiềm</b> (1 viên)', tim: 'pin AAA', sl: 1 }, K.can.dh()],
    kien_thuc: `<p>Dòng qua cuộn dây → cuộn thành nam châm nhỏ → bị nam châm dưới đẩy/hút → quay. Nếu dòng lúc nào cũng chạy, cuộn chỉ lắc rồi đứng. Cạo nửa men ở một đầu trục: nửa vòng có dòng (bị đẩy), nửa vòng không (chạy theo đà). Đó là <b>cổ góp</b> thô.</p>
      <p><b>Cũng là nối tắt pin có chủ đích</b> ở nửa vòng có dòng. Luật như 7.1: 1 viên AAA kiềm, không lithium, không NiMH; mỗi lần chạy ≤ 20 giây rồi tháo 1 kẹp giấy ra cho nguội. Kẹp giấy và pin nóng thì dừng.</p>`,
    du_doan: '<p>Mồi nhẹ bằng tay là quay, vài vòng/giây tới nhanh. Lật nam châm → quay chiều ngược (nếu vẫn chạy).</p>',
    so_do: [{ nhan: 'Motor tự quấn', svg: SD.svg(320, 210, SD.pin(40, 100, '1 viên AAA') + SD.day('40,100 40,40 110,40 110,80') + SD.chu(104, 66, 'kẹp giấy 1', 'sd-mo', 'end')
      + SD.day('40,110 40,170 250,170 250,80') + SD.chu(250, 186, 'kẹp giấy 2', 'sd-mo', 'middle')
      + '<ellipse cx="180" cy="80" rx="40" ry="26" class="sd-net"/>' + SD.day('110,80 140,80') + SD.day('220,80 250,80') + SD.chu(185, 44, 'cuộn 15 vòng (rotor)', 'sd-chu', 'middle')
      + '<rect x="150" y="128" width="60" height="16" class="sd-net sd-to"/>' + SD.chu(180, 140, 'N / S', 'sd-mo', 'middle') + SD.chu(220, 110, 'đầu cạo nửa', 'sd-xau'),
      'Hai kẹp giấy làm giá nối pin, rotor cuộn dây nằm trên, nam châm đặt dưới'), chu: 'Đầu cạo một nửa ngắt dòng mỗi nửa vòng: cổ góp thô.' }],
    sau: `<h3>Mô-men xoắn trên một vòng dây</h3>
      <p>Cuộn N vòng, diện tích A, dòng I, trong từ trường B: <code>τ = N·B·I·A·sin θ</code>, với θ là góc giữa mặt cuộn và từ trường. Qua nửa vòng, sin θ đổi dấu: nếu dòng cứ chạy mãi, nửa vòng sau lực kéo ngược lại, cuộn chỉ lắc quanh vị trí cân bằng.</p>
      <p>Cạo nửa men làm dòng chỉ chạy ở nửa vòng có sin θ cùng dấu. Nửa kia không có dòng, cuộn quay tiếp nhờ đà. Motor thật dùng <b>cổ góp</b> (vành đồng chia múi + chổi than) để <b>đảo chiều</b> dòng mỗi nửa vòng thay vì ngắt, nên có lực suốt vòng.</p>
      <h3>Vì sao nó không quay nhanh mãi</h3>
      <p>Cuộn quay trong từ trường tự sinh ra áp chống lại pin (bài 7.3). Quay càng nhanh áp ngược càng lớn, dòng càng nhỏ, lực càng nhỏ: tốc độ tự dừng ở mức lực kéo vừa bằng ma sát.</p>`,
    hoi: [
      ['Cạo hết men cả 2 đầu thì chuyện gì xảy ra, vì sao?', 'Có dòng suốt vòng; nửa vòng sau lực ngược chiều → cuộn lắc rồi đứng ở vị trí cân bằng, và pin bị nối tắt liên tục.'],
      ['Lật nam châm lên ngược lại. Chiều quay?', '<b>Đảo chiều</b> (B đổi dấu → lực đổi dấu).'],
      ['Tăng số vòng lên 30 (cùng dòng). Mô-men thay đổi thế nào?', 'Gấp <b>đôi</b> (τ tỉ lệ N), nhưng rotor nặng hơn và dây dài hơn.'],
    ],
    phan: [{
      ten: 'Phần 1 · Làm rotor, dựng giá, chạy',
      buoc: [
        { ten: 'Quấn cuộn 15 vòng', lam: ['Quấn 15 vòng quanh một cái lõi tròn ~2.5cm (pin AA, nắp chai), rút ra. Quấn 2 đầu dây vài vòng quanh cuộn cho chặt, để 2 đầu thò thẳng ra 2 phía đối diện (làm trục).'], hinh: h1 },
        { ten: 'Cạo men: 1 đầu hết, 1 đầu nửa', lam: ['Đặt cuộn nằm phẳng. Đầu trái: cạo hết men một đoạn 1.5cm. Đầu phải: chỉ cạo <b>mặt trên</b> (nửa chu vi), mặt dưới giữ men.'], hinh: h1 },
        { ten: 'Đo Ω rotor', kiem_truoc: true, lam: ['<code>Ω 200</code>. Que chạm đầu trái và mặt đã cạo của đầu phải.'], hinh: h1, kiem: { thay: '< 1Ω (trừ số dây que). Que chạm mặt còn men: 1 (OL).', neu_khong: 'Luôn OL: cạo lại.' } },
        { ten: 'Dựng giá, đặt rotor, mồi', cap_dien: true, lam: ['Uốn 2 kẹp giấy thành giá có móc ở trên, dùng dây thun ép mỗi cái vào một cực pin. Nam châm đặt lên thân pin, giữa 2 giá.', 'Đặt 2 đầu trục vào 2 móc, cuộn cách nam châm vài mm. Mồi nhẹ. <b>Tối đa 20 giây</b>, rồi nhấc rotor ra.'], hinh: h2,
          kiem: { thay: 'Rotor tự quay sau khi mồi.', neu_khong: 'Chỉ lắc: cạo nửa men sai mặt, xoay cuộn thử mặt kia. Không động: kiểm tiếp xúc móc–trục. Kẹp nóng: nghỉ.' } },
      ],
    }],
    bang_do: [{ ten: 'Thử', cot: ['Quay?', 'Chiều'], hang: [{ ten: 'Nam châm mặt 1', du_doan: ['có', ''] }, { ten: 'Lật nam châm', du_doan: ['có', 'ngược'] }] }],
    bay: ['Để chạy lâu: pin nóng, kẹp giấy nóng.', 'Cạo hết men cả 2 đầu: cuộn không quay tiếp được, và có dòng liên tục.'],
    robot: ['Motor DC chổi than của robot: nhiều cuộn + cổ góp chia nhiều lá, chổi than thay cho móc kẹp giấy.'],
  });
})();
