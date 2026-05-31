export interface IInstallation {
  images?: string[];
  videos?: string[];
}

export interface IProductVariant {
  id: string;
  label: string;
  attributes?: Record<string, string>;
  price: number;
  formatted_price?: string;
  is_default?: boolean;
}

export interface IProductOption {
  name: string;
  values: string[];
}

export interface IProductSpec {
  key: string;
  value: string;
}

export interface IProduct {
  id: string;
  code: string;
  name: string;
  price: number | null;
  formatted_price?: string;
  specs?: IProductSpec[];
  colors?: string[];
  category: string;
  category_id?: number;
  features?: string[];
  warranty?: string;
  description?: string;
  page_number?: number;
  technologies?: string[];
  images?: string[];
  priority?: number | null;
  installation?: IInstallation;
  options?: IProductOption[];
  variants?: IProductVariant[];
  has_variants?: boolean;
  brand?: string;
}

export interface IProductListItem {
  id: string;
  code: string;
  name: string;
  price: number | null;
  formatted_price: string;
  brand?: string;
  category: string;
  images: string[];
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
