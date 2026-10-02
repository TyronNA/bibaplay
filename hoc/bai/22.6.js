// Bài 22.6 — Gỡ lỗi chip ↔ server: cố tình gây từng lỗi, đọc dấu nó để lại ở OLED + log server.
// Dấu vết lấy từ server/app.py (refuse, ota, GeminiSession.ensure_gemini → alert "Không nối được Gemini") và chuỗi vi-VN
// của xiaozhi-esp32 (CHECK_NEW_VERSION_FAILED). Chưa chạy với chip thật khi soạn bài.
(function () {
  const T = K.term;
  BAI.dangKy({
    id: '22.6',
    muc_tieu: 'Học cách đọc lỗi trước khi nó xảy ra thật: cố tình gây 4 lỗi hay gặp nhất, xem mỗi lỗi để lại dấu gì trên OLED và trong log server. Lần sau robot im lặng, nhìn 2 chỗ đó là biết lỗi nằm ở đâu. Bài soạn theo code, <b>chưa chạy với chip thật</b>.',
    can: [K.can.esp(), K.can.usb(), { ten: 'Robot đã nói chuyện được ở bài 22.4', tim: 'INMP441', lk: 'inmp441', sl: 1 }, K.can.wifi()],
    kien_thuc: `
      <p>Một câu nói đi qua 4 chặng: <b>chip → Wi-Fi nhà → server → Gemini</b>. Lỗi ở chặng nào thì dấu vết dừng ở chặng đó. Câu hỏi đầu tiên luôn là: <b>log server có thấy chip không?</b></p>
      <div class="cuon"><table><thead><tr><th>OLED</th><th>Log server</th><th>Lỗi nằm ở</th><th>Sửa</th></tr></thead><tbody>
        <tr><td>Kiểm tra phiên bản mới thất bại…</td><td>không có dòng nào</td><td>chip chưa tới server: sai IP trong firmware, server tắt, tường lửa, Wi-Fi khách</td><td>thử bằng điện thoại như bài 22.1 phần 3</td></tr>
        <tr><td>Kiểm tra phiên bản mới thất bại…</td><td><code>từ chối Device-Id=…</code></td><td>MAC chưa có trong <code>ARES_DEVICES</code></td><td>bài 22.4 phần 1</td></tr>
        <tr><td>đang nghe rồi báo <i>Không nối được Gemini</i></td><td><code>Gemini setup thất bại: …</code></td><td>key sai, hết hạn mức, hoặc server không ra được Internet</td><td>đọc chữ sau dấu hai chấm, kiểm key (bài 22.2)</td></tr>
        <tr><td>Chế độ cấu hình Wi-Fi</td><td>không có dòng nào</td><td>chip không vào được Wi-Fi nhà (đổi mật khẩu, Wi-Fi 5GHz)</td><td>cài lại Wi-Fi (bài 22.3)</td></tr>
      </tbody></table></div>
      <p>Muốn xem chip nói gì: cắm USB, <code>idf.py -p … monitor</code> trong thư mục <code>xiaozhi-esp32</code> (không cần nạp lại). Dòng lỗi thường có chữ <code>E (</code> ở đầu.</p>
      ${K.nhoAI(`Robot xiaozhi của tôi không nói được. OLED hiện: [chép chữ trên OLED].
Đây là log server (journalctl -u ares-server hoặc terminal chạy app.py): [dán vào]
và log chip (idf.py monitor): [dán vào]. Đọc server/app.py, cho tôi biết lỗi nằm ở chặng nào
(chip, Wi-Fi, server hay Gemini) và cách sửa. Đừng sửa code, chỉ chẩn đoán.`)}`,
    du_doan: '<p>Mỗi lỗi để lại một cặp dấu khác nhau (OLED + log server), đúng như bảng ở trên. Lỗi "sai IP" và "MAC chưa cho phép" trông giống nhau trên OLED, chỉ log server phân biệt được: một bên trống trơn, một bên có dòng từ chối.</p>',
    phan: [
      {
        ten: 'Phần 1 · Lỗi trước khi tới server',
        gioi_thieu: 'Robot đang chạy được như cuối bài 22.4. Mở log server ở một cửa sổ để nhìn trong lúc làm (laptop: terminal chạy <code>app.py</code>; máy 24/7: <code>journalctl -u ares-server -f</code>).',
        buoc: [
          { ten: 'Tắt server, khởi động lại chip', lam: ['Dừng server (<kbd>Ctrl</kbd>+<kbd>C</kbd>, hoặc <code>sudo systemctl stop ares-server</code>). Rút USB của board, cắm lại.', 'Đây cũng là đúng những gì chip thấy khi IP trong firmware sai, hay khi tường lửa chặn cổng 8000: không có ai trả lời.'],
            hinh: T(['(OLED)', 'Kiểm tra phiên bản mới thất bại, sẽ thử lại sau … giây', '', '(log server)', '(không có dòng nào)']),
            kiem: { thay: 'OLED báo thất bại và đếm giây, log server trống.', neu_khong: '' } },
          { ten: 'Bật lại server, chờ chip tự vào', lam: ['Chạy lại server. Không đụng tới chip: chờ nó tự thử lại sau số giây trên OLED.'],
            hinh: T(['(log server)', '… OTA check device=aa:bb:cc:dd:ee:ff …', '… connect device=aa:bb:cc:dd:ee:ff … mode=GeminiSession']),
            kiem: { thay: 'Chip tự vào lại, không phải rút cắm.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 2 · Lỗi ở server',
        buoc: [
          { ten: 'Bỏ MAC khỏi danh sách', lam: ['Trong <code>gemini.env</code>, xoá MAC ở dòng <code>ARES_DEVICES=</code>, chạy lại server (máy 24/7: <code>sudo systemctl restart ares-server</code>). Rút USB board, cắm lại.'],
            hinh: T(['(OLED)', 'Kiểm tra phiên bản mới thất bại, sẽ thử lại sau … giây', '', '(log server)', '… từ chối Device-Id=aa:bb:cc:dd:ee:ff từ 192.168.x.z — là chip của bạn thì thêm vào ARES_DEVICES']),
            kiem: { thay: 'OLED giống hệt bước tắt server. Khác ở log: lần này server <b>có thấy</b> chip và in dòng từ chối.', neu_khong: '' } },
          { ten: 'Trả MAC lại', lam: ['Điền lại MAC, chạy lại server, chờ chip tự vào.'],
            kiem: { thay: 'Log có <code>connect … GeminiSession</code>.', neu_khong: '' } },
        ],
      },
      {
        ten: 'Phần 3 · Lỗi ở Gemini',
        buoc: [
          { ten: 'Làm hỏng key', lam: ['Trong <code>gemini.env</code>, thêm chữ <code>x</code> vào cuối key (nhớ là đã thêm gì để gỡ ra). Chạy lại server, bấm <code>BOOT</code> trên robot và nói.', 'Lần này chip vào server bình thường, vì key chỉ cần khi server gọi Google.'],
            hinh: T(['(log server)', '… connect device=aa:bb:cc:dd:ee:ff … mode=GeminiSession', '… listen start mode=…', '… Gemini setup thất bại: …', '', '(OLED)', 'Lỗi · Không nối được Gemini']),
            kiem: { thay: 'Chip vào được server, nhưng lúc nói thì log ra <code>Gemini setup thất bại</code> và OLED báo không nối được Gemini.', neu_khong: '' } },
          { ten: 'Sửa key lại', lam: ['Bỏ chữ <code>x</code>, chạy lại server, nói lại.'],
            kiem: { thay: 'Robot trả lời bình thường.', neu_khong: 'Vẫn lỗi dù key đúng: đọc chữ sau <code>Gemini setup thất bại:</code>. Có chữ quota/limit là đã hết hạn mức miễn phí hôm nay.' } },
        ],
      },
      {
        ten: 'Phần 4 · Wi-Fi khách (tuỳ chọn, cần router có Wi-Fi khách)',
        buoc: [
          { ten: 'Cho chip vào Wi-Fi khách', lam: ['Bấm <code>BOOT</code> lúc chip đang khởi động để vào lại chế độ cấu hình Wi-Fi, chọn Wi-Fi khách (guest) của router.', 'Wi-Fi khách thường bật chế độ cách ly (client isolation): mỗi máy chỉ ra được Internet, không thấy máy khác trong nhà.'],
            kiem: { thay: 'OLED báo đã vào Wi-Fi, rồi lại <i>Kiểm tra phiên bản mới thất bại</i>, log server trống. Giống hệt lỗi sai IP, dù IP đúng.', neu_khong: 'Robot vẫn nói được: router của bạn không cách ly Wi-Fi khách. Vẫn nên đưa chip về Wi-Fi chính.' } },
          { ten: 'Đưa chip về Wi-Fi chính', lam: ['Vào lại chế độ cấu hình, chọn Wi-Fi chính (2.4GHz).'], kiem: { thay: 'Robot nói được.', neu_khong: '' } },
          { ten: 'Rút USB', lam: ['Rút cáp USB trước khi đụng vào dây trên breadboard.'] },
        ],
      },
    ],
    bang_do: [{ ten: 'Dấu của từng lỗi', cot: ['OLED hiện', 'Log server có'], hang: [
      { ten: 'Server tắt / sai IP', du_doan: ['thất bại, đếm giây', 'không có gì'] }, { ten: 'MAC chưa cho phép', du_doan: ['thất bại, đếm giây', 'từ chối Device-Id'] },
      { ten: 'Key sai', du_doan: ['Không nối được Gemini', 'Gemini setup thất bại'] }, { ten: 'Wi-Fi khách', du_doan: ['thất bại, đếm giây', 'không có gì'] },
    ] }],
    hoi: [
      ['OLED báo kiểm tra phiên bản thất bại, log server có dòng <code>từ chối Device-Id</code>. Có cần build lại firmware không?', 'Không. Chip đã tới server, IP đúng. Chỉ cần thêm MAC vào <code>ARES_DEVICES</code> rồi khởi động lại server.'],
      ['Log server trống, điện thoại mở OTA URL thì thấy <code>device not allowed</code>. Lỗi ở đâu?', 'Server và mạng ổn (điện thoại vào được). Chip thì không: IP trong firmware sai, hoặc chip đang ở Wi-Fi khác (Wi-Fi khách, mạng hàng xóm).'],
      ['Chip vào server được, nhưng hễ nói là báo <i>Không nối được Gemini</i>. Có cần đụng tới chip không?', 'Không. Lỗi nằm giữa server và Google: key, hạn mức, hoặc máy chạy server mất Internet.'],
    ],
    bay: ['Sửa nhiều chỗ một lúc (IP, MAC, key) rồi thử lại: chạy được cũng không biết chỗ nào là lỗi. Mỗi lần sửa một chỗ.', 'Build lại firmware khi lỗi nằm ở server: mất 10 phút mà không sửa được gì. Đọc log server trước.', 'Dán log có key lên nhóm chat để hỏi: log server không in key, nhưng file <code>gemini.env</code> thì có. Đừng chụp file đó.'],
    robot: ['Robot bánh xe (bài 17.2) đi cùng đúng con đường này. Thêm một chặng: server → chip qua tool. Log <code>tool chip …</code> cho biết lệnh đã tới chip chưa.'],
  });
})();
