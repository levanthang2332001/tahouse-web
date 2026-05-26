import { Injectable, NotFoundException } from '@nestjs/common';
import { removeDiacritics } from '@/common/utils/string.util';
import { JsonDbService } from '../database/json-db.service';
import {
  GetProductsDto,
  ProductSortBy,
  SortOrder,
} from './dto/get-products.dto';
import {
  GetInstallationMediaDto,
  MediaType,
} from './dto/get-installation-media.dto';

@Injectable()
export class ProductsService {
  private getProducts: () => any[];
  private getInstallationData: () => Record<
    string,
    { images: string[]; videos: string[] }
  >;

  constructor(private readonly jsonDb: JsonDbService) {
    this.getProducts = this.jsonDb.register('products.json', []);
    this.getInstallationData = this.jsonDb.register(
      'installation_images.json',
      {},
    );
  }

  /**
   * Lấy danh sách sản phẩm phân trang, tìm kiếm thông minh, lọc theo danh mục, khoảng giá, sắp xếp và chỉ trả về các trường cơ bản.
   * @param query - Object chứa các thông tin truy vấn từ client.
   * @returns {{ items: any[], total: number, page: number, limit: number }} Đối tượng chứa danh sách sản phẩm phân trang và metadata.
   */
  findAll(query: GetProductsDto) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder = SortOrder.ASC,
    } = query;

    // Sao chép nông (shallow copy) mảng để tránh thay đổi trực tiếp dữ liệu trong RAM cache
    let products = [...this.getProducts()];

    if (categoryId !== undefined && categoryId !== null && !isNaN(categoryId)) {
      products = products.filter((p) => p.category_id === categoryId);
    }
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      products = products.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      products = products.filter((p) => p.price <= maxPrice);
    }
    if (search && search.trim()) {
      const searchNorm = removeDiacritics(search.trim().toLowerCase());
      const searchKeywords = searchNorm.split(/\s+/).filter(Boolean);

      products = products.filter((p) => {
        const name = p.name || '';
        const code = p.code || '';
        const category = p.category || '';
        const desc = p.description || '';
        const features = Array.isArray(p.features) ? p.features.join(' ') : '';

        const searchableText = removeDiacritics(
          `${name} ${code} ${category} ${desc} ${features}`.toLowerCase(),
        );
        return searchKeywords.every((keyword) =>
          searchableText.includes(keyword),
        );
      });
    }

    // Sắp xếp (Sorting) trước khi phân trang
    // Mặc định sort theo priority (1, 2, 3, null), null luôn ở cuối
    if (sortBy) {
      const order = sortOrder === SortOrder.DESC ? -1 : 1;
      products.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];

        // Xử lý giá trị null/undefined khi sắp xếp theo giá (price)
        // Luôn đẩy sản phẩm không có giá (hoặc giá là null/undefined) xuống cuối danh sách
        if (sortBy === ProductSortBy.PRICE) {
          const isNullA = valA === null || valA === undefined;
          const isNullB = valB === null || valB === undefined;

          if (isNullA && isNullB) return 0;
          if (isNullA) return 1;
          if (isNullB) return -1;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        return strA.localeCompare(strB, 'vi', { sensitivity: 'base' }) * order;
      });
    } else {
      // Default: sort theo priority, null/undefined luôn ở cuối
      products.sort((a, b) => {
        const pA = a.priority;
        const pB = b.priority;
        const isNullA = pA === null || pA === undefined;
        const isNullB = pB === null || pB === undefined;

        if (isNullA && isNullB) return 0;
        if (isNullA) return 1;
        if (isNullB) return -1;

        return pA - pB;
      });
    }

    // 3. Phân trang
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);
    const items = paginatedProducts.map(
      ({ id, code, name, price, formatted_price, category, images }) => ({
        id,
        code,
        name,
        price,
        formatted_price,
        category,
        images: images && images.length > 0 ? [images[0]] : [],
      }),
    );

    return {
      items,
      total: products.length,
      page: pageNum,
      limit: limitNum,
    };
  }

  /**
   * Tìm kiếm thông tin chi tiết của một sản phẩm theo Mã sản phẩm (Code).
   * Trả về kèm theo preview (tối đa 3 ảnh) từ dữ liệu lắp đặt thực tế.
   */
  findOne(code: string) {
    const products = this.getProducts();
    const cleanQuery = code.trim().toLowerCase().replace(/\s+/g, '');
    const product = products.find(
      (p) => p.code?.toLowerCase().replace(/\s+/g, '') === cleanQuery,
    );

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${code}`);
    }

    const productResponse = { ...product };
    delete productResponse.page_number;
    delete productResponse.category_id;

    // Gắn preview ảnh lắp đặt (tối đa 3 ảnh đầu tiên)
    const installation = this.getInstallationData()[product.code];
    productResponse.installation_preview = installation
      ? installation.images.slice(0, 3)
      : [];

    return productResponse;
  }

  /**
   * Lấy danh sách ảnh / video lắp đặt thực tế của sản phẩm với phân trang.
   * @param code  - Mã sản phẩm
   * @param query - Đối tượng chứa page, limit, type.
   */
  getInstallationMedia(code: string, query: GetInstallationMediaDto) {
    const { page = 1, limit = 12, type = MediaType.ALL } = query;

    const products = this.getProducts();
    const cleanQuery = code.trim().toLowerCase().replace(/\s+/g, '');
    const product = products.find(
      (p) => p.code?.toLowerCase().replace(/\s+/g, '') === cleanQuery,
    );

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${code}`);
    }

    const installation = this.getInstallationData()[product.code] ?? {
      images: [],
      videos: [],
    };

    // Lấy mảng media theo type
    const mediaItems: Array<{ url: string; type: 'image' | 'video' }> = [];

    if (type === MediaType.IMAGES || type === MediaType.ALL) {
      mediaItems.push(
        ...installation.images.map((url) => ({ url, type: 'image' as const })),
      );
    }
    if (type === MediaType.VIDEOS || type === MediaType.ALL) {
      mediaItems.push(
        ...installation.videos.map((url) => ({ url, type: 'video' as const })),
      );
    }

    const total = mediaItems.length;
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const startIndex = (pageNum - 1) * limitNum;
    const items = mediaItems.slice(startIndex, startIndex + limitNum);

    return {
      product_code: product.code,
      product_name: product.name,
      items,
      total,
      total_images: installation.images.length,
      total_videos: installation.videos.length,
      page: pageNum,
      limit: limitNum,
    };
  }
}
