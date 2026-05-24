/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { removeDiacritics } from '@/common/utils/string.util';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly dbPath = path.resolve(
    process.cwd(),
    'database',
    'products.json',
  );
  private products: any[] = [];

  /**
   * Khởi tạo module: nạp dữ liệu và cấu hình watcher tự động reload khi file DB thay đổi.
   */
  onModuleInit() {
    this.loadProducts();

    if (fs.existsSync(this.dbPath)) {
      fs.watch(this.dbPath, (eventType) => {
        if (eventType === 'change') {
          try {
            this.loadProducts();
          } catch (err) {
            // Bỏ qua lỗi ghi dở dang để tránh crash ứng dụng khi file đang cập nhật
          }
        }
      });
    }
  }

  /**
   * Tải và phân tích toàn bộ danh sách sản phẩm từ file JSON vào RAM.
   */
  public loadProducts() {
    try {
      if (!fs.existsSync(this.dbPath)) {
        this.products = [];
        return;
      }
      const rawData = fs.readFileSync(this.dbPath, 'utf8');
      this.products = JSON.parse(rawData);
    } catch (error) {
      throw new Error(`Lỗi khi đọc cơ sở dữ liệu sản phẩm: ${error.message}`);
    }
  }

  /**
   * Truy xuất danh sách sản phẩm thô đang lưu trong RAM.
   */
  private getProducts(): any[] {
    return this.products;
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
    return productResponse;
  }
}
