import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import {
  CreateBrandDto,
  CategoryDto,
  SubcategoryDto,
  UpdateCategoryItemDto,
} from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { removeDiacritics } from '@/common/utils/string.util';
import type { IBrand } from './types/brand.types';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  async findAll(): Promise<IBrand[]> {
    const brands = await this.brandModel.find().sort({ id: 1 }).lean().exec();
    return brands.map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      logoHtml: b.logoHtml,
      categories: b.categories || [],
    }));
  }

  async findOne(idOrSlug: string | number): Promise<any> {
    const isNum = !isNaN(Number(idOrSlug));
    const brand = await this.brandModel
      .findOne({
        $or: [
          ...(isNum ? [{ id: Number(idOrSlug) }] : []),
          { slug: String(idOrSlug).toLowerCase().trim() },
        ],
      })
      .lean()
      .exec();

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${idOrSlug}`);
    }
    return brand;
  }

  async create(createBrandDto: CreateBrandDto): Promise<any> {
    const cleanSlug = (
      createBrandDto.slug ||
      removeDiacritics(createBrandDto.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
    ).trim();

    let brandId = createBrandDto.id;
    if (!brandId) {
      const maxBrand = await this.brandModel
        .findOne()
        .sort({ id: -1 })
        .lean()
        .exec();
      brandId = (maxBrand?.id ?? 0) + 1;
    }

    const existing = await this.brandModel.findOne({
      $or: [{ id: brandId }, { slug: cleanSlug }],
    });
    if (existing) {
      throw new ConflictException(
        `Brand with ID "${brandId}" or slug "${cleanSlug}" already exists`,
      );
    }

    const newBrand = new this.brandModel({
      ...createBrandDto,
      id: brandId,
      slug: cleanSlug,
      categories: createBrandDto.categories || [],
    });
    return newBrand.save();
  }

  async update(
    idOrSlug: string | number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<any> {
    const isNum = !isNaN(Number(idOrSlug));
    const payload = { ...updateBrandDto };
    if (payload.slug) {
      payload.slug = payload.slug.toLowerCase().trim();
    }

    const brand = await this.brandModel.findOneAndUpdate(
      {
        $or: [
          ...(isNum ? [{ id: Number(idOrSlug) }] : []),
          { slug: String(idOrSlug).toLowerCase().trim() },
        ],
      },
      { $set: payload },
      { new: true },
    );

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${idOrSlug}`);
    }
    return brand;
  }

  async remove(idOrSlug: string | number): Promise<{ message: string }> {
    const isNum = !isNaN(Number(idOrSlug));
    const result = await this.brandModel.findOneAndDelete({
      $or: [
        ...(isNum ? [{ id: Number(idOrSlug) }] : []),
        { slug: String(idOrSlug).toLowerCase().trim() },
      ],
    });

    if (!result) {
      throw new NotFoundException(`Brand not found: ${idOrSlug}`);
    }
    return { message: `Brand "${result.name}" deleted successfully` };
  }

  // --- Sub-resource: Category CRUD inside Brand ---

  async addCategory(
    idOrSlug: string | number,
    categoryDto: CategoryDto,
  ): Promise<any> {
    const brand = await this.findOne(idOrSlug);
    const cSlug = (
      categoryDto.slug ||
      removeDiacritics(categoryDto.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
    ).trim();

    const existingCat = (brand.categories || []).find(
      (c: any) => c.slug === cSlug,
    );
    if (existingCat) {
      throw new ConflictException(
        `Category with slug "${cSlug}" already exists in brand "${brand.name}"`,
      );
    }

    const newCat = {
      name: categoryDto.name,
      slug: cSlug,
      subcategories: categoryDto.subcategories || [],
    };

    return this.brandModel.findByIdAndUpdate(
      brand._id,
      { $push: { categories: newCat } },
      { new: true },
    );
  }

  async updateCategory(
    idOrSlug: string | number,
    categorySlug: string,
    dto: UpdateCategoryItemDto,
  ): Promise<any> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();

    const catIndex = (brand.categories || []).findIndex(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (catIndex === -1) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    const categories = [...brand.categories];
    categories[catIndex] = {
      ...categories[catIndex],
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.slug ? { slug: dto.slug.toLowerCase().trim() } : {}),
      ...(dto.subcategories ? { subcategories: dto.subcategories } : {}),
    };

    return this.brandModel.findByIdAndUpdate(
      brand._id,
      { $set: { categories } },
      { new: true },
    );
  }

  async removeCategory(
    idOrSlug: string | number,
    categorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();

    const updated = await this.brandModel.findByIdAndUpdate(
      brand._id,
      {
        $pull: {
          categories: { slug: cleanCatSlug },
        },
      },
      { new: true },
    );

    return {
      message: `Category "${categorySlug}" removed from brand "${brand.name}" successfully`,
    };
  }

  // --- Sub-resource: Subcategory CRUD inside Category of Brand ---

  async addSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subDto: SubcategoryDto,
  ): Promise<any> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();
    const cleanSubSlug = (
      subDto.slug ||
      removeDiacritics(subDto.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
    ).trim();

    const catIndex = (brand.categories || []).findIndex(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (catIndex === -1) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    const category = brand.categories[catIndex];
    const existingSub = (category.subcategories || []).find(
      (s: any) => s.slug === cleanSubSlug,
    );
    if (existingSub) {
      throw new ConflictException(
        `Subcategory "${cleanSubSlug}" already exists in category "${category.name}"`,
      );
    }

    const updatedSubcategories = [
      ...(category.subcategories || []),
      { name: subDto.name, slug: cleanSubSlug },
    ];

    const categories = [...brand.categories];
    categories[catIndex].subcategories = updatedSubcategories;

    return this.brandModel.findByIdAndUpdate(
      brand._id,
      { $set: { categories } },
      { new: true },
    );
  }

  async removeSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subcategorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();
    const cleanSubSlug = subcategorySlug.toLowerCase().trim();

    const catIndex = (brand.categories || []).findIndex(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (catIndex === -1) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    const categories = [...brand.categories];
    categories[catIndex].subcategories = (
      categories[catIndex].subcategories || []
    ).filter((s: any) => s.slug?.toLowerCase() !== cleanSubSlug);

    await this.brandModel.findByIdAndUpdate(
      brand._id,
      { $set: { categories } },
      { new: true },
    );

    return {
      message: `Subcategory "${subcategorySlug}" removed from category "${categorySlug}" successfully`,
    };
  }
}
