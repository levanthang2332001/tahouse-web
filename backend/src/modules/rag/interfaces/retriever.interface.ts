import type { IChatMessage } from './llm-provider.interface';

export interface IRetriever {
  /**
   * Truy xuất thông tin ngữ cảnh liên quan đến câu hỏi của người dùng
   * @param query Câu hỏi hoặc từ khóa tìm kiếm của người dùng
   * @param limit Số lượng sản phẩm / tài liệu tối đa cần lấy
   * @param history Lịch sử trò chuyện trước đó để giải quyết câu hỏi ngữ cảnh (multi-turn follow-up)
   * @returns Chuỗi thông tin ngữ cảnh định dạng (ví dụ: Markdown) để nhét vào prompt
   */
  retrieve(
    query: string,
    limit?: number,
    history?: IChatMessage[],
    referer?: string,
  ): Promise<string>;
}
