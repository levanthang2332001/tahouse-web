/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu để hỗ trợ tìm kiếm không phân biệt dấu.
 * @param {string} str - Chuỗi tiếng Việt cần loại bỏ dấu.
 * @returns {string} Chuỗi tiếng Việt đã được loại bỏ dấu.
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
