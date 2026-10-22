import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
import { IRetriever } from '../interfaces/retriever.interface';
import type { IChatMessage } from '../interfaces/llm-provider.interface';
import { removeDiacritics } from '@/common/utils/string.util';
import { resolveMediaUrl } from '@/common/utils/url.util';
import { formatProductContext } from '../prompts';

export function cleanAlnum(str: string): string {
  return removeDiacritics(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Trích xuất toàn bộ các biến thể mã sản phẩm khả dĩ từ chuỗi văn bản:
 * - Dạng Chữ + Số: "KL-989F" -> ["kl989f", "kl989"]
 * - Dạng tách rời: "KL 989 F" -> ghép lại thành "kl989f", "kl989"
 * - Dạng mã không gạch nối: "KL393" -> "kl393"
 * - Dạng từ N-gram liền kề: "KL", "599" -> "kl599"
 */
export function extractCodeTokens(text: string): string[] {
  if (!text) return [];
  const norm = removeDiacritics(text.toLowerCase());
  const tokens = new Set<string>();

  // 1. Regex tìm kiếm các cụm mã dạng Chữ + Số (ví dụ: KL-989F, KL 989, KL989, DDL 702, HB-CN39...)
  const codeRegex = /([a-z]+)[\s\-_]*(\d+[\s\-_]*[a-z0-9]*)/gi;
  let match: RegExpExecArray | null;
  while ((match = codeRegex.exec(norm)) !== null) {
    const prefix = match[1].replace(/[^a-z]/g, '');
    const suffix = match[2].replace(/[^a-z0-9]/g, '');
    const combined = `${prefix}${suffix}`;
    if (combined.length >= 3) {
      tokens.add(combined);
      const numOnly = match[2].replace(/[^0-9]/g, '');
      if (numOnly.length >= 2) {
        tokens.add(`${prefix}${numOnly}`);
      }
    }
  }

  // 2. Tách từ đơn lẻ và làm sạch ký tự đặc biệt
  const words = norm.split(/[\s,./\-_+()]+/).filter(Boolean);
  words.forEach((w) => {
    const clean = w.replace(/[^a-z0-9]/g, '');
    if (clean.length >= 3) {
      tokens.add(clean);
    }
  });

  // 3. Ghép các cặp từ liền kề (N-gram 2 & N-gram 3) để bắt trường hợp người dùng gõ tách: "KL 989", "KL 393", "TA 9800", "DDL 702"
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].replace(/[^a-z0-9]/g, '');
    const w2 = words[i + 1].replace(/[^a-z0-9]/g, '');
    if (w1.length >= 1 && w2.length >= 1) {
      const combined = `${w1}${w2}`;
      if (combined.length >= 3) {
        tokens.add(combined);
      }
    }
    if (i < words.length - 2) {
      const w3 = words[i + 2].replace(/[^a-z0-9]/g, '');
      if (w1.length >= 1 && w2.length >= 1 && w3.length >= 1) {
        const triCombined = `${w1}${w2}${w3}`;
        if (triCombined.length >= 4) {
          tokens.add(triCombined);
        }
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Trích xuất slug hoặc ID sản phẩm từ URL trang người dùng đang mở (Referer HTTP Header)
 * Ví dụ: "https://tahouse.vn/product/kl-989f" -> "kl-989f"
 */
export function extractSlugFromReferer(referer?: string): string | null {
  if (!referer) return null;
  try {
    const parsed = new URL(referer);
    const pathname = parsed.pathname;
    const match = pathname.match(/\/(?:product|products|san-pham)\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1].trim()) : null;
  } catch {
    const match = referer.match(/\/(?:product|products|san-pham)\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1].trim()) : null;
  }
}

@Injectable()
export class ProductRetrieverService implements IRetriever {
  private readonly imageBaseUrl: string;

  constructor(
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {
    this.imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '';
  }

  async retrieve(
    query: string,
    limit = 5,
    history: IChatMessage[] = [],
    referer?: string,
  ): Promise<string> {
    const rawProducts = await this.productsService.getRawProducts();
    if (!rawProducts || rawProducts.length === 0) {
      return 'Không có sản phẩm nào trong cửa hàng.';
    }

    const queryNorm = removeDiacritics(query.toLowerCase().trim());
    const queryAlnum = cleanAlnum(query);
    const queryKeywords = queryNorm.split(/[\s,./\-_+()]+/).filter((w) => w.length > 0);
    const queryCodeTokens = extractCodeTokens(query);

    // 1. Nhận diện trang chi tiết sản phẩm người dùng đang đứng (từ HTTP Referer)
    const refererSlug = extractSlugFromReferer(referer);
    const refererSlugAlnum = refererSlug ? cleanAlnum(refererSlug) : null;

    // 2. Phân tích ngữ cảnh đa lượt (Multi-turn History Context)
    const recentMessages = (history || [])
      .slice(-4)
      .filter((h) => h && typeof h.content === 'string' && h.content.trim().length > 0);

    const isFollowUpIntent =
      queryNorm.length <= 45 ||
      [
        'cho xem',
        'cho xme',
        'xem di',
        'xem sao',
        'xem anh',
        'xem hinh',
        'xem video',
        'anh dau',
        'hinh dau',
        'video dau',
        'thuc te',
        'lap dat',
        'cong trinh',
        'gia bao nhieu',
        'gia sao',
        'gia no',
        'bao nhieu tien',
        'dat khong',
        'con nay',
        'mau nay',
        'loai nay',
        'chiec nay',
        'no',
        'bao hanh',
        'mau sac',
        'mau vang',
        'mau den',
        'mau xam',
        'lap duoc khong',
        'do cua',
        'do day',
        'kich thuoc',
        'chat lieu',
        'co ma',
        'sao lai khong',
        'co nhung gi',
        'co mau nao',
        'co hang nao',
        'chuc nang gi',
      ].some((pattern) => queryNorm.includes(pattern));

    // Tìm các sản phẩm đã được nhắc tới gần nhất trong lịch sử hội thoại
    const recentProductIds = new Set<string>();
    const recentBrandNames = new Set<string>();

    for (const msg of recentMessages) {
      const msgAlnum = cleanAlnum(msg.content);
      const msgNorm = removeDiacritics(msg.content.toLowerCase());
      const msgTokens = extractCodeTokens(msg.content);

      for (const p of rawProducts) {
        const pCodeAlnum = cleanAlnum(p.code || '');
        const pSlugAlnum = cleanAlnum(p.slug || '');
        const pNameNorm = removeDiacritics((p.name || '').toLowerCase());

        const hasCodeMatch = msgTokens.some((t) => t.length >= 3 && (pCodeAlnum.includes(t) || pSlugAlnum.includes(t)));

        if (
          hasCodeMatch ||
          (pCodeAlnum.length >= 3 && msgAlnum.includes(pCodeAlnum)) ||
          (pSlugAlnum.length >= 3 && msgAlnum.includes(pSlugAlnum)) ||
          (pNameNorm.length >= 6 && msgNorm.includes(pNameNorm))
        ) {
          recentProductIds.add(p.id);
        }

        const pBrand = removeDiacritics((p.brand || '').toLowerCase());
        if (pBrand && msgNorm.includes(pBrand)) {
          recentBrandNames.add(pBrand);
        }
      }
    }

    // 3. Xử lý câu hỏi tổng quan về hãng (Brand Overview)
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

    let matchedBrand = brands.find(
      (b) =>
        queryNorm.includes(b) ||
        (b === 'philips' && queryNorm.includes('philip')) ||
        (b === 'hd-door' &&
          (queryNorm.includes('hd door') ||
            queryNorm.includes('hddoor') ||
            queryNorm.includes('cua hd'))),
    );

    if (!matchedBrand && isFollowUpIntent && recentBrandNames.size > 0) {
      matchedBrand = brands.find((b) => recentBrandNames.has(b));
    }

    const isGeneralWord = [
      'loai nao',
      'dong nao',
      'san pham nao',
      'co nhung',
      'co gi',
      'danh sach',
      'gioi thieu',
      'hang nao',
      'mau nao',
    ].some((w) => queryNorm.includes(w));

    if (matchedBrand && isGeneralWord) {
      const brandProducts = rawProducts.filter((p) => {
        const pBrand = removeDiacritics((p.brand || '').toLowerCase());
        return (
          pBrand.includes(matchedBrand!) ||
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

    // 4. Chấm điểm sản phẩm toàn diện (Comprehensive Scoring)
    const isAskingMedia = [
      'anh',
      'hinh',
      'video',
      'thuc te',
      'lap dat',
      'cong trinh',
      'cho xem',
      'cho xme',
      'xem di',
    ].some((w) => queryNorm.includes(w));

    const scoredProducts = rawProducts.map((p) => {
      let score = 0;

      // Ưu tiên cực cao: Sản phẩm từ trang Referer mà người dùng đang mở trực tiếp
      if (
        refererSlug &&
        (p.slug === refererSlug ||
          p.id === refererSlug ||
          p.code === refererSlug ||
          (refererSlugAlnum &&
            (cleanAlnum(p.slug || '') === refererSlugAlnum ||
              cleanAlnum(p.code || '') === refererSlugAlnum ||
              cleanAlnum(p.id || '') === refererSlugAlnum)))
      ) {
        score += 350;
      }

      // Ưu tiên cao: Sản phẩm vừa được thảo luận ở các lượt trước
      if (recentProductIds.has(p.id)) {
        score += 180;
      }

      // Chuẩn bị các token mã từ sản phẩm
      const pTokens = new Set<string>();
      extractCodeTokens(p.code || '').forEach((t) => pTokens.add(t));
      extractCodeTokens(p.slug || '').forEach((t) => pTokens.add(t));
      extractCodeTokens(p.name || '').forEach((t) => pTokens.add(t));
      const pCodeAlnum = cleanAlnum(p.code || '');
      if (pCodeAlnum.length >= 3) pTokens.add(pCodeAlnum);
      const pSlugAlnum = cleanAlnum(p.slug || '');
      if (pSlugAlnum.length >= 3) pTokens.add(pSlugAlnum);

      // --- Khớp mã nâng cao (Token-Level Advanced Code Matching) ---
      for (const qToken of queryCodeTokens) {
        if (pTokens.has(qToken)) {
          // Khớp mã hoàn toàn chính xác 100%!
          score += 300;
        } else {
          for (const pToken of pTokens) {
            if (pToken.startsWith(qToken) && qToken.length >= 4) {
              score += 200;
            } else if (qToken.startsWith(pToken) && pToken.length >= 4) {
              score += 180;
            } else if (pToken.includes(qToken) && qToken.length >= 4) {
              score += 150;
            } else if (
              qToken.startsWith('kl') &&
              pToken.startsWith('kl') &&
              qToken.length >= 4 &&
              pToken.slice(0, 4) === qToken.slice(0, 4)
            ) {
              // Gợi ý cùng họ mã (ví dụ: gõ nhầm kl399 -> gợi ý kl393)
              score += 80;
            }
          }
        }
      }

      // Khớp trực tiếp trên queryAlnum
      if (pCodeAlnum.length >= 3 && queryAlnum.includes(pCodeAlnum)) {
        score += 120;
      }
      if (pSlugAlnum.length >= 3 && queryAlnum.includes(pSlugAlnum)) {
        score += 100;
      }

      const pNameNorm = removeDiacritics((p.name || '').toLowerCase());
      const pBrandNorm = removeDiacritics((p.brand || '').toLowerCase());
      const pCatNorm = removeDiacritics(
        (p.categoryName || p.category || '').toLowerCase(),
      );
      const pCatSlug = (p.categorySlug || '').toLowerCase();
      const pSubcatNorm = removeDiacritics(
        (p.subcategoryName || p.subcategory || '').toLowerCase(),
      );
      const pSubcatSlug = (p.subcategorySlug || '').toLowerCase();
      const pDescNorm = removeDiacritics((p.description || '').toLowerCase());
      const pShortDescNorm = removeDiacritics(
        (p.shortDescription || '').toLowerCase(),
      );

      // Khớp theo từng từ khóa
      queryKeywords.forEach((keyword) => {
        if (keyword.length < 2) return;

        // Mã sản phẩm
        const codeNorm = removeDiacritics((p.code || '').toLowerCase());
        if (codeNorm === keyword) {
          score += 60;
        } else if (codeNorm.includes(keyword)) {
          score += 25;
        }

        // Tên sản phẩm
        if (pNameNorm.includes(keyword)) {
          score += 18;
        }

        // Thương hiệu
        if (pBrandNorm.includes(keyword)) {
          score += 18;
        }

        // Danh mục & Danh mục con
        if (pCatNorm.includes(keyword) || pSubcatNorm.includes(keyword)) {
          score += 15;
        }
        if (pCatSlug.includes(keyword) || pSubcatSlug.includes(keyword)) {
          score += 15;
        }

        // Tính năng
        const featuresNorm = removeDiacritics(
          (Array.isArray(p.features)
            ? p.features.join(' ')
            : String(p.features || '')
          ).toLowerCase(),
        );
        if (featuresNorm.includes(keyword)) {
          score += 14;
        }

        // Màu sắc
        const colorsNorm = removeDiacritics(
          (Array.isArray(p.colors)
            ? p.colors.join(' ')
            : String(p.colors || '')
          ).toLowerCase(),
        );
        if (colorsNorm.includes(keyword)) {
          score += 16;
        }

        // Mô tả & Mô tả ngắn
        if (pDescNorm.includes(keyword) || pShortDescNorm.includes(keyword)) {
          score += 8;
        }
      });

      // --- Phân loại theo loại cửa (Door Type Mapping) ---
      if (
        queryNorm.includes('xingfa') ||
        queryNorm.includes('nhom') ||
        queryNorm.includes('do nho')
      ) {
        if (
          pSubcatSlug.includes('xingfa') ||
          pSubcatSlug.includes('nhom') ||
          pNameNorm.includes('nhom') ||
          pNameNorm.includes('xingfa')
        ) {
          score += 45;
        }
      }
      if (queryNorm.includes('cua go') || queryNorm.includes('chung cu')) {
        if (pSubcatSlug.includes('cua-go') || pNameNorm.includes('cua go')) {
          score += 45;
        }
      }
      if (queryNorm.includes('kinh') || queryNorm.includes('cuong luc')) {
        if (pSubcatSlug.includes('cua-kinh') || pNameNorm.includes('kinh')) {
          score += 45;
        }
      }
      if (
        queryNorm.includes('dai sanh') ||
        queryNorm.includes('biet thu') ||
        queryNorm.includes('ma vang')
      ) {
        if (
          pSubcatSlug.includes('dai-sanh') ||
          pCatSlug.includes('dai-sanh') ||
          pNameNorm.includes('dai sanh')
        ) {
          score += 45;
        }
      }
      if (
        queryNorm.includes('cong') ||
        queryNorm.includes('ngoai troi') ||
        queryNorm.includes('san vuon')
      ) {
        if (pSubcatSlug.includes('cua-cong') || pNameNorm.includes('cong')) {
          score += 45;
        }
      }

      // --- Quét qua thông số kỹ thuật specs ---
      if (p.specs && typeof p.specs === 'object') {
        Object.entries(p.specs).forEach(([k, v]) => {
          const kNorm = removeDiacritics(String(k).toLowerCase());
          const vNorm = removeDiacritics(String(v).toLowerCase());
          queryKeywords.forEach((keyword) => {
            if (kNorm.includes(keyword) || vNorm.includes(keyword)) {
              score += 12;
            }
          });
        });
      }

      // --- Quét qua công nghệ technologies (Face ID, FPC Thụy Điển, Tuya...) ---
      if (Array.isArray(p.technologies) && p.technologies.length > 0) {
        const techNorm = removeDiacritics(
          p.technologies.join(' ').toLowerCase(),
        );
        queryKeywords.forEach((keyword) => {
          if (techNorm.includes(keyword)) {
            score += 14;
          }
        });
      }

      // --- Quét qua kiến thức FAQ ---
      if (Array.isArray(p.faq) && p.faq.length > 0) {
        const faqText = p.faq
          .map((item: any) => `${item.question || ''} ${item.answer || ''}`)
          .join(' ');
        const faqNorm = removeDiacritics(faqText.toLowerCase());
        queryKeywords.forEach((keyword) => {
          if (faqNorm.includes(keyword)) {
            score += 12;
          }
        });
      }

      // --- Quét qua bài viết chuyên sâu content ---
      if (p.content && typeof p.content === 'string') {
        const contentNorm = removeDiacritics(p.content.toLowerCase());
        queryKeywords.forEach((keyword) => {
          if (keyword.length >= 3 && contentNorm.includes(keyword)) {
            score += 6;
          }
        });
      }

      // --- Ưu tiên sản phẩm có ảnh/video thực tế khi khách hỏi về ảnh thực tế ---
      if (isAskingMedia) {
        let hasInstallation = false;
        try {
          const inst =
            typeof p.installation === 'string'
              ? JSON.parse(p.installation)
              : p.installation;
          if (
            inst &&
            ((Array.isArray(inst.images) && inst.images.length > 0) ||
              (Array.isArray(inst.videos) && inst.videos.length > 0))
          ) {
            hasInstallation = true;
          }
        } catch {}
        if (hasInstallation) {
          score += 40;
        }
      }

      return { product: p, score };
    });

    // Lọc các sản phẩm có điểm lớn hơn 0 và sắp xếp giảm dần theo điểm số
    let matches = scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    // Fallback: Nếu query quá chung chung hoặc không khớp từ khóa nào nhưng người dùng muốn tham khảo mẫu
    if (matches.length === 0 && (isGeneralWord || queryKeywords.length <= 3)) {
      const representativeLocks = rawProducts.filter((p) => {
        const nameLower = (p.name || '').toLowerCase();
        return (
          nameLower.includes('kl-989') ||
          nameLower.includes('philips') ||
          nameLower.includes('hubert') ||
          nameLower.includes('bosch')
        );
      });
      matches = (
        representativeLocks.length > 0 ? representativeLocks : rawProducts
      ).slice(0, limit);
    }

    const context = formatProductContext(matches, this.imageBaseUrl);
    return Promise.resolve(context);
  }
}
