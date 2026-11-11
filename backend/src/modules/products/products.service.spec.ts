import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { BrandsRepository } from '../brands/repositories/brands.repository';
import { BusinessException } from '@/common/exceptions';
import type { IProduct, IProductRecord } from './types/product.types';

/** Realistic production shapes: the row's UUID primary key differs from its public slug id. */
const DB_ID = '3f1c9a2e-5b7d-4c8e-9f0a-1b2c3d4e5f60';
const OTHER_DB_ID = 'a9b8c7d6-e5f4-4a3b-8c2d-1e0f9a8b7c6d';
const BRAND_ID = '7afccd8e-940e-4e9f-81bb-8754925f6e48';
const OTHER_BRAND_ID = 'c0ffee00-1234-4abc-8def-0123456789ab';

async function expectBusinessError(
  promise: Promise<unknown>,
  status: HttpStatus,
  errorName?: string,
): Promise<BusinessException> {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(BusinessException);
  const error = caught as BusinessException;
  expect(error.getStatus()).toBe(status);
  if (errorName) expect(error.errorName).toBe(errorName);
  return error;
}

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<ProductsRepository>;
  let brandsRepository: jest.Mocked<BrandsRepository>;

  const mockProduct: IProduct = {
    id: 'kl-989f', // public id = slug
    code: 'KL-989F',
    name: 'Khóa cửa Kassler KL-989F',
    slug: 'kl-989f',
    brandId: BRAND_ID,
    brand: 'Kassler',
    brandSlug: 'kassler',
    category: 'dai-sanh',
    categoryName: 'Khóa Đại Sảnh',
    subcategory: 'face-id',
    subcategoryName: 'Khóa Face ID',
    price: 32450000,
    originalPrice: 64890000,
    discountPercent: 50,
    priceRange: '32.450.000 VNĐ',
    description: '',
    shortDescription: '',
    content: '',
    imageUrl: '',
    images: [],
    features: [],
    specs: {},
    technologies: [],
    warranty: 36,
    warrantyText: '3 năm',
    colors: [],
    installationManual: [],
    faq: [],
    has_variants: false,
    options: [],
    variants: [],
    installation_preview: [],
  };

  const record: IProductRecord = { dbId: DB_ID, product: mockProduct };

  beforeEach(async () => {
    productsRepository = {
      findAllRaw: jest.fn().mockResolvedValue([mockProduct]),
      findAllPaginated: jest.fn().mockResolvedValue({
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
      }),
      findRecordByIdOrCode: jest.fn().mockResolvedValue(record),
      // Realistic duplicate lookups: the product's own code/slug belongs to DB_ID
      findByCode: jest.fn((code: string) =>
        Promise.resolve(
          code.toLowerCase() === 'kl-989f'
            ? { id: DB_ID, code: 'KL-989F', slug: 'kl-989f' }
            : null,
        ),
      ),
      findBySlug: jest.fn((slug: string) =>
        Promise.resolve(
          slug.toLowerCase() === 'kl-989f'
            ? { id: DB_ID, code: 'KL-989F', slug: 'kl-989f' }
            : null,
        ),
      ),
      findOtherByCode: jest.fn((code: string, excludeDbId: string) =>
        Promise.resolve(
          code.toLowerCase() === 'kl-989f' && excludeDbId !== DB_ID
            ? { id: DB_ID, code: 'KL-989F', slug: 'kl-989f' }
            : null,
        ),
      ),
      findOtherBySlug: jest.fn((slug: string, excludeDbId: string) =>
        Promise.resolve(
          slug.toLowerCase() === 'kl-989f' && excludeDbId !== DB_ID
            ? { id: DB_ID, code: 'KL-989F', slug: 'kl-989f' }
            : null,
        ),
      ),
      createProduct: jest.fn().mockResolvedValue(mockProduct),
      updateProduct: jest.fn().mockResolvedValue(mockProduct),
      deleteProduct: jest.fn().mockResolvedValue(true),
      findInstallationMedia: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 12,
      }),
    } as unknown as jest.Mocked<ProductsRepository>;

    brandsRepository = {
      findBrandById: jest.fn((id: string) =>
        Promise.resolve(
          id === BRAND_ID
            ? { id: BRAND_ID, name: 'Kassler' }
            : id === OTHER_BRAND_ID
              ? { id: OTHER_BRAND_ID, name: 'Hafele' }
              : null,
        ),
      ),
      findCategoryInBrand: jest.fn((brandId: string, input: string) =>
        Promise.resolve(
          brandId === BRAND_ID &&
            ['dai-sanh', 'khóa đại sảnh'].includes(input.toLowerCase())
            ? { id: 'cat-uuid-1', slug: 'dai-sanh', name: 'Khóa Đại Sảnh' }
            : null,
        ),
      ),
      findSubcategoryInCategory: jest.fn((categoryId: string, input: string) =>
        Promise.resolve(
          categoryId === 'cat-uuid-1' && input.toLowerCase() === 'face-id'
            ? { id: 'sub-uuid-1', slug: 'face-id', name: 'Khóa Face ID' }
            : null,
        ),
      ),
    } as unknown as jest.Mocked<BrandsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: productsRepository },
        { provide: BrandsRepository, useValue: brandsRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.items).toEqual([mockProduct]);
      expect(productsRepository.findAllPaginated).toHaveBeenCalled();
    });
  });

  describe('findOne / findOneForAdmin', () => {
    it('returns the public product without admin-only fields requested', async () => {
      const result = await service.findOne('KL-989F');
      expect(result).toEqual(mockProduct);
      expect(productsRepository.findRecordByIdOrCode).toHaveBeenCalledWith(
        'KL-989F',
        { includeAdminFields: false },
      );
    });

    it('asks for installation + priority for the admin edit form', async () => {
      await service.findOneForAdmin('kl-989f');
      expect(productsRepository.findRecordByIdOrCode).toHaveBeenCalledWith(
        'kl-989f',
        { includeAdminFields: true },
      );
    });

    it('throws 404 if the product does not exist', async () => {
      productsRepository.findRecordByIdOrCode.mockResolvedValue(undefined);
      await expectBusinessError(
        service.findOne('invalid'),
        HttpStatus.NOT_FOUND,
        'PRODUCT_NOT_FOUND',
      );
    });

    it('reads installation media from the full installation (not the preview)', async () => {
      await service.getInstallationMedia('kl-989f', {});
      expect(productsRepository.findRecordByIdOrCode).toHaveBeenCalledWith(
        'kl-989f',
        { includeAdminFields: true },
      );
    });
  });

  describe('create', () => {
    const baseDto = {
      code: 'KL-600',
      name: 'Khóa điện tử Kassler KL-600',
      brandId: BRAND_ID,
      category: 'dai-sanh',
    };

    it('validates the brand with its UUID string id (bug: brandId was a number)', async () => {
      await service.create({ ...baseDto });
      expect(brandsRepository.findBrandById).toHaveBeenCalledWith(BRAND_ID);
      expect(productsRepository.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ brandId: BRAND_ID }),
      );
    });

    it('rejects a missing brand with 400 before touching the DB (bug: stored "undefined")', async () => {
      const error = await expectBusinessError(
        service.create({ ...baseDto, brandId: undefined as unknown as string }),
        HttpStatus.BAD_REQUEST,
      );
      expect(error.message).toContain('thương hiệu');
      expect(productsRepository.createProduct).not.toHaveBeenCalled();
    });

    it('rejects a missing category with 400 before touching the DB', async () => {
      const error = await expectBusinessError(
        service.create({ ...baseDto, category: '' }),
        HttpStatus.BAD_REQUEST,
      );
      expect(error.message).toContain('danh mục');
      expect(productsRepository.createProduct).not.toHaveBeenCalled();
    });

    it('throws 404 if the brand does not exist', async () => {
      await expectBusinessError(
        service.create({ ...baseDto, brandId: OTHER_DB_ID }),
        HttpStatus.NOT_FOUND,
        'BRAND_NOT_FOUND',
      );
    });

    it('throws 404 if the category does not belong to the brand', async () => {
      await expectBusinessError(
        service.create({ ...baseDto, category: 'khong-ton-tai' }),
        HttpStatus.NOT_FOUND,
        'CATEGORY_NOT_FOUND',
      );
    });

    it('throws 404 if the subcategory does not belong to the category', async () => {
      await expectBusinessError(
        service.create({ ...baseDto, subcategory: 'sub-khong-ton-tai' }),
        HttpStatus.NOT_FOUND,
        'SUBCATEGORY_NOT_FOUND',
      );
    });

    it('stores the canonical category slug when the category was given by name', async () => {
      await service.create({
        ...baseDto,
        category: 'Khóa Đại Sảnh',
        subcategory: 'FACE-ID',
      });
      expect(productsRepository.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'dai-sanh',
          subcategory: 'face-id',
        }),
      );
    });

    it('uses the admin-provided id as the slug (bug: id was ignored)', async () => {
      await service.create({ ...baseDto, id: 'khoa-kassler-kl-600' });
      expect(productsRepository.findBySlug).toHaveBeenCalledWith(
        'khoa-kassler-kl-600',
      );
      const input = productsRepository.createProduct.mock.calls[0][0];
      expect(input.slug).toBe('khoa-kassler-kl-600');
      expect(input).not.toHaveProperty('id');
    });

    it('derives the slug from the code when no id/slug is given', async () => {
      await service.create({ ...baseDto, code: 'KL 600 Pro' });
      expect(productsRepository.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'kl-600-pro' }),
      );
    });

    it('returns 409 when the slug is already used (bug: duplicates were never checked)', async () => {
      const error = await expectBusinessError(
        service.create({ ...baseDto, id: 'kl-989f' }),
        HttpStatus.CONFLICT,
        'PRODUCT_ALREADY_EXISTS',
      );
      expect(error.message).toContain('kl-989f');
      expect(productsRepository.createProduct).not.toHaveBeenCalled();
    });

    it('returns 409 when the code exists in another case', async () => {
      await expectBusinessError(
        service.create({ ...baseDto, code: 'kl-989f', id: 'new-slug' }),
        HttpStatus.CONFLICT,
        'PRODUCT_ALREADY_EXISTS',
      );
    });

    it('translates a UNIQUE constraint race into 409', async () => {
      productsRepository.createProduct.mockRejectedValue(
        new Error('D1_ERROR: UNIQUE constraint failed: products.code'),
      );
      await expectBusinessError(
        service.create({ ...baseDto }),
        HttpStatus.CONFLICT,
      );
    });

    it('creates a "Liên hệ" product (price omitted) without error', async () => {
      const result = await service.create({ ...baseDto });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('writes with the real DB id, not the public slug id (bug: 0 rows updated)', async () => {
      await service.update('kl-989f', { name: 'Tên mới', price: 30000000 });
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        DB_ID,
        expect.objectContaining({ name: 'Tên mới', price: 30000000 }),
      );
    });

    it('does not report a conflict when saving with the unchanged code (bug: false 409)', async () => {
      await expect(
        service.update('kl-989f', { code: 'KL-989F', name: 'Tên mới' }),
      ).resolves.toEqual(mockProduct);
      expect(productsRepository.findOtherByCode).toHaveBeenCalledWith(
        'KL-989F',
        DB_ID,
      );
    });

    it('returns 409 when the new code belongs to another product', async () => {
      productsRepository.findOtherByCode.mockResolvedValue({
        id: OTHER_DB_ID,
        code: 'EXISTING-CODE',
        slug: 'existing',
      });
      await expectBusinessError(
        service.update('kl-989f', { code: 'existing-code' }),
        HttpStatus.CONFLICT,
        'PRODUCT_ALREADY_EXISTS',
      );
      expect(productsRepository.updateProduct).not.toHaveBeenCalled();
    });

    it('throws 404 instead of reporting success when no row was updated', async () => {
      productsRepository.updateProduct.mockResolvedValue(undefined);
      await expectBusinessError(
        service.update('kl-989f', { name: 'Tên mới' }),
        HttpStatus.NOT_FOUND,
        'PRODUCT_NOT_FOUND',
      );
    });

    it('keeps the slug when the form sends its current id back', async () => {
      await service.update('kl-989f', { id: 'kl-989f', name: 'Tên mới' });
      const changes = productsRepository.updateProduct.mock.calls[0][1];
      expect(changes).not.toHaveProperty('id');
      expect(changes.slug).toBeUndefined();
      expect(productsRepository.findOtherBySlug).not.toHaveBeenCalled();
    });

    it('checks a changed slug for duplicates excluding this product by DB id', async () => {
      await service.update('kl-989f', { slug: 'kl-989f-moi' });
      expect(productsRepository.findOtherBySlug).toHaveBeenCalledWith(
        'kl-989f-moi',
        DB_ID,
      );
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        DB_ID,
        expect.objectContaining({ slug: 'kl-989f-moi' }),
      );
    });

    it('clears the original price with null (bug: it could never be cleared)', async () => {
      // price above the *old* originalPrice is fine once originalPrice is cleared
      await service.update('kl-989f', {
        price: 70000000,
        originalPrice: null,
      });
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        DB_ID,
        expect.objectContaining({ price: 70000000, originalPrice: null }),
      );
    });

    it('still rejects price > originalPrice', async () => {
      await expectBusinessError(
        service.update('kl-989f', { price: 99000000 }),
        HttpStatus.BAD_REQUEST,
        'PRODUCT_INVALID_PRICE',
      );
    });

    it('rejects originalPrice lower than the current price', async () => {
      await expectBusinessError(
        service.update('kl-989f', { originalPrice: 10000000 }),
        HttpStatus.BAD_REQUEST,
        'PRODUCT_INVALID_PRICE',
      );
    });

    it('accepts a "Liên hệ" price (null/0) even with an original price', async () => {
      await service.update('kl-989f', { price: 0 });
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        DB_ID,
        expect.objectContaining({ price: 0 }),
      );
    });

    it('validates the category against a newly chosen brand', async () => {
      await expectBusinessError(
        service.update('kl-989f', { brandId: OTHER_BRAND_ID }),
        HttpStatus.NOT_FOUND,
        'CATEGORY_NOT_FOUND',
      );
    });

    it('lets "" clear the subcategory without validating it', async () => {
      await service.update('kl-989f', { subcategory: '' });
      expect(brandsRepository.findSubcategoryInCategory).not.toHaveBeenCalled();
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        DB_ID,
        expect.objectContaining({ subcategory: '' }),
      );
    });

    it('passes the full installation (images + videos) through unchanged', async () => {
      const installation = {
        images: ['/installation/a.jpg', '/installation/b.jpg'],
        videos: ['https://cdn.example.com/v.mp4'],
      };
      await service.update('kl-989f', { installation, priority: 3 });
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        DB_ID,
        expect.objectContaining({ installation, priority: 3 }),
      );
    });
  });

  describe('remove', () => {
    it('deletes by the real DB id (bug: deleted 0 rows by slug)', async () => {
      const result = await service.remove('kl-989f');
      expect(productsRepository.deleteProduct).toHaveBeenCalledWith(DB_ID);
      expect(result.message).toContain('Đã xóa');
    });

    it('throws 404 instead of reporting success when nothing was deleted', async () => {
      productsRepository.deleteProduct.mockResolvedValue(false);
      await expectBusinessError(
        service.remove('kl-989f'),
        HttpStatus.NOT_FOUND,
        'PRODUCT_NOT_FOUND',
      );
    });

    it('throws 404 when the product does not exist', async () => {
      productsRepository.findRecordByIdOrCode.mockResolvedValue(undefined);
      await expectBusinessError(
        service.remove('missing'),
        HttpStatus.NOT_FOUND,
      );
      expect(productsRepository.deleteProduct).not.toHaveBeenCalled();
    });
  });
});
