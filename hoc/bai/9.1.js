// Bài 9.1 — Nháy LED ngoài: GPIO13 → 8a; 330Ω 8e → 8f; LED chân dài 8i, chân ngắn 9i; 9j → thanh −; GND board → thanh −.
(function () {
  const ESP = K.esp({ G13: '8a', GND: 'B-:3' });
  const R = K.tro('r', ['8e', '8f'], '330'), L = K.led('led', '8i', '9i'), DK = K.day('dK', '9j', 'B-:9', 'den');
  BAI.dangKy({
    id: '9.1',
    poster: [3],
    muc_tieu: 'Chương trình đầu tiên điều khiển phần cứng thật: GPIO13 bật/tắt LED mỗi giây. Tính và đo dòng.',
    can: [...K.coBanEsp(2), K.can.tro('330'), K.can.led()],
    kien_thuc: `<p>GPIO ở mức 1 = chân ra ~3.3V so với GND board; mức 0 = 0V. Chân ra có điện trở trong nhỏ (bài 9.2), nên vẫn cần điện trở hạn dòng như với pin.</p>
      <p><code>I = (3.3 − 1.9)/330 ≈ 4.2mA</code>, dưới xa mức 20mA mặc định của chân.</p>
      <p>Lý do chọn GPIO13: không phải chân strapping, không dính flash/PSRAM/USB, không trùng chân xiaozhi (bài 9.6, <code>sandbox/esp32-bai/main/chung.h</code>).</p>`,
    code: 'sandbox/esp32-bai/main/bai_9_1.c',
    du_doan: '<p>LED nháy 1s. Lúc sáng: U_330 ≈ 1.4V → I ≈ 4.2mA; U ở chân GPIO ≈ 3.3V.</p>',
    phan: [{
      ten: 'Phần 1 · Ráp, đo, nạp',
      buoc: [
        { ten: 'Ráp LED + 330Ω', lam: ['USB rút. 330Ω (cam-cam-nâu) vắt qua rãnh 8e → 8f. LED: chân dài 8i, chân ngắn 9i. Dây đen 9j → thanh − dưới.'], board: { them: [R, L, DK] } },
        { ten: 'Nối GPIO13 và GND', lam: ['Dây đực–cái: chân <code>13</code> → <b>8a</b>. Chân <code>GND</code> → thanh − dưới (cột 3).'], board: { them: [ESP] } },
        { ten: 'Đo trước khi cắm USB', kiem_truoc: true, lam: ['<code>Ω 200k</code>. Que đỏ 8c (dây GPIO), que đen thanh −.'], board: { them: [K.dh('Ω 200k', '8c', 'B-:12', '> 0.33')] },
          kiem: { thay: 'Không dưới 330Ω: GPIO đi qua 330Ω + LED mới tới GND.', neu_khong: 'Gần 0: dây GPIO đang cắm thẳng vào thanh − hoặc cột có dây GND. <b>Không cắm USB.</b>' } },
        K.camUsb('Cắm USB, nạp bài 9.1', ['<code>idf.py menuconfig</code> → 9.1 (mặc định), <code>flash monitor</code>.'], { sua: { led: { sang: true } } }, { thay: 'LED nháy theo dòng "LED SANG / tat" trên monitor.', neu_khong: 'Không nháy: kiểm chiều LED, dây ở đúng chân 13 chưa (đếm theo chữ in, không theo vị trí).' }),
        { ten: 'Đo lúc LED sáng', lam: ['<code>DCV 20</code>, que đen thanh −. Que đỏ 8c (chân GPIO) rồi 2 chân 330Ω. Đọc lúc LED sáng.'], board: { them: [K.dh('DCV 20', 'r.1', 'r.2', '≈ 1.4')] }, kiem: { thay: 'GPIO ≈ 3.2–3.3V; U_330 ≈ 1.3–1.5V → I ≈ 4mA.', neu_khong: '' } },
        K.rutUsb(),
      ],
    }],
    bang_do: [{ ten: 'Lúc LED sáng', cot: ['U GPIO', 'U_330', 'I = U_330/330'], hang: [{ ten: 'Số đo', du_doan: ['≈ 3.3', '≈ 1.4', '≈ 4.2 mA'] }] }],
    bay: ['LED cắm thẳng GPIO không điện trở: dòng chỉ bị điện trở trong của chân chặn, vượt 20mA, hại chân.', 'Đếm chân theo vị trí trên hình thay vì chữ in trên board của ông.'],
    robot: ['LED trạng thái của robot; cùng cách này bật transistor/driver (bài 8.3, 11.3).'],
  });
})();
