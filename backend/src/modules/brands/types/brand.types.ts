export interface ICategory {
  slug: string;
  name: string;
  subcategories?: {
    slug: string;
    name: string;
  }[];
}

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  logoHtml?: string;
  categories: ICategory[];
}
