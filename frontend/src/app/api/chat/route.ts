import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";

export async function POST(req: Request) {
  try {
    const { messages, productContext } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages query list" }, { status: 400 });
    }

    const lastMessageObj = messages[messages.length - 1];
    const lastUserMessage = lastMessageObj.text || lastMessageObj.content || "";

    if (!lastUserMessage.trim()) {
      return NextResponse.json({ error: "Empty query text" }, { status: 400 });
    }

    // Get API Key for Google Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let replyText = "";
    
    const systemPrompt = `Bạn là Trợ lý ảo AI của thương hiệu thiết bị nhà bếp và khóa cửa thông minh cao cấp TA HOUSE (Tên bạn là TA HOUSE AI).
Hãy trả lời khách hàng cực kỳ lịch sự, chuyên nghiệp, ấm áp và tận tâm bằng Tiếng Việt.
Tông giọng của bạn là một chuyên viên tư vấn kỹ thuật và giải pháp kiến trúc nội thất tinh tế.
Dưới đây là thông tin các dòng sản phẩm của chúng tôi để tư vấn chính xác:
- Khóa Thông Minh FaceID 3D TA-9800 PREMIUM: Phân khúc Luxury, nhận diện khuôn mặt FaceID 3D quét hồng ngoại, camera chuông hình LCD sắc nét bên trong, App Wifi Tuya điều khiển từ xa, pin sạc Lithium 5000mAh, giá 18.5M VNĐ, bảo hành 36 tháng.
- Khóa Cửa Gỗ Vân Tay TA-8500 SLIM: Dáng Slim mỏng hiện đại tinh tế, tay kéo đẩy Push-Pull tiện dụng tự động chốt khóa, vân tay FPC Thụy Điển tích hợp trên tay cầm, giá 9.2M VNĐ, bảo hành 24 tháng.
- Bếp Từ Đa Điểm Bosch PXX975DC1E: Nhập khẩu Đức nguyên khối, mặt kính Schott Ceran chịu nhiệt 750 độ C, vùng nấu FlexInduction tự động kết hợp xoong nồi đa điểm, cảm biến chiên xào ngăn cháy xém FryingSensor, giá 32.5M VNĐ, bảo hành 24 tháng.
- Lò Nướng Đối Lưu Malloca MOV-72ED: Âm tủ kính đen viền thép không gỉ thời thượng, dung tích 72L, 9 chương trình nướng quạt đối lưu 3D, tự làm sạch bằng hơi nước thủy phân Hydroclean, giá 16.9M VNĐ, bảo hành 36 tháng.
- Chậu Rửa Bát Đá Granite Konox Luxury Sink: Nhập Ý, bột đá thạch anh tự nhiên công nghệ Keratek Plus chống xước chịu nhiệt 340 độ C, kháng khuẩn BioShield 99.9%, sâu 220mm, giá 11.95M VNĐ, bảo hành 60 tháng (5 năm).
- Máy Lọc Nước R.O A.O. Smith RO-M2: Công nghệ màng lọc RO-Side Stream độc quyền USA tăng thọ lõi 3 năm, vòi nước thông minh hiển thị TDS/tuổi thọ lõi, lắp âm tủ không bình chứa siêu gọn, giá 14.2M VNĐ, bảo hành 12 tháng.
- Giá Kho Gia Vị Âm Tủ Hafele Spice 400: Inox 304 điện hóa bóng gương chống han rỉ rỉ sét, tích hợp ray trượt giảm chấn SoftClose Hafele kéo mở 50,000 lần chịu tải 35kg, giá 5.4M VNĐ, bảo hành 24 tháng.
- Hệ Thống Smart Home Hub TA-Core IoT: Màn hình cảm ứng IPS HD 4.0 inch lắp âm tường, khung viền nhôm phay CNC cao cấp, điều khiển giọng nói qua Google Assistant/Siri, kết nối Zigbee 3.0 điều khiển liên thông đèn, rèm, bếp, khóa tự động hóa kịch bản, giá 6.8M VNĐ, bảo hành 24 tháng.

Hãy sử dụng ngữ cảnh sản phẩm hiện tại của khách hàng: ${productContext ? JSON.stringify(productContext) : "Không có"} để tư vấn trực diện nếu họ đang ở trang chi tiết sản phẩm.
Lưu ý: KHÔNG cho phép thanh toán hoặc đặt mua trực tiếp trên website. Khách hàng quan tâm hãy hướng dẫn họ:
1. Đăng ký khảo sát lắp đặt tận nhà MIỄN PHÍ tại Hà Nội, Đà Nẵng, TP.HCM qua biểu mẫu trang Liên hệ (/contact).
2. Gọi điện trực tiếp hotline 1900 8899.
3. Nhắn tin trực tiếp qua Zalo nổi ở góc dưới.`;

    if (apiKey) {
      try {
        // Structure chat history for Gemini API
        // Gemini expects format: { contents: [ { role: "user"|"model", parts: [ { text: "..." } ] } ] }
        const contents = [];
        
        // Add previous messages (excluding welcome messages)
        for (const msg of messages) {
          const msgId = msg.id || "";
          if (msgId === "welcome" || msgId.startsWith("welcome-")) continue;
          
          const textVal = msg.text || msg.content || "";
          if (!textVal.trim()) continue;

          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: textVal }]
          });
        }

        // If contents is empty, add the last user message
        if (contents.length === 0) {
          contents.push({
            role: "user",
            parts: [{ text: lastUserMessage }]
          });
        }

        // Call Google Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          const errText = await response.text();
          console.error("Gemini API error response status:", response.status, errText);
        }
      } catch (geminiError) {
        console.error("Gemini Direct Connection Failed, switching to local parser fallback:", geminiError);
      }
    }

    // Offline High-End Smart TA HOUSE Chatbot Parser fallback if no API key is present or connection fails
    if (!replyText) {
      const q = lastUserMessage.toLowerCase();
      
      if (q.includes("so sánh") || q.includes("khác gì") || q.includes("vs")) {
        const matched = PRODUCTS.filter(p => q.includes(p.code.toLowerCase().split(" ")[0]) || q.includes(p.id.toLowerCase().split("-")[1]));
        if (matched.length >= 2) {
          const [p1, p2] = matched;
          replyText = `Dưới đây là so sánh chi tiết giữa **${p1.name} (${p1.code})** và **${p2.name} (${p2.code})**:\n\n1. **Chất liệu**: \n   - *${p1.code}*: ${p1.specifications.material}\n   - *${p2.code}*: ${p2.specifications.material}\n\n2. **Công nghệ chính**:\n   - *${p1.code}*: ${p1.technologies.join(", ")}\n   - *${p2.code}*: ${p2.technologies.join(", ")}\n\n3. **Thời gian bảo hành**:\n   - *${p1.code}*: ${p1.warranty} tháng\n   - *${p2.code}*: ${p2.warranty} tháng\n\n4. **Giá thành**:\n   - *${p1.code}*: ${p1.priceRange}\n   - *${p2.code}*: ${p2.priceRange}\n\nCả hai sản phẩm đều mang đậm chất lượng cao cấp của **TA HOUSE**. Nếu quý khách cần tư vấn lắp đặt thực tế cho cửa hoặc gian bếp nhà mình, hãy nhấn chat Zalo hoặc để lại thông tin khảo sát ở trang Liên hệ nhé!`;
        } else {
          replyText = `Chào bạn! **TA HOUSE** cung cấp các sản phẩm thiết bị nhà bếp thông minh và khóa cửa từ cao cấp như bếp từ đa điểm Bosch Đức, lò nướng đối lưu Malloca, chậu rửa bát Konox từ Ý, máy lọc nước AO Smith Mỹ và khóa vân tay FaceID 3D TA-9800.\n\nĐể so sánh, bạn vui lòng nhập mã sản phẩm cụ thể (ví dụ: "So sánh khóa TA-9800 với TA-8500" hoặc "Bếp Bosch có gì khác biệt?") nhé!`;
        }
      } else if (q.includes("khóa") || q.includes("khoa") || q.includes("cửa") || q.includes("cua")) {
        replyText = `**TA HOUSE** hiện đang phân phối 2 dòng khóa thông minh cao cấp hàng đầu:\n\n1. **TA-9800 PREMIUM** (Khóa FaceID 3D Luxury): Tích hợp camera hồng ngoại quét mặt 3D siêu tốc ban đêm, chuông hình LCD sắc nét bên trong, App Wifi Tuya điều khiển từ xa. Phù hợp cho cửa gỗ đại sảnh biệt thự và chung cư cao cấp. Giá bán: **18.500.000 VNĐ** (Bảo hành 36 tháng).\n\n2. **TA-8500 SLIM** (Khóa vân tay Push-Pull): Thiết kế thanh mảnh, thon gọn hiện đại, cảm biến vân tay FPC Thụy Điển trên tay cầm tiện lợi, tự động chốt khóa an toàn. Phù hợp cho cửa gỗ phòng ngủ, chung cư dáng thanh lịch. Giá bán: **9.200.000 VNĐ** (Bảo hành 24 tháng).\n\nCả hai sản phẩm đều được hỗ trợ **khảo sát & lắp đặt miễn phí tại nhà**! Bạn đang quan tâm mẫu nào hoặc loại cửa nhà mình dày bao nhiêu?`;
      } else if (q.includes("bếp") || q.includes("bep") || q.includes("nấu") || q.includes("nau")) {
        replyText = `Hệ sinh thái nhà bếp cao cấp tại **TA HOUSE** nổi bật với các sản phẩm nhập khẩu thượng hạng:\n\n1. **Bếp Từ Đa Điểm Bosch PXX975DC1E**: Vùng nấu FlexInduction tự động ghép nối linh hoạt cho nồi chảo cỡ lớn, mặt kính Schott Ceran chịu nhiệt 750 độ C, cảm biến chiên xào FryingSensor. Giá: **32.500.000 VNĐ**.\n\n2. **Lò Nướng Đối Lưu Malloca MOV-72ED**: Dung tích lớn 72 lít nướng đối lưu 3D chín đều hoàn hảo, 9 chế độ gia nhiệt, tự làm sạch bằng hơi nước thủy phân Hydroclean cực nhàn hạ. Giá: **16.900.000 VNĐ**.\n\n3. **Chậu Rửa Bát Đá Granite Konox**: Nhập khẩu từ Ý, bột đá thạch anh tự nhiên công nghệ Keratek Plus chống trầy xước, chịu sốc nhiệt 340 độ C, bảo hành đến 5 năm. Giá: **11.950.000 VNĐ**.\n\nQuý khách muốn xem chi tiết thông số hoặc đăng ký khảo sát lắp âm tủ bếp tận nhà miễn phí?`;
      } else if (q.includes("lọc nước") || q.includes("loc nuoc") || q.includes("smith")) {
        replyText = `**Máy Lọc Nước R.O A.O. Smith RO-M2** tại **TA HOUSE** là tuyệt phẩm lọc nước tinh khiết hàng đầu của Mỹ:\n- Công nghệ màng lọc RO-Side Stream độc quyền nâng cao tỷ lệ nước tinh khiết thu hồi 1:1, kéo dài tuổi thọ lõi lọc lên 3 năm.\n- Thiết kế không bình chứa vô cùng nhỏ gọn, lắp đặt đặt gọn âm tủ bếp tối giản.\n- Vòi nước điện tử thông minh tích hợp màn hình hiển thị trực tiếp chất lượng nước TDS và tuổi thọ lõi để bạn hoàn toàn an tâm khi uống trực tiếp tại vòi.\n- Giá tham khảo: **14.200.000 VNĐ**.\n\nSản phẩm này rất được ưa chuộng kết hợp cùng chậu rửa đá Granite Konox!`;
      } else if (q.includes("bảo hành") || q.includes("bao hanh")) {
        replyText = `Chính sách bảo hành tại **TA HOUSE** được cam kết uy tín tuyệt đối:\n- Khóa FaceID TA-9800 và Lò nướng Malloca: Bảo hành **36 tháng** chính hãng.\n- Bếp từ Bosch, Khóa vân tay TA-8500, Giá gia vị Hafele, Nhà thông minh TA-Core: Bảo hành **24 tháng**.\n- Chậu rửa bát đá Granite Konox: Bảo hành lên tới **60 tháng (5 năm)**.\n- Máy lọc nước A.O. Smith: Bảo hành **12 tháng**.\n- Tất cả sản phẩm đều được kích hoạt bảo hành điện tử ngay sau khi kỹ sư bàn giao lắp đặt hoàn thiện!`;
      } else if (q.includes("giá") || q.includes("bao nhiêu") || q.includes("gia")) {
        if (productContext) {
          replyText = `Sản phẩm **${productContext.name}** mà quý khách đang xem có giá bán khảo sát trọn gói là **${productContext.priceRange}** (đã bao gồm nhân công lắp đặt trực tiếp bởi kỹ sư TA HOUSE và bảo hành chính hãng ${productContext.warrantyText}).\n\nNếu quý khách thi công trọn gói cả hệ bếp hoặc đặt số lượng lớn, TA HOUSE luôn có chính sách chiết khấu cực kỳ ưu đãi. Quý khách vui lòng nhấn Gọi điện hotline hoặc chat Zalo để nhận báo giá chiết khấu đặc biệt nhé!`;
        } else {
          replyText = `Các dòng sản phẩm tại **TA HOUSE** được phân phối chính hãng trọn gói dao động từ **5.400.000 VNĐ** (phụ kiện Hafele) đến **32.500.000 VNĐ** (Bếp từ đa điểm Bosch Đức).\n\nMức giá của chúng tôi luôn bao gồm dịch vụ kỹ sư lắp đặt trực tiếp tại nhà, bảo hành chính hãng dài hạn. Bạn có thể xem chi tiết ở mục "Sản phẩm" hoặc để lại số điện thoại để chúng tôi gửi bảng báo giá chiết khấu thiết kế tốt nhất!`;
        }
      } else {
        if (productContext) {
          replyText = `Chào bạn! Tôi là trợ lý ảo TA HOUSE AI. Tôi thấy bạn đang tìm hiểu sản phẩm **${productContext.name} (${productContext.code})** thuộc danh mục *${productContext.categoryName}*.\n\nSản phẩm này nổi bật với: *${productContext.features.slice(0, 2).join(", ")}*.\n\nBạn cần tôi giải thích thêm về thông số kích thước, hướng dẫn kỹ thuật lắp đặt, hay hỗ trợ đặt lịch kỹ sư khảo sát vị trí lắp tại nhà hoàn toàn miễn phí?`;
        } else {
          replyText = `Xin chào! Tôi là Trợ lý ảo AI của thương hiệu **TA HOUSE**. \n\nTên tôi là **TA HOUSE AI**. Tôi là chuyên viên tư vấn các giải pháp thiết bị nhà bếp thông minh và khóa cửa điện tử cao cấp nhập khẩu.\n\nTôi có thể giới thiệu các dòng khóa FaceID biệt thự, bếp từ đa điểm Bosch Đức, máy lọc nước A.O. Smith Mỹ, hoặc thiết lập kịch bản nhà thông minh TA-Core IoT. \n\nHôm nay tôi có thể hỗ trợ gì cho thiết kế căn nhà của quý khách?`;
        }
      }
    }

    // Auto-detect and match suggested products from the reply text
    const suggestedProducts: typeof PRODUCTS = [];
    const lowerReply = replyText.toLowerCase();
    
    for (const prod of PRODUCTS) {
      // Get the first word of the model code, e.g. "TA-9800" or "BOSCH"
      const matchWord = prod.code.split(" ")[0].toLowerCase();
      // Or search using the brand names / codes like "ta-8500", "konox", "hafele", "malloca", "a.o. smith", "smith", "ta-core"
      if (lowerReply.includes(matchWord) || lowerReply.includes(prod.id.toLowerCase()) || 
          (prod.id === "ta-smith-purifier" && lowerReply.includes("ao smith")) ||
          (prod.id === "ta-hafele-spice" && lowerReply.includes("hafele")) ||
          (prod.id === "ta-konox-granite" && lowerReply.includes("konox")) ||
          (prod.id === "ta-malloca-oven" && lowerReply.includes("malloca")) ||
          (prod.id === "ta-bosch-pxx" && lowerReply.includes("bosch"))) {
        if (!suggestedProducts.some(p => p.id === prod.id)) {
          suggestedProducts.push(prod);
        }
      }
    }

    // Limit to 3 suggested products max
    const finalSuggested = suggestedProducts.slice(0, 3);

    return NextResponse.json({
      text: replyText,
      products: finalSuggested.length > 0 ? finalSuggested : undefined
    });

  } catch (error: unknown) {
    console.error("Chatbot API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
