import { Inject, Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
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
  ): Observable<string> {
    return from(this.retriever.retrieve(message, 4)).pipe(
      mergeMap((context) => {
        const systemPrompt = buildSystemPrompt(context, location);
        return this.llmProvider.streamChat(systemPrompt, message, history);
      }),
    );
  }
}
