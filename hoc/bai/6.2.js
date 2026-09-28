// Bài 6.2 — Cổng logic. Dây đen T-:24 → B-:24 làm thanh − trên cũng là GND, để đầu vào đổi giữa T+ (1) và T- (0).
(function () {
  const NOI = K.day('noi', 'T-:24', 'B-:24', 'den', -30);
  const vao = (id, cot, muc) => K.day(id, `${muc ? 'T+' : 'T-'}:${cot}`, `${cot}a`, muc ? 'do' : 'xanh');
  const OR = [{ id: 'd1', loai: 'diode', kieu: '4148', a: '5b', k: '12b' }, { id: 'd2', loai: 'diode', kieu: '4148', a: '8d', k: '12d' }, K.tro('rk', ['12a', 'T-:12'], '10k')];
  const AND = [{ id: 'd1', loai: 'diode', kieu: '4148', a: '12b', k: '5b' }, { id: 'd2', loai: 'diode', kieu: '4148', a: '12d', k: '8d' }, K.tro('rk', ['T+:12', '12a'], '10k')];
  const NOT = [K.tro('rb', ['5c', '11c'], '10k'), K.day('cau', '11e', '11f', 'vang'), { id: 'q', loai: 'npn', e: '10h', b: '11h', c: '12h' }, K.day('dE', '10j', 'B-:10', 'den'),
    K.tro('rc', ['12e', '12f'], '10k'), K.day('dC', 'T+:12', '12a', 'do')];
  const doi = (a, b) => ({ bo: ['a', 'b'].slice(0, b === undefined ? 1 : 2), them: [vao('a', 5, a), ...(b === undefined ? [] : [vao('b', 8, b)])] });
  const bangThu = (ten, hai, ket) => ({
    ten: `Thử đủ tổ hợp đầu vào (${ten})`,
    lam: [`Đầu vào là dây ở cột 5${hai ? ' và cột 8' : ''}: đầu ở thanh nguồn cắm <b>thanh + trên = 1</b>, <b>thanh − trên = 0</b>. Chỉ được dời đúng đầu dây đó khi có pin; mạch đã đo Ω ở mọi tổ hợp.`, `Mỗi tổ hợp đo áp ra (${ket}) so với thanh −, <code>DCV 20</code>.`],
    board: { ...doi(1, hai ? 0 : undefined), them: [...doi(1, hai ? 0 : undefined).them, K.dh('DCV 20', '12c', 'B-:16', '?')] },
    kiem: { thay: 'Ra đúng bảng chân trị (bảng cuối trang).', neu_khong: 'Sai: kiểm chiều diode (vạch = cathode).' },
  });
  const omDu = (hai, nguong) => K.buocOm('Ω 200k', `> ${nguong}`, `Ở <b>mọi</b> tổ hợp đầu vào: không dưới ${nguong}k.`, 'Có tổ hợp ra gần 0: đầu vào đang nối thẳng thanh + với thanh −.',
    [`Đo ${hai ? '4 tổ hợp (0,0) (0,1) (1,0) (1,1)' : '2 trường hợp 0 và 1'}: dời đầu dây đầu vào khi hộp vẫn rỗng.`]);
  BAI.dangKy({
    id: '6.2',
    muc_tieu: 'Ráp cổng OR, AND bằng diode và NOT bằng transistor; lập bảng chân trị bằng đồng hồ. Thấy "0/1" thực chất là mức áp.',
    can: [K.can.d4148(2), K.can.tro('10k', 2), K.can.npn(), ...K.coBan(8)],
    kien_thuc: `<p>OR: 2 diode chung cathode + 10k kéo xuống. Đầu vào nào = 1 thì diode đó dẫn, kéo đầu ra lên ≈ 4.78 − 0.6 ≈ 4.1V.</p>
      <p>AND: 2 diode chung anode + 10k kéo lên. Đầu vào nào = 0 thì diode đó dẫn, kéo đầu ra xuống ≈ 0.6V.</p>
      <p>NOT: đầu vào → 10k → chân B; đầu ra ở C, kéo lên bằng 10k. Vào 1 → transistor dẫn → ra ≈ 0.1V.</p>
      <p>Dây đen nối thanh − trên với thanh − dưới, để thanh − trên là mức 0 ngay cạnh thanh + (mức 1). <b>Đầu vào chỉ được cắm vào thanh + hoặc thanh −</b>, đầu kia cố định ở cột 5/8.</p>`,
    du_doan: '<p>OR: (0,0) → 0; còn lại ≈ 4.1V. AND: (1,1) → 4.78V; còn lại ≈ 0.6V. NOT: vào 0 → 4.78V; vào 1 → ≈ 0.1V.</p>',
    phan: [
      { ten: 'Phần 1 · OR', buoc: [
        K.buocPin(), { ten: 'Nối 2 thanh −, ráp OR', lam: ['Dây đen thanh − trên (cột 24) → thanh − dưới (cột 24).', 'D1: anode 5b, <b>vạch 12b</b>. D2: anode 8d, <b>vạch 12d</b>. 10k từ 12a lên thanh − trên (cột 12).', 'Đầu vào: dây xanh thanh − trên → 5a (A = 0), dây xanh thanh − trên → 8a (B = 0).'],
          board: { them: [NOI, ...OR, vao('a', 5, 0), vao('b', 8, 0)] } },
        omDu(true, 10), K.lapPin('Lắp pin', [], {}, { thay: 'Không có gì nóng.', neu_khong: '' }), bangThu('OR', true, 'cột 12'), K.thaoPin(['Rút hết trừ hộp pin và dây nối 2 thanh −.']) ] },
      { ten: 'Phần 2 · AND', buoc: [
        K.buocPin(), { ten: 'Ráp AND', lam: ['Dây đen nối 2 thanh − như phần 1.', 'D1: <b>vạch 5b</b>, anode 12b. D2: <b>vạch 8d</b>, anode 12d. 10k từ thanh + (cột 12) xuống 12a.', 'Đầu vào A, B như phần 1.'],
          board: { them: [NOI, ...AND, vao('a', 5, 0), vao('b', 8, 0)] } },
        omDu(true, 10), K.lapPin('Lắp pin', [], {}, { thay: '', neu_khong: '' }), bangThu('AND', true, 'cột 12'), K.thaoPin(['Rút hết trừ hộp pin và dây nối 2 thanh −.']) ] },
      { ten: 'Phần 3 · NOT', cot: 24, buoc: [
        K.buocPin(), { ten: 'Ráp NOT', lam: ['Dây đen nối 2 thanh −.', 'Đầu vào dây ở cột 5 → 10k 5c → 11c → dây vàng 11e → 11f → chân B (11h). S8050: E 10h, B 11h, C 12h; dây đen 10j → thanh −.', 'Kéo lên: 10k vắt qua rãnh 12e → 12f, dây đỏ thanh + → 12a. Đầu ra đo ở cột 12.'],
          board: { them: [NOI, ...NOT, vao('a', 5, 0)] } },
        omDu(false, 10), K.lapPin('Lắp pin', [], {}, { thay: '', neu_khong: '' }), bangThu('NOT', false, 'cột 12'), K.thaoPin() ] },
    ],
    bang_do: [
      { ten: 'OR (V ra)', cot: ['A=0 B=0', 'A=0 B=1', 'A=1 B=0', 'A=1 B=1'], hang: [{ ten: 'Đo', du_doan: ['≈ 0', '≈ 4.1', '≈ 4.1', '≈ 4.1'] }] },
      { ten: 'AND (V ra)', cot: ['A=0 B=0', 'A=0 B=1', 'A=1 B=0', 'A=1 B=1'], hang: [{ ten: 'Đo', du_doan: ['≈ 0.6', '≈ 0.6', '≈ 0.6', '≈ 4.78'] }] },
      { ten: 'NOT (V ra)', cot: ['vào 0', 'vào 1'], hang: [{ ten: 'Đo', du_doan: ['≈ 4.78', '≈ 0.1'] }] },
    ],
    bay: ['Cắm đầu vào vào lỗ hàng a/b của cột khác thay vì thanh nguồn: nối nhầm 2 phần mạch.', 'Nối 2 đầu vào: 1 dây ở thanh +, 1 dây ở thanh − mà 2 đầu kia chung cột: nối tắt. Mỗi đầu vào một cột riêng (5 và 8).'],
    robot: ['ESP32 đọc mức: ≥ 0.75×3.3 = 2.48V là 1, ≤ 0.25×3.3 = 0.83V là 0 (datasheet). Áp ở giữa là vùng không xác định.'],
  });
})();
