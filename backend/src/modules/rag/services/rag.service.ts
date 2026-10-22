import { Inject, Injectable } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type {
  ILlmProvider,
  IChatMessage,
} from '../interfaces/llm-provider.interface';
import type { IRetriever } from '../interfaces/retriever.interface';
import { buildSystemPrompt } from '../prompts';

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
  streamChat(
    message: string,
    history: IChatMessage[],
    location?: string,
    referer?: string,
  ): Observable<string> {
    const validHistory = (history || []).filter(
      (h) => h && typeof h.content === 'string' && h.content.trim().length > 0,
    );

    // Session Quota: Nếu đã trao đổi từ 8 tin nhắn trở lên, điều hướng khách sang Zalo tư vấn thật để tiết kiệm API
    if (validHistory.length >= 8) {
      const zaloPhone = process.env.ZALO_PHONE_NUMBER || '0938824479';
      const zaloLink = process.env.ZALO_LINK || `https://zalo.me/${zaloPhone}`;
      return of(
        `Cảm ơn bạn đã quan tâm đến TA House! Để nhận được tư vấn chi tiết về đố cửa và báo giá ưu đãi nhất, bạn vui lòng bấm kết nối trực tiếp với chuyên viên qua Zalo [${zaloPhone}](${zaloLink}) nhé!`,
      );
    }

    return from(
      this.retriever.retrieve(message, 4, validHistory, referer),
    ).pipe(
      mergeMap((context) => {
        const systemPrompt = buildSystemPrompt(context, location);
        return this.llmProvider.streamChat(systemPrompt, message, validHistory);
      }),
    );
  }
}
