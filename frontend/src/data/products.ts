export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryName: string;
  priceRange: string;
  description: string;
  shortDescription: string;
  features: string[];
  specifications: {
    dimensions: string;
    material: string;
    battery: string;
    openingMethods: string[];
    lockingMechanism: string;
  };
  images: string[];
  colors: string[];
  technologies: string[];
  warranty: number; // in months
  installationManual: string[];
  faq: { question: string; answer: string }[];
}

export const CATEGORIES = [
  { slug: "khoa-dai-sanh", name: "Khóa đại sảnh" },
  { slug: "khoa-cua-go", name: "Khóa cửa gỗ" },
  { slug: "khoa-cua-nhom", name: "Khóa cửa nhôm" },
  { slug: "khoa-cua-kinh", name: "Khóa cửa kính" },
  { slug: "khoa-cua-cong", name: "Khóa cửa cổng" },
  { slug: "khoa-khach-san", name: "Khóa khách sạn" },
  { slug: "ket-sat-thong-minh", name: "Két sắt thông minh" },
];

export const PRODUCTS: Product[] = [
  {
    id: "kassler-kl-990-gold",
    name: "Khóa Vân Tay Đại Sảnh Tân Cổ Điển KL-990 Luxury",
    code: "KL-990 Gold",
    category: "khoa-dai-sanh",
    categoryName: "Khóa đại sảnh",
    priceRange: "28.500.000 - 32.000.000 VNĐ",
    shortDescription: "Dòng khóa vân tay đại sảnh phân khúc siêu sang cổ điển, đúc từ đồng nguyên chất dát vàng 24K, tích hợp công nghệ Face ID 3D siêu nhạy.",
    description: "Khóa cửa thông minh Kassler KL-990 là biểu tượng của sự quyền lực, sang trọng đỉnh cao dành cho các biệt thự, lâu đài phong cách tân cổ điển. Được chế tác thủ công tinh xảo bằng chất liệu đồng nguyên chất và dát vàng 24K sang trọng, kết hợp cùng các công nghệ bảo mật sinh trắc học hiện đại nhất thế giới như nhận diện khuôn mặt Face ID 3D, vân tay bán dẫn FPC Thụy Điển, mang đến sự an toàn tuyệt đối và nâng tầm thẩm mỹ cho ngôi gia của bạn.",
    features: [
      "Nhận diện khuôn mặt Face ID 3D siêu tốc dưới 0.5s",
      "Vân tay bán dẫn FPC Thụy Điển chống làm giả",
      "Thân khóa 5 chốt bằng inox 304 đúc nguyên khối chống cạy phá",
      "Tích hợp chuông cửa và màn hình hiển thị HD sắc nét bên trong",
      "Quản lý lịch sử mở cửa thông minh qua ứng dụng di động",
    ],
    specifications: {
      dimensions: "Dài 820mm x Rộng 85mm x Dày 38mm",
      material: "Đồng nguyên chất đúc đặc, mạ vàng 24K cao cấp",
      battery: "Pin Lithium sạc dung lượng cao 4200mAh (dùng 6 - 8 tháng)",
      openingMethods: ["Khuôn mặt (FaceID)", "Vân tay", "Mật mã ảo", "Thẻ từ mã hóa", "Chìa cơ chống sao chép", "App Wifi"],
      lockingMechanism: "Thân khóa tự động hoàn toàn bằng Inox 304, tiêu chuẩn an toàn cấp độ C",
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Vàng 24K", "Đồng cổ hoàng gia"],
    technologies: ["Face ID 3D", "FPC Biometric Thụy Điển", "Wifi Tuya App", "Mã số ảo 32 chữ số", "Cảnh báo cạy phá"],
    warranty: 36,
    installationManual: [
      "Đo kích thước đố cửa gỗ (yêu cầu độ dày cửa >= 40mm, độ rộng đố cửa >= 120mm).",
      "Định vị và khoan lỗ khóa theo dưỡng lắp đặt đi kèm trong hộp sản phẩm.",
      "Lắp đặt ruột khóa (thân khóa) vào khe cửa đã đục và siết chặt ốc cố định.",
      "Đi dây kết nối giữa mặt trước và mặt sau qua lỗ khoan trục trung tâm.",
      "Lắp đặt mặt trước, mặt sau của khóa vào đố cửa rồi cố định chắc chắn.",
      "Lắp pin Lithium vào khay chứa ở mặt sau, kiểm tra hoạt động đóng mở cơ học.",
      "Cài đặt mã số chủ đầu tiên và tải App để kích hoạt liên kết Wifi."
    ],
    faq: [
      {
        question: "Dung lượng pin của khóa KL-990 dùng được bao lâu và sạc thế nào?",
        answer: "Khóa KL-990 sử dụng pin sạc Lithium 4200mAh cao cấp. Với tần suất đóng mở bình thường (khoảng 10-15 lần/ngày), pin có thể dùng liên tục từ 6 đến 8 tháng. Khi pin yếu (dưới 10%), khóa sẽ phát âm thanh cảnh báo và gửi thông báo về ứng dụng điện thoại. Bạn chỉ cần cắm sạc qua cổng Type-C tích hợp phía dưới khóa hoặc tháo pin ra sạc khoảng 3-4 tiếng là đầy."
      },
      {
        question: "Công nghệ Face ID 3D có hoạt động tốt vào ban đêm hay không?",
        answer: "Có, khóa được trang bị camera hồng ngoại kép ban đêm chuyên dụng. Hệ thống quét khuôn mặt 3D phân tích các đường nét đa chiều của khuôn mặt nên nhận diện chính xác tuyệt đối ngay cả trong môi trường tối hoàn toàn, đồng thời ngăn chặn triệt để hành vi sử dụng ảnh chụp hoặc video để mở khóa."
      }
    ]
  },
  {
    id: "kassler-kl-888-black",
    name: "Khóa Cửa Gỗ Sang Trọng Kassler KL-888 Modern",
    code: "KL-888 Black",
    category: "khoa-cua-go",
    categoryName: "Khóa cửa gỗ",
    priceRange: "12.500.000 - 14.800.000 VNĐ",
    shortDescription: "Thiết kế hiện đại vuông vức cao cấp, mặt kính cường lực chống trầy xước, tích hợp vân tay ngay trên tay cầm.",
    description: "Kassler KL-888 là mẫu khóa thông minh sinh ra để dành riêng cho các dòng cửa gỗ căn hộ chung cư cao cấp hoặc biệt thự hiện đại. Sở hữu ngôn ngữ thiết kế tối giản sang trọng với mặt kính cường lực Gorilla Glass thế hệ 5 bóng bẩy chống bám vân tay, khung viền hợp kim kẽm siêu cứng cáp, KL-888 đem lại cảm giác cầm nắm chắc chắn và trải nghiệm thông minh đỉnh cao.",
    features: [
      "Vân tay sinh trắc học đặt ngay trên tay nắm mở cửa cực tiện lợi",
      "Kính cường lực Gorilla mài cong 2.5D chống va đập, trầy xước",
      "Quản lý người dùng, phân quyền truy cập thông qua ứng dụng thông minh",
      "Tính năng xáo trộn mã số ảo ngăn nhìn trộm tuyệt đối",
      "Chế độ thông phòng (Auto-Lock tạm thời tắt) cho các buổi tiệc tùng"
    ],
    specifications: {
      dimensions: "Dài 380mm x Rộng 72mm x Dày 24mm",
      material: "Hợp kim kẽm siêu bền, Mặt kính cường lực Gorilla Glass",
      battery: "4 viên pin AA Alkaline 1.5V (dùng khoảng 10-12 tháng)",
      openingMethods: ["Vân tay", "Mật mã", "Thẻ từ", "Chìa khóa cơ", "App Bluetooth/Wifi"],
      lockingMechanism: "Thân khóa tự động Inox 304 4 chốt an toàn chống cắt phá"
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Đen huyền bí", "Xám Titan bóng"],
    technologies: ["Mật mã ảo", "Cảm biến vân tay FPC", "App điều khiển từ xa", "Cảnh báo cháy nổ khi nhiệt độ phòng > 70 độ C"],
    warranty: 24,
    installationManual: [
      "Kiểm tra độ dày cửa gỗ (yêu cầu dày >= 38mm, rộng >= 95mm).",
      "Đánh dấu và khoan đục lỗ theo bản vẽ kích thước chuẩn của KL-888.",
      "Lắp đặt hộp khóa chốt bên trong thân cửa.",
      "Ốp mặt trước có đệm cao su giảm chấn vào cửa, kéo dây nối điện qua khe cửa.",
      "Kết nối dây cáp vào bo mạch mặt sau, cố định mặt sau bằng ốc vít chuyên dụng.",
      "Lắp đặt 4 viên pin AA chất lượng cao, test chức năng gạt tay cầm kiểm tra chốt khóa.",
      "Đăng ký vân tay Admin theo hướng dẫn giọng nói Tiếng Anh/Tiếng Việt."
    ],
    faq: [
      {
        question: "Khóa hết pin đột ngột khi đang ở bên ngoài thì mở thế nào?",
        answer: "Trong trường hợp khóa hết sạch pin mà bạn chưa kịp thay, bạn có hai cách để mở cửa: (1) Sử dụng chìa khóa cơ dự phòng được cất giấu ở khe cắm dưới đáy khóa. (2) Sử dụng pin dự phòng (Sạc dự phòng điện thoại) cắm vào cổng cấp nguồn khẩn cấp USB/Type-C ở mặt trước để khóa lên điện tạm thời, sau đó mở cửa bằng vân tay hoặc mật mã."
      }
    ]
  },
  {
    id: "kassler-kl-660-slim",
    name: "Khóa Cửa Nhôm Chống Nước KL-660 Slim Plus",
    code: "KL-660 Slim",
    category: "khoa-cua-nhom",
    categoryName: "Khóa cửa nhôm",
    priceRange: "6.200.000 - 7.500.000 VNĐ",
    shortDescription: "Giải pháp hoàn hảo cho cửa nhôm Xingfa, cửa nhựa lõi thép đố hẹp, chống nước tuyệt đối tiêu chuẩn IP66.",
    description: "Kassler KL-660 Slim Plus sở hữu thiết kế thanh mảnh cực kỳ tinh tế, tối ưu hóa cho các hệ cửa đố nhỏ như nhôm kính Xingfa, cửa nhựa lõi thép, cửa sắt hộp. Đặc biệt, sản phẩm đạt tiêu chuẩn kháng nước quốc tế IP66 giúp hoạt động ổn định bền bỉ dưới mọi thời tiết mưa gió khắc nghiệt bên ngoài.",
    features: [
      "Thiết kế siêu mỏng siêu nhỏ gọn chuyên dụng cho hệ nhôm Xingfa đố hẹp",
      "Kháng nước tuyệt đối IP66 phù hợp lắp đặt ngoài hiên nhà có mái che",
      "Cảm biến vân tay siêu nhạy chống nước, nhận diện cả khi ngón tay ướt",
      "Tay nắm dạng gạt xoay đa hướng thông minh, dễ dàng đảo chiều tay gạt trái/phải"
    ],
    specifications: {
      dimensions: "Dài 320mm x Rộng 38mm x Dày 22mm",
      material: "Hợp kim kẽm siêu cứng kết hợp Inox 304",
      battery: "4 viên pin AAA Alkaline 1.5V (dùng 8-10 tháng)",
      openingMethods: ["Vân tay", "Mã số", "Thẻ từ", "Chìa cơ", "App Wifi (Tuya Smart)"],
      lockingMechanism: "Thân khóa móc chuyên dụng cho cửa mở trượt lùa hoặc chốt thẳng cho cửa mở quay"
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Bạc ánh kim", "Đen sần tĩnh điện"],
    technologies: ["Chống nước IP66", "Vân tay bán dẫn 360 độ", "Quản lý mã số dùng 1 lần (OTP) qua điện thoại"],
    warranty: 24,
    installationManual: [
      "Khảo sát đố nhôm (yêu cầu rộng >= 55mm, sâu >= 50mm).",
      "Đục lỗ định vị cẩn thận tránh làm biến dạng thanh nhôm Xingfa.",
      "Đặt ruột khóa phù hợp (móc lùa cho cửa lùa hoặc chốt thẳng cho cửa mở quay).",
      "Luồn dây cáp điều khiển qua trục nhôm.",
      "Ốp khít gioăng cao su chống nước của mặt trước và sau vào nhôm và siết chặt.",
      "Lắp pin AAA và cài đặt cấu hình thông số Admin trên khóa."
    ],
    faq: [
      {
        question: "Cửa lắp đặt ngoài trời bị mưa xối trực tiếp có dùng được KL-660 không?",
        answer: "Kassler KL-660 Slim có tiêu chuẩn chống nước IP66, chống mưa bụi rất tốt. Tuy nhiên để khóa có tuổi thọ lâu dài nhất dưới thời tiết Việt Nam nắng mưa trực tiếp gay gắt, chúng tôi khuyên bạn nên trang bị thêm hộp che mưa chuyên dụng để bảo vệ thân khóa khỏi bị thấm nước ngập lâu ngày."
      }
    ]
  },
  {
    id: "kassler-kl-550-glass",
    name: "Khóa Cửa Kính Cường Lực Không Khoan Lỗ KL-550",
    code: "KL-550 Glass",
    category: "khoa-cua-kinh",
    categoryName: "Khóa cửa kính",
    priceRange: "5.500.000 - 6.800.000 VNĐ",
    shortDescription: "Lắp đặt trực tiếp cho cửa kính thủy lực văn phòng, shop thời trang, không cần khoan đục kính.",
    description: "Khóa cửa kính thông minh Kassler KL-550 là giải pháp khóa vân tay tối ưu nhất cho văn phòng công ty và các cửa hàng thương mại sử dụng cửa kính cường lực. Điểm vượt trội của KL-550 là khả năng lắp đặt dạng kẹp siêu chắc chắn mà không cần khoan bất kỳ lỗ nào trên mặt kính cường lực có sẵn, giữ nguyên vẻ sang trọng nguyên bản của hệ thống cửa.",
    features: [
      "Lắp đặt kẹp cơ học thông minh, không cần khoan kính, không ảnh hưởng cấu trúc cửa",
      "Tích hợp tính năng chấm công nhân viên và xuất lịch sử ra vào qua cổng USB",
      "Hỗ trợ chế độ mở khóa liên tục (chế độ văn phòng họp) cực kỳ tiện lợi",
      "Chuông cửa điện tử âm lượng lớn tích hợp ngay trên bàn phím số"
    ],
    specifications: {
      dimensions: "Dài 190mm x Rộng 78mm x Dày 35mm",
      material: "Nhựa ABS chống cháy phối hợp hợp kim nhôm đúc",
      battery: "4 viên pin AA Alkaline 1.5V",
      openingMethods: ["Vân tay (lưu 150 vân tay)", "Mật mã", "Thẻ từ (lưu 300 thẻ)", "Điều khiển từ xa (Remote - mua thêm)", "App điện thoại"],
      lockingMechanism: "Khóa chốt kép xoay tròn siêu cứng cáp kẹp chặt đố kính đối diện"
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Đen gương Piano", "Bạc Chrome"],
    technologies: ["Màn hình OLED hiển thị menu", "Chấm công xuất Excel qua USB", "Chống sốc điện tĩnh điện cao"],
    warranty: 24,
    installationManual: [
      "Làm sạch bề mặt kính tại vị trí lắp đặt ở mép cửa kính.",
      "Bóc lớp keo đệm cao su và kẹp chặt mặt trước/mặt sau khóa vào cánh kính.",
      "Siết đều ốc lục giác kẹp ở mặt sau để cố định khóa vào mép kính (không siết quá tay làm vỡ kính).",
      "Dán/kẹp hộp đón chốt khóa sang cánh kính đối diện hoặc đục lỗ đón chốt xuống nền sàn/khung cửa nếu là cửa kính 1 cánh.",
      "Lắp pin AA, kiểm tra khoảng cách kẹp chốt an toàn đạt từ 3-5mm."
    ],
    faq: [
      {
        question: "Tính năng chấm công xuất file Excel trên KL-550 hoạt động thế nào?",
        answer: "Khóa có bộ nhớ lưu trữ lịch sử mở cửa của từng nhân viên. Bạn chỉ cần cắm USB vào cổng kết nối dưới đáy khóa, truy cập Menu quản trị chọn 'Xuất lịch sử', khóa sẽ tự động ghi tệp tin Excel chứa danh sách chi tiết ngày/giờ mở cửa của từng ID nhân viên vào USB để bạn cắm sang máy tính xem."
      }
    ]
  },
  {
    id: "kassler-kl-400-gate",
    name: "Khóa Cửa Cổng Sắt Ngoài Trời Chống Nước KL-400",
    code: "KL-400 Gate",
    category: "khoa-cua-cong",
    categoryName: "Khóa cửa cổng",
    priceRange: "7.000.000 - 8.200.000 VNĐ",
    shortDescription: "Thiết kế đúc Inox 304 nguyên khối chống cắt phá, bảo mật vân tay 2 mặt trong và ngoài.",
    description: "Khóa cửa cổng Kassler KL-400 là giải pháp an ninh tối thượng cho cổng sắt biệt thự, nhà phố, nhà trọ. Được chế tác từ chất liệu Inox 304 đúc đặc siêu dày chống rỉ sét, chống cắt cưa và đột nhập phá hoại phá khóa. Đặc biệt khóa hỗ trợ tùy chọn vân tay 2 mặt (trong và ngoài) ngăn chặn kẻ gian thò tay qua khe cửa cổng để mở chốt từ phía trong.",
    features: [
      "Chất liệu thép Inox 304 đúc dày siêu bền, chống chịu rỉ sét ăn mòn biển",
      "Vân tay 2 mặt khóa độc lập bảo mật tối đa cho cửa cổng nhiều nan khe hở",
      "Hộp bảo vệ chống nước toàn diện tiêu chuẩn IP67 hoạt động dưới mưa xối trực tiếp",
      "Tích hợp kết nối cổng chuông màn hình, hệ thống kiểm soát ra vào tòa nhà"
    ],
    specifications: {
      dimensions: "Dài 170mm x Rộng 100mm x Dày 60mm",
      material: "Thép Inox 304 đúc nguyên khối siêu cứng",
      battery: "4 viên pin AA Alkaline hoặc đấu nguồn điện 12V trực tiếp",
      openingMethods: ["Vân tay (2 mặt)", "Mã số", "Thẻ từ", "Chìa khóa cơ tròn chống đoản", "App Wifi điều khiển từ xa"],
      lockingMechanism: "Khóa chốt móc tự khóa hoặc chốt ngang Inox đặc phi 16 cực khỏe"
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Inox xước bạc mờ"],
    technologies: ["Kháng nước IP67", "Cảm biến vân tay kép sinh trắc học", "Cảnh báo chống đập cạy hú còi tại chỗ"],
    warranty: 24,
    installationManual: [
      "Gia cố thêm miếng sắt đệm hàn vào cửa cổng sắt nếu độ dày hộp nan sắt không đủ rộng để bắt ốc trực tiếp.",
      "Khoan lỗ luồn trục cốt khóa và dây điện kết nối 2 mặt của khóa cửa cổng.",
      "Gắn gioăng cao su bọc kín các góc cạnh, áp hai mặt khóa siết ốc đối xứng.",
      "Hàn hoặc bắt vít bát giữ chốt đón khóa vào khung cột cổng sắt đối diện.",
      "Lắp đặt hộp che mưa kim loại bổ sung đi kèm để bảo đảm tuổi thọ sản phẩm lâu nhất."
    ],
    faq: [
      {
        question: "Lắp đặt cho nhà trọ có đông người thuê ra vào có bền không?",
        answer: "Khóa cổng KL-400 rất phù hợp cho nhà trọ nhờ bộ nhớ lưu trữ lớn (lên tới 100 vân tay, 100 thẻ từ) và vỏ ngoài Inox 304 chịu lực va đập phá cực tốt. Bạn có thể dễ dàng thêm/bớt vân tay của từng người thuê thông qua mật mã chủ hoặc quản lý hoàn toàn trên ứng dụng điện thoại rất tiện lợi."
      }
    ]
  },
  {
    id: "kassler-kl-300-hotel",
    name: "Khóa Thẻ Từ Khách Sạn Kassler KL-300 Smart Card",
    code: "KL-300 Hotel",
    category: "khoa-khach-san",
    categoryName: "Khóa khách sạn",
    priceRange: "3.200.000 - 4.500.000 VNĐ (Theo dự án)",
    shortDescription: "Quản lý phân quyền thẻ từ thông minh theo giờ, liên kết phần mềm quản lý phòng khách sạn chuyên dụng.",
    description: "Kassler KL-300 là dòng khóa thẻ từ chuyên dụng phục vụ cho các dự án khách sạn, homestay, resort nghỉ dưỡng cao cấp. Tích hợp công nghệ thẻ từ RFID mã hóa cao tần chống sao chép và đồng bộ mượt mà với phần mềm quản lý máy tính chuyên nghiệp, cho phép phát hành thẻ phòng giới hạn thời gian lưu trú, phân quyền quản lý cho nhân viên dọn phòng.",
    features: [
      "Hệ thống khóa thẻ từ RFID tần số cao chống sao chép hay làm giả thẻ tuyệt đối",
      "Đồng bộ phần mềm quản lý phòng khách sạn, tạo thẻ giới hạn thời gian Check-in/Check-out",
      "Tiết kiệm điện tối đa, tuổi thọ pin kéo dài lên đến 18 tháng",
      "Có chìa khóa cơ dự phòng khẩn cấp che kín thẩm mỹ dưới tay cầm"
    ],
    specifications: {
      dimensions: "Dài 300mm x Rộng 70mm x Dày 20mm",
      material: "Hợp kim kẽm chống ăn mòn sơn phủ bề mặt tĩnh điện cao cấp",
      battery: "4 viên pin AA Alkaline 1.5V (dùng 1.5 năm)",
      openingMethods: ["Thẻ từ cảm ứng RFID mã hóa", "Chìa cơ dự phòng"],
      lockingMechanism: "Ruột khóa khách sạn tiêu chuẩn ANSI 5 chốt siêu an toàn, chống cạy"
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Bạc thanh lịch", "Vàng Gold tinh tế"],
    technologies: ["Thẻ RFID Mifare 13.56MHz", "Quản lý phần mềm quản trị tập trung offline/online", "Cảnh báo cửa chưa đóng khít"],
    warranty: 24,
    installationManual: [
      "Sử dụng dưỡng khoan đục đố cửa gỗ tự nhiên/gỗ công nghiệp của phòng khách sạn.",
      "Lắp hộp khóa ruột tiêu chuẩn ANSI vào cửa, luồn dây tín hiệu lên đầu khóa.",
      "Cố định mặt trước có chip đọc thẻ và mặt sau chứa khay pin siết chặt bằng trục ren sắt.",
      "Kết nối phần mềm quản lý khách sạn trên máy tính với đầu đọc ghi thẻ qua cổng USB.",
      "Quét thẻ cấu hình phòng (Room Card) để khóa nhận biết số phòng tương ứng."
    ],
    faq: [
      {
        question: "Phần mềm quản lý khách sạn đi kèm khóa có mất phí duy trì hàng năm không?",
        answer: "Phần mềm quản lý hệ thống thẻ từ khách sạn Kassler được cung cấp miễn phí vĩnh viễn đi kèm theo dự án mua khóa. Phần mềm có giao diện tiếng Việt thân thiện, dễ sử dụng, giúp quản lý phân tầng thang máy, phát hành thẻ phòng, và báo cáo lịch sử chi tiết."
      }
    ]
  },
  {
    id: "kassler-ks-100-safe",
    name: "Két Sắt Thông Minh Vân Tay Cường Lực KS-100 Luxury",
    code: "KS-100 Safe",
    category: "ket-sat-thong-minh",
    categoryName: "Két sắt thông minh",
    priceRange: "18.500.000 - 22.000.000 VNĐ",
    shortDescription: "Công nghệ nhận diện vân tay ẩn trên tay nắm xoay, thép cường lực đúc đặc dày 10 ly chống cháy phá.",
    description: "Két sắt thông minh Kassler KS-100 mang đến giải pháp lưu trữ tài sản, giấy tờ quan trọng tuyệt mật ngay tại gia đình hay phòng giám đốc. Khác biệt với két sắt truyền thống cồng kềnh thô kệch, KS-100 khoác lên mình ngôn ngữ thiết kế sang trọng với mặt kính cường lực đen bóng siêu sang, tay nắm xoay tự động ẩn hiện, cùng thân vỏ đúc nguyên khối thép Carbon cường lực chống nạy, chống cháy nhiệt độ cao lên đến 1200 độ C.",
    features: [
      "Khóa mở bằng cảm biến vân tay sinh trắc học siêu nhạy tích hợp trên núm xoay tự động",
      "Thân vỏ đúc bằng thép đặc dày 10mm siêu cứng, chống nạy khoan đục phá tối đa",
      "Cảnh báo rung lắc, nhập sai mật khẩu quá 3 lần còi hú chói tai vang dội",
      "Hệ thống chốt chìm Inox đặc đường kính 32mm xoay tròn chống cắt cưa chốt"
    ],
    specifications: {
      dimensions: "Cao 600mm x Rộng 420mm x Sâu 380mm (Trọng lượng: 85kg)",
      material: "Thép Carbon đúc đặc sơn tĩnh điện chống rỉ sét, Lót nhung nỉ alcantara cao cấp bên trong",
      battery: "Sử dụng 4 viên pin AA Alkaline lắp mặt ngoài tiện lợi hoặc nguồn cấp cứu từ ngoài",
      openingMethods: ["Vân tay bán dẫn", "Mật mã ảo cảm ứng", "Chìa khóa cơ chống sao chép khẩn cấp", "App Wifi nhận thông báo mở"],
      lockingMechanism: "Hệ thống chốt Inox 32mm đúc đặc 4 hướng cắm sâu vào thành két"
    },
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    ],
    colors: ["Đen nhám Classic", "Đồng cát ánh kim"],
    technologies: ["Báo động rung lắc toàn thân", "Chống cháy tiêu chuẩn UL Class 350 (2 giờ ở 1200°C)", "Đèn LED chiếu sáng nội thất tự động bật"],
    warranty: 36,
    installationManual: [
      "Chọn vị trí đặt két bằng phẳng trong phòng ngủ, tủ quần áo hoặc vị trí kín đáo.",
      "Sử dụng vít nở sắt phi 12 bắt cố định két trực tiếp vào tường gạch hoặc nền bê tông thông qua 2 lỗ khoan chờ sẵn ở lưng/đáy két nhằm chống trộm khênh két.",
      "Lắp pin AA đi kèm vào hộp pin phụ khẩn cấp mặt ngoài để kích hoạt màn hình cảm ứng.",
      "Mở két bằng mã mặc định nhà sản xuất (123456), nhấn nút reset màu xanh phía sau cánh cửa để cài đặt mật mã mới và lấy dấu vân tay chủ."
    ],
    faq: [
      {
        question: "Bên trong két sắt có được chia ngăn thông minh không?",
        answer: "Có, nội thất KS-100 được bọc da Alcantara cao cấp chống ẩm mốc trầy xước đồ trang sức vàng bạc. Két được chia làm 3 ngăn lớn linh hoạt có thể tháo rời vách ngăn gỗ, đặc biệt tích hợp 1 ngăn kéo khóa bảo mật riêng biệt ở giữa để giữ các tài liệu mật, hộ chiếu."
      }
    ]
  }
];
