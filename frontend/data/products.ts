export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryName: string;
  imageUrl: string;
  price: number;
  priceRange: string;
  description: string;
  shortDescription: string;
  images: string[];
  features: string[];
  specs: Record<string, string>;
  specifications: {
    dimensions: string;
    material: string;
    battery: string;
    openingMethods: string[];
    lockingMechanism: string;
  };
  technologies: string[];
  warranty: number;
  warrantyText: string;
  colors: string[];
  installationManual: string[];
  faq: { question: string; answer: string }[];
}

export const CATEGORIES = [
  { id: "all", slug: "all", name: "Tất cả sản phẩm" },
  { id: "Kitchen", slug: "Kitchen", name: "Thiết bị nhà bếp" },
  { id: "Lock", slug: "Lock", name: "Khóa thông minh" },
  { id: "Water", slug: "Water", name: "Thiết bị lọc nước" },
  { id: "Cabinet", slug: "Cabinet", name: "Phụ kiện tủ bếp" },
  { id: "Smart", slug: "Smart", name: "Thiết bị thông minh" },
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "ta-9800",
    name: "Khóa Thông Minh FaceID 3D TA-9800",
    code: "TA-9800 PREMIUM",
    category: "Lock",
    categoryName: "Khóa thông minh",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
    price: 18500000,
    priceRange: "18.500.000 VNĐ",
    description: "Khóa thông minh phân khúc Luxury tích hợp camera chuông hình, nhận diện khuôn mặt FaceID 3D siêu tốc và kết nối App Wifi điều khiển từ xa.",
    shortDescription: "Khóa thông minh phân khúc Luxury tích hợp camera chuông hình, nhận diện khuôn mặt FaceID 3D.",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1000"
    ],
    features: [
      "Face ID 3D nhận diện sinh trắc học chống sao chép giả mạo",
      "Màn hình màu LCD sắc nét mặt trong hiển thị toàn cảnh ngoài cửa",
      "Gửi thông báo có hình ảnh người bấm chuông về app điện thoại",
      "Vân tay bán dẫn FPC siêu nhạy từ Thụy Điển kích hoạt < 0.3 giây"
    ],
    specs: {
      "Chất liệu": "Hợp kim kẽm hàng không CNC nguyên khối, mặt kính cường lực chịu lực",
      "Chế độ mở khóa": "Face ID, Vân tay, Mật mã, Điện thoại, Thẻ từ, Chìa cơ khẩn cấp",
      "Nguồn cấp năng lượng": "Pin sạc Lithium 5000mAh bền bỉ lên đến 12 tháng",
      "Độ dày cửa tương thích": "Cửa gỗ, cửa chống cháy có độ dày từ 38mm - 120mm"
    },
    specifications: {
      dimensions: "Dài 420mm x Rộng 78mm x Dày 26mm",
      material: "Hợp kim kẽm hàng không CNC nguyên khối, mặt kính cường lực",
      battery: "Pin sạc Lithium 5000mAh bền bỉ lên đến 12 tháng",
      openingMethods: ["Face ID", "Vân tay", "Mật mã ảo", "Thẻ từ", "Chìa cơ", "App Wifi"],
      lockingMechanism: "Thân khóa tự động hoàn toàn bằng Inox 304, tiêu chuẩn cấp độ C"
    },
    technologies: ["AI Face Recognition", "FPC Swedish Sensor", "Tuya Mobile IoT", "Anti-Peep PIN Code"],
    warranty: 36,
    warrantyText: "36 Tháng (1 đổi 1 trong 12 tháng)",
    colors: ["Space Gray (Xám Không Gian)", "Champagne Gold (Vàng Thượng Hạng)"],
    installationManual: [
      "Khảo sát đố cửa (độ dày cửa gỗ >= 38mm, đố cửa rộng >= 100mm).",
      "Sử dụng dưỡng khoan đục lỗ đố cửa chuẩn xác theo sơ đồ kích thước.",
      "Lắp đặt hộp ruột khóa tự động Inox 304 vào đố cửa.",
      "Luồn dây cáp kết nối từ mặt trước ra mặt sau qua lỗ khoan cốt trung tâm.",
      "Cố định chắc chắn hai mặt ốp trong/ngoài của khóa bằng vít chuyên dụng.",
      "Lắp pin Lithium vào khay chứa, cài đặt cấu hình mã số Admin và liên kết App Tuya."
    ],
    faq: [
      {
        question: "Dung lượng pin sạc Lithium dùng được bao lâu và sạc như thế nào?",
        answer: "Khóa sử dụng pin Lithium sạc dung lượng lớn 5000mAh. Với tần suất mở cửa trung bình, pin có thể hoạt động bền bỉ từ 8 đến 12 tháng."
      },
      {
        question: "Công nghệ Face ID 3D có nhận diện được trong bóng tối không?",
        answer: "Có, khóa sử dụng camera hồng ngoại quét đa chiều tự động phát hiện và nhận diện khuôn mặt chính xác ngay cả trong môi trường tối."
      }
    ]
  },
  {
    id: "ta-bosch-pxx",
    name: "Bếp Từ Đa Điểm Bosch PXX975DC1E",
    code: "BOSCH PXX975DC1E",
    category: "Kitchen",
    categoryName: "Thiết bị nhà bếp",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000",
    price: 32500000,
    priceRange: "32.500.000 VNĐ",
    description: "Bếp từ đa điểm cao cấp nhập khẩu nguyên khối từ Đức. Trang bị mặt bếp Schott Ceran chịu nhiệt, bảng điều khiển DirectSelect Premium và chức năng cảm biến chiên xào thông minh.",
    shortDescription: "Bếp từ đa điểm cao cấp nhập khẩu nguyên khối từ Đức, Schott Ceran chịu nhiệt.",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000"
    ],
    features: [
      "Vùng nấu FlexInduction tự động kết hợp xoong nồi cỡ lớn đa điểm",
      "Điều khiển DirectSelect Premium với 17 mức nhiệt tinh chỉnh tiện lợi",
      "Cảm biến nhiệt FryingSensor ngăn cháy xém thức ăn khi chiên xào",
      "Tự động nhận diện chu vi đáy nồi thông minh ngắt nhiệt an toàn"
    ],
    specs: {
      "Kích thước sản phẩm": "51 x 916 x 527 mm",
      "Tổng công suất nấu": "11.100 W mạnh mẽ vượt trội",
      "Xuất xứ": "Made in Germany (Đức)",
      "Vật liệu kính": "Schott Ceran chịu nhiệt đến 750 độ C"
    },
    specifications: {
      dimensions: "Dài 916mm x Rộng 527mm x Dày 51mm",
      material: "Kính gốm thủy tinh Schott Ceran cao cấp của Đức",
      battery: "Điện áp xoay chiều 220V - 240V / 50-60Hz",
      openingMethods: ["Cảm ứng trượt DirectSelect Premium", "Khóa an toàn trẻ em"],
      lockingMechanism: "Tự động tắt bếp an toàn khi tràn nước hoặc quá nhiệt"
    },
    technologies: ["FlexInduction Zone", "FryingSensor Plus", "PowerBoost System", "DirectSelect Dual UI"],
    warranty: 24,
    warrantyText: "24 Tháng chính hãng",
    colors: ["Vát cạnh trước, viền thép không gỉ đen bóng"],
    installationManual: [
      "Khảo sát bàn đá bếp.",
      "Dán gioăng cao su bọc quanh mép kính mặt dưới để chống thấm nước.",
      "Đặt bếp từ từ trên xuống khoét đá nhẹ nhàng khớp khít."
    ],
    faq: [
      {
        question: "Vùng nấu đa điểm FlexInduction hoạt động thế nào?",
        answer: "FlexInduction cho phép bạn kết hợp hai vùng nấu nhỏ thành một vùng nấu phẳng cỡ lớn thống nhất."
      }
    ]
  },
  {
    id: "ta-konox-granite",
    name: "Chậu Rửa Bát Đá Granite Konox",
    code: "KONOX SINK LUXURY",
    category: "Kitchen",
    categoryName: "Thiết bị nhà bếp",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-76d318047648?q=80&w=1000",
    price: 11950000,
    priceRange: "11.950.000 VNĐ",
    description: "Chậu rửa bát đá thạch anh cao cấp nhập khẩu chính hãng từ Ý. Chất liệu Keratek kháng khuẩn 99.9%, bền bỉ chống bám bẩn trầy xước.",
    shortDescription: "Chậu rửa bát đá thạch anh cao cấp nhập khẩu chính hãng từ Ý, kháng khuẩn 99.9%.",
    images: [
      "https://images.unsplash.com/photo-1610557892470-76d318047648?q=80&w=1000",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000"
    ],
    features: [
      "Chất liệu Keratek Plus độc quyền chịu nhiệt lên đến 340 độ C",
      "Bề mặt mịn màng mướt nước không bám dầu mỡ hay cặn canxi",
      "Chiều sâu chậu 220mm hạn chế tối đa việc bắn nước ra xung quanh",
      "Đi kèm thớt sồi sang trọng và rổ ráo nước thông minh cao cấp"
    ],
    specs: {
      "Kích thước chậu": "R 860 x S 500 x C 220 mm",
      "Vật liệu độc quyền": "80% Bột đá thạch anh tự nhiên + Keo acrylic cao cấp",
      "Kiểu lắp đặt": "Lắp nổi biên mỏng hoặc lắp âm bàn đá tinh tế",
      "Phụ kiện tặng kèm": "Thớt gỗ sồi cao cấp Italy, Siphon ngăn mùi kháng khuẩn"
    },
    specifications: {
      dimensions: "Dài 860mm x Rộng 500mm x Sâu 220mm",
      material: "Đá Granite thạch anh tự nhiên (Ý) Keratek Plus",
      battery: "Không dùng điện (Chậu rửa cơ học)",
      openingMethods: ["Đầu xả nhấn định vị", "Lọc rác 3 lớp bằng Inox"],
      lockingMechanism: "Siphon ngăn mùi kháng khuẩn thông minh tự lưu thông nước thoát"
    },
    technologies: ["Keratek Plus Nano Tech", "BioShield Antibacterial", "Drainage Flow Optimizer"],
    warranty: 60,
    warrantyText: "60 Tháng (5 Năm hoàn hảo)",
    colors: ["Chalcis Carbon (Đen Kim Sa)", "Alba Off-White (Trắng Sữa Gạo)"],
    installationManual: [
      "Đo đạc và xác định vị trí khoét hố bàn đá bếp.",
      "Khoét đá và mài trơn mép vết cắt.",
      "Kết nối siphon với đường nước thải gia đình."
    ],
    faq: [
      {
        question: "Chất liệu Keratek Plus có dễ bị ố hay nứt vỡ không?",
        answer: "Không, Keratek Plus giúp bề mặt chậu rửa cực kỳ mịn màng, chống bám màu và chịu nhiệt cao."
      }
    ]
  },
  {
    id: "ta-smith-purifier",
    name: "Máy Lọc Nước R.O Cao Cấp A.O. Smith",
    code: "A.O. SMITH RO-M2",
    category: "Water",
    categoryName: "Thiết bị lọc nước",
    imageUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1000",
    price: 14200000,
    priceRange: "14.200.000 VNĐ",
    description: "Công nghệ màng lọc RO-Side Stream độc quyền nâng cao tỷ lệ nước tinh khiết thu hồi, thiết kế không bình chứa đặt gọn âm tủ tối giản tinh tế.",
    shortDescription: "Công nghệ màng lọc RO-Side Stream độc quyền thu hồi nước cao cấp A.O. Smith.",
    images: [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1000",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000"
    ],
    features: [
      "Màng lọc RO Side Stream kéo dài tuổi thọ sử dụng lên đến 3 năm",
      "Vòi rửa thông minh hiển thị trực tiếp chất lượng nước TDS và tuổi thọ lõi",
      "Hệ thống cảnh báo rò rỉ nước Leak Detector an toàn tuyệt đối",
      "Màn hình điều khiển vi xử lý kiểm tra tự động dòng chảy liên tục"
    ],
    specs: {
      "Công suất lọc": "94 Lít/giờ liên tục tràn trề",
      "Hiệu suất thu hồi nước": "1:1 siêu tiết kiệm tài nguyên nước",
      "Xuất xứ thương hiệu": "A.O. Smith (Mỹ) danh tiếng hơn 140 năm",
      "Công nghệ màng": "RO - Side Stream thế hệ mới tăng tuổi thọ 1.5 lần"
    },
    specifications: {
      dimensions: "Dài 400mm x Rộng 185mm x Cao 430mm",
      material: "Vỏ nhựa ABS thực phẩm cao cấp, hệ thống vòi Inox chuẩn NSF",
      battery: "Nguồn điện một chiều DC 24V (qua Adapter 220V)",
      openingMethods: ["Vòi điện tử cảm ứng hiển thị chất lượng TDS", "Lõi lọc thay nhanh EasyLink"],
      lockingMechanism: "Van điện từ tự động ngắt nước bảo vệ bơm áp lực"
    },
    technologies: ["RO-Side Stream USA", "RFID Smart Core ID", "Leak Detection Sensor"],
    warranty: 12,
    warrantyText: "12 Tháng chính hãng Mỹ",
    colors: ["Trắng Nhôm Cao Cấp", "Bản Titan Sần Cao Cấp"],
    installationManual: [
      "Chọn vị trí lắp đặt khô ráo dưới gầm tủ bếp.",
      "Kết nối đường cấp nước lạnh qua bộ khóa chia chữ T.",
      "Cắm điện nguồn và xả bỏ nước đầu."
    ],
    faq: [
      {
        question: "Nước lọc ra từ máy A.O. Smith có cần đun sôi lại trước khi uống không?",
        answer: "Không cần đun sôi. Nước qua màng lọc RO đạt chuẩn nước uống trực tiếp tại vòi."
      }
    ]
  },
  {
    id: "ta-hafele-spice",
    name: "Giá Kho Gia Vị Âm Tủ Hafele",
    code: "HAFELE SPICE 400",
    category: "Cabinet",
    categoryName: "Phụ kiện tủ bếp",
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1000",
    price: 5400000,
    priceRange: "5.400.000 VNĐ",
    description: "Hệ thống khay inox chống rỉ 304 tích hợp ray giảm chấn thông minh, chuyển động nhẹ nhàng ngay cả khi phân bổ tải trọng lớn.",
    shortDescription: "Khay inox chống rỉ 304 tích hợp ray giảm chấn thông minh Hafele.",
    images: [
      "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1000",
      "https://images.unsplash.com/photo-1595514535311-665aa0757753?q=80&w=1000"
    ],
    features: [
      "Gia công từ thép không rỉ SUS 304 chuẩn bền bỉ chống oxi hóa bếp ăn",
      "Hệ ray âm giảm chấn Hafele bền bỉ trên 50,000 lần kéo mở liên tục",
      "Thiết kế 2 tầng khoa học lưu trữ chai lọ gia vị dao thớt đa năng",
      "Dễ dàng tháo rời vệ sinh nhanh gọn bằng nước sạch"
    ],
    specs: {
      "Chiều rộng lọt lòng tủ": "Tối thiểu 365 mm",
      "Độ dày nan Inox": "Nan dẹt dày 5mm chắc chắn chịu lực",
      "Tải trọng tối đa": "Chịu lực tĩnh lên tới 35 kg",
      "Chất liệu hoàn thiện": "Inox 304 điện hóa bóng gương gương sáng"
    },
    specifications: {
      dimensions: "Dài 475mm x Rộng 360mm x Cao 450mm",
      material: "Inox 304 điện hóa chống han rỉ rỉ sét ăn mòn",
      battery: "Không dùng điện (Chuyển động cơ học kéo mở)",
      openingMethods: ["Tay gạt gắn cánh tủ", "Trượt dọc nhẹ nhàng"],
      lockingMechanism: "Ray giảm chấn tự khít nhẹ nhàng khi đóng tủ"
    },
    technologies: ["Hafele SoftClose Rails", "SUS304 Electroplating", "Flexible Space-Divider"],
    warranty: 24,
    warrantyText: "24 Tháng toàn quốc chính hãng Hafele",
    colors: ["Bạc Inox Gương", "Xám Matte Grey Luxury"],
    installationManual: [
      "Kiểm tra kích thước lòng khoang tủ bếp.",
      "Lắp đặt hệ thống ray âm giảm chấn xuống sàn đáy tủ.",
      "Đóng mở thử nghiệm để điều chỉnh cánh tủ."
    ],
    faq: [
      {
        question: "Inox 304 có bị rỉ sét do mắm muối trong bếp không?",
        answer: "Không. Chất liệu Inox 304 cao cấp có khả năng chống oxy hóa rất cao."
      }
    ]
  },
  {
    id: "ta-malloca-oven",
    name: "Lò Nướng Đối Lưu Malloca Premium",
    code: "MALLOCA OVEN MOV-72ED",
    category: "Kitchen",
    categoryName: "Thiết bị nhà bếp",
    imageUrl: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1000",
    price: 16900000,
    priceRange: "16.900.000 VNĐ",
    description: "Thiết kế âm tủ thời thượng, kính đen viền thép không gỉ nguyên khối. Hệ thống quạt đối lưu 3D nướng chín đều hoàn hảo.",
    shortDescription: "Lò nướng đối lưu thiết kế âm tủ thời thượng kính đen viền thép không gỉ Malloca.",
    images: [
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1000",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000"
    ],
    features: [
      "Dung tích cực lớn 72 lít nướng vừa nguyên cả con gà tây lớn",
      "9 công thức chương trình gia nhiệt đa dạng thiết lập riêng dễ dàng",
      "Bề mặt kính cách nhiệt SafeTouch 3 lớp cách nhiệt ngoài mượt mà",
      "Chức năng tự làm sạch bằng thủy phân Hydroclean cực kỳ nhàn nhã"
    ],
    specs: {
      "Dung tích": "72 Lít gia đình",
      "Dải nhiệt độ cài đặt": "50 độ C - 250 độ C",
      "Công suất nướng": "3.100 W hiệu suất đối lưu",
      "Tiêu chuẩn tiết kiệm điện": "Hạng A+ chuẩn châu Âu"
    },
    specifications: {
      dimensions: "Dài 595mm x Cao 595mm x Sâu 566mm",
      material: "Mặt kính đen chịu lực chịu nhiệt 3 lớp, viền inox không gỉ",
      battery: "Điện áp gia đình 220V - 50Hz / Công suất 3100W",
      openingMethods: ["Cảm ứng chạm SmartControl", "Tay nắm kéo mở trợ lực"],
      lockingMechanism: "Khóa bàn phím an toàn và tự ngắt quá nhiệt"
    },
    technologies: ["Hydroclean Self-Clean", "3D Convection Fan", "SafeTouch Cool Door", "SmartControl Touchscreen"],
    warranty: 36,
    warrantyText: "36 Tháng Malloca Việt Nam",
    colors: ["Kính cường lực đen tuyền cao cấp mạ gương"],
    installationManual: [
      "Thiết kế khoang tủ âm.",
      "Đảm bảo mặt sau của tủ có khe thông gió.",
      "Chạy lò không tải ở 200 độ C trong 30 phút đầu."
    ],
    faq: [
      {
        question: "Công nghệ tự làm sạch Hydroclean hoạt động như thế nào?",
        answer: "Hydroclean sử dụng hơi nước để làm mềm dầu mỡ bám trên thành lò."
      }
    ]
  },
  {
    id: "ta-lock-wood",
    name: "Khóa Cửa Gỗ Vân Tay TA-8500",
    code: "TA-8500 SLIM",
    category: "Lock",
    categoryName: "Khóa thông minh",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000",
    price: 9200000,
    priceRange: "9.200.000 VNĐ",
    description: "Khóa cửa gỗ dáng Slim thon gọn sang trọng tinh tế, tay kéo đẩy xoay chuyển mượt mà, chuyên dụng cho căn hộ cao cấp và văn phòng.",
    shortDescription: "Khóa cửa gỗ dáng Slim thon gọn tay kéo đẩy xoay chuyển mượt mà TA-8500.",
    images: [
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000",
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000"
    ],
    features: [
      "Tay nắm dạng Push-Pull tiện dụng tự động chốt khóa siêu an toàn",
      "Đầu đọc vân tay tích hợp trực tiếp trên tay cầm tự nhiên",
      "Cơ chế chống rung lắc giảm tiếng ồn khi gạt chốt trong đêm",
      "Tích hợp chuông báo động nhiệt độ cao phòng ngừa hỏa hoạn"
    ],
    specs: {
      "Vật liệu hoàn thiện": "Hợp kim nhôm và Kính cường lực vát cong 2.5D",
      "Chức năng khẩn cấp": "Ngõ sạc cổng USB-C cấp nguồn bên ngoài",
      "Lưu trữ dữ liệu": "100 Vân tay, 100 Thẻ từ, 50 Mật mã gia đình",
      "Độ dày cửa chuẩn": "Thích hợp cửa gỗ dày 40mm - 90mm"
    },
    specifications: {
      dimensions: "Dài 380mm x Rộng 72mm x Dày 24mm",
      material: "Hợp kim nhôm siêu nhẹ siêu cứng và mặt kính cường lực 2.5D",
      battery: "4 viên pin AA Alkaline 1.5V (sử dụng 10 - 12 tháng)",
      openingMethods: ["Vân tay sinh trắc học", "Mã số ảo", "Thẻ từ", "Chìa khóa cơ chống đoản", "App Wifi Tuya"],
      lockingMechanism: "Thân khóa tự động Inox 304 chốt vát nghiêng chống cạy rung lắc"
    },
    technologies: ["Push-Pull Ergo", "FPC Fingerprint Hub", "Heat Alarm Sensor"],
    warranty: 24,
    warrantyText: "24 Tháng",
    colors: ["Bronze Brown (Vàng Cafe Đồng)", "Deep Jet Black (Đen Bóng Đêm)"],
    installationManual: [
      "Đo đạc đố cửa gỗ.",
      "Khoan lỗ lắp đặt bằng cách ốp dưỡng định vị.",
      "Lắp pin AA kiểm tra đóng mở thử."
    ],
    faq: [
      {
        question: "Khi khóa bị hết pin đột ngột mà đang ở ngoài thì làm cách nào?",
        answer: "Bạn có thể dùng chìa khóa cơ dự phòng hoặc cắm sạc dự phòng qua cổng USB-C."
      }
    ]
  },
  {
    id: "ta-philips-sh",
    name: "Hệ Thống Smart Home Hub TA-Core",
    code: "TA-CORE IoT",
    category: "Smart",
    categoryName: "Thiết bị thông minh",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
    price: 6800000,
    priceRange: "6.800.000 VNĐ",
    description: "Bộ điều khiển trung tâm IoT quản lý toàn bộ thiết bị nhà bếp, khóa thông minh và hệ ánh sáng rèm cửa thông minh toàn diện.",
    shortDescription: "Bộ điều khiển trung tâm IoT quản lý toàn bộ thiết bị nhà bếp khóa thông minh TA-Core.",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000"
    ],
    features: [
      "Kết nối ổn định đồng thời hàng trăm thiết bị qua giao thức Zigbee 3.0",
      "Kích hoạt ngữ cảnh mở cửa tự động bật máy hút mùi và sáng đèn bếp",
      "Điều khiển giọng nói siêu mượt mà qua Google Assistant và Alexa Siri",
      "Thiết kế lắp âm tường sang trọng phay nhôm phủ anot mịn cao cấp"
    ],
    specs: {
      "Giao thức hỗ trợ": "Zigbee 3.0, Wifi 2.4Ghz, Bluetooth Mesh5.0",
      "Màn hình cảm ứng": "IPS HD 4.0 inch mượt mà sắc sảo",
      "Nguồn hoạt động": "Nguồn trực tiếp 220V an tâm",
      "Kích thước đế âm": "Mặt vuông chuẩn thông dụng 86x86 mm"
    },
    specifications: {
      dimensions: "Dài 86mm x Rộng 86mm x Dày 35mm (Mặt viền nhôm nổi 10mm)",
      material: "Khung hợp kim nhôm phay CNC phủ anodized, mặt kính IPS cường lực",
      battery: "Cấp nguồn trực tiếp xoay chiều 220V (Dây Nóng + Dây Nguội)",
      openingMethods: ["Cảm ứng chạm đa điểm", "Ra lệnh bằng giọng nói", "Điều khiển qua Smartphone"],
      lockingMechanism: "Hệ thống mã hóa dữ liệu cục bộ an toàn cao, tự động khôi phục ngữ cảnh khi mất mạng"
    },
    technologies: ["Zigbee 3.0 Standard", "Local Automation Scene", "Anodized Aluminum Finish"],
    warranty: 24,
    warrantyText: "24 Tháng",
    colors: ["Matte Gold (Vàng Nhám)", "Matte Carbon Black (Đen Sợi Carbon)"],
    installationManual: [
      "Chuẩn bị đế âm vuông 86x86mm.",
      "Nối dây nguồn điện 220V vào cầu đấu phía sau.",
      "Bật aptomat điện và kết nối Wifi gia đình."
    ],
    faq: [
      {
        question: "Hệ thống có tự động hóa bật tắt các thiết bị bếp và khóa không?",
        answer: "Có, TA-Core cho phép thiết lập nhiều kịch bản tự động hóa cho nhà thông minh."
      }
    ]
  }
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
