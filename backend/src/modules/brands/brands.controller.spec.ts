import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BrandResponseDto } from './dto/brand-response.dto';

describe('BrandsController', () => {
  let controller: BrandsController;
  let brandsService: jest.Mocked<BrandsService>;

  const mockBrand: BrandResponseDto = {
    id: 'brand-1',
    name: 'Kassler',
    slug: 'kassler',
    logo: '/brand/kassler.png',
    orderIndex: 0,
    categories: [
      {
        id: 'cat-1',
        name: 'Khóa Đại Sảnh',
        slug: 'dai-sanh',
        subcategories: [
          {
            id: 'sub-1',
            name: 'Khóa Face ID',
            slug: 'face-id',
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    brandsService = {
      findAll: jest.fn().mockResolvedValue([mockBrand]),
    } as unknown as jest.Mocked<BrandsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        {
          provide: BrandsService,
          useValue: brandsService,
        },
      ],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  describe('findAll', () => {
    it('should return complete brand tree with nested categories and subcategories', async () => {
      const result = await controller.findAll();

      expect(brandsService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('kassler');
      expect(result[0].categories[0].slug).toBe('dai-sanh');
      expect(result[0].categories[0].subcategories[0].slug).toBe('face-id');
    });
  });
});
