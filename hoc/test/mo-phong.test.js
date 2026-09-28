// node hoc/test/mo-phong.test.js — so mô phỏng với số dự đoán trong bài học.
const MP = require('../mo-phong.js');
let hong = 0;
const gan = (ten, x, muon, sai) => { const ok = Math.abs(x - muon) <= sai; if (!ok) hong++; console.log(`${ok ? 'ok ' : 'HỎNG'} ${ten}: ${x} (muốn ${muon} ± ${sai})`); };
const dung = (ten, ok, chu) => { if (!ok) hong++; console.log(`${ok ? 'ok ' : 'HỎNG'} ${ten}${chu ? ': ' + chu : ''}`); };

const PIN = { id: 'pin', loai: 'pin', cong: 'T+:1', tru: 'B-:1', trang_thai: 'day' };
const PIN_RONG = { ...PIN, trang_thai: 'rong' };
const BT = x => ({ id: 'bt', loai: 'bientro', A: '10d', W: '12d', B: '14d', vi_tri: x });
const kieuA = x => [PIN, BT(x), { id: 'dA', loai: 'day', tu: 'T+:9', den: '10a' }, { id: 'r', loai: 'tro', p: ['12e', '12f'], nhan: '220Ω' },
  { id: 'led', loai: 'led', a: '12i', k: '13i', mau: 'do' }, { id: 'dK', loai: 'day', tu: '13j', den: 'B-:13' }];

// 2.3 kiểu A: I = (4.78 − U_LED)/(220 + R). Bảng dự đoán: R=0 → 12.6mA, 1k → 2.3mA, 10k → 0.29mA.
[[1, 12.6e-3, 1e-3], [0.9, 2.3e-3, 0.3e-3], [0, 0.29e-3, 0.08e-3]].forEach(([x, I, e]) => {
  const k = MP.tao(kieuA(x)).kq; gan(`2.3 kiểu A, W ở ${x}: I LED`, +k.lk.led.I.toPrecision(3), I, e);
});
dung('2.3 kiểu A: không cảnh báo', !MP.tao(kieuA(1)).kq.canh.length);

// 2.3 kiểu B: U_W = 4.78·x, đo DCV 20 giữa W và −.
const kieuB = x => [PIN, BT(x), { id: 'dA', loai: 'day', tu: 'T+:9', den: '10a' }, { id: 'dB', loai: 'day', tu: '14e', den: '14f' }, { id: 'dB2', loai: 'day', tu: '14j', den: 'B-:14' },
  { id: 'dh', loai: 'dh', che_do: 'DCV 20', do_: '12c', den: 'B-:5' }];
gan('2.3 kiểu B x=0.5: đồng hồ', +MP.tao(kieuB(0.5)).kq.dh.hien, 2.39, 0.02);
gan('2.3 kiểu B x=1: đồng hồ', +MP.tao(kieuB(1)).kq.dh.hien, 4.78, 0.02);

// Lần đã cháy: pin + → A, W về −, không có 220Ω; vặn W về A.
const chay = [PIN, BT(1), { id: 'dA', loai: 'day', tu: 'T+:9', den: '10a' }, { id: 'dW', loai: 'day', tu: '12e', den: '12f' }, { id: 'dW2', loai: 'day', tu: '12j', den: 'B-:12' }];
const kc = MP.tao(chay).kq;
dung('2.3 lần cháy: biến trở bốc khói', kc.chay.has('bt'), kc.canh.map(c => c.muc).join(','));
dung('2.3 lần cháy: có cảnh báo pin nối tắt hoặc khói', kc.canh.some(c => c.muc === 'chay'));
const kc2 = MP.tao(chay.map(i => (i.id === 'bt' ? { ...i, vi_tri: 0.3 } : i))).kq;
dung('W ở 0.3 (7k): không cháy', !kc2.chay.size, kc2.canh.map(c => c.chu).join(' | '));

// Đo Ω trước khi lắp pin, kiểu A: bài ghi "1 (OL), hoặc một số lớn".
const om = MP.tao([PIN_RONG, ...kieuA(1).slice(1), { id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-' }]).kq;
dung('Ω 200k qua mạch kiểu A, hộp rỗng: OL hoặc > 100k', om.dh.hien === '1' || +om.dh.hien > 100, om.dh.hien);
// Nối tắt thật khi hộp rỗng: dây từ T+ thẳng xuống B-.
const omTat = MP.tao([PIN_RONG, { id: 'd', loai: 'day', tu: 'T+:5', den: 'B-:5' }, { id: 'dh', loai: 'dh', che_do: 'Ω 200k', do_: 'pin+', den: 'pin-' }]).kq;
gan('Ω 200k khi nối tắt: gần 0', +omTat.dh.hien, 0, 0.05);
const om10k = MP.tao([{ id: 'r', loai: 'tro', p: ['5a', '9a'], nhan: '10k' }, { id: 'dh', loai: 'dh', che_do: 'Ω 20k', do_: '5c', den: '9c' }]).kq;
gan('Ω 20k qua 10k', +om10k.dh.hien, 10, 0.01);

// Đo dòng: đồng hồ nối tiếp thay dây về −, lỗ mA.
const dong = MP.tao([PIN, { id: 'dA', loai: 'day', tu: 'T+:5', den: '5a' }, { id: 'r', loai: 'tro', p: ['5e', '5f'], nhan: '220Ω' },
  { id: 'led', loai: 'led', a: '5i', k: '6i' }, { id: 'dh', loai: 'dh', che_do: 'DCA 20m', cong: 'mA', do_: '6j', den: 'B-:6' }]).kq;
gan('DCA 20m nối tiếp LED + 220Ω (mA)', +dong.dh.hien, 12.4, 0.8);
const cauChi = MP.tao([PIN, { id: 'dh', loai: 'dh', che_do: 'DCA 200m', cong: 'mA', do_: 'T+:3', den: 'B-:3' }]).kq;
dung('lỗ mA chạm thẳng 2 cực pin: đứt cầu chì', cauChi.chay.has('dh:cauchi'));
const daiSai = MP.tao([PIN, { id: 'dh', loai: 'dh', che_do: 'DCV 20', cong: 'mA', do_: 'T+:3', den: 'B-:3' }]).kq;
dung('núm DCV nhưng que ở lỗ mA: có cảnh báo', daiSai.canh.some(c => /lỗ mA/.test(c.chu)));

// LED không có trở, cắm thẳng pin: phải cháy.
const ledTrong = MP.tao([PIN, { id: 'd', loai: 'day', tu: 'T+:5', den: '5a' }, { id: 'led', loai: 'led', a: '5e', k: '6e' }, { id: 'd2', loai: 'day', tu: '6a', den: 'B-:6' }]).kq;
dung('LED không trở: bốc khói', ledTrong.chay.has('led'));

// Diode chế độ ▶|: 1N4148 ≈ 0.55–0.65 thuận, "1" ngược.
const dio = (a, b) => MP.tao([{ id: 'd', loai: 'diode', kieu: '4148', a: '5c', k: '9c' }, { id: 'dh', loai: 'dh', che_do: 'diode ▶|', do_: a, den: b }]).kq.dh.hien;
gan('diode ▶| thuận 1N4148', +dio('d.A', 'd.K'), 0.6, 0.06);
dung('diode ▶| ngược', dio('d.K', 'd.A') === '1', dio('d.K', 'd.A'));

// Transistor làm công tắc: B qua 10k lên +, C qua 220Ω + LED lên +, E xuống −.
const q = on => MP.tao([PIN, { id: 'q', loai: 'npn', e: '12h', b: '13h', c: '14h' }, { id: 'dE', loai: 'day', tu: '12j', den: 'B-:12' },
  { id: 'rb', loai: 'tro', p: ['T+:13', '13a'], nhan: '10k' }, { id: 'dB', loai: 'day', tu: '13e', den: on ? '13f' : '20f' },
  { id: 'rc', loai: 'tro', p: ['T+:16', '16a'], nhan: '220Ω' }, { id: 'led', loai: 'led', a: '16e', k: '14e' }, { id: 'dC', loai: 'day', tu: '14a', den: '14f' }]).kq;
const qOn = q(true), qOff = q(false);
gan('NPN bão hoà: I LED (mA)', +(qOn.lk.led.I * 1e3).toFixed(2), 13, 1);
dung('NPN bão hoà: Vce < 0.3V', qOn.lk.q.Vce < 0.3, qOn.lk.q.Vce.toFixed(3));
dung('NPN không có dòng B: LED tắt', qOff.lk.led.I < 1e-6, qOff.lk.led.I);

// Tụ 100µF nạp qua 10k: sau τ = 1s còn ≈ 63% của 4.78V.
const rc = MP.tao([PIN, { id: 'r', loai: 'tro', p: ['T+:5', '5a'], nhan: '10k' }, { id: 'c', loai: 'tu', p: ['5e', '6e'], nhan: '100µF' }, { id: 'd', loai: 'day', tu: '6a', den: 'B-:6' }]);
for (let i = 0; i < 20; i++) rc.buoc(0.05);
gan('RC 10k·100µF sau 1s (V)', +rc.kq.lk.c.U.toFixed(2), 4.78 * (1 - Math.exp(-1)), 0.08);
const nguoc = MP.tao([PIN, { id: 'r', loai: 'tro', p: ['T+:5', '5a'], nhan: '1k' }, { id: 'c', loai: 'tu', p: ['6e', '5e'], nhan: '100µF' }, { id: 'd', loai: 'day', tu: '6a', den: 'B-:6' }]);
for (let i = 0; i < 10; i++) nguoc.buoc(0.05);
dung('tụ hoá ngược cực: cảnh báo', nguoc.kq.canh.some(c => /ngược cực/.test(c.chu)));

// Nút: 1–3 luôn thông, nhấn nối sang 2–4.
const nut = x => MP.tao([PIN, { id: 'n', loai: 'nut', o: '10e', nhan_xuong: x }, { id: 'r', loai: 'tro', p: ['T+:10', '10a'], nhan: '1k' }, { id: 'd', loai: 'day', tu: '12j', den: 'B-:12' }]).kq.lk.r.I;
dung('nút nhả: không dòng', nut(false) < 1e-6); gan('nút nhấn: I (mA)', +(nut(true) * 1e3).toFixed(2), 4.78, 0.05);

// Quang trở: sáng → R nhỏ.
dung('LDR sáng < tối', MP.troLdr(0.9) < MP.troLdr(0.1), `${MP.troLdr(0.9).toFixed(0)} / ${MP.troLdr(0.1).toFixed(0)}`);
console.log(hong ? `\n${hong} HỎNG` : '\nTất cả ok');
process.exit(hong ? 1 : 0);
