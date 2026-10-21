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
    const colors = Array.isArray(p.colors)
      ? p.colors
      : typeof p.colors === 'string'
        ? (() => {
            try {
              return JSON.parse(p.colors);
            } catch {
              return [p.colors];
            }
          })()
        : [];

    const features = Array.isArray(p.features)
      ? p.features
      : typeof p.features === 'string'
        ? (() => {
            try {
              return JSON.parse(p.features);
            } catch {
              return [p.features];
            }
          })()
        : [];

    const specs =
      typeof p.specs === 'object' && p.specs !== null
        ? p.specs
        : typeof p.specs === 'string'
          ? (() => {
              try {
                return JSON.parse(p.specs);
              } catch {
                return {};
              }
            })()
          : {};

    const installation =
      typeof p.installation === 'object' && p.installation !== null
        ? p.installation
        : typeof p.installation === 'string'
          ? (() => {
              try {
                return JSON.parse(p.installation);
              } catch {
                return { images: [], videos: [] };
              }
            })()
          : { images: [], videos: [] };

    context += `[Sản phẩm ${index + 1}]\n`;
    context += `- ID: ${p.id}\n`;
    context += `- Mã sản phẩm (Code): ${p.code}\n`;
    context += `- Tên sản phẩm: ${p.name}\n`;
    context += `- Thương hiệu: ${p.brand || ''}\n`;
    context += `- Danh mục: ${p.categoryName || p.category || ''}\n`;
    context += `- Giá bán: ${p.priceRange || 'Liên hệ'}\n`;
    context += `- Thời gian bảo hành: ${p.warrantyText || 'Theo tiêu chuẩn'}\n`;
    if (p.imageUrl) {
      const imgUrl = resolveMediaUrl(p.imageUrl, imageBaseUrl);
      context += `- Đường dẫn ảnh đại diện sản phẩm (Image URL): ${imgUrl}\n`;
    }
    if (Array.isArray(colors) && colors.length > 0) {
      context += `- Màu sắc: ${colors.join(', ')}\n`;
    }
    if (Array.isArray(features) && features.length > 0) {
      context += `- Các tính năng nổi bật:\n`;
      features.forEach((f: string) => {
        context += `  * ${f}\n`;
      });
    }
    if (specs && typeof specs === 'object' && Object.keys(specs).length > 0) {
      context += `- Thông số kỹ thuật:\n`;
      Object.entries(specs).forEach(([k, v]) => {
        context += `  * ${k}: ${String(v)}\n`;
      });
    }
    if (p.description) {
      context += `- Mô tả tổng quan: ${p.description}\n`;
    }

    // Công nghệ ứng dụng (Fingerprint, FaceID, App, IC card...)
    const technologies = Array.isArray(p.technologies)
      ? p.technologies
      : typeof p.technologies === 'string'
        ? (() => {
            try {
              return JSON.parse(p.technologies);
            } catch {
              return [p.technologies];
            }
          })()
        : [];
    if (Array.isArray(technologies) && technologies.length > 0) {
      context += `- Công nghệ nổi bật: ${technologies.join(', ')}\n`;
    }

    // Các phiên bản & mức giá theo màu / chức năng
    const variants = Array.isArray(p.variants)
      ? p.variants
      : typeof p.variants === 'string'
        ? (() => {
            try {
              return JSON.parse(p.variants);
            } catch {
              return [];
            }
          })()
        : [];
    if (Array.isArray(variants) && variants.length > 0) {
      const variantStr = variants
        .map((v: any) => `${v.name || v.label || ''} (${v.price ? Number(v.price).toLocaleString('vi-VN') + 'đ' : 'Liên hệ'})`)
        .filter(Boolean)
        .join('; ');
      if (variantStr) {
        context += `- Các phiên bản lựa chọn: ${variantStr}\n`;
      }
    }

    // FAQ kiến thức giải đáp (đọc để nắm vững kiến thức tư vấn, không in nguyên văn ra chat)
    const faq = Array.isArray(p.faq)
      ? p.faq
      : typeof p.faq === 'string'
        ? (() => {
            try {
              return JSON.parse(p.faq);
            } catch {
              return [];
            }
          })()
        : [];
    if (Array.isArray(faq) && faq.length > 0) {
      context += `- FAQ kiến thức tham khảo (chỉ đọc để giải đáp khi khách hỏi, không in nguyên văn):\n`;
      faq.slice(0, 5).forEach((item: any) => {
        if (item.question && item.answer) {
          context += `  * Q: ${item.question} -> A: ${item.answer}\n`;
        }
      });
    }

    // Bài viết chi tiết (đã lọc sạch thẻ HTML, lấy kiến thức cốt lõi tối đa 600 ký tự làm căn cứ tư vấn)
    if (p.content && typeof p.content === 'string') {
      const cleanContent = p.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanContent.length > 0) {
        context += `- Kiến thức chuyên sâu bài viết (đọc để hiểu thấu đáo đố cửa & công năng, không tuôn nguyên văn bài viết): ${cleanContent.slice(0, 600)}...\n`;
      }
    }

    if (installation && typeof installation === 'object') {
      const instImages = Array.isArray(installation.images)
        ? installation.images
        : [];
      const instVideos = Array.isArray(installation.videos)
        ? installation.videos
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
