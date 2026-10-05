export interface IRetriever {
  /**
   * Truy xuất thông tin ngữ cảnh liên quan đến câu hỏi của người dùng
   * @param query Câu hỏi hoặc từ khóa tìm kiếm của người dùng
   * @param limit Số lượng sản phẩm / tài liệu tối đa cần lấy
   * @returns Chuỗi thông tin ngữ cảnh định dạng (ví dụ: Markdown) để nhét vào prompt
   */
  retrieve(query: string, limit?: number): Promise<string>;
}
