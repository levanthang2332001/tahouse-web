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
      `Hotline: ${C.phonesDisplay}`,
      `Zalo: ${C.zaloUrl}`,
      `Email: ${C.email}`,
      `Website: ${C.websiteDisplay}`,
      `Giờ làm việc: ${C.workingHours}`,
    ],
  },
];

/** Bộ chính sách mua hàng – cập nhật theo hồ sơ chính sách TA HOUSE */
export const POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    slug: "chu-quan-tmdt",
    title: `Thông tin doanh nghiệp / chủ quản website`,
    shortTitle: `Thông tin doanh nghiệp`,
    description: `Công khai thông tin đơn vị sở hữu và vận hành website TA HOUSE theo quy định thương mại điện tử.`,
    sections: [
      {
        type: "paragraph",
        text: `Chào mừng Quý khách đến với website ${C.tradeName}.`,
      },
      {
        type: "paragraph",
        text: `Website được sở hữu và vận hành bởi ${C.legalName}, hoạt động trong lĩnh vực cung cấp thiết bị nhà bếp, khóa thông minh, phụ kiện nhà bếp và các giải pháp lắp đặt, tư vấn cho gia đình, căn hộ, nhà phố và công trình.`,
      },
      {
        type: "paragraph",
        text: `Các thông tin pháp lý của doanh nghiệp được công khai như sau.`,
      },
      {
        type: "heading",
        text: `1. Thông tin doanh nghiệp`,
      },
      {
        type: "list",
        items: [
          `Tên doanh nghiệp: ${C.legalName}`,
          `Tên giao dịch: ${C.abbreviatedName}`,
          `Tên công ty viết bằng tiếng nước ngoài: ${C.englishName}`,
          `Mã số doanh nghiệp / Mã số thuế: ${C.taxCode}`,
          `Địa chỉ trụ sở chính: ${C.address}`,
          `${C.representativeTitle}: ${C.representative}`,
          `Điện thoại: ${C.phonesDisplay}`,
          `Email: ${C.email}`,
          `Website: ${C.websiteDisplay}`,
          `Ngày cấp GCNĐKKD: ${C.registrationDate}`,
          `Cơ quan cấp: ${C.registrationAuthority}`,
          `Loại hình website: ${C.ecommerceType}`,
          `Số thông báo website TMĐT: ${C.moitNotificationNumber}`,
        ],
      },
      {
        type: "heading",
        text: `2. Lĩnh vực hoạt động`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} hoạt động trong các lĩnh vực:`,
      },
      {
        type: "list",
        items: [
          `Thiết bị nhà bếp.`,
          `Bếp từ, bếp điện.`,
          `Máy hút mùi.`,
          `Máy rửa chén.`,
          `Chậu rửa và vòi bếp.`,
          `Phụ kiện tủ bếp.`,
          `Khóa cửa thông minh.`,
          `Két sắt.`,
          `Thiết bị nhà ở hiện đại.`,
          `Tư vấn, khảo sát và lắp đặt thiết bị theo nhu cầu khách hàng.`,
        ],
      },
      {
        type: "heading",
        text: `3. Phạm vi phục vụ`,
      },
      {
        type: "paragraph",
        text: `${C.deliveryScope}`,
      },
      {
        type: "heading",
        text: `4. Nguyên tắc hoạt động`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} luôn hướng tới các giá trị:`,
      },
      {
        type: "list",
        items: [
          `Cung cấp sản phẩm chính hãng.`,
          `Thông tin minh bạch.`,
          `Báo giá rõ ràng.`,
          `Tư vấn đúng nhu cầu sử dụng.`,
          `Lắp đặt đúng kỹ thuật.`,
          `Bảo hành theo quy định của nhà sản xuất và chính sách của công ty.`,
          `Bảo vệ quyền lợi hợp pháp của khách hàng.`,
        ],
      },
      ...contactBlock,
    ],
  },
  {
    slug: "phuong-thuc-cung-cap",
    title: `Chính sách mua hàng`,
    shortTitle: `Chính sách mua hàng`,
    description: `Quy định quy trình giao dịch giữa TA HOUSE và khách hàng khi mua sản phẩm hoặc sử dụng dịch vụ trên website.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích`,
      },
      {
        type: "paragraph",
        text: `Chính sách mua hàng này quy định quy trình giao dịch giữa ${C.legalName} và khách hàng khi mua sản phẩm hoặc sử dụng dịch vụ trên website ${C.websiteDisplay}.`,
      },
      {
        type: "paragraph",
        text: `Việc khách hàng đặt hàng hoặc sử dụng dịch vụ đồng nghĩa với việc đã đọc, hiểu và đồng ý với các nội dung trong chính sách này.`,
      },
      {
        type: "heading",
        text: `2. Phạm vi áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách áp dụng đối với tất cả sản phẩm và dịch vụ được cung cấp bởi ${C.tradeName}, bao gồm nhưng không giới hạn:`,
      },
      {
        type: "list",
        items: [
          `Thiết bị nhà bếp.`,
          `Bếp từ, bếp điện.`,
          `Máy hút mùi.`,
          `Máy rửa chén.`,
          `Chậu rửa, vòi bếp.`,
          `Phụ kiện tủ bếp.`,
          `Khóa cửa thông minh.`,
          `Két sắt.`,
          `Dịch vụ khảo sát, tư vấn và lắp đặt.`,
        ],
      },
      {
        type: "heading",
        text: `3. Quy trình mua hàng`,
      },
      {
        type: "paragraph",
        text: `Khách hàng có thể đặt mua sản phẩm thông qua:`,
      },
      {
        type: "list",
        items: [
          `Website ${C.websiteDisplay}.`,
          `Hotline của công ty.`,
          `Zalo, Facebook hoặc các kênh chính thức của ${C.tradeName}.`,
          `Mua trực tiếp tại showroom.`,
        ],
      },
      {
        type: "paragraph",
        text: `Quy trình thực hiện gồm các bước:`,
      },
      {
        type: "list",
        items: [
          `Bước 1: Khách hàng gửi yêu cầu tư vấn hoặc lựa chọn sản phẩm.`,
          `Bước 2: ${C.tradeName} tiếp nhận thông tin và tư vấn sản phẩm phù hợp với nhu cầu sử dụng.`,
          `Bước 3: Đối với các sản phẩm cần khảo sát hiện trạng (ví dụ: khóa cửa, máy rửa chén âm tủ, máy hút mùi, bếp âm…), ${C.tradeName} có thể đề nghị khảo sát thực tế hoặc yêu cầu khách hàng cung cấp thông tin, hình ảnh, kích thước để tư vấn chính xác.`,
          `Bước 4: ${C.tradeName} gửi báo giá và xác nhận thông tin đặt hàng.`,
          `Bước 5: Hai bên thống nhất đơn hàng, phương thức thanh toán, thời gian giao hàng và lắp đặt (nếu có).`,
          `Bước 6: ${C.tradeName} tiến hành giao hàng, lắp đặt theo thỏa thuận.`,
          `Bước 7: Khách hàng kiểm tra sản phẩm, nghiệm thu và nhận hướng dẫn sử dụng.`,
        ],
      },
      {
        type: "heading",
        text: `4. Xác nhận đơn hàng`,
      },
      {
        type: "paragraph",
        text: `Đơn hàng chỉ được xác nhận khi ${C.tradeName} đã liên hệ với khách hàng và hai bên thống nhất về:`,
      },
      {
        type: "list",
        items: [
          `Sản phẩm.`,
          `Số lượng.`,
          `Giá bán.`,
          `Địa điểm giao hàng.`,
          `Chi phí vận chuyển (nếu có).`,
          `Chi phí lắp đặt (nếu có).`,
          `Thời gian thực hiện.`,
        ],
      },
      {
        type: "paragraph",
        text: `Trong một số trường hợp, ${C.tradeName} có quyền liên hệ lại để xác minh thông tin trước khi xử lý đơn hàng.`,
      },
      {
        type: "heading",
        text: `5. Giá bán`,
      },
      {
        type: "paragraph",
        text: `Giá sản phẩm được công bố trên website hoặc báo giá trực tiếp cho khách hàng.`,
      },
      {
        type: "paragraph",
        text: `Giá bán có thể thay đổi theo từng thời điểm, chương trình khuyến mại hoặc chính sách của nhà sản xuất.`,
      },
      {
        type: "paragraph",
        text: `Trường hợp phát sinh sai sót về giá do lỗi kỹ thuật hoặc cập nhật dữ liệu, ${C.tradeName} sẽ chủ động thông báo cho khách hàng để cùng thống nhất phương án xử lý trước khi thực hiện đơn hàng.`,
      },
      {
        type: "heading",
        text: `6. Khảo sát và lắp đặt`,
      },
      {
        type: "paragraph",
        text: `Đối với các sản phẩm yêu cầu lắp đặt hoặc phụ thuộc vào hiện trạng công trình, việc tư vấn và báo giá có thể căn cứ trên thông tin khách hàng cung cấp hoặc kết quả khảo sát thực tế.`,
      },
      {
        type: "paragraph",
        text: `Nếu hiện trạng thực tế khác với thông tin ban đầu, ${C.tradeName} sẽ trao đổi với khách hàng trước khi thực hiện để thống nhất phương án phù hợp.`,
      },
      {
        type: "heading",
        text: `7. Quyền từ chối đơn hàng`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} có quyền từ chối hoặc tạm ngừng xử lý đơn hàng trong các trường hợp như:`,
      },
      {
        type: "list",
        items: [
          `Thông tin khách hàng không đầy đủ hoặc không chính xác.`,
          `Không thể liên hệ xác nhận đơn hàng.`,
          `Sản phẩm tạm hết hàng hoặc ngừng kinh doanh.`,
          `Địa điểm giao hàng không đáp ứng điều kiện vận chuyển hoặc lắp đặt.`,
          `Có dấu hiệu gian lận hoặc vi phạm pháp luật.`,
        ],
      },
      {
        type: "paragraph",
        text: `Trong trường hợp này, ${C.tradeName} sẽ thông báo đến khách hàng trong thời gian sớm nhất.`,
      },
      {
        type: "heading",
        text: `8. Quyền và trách nhiệm của khách hàng`,
      },
      {
        type: "list",
        items: [
          `Cung cấp thông tin chính xác khi đặt hàng.`,
          `Kiểm tra sản phẩm khi nhận hàng.`,
          `Thanh toán đúng theo thỏa thuận.`,
          `Đọc kỹ hướng dẫn sử dụng trước khi vận hành sản phẩm.`,
          `Thông báo cho ${C.tradeName} nếu phát hiện sai sót hoặc hư hỏng.`,
        ],
      },
      {
        type: "heading",
        text: `9. Quyền và trách nhiệm của TA HOUSE`,
      },
      {
        type: "list",
        items: [
          `Tư vấn trung thực và phù hợp với nhu cầu sử dụng.`,
          `Cung cấp sản phẩm đúng theo đơn hàng đã xác nhận.`,
          `Thực hiện giao hàng và lắp đặt theo thỏa thuận.`,
          `Hỗ trợ bảo hành theo chính sách của nhà sản xuất và của công ty.`,
          `Bảo mật thông tin khách hàng theo quy định.`,
        ],
      },
      {
        type: "heading",
        text: `10. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách mua hàng này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay} (phiên bản ${C.policyVersion}, ngày ${C.policyEffectiveDate}).`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} có quyền cập nhật hoặc điều chỉnh nội dung chính sách. Mọi thay đổi sẽ được công bố trên website trước khi áp dụng.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "quyen-va-nghia-vu",
    title: `Quyền và nghĩa vụ các bên`,
    shortTitle: `Quyền và nghĩa vụ các bên`,
    description: `Công bố quyền và trách nhiệm của khách hàng và TA HOUSE trong quá trình giao dịch trên website.`,
    sections: [
      {
        type: "heading",
        text: `1. Quyền và trách nhiệm của khách hàng`,
      },
      {
        type: "list",
        items: [
          `Cung cấp thông tin chính xác khi yêu cầu tư vấn, đặt hàng hoặc xuất hóa đơn.`,
          `Kiểm tra thông tin sản phẩm, báo giá và điều kiện giao dịch trước khi xác nhận.`,
          `Kiểm tra sản phẩm khi nhận hàng.`,
          `Thanh toán đúng theo thỏa thuận.`,
          `Đọc kỹ hướng dẫn sử dụng trước khi vận hành sản phẩm.`,
          `Không sử dụng website vào mục đích trái pháp luật; không giả mạo thông tin.`,
          `Không can thiệp, phá hoại hoặc làm gián đoạn hoạt động của website.`,
          `Phối hợp trong quá trình giao hàng, lắp đặt và bảo hành.`,
        ],
      },
      {
        type: "heading",
        text: `2. Quyền và trách nhiệm của TA HOUSE`,
      },
      {
        type: "list",
        items: [
          `Cung cấp thông tin trung thực về sản phẩm và dịch vụ.`,
          `Tư vấn trung thực và phù hợp với nhu cầu sử dụng.`,
          `Cung cấp sản phẩm đúng theo đơn hàng đã xác nhận.`,
          `Thực hiện giao hàng và lắp đặt theo thỏa thuận.`,
          `Bảo vệ thông tin khách hàng theo Chính sách bảo mật.`,
          `Hỗ trợ bảo hành theo chính sách của nhà sản xuất và của công ty.`,
          `Tiếp nhận và giải quyết phản ánh, khiếu nại theo quy định.`,
        ],
      },
      {
        type: "heading",
        text: `3. Giới hạn trách nhiệm`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} chịu trách nhiệm trong phạm vi sản phẩm, dịch vụ và công việc do mình trực tiếp cung cấp hoặc thực hiện theo thỏa thuận với khách hàng.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} không chịu trách nhiệm đối với thiệt hại phát sinh do:`,
      },
      {
        type: "list",
        items: [
          `Khách hàng cung cấp thông tin không chính xác.`,
          `Khách hàng tự ý lắp đặt, tháo dỡ, sửa chữa hoặc thay đổi kết cấu sản phẩm.`,
          `Sản phẩm được sử dụng sai hướng dẫn hoặc sai mục đích.`,
          `Hệ thống điện, nước, mạng, cửa, tủ bếp hoặc công trình không đạt điều kiện kỹ thuật.`,
          `Sự cố từ nền tảng, đường truyền hoặc dịch vụ của bên thứ ba.`,
          `Thiên tai, hỏa hoạn, dịch bệnh hoặc các sự kiện bất khả kháng khác.`,
        ],
      },
      {
        type: "paragraph",
        text: `Quy định này không loại trừ những trách nhiệm mà ${C.tradeName} bắt buộc phải thực hiện theo pháp luật.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "dieu-kien-han-che",
    title: `Điều khoản và điều kiện sử dụng website`,
    shortTitle: `Điều khoản sử dụng website`,
    description: `Điều kiện áp dụng khi truy cập, tư vấn hoặc giao dịch qua website www.tahouse.net.`,
    sections: [
      {
        type: "heading",
        text: `1. Phạm vi áp dụng`,
      },
      {
        type: "paragraph",
        text: `Điều khoản và điều kiện này áp dụng đối với mọi cá nhân, tổ chức truy cập, tham khảo thông tin, gửi yêu cầu tư vấn hoặc thực hiện giao dịch thông qua website ${C.websiteDisplay}.`,
      },
      {
        type: "paragraph",
        text: `Website do ${C.legalName} quản lý và vận hành. Khi sử dụng website, người dùng có trách nhiệm đọc và tuân thủ các nội dung được quy định tại điều khoản này cùng các chính sách liên quan.`,
      },
      {
        type: "heading",
        text: `2. Mục đích hoạt động của website`,
      },
      {
        type: "paragraph",
        text: `Website ${C.websiteDisplay} được sử dụng để:`,
      },
      {
        type: "list",
        items: [
          `Giới thiệu doanh nghiệp, sản phẩm và dịch vụ của ${C.tradeName}.`,
          `Cung cấp thông tin tham khảo về khóa thông minh, thiết bị bếp, phụ kiện tủ bếp, két sắt và các thiết bị nhà ở hiện đại.`,
          `Tiếp nhận yêu cầu tư vấn, báo giá, khảo sát, đặt hàng, giao hàng, lắp đặt, bảo hành và hỗ trợ kỹ thuật.`,
          `Kết nối khách hàng với đội ngũ tư vấn và kỹ thuật của ${C.tradeName}.`,
        ],
      },
      {
        type: "paragraph",
        text: `${C.tradeName} là đơn vị bán sản phẩm và cung cấp dịch vụ của chính mình. Website không phải là sàn giao dịch cho các tổ chức hoặc cá nhân khác tự đăng bán hàng hóa.`,
      },
      {
        type: "heading",
        text: `3. Thông tin về sản phẩm và dịch vụ`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} cố gắng cung cấp thông tin sản phẩm, hình ảnh, thông số kỹ thuật, xuất xứ, chính sách bảo hành và nội dung tư vấn một cách rõ ràng, trung thực. Tuy nhiên:`,
      },
      {
        type: "list",
        items: [
          `Hình ảnh sản phẩm có thể có khác biệt nhỏ về màu sắc do ánh sáng, thiết bị hiển thị hoặc phiên bản sản phẩm.`,
          `Thông số kỹ thuật, mẫu mã, phụ kiện và chính sách của nhà sản xuất có thể được cập nhật theo từng thời điểm.`,
          `Khả năng lắp đặt thực tế phụ thuộc vào loại cửa, kích thước tủ bếp, mặt đá, nguồn điện, đường ống, vị trí công trình và các điều kiện kỹ thuật liên quan.`,
          `Một số sản phẩm cần được khảo sát hoặc xác nhận kích thước trước khi lắp đặt.`,
        ],
      },
      {
        type: "paragraph",
        text: `Khách hàng nên trao đổi trực tiếp với ${C.tradeName} để được xác nhận thông tin trước khi quyết định mua hàng.`,
      },
      {
        type: "heading",
        text: `4. Giá bán và chi phí liên quan`,
      },
      {
        type: "paragraph",
        text: `Giá hiển thị trên website, nếu có, được áp dụng theo thông tin công bố tại từng thời điểm. Tùy từng sản phẩm hoặc đơn hàng, giá có thể:`,
      },
      {
        type: "list",
        items: [
          `Đã bao gồm hoặc chưa bao gồm thuế giá trị gia tăng.`,
          `Đã bao gồm hoặc chưa bao gồm chi phí giao hàng.`,
          `Đã bao gồm hoặc chưa bao gồm chi phí lắp đặt.`,
          `Chưa bao gồm phụ kiện, vật tư hoặc chi phí phát sinh theo hiện trạng công trình.`,
        ],
      },
      {
        type: "paragraph",
        text: `${C.tradeName} sẽ thông báo rõ cho khách hàng các khoản chi phí trước khi xác nhận đơn hàng. Trong trường hợp giá trên website khác với báo giá được xác nhận trực tiếp, nội dung trên báo giá hoặc xác nhận đơn hàng mới nhất sẽ được ưu tiên áp dụng.`,
      },
      {
        type: "heading",
        text: `5. Quyền từ chối hoặc điều chỉnh đơn hàng`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} có quyền liên hệ để kiểm tra, điều chỉnh hoặc từ chối tiếp nhận đơn hàng trong các trường hợp:`,
      },
      {
        type: "list",
        items: [
          `Thông tin khách hàng cung cấp không đầy đủ hoặc không chính xác.`,
          `Sản phẩm tạm hết hàng, ngừng kinh doanh hoặc thay đổi phiên bản.`,
          `Giá hoặc thông tin sản phẩm bị hiển thị sai do lỗi kỹ thuật.`,
          `Hiện trạng công trình không đáp ứng điều kiện lắp đặt an toàn.`,
          `Khách hàng không thực hiện nghĩa vụ thanh toán theo thỏa thuận.`,
          `Yêu cầu có dấu hiệu gian lận, giả mạo hoặc vi phạm pháp luật.`,
          `Xảy ra sự kiện bất khả kháng hoặc nguyên nhân nằm ngoài khả năng kiểm soát hợp lý.`,
        ],
      },
      {
        type: "heading",
        text: `6. Quyền sở hữu nội dung`,
      },
      {
        type: "paragraph",
        text: `Tên thương mại, nhãn hiệu, logo, hình ảnh, bài viết, video, tài liệu, thiết kế và các nội dung khác trên website thuộc quyền sở hữu của ${C.tradeName} hoặc được ${C.tradeName} sử dụng hợp pháp.`,
      },
      {
        type: "paragraph",
        text: `Người dùng không được sao chép, chỉnh sửa, phân phối, đăng tải lại hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý của ${C.tradeName}, trừ trường hợp pháp luật có quy định khác.`,
      },
      {
        type: "heading",
        text: `7. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Điều khoản và điều kiện sử dụng website có hiệu lực kể từ ngày được đăng tải trên ${C.websiteDisplay}.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "chinh-sach-ve-gia",
    title: `Chính sách về giá và chi phí giao dịch`,
    shortTitle: `Chính sách về giá`,
    description: `Công bố nguyên tắc về giá bán, thuế, chi phí giao hàng và lắp đặt trước khi xác nhận đơn hàng.`,
    sections: [
      {
        type: "heading",
        text: `1. Giá bán`,
      },
      {
        type: "paragraph",
        text: `Giá sản phẩm được công bố trên website hoặc báo giá trực tiếp cho khách hàng.`,
      },
      {
        type: "paragraph",
        text: `Giá bán có thể thay đổi theo từng thời điểm, chương trình khuyến mại hoặc chính sách của nhà sản xuất.`,
      },
      {
        type: "paragraph",
        text: `Trường hợp phát sinh sai sót về giá do lỗi kỹ thuật hoặc cập nhật dữ liệu, ${C.tradeName} sẽ chủ động thông báo cho khách hàng để cùng thống nhất phương án xử lý trước khi thực hiện đơn hàng.`,
      },
      {
        type: "heading",
        text: `2. Thuế và chi phí liên quan`,
      },
      {
        type: "paragraph",
        text: `Tùy từng sản phẩm hoặc chương trình bán hàng, giá có thể đã bao gồm hoặc chưa bao gồm thuế giá trị gia tăng (VAT). ${C.tradeName} sẽ thông báo rõ trong báo giá hoặc đơn hàng.`,
      },
      {
        type: "paragraph",
        text: `Tùy từng đơn hàng, giá có thể đã bao gồm hoặc chưa bao gồm chi phí giao hàng, chi phí lắp đặt; và có thể chưa bao gồm phụ kiện, vật tư hoặc chi phí phát sinh theo hiện trạng công trình.`,
      },
      {
        type: "heading",
        text: `3. Ưu tiên áp dụng`,
      },
      {
        type: "paragraph",
        text: `Trong trường hợp giá trên website khác với báo giá được ${C.tradeName} xác nhận trực tiếp, nội dung trên báo giá hoặc xác nhận đơn hàng mới nhất sẽ được ưu tiên áp dụng.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} sẽ thông báo rõ cho khách hàng các khoản chi phí trước khi xác nhận đơn hàng.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "thanh-toan",
    title: `Chính sách thanh toán`,
    shortTitle: `Chính sách thanh toán`,
    description: `Quy định các hình thức thanh toán và nguyên tắc thanh toán khi mua sản phẩm hoặc sử dụng dịch vụ của TA HOUSE.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích`,
      },
      {
        type: "paragraph",
        text: `Chính sách thanh toán này quy định các hình thức thanh toán và nguyên tắc thanh toán khi Quý khách mua sản phẩm hoặc sử dụng dịch vụ của ${C.legalName} thông qua website ${C.websiteDisplay}, showroom hoặc các kênh bán hàng chính thức của công ty.`,
      },
      {
        type: "heading",
        text: `2. Phạm vi áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách áp dụng đối với tất cả khách hàng mua sản phẩm hoặc sử dụng dịch vụ do ${C.tradeName} cung cấp, bao gồm thiết bị nhà bếp, khóa cửa thông minh, két sắt, phụ kiện nhà bếp và dịch vụ khảo sát, giao hàng, lắp đặt.`,
      },
      {
        type: "heading",
        text: `3. Hình thức thanh toán`,
      },
      {
        type: "heading",
        text: `3.1. Thanh toán bằng tiền mặt`,
      },
      {
        type: "paragraph",
        text: `Khách hàng thanh toán trực tiếp tại showroom hoặc thanh toán cho nhân viên giao hàng theo thỏa thuận giữa hai bên.`,
      },
      {
        type: "heading",
        text: `3.2. Thanh toán bằng chuyển khoản`,
      },
      {
        type: "paragraph",
        text: `Khách hàng chuyển khoản vào tài khoản do ${C.tradeName} cung cấp trong báo giá hoặc đơn đặt hàng.`,
      },
      {
        type: "paragraph",
        text: `Nội dung chuyển khoản nên ghi: Họ tên - Số điện thoại - Mã đơn hàng (nếu có).`,
      },
      {
        type: "paragraph",
        text: `Sau khi nhận được thanh toán, ${C.tradeName} sẽ xác nhận và tiến hành xử lý đơn hàng theo quy trình.`,
      },
      {
        type: "heading",
        text: `4. Thanh toán đặt cọc`,
      },
      {
        type: "paragraph",
        text: `Đối với hàng đặt theo yêu cầu, sản phẩm cần giữ hàng, đơn hàng có giá trị lớn hoặc công trình cần lắp đặt theo lịch hẹn, ${C.tradeName} có thể đề nghị khách hàng thanh toán một khoản đặt cọc trước khi thực hiện đơn hàng.`,
      },
      {
        type: "paragraph",
        text: `Mức đặt cọc sẽ được hai bên thống nhất và thể hiện trên báo giá hoặc xác nhận đơn hàng.`,
      },
      {
        type: "heading",
        text: `5. Thanh toán phần còn lại`,
      },
      {
        type: "paragraph",
        text: `Khách hàng thanh toán phần giá trị còn lại theo thỏa thuận sau khi nhận hàng, hoàn thành lắp đặt (nếu có), hoặc theo các điều kiện đã thống nhất giữa hai bên.`,
      },
      {
        type: "heading",
        text: `6. Giá thanh toán và xuất hóa đơn`,
      },
      {
        type: "paragraph",
        text: `Giá thanh toán là giá đã được ${C.tradeName} xác nhận với khách hàng tại thời điểm đặt hàng. Tùy từng sản phẩm, giá có thể đã bao gồm hoặc chưa bao gồm VAT và sẽ được thông báo rõ trong báo giá hoặc đơn hàng.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} thực hiện xuất hóa đơn điện tử theo quy định. Khách hàng cần cung cấp tên đơn vị/cá nhân, MST (nếu có), địa chỉ và email nhận hóa đơn trước hoặc tại thời điểm thanh toán.`,
      },
      {
        type: "heading",
        text: `7. An toàn thanh toán`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} không yêu cầu khách hàng cung cấp mật khẩu tài khoản ngân hàng, mã OTP hoặc các thông tin bảo mật khác dưới bất kỳ hình thức nào.`,
      },
      {
        type: "paragraph",
        text: `Khách hàng cần kiểm tra đúng thông tin tài khoản thanh toán do ${C.tradeName} cung cấp trước khi chuyển khoản. Nếu phát hiện dấu hiệu bất thường, vui lòng liên hệ hotline ngay.`,
      },
      {
        type: "heading",
        text: `8. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách thanh toán này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay}.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "giao-hang",
    title: `Chính sách giao hàng`,
    shortTitle: `Chính sách giao hàng`,
    description: `Quy định phạm vi, thời gian, phương thức giao hàng và trách nhiệm các bên.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích`,
      },
      {
        type: "paragraph",
        text: `Chính sách giao hàng này quy định về phạm vi, thời gian, phương thức giao hàng và trách nhiệm của các bên khi ${C.legalName} cung cấp sản phẩm đến Quý khách.`,
      },
      {
        type: "heading",
        text: `2. Phạm vi áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách áp dụng đối với tất cả đơn hàng được đặt qua website ${C.websiteDisplay}, showroom, hotline, Zalo, Facebook và các kênh bán hàng chính thức.`,
      },
      {
        type: "heading",
        text: `3. Phạm vi giao hàng`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} cung cấp dịch vụ giao hàng trên phạm vi toàn quốc.`,
      },
      {
        type: "paragraph",
        text: `Đối với các sản phẩm cần khảo sát, lắp đặt hoặc hướng dẫn sử dụng trực tiếp, phạm vi phục vụ sẽ căn cứ vào khu vực và điều kiện thực tế. Nhân viên ${C.tradeName} sẽ trao đổi cụ thể trước khi xác nhận đơn hàng.`,
      },
      {
        type: "heading",
        text: `4. Thời gian và chi phí giao hàng`,
      },
      {
        type: "paragraph",
        text: `Thời gian giao hàng được xác nhận khi ${C.tradeName} tiếp nhận và xử lý đơn hàng. Đơn hàng có sẵn được giao theo thỏa thuận; hàng đặt trước hoặc cần điều chuyển sẽ được thông báo cụ thể khi xác nhận đơn hàng.`,
      },
      {
        type: "paragraph",
        text: `Chi phí giao hàng (nếu có) sẽ được thông báo rõ trước khi xác nhận đơn hàng. Một số chương trình có thể áp dụng miễn phí giao hàng theo từng thời điểm hoặc khu vực.`,
      },
      {
        type: "heading",
        text: `5. Kiểm tra hàng khi nhận`,
      },
      {
        type: "list",
        items: [
          `Đúng sản phẩm đã đặt.`,
          `Đúng số lượng.`,
          `Tình trạng bên ngoài của sản phẩm và bao bì.`,
          `Phụ kiện đi kèm (nếu có).`,
        ],
      },
      {
        type: "paragraph",
        text: `Nếu phát hiện hư hỏng, giao thiếu hoặc không đúng đơn hàng, vui lòng phản ánh ngay với nhân viên giao hàng hoặc liên hệ ${C.tradeName}.`,
      },
      {
        type: "heading",
        text: `6. Giao hàng kết hợp lắp đặt`,
      },
      {
        type: "paragraph",
        text: `Đối với khóa cửa thông minh, bếp âm, máy hút mùi, máy rửa chén, chậu – vòi bếp và các thiết bị có yêu cầu kỹ thuật, ${C.tradeName} sẽ thống nhất thời gian giao hàng và lắp đặt. Việc lắp đặt thực hiện theo hiện trạng công trình và điều kiện kỹ thuật của sản phẩm.`,
      },
      {
        type: "heading",
        text: `7. Giao hàng không thành công và bất khả kháng`,
      },
      {
        type: "paragraph",
        text: `Giao hàng có thể không thực hiện được khi không liên hệ được người nhận, địa chỉ không chính xác, người nhận không có mặt theo lịch hẹn, hoặc có yếu tố khách quan ảnh hưởng vận chuyển. ${C.tradeName} sẽ liên hệ để thống nhất phương án phù hợp.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} không chịu trách nhiệm chậm giao do thiên tai, hỏa hoạn, dịch bệnh, sự cố giao thông nghiêm trọng hoặc quy định của cơ quan nhà nước; sẽ thông báo sớm nhất và thống nhất phương án xử lý.`,
      },
      {
        type: "heading",
        text: `8. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách giao hàng này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay}.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "doi-tra-hoan-tien",
    title: `Chính sách đổi trả và hoàn tiền`,
    shortTitle: `Đổi trả và hoàn tiền`,
    description: `Quy định điều kiện, quy trình đổi sản phẩm hoặc hoàn tiền đối với sản phẩm, dịch vụ do TA HOUSE cung cấp.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích và nguyên tắc`,
      },
      {
        type: "paragraph",
        text: `Chính sách này quy định điều kiện, quy trình và trách nhiệm khi phát sinh yêu cầu đổi sản phẩm hoặc hoàn tiền đối với sản phẩm, dịch vụ do ${C.legalName} cung cấp.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} phân biệt rõ giữa đổi trả do giao sai, giao thiếu hoặc lỗi trong quá trình giao hàng với bảo hành lỗi kỹ thuật. Trường hợp thuộc bảo hành được xử lý theo Chính sách bảo hành.`,
      },
      {
        type: "heading",
        text: `2. Trường hợp được xem xét đổi trả`,
      },
      {
        type: "list",
        items: [
          `Giao không đúng mẫu mã, chủng loại hoặc số lượng theo đơn hàng đã xác nhận.`,
          `Sản phẩm bị hư hỏng do quá trình vận chuyển.`,
          `Sản phẩm có lỗi từ nhà sản xuất và đủ điều kiện đổi mới theo chính sách của nhà sản xuất.`,
          `Các trường hợp khác được hai bên thống nhất bằng văn bản hoặc xác nhận qua kênh chính thức.`,
        ],
      },
      {
        type: "heading",
        text: `3. Điều kiện đổi trả`,
      },
      {
        type: "list",
        items: [
          `Khách hàng thông báo trong thời gian hợp lý kể từ khi nhận hàng.`,
          `Sản phẩm chưa qua sử dụng, chưa bị tác động làm thay đổi hiện trạng (trừ lỗi từ nhà sản xuất).`,
          `Còn đầy đủ phụ kiện, tem, nhãn và tài liệu đi kèm (nếu có).`,
          `Có thông tin xác nhận mua hàng từ ${C.tradeName}.`,
        ],
      },
      {
        type: "heading",
        text: `4. Trường hợp không áp dụng đổi trả`,
      },
      {
        type: "list",
        items: [
          `Thay đổi nhu cầu sau khi đã xác nhận đơn hàng hoặc sau khi đã lắp đặt, bàn giao.`,
          `Hư hỏng do sử dụng không đúng hướng dẫn hoặc tác động bên ngoài.`,
          `Đã lắp đặt, can thiệp kỹ thuật hoặc tự ý tháo rời khi chưa được đồng ý.`,
          `Hàng đặt theo yêu cầu riêng, trừ khi có thỏa thuận khác.`,
          `Không thuộc phạm vi đổi trả theo quy định của nhà sản xuất hoặc pháp luật.`,
        ],
      },
      {
        type: "heading",
        text: `5. Hoàn tiền và chi phí`,
      },
      {
        type: "paragraph",
        text: `Hoàn tiền (nếu có) khi hai bên thống nhất hủy đơn; khi ${C.tradeName} không thể cung cấp sản phẩm đã xác nhận và khách hàng không chọn phương án thay thế; hoặc theo kết quả khiếu nại/thỏa thuận. Thời gian và hình thức hoàn tiền được trao đổi sau khi xác minh.`,
      },
      {
        type: "paragraph",
        text: `Đổi trả do lỗi của ${C.tradeName} hoặc nhà sản xuất: chi phí hợp lý do ${C.tradeName} chịu. Các trường hợp khác: chi phí phát sinh (nếu có) do hai bên thống nhất trước khi thực hiện.`,
      },
      {
        type: "heading",
        text: `6. Quy trình tiếp nhận`,
      },
      {
        type: "list",
        items: [
          `Bước 1: Liên hệ ${C.tradeName} qua hotline hoặc email.`,
          `Bước 2: Cung cấp thông tin đơn hàng và mô tả tình trạng sản phẩm.`,
          `Bước 3: ${C.tradeName} tiếp nhận, kiểm tra và phản hồi phương án xử lý.`,
          `Bước 4: Hai bên thống nhất đổi sản phẩm, bảo hành hoặc hoàn tiền (nếu đủ điều kiện).`,
        ],
      },
      {
        type: "heading",
        text: `7. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách đổi trả và hoàn tiền này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay}.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "cham-dut-dich-vu",
    title: `Chính sách chấm dứt giao dịch và hoàn tiền`,
    shortTitle: `Chấm dứt giao dịch và hoàn tiền`,
    description: `Nguyên tắc hủy đơn, chấm dứt giao dịch và hoàn tiền khi hai bên không tiếp tục thực hiện đơn hàng.`,
    sections: [
      {
        type: "heading",
        text: `1. Chấm dứt hoặc hủy đơn hàng`,
      },
      {
        type: "paragraph",
        text: `Giao dịch có thể được chấm dứt hoặc hủy khi:`,
      },
      {
        type: "list",
        items: [
          `Hai bên thống nhất hủy đơn hàng theo quy định.`,
          `${C.tradeName} không thể cung cấp sản phẩm đã xác nhận và khách hàng không lựa chọn phương án thay thế.`,
          `Khách hàng không thực hiện nghĩa vụ thanh toán theo thỏa thuận.`,
          `Có dấu hiệu gian lận, giả mạo hoặc vi phạm pháp luật.`,
          `Xảy ra sự kiện bất khả kháng khiến không thể tiếp tục thực hiện.`,
        ],
      },
      {
        type: "heading",
        text: `2. Hoàn tiền`,
      },
      {
        type: "paragraph",
        text: `Việc hoàn tiền (nếu có) được thực hiện theo Chính sách đổi trả và hoàn tiền, sau khi xác minh thông tin và thống nhất phương án giữa hai bên.`,
      },
      {
        type: "paragraph",
        text: `Thời gian và hình thức hoàn tiền sẽ được ${C.tradeName} trao đổi cụ thể với khách hàng.`,
      },
      {
        type: "heading",
        text: `3. Hiệu lực`,
      },
      {
        type: "paragraph",
        text: `Chính sách này áp dụng cùng với các chính sách mua hàng, thanh toán và đổi trả đã công bố trên ${C.websiteDisplay}.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "bao-mat",
    title: `Chính sách bảo mật thông tin`,
    shortTitle: `Chính sách bảo mật`,
    description: `Nguyên tắc thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ thông tin cá nhân của khách hàng.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích`,
      },
      {
        type: "paragraph",
        text: `Chính sách bảo mật thông tin này quy định nguyên tắc thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ thông tin cá nhân của khách hàng khi truy cập website ${C.websiteDisplay} hoặc liên hệ, giao dịch với ${C.legalName}.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} tôn trọng quyền riêng tư của khách hàng và cam kết sử dụng thông tin đúng mục đích, trong phạm vi cần thiết để phục vụ tư vấn, bán hàng, giao hàng, lắp đặt, bảo hành và chăm sóc khách hàng.`,
      },
      {
        type: "heading",
        text: `2. Phạm vi áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách áp dụng đối với thông tin khách hàng cung cấp qua website, hotline, email, Zalo, Facebook, biểu mẫu tư vấn/báo giá/đặt hàng/bảo hành, hoạt động khảo sát – giao hàng – lắp đặt, và giao dịch tại showroom.`,
      },
      {
        type: "heading",
        text: `3. Thông tin có thể được thu thập`,
      },
      {
        type: "heading",
        text: `3.1. Thông tin liên hệ`,
      },
      {
        type: "list",
        items: [
          `Họ và tên.`,
          `Số điện thoại.`,
          `Địa chỉ email.`,
          `Địa chỉ liên hệ.`,
          `Địa chỉ giao hàng, khảo sát hoặc lắp đặt.`,
        ],
      },
      {
        type: "heading",
        text: `3.2. Thông tin giao dịch`,
      },
      {
        type: "list",
        items: [
          `Sản phẩm hoặc dịch vụ khách hàng quan tâm.`,
          `Nội dung yêu cầu tư vấn và thông tin đơn hàng.`,
          `Lịch khảo sát, giao hàng hoặc lắp đặt.`,
          `Thông tin thanh toán và chứng từ giao dịch.`,
          `Nội dung yêu cầu bảo hành, sửa chữa hoặc hỗ trợ kỹ thuật.`,
        ],
      },
      {
        type: "heading",
        text: `3.3. Thông tin phục vụ lập hóa đơn`,
      },
      {
        type: "paragraph",
        text: `Đối với tổ chức/doanh nghiệp: tên đơn vị, địa chỉ, MST, người liên hệ, email nhận hóa đơn và thông tin cần thiết khác theo pháp luật.`,
      },
      {
        type: "paragraph",
        text: `Đối với cá nhân: họ tên, địa chỉ, số điện thoại, email nhận hóa đơn; MST cá nhân, số định danh hoặc CCCD khi khách hàng cung cấp và khi cần thiết/có căn cứ hợp pháp. ${C.tradeName} không yêu cầu CCCD trong mọi trường hợp.`,
      },
      {
        type: "heading",
        text: `4. Mục đích sử dụng thông tin`,
      },
      {
        type: "list",
        items: [
          `Tiếp nhận và phản hồi yêu cầu tư vấn; tư vấn sản phẩm phù hợp.`,
          `Lập báo giá và xác nhận đơn hàng; liên hệ khảo sát công trình.`,
          `Giao hàng, lắp đặt và nghiệm thu; thanh toán, chứng từ và xuất hóa đơn.`,
          `Bảo hành, sửa chữa, hỗ trợ kỹ thuật và chăm sóc sau bán hàng.`,
          `Giải quyết phản ánh, khiếu nại; quản lý giao dịch nội bộ.`,
          `Thực hiện nghĩa vụ kế toán, thuế và nghĩa vụ pháp luật khác.`,
          `Gửi thông báo liên quan trực tiếp đến đơn hàng, sản phẩm hoặc dịch vụ.`,
        ],
      },
      {
        type: "paragraph",
        text: `${C.tradeName} không sử dụng thông tin cá nhân cho mục đích trái pháp luật hoặc ngoài phạm vi đã thông báo.`,
      },
      {
        type: "heading",
        text: `5. Phạm vi chia sẻ thông tin`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} cam kết không bán, cho thuê hoặc trao đổi thông tin cá nhân vì mục đích thương mại. Thông tin chỉ chia sẻ trong phạm vi cần thiết với nhân viên nội bộ, đơn vị vận chuyển, kỹ thuật/lắp đặt, nhà sản xuất/bảo hành, đơn vị hóa đơn – kế toán – kỹ thuật, ngân hàng/trung gian thanh toán, và cơ quan nhà nước khi có yêu cầu hợp pháp.`,
      },
      {
        type: "heading",
        text: `6. Bảo vệ, lưu trữ và quyền của khách hàng`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} áp dụng biện pháp quản lý và kỹ thuật phù hợp nhằm hạn chế truy cập trái phép, sử dụng sai mục đích, thất thoát hoặc tiết lộ trái phép. Thông tin được lưu trong thời gian cần thiết để hoàn thành giao dịch, bảo hành, chăm sóc khách hàng, giải quyết khiếu nại và nghĩa vụ pháp luật.`,
      },
      {
        type: "paragraph",
        text: `Khách hàng có quyền được biết về việc thu thập/sử dụng; yêu cầu kiểm tra, chỉnh sửa; đề nghị hạn chế sử dụng; ngừng nhận nội dung quảng bá (nếu đã đồng ý nhận); đề nghị xóa khi không còn cần thiết (trừ khi phải lưu theo pháp luật); và gửi phản ánh/khiếu nại liên quan.`,
      },
      {
        type: "heading",
        text: `7. Trách nhiệm của khách hàng`,
      },
      {
        type: "list",
        items: [
          `Cung cấp thông tin chính xác khi đặt hàng hoặc yêu cầu xuất hóa đơn.`,
          `Kiểm tra kỹ thông tin trước khi ${C.tradeName} lập hóa đơn.`,
          `Chủ động thông báo khi thông tin thay đổi hoặc sai sót.`,
          `Không cung cấp thông tin của người khác khi chưa được phép.`,
        ],
      },
      {
        type: "paragraph",
        text: `${C.tradeName} không chịu trách nhiệm đối với sai sót do khách hàng cung cấp thông tin không chính xác, không đầy đủ hoặc không kịp thời.`,
      },
      {
        type: "heading",
        text: `8. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay}. Việc tiếp tục sử dụng website hoặc cung cấp thông tin sau khi công bố được hiểu là khách hàng đã đọc và đồng ý trong phạm vi pháp luật cho phép.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "khieu-nai",
    title: `Chính sách giải quyết khiếu nại`,
    shortTitle: `Giải quyết khiếu nại`,
    description: `Cơ chế tiếp nhận và giải quyết phản ánh, khiếu nại liên quan đến sản phẩm và dịch vụ của TA HOUSE.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} cam kết lắng nghe và tiếp nhận mọi ý kiến phản ánh, khiếu nại của khách hàng liên quan đến sản phẩm, dịch vụ và quá trình giao dịch nhằm bảo vệ quyền lợi hợp pháp của các bên và nâng cao chất lượng phục vụ.`,
      },
      {
        type: "heading",
        text: `2. Phạm vi áp dụng`,
      },
      {
        type: "list",
        items: [
          `Sản phẩm do ${C.tradeName} cung cấp.`,
          `Dịch vụ tư vấn, khảo sát, giao hàng, lắp đặt.`,
          `Bảo hành, sửa chữa và hỗ trợ kỹ thuật.`,
          `Thanh toán, hóa đơn và các giao dịch qua website hoặc kênh chính thức.`,
        ],
      },
      {
        type: "heading",
        text: `3. Cách thức gửi khiếu nại`,
      },
      {
        type: "list",
        items: [
          `Điện thoại: ${C.phonesDisplay}`,
          `Email: ${C.email}`,
          `Website: ${C.websiteDisplay}`,
          `Địa chỉ: ${C.address}`,
        ],
      },
      {
        type: "paragraph",
        text: `Để xử lý thuận lợi, khách hàng nên cung cấp thông tin liên hệ, nội dung phản ánh và các tài liệu liên quan (nếu có).`,
      },
      {
        type: "heading",
        text: `4. Quy trình giải quyết`,
      },
      {
        type: "list",
        items: [
          `Tiếp nhận và xác minh thông tin.`,
          `Kiểm tra hồ sơ, chứng từ hoặc hiện trạng thực tế.`,
          `Trao đổi với khách hàng và các bên liên quan (nếu cần).`,
          `Đề xuất phương án xử lý phù hợp.`,
          `Thông báo kết quả đến khách hàng.`,
        ],
      },
      {
        type: "paragraph",
        text: `Đối với trường hợp cần làm việc với nhà sản xuất, đơn vị vận chuyển hoặc bảo hành, thời gian xử lý có thể kéo dài hơn. ${C.tradeName} sẽ chủ động cập nhật tiến độ.`,
      },
      {
        type: "heading",
        text: `5. Nguyên tắc và tranh chấp`,
      },
      {
        type: "paragraph",
        text: `Giải quyết khiếu nại dựa trên chứng từ giao dịch, chính sách đã công bố, thỏa thuận giữa các bên và pháp luật Việt Nam; ưu tiên hợp tác và thiện chí.`,
      },
      {
        type: "paragraph",
        text: `Nếu không tự thỏa thuận được, tranh chấp được giải quyết theo pháp luật Việt Nam tại cơ quan có thẩm quyền.`,
      },
      {
        type: "heading",
        text: `6. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay} và áp dụng đối với mọi giao dịch giữa ${C.tradeName} và khách hàng.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "bao-hanh",
    title: `Chính sách bảo hành`,
    shortTitle: `Chính sách bảo hành`,
    description: `Nguyên tắc, phạm vi và quy trình tiếp nhận bảo hành đối với sản phẩm do TA HOUSE cung cấp.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích`,
      },
      {
        type: "paragraph",
        text: `Chính sách bảo hành quy định nguyên tắc, phạm vi và quy trình tiếp nhận bảo hành đối với sản phẩm do ${C.legalName} cung cấp.`,
      },
      {
        type: "paragraph",
        text: `Khi phát sinh sự cố, ${C.tradeName} tiếp nhận thông tin, hướng dẫn xử lý ban đầu và phối hợp nhà sản xuất hoặc đơn vị bảo hành được ủy quyền theo chính sách từng sản phẩm.`,
      },
      {
        type: "heading",
        text: `2. Phạm vi và nguyên tắc`,
      },
      {
        type: "paragraph",
        text: `Áp dụng đối với khóa cửa thông minh, bếp từ/bếp điện, máy hút mùi, máy rửa chén, chậu – vòi bếp, phụ kiện nhà bếp, két sắt và các thiết bị nhà ở hiện đại do ${C.tradeName} phân phối.`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} cam kết hàng chính hãng. Bảo hành theo chính sách từng nhà sản xuất/nhà phân phối chính thức tại Việt Nam. Đối với khảo sát, lắp đặt do ${C.tradeName} thực hiện, công ty chịu trách nhiệm phần kỹ thuật lắp đặt theo thỏa thuận.`,
      },
      {
        type: "heading",
        text: `3. Thời hạn và điều kiện bảo hành`,
      },
      {
        type: "paragraph",
        text: `Thời hạn bảo hành xác định theo phiếu bảo hành, chính sách bảo hành điện tử của hãng, hóa đơn/chứng từ mua bán hoặc thông tin công bố theo từng sản phẩm.`,
      },
      {
        type: "list",
        items: [
          `Còn trong thời hạn bảo hành.`,
          `Lỗi kỹ thuật của sản phẩm.`,
          `Sử dụng đúng mục đích và đúng hướng dẫn.`,
          `Có thông tin mua hàng từ ${C.tradeName} hoặc chứng từ hợp lệ.`,
        ],
      },
      {
        type: "heading",
        text: `4. Trường hợp không thuộc phạm vi bảo hành`,
      },
      {
        type: "list",
        items: [
          `Hư hỏng do sử dụng không đúng hướng dẫn.`,
          `Rơi vỡ, va đập hoặc tác động ngoại lực.`,
          `Thiên tai, hỏa hoạn, ngập nước, sét đánh hoặc bất khả kháng.`,
          `Tự ý tháo lắp, sửa chữa hoặc thay đổi kết cấu khi chưa được chấp thuận.`,
          `Hao mòn tự nhiên trong quá trình sử dụng.`,
          `Các trường hợp khác theo quy định của nhà sản xuất.`,
        ],
      },
      {
        type: "heading",
        text: `5. Quy trình và chi phí`,
      },
      {
        type: "list",
        items: [
          `Bước 1: Liên hệ hotline hoặc email.`,
          `Bước 2: Cung cấp thông tin sản phẩm, lỗi và mua hàng.`,
          `Bước 3: ${C.tradeName} tiếp nhận, kiểm tra và hướng dẫn xử lý ban đầu.`,
          `Bước 4: Chuyển trung tâm bảo hành nhà sản xuất/đơn vị ủy quyền nếu cần.`,
          `Bước 5: Thông báo để khách hàng nhận lại sản phẩm hoặc sắp xếp hỗ trợ.`,
        ],
      },
      {
        type: "paragraph",
        text: `Trong phạm vi bảo hành: sửa chữa/thay thế theo chính sách nhà sản xuất. Ngoài phạm vi: nếu khách hàng muốn sửa chữa, ${C.tradeName} thông báo chi phí dự kiến trước khi thực hiện.`,
      },
      {
        type: "heading",
        text: `6. Hiệu lực áp dụng`,
      },
      {
        type: "paragraph",
        text: `Chính sách bảo hành này có hiệu lực kể từ ngày được đăng tải trên website ${C.websiteDisplay}.`,
      },
      ...contactBlock,
    ],
  },
  {
    slug: "quy-che-hoat-dong",
    title: `Quy chế hoạt động website`,
    shortTitle: `Quy chế hoạt động website`,
    description: `Quy chế hoạt động website bán hàng của thương nhân TA HOUSE – không phải sàn giao dịch TMĐT.`,
    sections: [
      {
        type: "heading",
        text: `1. Mục đích hoạt động`,
      },
      {
        type: "paragraph",
        text: `Website ${C.websiteDisplay} là kênh giới thiệu, tư vấn và cung cấp sản phẩm, dịch vụ của ${C.legalName}, giúp khách hàng tìm hiểu thông tin và liên hệ mua hàng, khảo sát, lắp đặt, bảo hành.`,
      },
      {
        type: "paragraph",
        text: `Website không phải là sàn giao dịch thương mại điện tử và không cho phép tổ chức, cá nhân khác mở gian hàng hoặc đăng bán sản phẩm.`,
      },
      {
        type: "heading",
        text: `2. Đối tượng phục vụ`,
      },
      {
        type: "list",
        items: [
          `Cá nhân có nhu cầu mua sản phẩm hoặc sử dụng dịch vụ của ${C.tradeName}.`,
          `Doanh nghiệp, tổ chức có nhu cầu hợp tác hoặc mua hàng.`,
          `Khách hàng cần tư vấn, khảo sát, lắp đặt hoặc bảo hành.`,
        ],
      },
      {
        type: "heading",
        text: `3. Quy trình giao dịch`,
      },
      {
        type: "list",
        items: [
          `Khách hàng tham khảo sản phẩm trên website.`,
          `Gửi yêu cầu tư vấn hoặc báo giá.`,
          `${C.tradeName} tiếp nhận và tư vấn.`,
          `Khảo sát thực tế (nếu cần).`,
          `Xác nhận sản phẩm, giá bán và các điều kiện giao dịch.`,
          `Thanh toán theo thỏa thuận.`,
          `Giao hàng, lắp đặt (nếu có).`,
          `Nghiệm thu và bảo hành theo chính sách của ${C.tradeName}.`,
        ],
      },
      {
        type: "heading",
        text: `4. Quyền và trách nhiệm`,
      },
      {
        type: "paragraph",
        text: `${C.tradeName} có trách nhiệm cung cấp thông tin trung thực; bảo vệ thông tin khách hàng theo Chính sách bảo mật; thực hiện đúng cam kết đã xác nhận; tiếp nhận và giải quyết phản ánh, khiếu nại.`,
      },
      {
        type: "paragraph",
        text: `Khách hàng có trách nhiệm cung cấp thông tin chính xác; kiểm tra sản phẩm và đơn hàng trước khi xác nhận; thanh toán theo thỏa thuận; phối hợp giao hàng, lắp đặt và bảo hành.`,
      },
      {
        type: "heading",
        text: `5. Bảo vệ thông tin và khiếu nại`,
      },
      {
        type: "paragraph",
        text: `Việc thu thập, sử dụng và bảo vệ dữ liệu cá nhân thực hiện theo Chính sách bảo mật thông tin. Mọi phản ánh hoặc khiếu nại được xử lý theo Chính sách giải quyết khiếu nại.`,
      },
      {
        type: "heading",
        text: `6. Các chính sách liên quan`,
      },
      {
        type: "list",
        items: [
          `Chính sách mua hàng.`,
          `Chính sách thanh toán.`,
          `Chính sách giao hàng.`,
          `Chính sách đổi trả và hoàn tiền.`,
          `Chính sách bảo hành.`,
          `Chính sách bảo mật thông tin.`,
          `Chính sách giải quyết khiếu nại.`,
          `Điều khoản và điều kiện sử dụng website.`,
        ],
      },
      {
        type: "heading",
        text: `7. Điều khoản áp dụng`,
      },
      {
        type: "paragraph",
        text: `Quy chế này được áp dụng đối với mọi tổ chức, cá nhân sử dụng website ${C.websiteDisplay} và có hiệu lực kể từ ngày được công bố trên website (phiên bản ${C.policyVersion}, ngày ${C.policyEffectiveDate}).`,
      },
      ...contactBlock,
    ],
  }
];

export const POLICY_BY_SLUG = Object.fromEntries(
  POLICY_DOCUMENTS.map((doc) => [doc.slug, doc]),
) as Record<string, PolicyDocument>;

export const POLICY_NAV_LINKS = POLICY_DOCUMENTS.map((doc) => ({
  href: `/chinh-sach/${doc.slug}`,
  label: doc.shortTitle,
}));
