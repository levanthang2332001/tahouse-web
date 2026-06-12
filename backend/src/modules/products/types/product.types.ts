export interface IInstallation {
  images?: string[];
  videos?: string[];
}

export interface IProductVariant {
  id: string;
  label: string;
  attributes: Record<string, string>;
  price: number;
  priceRange: string;
  is_default: boolean;
}

export interface IProductOption {
  name: string;
  values: string[];
}

export interface IProduct {
  id: string;
  code: string;
  brand?: string;
  brandSlug?: string;
  category: string;
  categoryName: string;
  subcategory?: string;
  subcategoryName?: string;
  name: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  price: number | null;
  originalPrice?: number;
  priceRange: string;
  features: string[];
  specs: Record<string, string>;
  technologies: string[];
  warranty: number;
  warrantyText: string;
  colors: string[];
  installationManual?: string[];
  faq?: { question: string; answer: string }[];
  has_variants: boolean;
  options?: IProductOption[];
  variants?: IProductVariant[];
  installation_preview?: string[];
}

export interface IProductListItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categoryName: string;
  imageUrl: string;
  price: number | null;
  originalPrice?: number;
  priceRange: string;
  features: string[];
  has_variants: boolean;
}

export interface IInstallationMediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface IInstallationMediaResponse {
  product_code: string;
  product_name: string;
  items: IInstallationMediaItem[];
  total: number;
  total_images: number;
  total_videos: number;
  page: number;
  limit: number;
}

export interface IProductsListResponse {
  items: IProductListItem[];
  total: number;
  page: number;
  limit: number;
}
