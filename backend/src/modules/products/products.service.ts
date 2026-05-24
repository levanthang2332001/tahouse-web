import { Injectable, NotFoundException } from '@nestjs/common';
import { removeDiacritics } from '@/common/utils/string.util';
import { JsonDbService } from '../database/json-db.service';

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
   * @param {number} page - Trang hiện tại cần lấy dữ liệu (mặc định là 1).
   * @param {number} limit - Số lượng sản phẩm tối đa trên mỗi trang (mặc định là 10).
   * @param {number} [categoryId] - ID danh mục sản phẩm cần lọc.
   * @param {string} [search] - Từ khóa tìm kiếm thông minh.
   * @param {number} [minPrice] - Giá tối thiểu để lọc.
   * @param {number} [maxPrice] - Giá tối đa để lọc.
   * @param {string} [sortBy] - Trường sắp xếp (ví dụ: price, name).
   * @param {string} [sortOrder] - Thứ tự sắp xếp ('asc' | 'desc').
   * @returns {{ items: any[], total: number, page: number, limit: number }} Đối tượng chứa danh sách sản phẩm phân trang và metadata.
   */
  findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: number,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
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
    if (sortBy) {
      const order = sortOrder?.toLowerCase() === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];

        // Xử lý giá trị null/undefined khi sắp xếp theo giá (price)
        // Luôn đẩy sản phẩm không có giá (hoặc giá là null/undefined) xuống cuối danh sách
        if (sortBy === 'price') {
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
   * Tìm kiếm thông tin chi tiết của một sản phẩm theo ID (UUID) hoặc Mã sản phẩm (Code).
   * Trả về kèm theo preview (tối đa 3 ảnh) từ dữ liệu lắp đặt thực tế.
   */
  findOne(idOrCode: string) {
    const products = this.getProducts();
    const cleanQuery = idOrCode.trim().toLowerCase().replace(/\s+/g, '');
    const product = products.find(
      (p) =>
        p.id?.toLowerCase() === idOrCode.toLowerCase() ||
        p.code?.toLowerCase().replace(/\s+/g, '') === cleanQuery,
    );

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID hoặc mã: ${idOrCode}`,
      );
    }

    const productResponse = { ...product };
    delete productResponse.page_number;
    delete productResponse.category_id;

    // Gắn preview ảnh lắp đặt (tối đa 3 ảnh đầu tiên)
    const installation = this.getInstallationData()[product.id];
    productResponse.installation_preview = installation
      ? installation.images.slice(0, 3)
      : [];

    return productResponse;
  }

  /**
   * Lấy danh sách ảnh / video lắp đặt thực tế của sản phẩm với phân trang.
   * @param idOrCode  - ID hoặc mã sản phẩm
   * @param page      - Trang hiện tại (mặc định 1)
   * @param limit     - Số lượng một trang (mặc định 12)
   * @param type      - Loại media: 'all' | 'images' | 'videos'
   */
  getInstallationMedia(
    idOrCode: string,
    page: number = 1,
    limit: number = 12,
    type: 'all' | 'images' | 'videos' = 'all',
  ) {
    const products = this.getProducts();
    const cleanQuery = idOrCode.trim().toLowerCase().replace(/\s+/g, '');
    const product = products.find(
      (p) =>
        p.id?.toLowerCase() === idOrCode.toLowerCase() ||
        p.code?.toLowerCase().replace(/\s+/g, '') === cleanQuery,
    );

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID hoặc mã: ${idOrCode}`,
      );
    }

    const installation = this.getInstallationData()[product.id] ?? {
      images: [],
      videos: [],
    };

    // Lấy mảng media theo type
    const mediaItems: Array<{ url: string; type: 'image' | 'video' }> = [];

    if (type === 'images' || type === 'all') {
      mediaItems.push(
        ...installation.images.map((url) => ({ url, type: 'image' as const })),
      );
    }
    if (type === 'videos' || type === 'all') {
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
      product_id: product.id,
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
