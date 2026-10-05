export type { Product } from "@/lib/types/product";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";

export const CATEGORIES = [
  { id: "all", slug: "all", name: "Tất cả sản phẩm" },
  ...Object.entries(CATEGORY_LABELS)
    .filter(([slug]) => !["Lock", "Kitchen", "Water", "Cabinet"].includes(slug))
    .map(([slug, name]) => ({ id: slug, slug, name })),
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export { formatProductPrice, parseProductPrice } from "@/lib/format-price";
