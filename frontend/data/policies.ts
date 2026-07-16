import { COMPANY_LEGAL as C } from "./company-legal";
import type { PolicyDocument } from "@/lib/policy-types";

const contactBlock = [
  {
    type: "heading" as const,
    text: "Thông tin liên hệ hỗ trợ",
  },
  {
    type: "paragraph" as const,
    text: `Mọi thắc mắc liên quan đến nội dung chính sách này, Quý khách vui lòng liên hệ ${C.legalName} (thương hiệu ${C.tradeName}):`,
  },
  {
    type: "list" as const,
    items: [
      `Địa chỉ trụ sở / showroom: ${C.address}`,
      `Hotline / Zalo: ${C.phone}`,
      `Liên kết Zalo: ${C.zaloUrl}`,
      `Email: ${C.email}`,
      `Website: ${C.website}`,
      `Giờ làm việc: ${C.workingHours}`,
    ],
  },
];

/** Bộ chính sách mua hàng – phiên bản mở rộng phục vụ hồ sơ thông báo website TMĐT */
export const POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    slug: "chu-quan-tmdt",
    title: "Thông tin chủ quản nền tảng thương mại điện tử",
    shortTitle: "Thông tin chủ quản TMĐT",
    description:
      "Công khai đầy đủ thông tin đơn vị chủ quản vận hành website bán hàng trực tuyến theo quy định pháp luật về thương mại điện tử.",
    sections: [
      {
        type: "paragraph",
        text: `Tuân thủ các quy định pháp luật hiện hành về quản lý hoạt động thương mại điện tử, ${C.legalName} công khai minh bạch thông tin về chủ quản vận hành website bán hàng trực tuyến ${C.website} như sau.`,
      },
      {
        type: "paragraph",
        text: `Mọi hoạt động giao dịch thương mại, tư vấn sản phẩm, xác nhận đơn hàng và cung cấp dịch vụ liên quan đến ${C.productCategories} trên website đều do ${C.legalName} chịu trách nhiệm trực tiếp theo pháp luật Việt Nam.`,
      },
      {
        type: "heading",
        text: "1. Thông tin đơn vị chủ quản và người đại diện",
      },
      {
        type: "list",
        items: [
          `Tên đơn vị chủ quản: ${C.legalName}`,
          `Tên công ty viết bằng tiếng nước ngoài: ${C.englishName}`,
          `Tên công ty viết tắt: ${C.abbreviatedName}`,
          `Tên thương hiệu vận hành: ${C.tradeName}`,
          `Địa chỉ trụ sở chính: ${C.address}`,
          `${C.representativeTitle}: ${C.representative}`,
        ],
      },
      {
        type: "heading",
        text: "2. Thông tin đăng ký pháp lý và cơ quan quản lý",
      },
      {
        type: "list",
        items: [
          `Mã số doanh nghiệp / Mã số thuế: ${C.taxCode}`,
          `Ngày cấp Giấy chứng nhận đăng ký doanh nghiệp: ${C.registrationDate}`,
          `Cơ quan cấp: ${C.registrationAuthority}`,
          `Cơ quan thuế quản lý trực tiếp: ${C.taxAuthority}`,
          `Loại hình website: ${C.ecommerceType}`,
          `Ngành hàng / dịch vụ kinh doanh trên website: ${C.mainBusinessLine}`,
          `Số thông báo website thương mại điện tử: ${C.moitNotificationNumber}`,
        ],
      },
      {
        type: "heading",
        text: "3. Phạm vi hoạt động trên website",
      },
      {
        type: "list",
        items: [
          `Giới thiệu, tư vấn và bán các sản phẩm thuộc danh mục: ${C.productCategories}.`,
          "Cung cấp dịch vụ tư vấn giải pháp, khảo sát và lắp đặt (khi khách hàng yêu cầu và hai bên thỏa thuận).",
          "Công bố công khai các chính sách mua hàng, quy chế hoạt động và thông tin pháp lý của doanh nghiệp.",
          "Website không phải sàn giao dịch thương mại điện tử; không cho phép thương nhân khác mở gian hàng trên hệ thống.",
        ],
      },
      {
        type: "heading",
        text: "4. Cam kết pháp lý",
      },
      {
        type: "paragraph",
        text: `${C.legalName} cam kết chịu trách nhiệm về tính chính xác của thông tin đăng tải, chất lượng hàng hóa trong phạm vi cam kết, việc bảo mật thông tin khách hàng và việc giải quyết khiếu nại theo các chính sách đã công bố trên website.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "quyen-va-nghia-vu",
    title: "Quyền và nghĩa vụ các bên",
    shortTitle: "Quyền và nghĩa vụ các bên",
    description:
      "Quy định chi tiết quyền và nghĩa vụ giữa chủ quản website và khách hàng khi tham gia giao dịch trên TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `Để xây dựng không gian giao thương minh bạch, an toàn và tuân thủ đầy đủ quy định pháp luật về thương mại điện tử, ${C.tradeName} công khai quy định về quyền và nghĩa vụ giữa hai bên: Chủ quản website (${C.legalName}) và Quý khách hàng (Người mua) khi tham gia giao dịch trên website ${C.website}.`,
      },
      {
        type: "paragraph",
        text: "Việc hiểu rõ quyền lợi và tuân thủ nghĩa vụ giữa các bên là cơ sở quan trọng nhằm bảo vệ quyền lợi người tiêu dùng, đồng thời bảo đảm trải nghiệm mua sắm và sử dụng sản phẩm an tâm.",
      },
      { type: "heading", text: "I. Quyền và nghĩa vụ của chủ quản website" },
      {
        type: "heading",
        text: "1. Quyền của chủ quản website",
      },
      {
        type: "list",
        items: [
          "Quy định, sửa đổi và công bố các điều kiện hoạt động, điều kiện giao dịch, chính sách giá, vận chuyển, đổi trả, bảo hành và bảo mật trên website.",
          "Từ chối hoặc tạm hoãn đơn hàng khi hết hàng, thông tin khách hàng không chính xác, có dấu hiệu gian lận hoặc vi phạm quy chế đã công bố.",
          "Yêu cầu khách hàng cung cấp thông tin cần thiết để xác nhận đơn hàng, giao nhận và xuất hóa đơn theo quy định.",
          "Thu các khoản phí dịch vụ hợp lý đã được thông báo trước (phí vận chuyển, lắp đặt, đóng gói đặc biệt…) theo chính sách về giá.",
        ],
      },
      {
        type: "heading",
        text: "2. Nghĩa vụ của chủ quản website",
      },
      {
        type: "list",
        items: [
          "Ban hành, công khai và tổ chức thực hiện nghiêm túc các điều kiện giao dịch và chính sách mua hàng trên website.",
          "Cung cấp thông tin trung thực về sản phẩm (mô tả, thông số, giá tham khảo, tình trạng hàng) và cập nhật khi có thay đổi.",
          "Cung cấp thông tin đầy đủ hoặc tóm tắt rõ ràng về khuyến mại, quà tặng đi kèm (nếu có) trước khi khách hàng xác nhận đơn.",
          "Bảo đảm hệ thống kỹ thuật vận hành ổn định trong điều kiện bình thường; thông báo sớm khi bảo trì hoặc sự cố.",
          "Áp dụng biện pháp kỹ thuật cần thiết để bảo vệ thông tin cá nhân khách hàng và bí mật kinh doanh.",
          "Tiếp nhận, xử lý kịp thời yêu cầu, phản ánh, khiếu nại trên tinh thần thương lượng, hòa giải.",
          "Phối hợp cung cấp thông tin, dữ liệu giao dịch theo yêu cầu bằng văn bản của cơ quan nhà nước có thẩm quyền.",
          "Không đăng tải hàng hóa, dịch vụ thuộc danh mục cấm kinh doanh theo pháp luật.",
        ],
      },
      { type: "heading", text: "II. Quyền và nghĩa vụ của người mua" },
      {
        type: "heading",
        text: "1. Quyền của người mua",
      },
      {
        type: "list",
        items: [
          "Được bảo đảm các quyền lợi hợp pháp của người tiêu dùng theo pháp luật Việt Nam.",
          "Được cung cấp thông tin chi tiết, chính xác về sản phẩm, giá cả, điều kiện giao dịch và thông tin pháp lý của người bán.",
          `Được tự do lựa chọn hàng hóa, phương thức thanh toán và hình thức giao nhận trong phạm vi ${C.tradeName} hỗ trợ.`,
          "Được bảo vệ dữ liệu cá nhân theo Chính sách bảo mật thông tin.",
          "Được yêu cầu giải quyết phản ánh, khiếu nại theo Cơ chế tiếp nhận và giải quyết khiếu nại đã công bố.",
          "Được đồng kiểm hàng hóa khi nhận và từ chối nhận nếu hàng không đúng thỏa thuận hoặc bị hư hỏng rõ ràng do vận chuyển.",
        ],
      },
      {
        type: "heading",
        text: "2. Nghĩa vụ của người mua",
      },
      {
        type: "list",
        items: [
          "Cung cấp đầy đủ, chính xác họ tên, số điện thoại, địa chỉ và các thông tin cần thiết để thiết lập đơn hàng, giao nhận và xuất hóa đơn.",
          "Thanh toán đầy đủ, đúng hạn giá trị đơn hàng theo phương thức đã thỏa thuận.",
          "Kiểm tra hàng hóa khi nhận; lưu giữ hóa đơn, phiếu bảo hành và chứng từ liên quan.",
          "Sử dụng, lắp đặt sản phẩm đúng hướng dẫn; không tự ý can thiệp kỹ thuật làm mất quyền bảo hành (trừ khi được hướng dẫn).",
          "Tuân thủ pháp luật, điều kiện hoạt động và quy chế giao dịch đã công bố; không lợi dụng website để gian lận hoặc vi phạm pháp luật.",
        ],
      },
      {
        type: "heading",
        text: "III. Nguyên tắc giải quyết mâu thuẫn",
      },
      {
        type: "paragraph",
        text: "Khi phát sinh mâu thuẫn về quyền và nghĩa vụ, hai bên ưu tiên thương lượng trên tinh thần hợp tác. Nếu không đạt thỏa thuận, áp dụng Cơ chế tiếp nhận và giải quyết khiếu nại hoặc yêu cầu cơ quan nhà nước có thẩm quyền giải quyết theo pháp luật Việt Nam.",
      },
      ...contactBlock,
    ],
  },
  {
    slug: "dieu-kien-han-che",
    title: "Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ",
    shortTitle: "Điều kiện / hạn chế cung cấp",
    description:
      "Các điều kiện, giới hạn và hạn chế khi cung cấp hàng hóa, dịch vụ trên website TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `${C.tradeName} công bố các điều kiện và hạn chế áp dụng khi cung cấp sản phẩm ${C.productCategories.toLowerCase()} trên website ${C.website}.`,
      },
      { type: "heading", text: "a) Thời gian cung cấp" },
      {
        type: "list",
        items: [
          `Website tiếp nhận tư vấn / đặt hàng 24/7; xử lý đơn trong giờ làm việc: ${C.workingHours}.`,
          "Khảo sát / lắp đặt theo lịch hẹn đã xác nhận.",
          `Lễ, Tết hoặc bảo trì hệ thống: ${C.tradeName} thông báo trước trên website tối thiểu 03 ngày (trừ bất khả kháng).`,
        ],
      },
      { type: "heading", text: "b) Phạm vi địa lý" },
      {
        type: "list",
        items: [
          `${C.deliveryScope}`,
          "Ngoài khu vực giao hàng: nhận tại showroom hoặc thỏa thuận phương án khác.",
        ],
      },
      { type: "heading", text: "c) Đối tượng khách hàng" },
      {
        type: "list",
        items: [
          "Người giao dịch từ đủ 18 tuổi trở lên (15–dưới 18 tuổi cần sự đồng ý của người đại diện hợp pháp).",
          "Khóa điện tử / két sắt: cần cung cấp thông tin công trình chính xác để tư vấn lắp đặt an toàn.",
        ],
      },
      { type: "heading", text: "d) Số lượng giao dịch" },
      {
        type: "list",
        items: [
          "Không bắt buộc số lượng tối thiểu đối với đơn lẻ.",
          `Hàng số lượng hạn chế hoặc đặt riêng: ${C.tradeName} có quyền giới hạn số lượng mua và thông báo trước khi xác nhận đơn.`,
        ],
      },
      { type: "heading", text: "đ) Tính khả dụng của dịch vụ" },
      {
        type: "list",
        items: [
          "Có thể tạm gián đoạn khi bảo trì kỹ thuật, hết hàng hoặc sự kiện bất khả kháng.",
          `${C.tradeName} thông báo sớm nhất và thỏa thuận phương án: đợi hàng, đổi sản phẩm hoặc hoàn tiền theo chính sách.`,
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "chinh-sach-ve-gia",
    title: "Chính sách về giá và chi phí giao dịch",
    shortTitle: "Chính sách về giá",
    description:
      "Quy định chi tiết về giá bán, thuế, phí vận chuyển, lắp đặt và các chi phí phát sinh khi mua hàng tại TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `Nhằm bảo đảm tính minh bạch tối đa trong hoạt động thương mại điện tử và bảo vệ quyền lợi hợp pháp của người tiêu dùng, ${C.tradeName} công bố công khai chính sách quy định về giá, các khoản thuế và chi phí phát sinh khi mua sắm sản phẩm trên website ${C.website}.`,
      },
      {
        type: "paragraph",
        text: "Giá hàng hóa, dịch vụ trên website được thể hiện rõ. Các khoản thuế, phí vận chuyển, phí lắp đặt và chi phí phát sinh khác (nếu có) được thông báo trước khi khách hàng xác nhận đơn hàng.",
      },
      { type: "heading", text: "1. Cơ cấu giá sản phẩm" },
      {
        type: "list",
        items: [
          "Giá bán lẻ niêm yết: toàn bộ giá hiển thị tại danh mục sản phẩm là giá tham khảo áp dụng cho đơn hàng lẻ thông thường tại thời điểm hiển thị (mua tại showroom hoặc đặt qua kênh trực tuyến).",
          `Giá cuối cùng: được xác nhận khi ${C.tradeName} chốt đơn với khách hàng. Giá có thể thay đổi theo chương trình khuyến mại hoặc biến động từ nhà sản xuất / nhà cung cấp.`,
          "Thuế giá trị gia tăng (GTGT): giá niêm yết trên website đã bao gồm VAT. Việc xuất hóa đơn GTGT thực hiện theo quy định pháp luật. Khách hàng là tổ chức / doanh nghiệp cần hóa đơn vui lòng liên hệ trước khi thanh toán để được hướng dẫn.",
          "Phí vận chuyển: chưa bao gồm trong giá sản phẩm, trừ khi chương trình ghi rõ miễn phí. Phí được tính theo khu vực giao hàng (ưu tiên nội thành TP. Hồ Chí Minh), trọng lượng / kích thước kiện hàng; nhân viên sẽ báo chi tiết trước khi xuất kho.",
          "Phí lắp đặt (nếu có): tính riêng theo loại sản phẩm và điều kiện công trình; thông báo trước khi khách hàng xác nhận.",
        ],
      },
      { type: "heading", text: "2. Các chi phí phát sinh khác (nếu có)" },
      {
        type: "paragraph",
        text: `${C.tradeName} cam kết không tự ý thu thêm bất kỳ khoản phụ phí ẩn nào ngoài các chi phí đã được thông báo trước khi đặt hàng. Một số chi phí đặc thù có thể bao gồm:`,
      },
      {
        type: "list",
        items: [
          "Phí đóng gói đặc biệt / làm quà tặng theo yêu cầu: tính thêm theo vật liệu và nhân công thực tế.",
          "Phí lưu kho tại bưu cục do khách hàng hẹn lùi nhận hàng quá thời hạn của đơn vị vận chuyển: do khách hàng chi trả (nếu phát sinh).",
          "Phí cầu đường, phí vào khu vực hạn chế, phí đỗ xe hoặc phí khuân vác lên tầng cao bằng thang bộ đối với kiện hàng cồng kềnh: theo thực tế và thỏa thuận với đơn vị giao hàng / đội lắp đặt.",
        ],
      },
      { type: "heading", text: "3. Chính sách chiết khấu doanh nghiệp và đại lý" },
      {
        type: "paragraph",
        text: "Đối với đơn hàng công trình, quà tặng doanh nghiệp số lượng lớn hoặc đối tác đăng ký làm đại lý, hệ thống áp dụng mức chiết khấu thương mại theo thỏa thuận. Chính sách giá sỉ / giá đại lý được gửi bằng văn bản báo giá hoặc hợp đồng, nhằm bảo đảm cạnh tranh lành mạnh trên thị trường.",
      },
      { type: "heading", text: "4. Thay đổi giá sau khi xác nhận đơn" },
      {
        type: "list",
        items: [
          `Sau khi hai bên đã xác nhận đơn và giá trị thanh toán, ${C.tradeName} không tự ý tăng giá đối với đúng sản phẩm đã chốt (trừ khi khách hàng thay đổi model / thông số).`,
          `Nếu nhà cung cấp điều chỉnh giá trước khi xác nhận đơn, ${C.tradeName} thông báo lại để khách hàng quyết định tiếp tục, đổi sản phẩm hoặc hủy đơn.`,
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "thanh-toan",
    title: "Chính sách thanh toán và hoàn tiền",
    shortTitle: "Chính sách thanh toán",
    description:
      "Các phương thức thanh toán, quy trình hoàn tiền, hóa đơn chứng từ và cam kết bảo mật giao dịch tại TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `Để bảo đảm sự minh bạch, an toàn và tối ưu quyền lợi khách hàng khi giao dịch trên website thương mại điện tử, ${C.tradeName} công khai chính sách thanh toán và quy trình hoàn tiền như sau.`,
      },
      {
        type: "paragraph",
        text: `Cam kết bảo mật: ${C.tradeName} không thu thập, lưu trữ mật khẩu ngân hàng, mã OTP hay dữ liệu thẻ đầy đủ của khách hàng dưới bất kỳ hình thức nào. Thông tin chuyển khoản chỉ được cung cấp qua kênh chính thức khi xác nhận đơn.`,
      },
      { type: "heading", text: "a. Các phương thức thanh toán áp dụng" },
      {
        type: "list",
        items: [
          `Thanh toán tiền mặt tại showroom: áp dụng khi mua sắm / nhận hàng trực tiếp tại ${C.address}. Khách hàng thanh toán và nhận hóa đơn / chứng từ sau khi hoàn tất chọn sản phẩm.`,
          `Chuyển khoản ngân hàng: theo thông tin tài khoản do ${C.tradeName} cung cấp khi xác nhận đơn. Nội dung chuyển khoản khuyến nghị: [Mã đơn hàng] – [Số điện thoại] để đối soát nhanh.`,
          `Thẻ / mã QR / cổng thanh toán điện tử: áp dụng khi ${C.tradeName} hỗ trợ tại thời điểm giao dịch. Hiện nay các phương thức chính là tiền mặt tại showroom và chuyển khoản ngân hàng.`,
          `${C.tradeName} không áp dụng hình thức thanh toán khi nhận hàng (COD).`,
          `${C.tradeName} không áp dụng chính sách đặt cọc tỷ lệ cố định; khách hàng thanh toán theo thỏa thuận khi xác nhận đơn.`,
        ],
      },
      {
        type: "heading",
        text: "b. Thời điểm đơn hàng được xử lý",
      },
      {
        type: "list",
        items: [
          `Đơn hàng được đưa vào quy trình xuất kho / giao vận hoặc giữ hàng tại showroom sau khi ${C.tradeName} xác nhận và nhận đủ thanh toán theo thỏa thuận.`,
          "Đối với chuyển khoản: khách hàng vui lòng gửi biên lai / ảnh chuyển khoản qua Hotline hoặc Zalo để đối soát.",
        ],
      },
      {
        type: "heading",
        text: "c. Phương thức hoàn tiền khi đổi trả hoặc chấm dứt dịch vụ",
      },
      {
        type: "list",
        items: [
          "Phương thức hoàn: ưu tiên chuyển khoản vào tài khoản ngân hàng do khách hàng chỉ định trong yêu cầu hoàn tiền / biên bản tất toán.",
          "Hoàn tiền mặt tại showroom: trong vòng 24 giờ sau khi đủ điều kiện hoàn.",
          "Hoàn qua chuyển khoản: từ 03 đến 07 ngày làm việc (không tính Thứ Bảy, Chủ Nhật và ngày nghỉ lễ theo quy định).",
          "Giá trị hoàn = số tiền khách hàng đã thanh toán thực tế, trừ các chi phí hợp lý đã thỏa thuận (phí vận chuyển đã sử dụng, phí dịch vụ đã thực hiện…), theo Chính sách đổi trả hàng và hoàn tiền.",
        ],
      },
      { type: "heading", text: "d. Hóa đơn và chứng từ" },
      {
        type: "list",
        items: [
          `Khách hàng cần xuất hóa đơn GTGT vui lòng cung cấp: tên đơn vị, mã số thuế, địa chỉ, email nhận hóa đơn trước khi ${C.tradeName} xuất hóa đơn.`,
          "Phiếu bảo hành, hướng dẫn sử dụng và chứng từ giao nhận được cung cấp theo quy định nhà sản xuất và từng đơn hàng.",
          "Khách hàng nên lưu giữ hóa đơn / chứng từ để đối chiếu khi bảo hành, đổi trả hoặc khiếu nại.",
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "giao-hang",
    title: "Chính sách vận chuyển, giao hàng và nhận hàng",
    shortTitle: "Chính sách giao hàng",
    description:
      "Phương thức giao hàng, thời gian ước tính, đóng gói, đồng kiểm và phân định trách nhiệm các bên khi giao nhận.",
    sections: [
      {
        type: "paragraph",
        text: `Để bảo đảm quá trình vận chuyển sản phẩm ${C.productCategories.toLowerCase()} diễn ra thông suốt, an toàn và đúng quy định pháp luật thương mại điện tử, ${C.tradeName} công khai chính sách giao hàng chi tiết như sau.`,
      },
      {
        type: "paragraph",
        text: "Quy cách đóng gói: hàng hóa được kiểm tra trước khi xuất kho, đóng gói chống sốc phù hợp từng loại sản phẩm (thiết bị bếp, khóa điện tử, két sắt…), dán tem cảnh báo hàng dễ vỡ / hàng nặng khi cần thiết, rồi bàn giao cho đơn vị vận chuyển hoặc đội giao hàng nội bộ.",
      },
      { type: "heading", text: "I. Mục đích và phạm vi áp dụng" },
      {
        type: "list",
        items: [
          `Đối tượng áp dụng: mọi khách hàng đặt mua sản phẩm trên website ${C.website} hoặc qua các kênh chính thức của ${C.tradeName}.`,
          `Sản phẩm áp dụng: ${C.productCategories}.`,
          `Khu vực áp dụng: ${C.deliveryScope}`,
        ],
      },
      { type: "heading", text: "II. Phương thức giao hàng và đơn vị vận chuyển" },
      {
        type: "list",
        items: [
          "Nhận hàng trực tiếp tại showroom (khuyến nghị): khách hàng đến nhận tại địa chỉ trụ sở sau khi đơn được xác nhận và thanh toán.",
          "Giao hàng nội bộ / lắp đặt tận nơi trong phạm vi nội thành TP. Hồ Chí Minh (theo thỏa thuận và loại sản phẩm).",
          "Giao hàng qua đối tác vận chuyển trong khu vực được hỗ trợ (nếu áp dụng): GHTK, Viettel Post, GHN, VNPost hoặc đơn vị tương đương.",
          `${C.tradeName} không áp dụng giao hàng thu tiền hộ (COD).`,
          "Phương thức cụ thể được thống nhất khi xác nhận đơn hàng.",
        ],
      },
      { type: "heading", text: "III. Thời hạn ước tính giao hàng" },
      {
        type: "list",
        items: [
          "Nhận tại showroom: theo lịch hẹn sau khi xác nhận đơn và hoàn tất thanh toán.",
          "Giao nội thành Thành phố Hồ Chí Minh: từ 01 đến 03 ngày làm việc sau khi xác nhận đơn và thanh toán đủ theo thỏa thuận.",
          "Sản phẩm cồng kềnh hoặc cần lắp đặt: thời gian bàn giao thỏa thuận riêng.",
          "Không tính ngày nghỉ lễ và trường hợp bất khả kháng (thiên tai, dịch bệnh, cấm đường…). Nhân viên liên hệ trước khi giao trong giờ làm việc.",
        ],
      },
      { type: "heading", text: "IV. Giới hạn địa lý" },
      {
        type: "list",
        items: [
          `${C.tradeName} không giao hàng toàn quốc.`,
          "Ưu tiên giao / lắp đặt trong nội thành TP. Hồ Chí Minh; ngoài khu vực này khách hàng nhận hàng tại showroom hoặc thỏa thuận phương án khác.",
          `${C.tradeName} có quyền từ chối giao trực tiếp tới địa chỉ không rõ ràng, nguy hiểm hoặc không thể tiếp cận an toàn; khi đó sẽ thỏa thuận nhận tại showroom hoặc phương án thay thế.`,
        ],
      },
      {
        type: "heading",
        text: "V. Phân định trách nhiệm về chứng từ và logistics",
      },
      {
        type: "heading",
        text: "1. Trách nhiệm của TA HOUSE (bên gửi hàng)",
      },
      {
        type: "list",
        items: [
          "Cung cấp đầy đủ, chính xác thông tin sản phẩm: tên hàng, model, số lượng, kích thước / trọng lượng ước tính khi cần.",
          "Cung cấp chứng từ hợp pháp kèm theo (hóa đơn bán hàng, phiếu xuất kho, bảng kê hoặc chứng từ liên quan khác khi có yêu cầu).",
          "Đóng gói đúng quy cách kỹ thuật, bảo đảm hàng hóa an toàn trước khi bàn giao vận chuyển.",
        ],
      },
      {
        type: "heading",
        text: "2. Trách nhiệm của đơn vị vận chuyển",
      },
      {
        type: "list",
        items: [
          "Tiếp nhận và kiểm tra thông tin, chứng từ đi kèm kiện hàng trước khi vận chuyển.",
          "Bảo quản kiện hàng, cung cấp mã vận đơn (tracking) để khách hàng theo dõi lộ trình.",
          "Thông báo lịch phát hàng, thông tin nhân viên giao hàng và chứng từ giao nhận khi bàn giao.",
          "Chịu trách nhiệm theo hợp đồng vận chuyển đối với thất lạc, hư hỏng do lỗi bốc xếp / vận chuyển.",
        ],
      },
      {
        type: "heading",
        text: "3. Trách nhiệm và quyền lợi của khách hàng (người nhận)",
      },
      {
        type: "list",
        items: [
          "Cung cấp chính xác họ tên, số điện thoại, địa chỉ nhận hàng.",
          "Thực hiện đồng kiểm: kiểm tra tình trạng bên ngoài, số lượng, model trước khi ký nhận hàng.",
          "Khuyến nghị quay video liên tục, rõ nét khi mở hộp – đây là bằng chứng quan trọng để hỗ trợ khiếu nại nếu hàng hư hỏng do vận chuyển.",
          `Phát hiện móp méo, thiếu hàng, sai model: từ chối nhận hoặc ghi chú biên bản và báo Hotline ${C.phone} trong vòng 24 giờ.`,
          "Lưu giữ hóa đơn / chứng từ kèm kiện hàng để đối chiếu bảo hành, đổi trả sau này.",
        ],
      },
      { type: "heading", text: "VI. Phí giao hàng và trường hợp đặc thù" },
      {
        type: "list",
        items: [
          "Phí vận chuyển được báo trước khi xác nhận đơn. Một số chương trình miễn phí vận chuyển nội thành theo điều kiện từng thời điểm.",
          "Chi phí cầu đường, khuân vác tầng cao bằng thang bộ với kiện nặng: khách hàng thỏa thuận chi trả với đơn vị giao hàng / đội lắp đặt khi phát sinh.",
          "Hàng đã giao đúng địa chỉ mà khách hàng đổi ý trả lại không do lỗi sản phẩm: khách hàng chịu 100% phí vận chuyển theo biểu giá bưu cục.",
          `Chậm giao do lỗi ${C.tradeName}: thông báo và thỏa thuận phương án phù hợp. Chậm giao do thiên tai, tắc đường hoặc sai địa chỉ do khách cung cấp: không thuộc trách nhiệm bồi thường của ${C.tradeName}.`,
        ],
      },
      { type: "heading", text: "VII. Trách nhiệm bồi thường thiệt hại" },
      {
        type: "list",
        items: [
          `Lỗi do bên gửi hàng (${C.tradeName}): nếu hàng hư hỏng do đóng gói không đúng quy cách, ${C.tradeName} chịu trách nhiệm đổi sản phẩm tương đương và chịu chi phí vận chuyển phát sinh liên quan.`,
          `Lỗi do đơn vị vận chuyển: ${C.tradeName} phối hợp với khách hàng (dựa trên biên bản / video mở hộp) làm việc với bưu cục yêu cầu bồi thường và hỗ trợ gửi kiện thay thế theo thỏa thuận.`,
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "doi-tra-hoan-tien",
    title: "Chính sách đổi trả hàng và hoàn tiền",
    shortTitle: "Đổi trả và hoàn tiền",
    description:
      "Điều kiện, thời hạn, quy trình đổi trả và hoàn tiền sản phẩm chi tiết tại TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `${C.tradeName} hỗ trợ đổi trả và hoàn tiền khi sản phẩm hoặc giao dịch đáp ứng điều kiện dưới đây, nhằm bảo vệ quyền lợi hợp pháp của khách hàng và bảo đảm trải nghiệm mua sắm công bằng, minh bạch.`,
      },
      {
        type: "paragraph",
        text: "Chính sách này áp dụng cho hàng hóa mua trên website và các kênh bán hàng chính thức của doanh nghiệp. Hàng mua tại đại lý / bên thứ ba không thuộc hệ thống phân phối chính thức có thể không được áp dụng (trừ khi có thỏa thuận khác).",
      },
      { type: "heading", text: "1. Điều kiện được đổi, trả hoặc hoàn tiền" },
      {
        type: "list",
        items: [
          "Sản phẩm giao sai model, sai số lượng, lỗi từ nhà sản xuất hoặc hư hỏng do vận chuyển (có bằng chứng: biên bản, hình ảnh, video).",
          "Sản phẩm chưa qua sử dụng / chưa lắp đặt (trừ lỗi kỹ thuật thuộc phạm vi bảo hành), còn nguyên tem, nhãn, phụ kiện, hộp đựng và phiếu bảo hành (nếu có).",
          "Khách hàng thông báo trong vòng 07 ngày kể từ ngày nhận hàng (trừ lỗi bảo hành theo thời hạn riêng trên phiếu bảo hành).",
          `Có hóa đơn, chứng từ mua hàng hoặc thông tin đơn hàng xác thực được với hệ thống của ${C.tradeName}.`,
        ],
      },
      { type: "heading", text: "2. Trường hợp không áp dụng đổi trả / hoàn tiền" },
      {
        type: "list",
        items: [
          "Sản phẩm đã lắp đặt, đã sử dụng, bị can thiệp kỹ thuật, trầy xước, biến dạng hoặc hư hỏng do người dùng.",
          "Hàng đặt theo yêu cầu riêng / cá nhân hóa (màu, kích thước, cấu hình đặc biệt) đã được khách hàng xác nhận thông số.",
          "Hết thời hạn khiếu nại theo quy định hoặc không cung cấp được chứng từ / bằng chứng cần thiết.",
          "Sản phẩm không còn đủ điều kiện vệ sinh / an toàn để bán lại do lỗi bảo quản từ phía khách hàng.",
        ],
      },
      { type: "heading", text: "3. Quy trình đổi trả" },
      {
        type: "list",
        ordered: true,
        items: [
          `Bước 1 – Liên hệ: gọi Hotline ${C.phone} hoặc gửi Email ${C.email}; cung cấp mã đơn hàng, mô tả vấn đề, hình ảnh / video sản phẩm.`,
          `Bước 2 – Tiếp nhận: ${C.tradeName} phản hồi sơ bộ trong 24–48 giờ làm việc và hướng dẫn gửi trả hoặc mang đến showroom.`,
          `Bước 3 – Kiểm tra: kiểm tra hàng trả trong 03–05 ngày làm việc kể từ khi nhận đủ hàng và chứng từ.`,
          "Bước 4 – Kết luận: thông báo kết quả và thực hiện đổi hàng, sửa chữa bảo hành hoặc hoàn tiền theo thỏa thuận.",
        ],
      },
      { type: "heading", text: "4. Hoàn tiền và đổi sản phẩm" },
      {
        type: "list",
        items: [
          "Hoàn tiền qua chuyển khoản trong 03–07 ngày làm việc sau khi nhận và kiểm tra hàng trả đủ điều kiện.",
          "Hoàn tiền mặt tại showroom: trong vòng 24 giờ sau khi đủ điều kiện.",
          `Phí vận chuyển hoàn trả do lỗi ${C.tradeName} / nhà sản xuất: do ${C.tradeName} chịu. Do khách hàng đổi ý (nếu được chấp nhận): do khách hàng chịu.`,
          "Đổi model, màu sắc hoặc phiên bản (nếu còn hàng): bù hoặc trừ phần chênh lệch giá (nếu có) trước khi giao hàng thay thế.",
          `Trường hợp đổi do giao nhầm: ${C.tradeName} chịu chi phí vận chuyển liên quan.`,
        ],
      },
      { type: "heading", text: "5. Lưu ý quan trọng" },
      {
        type: "list",
        items: [
          "Khách hàng vui lòng không tự ý tháo mở, lắp đặt khi chưa đồng kiểm và xác nhận hàng đúng thỏa thuận.",
          "Đối với thiết bị đã lắp đặt mới phát hiện lỗi kỹ thuật: áp dụng Chính sách bảo hành thay vì đổi trả hàng mới (trừ trường hợp lỗi thuộc trách nhiệm giao nhầm / hàng lỗi ngay khi bàn giao).",
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "bao-mat",
    title: "Chính sách bảo mật thông tin khách hàng",
    shortTitle: "Chính sách bảo mật",
    description:
      "Cam kết thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ thông tin cá nhân khách hàng trên website TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `Chào mừng Quý khách đến với website ${C.website}. ${C.legalName} hiểu rằng sự riêng tư và bảo mật dữ liệu cá nhân là điều quan trọng. Chúng tôi cam kết bảo vệ thông tin cá nhân của Quý khách bằng sự minh bạch, trách nhiệm và các biện pháp kỹ thuật phù hợp theo Luật Bảo vệ dữ liệu cá nhân và quy định pháp luật hiện hành.`,
      },
      { type: "heading", text: "1. Mục đích thu thập thông tin cá nhân" },
      {
        type: "list",
        items: [
          "Hỗ trợ xử lý đơn hàng, quản lý đóng gói, liên hệ thông báo phí vận chuyển / lắp đặt và giao nhận sản phẩm.",
          "Nâng cao chất lượng dịch vụ tư vấn, giải đáp thắc mắc về sản phẩm thiết bị bếp, khóa điện tử, két sắt thông minh…",
          "Chăm sóc khách hàng: gửi thông báo chương trình ưu đãi, thông tin sản phẩm mới (chỉ khi khách hàng đồng ý).",
          "Thực hiện nghĩa vụ pháp lý khi có yêu cầu của cơ quan nhà nước có thẩm quyền.",
          "Phân tích kỹ thuật nhằm cải thiện trải nghiệm website (dữ liệu tổng hợp, không nhằm nhận diện cá nhân hóa trái phép).",
        ],
      },
      { type: "heading", text: "2. Phạm vi thu thập thông tin" },
      {
        type: "list",
        items: [
          "Họ và tên, số điện thoại, địa chỉ email, địa chỉ giao hàng / lắp đặt.",
          "Thông tin đơn hàng, lịch sử tư vấn, phản hồi qua chat, Hotline hoặc email.",
          "Thông tin xuất hóa đơn (nếu khách hàng yêu cầu): tên đơn vị, mã số thuế, địa chỉ.",
          "Dữ liệu kỹ thuật: địa chỉ IP, cookie, loại trình duyệt, thời gian truy cập (phục vụ vận hành và bảo mật hệ thống).",
        ],
      },
      { type: "heading", text: "3. Cam kết bảo mật thông tin" },
      {
        type: "list",
        items: [
          "Tuyệt đối không bán, cho thuê, chuyển nhượng hoặc trao đổi thông tin cá nhân của khách hàng cho bên thứ ba vì mục đích thương mại trái phép.",
          "Áp dụng biện pháp kỹ thuật và kiểm soát truy cập phù hợp để hạn chế truy cập trái phép, mất mát hoặc rò rỉ dữ liệu.",
          "Chỉ cung cấp thông tin giao nhận cần thiết (họ tên, số điện thoại, địa chỉ) cho đối tác vận chuyển / lắp đặt để hoàn thành đơn hàng.",
          "Chỉ cung cấp thông tin khi có yêu cầu bằng văn bản của cơ quan nhà nước có thẩm quyền theo đúng quy định pháp luật.",
        ],
      },
      { type: "heading", text: "4. Thời gian lưu trữ thông tin" },
      {
        type: "paragraph",
        text: "Dữ liệu cá nhân được lưu trữ trong khoảng thời gian cần thiết để thực hiện các mục đích thu thập nêu trên, hoặc lâu hơn nếu pháp luật yêu cầu lưu giữ chứng từ kế toán, giao dịch, khiếu nại. Khi hết thời hạn, dữ liệu sẽ được xóa hoặc ẩn danh hóa theo quy trình nội bộ.",
      },
      { type: "heading", text: "5. Quyền của khách hàng đối với dữ liệu cá nhân" },
      {
        type: "list",
        items: [
          "Yêu cầu được biết, truy cập, chỉnh sửa thông tin cá nhân đang lưu trữ.",
          "Yêu cầu xóa hoặc hạn chế xử lý dữ liệu (trừ trường hợp pháp luật bắt buộc lưu giữ).",
          "Từ chối nhận thông tin khuyến mại bất cứ lúc nào bằng cách phản hồi email / tin nhắn hoặc liên hệ Hotline.",
          `Khiếu nại về việc xử lý dữ liệu cá nhân gửi về Email ${C.email} hoặc Hotline ${C.phone}.`,
        ],
      },
      { type: "heading", text: "6. Cookie và công nghệ tương tự" },
      {
        type: "paragraph",
        text: "Website có thể sử dụng cookie để ghi nhớ tùy chọn hiển thị, phân tích lưu lượng truy cập và cải thiện trải nghiệm. Khách hàng có thể tắt cookie trên trình duyệt; một số tính năng website có thể hoạt động không đầy đủ khi cookie bị vô hiệu hóa.",
      },
      ...contactBlock,
    ],
  },
  {
    slug: "khieu-nai",
    title: "Cơ chế tiếp nhận và giải quyết khiếu nại",
    shortTitle: "Giải quyết khiếu nại",
    description:
      "Quy trình 5 bước tiếp nhận, xác minh, đề xuất phương án và theo dõi khiếu nại, tranh chấp của khách hàng.",
    sections: [
      {
        type: "paragraph",
        text: `${C.tradeName} cam kết luôn tiếp nhận và xử lý mọi khiếu nại của khách hàng liên quan đến giao dịch, sản phẩm và dịch vụ được cung cấp trên hệ thống ${C.website}. Khi có tranh chấp phát sinh, chúng tôi ưu tiên hòa giải và thương lượng nhằm duy trì niềm tin, bảo đảm chất lượng dịch vụ và quyền lợi hợp pháp của Quý khách.`,
      },
      {
        type: "paragraph",
        text: "Mọi ý kiến phản hồi, khiếu nại đều được ghi nhận nghiêm túc để làm cơ sở cải tiến chất lượng sản phẩm, quy trình đóng gói – giao nhận – lắp đặt và dịch vụ chăm sóc khách hàng.",
      },
      { type: "heading", text: "Bước 1: Gửi thông tin phản ánh / khiếu nại" },
      {
        type: "paragraph",
        text: "Quý khách có thể gửi khiếu nại thông qua các kênh chính thức sau:",
      },
      {
        type: "list",
        items: [
          `Hotline / Zalo: ${C.phone}`,
          `Email: ${C.email}`,
          `Trực tiếp tại showroom: ${C.address}`,
          "Thông tin cần cung cấp: họ tên, số điện thoại, mã đơn hàng (nếu có), mô tả vấn đề chi tiết và bằng chứng (hóa đơn, biên lai vận chuyển, hình ảnh, video mở hộp).",
        ],
      },
      { type: "heading", text: "Bước 2: Tiếp nhận và phản hồi khiếu nại" },
      {
        type: "list",
        items: [
          "Bộ phận chăm sóc khách hàng tiếp nhận, ghi nhận dữ liệu vào hệ thống theo dõi.",
          "Phản hồi ban đầu trong 24–48 giờ làm việc kể từ khi nhận được khiếu nại đầy đủ thông tin.",
          "Thời gian giải quyết tối đa không quá 20 ngày làm việc, tùy mức độ phức tạp (thẩm định kỹ thuật, đối chiếu với nhà sản xuất hoặc đối tác vận chuyển có thể cần thêm thời gian; khách hàng sẽ được thông báo).",
        ],
      },
      { type: "heading", text: "Bước 3: Xác minh và làm rõ vụ việc" },
      {
        type: "list",
        items: [
          "Yêu cầu khách hàng bổ sung chứng từ nếu cần để bảo đảm xử lý khách quan.",
          "Đối chiếu nội bộ với bộ phận bán hàng, kho, kỹ thuật lắp đặt / bảo hành.",
          "Làm việc với bên thứ ba (đơn vị vận chuyển, nhà sản xuất) khi khiếu nại liên quan đến vận chuyển hoặc lỗi xuất xưởng.",
        ],
      },
      { type: "heading", text: "Bước 4: Đề xuất phương án giải quyết" },
      {
        type: "list",
        items: [
          "Thương lượng các giải pháp linh hoạt: đổi sản phẩm, sửa chữa bảo hành, hoàn tiền một phần / toàn phần, hỗ trợ kỹ thuật hoặc phương án khác theo thỏa thuận tự nguyện của hai bên.",
          `Trường hợp nghiêm trọng mà hai bên không đạt thỏa thuận: vụ việc được chuyển đến cơ quan nhà nước có thẩm quyền (cơ quan bảo vệ người tiêu dùng hoặc Tòa án) theo pháp luật Việt Nam. ${C.tradeName} cung cấp đầy đủ chứng từ để hỗ trợ làm rõ sự việc.`,
        ],
      },
      { type: "heading", text: "Bước 5: Theo dõi, đánh giá và cải tiến" },
      {
        type: "list",
        items: [
          "Sau khi thực hiện phương án xử lý, bộ phận chăm sóc khách hàng theo dõi để bảo đảm khách hàng nhận được kết quả như đã thỏa thuận.",
          "Nếu còn vấn đề phát sinh sau xử lý, khách hàng có thể liên hệ lại để được hỗ trợ tiếp.",
          `${C.tradeName} định kỳ rà soát quy trình khiếu nại, đóng gói và giao nhận nhằm rút kinh nghiệm và nâng cao chất lượng dịch vụ.`,
        ],
      },
      {
        type: "paragraph",
        text: `${C.tradeName} cam kết nỗ lực giải quyết khiếu nại một cách nhanh chóng, công bằng, minh bạch nhằm bảo đảm quyền lợi hợp pháp và sự an tâm của Quý khách hàng.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "phuong-thuc-cung-cap",
    title: "Chính sách về phương thức cung cấp dịch vụ",
    shortTitle: "Phương thức cung cấp dịch vụ",
    description:
      "Các hình thức cung cấp hàng hóa và dịch vụ của TA HOUSE trên website, tại showroom và tại công trình.",
    sections: [
      {
        type: "paragraph",
        text: `${C.tradeName} cung cấp hàng hóa và dịch vụ thông qua các phương thức dưới đây trên website ${C.website} và các kênh bán hàng chính thức của ${C.legalName}.`,
      },
      { type: "heading", text: "1. Bán hàng trực tuyến (qua website)" },
      {
        type: "list",
        ordered: true,
        items: [
          `Khách hàng truy cập website ${C.website}, xem danh mục sản phẩm (${C.productCategories}), giá bán tham khảo và thông số kỹ thuật.`,
          `Liên hệ tư vấn / đặt hàng qua Hotline ${C.phone}, Zalo (${C.zaloUrl}), chatbot trên website hoặc Email ${C.email}.`,
          `${C.tradeName} tư vấn, xác nhận tình trạng hàng, thỏa thuận phương thức thanh toán, thời gian giao hàng hoặc lắp đặt.`,
          "Khách hàng thanh toán theo thỏa thuận (tiền mặt tại showroom hoặc chuyển khoản ngân hàng). Không áp dụng COD và không áp dụng đặt cọc tỷ lệ cố định.",
          "Giao hàng trong khu vực được hỗ trợ hoặc bàn giao tại showroom; nghiệm thu, nhận chứng từ và phiếu bảo hành (nếu có).",
        ],
      },
      {
        type: "paragraph",
        text: `Lưu ý: website hiện hỗ trợ tư vấn và xác nhận đơn hàng; chưa áp dụng thanh toán tự động ngay trên giỏ hàng. Đơn hàng chỉ có hiệu lực sau khi được ${C.tradeName} xác nhận qua điện thoại, Zalo, email hoặc tin nhắn.`,
      },
      { type: "heading", text: "2. Bán hàng và nhận hàng tại showroom" },
      {
        type: "list",
        items: [
          `Địa điểm: ${C.address}`,
          `Giờ mở cửa: ${C.workingHours}`,
          "Khách hàng có thể xem thực tế sản phẩm, được tư vấn trực tiếp và thanh toán tại chỗ.",
          "Có thể đặt hàng qua kênh trực tuyến rồi nhận tại showroom; mang theo Căn cước công dân hoặc giấy tờ tùy thân hợp lệ khi nhận (người nhận thay cần có ủy quyền).",
          "Hàng được giữ tối đa 07 ngày kể từ khi thông báo sẵn sàng; quá hạn có thể hủy đơn theo thỏa thuận giữa hai bên.",
        ],
      },
      { type: "heading", text: "3. Dịch vụ tư vấn, khảo sát và lắp đặt tại công trình" },
      {
        type: "list",
        items: [
          "Tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp, khóa điện tử, két sắt thông minh… theo nhu cầu không gian thực tế.",
          "Khảo sát tận nơi (khi cần): lịch hẹn và phạm vi khảo sát được thống nhất trước.",
          "Lắp đặt / bàn giao kỹ thuật: phí dịch vụ và lịch thực hiện thông báo trước; khách hàng nghiệm thu sau khi hoàn tất.",
          "Cung cấp hướng dẫn sử dụng và phiếu bảo hành theo quy định nhà sản xuất.",
        ],
      },
      { type: "heading", text: "4. Phạm vi không cung cấp" },
      {
        type: "list",
        items: [
          "Không cung cấp hàng hóa, dịch vụ thuộc danh mục cấm kinh doanh theo pháp luật.",
          "Không phải sàn giao dịch thương mại điện tử; không cho phép bên thứ ba mở gian hàng trên website.",
          "Không cam kết cung cấp sản phẩm đã ngừng sản xuất / hết hàng nếu không thỏa thuận được phương án thay thế.",
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "cham-dut-dich-vu",
    title: "Chính sách chấm dứt dịch vụ và hoàn tiền",
    shortTitle: "Chấm dứt dịch vụ và hoàn tiền",
    description:
      "Quy định chi tiết về hủy đơn, chấm dứt giao dịch / dịch vụ và hoàn tiền liên quan tại TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `Chính sách này quy định các trường hợp khách hàng hoặc ${C.tradeName} chấm dứt giao dịch / dịch vụ đã thỏa thuận trên website ${C.website}, cùng cách thức hoàn tiền liên quan.`,
      },
      { type: "heading", text: "1. Khách hàng hủy đơn hoặc chấm dứt giao dịch" },
      {
        type: "list",
        items: [
          "Trước khi hàng xuất kho: khách hàng có thể hủy miễn phí; số tiền đã thanh toán được hoàn theo Chính sách thanh toán.",
          `Sau khi hàng đã giao vận: áp dụng Chính sách đổi trả hàng và hoàn tiền. Nếu hủy / trả không do lỗi của ${C.tradeName}, khách hàng có thể chịu phí vận chuyển hai chiều theo thực tế.`,
          `Hàng đặt theo yêu cầu riêng hoặc đã gia công / đặt hàng nhà máy theo thông số khách đã xác nhận: không hoàn tiền phần đã thực hiện, trừ khi lỗi thuộc về ${C.tradeName}.`,
          `Dịch vụ khảo sát / lắp đặt đã hoàn tất và nghiệm thu: không hoàn phí dịch vụ đã thực hiện, trừ khi có lỗi thuộc trách nhiệm của ${C.tradeName}.`,
        ],
      },
      {
        type: "heading",
        text: `2. ${C.tradeName} từ chối hoặc chấm dứt đơn hàng`,
      },
      {
        type: "list",
        items: [
          "Hết hàng và không có phương án thay thế được khách hàng chấp thuận.",
          "Thông tin khách hàng không chính xác, không liên hệ được sau nhiều lần trong thời gian hợp lý.",
          "Có dấu hiệu gian lận, lợi dụng khuyến mại hoặc vi phạm quy chế hoạt động.",
          "Không giao được hàng do địa chỉ thuộc khu vực hạn chế và hai bên không thỏa thuận được phương án thay thế.",
        ],
      },
      {
        type: "paragraph",
        text: `Trong các trường hợp tại mục 2, ${C.tradeName} thông báo cho khách hàng và hoàn số tiền đã nhận (trừ chi phí hợp lý đã thỏa thuận, nếu có) trong thời hạn từ 03 đến 07 ngày làm việc.`,
      },
      { type: "heading", text: "3. Chấm dứt dịch vụ bảo hành" },
      {
        type: "list",
        items: [
          "Bảo hành chấm dứt khi hết thời hạn ghi trên phiếu bảo hành / hóa đơn.",
          "Bảo hành không áp dụng đối với các trường hợp ngoài phạm vi (xem Chính sách bảo hành).",
          `Sau khi hết bảo hành, ${C.tradeName} có thể hỗ trợ sửa chữa tính phí theo báo giá từng trường hợp.`,
        ],
      },
      { type: "heading", text: "4. Cách thức hoàn tiền" },
      {
        type: "list",
        items: [
          "Ưu tiên chuyển khoản vào tài khoản ngân hàng do khách hàng chỉ định.",
          "Hoàn tiền mặt tại showroom khi giao dịch ban đầu bằng tiền mặt và hai bên thỏa thuận.",
          "Thời hạn và điều kiện chi tiết theo Chính sách thanh toán và Chính sách đổi trả hàng và hoàn tiền.",
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "bao-hanh",
    title: "Chính sách bảo hành sản phẩm",
    shortTitle: "Chính sách bảo hành",
      description:
      "Thời hạn, điều kiện, phạm vi loại trừ và quy trình bảo hành sản phẩm thiết bị bếp, khóa điện tử, két sắt thông minh…",
    sections: [
      {
        type: "paragraph",
        text: `${C.tradeName} thực hiện bảo hành sản phẩm theo chính sách bảo hành của từng sản phẩm / nhà sản xuất và nội dung ghi trên phiếu bảo hành hoặc hóa đơn bán hàng.`,
      },
      {
        type: "paragraph",
        text: "Thời hạn bảo hành không cố định cho toàn bộ danh mục; tùy từng model và chính sách sản phẩm. Thời hạn cụ thể được thông báo khi tư vấn / xác nhận đơn và in trên phiếu bảo hành giao kèm sản phẩm.",
      },
      { type: "heading", text: "1. Điều kiện được bảo hành" },
      {
        type: "list",
        items: [
          "Sản phẩm còn trong thời hạn bảo hành.",
          "Còn tem bảo hành, số serial / mã máy hợp lệ và trùng khớp với chứng từ mua hàng.",
          "Lỗi thuộc lỗi kỹ thuật từ nhà sản xuất, không do tác động bên ngoài hoặc sử dụng sai cách.",
          "Sản phẩm được lắp đặt đúng hướng dẫn của nhà sản xuất hoặc bởi kỹ thuật viên được chỉ định; không tự ý tháo mở, sửa chữa làm mất quyền bảo hành.",
        ],
      },
      { type: "heading", text: "2. Trường hợp không thuộc phạm vi bảo hành" },
      {
        type: "list",
        items: [
          "Hư hỏng do va đập, rơi vỡ, vào nước, ẩm thấp bất thường, sét đánh, hỏa hoạn, thiên tai.",
          "Hư hỏng do nguồn điện không ổn định, lắp đặt sai kỹ thuật, sử dụng sai công năng.",
          "Pin, ắc quy, gioăng cao su, phụ kiện tiêu hao theo thời gian sử dụng (trừ khi nhà sản xuất cam kết bảo hành riêng).",
          "Hết hạn bảo hành; mất tem / serial nên không xác định được nguồn gốc và thời điểm mua hàng.",
          "Sản phẩm đã bị can thiệp bởi đơn vị sửa chữa không được ủy quyền.",
        ],
      },
      { type: "heading", text: "3. Quyền lợi khi bảo hành" },
      {
        type: "list",
        items: [
          "Sửa chữa miễn phí linh kiện / công lỗi thuộc phạm vi bảo hành.",
          "Đổi mới hoặc hoàn trả theo chính sách nhà sản xuất nếu không sửa chữa được.",
          "Thời gian bảo hành có thể được gia hạn tương ứng với thời gian sửa chữa (theo quy định nhà sản xuất / thỏa thuận).",
        ],
      },
      { type: "heading", text: "4. Quy trình bảo hành" },
      {
        type: "list",
        ordered: true,
        items: [
          `Liên hệ Hotline ${C.phone} hoặc Email ${C.email}; mô tả lỗi, cung cấp model / serial và hình ảnh hoặc video.`,
          `${C.tradeName} hướng dẫn mang sản phẩm đến điểm tiếp nhận hoặc đăng ký dịch vụ kiểm tra / bảo hành tại nhà (nếu dịch vụ có hỗ trợ theo khu vực).`,
          "Thẩm định lỗi trong thời gian hợp lý; thông báo phương án sửa chữa, đổi mới hoặc từ chối bảo hành (kèm lý do).",
          "Thời gian xử lý thông thường từ 07 đến 15 ngày làm việc, tùy loại sản phẩm và tình trạng linh kiện thay thế.",
          "Bàn giao sản phẩm sau bảo hành; khách hàng kiểm tra và ký nhận.",
        ],
      },
      { type: "heading", text: "5. Bảo hành tại nhà và chi phí phát sinh" },
      {
        type: "list",
        items: [
          "Một số sản phẩm / khu vực được hỗ trợ bảo hành tại nhà theo lịch hẹn.",
          "Chi phí đi lại ngoài phạm vi hỗ trợ miễn phí (nếu có) được thông báo trước khi cử kỹ thuật viên.",
          "Lỗi ngoài bảo hành: báo giá sửa chữa trước khi thực hiện; chỉ sửa khi khách hàng đồng ý.",
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "quy-che-hoat-dong",
    title: "Quy chế hoạt động website thương mại điện tử",
    shortTitle: "Quy chế hoạt động TMĐT",
    description:
      "Quy chế tổng hợp nguyên tắc hoạt động, quy trình giao dịch và trách nhiệm các bên trên website TA HOUSE.",
    sections: [
      {
        type: "paragraph",
        text: `Quy chế này được ban hành nhằm quy định nguyên tắc, quy trình giao dịch và trách nhiệm các bên khi tham gia mua bán hàng hóa trên website ${C.website} do ${C.legalName} (sau đây gọi là "${C.tradeName}") vận hành.`,
      },
      {
        type: "paragraph",
        text: `Website ${C.website} là website bán hàng trực tuyến của thương nhân, không phải sàn giao dịch thương mại điện tử. ${C.tradeName} trực tiếp giới thiệu, tư vấn và bán các sản phẩm thuộc danh mục: ${C.productCategories}.`,
      },
      {
        type: "heading",
        text: "I. Thông tin chủ quản website",
      },
      {
        type: "paragraph",
        text: `Chi tiết pháp lý của đơn vị chủ quản được công bố tại trang Thông tin chủ quản nền tảng thương mại điện tử. Tóm tắt: ${C.legalName}; MST ${C.taxCode}; địa chỉ ${C.address}; ${C.representativeTitle}: ${C.representative}; Hotline ${C.phone}; Email ${C.email}.`,
      },
      { type: "heading", text: "II. Nguyên tắc hoạt động" },
      {
        type: "list",
        items: [
          "Tuân thủ pháp luật Việt Nam về thương mại điện tử, bảo vệ quyền lợi người tiêu dùng, quảng cáo và an toàn thông tin / bảo vệ dữ liệu cá nhân.",
          "Công khai, minh bạch thông tin hàng hóa, giá bán, điều kiện giao dịch và toàn bộ chính sách mua hàng liên quan.",
          "Bảo đảm tính chính xác của thông tin đăng tải; cập nhật kịp thời khi có thay đổi.",
          "Không đăng tải hàng hóa, dịch vụ thuộc danh mục cấm kinh doanh theo quy định pháp luật.",
          "Bảo mật thông tin khách hàng theo Chính sách bảo mật thông tin đã công bố.",
        ],
      },
      { type: "heading", text: "III. Quy trình giao dịch tổng quát" },
      {
        type: "list",
        ordered: true,
        items: [
          "Khách hàng truy cập website, tìm kiếm và xem thông tin sản phẩm.",
          "Khách hàng liên hệ tư vấn qua Hotline, Zalo, chatbot hoặc email.",
          `${C.tradeName} xác nhận đơn hàng, thỏa thuận thanh toán và phương thức giao nhận / lắp đặt.`,
          "Khách hàng thanh toán theo thỏa thuận.",
          `${C.tradeName} giao hàng hoặc bàn giao tại showroom / công trình.`,
          "Khách hàng nghiệm thu, nhận chứng từ và phiếu bảo hành (nếu có).",
        ],
      },
      {
        type: "heading",
        text: "IV. Các chính sách mua hàng đính kèm quy chế",
      },
      {
        type: "paragraph",
        text: "Các nội dung chi tiết về giao dịch được quy định tại các chính sách sau (là phần không tách rời của Quy chế này):",
      },
      {
        type: "list",
        items: [
          "Quyền và nghĩa vụ các bên",
          "Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ",
          "Chính sách về giá và chi phí giao dịch",
          "Chính sách thanh toán và hoàn tiền",
          "Chính sách vận chuyển, giao hàng và nhận hàng",
          "Chính sách đổi trả hàng và hoàn tiền",
          "Chính sách bảo mật thông tin khách hàng",
          "Cơ chế tiếp nhận và giải quyết khiếu nại",
          "Chính sách về phương thức cung cấp dịch vụ",
          "Chính sách chấm dứt dịch vụ và hoàn tiền",
          "Chính sách bảo hành sản phẩm",
        ],
      },
      { type: "heading", text: "V. Giải quyết tranh chấp" },
      {
        type: "paragraph",
        text: "Tranh chấp phát sinh được ưu tiên giải quyết bằng thương lượng, hòa giải theo Cơ chế tiếp nhận và giải quyết khiếu nại. Nếu không thống nhất, tranh chấp được giải quyết tại cơ quan nhà nước có thẩm quyền theo pháp luật Việt Nam.",
      },
      { type: "heading", text: "VI. Hiệu lực và sửa đổi" },
      {
        type: "paragraph",
        text: `Quy chế có hiệu lực từ ngày ${C.policyEffectiveDate} (phiên bản ${C.policyVersion}). ${C.tradeName} có quyền sửa đổi, bổ sung và công bố trên website. Việc khách hàng tiếp tục sử dụng website sau khi nội dung được cập nhật được hiểu là đã đồng ý với nội dung mới.`,
      },
      ...contactBlock,
    ],
  },
];

export const POLICY_BY_SLUG = Object.fromEntries(
  POLICY_DOCUMENTS.map((doc) => [doc.slug, doc]),
) as Record<string, PolicyDocument>;

export const POLICY_NAV_LINKS = POLICY_DOCUMENTS.map((doc) => ({
  href: `/chinh-sach/${doc.slug}`,
  label: doc.shortTitle,
}));
