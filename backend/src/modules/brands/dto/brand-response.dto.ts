export class SubcategoryResponseDto {
  id: string;
  _id?: string;
  slug: string;
  name: string;

  static fromEntity(raw: any): SubcategoryResponseDto {
    const id = String(raw.id || raw._id || '');
    return {
      id,
      _id: id,
      slug: raw.slug || '',
      name: raw.name || '',
    };
  }
}

export class CategoryResponseDto {
  id: string;
  _id?: string;
  slug: string;
  name: string;
  subcategories: SubcategoryResponseDto[];

  static fromEntity(raw: any): CategoryResponseDto {
    const id = String(raw.id || raw._id || '');
    return {
      id,
      _id: id,
      slug: raw.slug || '',
      name: raw.name || '',
      subcategories: (raw.subcategories || []).map((sub: any) =>
        SubcategoryResponseDto.fromEntity(sub),
      ),
    };
  }
}

export class BrandResponseDto {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  logo: string;
  logoHtml?: string;
  orderIndex: number;
  categories: CategoryResponseDto[];
  createdAt?: any;
  updatedAt?: any;

  static fromEntity(raw: any): BrandResponseDto | null {
    if (!raw) return null;
    const id = String(raw.id || raw._id || '');
    return {
      id,
      _id: id,
      name: raw.name || '',
      slug: raw.slug || '',
      logo: raw.logo || '',
      logoHtml: raw.logoHtml || undefined,
      orderIndex: raw.orderIndex ?? 0,
      categories: (raw.categories || []).map((cat: any) =>
        CategoryResponseDto.fromEntity(cat),
      ),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
