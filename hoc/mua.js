// Link mua (Shopee affiliate) theo id linh kiện trong linhkien.js. Để '' = không hiện nút mua.
// Dán link rút gọn lấy từ Shopee Affiliate (dạng https://s.shopee.vn/...), sửa xong chạy lại deploy-web.sh.
// Có nút mua thì chân trang bản web ghi rõ đây là link affiliate (xuat-web.py) — đừng gỡ dòng đó.
window.MUA = {
  'dien-tro':       '',  // Điện trở 1/4W
  'led':            '',  // LED 5mm
  'nut-nhan':       '',  // Nút nhấn 6×6mm
  'bien-tro':       '',  // Biến trở RM065 10k
  'quang-tro':      '',  // Quang trở GL5528
  'tu-hoa':         '',  // Tụ hoá 10µF / 100µF 16V
  'tu-gom':         '',  // Tụ gốm 104 = 100nF
  '1n4148':         '',  // Diode 1N4148
  '1n4007':         '',  // Diode 1N4007
  's8050':          '',  // Transistor S8050 NPN
  'day-nhay':       '',  // Dây nhảy đực–đực
  'breadboard':     '',  // Breadboard MB-102
  'dong-ho':        '',  // Đồng hồ vạn năng
  'kep-ca-sau':     '',  // Kẹp cá sấu
  'hop-pin':        '',  // Hộp pin 3×AAA
  'motor-dc':       '',  // Motor DC (trong quạt)
  'pin-li':         '',  // Pin lithium 1S (trong quạt)
  'day-emay':       '',  // Dây đồng emay 0.3–0.5mm
  'nam-cham':       '',  // Nam châm đất hiếm tròn
  'dinh-kep':       '',  // Đinh sắt, kẹp giấy, giấy nhám
  'mo-han':         '',  // Mỏ hàn chỉnh nhiệt + đế
  'thiec':          '',  // Thiếc hàn + flux
  'bac-hut':        '',  // Bấc hút thiếc
  'nhip':           '',  // Nhíp
  'kim-cat':        '',  // Kìm cắt chân
  'kim-tuot':       '',  // Kìm tuốt dây
  'tay-3':          '',  // Kẹp "bàn tay thứ ba"
  'tua-vit':        '',  // Tua vít mini đầu dẹt
  'day-loi-don':    '',  // Dây lõi đơn 22AWG
  'esp32-s3':       '',  // ESP32-S3 N16R8 44 chân
  'inmp441':        '',  // Mic I2S INMP441
  'max98357a':      '',  // Ampli I2S MAX98357A
  'oled':           '',  // OLED 0.96" 128×64 I2C
  'loa':            '',  // Loa điện thoại (Samsung)
  'cap-usbc':       '',  // Cáp USB-C có truyền data
  'day-duc-cai':    '',  // Dây nhảy đực–cái
  'ams1117':        '',  // Module ổn áp AMS1117-3.3
  'driver-motor':   '',  // Module driver motor (cầu H)
  'logic-analyzer': '',  // Logic analyzer 8 kênh 24MHz
  'dso138':         '',  // Máy hiện sóng kit DSO138
  'cong-tac-ht':    '',  // Công tắc hành trình KW11-3Z
  'fc51':           '',  // Module hồng ngoại tránh vật FC-51
  'hc-sr04':        '',  // Cảm biến siêu âm HC-SR04
  'tcrt5000':       '',  // Module TCRT5000 (dò vạch / chống rơi)
  'sg90':           '',  // Servo SG90
  'motor-tt':       '',  // Motor giảm tốc TT 1:48 + bánh
  'khe-quang':      '',  // Cảm biến tốc độ khe quang + đĩa 20 lỗ
  'gy521':          '',  // Module GY-521 (IMU MPU-6050)
  'drv8833':        '',  // Module driver motor DRV8833
  'cell-18650':     '',  // Cell lithium 18650
  'tp4056':         '',  // Module sạc TP4056 có bảo vệ (6 chân)
  'de-18650':       '',  // Đế / hộp pin 18650 (1 ô, 2 ô nối tiếp)
  'bms-2s':         '',  // Mạch bảo vệ BMS 2S
  'lm2596':         '',  // Module hạ áp LM2596 (chỉnh được)
  'khung-2wd':      '',  // Khung robot 2WD
};
