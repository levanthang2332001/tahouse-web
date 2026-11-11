import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions';
import { validationExceptionFactory } from '@/common/exceptions/validation-exception.factory';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

/** Same options as the global pipe in main.ts / worker.ts. */
const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  exceptionFactory: validationExceptionFactory,
});

const BRAND_ID = '7afccd8e-940e-4e9f-81bb-8754925f6e48';

const validateCreate = (body: Record<string, unknown>) =>
  pipe.transform(body, {
    type: 'body',
    metatype: CreateProductDto,
  }) as Promise<CreateProductDto>;

const validateUpdate = (body: Record<string, unknown>) =>
  pipe.transform(body, {
    type: 'body',
    metatype: UpdateProductDto,
  }) as Promise<UpdateProductDto>;

async function expectRejected(
  promise: Promise<unknown>,
  field: string,
  messagePart?: string,
) {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(BusinessException);
  const error = caught as BusinessException;
  expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  expect(error.field).toBe(field);
  if (messagePart) expect(error.message).toContain(messagePart);
}

/** What the admin ProductForm actually posts (after the BFF resolves brandId). */
const formPayload = () => ({
  id: 'Khóa Điện Tử Kassler KL-600',
  code: 'KL-600',
  name: 'Khóa Điện Tử Kassler KL-600',
  brand: 'Kassler',
  brandSlug: 'kassler',
  brandId: BRAND_ID,
  category: 'dai-sanh',
  categoryName: 'Khóa Đại Sảnh',
  subcategory: '',
  subcategoryName: '',
  imageUrl: '/images/placeholder-product.png',
  price: null,
  originalPrice: null,
  priceRange: 'Liên hệ',
  features: ['Mở khóa Face ID'],
  has_variants: false,
  variants: [],
  options: [],
  description: '<p>Mô tả</p>',
  shortDescription: 'Ngắn',
  content: '<p>Mô tả</p>',
  priority: 10,
  images: ['/uploads/a.jpg', 'https://cdn.tahouse.vn/products/b.jpg'],
  specs: { 'Chất liệu': 'Hợp kim', 'Số vân tay': 100 },
  technologies: [],
  warranty: 24,
  warrantyText: 'Chính hãng 24 tháng',
  colors: [],
  installationManual: [],
  faq: [],
  installation: {
    images: ['https://cdn.tahouse.vn/installation/1.jpg'],
    videos: ['https://cdn.tahouse.vn/installation/clip.mp4'],
  },
});

describe('Product DTOs through the real ValidationPipe', () => {
  describe('CreateProductDto', () => {
    it('accepts the admin form payload with a UUID brandId and no price (bug: every save was 400)', async () => {
      const dto = await validateCreate(formPayload());
      expect(dto).toBeInstanceOf(CreateProductDto);
      expect(dto.brandId).toBe(BRAND_ID);
      // "Liên hệ": null price becomes 0 for the NOT NULL column
      expect(dto.price).toBe(0);
      expect(dto.originalPrice).toBeNull();
      // admin id is normalized with a Vietnamese-aware slugify
      expect(dto.id).toBe('khoa-dien-tu-kassler-kl-600');
      expect(dto.installation?.videos).toEqual([
        'https://cdn.tahouse.vn/installation/clip.mp4',
      ]);
      // whitelist strips fields the backend does not own
      expect(dto).not.toHaveProperty('brand');
      expect(dto).not.toHaveProperty('categoryName');
    });

    it('rejects a numeric brandId', async () => {
      await expectRejected(
        validateCreate({ ...formPayload(), brandId: 1 }),
        'brandId',
      );
    });

    it('rejects a non-UUID brandId with a Vietnamese message', async () => {
      await expectRejected(
        validateCreate({ ...formPayload(), brandId: 'kassler' }),
        'brandId',
        'không hợp lệ',
      );
    });

    it('requires brandId and category on create', async () => {
      const noBrand = formPayload() as Record<string, unknown>;
      delete noBrand.brandId;
      await expectRejected(
        validateCreate(noBrand),
        'brandId',
        'Vui lòng chọn thương hiệu',
      );

      await expectRejected(
        validateCreate({ ...formPayload(), category: '   ' }),
        'category',
        'danh mục chính',
      );
    });

    it('rejects an id that cannot become a slug', async () => {
      await expectRejected(
        validateCreate({ ...formPayload(), id: '!!!' }),
        'id',
        'ID/slug',
      );
    });

    it('lets an empty id through so the service derives one from the code', async () => {
      const dto = await validateCreate({ ...formPayload(), id: '' });
      expect(dto.id).toBe('');
    });

    it('limits name and code length', async () => {
      await expectRejected(
        validateCreate({ ...formPayload(), name: 'x'.repeat(256) }),
        'name',
        'tối đa',
      );
      await expectRejected(
        validateCreate({ ...formPayload(), code: 'x'.repeat(65) }),
        'code',
        'tối đa',
      );
    });

    it('requires an integer warranty ≥ 0 and an integer priority', async () => {
      await expectRejected(
        validateCreate({ ...formPayload(), warranty: 1.5 }),
        'warranty',
        'nguyên',
      );
      await expectRejected(
        validateCreate({ ...formPayload(), warranty: -1 }),
        'warranty',
        'âm',
      );
      await expectRejected(
        validateCreate({ ...formPayload(), priority: 2.5 }),
        'priority',
        'nguyên',
      );
    });

    it.each([
      ['//evil.example.com/x.jpg'],
      ['http://insecure.example.com/x.jpg'],
      ['javascript:alert(1)'],
      ['uploads/no-leading-slash.jpg'],
    ])('rejects image URL %s', async (url) => {
      await expectRejected(
        validateCreate({ ...formPayload(), images: [url] }),
        'images',
        'https://',
      );
    });

    it('validates installation video URLs too', async () => {
      await expectRejected(
        validateCreate({
          ...formPayload(),
          installation: { images: [], videos: ['//evil.example.com/v.mp4'] },
        }),
        'videos',
        'video',
      );
    });

    it('rejects nested or non-scalar spec values', async () => {
      await expectRejected(
        validateCreate({ ...formPayload(), specs: { a: { b: 1 } } }),
        'specs',
        'Thông số',
      );
      await expectRejected(
        validateCreate({ ...formPayload(), specs: { a: ['x'] } }),
        'specs',
      );
    });

    it('rejects price > originalPrice', async () => {
      let caught: unknown;
      try {
        await validateCreate({
          ...formPayload(),
          price: 5000000,
          originalPrice: 4000000,
        });
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(BusinessException);
      expect((caught as BusinessException).errorName).toBe(
        'PRODUCT_INVALID_PRICE',
      );
    });
  });

  describe('UpdateProductDto', () => {
    it('accepts originalPrice: null so the original price can be cleared', async () => {
      const dto = await validateUpdate({ originalPrice: null });
      expect(dto).toBeInstanceOf(UpdateProductDto);
      expect(dto.originalPrice).toBeNull();
    });

    it('turns price: null into 0 ("Liên hệ")', async () => {
      const dto = await validateUpdate({ price: null });
      expect(dto.price).toBe(0);
    });

    it('accepts the full edit form payload, keeping installation videos and priority', async () => {
      const dto = await validateUpdate({ ...formPayload(), priority: 3 });
      expect(dto.installation).toEqual(formPayload().installation);
      expect(dto.priority).toBe(3);
    });

    it('rejects null for required fields instead of hitting NOT NULL columns', async () => {
      await expectRejected(
        validateUpdate({ name: null }),
        'name',
        'không được để trống',
      );
      await expectRejected(validateUpdate({ brandId: null }), 'brandId');
      await expectRejected(validateUpdate({ category: null }), 'category');
    });

    it('still validates types on partial updates', async () => {
      await expectRejected(validateUpdate({ brandId: 123 }), 'brandId');
      await expectRejected(validateUpdate({ priority: 'abc' }), 'priority');
    });

    it('accepts an empty body', async () => {
      await expect(validateUpdate({})).resolves.toBeInstanceOf(
        UpdateProductDto,
      );
    });
  });
});
