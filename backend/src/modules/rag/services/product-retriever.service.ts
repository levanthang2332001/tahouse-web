import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
import { IRetriever } from '../interfaces/retriever.interface';
import { removeDiacritics } from '@/common/utils/string.util';
import { resolveMediaUrl } from '@/common/utils/url.util';
import { formatProductContext } from '../prompts';

@Injectable()
export class ProductRetrieverService implements IRetriever {
  private readonly imageBaseUrl: string;

  constructor(
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {
    this.imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '';
  }

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

    // --- XỬ LÝ CÂU HỎI CHUNG VỀ HÃNG KHÓA / THƯƠNG HIỆU ---
    const brands = [
      'kassler',
      'philips',
      'hubert',
      'hyundai',
      'bosch',
      'sharp',
      'fanlight',
      'hd-door',
      'karofi',
    ];
    const matchedBrand = brands.find(
      (b) =>
        queryNorm.includes(b) ||
        (b === 'philips' && queryNorm.includes('philip')) ||
        (b === 'hd-door' &&
          (queryNorm.includes('hd door') ||
            queryNorm.includes('hddoor') ||
            queryNorm.includes('cua hd'))),
    );

    const isGeneralWord = [
      'loai nao',
      'dong nao',
      'san pham nao',
      'co nhung',
      'co gi',
      'danh sach',
      'gioi thieu',
      'hang nao',
    ].some((w) => queryNorm.includes(w));

    if (matchedBrand && isGeneralWord) {
      const brandProducts = rawProducts.filter((p) => {
        const pBrand = removeDiacritics((p.brand || '').toLowerCase());
        return (
          pBrand.includes(matchedBrand) ||
          (matchedBrand === 'philips' && pBrand.includes('philip'))
        );
      });

      if (brandProducts.length > 0) {
        const groups: Record<string, any[]> = {};
        brandProducts.forEach((p) => {
          const cat = p.categoryName || 'Khác';
          if (!groups[cat]) {
            groups[cat] = [];
          }
          groups[cat].push(p);
        });

        let context = `DANH SÁCH SẢN PHẨM NỔI BẬT CỦA HÃNG ${brandProducts[0].brand.toUpperCase()} (TỐI ĐA 3 MẪU MỖI DÒNG):\n\n`;
        Object.entries(groups).forEach(([categoryName, products]) => {
          context += `[Dòng sản phẩm: ${categoryName}]\n`;
          // Giới hạn tối đa 3 sản phẩm tiêu biểu mỗi dòng cửa để tránh quá tải tin nhắn
          const limitedProducts = products.slice(0, 3);
          limitedProducts.forEach((p) => {
            const imgUrl = resolveMediaUrl(p.imageUrl || '', this.imageBaseUrl);
            context += `- ${p.name} (Mã: ${p.code} | Giá: ${p.priceRange || 'Liên hệ'} | Ảnh đại diện: ${imgUrl})\n`;
          });
          context += '\n';
        });

        return Promise.resolve(context);
      }
    }
    // ----------------------------------------------------

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
        // Tên mã sản phẩm khớp chính xác tăng điểm cực cao
        if (codeNorm === keyword) {
          score += 50;
        } else if (codeNorm.includes(keyword)) {
          score += 15;
        }

        // Khớp trong tên, thương hiệu, danh mục
        if (nameNorm.includes(keyword)) {
          score += 12;
        }
        if (brandNorm.includes(keyword)) {
          score += 10;
        }
        if (categoryNorm.includes(keyword)) {
          score += 6;
        }

        // Khớp trong tính năng nổi bật
        if (featuresNorm.includes(keyword)) {
          score += 12;
        }

        // Khớp trong mô tả chi tiết
        if (descNorm.includes(keyword)) {
          score += 4;
        }
      });

      // Quét qua thông số kỹ thuật specs
      if (p.specs && typeof p.specs === 'object') {
        Object.entries(p.specs).forEach(([k, v]) => {
          const kNorm = removeDiacritics(String(k).toLowerCase());
          const vNorm = removeDiacritics(String(v).toLowerCase());
          queryKeywords.forEach((keyword) => {
            if (kNorm.includes(keyword) || vNorm.includes(keyword)) {
              score += 8;
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

    // Sử dụng hàm format chung từ thư mục prompts, truyền kèm imageBaseUrl
    const context = formatProductContext(matches, this.imageBaseUrl);
    return Promise.resolve(context);
  }
}
