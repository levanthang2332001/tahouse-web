import { COMPANY_LEGAL as C } from "./company-legal";
import type { PolicyBlock } from "@/lib/policy-types";

export type SitePage = {
  title: string;
  description: string;
  sections: PolicyBlock[];
};

/** Trang Giới thiệu – theo nội dung hồ sơ TA HOUSE */
export const ABOUT_PAGE: SitePage = {
  title: "Giới thiệu TA HOUSE",
  description:
    "Đơn vị tư vấn, cung cấp và lắp đặt các giải pháp nhà ở hiện đại: khóa thông minh, két sắt, thiết bị bếp và phụ kiện tủ bếp chính hãng.",
  sections: [
    { type: "heading", text: "Chúng tôi tin rằng…" },
    {
      type: "paragraph",
      text: "Một sản phẩm tốt chưa chắc là sản phẩm phù hợp.",
    },
    {
      type: "paragraph",
      text: "Một chiếc khóa hiện đại sẽ không phát huy hết giá trị nếu không phù hợp với bộ cửa. Một thiết bị bếp cao cấp cũng chưa chắc mang lại trải nghiệm tốt nếu không phù hợp với không gian bếp và nhu cầu sử dụng của gia đình.",
    },
    {
      type: "paragraph",
      text: `Vì vậy, điều ${C.tradeName} luôn quan tâm trước tiên không phải là bán được một sản phẩm, mà là giúp khách hàng lựa chọn đúng giải pháp.`,
    },
    { type: "heading", text: "TA HOUSE là ai?" },
    {
      type: "paragraph",
      text: `${C.legalName} là đơn vị tư vấn, cung cấp và lắp đặt các giải pháp nhà ở hiện đại, bao gồm:`,
    },
    {
      type: "list",
      items: [
        "Khóa cửa thông minh.",
        "Két sắt.",
        "Thiết bị bếp.",
        "Chậu rửa, vòi bếp.",
        "Máy hút mùi.",
        "Máy rửa chén.",
        "Phụ kiện tủ bếp.",
        "Các thiết bị và phụ kiện phục vụ không gian sống.",
      ],
    },
    {
      type: "paragraph",
      text: "Chúng tôi đồng hành cùng khách hàng từ khâu tư vấn, khảo sát, lựa chọn sản phẩm đến lắp đặt và bảo hành sau bán hàng.",
    },
    { type: "heading", text: "Cách TA HOUSE làm việc" },
    {
      type: "paragraph",
      text: "Mỗi ngôi nhà đều có thiết kế, nhu cầu sử dụng và ngân sách khác nhau. Thay vì giới thiệu một sản phẩm giống nhau cho tất cả khách hàng, TA HOUSE luôn ưu tiên:",
    },
    {
      type: "list",
      items: [
        "Lắng nghe nhu cầu thực tế.",
        "Khảo sát hiện trạng khi cần.",
        "Tư vấn giải pháp phù hợp.",
        "Minh bạch về chi phí.",
        "Hỗ trợ kỹ thuật và bảo hành sau bán hàng.",
      ],
    },
    {
      type: "paragraph",
      text: "Chúng tôi tin rằng một giải pháp phù hợp sẽ mang lại giá trị lâu dài hơn một sản phẩm đắt tiền.",
    },
    { type: "heading", text: "Cam kết của chúng tôi" },
    {
      type: "list",
      items: [
        "Cung cấp sản phẩm chính hãng.",
        "Tư vấn trung thực, rõ ràng.",
        "Báo giá minh bạch.",
        "Lắp đặt đúng kỹ thuật.",
        "Thực hiện bảo hành theo quy định của nhà sản xuất.",
        "Đồng hành và hỗ trợ khách hàng trong suốt quá trình sử dụng sản phẩm.",
      ],
    },
    { type: "heading", text: "Thông tin doanh nghiệp" },
    {
      type: "list",
      items: [
        `${C.legalName}`,
        `Mã số thuế: ${C.taxCode}`,
        `Địa chỉ: ${C.address}`,
        `Hotline: ${C.phonesDisplay}`,
        `Email: ${C.email}`,
        `Website: ${C.websiteDisplay}`,
      ],
    },
  ],
};

/** Trang Hướng dẫn đặt hàng – theo nội dung hồ sơ TA HOUSE */
export const ORDER_GUIDE_PAGE: SitePage = {
  title: "Hướng dẫn đặt hàng",
  description:
    "Các bước đặt hàng, tư vấn, thanh toán, giao hàng và bảo hành tại TA HOUSE để Quý khách mua sắm thuận tiện nhất.",
  sections: [
    { type: "heading", text: "1. Chọn sản phẩm hoặc dịch vụ" },
    {
      type: "paragraph",
      text: `Khách hàng tham khảo thông tin sản phẩm, dịch vụ trên website ${C.websiteDisplay} hoặc liên hệ trực tiếp với ${C.tradeName} để được tư vấn.`,
    },
    { type: "heading", text: "2. Gửi yêu cầu" },
    { type: "paragraph", text: "Khách hàng có thể gửi yêu cầu qua:" },
    {
      type: "list",
      items: [
        `Hotline: ${C.phonesDisplay}`,
        `Email: ${C.email}`,
        "Biểu mẫu liên hệ trên website.",
        `Các kênh liên hệ chính thức của ${C.tradeName} (Zalo, Facebook).`,
      ],
    },
    { type: "heading", text: "3. Tư vấn và báo giá" },
    {
      type: "paragraph",
      text: `Sau khi tiếp nhận thông tin, ${C.tradeName} sẽ:`,
    },
    {
      type: "list",
      items: [
        "Tư vấn sản phẩm phù hợp.",
        "Khảo sát hiện trạng (nếu cần).",
        "Gửi báo giá và thông tin về giao hàng, lắp đặt, thanh toán, bảo hành.",
      ],
    },
    { type: "heading", text: "4. Xác nhận đơn hàng" },
    {
      type: "paragraph",
      text: "Đơn hàng được xác nhận khi hai bên thống nhất các nội dung chính như:",
    },
    {
      type: "list",
      items: [
        "Sản phẩm hoặc dịch vụ.",
        "Số lượng.",
        "Giá bán.",
        "Phương thức thanh toán.",
        "Địa điểm giao hàng hoặc lắp đặt.",
        "Thời gian thực hiện.",
      ],
    },
    { type: "heading", text: "5. Thanh toán" },
    {
      type: "paragraph",
      text: "Khách hàng thực hiện thanh toán theo phương thức đã thỏa thuận. Thông tin chi tiết được quy định tại Chính sách thanh toán của TA HOUSE.",
    },
    { type: "heading", text: "6. Giao hàng và lắp đặt" },
    {
      type: "paragraph",
      text: `${C.tradeName} tiến hành giao hàng và lắp đặt (nếu có) theo nội dung đã xác nhận với khách hàng. Đối với các sản phẩm cần yêu cầu kỹ thuật, việc lắp đặt sẽ được thực hiện sau khi khảo sát hoặc kiểm tra điều kiện thực tế.`,
    },
    { type: "heading", text: "7. Nghiệm thu và bảo hành" },
    {
      type: "paragraph",
      text: "Sau khi hoàn thành giao hàng hoặc lắp đặt, khách hàng kiểm tra sản phẩm và xác nhận tình trạng sử dụng. Các sản phẩm đủ điều kiện sẽ được áp dụng chính sách bảo hành theo quy định của nhà sản xuất và Chính sách bảo hành của TA HOUSE.",
    },
    { type: "heading", text: "8. Hỗ trợ sau bán hàng" },
    {
      type: "paragraph",
      text: `Trong quá trình sử dụng, nếu cần hỗ trợ kỹ thuật, bảo hành hoặc giải đáp thông tin, khách hàng có thể liên hệ với ${C.tradeName} qua các kênh liên hệ chính thức để được hỗ trợ.`,
    },
    { type: "heading", text: "Thông tin liên hệ" },
    {
      type: "list",
      items: [
        `${C.legalName}`,
        `Địa chỉ: ${C.address}`,
        `Hotline: ${C.phonesDisplay}`,
        `Email: ${C.email}`,
        `Website: ${C.websiteDisplay}`,
      ],
    },
  ],
};
