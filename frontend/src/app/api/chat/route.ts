import { NextResponse } from "next/server";

// Dynamic Next.js API route that supports OpenAI/Gemini streams
export async function POST(req: Request) {
  try {
    const { messages, productContext } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages query list" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const apiKey = process.env.OPENAI_API_KEY;

    // Check if real OpenAI API is configured
    if (apiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `Bạn là Trợ lý ảo AI của hãng khóa thông minh cao cấp Kassler.
Hãy trả lời khách hàng lịch sự, chuyên nghiệp bằng Tiếng Việt. 
Dưới đây là thông tin các dòng sản phẩm của chúng tôi:
- KL-990 Gold: Đại sảnh tân cổ điển dát vàng 24K, FaceID 3D, Giá 28.5M - 32M VNĐ.
- KL-888 Black: Cửa gỗ hiện đại Gorilla Glass, Vân tay tay nắm, Giá 12.5M - 14.8M VNĐ.
- KL-660 Slim: Cửa nhôm Xingfa đố hẹp, chống nước IP66, Wifi Tuya, Giá 6.2M - 7.5M VNĐ.
- KL-550 Glass: Cửa kính văn phòng kẹp cơ học không khoan kính, Chấm công Excel, Giá 5.5M - 6.8M VNĐ.
- KL-400 Gate: Cửa cổng ngoài trời thép Inox 304 nguyên khối, chống nước IP67, Giá 7M - 8.2M VNĐ.
- KL-300 Hotel: Khóa thẻ từ khách sạn RFID Mifare 13.56MHz.
- KS-100 Safe: Két sắt thông minh thép dày 10 ly chống cháy 1200 độ C, Giá 18.5M - 22M VNĐ.
Hãy sử dụng ngữ cảnh sản phẩm: ${productContext ? JSON.stringify(productContext) : "Không có"} để giải đáp nếu khách hàng hỏi.`
            },
            ...messages.map((m: any) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text
            }))
          ],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error("OpenAI API response error");
      }

      // Return the OpenAI stream response to the client
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // Default Fallback Mock Response (Pre-configured for frontend offline showcase)
    return NextResponse.json({
      text: "Xin chào! Đây là phản hồi mô phỏng từ máy chủ Kassler API. Để kích hoạt trả lời AI GPT-4 thời gian thực, vui lòng cấu hình biến môi trường OPENAI_API_KEY trong tệp cấu hình của bạn."
    });

  } catch (error: any) {
    console.error("Chatbot API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
