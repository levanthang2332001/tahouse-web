import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BrandsService } from './brands.service';
import { BrandsRepository } from './repositories/brands.repository';
import { BusinessException } from '@/common/exceptions';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

const BRAND_ID = '3f1c2b4a-8d6e-4f7a-9b1c-2d3e4f5a6b7c';
const OTHER_BRAND_ID = '7a8b9c0d-1e2f-4a3b-8c4d-5e6f7a8b9c0d';
const CAT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
const CAT2_ID = 'c3d4e5f6-a7b8-4c9d-8e0f-2a3b4c5d6e7f';
const SUB_ID = 'd4e5f6a7-b8c9-4d0e-9f1a-3b4c5d6e7f8a';

async function expectBusinessError(
  promise: Promise<unknown>,
  errorName: string,
  status: number,
): Promise<BusinessException> {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(BusinessException);
  const err = caught as BusinessException;
  expect(err.errorName).toBe(errorName);
  expect(err.getStatus()).toBe(status);
  return err;
}

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: jest.Mocked<BrandsRepository>;

  const makeBrand = (): BrandResponseDto => ({
    id: BRAND_ID,
    name: 'Yale',
    slug: 'yale',
    logo: '/brand/yale.png',
    orderIndex: 0,
    categories: [
      {
        id: CAT_ID,
        name: 'Khóa Cửa Gỗ',
        slug: 'cua-go',
        subcategories: [{ id: SUB_ID, name: 'Khóa Vân Tay', slug: 'van-tay' }],
      },
      {
        id: CAT2_ID,
        name: 'Khóa Khách Sạn',
        slug: 'khach-san',
        subcategories: [],
      },
    ],
  });
  let mockBrand: BrandResponseDto;

  beforeEach(async () => {
    mockBrand = makeBrand();
    repository = {
      findAll: jest.fn().mockResolvedValue([mockBrand]),
      findByIdOrSlug: jest.fn().mockResolvedValue(mockBrand),
      findBySlug: jest.fn().mockResolvedValue(undefined),
      countProductsByTaxonomy: jest.fn().mockResolvedValue([]),
      createBrandWithTree: jest.fn().mockResolvedValue(undefined),
      updateBrandWithTree: jest.fn().mockResolvedValue(undefined),
      deleteBrandWithTree: jest.fn().mockResolvedValue(undefined),
      insertCategoryWithSubcategories: jest.fn().mockResolvedValue(undefined),
      updateCategoryWithSubcategories: jest.fn().mockResolvedValue(undefined),
      deleteCategoryWithSubcategories: jest.fn().mockResolvedValue(undefined),
      insertSubcategory: jest.fn().mockResolvedValue(undefined),
      deleteSubcategory: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BrandsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: BrandsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  describe('findOne', () => {
    it('returns the brand when found', async () => {
      await expect(service.findOne('yale')).resolves.toEqual(mockBrand);
      expect(repository.findByIdOrSlug).toHaveBeenCalledWith('yale');
    });

    it('throws a Vietnamese 404 when the brand is missing', async () => {
      repository.findByIdOrSlug.mockResolvedValue(null);
      const err = await expectBusinessError(
        service.findOne('khong-co'),
        'BRAND_NOT_FOUND',
        404,
      );
      expect(err.message).toContain('Không tìm thấy thương hiệu');
    });
  });

  // --- Bug 1: Vietnamese / invalid slugs ---
  describe('slug handling', () => {
    it('derives an ASCII slug from a Vietnamese name when slug is omitted', async () => {
      await service.create({ id: BRAND_ID, name: 'Bếp Điện Từ' });
      expect(repository.findBySlug).toHaveBeenCalledWith('bep-dien-tu');
      const [brandRow] = repository.createBrandWithTree.mock.calls[0];
      expect(brandRow.slug).toBe('bep-dien-tu');
      expect(brandRow.id).toBe(BRAND_ID);
    });

    it('generates UUIDs and slugs for omitted category/subcategory ids', async () => {
      await service.create({
        name: 'Đồng Tâm',
        categories: [
          { name: 'Khóa Đại Sảnh', subcategories: [{ name: 'Face ID' }] },
        ],
      });
      const [brandRow, cats, subs] =
        repository.createBrandWithTree.mock.calls[0];
      expect(brandRow.slug).toBe('dong-tam');
      expect(brandRow.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(cats[0]).toMatchObject({
        brandId: brandRow.id,
        slug: 'khoa-dai-sanh',
      });
      expect(subs[0]).toMatchObject({
        categoryId: cats[0].id,
        slug: 'face-id',
      });
    });

    it('rejects a name that produces an empty slug with 400', async () => {
      const err = await expectBusinessError(
        service.create({ name: '!!!' }),
        'BRAND_VALIDATION_ERROR',
        400,
      );
      expect(err.message).toContain('Slug thương hiệu không hợp lệ');
      expect(repository.createBrandWithTree).not.toHaveBeenCalled();
    });

    it('rejects an invalid subcategory slug with 400', async () => {
      await expectBusinessError(
        service.addSubcategory('yale', 'cua-go', { name: '???', slug: '***' }),
        'BRAND_VALIDATION_ERROR',
        400,
      );
      expect(repository.insertSubcategory).not.toHaveBeenCalled();
    });

    describe('DTO validation', () => {
      const validateDto = async (plain: Record<string, unknown>) => {
        const dto = plainToInstance(CreateBrandDto, plain);
        const errors = await validate(dto);
        return { dto, errors };
      };

      it('slugifies a provided Vietnamese slug', async () => {
        const { dto, errors } = await validateDto({
          name: 'Bếp Điện Từ',
          slug: 'Bếp Điện Từ',
        });
        expect(errors).toHaveLength(0);
        expect(dto.slug).toBe('bep-dien-tu');
      });

      it('rejects a slug that becomes empty after the transform', async () => {
        const { errors } = await validateDto({ name: '@@@', slug: '###' });
        const slugError = errors.find((e) => e.property === 'slug');
        expect(slugError).toBeDefined();
        expect(Object.values(slugError!.constraints!).join(' ')).toContain(
          'Slug thương hiệu',
        );
      });

      it('rejects an over-long name with a Vietnamese message', async () => {
        const { errors } = await validateDto({
          name: 'a'.repeat(101),
          slug: 'abc',
        });
        const nameError = errors.find((e) => e.property === 'name');
        expect(nameError?.constraints?.maxLength).toContain('tối đa 100 ký tự');
      });

      it('rejects an empty name with a Vietnamese message', async () => {
        const { errors } = await validateDto({ name: '   ', slug: 'abc' });
        const nameError = errors.find((e) => e.property === 'name');
        expect(nameError?.constraints?.isNotEmpty).toBe(
          'Tên thương hiệu không được để trống',
        );
      });
    });
  });

  // --- Bug 2: deleting a brand with products ---
  describe('remove', () => {
    it('blocks with 409 and the product count when products reference the brand', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: 'van-tay', count: 3 },
        { categorySlug: 'khach-san', subcategorySlug: null, count: 2 },
      ]);
      const err = await expectBusinessError(
        service.remove('yale'),
        'BRAND_HAS_PRODUCTS',
        409,
      );
      expect(err.message).toBe(
        'Không thể xóa thương hiệu Yale: còn 5 sản phẩm. Hãy chuyển hoặc xóa các sản phẩm trước.',
      );
      expect(repository.countProductsByTaxonomy).toHaveBeenCalledWith(BRAND_ID);
      expect(repository.deleteBrandWithTree).not.toHaveBeenCalled();
    });

    it('deletes the brand and its tree when no products reference it', async () => {
      const result = await service.remove('yale');
      expect(repository.deleteBrandWithTree).toHaveBeenCalledWith(BRAND_ID);
      expect(result.message).toBe('Đã xóa thương hiệu "Yale"');
    });

    it('maps a racing FK failure to 409 instead of 500', async () => {
      repository.deleteBrandWithTree.mockRejectedValue(
        new Error('D1_ERROR: FOREIGN KEY constraint failed: SQLITE_CONSTRAINT'),
      );
      await expectBusinessError(
        service.remove('yale'),
        'BRAND_HAS_PRODUCTS',
        409,
      );
    });
  });

  // --- Bug 3: category / subcategory deletion and rename with products ---
  describe('removeCategory', () => {
    it('blocks with 409 when products use the category', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: 'van-tay', count: 4 },
        { categorySlug: 'cua-go', subcategorySlug: null, count: 1 },
        { categorySlug: 'khach-san', subcategorySlug: null, count: 9 },
      ]);
      const err = await expectBusinessError(
        service.removeCategory('yale', 'cua-go'),
        'CATEGORY_HAS_PRODUCTS',
        409,
      );
      expect(err.message).toContain('còn 5 sản phẩm');
      expect(repository.deleteCategoryWithSubcategories).not.toHaveBeenCalled();
    });

    it('deletes an unused category', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'khach-san', subcategorySlug: null, count: 9 },
      ]);
      await service.removeCategory('yale', 'cua-go');
      expect(repository.deleteCategoryWithSubcategories).toHaveBeenCalledWith(
        CAT_ID,
      );
    });

    it('returns 404 for an unknown category', async () => {
      await expectBusinessError(
        service.removeCategory('yale', 'khong-co'),
        'CATEGORY_NOT_FOUND',
        404,
      );
    });
  });

  describe('removeSubcategory', () => {
    it('blocks with 409 when products use the subcategory', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: 'van-tay', count: 2 },
      ]);
      const err = await expectBusinessError(
        service.removeSubcategory('yale', 'cua-go', 'van-tay'),
        'SUBCATEGORY_HAS_PRODUCTS',
        409,
      );
      expect(err.message).toContain('còn 2 sản phẩm');
      expect(repository.deleteSubcategory).not.toHaveBeenCalled();
    });

    it('deletes a subcategory whose products sit in another subcategory', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: null, count: 2 },
      ]);
      await service.removeSubcategory('yale', 'cua-go', 'van-tay');
      expect(repository.deleteSubcategory).toHaveBeenCalledWith(SUB_ID);
    });
  });

  describe('updateCategory', () => {
    it('blocks a slug rename with 409 when products use the old slug', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: null, count: 7 },
      ]);
      const err = await expectBusinessError(
        service.updateCategory('yale', 'cua-go', { slug: 'cua-go-moi' }),
        'CATEGORY_HAS_PRODUCTS',
        409,
      );
      expect(err.message).toContain('còn 7 sản phẩm');
      expect(repository.updateCategoryWithSubcategories).not.toHaveBeenCalled();
    });

    it('allows renaming only the display name even when products exist', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: null, count: 7 },
      ]);
      await service.updateCategory('yale', 'cua-go', {
        name: 'Khóa Cửa Gỗ Cao Cấp',
        slug: 'cua-go',
      });
      expect(repository.updateCategoryWithSubcategories).toHaveBeenCalledWith(
        CAT_ID,
        { name: 'Khóa Cửa Gỗ Cao Cấp', slug: undefined },
        undefined,
      );
    });

    it('allows a slug rename when no products use the category', async () => {
      await service.updateCategory('yale', 'cua-go', { slug: 'Cửa Gỗ Mới' });
      expect(repository.updateCategoryWithSubcategories).toHaveBeenCalledWith(
        CAT_ID,
        { name: undefined, slug: 'cua-go-moi' },
        undefined,
      );
    });

    it('blocks dropping a subcategory that still has products', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'cua-go', subcategorySlug: 'van-tay', count: 1 },
      ]);
      await expectBusinessError(
        service.updateCategory('yale', 'cua-go', {
          subcategories: [{ name: 'Mật Mã' }],
        }),
        'SUBCATEGORY_HAS_PRODUCTS',
        409,
      );
    });

    // --- Bug 4: slug collision on update ---
    it('returns 409 when the new slug collides with another category', async () => {
      await expectBusinessError(
        service.updateCategory('yale', 'cua-go', { slug: 'khach-san' }),
        'CATEGORY_ALREADY_EXISTS',
        409,
      );
      expect(repository.updateCategoryWithSubcategories).not.toHaveBeenCalled();
    });

    // --- Bug 10: duplicate child slugs ---
    it('rejects duplicate subcategory slugs in the payload with 400', async () => {
      await expectBusinessError(
        service.updateCategory('yale', 'cua-go', {
          subcategories: [{ name: 'Vân Tay' }, { name: 'van tay' }],
        }),
        'BRAND_VALIDATION_ERROR',
        400,
      );
      expect(repository.updateCategoryWithSubcategories).not.toHaveBeenCalled();
    });
  });

  // --- Bug 4: brand slug collision on update ---
  describe('update', () => {
    it('returns 409 when the slug belongs to another brand', async () => {
      repository.findBySlug.mockResolvedValue({
        id: OTHER_BRAND_ID,
        name: 'Kaadas',
      } as never);
      const err = await expectBusinessError(
        service.update('yale', { slug: 'kaadas' }),
        'BRAND_ALREADY_EXISTS',
        409,
      );
      expect(err.message).toContain('Kaadas');
      expect(repository.updateBrandWithTree).not.toHaveBeenCalled();
    });

    it('allows keeping its own slug', async () => {
      repository.findBySlug.mockResolvedValue({
        id: BRAND_ID,
        name: 'Yale',
      } as never);
      await service.update('yale', { name: 'Yale Mới', slug: 'yale' });
      expect(repository.updateBrandWithTree).toHaveBeenCalledWith(
        BRAND_ID,
        expect.objectContaining({ name: 'Yale Mới', slug: 'yale' }),
        undefined,
      );
    });

    it('replaces the category tree in a single repository call (one batch)', async () => {
      await service.update('yale', {
        categories: [
          {
            name: 'Khóa Cửa Gỗ',
            slug: 'cua-go',
            subcategories: [{ name: 'Khóa Vân Tay' }],
          },
        ],
      });
      expect(repository.updateBrandWithTree).toHaveBeenCalledTimes(1);
      const tree = repository.updateBrandWithTree.mock.calls[0][2];
      expect(tree?.categories).toHaveLength(1);
      expect(tree?.subcategories[0]).toMatchObject({
        slug: 'khoa-van-tay',
        categoryId: tree?.categories[0].id,
      });
    });

    it('blocks a tree replacement that drops a category with products', async () => {
      repository.countProductsByTaxonomy.mockResolvedValue([
        { categorySlug: 'khach-san', subcategorySlug: null, count: 3 },
      ]);
      await expectBusinessError(
        service.update('yale', {
          categories: [{ name: 'Khóa Cửa Gỗ', slug: 'cua-go' }],
        }),
        'CATEGORY_HAS_PRODUCTS',
        409,
      );
      expect(repository.updateBrandWithTree).not.toHaveBeenCalled();
    });

    it('maps a UNIQUE constraint failure to 409 instead of 500', async () => {
      repository.updateBrandWithTree.mockRejectedValue(
        new Error('UNIQUE constraint failed: brands.slug'),
      );
      await expectBusinessError(
        service.update('yale', { name: 'Yale' }),
        'BRAND_ALREADY_EXISTS',
        409,
      );
    });
  });

  describe('create', () => {
    it('returns 409 if the slug already exists', async () => {
      repository.findBySlug.mockResolvedValue({
        id: OTHER_BRAND_ID,
        name: 'Yale',
      } as never);
      await expectBusinessError(
        service.create({ id: BRAND_ID, name: 'Yale', slug: 'yale' }),
        'BRAND_ALREADY_EXISTS',
        409,
      );
    });

    it('writes brand + tree in one repository call and returns the created brand', async () => {
      const result = await service.create({
        id: BRAND_ID,
        name: 'Yale',
        slug: 'yale',
        categories: [
          {
            id: CAT_ID,
            name: 'Khóa Cửa Gỗ',
            slug: 'cua-go',
            subcategories: [
              { id: SUB_ID, name: 'Khóa Vân Tay', slug: 'van-tay' },
            ],
          },
        ],
      });
      expect(repository.createBrandWithTree).toHaveBeenCalledTimes(1);
      const [, cats, subs] = repository.createBrandWithTree.mock.calls[0];
      expect(cats).toEqual([
        { id: CAT_ID, brandId: BRAND_ID, name: 'Khóa Cửa Gỗ', slug: 'cua-go' },
      ]);
      expect(subs).toEqual([
        {
          id: SUB_ID,
          categoryId: CAT_ID,
          name: 'Khóa Vân Tay',
          slug: 'van-tay',
        },
      ]);
      expect(result).toEqual(mockBrand);
    });

    // --- Bug 10: duplicate child slugs rejected up front ---
    it('rejects duplicate category slugs before writing anything', async () => {
      await expectBusinessError(
        service.create({
          name: 'Yale',
          categories: [{ name: 'Cửa Gỗ' }, { name: 'cua go' }],
        }),
        'BRAND_VALIDATION_ERROR',
        400,
      );
      expect(repository.createBrandWithTree).not.toHaveBeenCalled();
    });

    it('rejects duplicate subcategory slugs before writing anything', async () => {
      await expectBusinessError(
        service.create({
          name: 'Yale',
          categories: [
            {
              name: 'Cửa Gỗ',
              subcategories: [{ name: 'Vân tay' }, { name: 'Vân Tay' }],
            },
          ],
        }),
        'BRAND_VALIDATION_ERROR',
        400,
      );
      expect(repository.createBrandWithTree).not.toHaveBeenCalled();
    });
  });

  describe('addCategory', () => {
    it('returns 409 if the category slug exists in the brand', async () => {
      await expectBusinessError(
        service.addCategory('yale', { name: 'Khóa Cửa Gỗ', slug: 'cua-go' }),
        'CATEGORY_ALREADY_EXISTS',
        409,
      );
    });

    it('inserts category and subcategories in one repository call', async () => {
      const result = await service.addCategory('yale', {
        id: '9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b',
        name: 'Khóa Đại Sảnh',
        subcategories: [{ name: 'Face ID' }],
      });
      const [cat, subs] =
        repository.insertCategoryWithSubcategories.mock.calls[0];
      expect(cat).toMatchObject({ brandId: BRAND_ID, slug: 'khoa-dai-sanh' });
      expect(subs[0]).toMatchObject({ categoryId: cat.id, slug: 'face-id' });
      expect(result).toEqual(mockBrand);
    });

    it('rejects duplicate subcategory slugs with 400 and writes nothing', async () => {
      await expectBusinessError(
        service.addCategory('yale', {
          name: 'Khóa Đại Sảnh',
          subcategories: [{ name: 'Face ID' }, { name: 'face-id' }],
        }),
        'BRAND_VALIDATION_ERROR',
        400,
      );
      expect(repository.insertCategoryWithSubcategories).not.toHaveBeenCalled();
    });
  });
});
