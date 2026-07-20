import { resolveMediaUrl } from '@/common/utils/url.util';

/**
 * Định dạng danh sách sản phẩm tìm được thành chuỗi Markdown Context làm ngữ cảnh cho LLM.
 * @param products Danh sách sản phẩm thô từ retriever
 */
export function formatProductContext(
  products: any[],
  imageBaseUrl = '',
): string {
  if (!products || products.length === 0) {
    return '';
  }

  let context = 'DƯỚI ĐÂY LÀ DANH SÁCH SẢN PHẨM PHÙ HỢP:\n\n';
  products.forEach((p, index) => {
    context += `[Sản phẩm ${index + 1}]\n`;
    context += `- ID: ${p.id}\n`;
    context += `- Mã sản phẩm (Code): ${p.code}\n`;
    context += `- Tên sản phẩm: ${p.name}\n`;
    context += `- Thương hiệu: ${p.brand}\n`;
    context += `- Danh mục: ${p.categoryName}\n`;
    context += `- Giá bán: ${p.priceRange || 'Liên hệ'}\n`;
    context += `- Thời gian bảo hành: ${p.warrantyText || 'Theo tiêu chuẩn'}\n`;
    if (p.imageUrl) {
      const imgUrl = resolveMediaUrl(p.imageUrl, imageBaseUrl);
      context += `- Đường dẫn ảnh đại diện sản phẩm (Image URL): ${imgUrl}\n`;
    }
    if (p.colors && p.colors.length > 0) {
      context += `- Màu sắc: ${p.colors.join(', ')}\n`;
    }
    if (p.features && p.features.length > 0) {
      context += `- Các tính năng nổi bật:\n`;
      p.features.forEach((f: string) => {
        context += `  * ${f}\n`;
      });
    }
    if (p.specs && typeof p.specs === 'object') {
      context += `- Thông số kỹ thuật:\n`;
      Object.entries(p.specs).forEach(([k, v]) => {
        context += `  * ${k}: ${String(v)}\n`;
      });
    }
    if (p.description) {
      context += `- Mô tả chi tiết: ${p.description}\n`;
    }
    if (p.installation && typeof p.installation === 'object') {
      const instImages = Array.isArray(p.installation.images)
        ? p.installation.images
        : [];
      const instVideos = Array.isArray(p.installation.videos)
        ? p.installation.videos
        : [];
      if (instImages.length > 0 || instVideos.length > 0) {
        context += `- Dữ liệu thực tế từ công trình lắp đặt:\n`;
        if (instImages.length > 0) {
          context += `  * Ảnh thực tế (Installation Images):\n`;
          instImages.forEach((img: string) => {
            context += `    - ${resolveMediaUrl(img, imageBaseUrl)}\n`;
          });
        }
        if (instVideos.length > 0) {
          context += `  * Video thực tế (Installation Videos):\n`;
          instVideos.forEach((vid: string) => {
            context += `    - ${resolveMediaUrl(vid, imageBaseUrl)}\n`;
          });
        }
      }
    }
    context += '\n';
  });

  return context;
}
