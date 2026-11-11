import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '@/database/schema';
import { ProductsRepository } from './products.repository';

/**
 * Uses the real drizzle sqlite-proxy driver (the same one the Node backend uses) and records
 * every SQL statement, so the tests check the WHERE values and inserted columns that actually
 * reach the database instead of a hand-built query-builder mock.
 */
interface RecordedQuery {
  sql: string;
  params: unknown[];
  method: string;
}

const DB_ID = '3f1c9a2e-5b7d-4c8e-9f0a-1b2c3d4e5f60';
const BRAND_ID = '7afccd8e-940e-4e9f-81bb-8754925f6e48';
const IMAGE_BASE_URL = 'https://cdn.tahouse.vn';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let queries: RecordedQuery[];
  let respond: (query: RecordedQuery) => unknown[][] | unknown[];

  const dbRow: Record<string, unknown> = {
    id: DB_ID,
    code: 'KL-989F',
    slug: 'kl-989f',
    name: 'Khóa cửa vân tay Kassler KL-989F',
    brandId: BRAND_ID,
    brand: 'Kassler',
    brandSlug: 'kassler',
    category: 'dai-sanh',
    categoryName: 'Khóa Đại Sảnh',
    subcategory: 'face-id',
    subcategoryName: 'Khóa Face ID',
    description: 'Khóa cửa cao cấp',
    shortDescription: 'Face ID 3D',
    content: '',
    imageUrl: '/products/kl-989f.jpg',
    images: JSON.stringify(['/products/kl-989f-1.jpg']),
    price: 32450000,
    originalPrice: 64890000,
    discountPercent: 50,
    priceRange: '32.450.000 VNĐ',
    features: JSON.stringify(['Face ID']),
    specs: JSON.stringify({ 'Chất liệu': 'Hợp kim' }),
    technologies: JSON.stringify([]),
    warranty: 36,
    warrantyText: '3 năm',
    colors: JSON.stringify(['Đen']),
    installation: JSON.stringify({
      images: [
        '/installation/1.jpg',
        '/installation/2.jpg',
        '/installation/3.jpg',
        '/installation/4.jpg',
      ],
      videos: ['/installation/clip.mp4'],
    }),
    installationManual: JSON.stringify([]),
    faq: JSON.stringify([]),
    has_variants: 0,
    options: JSON.stringify([]),
    variants: JSON.stringify([]),
    priority: 5,
    createdAt: 1767225600,
  };

  /** Row in the column order of the repository's aggregation select (how the proxy driver returns rows). */
  const asSelectRow = () =>
    Object.keys(
      (repository as any).getProductAggregationSelect() as Record<
        string,
        unknown
      >,
    ).map((key) => dbRow[key] ?? null);

  beforeEach(() => {
    queries = [];
    respond = () => [];
    const db = drizzle(
      (sql, params, method) => {
        const query = { sql, params, method };
        queries.push(query);
        return Promise.resolve({ rows: respond(query) as any[] });
      },
      { schema },
    );

    const configService = {
      get: jest.fn().mockReturnValue(IMAGE_BASE_URL),
    } as unknown as ConfigService;

    repository = new ProductsRepository(db, configService);
  });

  describe('findRecordByIdOrCode', () => {
    beforeEach(() => {
      respond = (q) => (q.sql.startsWith('select') ? [asSelectRow()] : []);
    });

    it('returns the real DB id separately from the public id (= slug)', async () => {
      const record = await repository.findRecordByIdOrCode('KL-989F');
      expect(record?.dbId).toBe(DB_ID);
      expect(record?.product.id).toBe('kl-989f');
      expect(record?.product.slug).toBe('kl-989f');
    });

    it('matches exactly and case-insensitively, never with LIKE wildcards', async () => {
      await repository.findRecordByIdOrCode('KL_989%');
      const { sql, params } = queries[0];
      expect(sql.toLowerCase()).not.toContain(' like ');
      expect(sql).toContain('LOWER("products"."slug") = ?');
      expect(sql).toContain('LOWER("products"."code") = ?');
      expect(params).toEqual(expect.arrayContaining(['KL_989%', 'kl_989%']));
    });

    it('public read: only a 3-image installation preview, no admin fields', async () => {
      const record = await repository.findRecordByIdOrCode('kl-989f');
      expect(record?.product.installation_preview).toEqual([
        `${IMAGE_BASE_URL}/installation/1.jpg`,
        `${IMAGE_BASE_URL}/installation/2.jpg`,
        `${IMAGE_BASE_URL}/installation/3.jpg`,
      ]);
      expect(record?.product).not.toHaveProperty('installation');
      expect(record?.product).not.toHaveProperty('priority');
    });

    it('admin read: full installation (all images + videos) and priority', async () => {
      const record = await repository.findRecordByIdOrCode('kl-989f', {
        includeAdminFields: true,
      });
      expect(record?.product.installation).toEqual({
        images: [1, 2, 3, 4].map(
          (n) => `${IMAGE_BASE_URL}/installation/${n}.jpg`,
        ),
        videos: [`${IMAGE_BASE_URL}/installation/clip.mp4`],
      });
      expect(record?.product.priority).toBe(5);
    });

    it('returns undefined when nothing matches', async () => {
      respond = () => [];
      await expect(
        repository.findRecordByIdOrCode('nope'),
      ).resolves.toBeUndefined();
    });
  });

  describe('updateProduct', () => {
    it('updates WHERE id = <DB uuid> and re-reads the row', async () => {
      respond = (q) =>
        q.sql.startsWith('update') ? [[DB_ID]] : [asSelectRow()];

      const result = await repository.updateProduct(DB_ID, {
        name: 'Tên mới',
        originalPrice: null,
        price: 0,
      });

      const update = queries.find((q) => q.sql.startsWith('update'))!;
      expect(update.sql).toContain('where "products"."id" = ?');
      expect(update.sql).toContain('returning');
      expect(update.params[update.params.length - 1]).toBe(DB_ID);
      // originalPrice: null is written as NULL (clears it), price 0 = "Liên hệ"
      expect(update.params.slice(0, 3)).toEqual(['Tên mới', 0, null]);
      expect(result?.id).toBe('kl-989f');
    });

    it('returns undefined when 0 rows were updated', async () => {
      respond = () => [];
      await expect(
        repository.updateProduct('kl-989f', { name: 'x' }),
      ).resolves.toBeUndefined();
      expect(queries.filter((q) => q.sql.startsWith('select'))).toHaveLength(0);
    });

    it('stores installation media as paths, keeping videos (round trip of an admin read)', async () => {
      respond = (q) =>
        q.sql.startsWith('update') ? [[DB_ID]] : [asSelectRow()];
      await repository.updateProduct(DB_ID, {
        installation: {
          images: [
            `${IMAGE_BASE_URL}/installation/1.jpg`,
            'https://other.example.com/x.jpg',
          ],
          videos: [`${IMAGE_BASE_URL}/installation/clip.mp4`],
        },
      });
      const update = queries.find((q) => q.sql.startsWith('update'))!;
      expect(update.params).toContain(
        JSON.stringify({
          images: ['/installation/1.jpg', 'https://other.example.com/x.jpg'],
          videos: ['/installation/clip.mp4'],
        }),
      );
    });
  });

  describe('deleteProduct', () => {
    it('deletes WHERE id = <DB uuid> and reports true when a row was removed', async () => {
      respond = () => [[DB_ID]];
      await expect(repository.deleteProduct(DB_ID)).resolves.toBe(true);
      expect(queries[0].sql).toContain('delete from "products"');
      expect(queries[0].params).toEqual([DB_ID]);
    });

    it('reports false when nothing was deleted', async () => {
      respond = () => [];
      await expect(repository.deleteProduct('kl-989f')).resolves.toBe(false);
    });
  });

  describe('createProduct', () => {
    beforeEach(() => {
      respond = (q) => (q.sql.startsWith('select') ? [asSelectRow()] : []);
    });

    it('stores "Liên hệ" as price 0 (NOT NULL column) and the UUID brand id as-is', async () => {
      await repository.createProduct({
        code: 'KL-600',
        name: 'Khóa KL-600',
        slug: 'khoa-kl-600',
        brandId: BRAND_ID,
        category: 'dai-sanh',
      });
      const insert = queries.find((q) => q.sql.startsWith('insert'))!;
      const columns = insert.sql
        .slice(insert.sql.indexOf('(') + 1, insert.sql.indexOf(')'))
        .split(',')
        .map((c) => c.trim().replace(/"/g, ''));
      const valueOf = (column: string) => {
        const index = columns.indexOf(column);
        expect(index).toBeGreaterThanOrEqual(0);
        return insert.params[index];
      };
      expect(valueOf('price')).toBe(0);
      expect(valueOf('brand_id')).toBe(BRAND_ID);
      expect(valueOf('slug')).toBe('khoa-kl-600');
      expect(valueOf('category_slug')).toBe('dai-sanh');
      expect(valueOf('subcategory_slug')).toBeNull();
      expect(valueOf('warranty')).toBe(36);
    });

    it('keeps warranty 0 and priority 0 instead of replacing them with defaults', async () => {
      await repository.createProduct({
        code: 'KL-601',
        name: 'Khóa KL-601',
        slug: 'kl-601',
        brandId: BRAND_ID,
        category: 'dai-sanh',
        warranty: 0,
        priority: 0,
      });
      const insert = queries.find((q) => q.sql.startsWith('insert'))!;
      const columns = insert.sql
        .slice(insert.sql.indexOf('(') + 1, insert.sql.indexOf(')'))
        .split(',')
        .map((c) => c.trim().replace(/"/g, ''));
      expect(insert.params[columns.indexOf('warranty')]).toBe(0);
      expect(insert.params[columns.indexOf('priority')]).toBe(0);
    });
  });
});
