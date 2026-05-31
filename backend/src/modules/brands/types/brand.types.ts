export interface ICategory {
  id: number;
  name: string;
}

export interface IBrand {
  id: number;
  name: string;
  logo: string;
  categories: ICategory[];
}
