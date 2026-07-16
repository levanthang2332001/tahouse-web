export type { Product } from "@/lib/types/product";

export const CATEGORIES = [
  { id: "all", slug: "all", name: "Tất cả sản phẩm" },
  { id: "lock-parent", slug: "lock-parent", name: "Khóa thông minh" },
  { id: "dai-sanh", slug: "dai-sanh", name: "Khóa đại sảnh" },
  { id: "cua-go", slug: "cua-go", name: "Khóa cửa gỗ" },
  { id: "cua-kinh", slug: "cua-kinh", name: "Khóa cửa kính" },
  {
    id: "xingfa-sat",
    slug: "xingfa-sat",
    name: "Khóa chuyên nhôm xingfa, cửa sắt",
  },
  { id: "cua-cong", slug: "cua-cong", name: "Khóa cửa cổng" },
  { id: "khach-san", slug: "khach-san", name: "Khóa khách sạn" },
  { id: "Smart", slug: "Smart", name: "Két sắt thông minh" },
] as const;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export { formatProductPrice, parseProductPrice } from "@/lib/format-price";
