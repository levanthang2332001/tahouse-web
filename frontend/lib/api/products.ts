import type {
  Brand,
  GetProductsParams,
  Product,
  ProductsListResponse,
} from "@/lib/types/product";

function buildSearchParams(params: GetProductsParams): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  });
  return sp.toString();
}

export async function fetchProducts(
  params: GetProductsParams = {},
): Promise<ProductsListResponse> {
  const query = buildSearchParams(params);
  const res = await fetch(`/api/products${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }
  return res.json() as Promise<ProductsListResponse>;
}

export async function fetchProduct(idOrCode: string): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(idOrCode)}`, {
    cache: "no-store",
  });
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error("Không thể tải chi tiết sản phẩm");
  }
  return res.json() as Promise<Product>;
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch("/api/brands", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Không thể tải danh sách thương hiệu");
  }
  return res.json() as Promise<Brand[]>;
}
