// Bài 15.1 — Servo SG90. Nguồn servo = hộp 3×AAA (thanh + trên / − dưới). GND board → thanh −.
// GPIO14 → 20a; 1k 20c → 24c; servo: cam (S) → 24e, đỏ → thanh + (cột 22), nâu → thanh − (cột 26).
(function () {
  const R = K.tro('r', ['20c', '24c'], '1k');
  const SV = { id: 'sv', loai: 'ngoai', kieu: 'hop', chu: 'SG90', x: 520, chan: { S: '24e', '+': 'T+:22', '−': 'B-:26' }, mau: ['cam', 'do', 'nau'], nhan: 'servo (cam · đỏ · nâu)' };
  const ESP = K.esp({ GND: 'B-:3', G14: '20a' });
  const sd = SD;
  const xung = (x, rong, t) => `<polyline points="${x},60 ${x},30 ${x + rong},30 ${x + rong},60 ${x + 100},60" class="sd-net"/>` + sd.chu(x + rong / 2, 24, t, 'sd-chu', 'middle');
  const soDo = sd.svg(320, 128, sd.day('10,60 20,60') + xung(20, 10, '1ms') + xung(120, 15, '1.5ms') + xung(220, 20, '2ms')
    + sd.chu(20, 84, 'một đầu', 'sd-mo') + sd.chu(120, 84, 'giữa', 'sd-mo') + sd.chu(220, 84, 'đầu kia', 'sd-mo') + sd.chu(20, 104, 'mỗi xung cách nhau 20ms (50Hz)', 'sd-mo') + sd.chu(20, 120, 'hình không đúng tỉ lệ', 'sd-mo'),
  'Xung 1ms, 1.5ms, 2ms mỗi 20ms tương ứng 3 góc của servo');
  BAI.dangKy({
    id: '15.1',
    muc_tieu: 'Servo = motor + hộp số + biến trở đo góc + mạch tự chỉnh, gói trong một hộp. Mình chỉ gửi "góc muốn tới" bằng độ rộng xung; servo tự quay tới và giữ ở đó.',
    nguon: 'USB (board) + 3×AAA (servo)',
    can: [...K.coBanEsp(3), K.can.pin(), K.can.sg90(), K.can.tro('1k')],
    kien_thuc: `<p>Datasheet SG90: xung mỗi <b>20ms</b> (50Hz), độ rộng <b>1ms</b> = một đầu, <b>1.5ms</b> = giữa, <b>2ms</b> = đầu kia, quay được ~180°. Đây vẫn là PWM của chương 11, chỉ khác: thông tin nằm ở <b>độ rộng xung tính bằng ms</b>, không phải % duty.</p>
      <p>Bên trong servo có một biến trở gắn vào trục ra (giống bài 2.3): mạch trong servo so góc đo được với góc xung yêu cầu, lệch thì chạy motor tới khi khớp. Đẩy nhẹ tay quay sẽ thấy servo cưỡng lại — đó là vòng phản hồi.</p>
      <p><b>Nguồn:</b> servo cần 4.8–6V; hộp 3×AAA (~4.5–4.8V) hơi dưới nhưng đủ chạy (yếu hơn chút). Datasheet không ghi dòng lúc kẹt → không lấy nguồn từ chân 5V/3V3 của board, để motor servo giật dòng không làm board reset. <b>GND chung</b> bắt buộc.</p>
      <p>Điện trở 1k nối tiếp dây tín hiệu: nếu lỡ cắm nhầm dây đỏ (4.5V) vào chỗ dây cam, dòng chạy vào chân GPIO bị giới hạn dưới ~1mA thay vì phá chân.</p>`,
    so_do: [{ nhan: 'Tín hiệu', svg: soDo, chu: 'Độ rộng xung = góc.' }],
    code: 'sandbox/esp32-bai/main/bai_15_1.c',
    du_doan: '<p>Mỗi 2 giây servo nhảy tới 1 trong 3 góc: đầu – giữa – đầu kia (~90° mỗi bước). Đứng yên thì giữ góc, đẩy nhẹ thấy cứng.</p>',
    sau: `<h3>Bên trong servo là một vòng điều khiển P</h3>
      <p>Mạch trong servo tính <code>sai = góc_muốn − góc_đo</code> (góc đo từ biến trở gắn trục), rồi cấp cho motor một áp tỉ lệ với sai. Sai lớn → quay nhanh, gần tới → chậm dần, khớp → dừng. Đẩy lệch tay quay → sai khác 0 → motor đẩy lại: đó là cảm giác "cứng" khi đẩy. Có một vùng chết nhỏ (vài µs độ rộng xung) để servo không run khi đứng yên.</p>
      <h3>Phân giải góc</h3>
      <p>1ms → 2ms ≈ 180° → 1µs ≈ 0.18°. PWM 50Hz với 14 bit: mỗi bước 20ms/16384 ≈ 1.22µs ≈ 0.22°. 10 bit (1024) thì mỗi bước 19.5µs ≈ 3.5° — thô thấy rõ. Với servo, số bit của PWM quyết định bước góc nhỏ nhất.</p>
      <h3>Dòng lúc kẹt</h3>
      <p>Servo bị giữ chặt khi đang cố quay: motor bên trong kéo dòng kẹt (bài 7.3), có thể vài trăm mA. Đó là lý do lấy nguồn riêng, và vì sao ép servo vào chặn cơ khí (xung ngoài 1–2ms) làm nó nóng.</p>`,
    hoi: [
      ['Muốn servo ở 45° (0° = 1ms, 180° = 2ms). Độ rộng xung?', '1 + 45/180 = <b>1.25ms</b>.'],
      ['PWM 50Hz 12 bit. Một bước bao nhiêu µs, bao nhiêu độ?', '20ms/4096 ≈ <b>4.9µs ≈ 0.9°</b>.'],
      ['Vì sao đẩy tay quay thấy servo cưỡng lại?', 'Góc đo lệch góc muốn → mạch trong servo cấp dòng cho motor đẩy về: vòng phản hồi.'],
    ],
    phan: [{
      ten: 'Phần 1 · Ráp, rồi cấp điện theo thứ tự', cot: 28,
      buoc: [
        K.buocPin(),
        { ten: '1k và dây từ board', lam: ['USB rút. 1k (nâu-đen-đỏ) từ <b>20c → 24c</b>. <code>GND</code> → thanh − dưới (cột 3). <code>14</code> → <b>20a</b>.'], board: { them: [R, ESP] } },
        { ten: 'Cắm 3 dây servo', kiem_truoc: true, lam: ['Đầu cắm servo có 3 lỗ: dùng 3 dây đực–đực. Dây <b>cam</b> → <b>24e</b>. Dây <b>đỏ</b> → thanh + trên (cột 22). Dây <b>nâu</b> → thanh − dưới (cột 26). Kiểm lại màu: bản clone vàng = tín hiệu, đen = GND.'], board: { them: [SV] },
          kiem: { thay: 'Cam ở 24e, đỏ ở thanh +, nâu ở thanh −.', neu_khong: 'Không chắc dây nào là tín hiệu: chưa đi tiếp, tra trang shop bán hoặc chụp ảnh nhờ người biết điện tử xem.' } },
        K.buocOm('Ω 200k', '> 0.1', 'Không dưới ~100Ω giữa 2 tiếp điểm hộp pin.', 'Gần 0: dây đỏ servo chạm thanh −.', ['Thêm: que đỏ 24d, que đen thanh + → phải ≈ 0 là <b>sai</b> (dây cam đang ở thanh +). Đúng thì ra số lớn.']),
        K.camUsb('Cắm USB trước, nạp 15.1', ['<code>idf.py menuconfig</code> → 15.1, <code>flash monitor</code>. Hộp pin vẫn rỗng: code đã chạy nhưng servo chưa có điện.'], {}, { thay: 'Monitor in "xung 1000us / 1500us / 2000us" mỗi 2 giây. Servo đứng im.', neu_khong: '' }),
        K.lapPin('Rồi lắp pin', ['Nhìn tay quay. Khi servo đang đứng yên ở một góc, đẩy nhẹ tay quay bằng ngón tay (không bẻ mạnh).'], {}, { thay: 'Servo nhảy qua 3 góc theo monitor. Đẩy nhẹ: cưỡng lại, buông ra thì về góc cũ.', neu_khong: 'Rung liên tục / kêu è è: pin yếu hoặc thiếu GND chung. Không nhúc nhích: dây cam chưa tới 24e. Servo nóng: tháo pin.' }),
        { ten: 'Tháo pin trước, rút USB sau', lam: ['Tháo pin khỏi hộp. Rồi rút USB.'], board: { sua: { pin: { trang_thai: 'rong' }, esp: { usb: false } } } },
      ],
    }],
    bang_do: [{ ten: 'Góc (ước bằng mắt)', cot: ['1000µs', '1500µs', '2000µs'], hang: [{ ten: 'Tay quay chỉ về', du_doan: ['một đầu', 'giữa', 'đầu kia'] }] }],
    bay: ['Lấy nguồn servo từ chân 5V của board: servo giật dòng → board reset lặp lại.', 'Quên GND chung: servo giật lung tung.', 'Gửi xung ngoài 1–2ms (vd 0.5 hoặc 2.5ms) để quay "rộng hơn": servo bị ép vào chặn cơ khí, kêu và nóng.', 'Bẻ tay quay bằng tay khi servo đang có điện: gãy răng nhựa.'],
    robot: ['Robot hút bụi không dùng servo cho bánh, nhưng hay dùng để quay cảm biến siêu âm quét trái–phải (xem robot <code>otto-robot</code> trong xiaozhi: toàn servo).'],
  });
})();
