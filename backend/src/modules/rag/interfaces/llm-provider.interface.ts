import { Observable } from 'rxjs';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ILlmProvider {
  /**
   * Gọi LLM để sinh câu trả lời dạng stream (RxJS Observable)
   * @param systemPrompt Chỉ dẫn hệ thống (System Prompt)
   * @param message Tin nhắn hiện tại của người dùng
   * @param history Lịch sử trò chuyện trước đó
   */
  streamChat(
    systemPrompt: string,
    message: string,
    history: IChatMessage[],
  ): Observable<string>;
}
