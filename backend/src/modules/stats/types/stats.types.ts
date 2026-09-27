export interface ISubcategoryStat {
  slug: string;
  name: string;
  totalProducts: number;
  percentage: number;
}

export interface ICategoryStat {
  slug: string;
  name: string;
  totalProducts: number;
  percentage: number;
  subcategories: ISubcategoryStat[];
}

export interface IBrandStat {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  totalProducts: number;
  percentage: number;
  categories: ICategoryStat[];
}

export interface IDashboardSummary {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  totalSubcategories: number;
  discountedProducts: number;
}

export interface IAdminDashboardStatsResponse {
  summary: IDashboardSummary;
  brands: IBrandStat[];
}
