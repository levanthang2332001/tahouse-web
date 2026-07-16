export interface Product {
  id: string;
  code: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categoryName: string;
  subcategory?: string;
  subcategoryName?: string;
  imageUrl: string;
  price: number | null;
  originalPrice?: number | null;
  priceRange: string;
  features: string[];
  has_variants: boolean;
  description?: string;
  shortDescription?: string;
  images?: string[];
  specs?: Record<string, string>;
  technologies?: string[];
  warranty?: number;
  warrantyText?: string;
  colors?: string[];
  installationManual?: string[];
  faq?: { question: string; answer: string }[];
  options?: { name: string; values: string[] }[];
  variants?: {
    id: string;
    label: string;
    attributes: Record<string, string>;
    price: number;
    priceRange: string;
    is_default: boolean;
  }[];
  installation_preview?: string[];
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  logoHtml?: string;
  categories: { slug: string; name: string }[];
}

export type ProductSortBy = "newest" | "price-asc" | "price-desc";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
}

export const MAX_PRODUCT_PRICE = 70_000_000;
