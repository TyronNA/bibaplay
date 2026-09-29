// Trang /gioi-thieu/ và /chinh-sach-rieng-tu/. AdSense xét duyệt tìm hai trang này; chính sách riêng tư phải khớp
// đúng những gì site làm: sửa worker.js (đếm, /mua/), luu-web.js, mo-phong-ui.js, font, quảng cáo, video thì soát lại ở đây.
(function () {
  const GH = 'https://github.com/TyronNA/bibaplay';
  // Hộp thư công khai: Cloudflare Email Routing của zone bibaplay.com chuyển tiếp về hộp thư cá nhân (không ghi địa chỉ đó ở đây).
  const MAIL = 'lienhe@bibaplay.com';
  const mail = `<a href="mailto:${MAIL}">${MAIL}</a>`;
  const ra = (href, chu) => `<a href="${href}" target="_blank" rel="noopener">${chu} ↗</a>`;
  const CAP_NHAT = '2026-09-29';

  window.TRANG_PHU = {
    'gioi-thieu': {
      tieuDe: 'Giới thiệu · Bàn Ráp',
      moTa: 'Bàn Ráp là giáo trình điện tử miễn phí bằng tiếng Việt: ai đứng sau, nội dung được soạn và kiểm thế nào, site sống bằng gì, báo sai ở đâu.',
      html: R => `<section class="dau"><p class="eyebrow">Giới thiệu</p><h1>Về Bàn Ráp</h1>
        <p class="lede">Giáo trình học điện từ số 0 trên breadboard, đi dần tới ESP32, motor, pin lithium và robot. Viết bằng tiếng Việt, miễn phí, mã nguồn mở.</p></section>
        <section><h2>Ai làm</h2><div class="khung to">
          <p>Một người làm phần mềm lâu năm, mới hoàn toàn với điện tử, tự học để ráp một robot trợ lý giọng nói (<a href="${R('xiaozhi')}">xiaozhi</a>) và sau đó một robot bánh xe. Bàn Ráp là sổ tay của chính quá trình đó, mở ra cho ai cùng đường.</p>
          <p>Vì bắt đầu từ số 0, bài viết giải thích từ gốc: áp, dòng, nối đất chung, pull-up… Không giả định bạn đã biết điện.</p>
        </div></section>
        <section><h2>Nội dung được soạn thế nào</h2><div class="khung to">
          <p>Chữ, hình breadboard và code do AI (Claude của Anthropic) soạn theo yêu cầu và theo bộ đồ thật đang có trên bàn. Người làm site đọc, ráp và sửa lại dần từng bài.</p>
          <p><b>Bài có nhãn "đã ráp thật"</b> có video ráp và đo trên mạch thật. Bài chưa có nhãn đó là <b>chưa ai ráp để kiểm</b>, có thể sai. Vì vậy bài nào cũng bắt đo Ω giữa hai cực nguồn trước khi cấp điện.</p>
          <p>Quy tắc an toàn đó có lý do thật: ở bài <a href="${R('bai/2.3')}">2.3 biến trở</a>, bản hướng dẫn đầu tiên thiếu bước xác định chân, con trượt biến trở bị nối thẳng qua pin, bốc khói và nóng đỏ. Từ đó mọi bước ráp phải có số đo xác nhận trước khi đi tiếp.</p>
        </div></section>
        <section><h2>Site sống bằng gì</h2><div class="khung to">
          <p>Mọi bài, hình và PDF đều miễn phí, không cần đăng ký. Chi phí tên miền và thời gian được bù bằng:</p>
          <ul><li><b>Quảng cáo Google</b> trên trang bài học. Trang công cụ (mô phỏng, danh sách đồ) không gắn quảng cáo.</li>
          <li><b>Link affiliate Shopee</b> ở nút "Mua trên Shopee": bạn mua qua đó thì người soạn nhận hoa hồng, giá bạn trả không đổi. Không hãng nào trả tiền để được nhắc tên trong bài.</li></ul>
        </div></section>
        <section><h2>Báo sai, liên hệ</h2><div class="khung to">
          <p>Email: <b>${mail}</b>. Hỏi bài, góp ý, hợp tác đều gửi về đây.</p>
          <p>Thấy bài sai, hình sai chân, số không khớp datasheet: mở issue ở ${ra(`${GH}/issues`, 'github.com/TyronNA/bibaplay/issues')} để người khác cùng thấy, hoặc gửi email. Toàn bộ web, bài, firmware và server là mã nguồn mở (MIT) trong ${ra(GH, 'repo này')}.</p>
          <p class="mo">Cách site xử lý dữ liệu của bạn: <a href="${R('chinh-sach-rieng-tu')}">chính sách riêng tư</a>.</p>
        </div></section>`,
    },
    'chinh-sach-rieng-tu': {
      tieuDe: 'Chính sách riêng tư · Bàn Ráp',
      moTa: 'Bàn Ráp lưu gì trên máy bạn, đếm gì trên server, và bên thứ ba nào (Google quảng cáo, Google Fonts, Cloudflare, Shopee, YouTube) có thể đặt cookie.',
      html: R => `<section class="dau"><p class="eyebrow">Cập nhật ${CAP_NHAT}</p><h1>Chính sách riêng tư</h1>
        <p class="lede">Bàn Ráp không có tài khoản, không có form, không thu tên hay email của bạn (trừ khi bạn tự gửi email cho site). Trang này liệt kê đủ những gì được lưu và ai có thể thấy.</p></section>
        <section><h2>Lưu trên máy bạn</h2><div class="khung to">
          <p>Các thứ sau nằm trong bộ nhớ trình duyệt (localStorage) trên máy bạn, <b>không gửi về server</b>, người khác không thấy:</p>
          <ul><li>số đo bạn gõ vào bảng "Ghi số đo" của từng bài;</li><li>tiến độ "đang học / đã xong";</li><li>danh sách đồ bạn tick ở trang <a href="${R('do')}">Đồ đang có</a>;</li>
          <li>mạch đang ghép trong <a href="${R('mo-phong')}">mô phỏng</a>;</li><li>lựa chọn giao diện sáng/tối.</li></ul>
          <p>Xoá dữ liệu trang web này trong cài đặt trình duyệt là xoá hết. Link chia sẻ mạch mô phỏng chứa cả mạch trong đường dẫn: ai có link là mở được mạch đó.</p>
        </div></section>
        <section><h2>Đếm trên server</h2><div class="khung to">
          <ul><li><b>Lượt xem</b>: một con số tổng, mỗi phiên trình duyệt cộng 1 (đánh dấu bằng sessionStorage). Không lưu IP, không lưu bạn là ai.</li>
          <li><b>Click nút mua</b>: lưu ngày, món được bấm và trang bấm, để biết bài nào có ích. Không lưu IP hay thông tin cá nhân.</li></ul>
          <p>Site chạy trên Cloudflare. Như mọi nhà cung cấp hạ tầng, Cloudflare xử lý địa chỉ IP và thông tin trình duyệt để phát trang và chống tấn công: ${ra('https://www.cloudflare.com/privacypolicy/', 'chính sách của Cloudflare')}.</p>
        </div></section>
        <section><h2>Bên thứ ba</h2><div class="khung to">
          <ul>
          <li><b>Quảng cáo Google (AdSense).</b> Google và đối tác dùng cookie để hiện quảng cáo, kể cả quảng cáo dựa trên các trang bạn đã xem ở site này và site khác. Xem ${ra('https://policies.google.com/technologies/ads?hl=vi', 'cách Google dùng cookie quảng cáo')}. Tắt quảng cáo cá nhân hoá ở ${ra('https://adssettings.google.com', 'adssettings.google.com')}, hoặc tắt cookie của bên thứ ba khác ở ${ra('https://www.aboutads.info/choices/', 'aboutads.info')}.</li>
          <li><b>Google Fonts.</b> Font chữ tải từ máy chủ Google, nên Google nhận địa chỉ IP của bạn khi tải trang.</li>
          <li><b>Shopee.</b> Bấm "Mua trên Shopee" thì bạn rời site; Shopee đặt cookie để ghi nhận đơn đến từ link affiliate. Xem chính sách riêng tư của Shopee.</li>
          <li><b>YouTube.</b> Video ráp thật chỉ tải khi bạn bấm vào, từ youtube-nocookie.com. Sau khi bấm, YouTube áp dụng ${ra('https://policies.google.com/privacy?hl=vi', 'chính sách của Google')}.</li>
          <li><b>Email.</b> Thư gửi tới ${mail} được Cloudflare chuyển tiếp sang hộp thư Gmail của người làm site. Địa chỉ và nội dung thư chỉ dùng để trả lời bạn, không đưa cho ai.</li>
          <li><b>GitHub.</b> Link báo sai và mã nguồn dẫn sang GitHub, theo chính sách của GitHub.</li>
          </ul>
        </div></section>
        <section><h2>Liên hệ</h2><div class="khung to"><p>Hỏi về dữ liệu: email ${mail}. Báo lỗi bài: email hoặc mở issue ở ${ra(`${GH}/issues`, 'github.com/TyronNA/bibaplay/issues')}. Xem thêm <a href="${R('gioi-thieu')}">giới thiệu</a>.</p></div></section>`,
    },
  };
})();
