import { Injectable } from '@nestjs/common';
import { ProductsService } from '../../products/products.service';
import { IRetriever } from '../interfaces/retriever.interface';
import { removeDiacritics } from '@/common/utils/string.util';

@Injectable()
export class ProductRetrieverService implements IRetriever {
  constructor(private readonly productsService: ProductsService) {}

  retrieve(query: string, limit = 5): Promise<string> {
    const rawProducts = this.productsService.getRawProducts();
    if (!rawProducts || rawProducts.length === 0) {
      return Promise.resolve('Không có sản phẩm nào trong cửa hàng.');
    }

    const queryNorm = removeDiacritics(query.toLowerCase().trim());
    const queryKeywords = queryNorm.split(/\s+/).filter(Boolean);

    if (queryKeywords.length === 0) {
      return Promise.resolve('');
    }

    const scoredProducts = rawProducts.map((p) => {
      let score = 0;
      const codeNorm = removeDiacritics((p.code || '').toLowerCase());
      const nameNorm = removeDiacritics((p.name || '').toLowerCase());
      const brandNorm = removeDiacritics((p.brand || '').toLowerCase());
      const categoryNorm = removeDiacritics(
        (p.categoryName || '').toLowerCase(),
      );
      const descNorm = removeDiacritics((p.description || '').toLowerCase());
      const featuresNorm = removeDiacritics(
        (Array.isArray(p.features) ? p.features.join(' ') : '').toLowerCase(),
      );

      queryKeywords.forEach((keyword) => {
        // 1. Tên mã sản phẩm khớp chính xác tăng điểm cực cao
        if (codeNorm === keyword) {
          score += 50;
        } else if (codeNorm.includes(keyword)) {
          score += 15;
        }

        // 2. Khớp trong tên, thương hiệu, danh mục
        if (nameNorm.includes(keyword)) {
          score += 12;
        }
        if (brandNorm.includes(keyword)) {
          score += 10;
        }
        if (categoryNorm.includes(keyword)) {
          score += 6;
        }

        // 3. Khớp trong tính năng nổi bật (Rất quan trọng khi hỏi đặc điểm như FaceID, vân tay, app wifi,...)
        if (featuresNorm.includes(keyword)) {
          score += 12; // Tăng mạnh trọng số cho tính năng đặc điểm
        }

        // 4. Khớp trong mô tả chi tiết
        if (descNorm.includes(keyword)) {
          score += 4;
        }
      });

      // 5. Quét qua thông số kỹ thuật specs (Chất liệu, nguồn điện, độ dày cửa thích hợp...)
      if (p.specs && typeof p.specs === 'object') {
        Object.entries(p.specs).forEach(([k, v]) => {
          const kNorm = removeDiacritics(String(k).toLowerCase());
          const vNorm = removeDiacritics(String(v).toLowerCase());
          queryKeywords.forEach((keyword) => {
            if (kNorm.includes(keyword) || vNorm.includes(keyword)) {
              score += 8; // Điểm cộng thêm cho đặc điểm kỹ thuật
            }
          });
        });
      }

      return { product: p, score };
    });

    // Lọc các sản phẩm có điểm lớn hơn 0 và sắp xếp giảm dần theo điểm số
    const matches = scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    if (matches.length === 0) {
      return Promise.resolve('');
    }

    // Định dạng danh sách sản phẩm thành Markdown Context
    let context = 'DƯỚI ĐÂY LÀ DANH SÁCH SẢN PHẨM PHÙ HỢP:\n\n';
    matches.forEach((p, index) => {
      context += `[Sản phẩm ${index + 1}]\n`;
      context += `- ID: ${p.id}\n`;
      context += `- Mã sản phẩm (Code): ${p.code}\n`;
      context += `- Tên sản phẩm: ${p.name}\n`;
      context += `- Thương hiệu: ${p.brand}\n`;
      context += `- Danh mục: ${p.categoryName}\n`;
      context += `- Giá bán: ${p.priceRange || 'Liên hệ'}\n`;
      context += `- Thời gian bảo hành: ${p.warrantyText || 'Theo tiêu chuẩn'}\n`;
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
      context += '\n';
    });

    return Promise.resolve(context);
  }
}
