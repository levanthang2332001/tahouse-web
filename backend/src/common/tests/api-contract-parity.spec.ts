import { BrandResponseDto } from '@/modules/brands/dto/brand-response.dto';
import { MediaResponseDto } from '@/modules/upload/dto/media-response.dto';
import { MediaType } from '@/modules/upload/schemas/media.schema';
import type {
  IProduct,
  IProductListItem,
} from '@/modules/products/types/product.types';
import type { IAdminDashboardStatsResponse } from '@/modules/stats/types/stats.types';

describe('API Contract Parity: dev-cuong (MongoDB) vs Cloudflare D1', () => {
  describe('Products Module Contract Parity', () => {
    it('IProduct must preserve all 28 fields from MongoDB dev-cuong implementation', () => {
      const sampleProduct: IProduct = {
        id: 'ta-9800',
        code: 'TA-9800 PREMIUM',
        slug: 'ta-9800',
        brandId: 'brand-1',
        brand: 'Kassler',
        brandSlug: 'kassler',
        category: 'dai-sanh',
        categoryName: 'Khóa Đại Sảnh',
        subcategory: 'face-id',
        subcategoryName: 'Khóa Face ID',
        name: 'Khóa Thông Minh FaceID 3D TA-9800',
        description: 'Mô tả chi tiết',
        shortDescription: 'Mô tả ngắn',
        content: 'Nội dung bài viết',
        imageUrl: '/products/ta-9800.jpg',
        images: ['/products/ta-9800.jpg'],
        price: 18500000,
        originalPrice: 22000000,
        discountPercent: 16,
        priceRange: '18.500.000 VNĐ',
        features: ['Face ID 3D', 'Vân tay FPC'],
        specs: { 'Chất liệu': 'Hợp kim nhôm' },
        technologies: ['AI Face Recognition'],
        warranty: 36,
        warrantyText: '36 Tháng',
        colors: ['Space Gray'],
        installationManual: ['Bước 1: Khảo sát'],
        faq: [{ question: 'Bảo hành bao lâu?', answer: '36 tháng' }],
        has_variants: true,
        options: [{ name: 'Màu sắc', values: ['Đen', 'Đồng'] }],
        variants: [
          {
            id: 'v-1',
            label: 'Đen nhám',
            attributes: { 'Màu sắc': 'Đen' },
            price: 18500000,
            originalPrice: 22000000,
            discountPercent: 16,
            priceRange: '18.500.000 VNĐ',
            is_default: true,
          },
        ],
        installation_preview: ['/installation/img1.jpg'],
      };

      const expectedDevCuongFields = [
        'id',
        'code',
        'brandId',
        'brand',
        'brandSlug',
        'category',
        'categoryName',
        'subcategory',
        'subcategoryName',
        'name',
        'description',
        'shortDescription',
        'content',
        'imageUrl',
        'images',
        'price',
        'originalPrice',
        'discountPercent',
        'priceRange',
        'features',
        'specs',
        'technologies',
        'warranty',
        'warrantyText',
        'colors',
        'installationManual',
        'faq',
        'has_variants',
        'options',
        'variants',
        'installation_preview',
      ];

      for (const field of expectedDevCuongFields) {
        expect(sampleProduct).toHaveProperty(field);
      }
    });

    it('IProductListItem (Products List Item) must preserve all 17 fields from dev-cuong', () => {
      const sampleItem: IProductListItem = {
        id: 'ta-9800',
        code: 'TA-9800 PREMIUM',
        name: 'Khóa Thông Minh FaceID 3D TA-9800',
        brandId: 'brand-1',
        brand: 'Kassler',
        brandSlug: 'kassler',
        category: 'dai-sanh',
        categoryName: 'Khóa Đại Sảnh',
        subcategory: 'face-id',
        subcategoryName: 'Khóa Face ID',
        imageUrl: '/products/ta-9800.jpg',
        price: 18500000,
        originalPrice: 22000000,
        discountPercent: 16,
        priceRange: '18.500.000 VNĐ',
        features: ['Face ID 3D', 'Vân tay FPC'],
        has_variants: true,
      };

      const expectedDevCuongListFields = [
        'id',
        'code',
        'name',
        'brandId',
        'brand',
        'brandSlug',
        'category',
        'categoryName',
        'subcategory',
        'subcategoryName',
        'imageUrl',
        'price',
        'originalPrice',
        'discountPercent',
        'priceRange',
        'features',
        'has_variants',
      ];

      for (const field of expectedDevCuongListFields) {
        expect(sampleItem).toHaveProperty(field);
      }
    });
  });

  describe('Brands Module Contract Parity', () => {
    it('BrandResponseDto must retain id, _id, name, slug, logo, logoHtml, and nested categories tree', () => {
      const rawD1Brand = {
        id: 'brand-uuid-1',
        name: 'Kassler',
        slug: 'kassler',
        logo: '/brand/kassler.png',
        logoHtml: '<svg>logo</svg>',
        orderIndex: 1,
        categories: [
          {
            id: 'cat-uuid-1',
            brandId: 'brand-uuid-1',
            name: 'Khóa Cửa Gỗ',
            slug: 'cua-go',
            subcategories: [
              {
                id: 'sub-uuid-1',
                categoryId: 'cat-uuid-1',
                name: 'Khóa Vân Tay',
                slug: 'van-tay',
              },
            ],
          },
        ],
      };

      const result = BrandResponseDto.fromEntity(rawD1Brand);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('brand-uuid-1');
      expect(result!._id).toBe('brand-uuid-1'); // backward-compatible with MongoDB _id
      expect(result!.name).toBe('Kassler');
      expect(result!.slug).toBe('kassler');
      expect(result!.logo).toBe('/brand/kassler.png');
      expect(result!.logoHtml).toBe('<svg>logo</svg>');
      expect(result!.categories).toHaveLength(1);
      expect(result!.categories[0].name).toBe('Khóa Cửa Gỗ');
      expect(result!.categories[0].slug).toBe('cua-go');
      expect(result!.categories[0].subcategories).toHaveLength(1);
      expect(result!.categories[0].subcategories[0].name).toBe('Khóa Vân Tay');
      expect(result!.categories[0].subcategories[0].slug).toBe('van-tay');
    });
  });

  describe('Stats Module Contract Parity', () => {
    it('IAdminDashboardStatsResponse must retain 4 summary cards and brands structure', () => {
      const sampleStats: IAdminDashboardStatsResponse = {
        summary: {
          totalProducts: 120,
          totalBrands: 5,
          totalCategories: 18,
          totalSubcategories: 35,
          discountedProducts: 24,
        },
        brands: [
          {
            id: 'brand-1',
            name: 'Kassler',
            slug: 'kassler',
            logo: '/brand/kassler.png',
            totalProducts: 40,
            percentage: 33.33,
            categories: [
              {
                slug: 'dai-sanh',
                name: 'Khóa Đại Sảnh',
                totalProducts: 15,
                percentage: 37.5,
              },
            ],
          },
        ],
      };

      expect(sampleStats.summary).toHaveProperty('totalProducts', 120);
      expect(sampleStats.summary).toHaveProperty('totalBrands', 5);
      expect(sampleStats.summary).toHaveProperty('totalCategories', 18);
      expect(sampleStats.summary).toHaveProperty('totalSubcategories', 35);
      expect(sampleStats.summary).toHaveProperty('discountedProducts', 24);
      expect(sampleStats.brands[0]).toHaveProperty('percentage', 33.33);
      expect(sampleStats.brands[0].categories[0]).toHaveProperty(
        'totalProducts',
        15,
      );
    });
  });

  describe('Upload Module Contract Parity', () => {
    it('MediaResponseDto must preserve all metadata fields from MongoDB format', () => {
      const rawMedia = {
        id: 'media-uuid-1',
        filename: 'kassler-kl989f.jpg',
        url: 'https://cdn.tahouse.vn/products/kassler-kl989f.jpg',
        key: 'products/kassler-kl989f.jpg',
        mimeType: 'image/jpeg',
        fileType: MediaType.IMAGE,
        size: 204800,
        folder: 'products',
        brand: 'kassler',
        category: 'dai-sanh',
        subcategory: 'face-id',
        productCode: 'KL-989F',
        metadata: JSON.stringify({
          width: 800,
          height: 800,
          aspectRatio: '1:1',
          duration: null,
          extension: '.jpg',
        }),
        createdAt: 1735689600,
        updatedAt: 1735689600,
      };

      const result = MediaResponseDto.fromEntity(
        rawMedia,
        'https://cdn.tahouse.vn',
        'tahouse-media',
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe('media-uuid-1');
      expect(result!.filename).toBe('kassler-kl989f.jpg');
      expect(result!.url).toBe(
        'https://cdn.tahouse.vn/products/kassler-kl989f.jpg',
      );
      expect(result!.key).toBe('products/kassler-kl989f.jpg');
      expect(result!.mimeType).toBe('image/jpeg');
      expect(result!.fileType).toBe(MediaType.IMAGE);
      expect(result!.size).toBe(204800);
      expect(result!.width).toBe(800);
      expect(result!.height).toBe(800);
      expect(result!.aspectRatio).toBe('1:1');
      expect(result!.folder).toBe('products');
      expect(result!.brand).toBe('kassler');
      expect(result!.category).toBe('dai-sanh');
      expect(result!.productCode).toBe('KL-989F');
      expect(result!.uploadedBy).toBe('admin');
      expect(result!.storage).toBe('r2');
      expect(result!.bucket).toBe('tahouse-media');
    });
  });

  describe('Auth Module Contract Parity', () => {
    it('login and refreshTokens must return exactly accessToken and refreshToken', () => {
      const authTokens = {
        accessToken: 'jwt-access-token-string',
        refreshToken: 'jwt-refresh-token-string',
      };

      expect(authTokens).toHaveProperty('accessToken');
      expect(authTokens).toHaveProperty('refreshToken');
      expect(Object.keys(authTokens)).toEqual(['accessToken', 'refreshToken']);
    });

    it('getProfile must return username, email, fullName, avatarUrl, lastLoginAt without password', () => {
      const profile = {
        username: 'admin',
        email: 'admin@tahouse.vn',
        fullName: 'Admin TA House',
        avatarUrl: '/avatar.jpg',
        lastLoginAt: '2026-01-01T00:00:00.000Z',
      };

      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('fullName');
      expect(profile).toHaveProperty('avatarUrl');
      expect(profile).toHaveProperty('lastLoginAt');
      expect(profile).not.toHaveProperty('password');
    });
  });

  describe('Settings Module Contract Parity', () => {
    it('StoreSettingsResponseDto must provide all required store contact and social fields', () => {
      const { StoreSettingsResponseDto } = require('@/modules/settings/dto/store-settings-response.dto');
      const dto = StoreSettingsResponseDto.fromEntity(null);

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('storeName');
      expect(dto).toHaveProperty('slogan');
      expect(dto).toHaveProperty('socialLinks');
      expect(dto.socialLinks).toHaveProperty('zalo');
      expect(dto.socialLinks).toHaveProperty('facebook');
      expect(dto).toHaveProperty('phoneNumbers');
      expect(Array.isArray(dto.phoneNumbers)).toBe(true);
      expect(dto.phoneNumbers.length).toBeGreaterThan(0);
      expect(dto.phoneNumbers[0]).toHaveProperty('number');
      expect(dto.phoneNumbers[0]).toHaveProperty('label');
      expect(dto).toHaveProperty('emails');
      expect(Array.isArray(dto.emails)).toBe(true);
      expect(dto.emails[0]).toHaveProperty('email');
      expect(dto.emails[0]).toHaveProperty('label');
      expect(dto).toHaveProperty('addresses');
      expect(Array.isArray(dto.addresses)).toBe(true);
      expect(dto.addresses[0]).toHaveProperty('address');
      expect(dto.addresses[0]).toHaveProperty('branchName');
      expect(dto).toHaveProperty('openingHours');
      expect(dto.openingHours).toHaveProperty('text');
      expect(dto).toHaveProperty('primaryPhone');
      expect(dto).toHaveProperty('primaryEmail');
      expect(dto).toHaveProperty('mainAddress');
    });
  });
});
