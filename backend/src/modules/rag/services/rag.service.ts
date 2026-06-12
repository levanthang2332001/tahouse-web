import { Inject, Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type {
  ILlmProvider,
  IChatMessage,
} from '../interfaces/llm-provider.interface';
import type { IRetriever } from '../interfaces/retriever.interface';

@Injectable()
export class RagService {
  constructor(
    @Inject('ILlmProvider') private readonly llmProvider: ILlmProvider,
    @Inject('IRetriever') private readonly retriever: IRetriever,
  ) {}

  /**
   * Điều phối quy trình RAG: Tìm kiếm sản phẩm -> Lắp Prompt -> Gọi LLM Stream
   * @param message Tin nhắn mới nhất của người dùng
   * @param history Lịch sử trò chuyện trước đó
   */
  streamChat(message: string, history: IChatMessage[]): Observable<string> {
    // Sử dụng RxJS from và mergeMap để chuyển Promise từ retrieve() thành Observable stream tin nhắn của LLM
    return from(this.retriever.retrieve(message, 4)).pipe(
      mergeMap((context) => {
        const systemPrompt = this.buildSystemPrompt(context);
        return this.llmProvider.streamChat(systemPrompt, message, history);
      }),
    );
  }

  private buildSystemPrompt(context: string): string {
    const contextContent = context
      ? context
      : 'Không tìm thấy sản phẩm nào khớp chính xác với từ khóa của bạn.';

    return `Bạn là trợ lý ảo tư vấn sản phẩm thông minh của showroom TA House.
Nhiệm vụ của bạn là hỗ trợ, tư vấn và giải đáp thắc mắc của khách hàng về khóa cửa thông minh (Kassler, Philips, Hubert,...) và các thiết bị nhà bếp cao cấp (Bosch, Malloca,...).

Dưới đây là thông tin sản phẩm thực tế có sẵn tại TA House liên quan đến câu hỏi của khách hàng:
==================================
${contextContent}
==================================

QUY TẮC TƯ VẤN:
1. Bạn CHỈ được phép tư vấn thông tin dựa trên dữ liệu sản phẩm thực tế được cung cấp ở trên. Tuyệt đối KHÔNG tự bịa ra thông số kỹ thuật, giá bán, hoặc màu sắc không có trong dữ liệu.
2. Nếu dữ liệu sản phẩm trống hoặc không tìm thấy sản phẩm phù hợp, hãy trả lời lịch sự rằng sản phẩm này hiện tại TA House chưa có thông tin chi tiết và giới thiệu khách hàng tham khảo một vài sản phẩm tương tự có sẵn trong dữ liệu trên.
3. Luôn trả lời bằng tiếng Việt lịch sự, chuyên nghiệp và thân thiện. Xưng hô là "TA House" hoặc "Em" và gọi khách hàng là "Anh/Chị".
4. Trình bày câu trả lời trực quan, khoa học, sử dụng bullet points để liệt kê các thông số kỹ thuật hoặc tính năng nổi bật của sản phẩm.
5. Luôn báo đúng giá niêm yết trong dữ liệu kèm theo đơn vị VNĐ. Nếu sản phẩm có nhiều biến thể với giá khác nhau, hãy nêu rõ các mức giá của từng biến thể cho khách hàng lựa chọn.`;
  }
}
