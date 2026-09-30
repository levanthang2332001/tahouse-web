import { backendFetch } from "@/lib/backend/client";
import { mapProductDetail, mapProductListItem } from "@/lib/backend/map-product";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";
import { calculateProductDiscount } from "@/lib/format-price";
import type { Product, ProductsListResponse } from "@/lib/types/product";

let cachedRemoteProducts: Product[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes TTL

export function invalidateRemoteProductsCache(): void {
  cachedRemoteProducts = null;
  lastCacheTime = 0;
}

export async function fetchRemoteProducts(forceRefresh = false): Promise<Product[]> {
  const now = Date.now();
  if (!forceRefresh && cachedRemoteProducts && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedRemoteProducts;
  }

  try {
    // Fetch full catalog directly from backend database
    const data = await backendFetch<ProductsListResponse>(
      "/products/locks?page=1&limit=2500",
    );
    const items = data.items || [];
    if (items.length > 0) {
      cachedRemoteProducts = items;
      lastCacheTime = now;
    }
    return items;
  } catch (err) {
    console.warn("[fetchRemoteProducts] Remote backend fetch error:", err);
    return cachedRemoteProducts || [];
  }
}

/**
 * Returns all products fetched directly from the backend database.
 */
export async function getMergedProducts(forceRefresh = false): Promise<Product[]> {
  const remoteItems = await fetchRemoteProducts(forceRefresh);
  return remoteItems.map((item) => mapProductListItem(item));
}

/**
 * Retrieve a single product by ID or Code directly from the database.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const cleanId = id.trim();
  if (!cleanId) return null;

  try {
    const remote = await backendFetch<Product>(
      `/products/locks/${encodeURIComponent(cleanId)}`,
    );
    if (remote) {
      return mapProductDetail(remote);
    }
  } catch {
    // If not found by direct ID, check by code or slug in the remote database catalog
    const all = await fetchRemoteProducts();
    const found = all.find(
      (p) =>
        p.id === cleanId ||
        p.code?.toLowerCase() === cleanId.toLowerCase() ||
        p.slug === cleanId,
    );
    if (found) return mapProductDetail(found);
  }

  return null;
}

export interface SectorBreakdown {
  id: string;
  name: string;
  count: number;
  percentage: string;
  slugs: string[];
  subcategories: Array<{ name: string; slug: string; count: number }>;
}

export const PRODUCT_SECTORS = [
  {
    id: "thiet-bi-nha-bep",
    name: "Thiết Bị & Phụ Kiện Bếp",
    slugs: [
      "phu-kien-nha-bep", "thiet-bi-nha-bep", "chau-voi-bep", "bep-dien-tu", "bep-tu", 
      "bep-gas-am", "bep-tu-ket-hop-may-hut", "may-hut-mui", "may-hut-ap-tuong", 
      "may-hut-dao", "may-hut-am-tu", "may-hut-am-tran", "may-hut-classic", 
      "may-hut-am-ban", "lo-nuong", "lo-vi-song", "combo-lo-nuong-lo-vi-song", 
      "may-rua-chen", "chau-da", "chau-rua-chen-inox", "voi-chau-rua-chen", "Kitchen", "Cabinet"
    ],
  },
  {
    id: "khoa-dien-tu",
    name: "Khóa Điện Tử & Thông Minh",
    slugs: ["dai-sanh", "cua-go", "cua-kinh", "xingfa-sat", "cua-cong", "khach-san", "Lock", "lock-parent"],
  },
  {
    id: "quat-tran-den",
    name: "Quạt Trần & Đèn Trang Trí",
    slugs: ["quat-tran-den-hien-dai", "quat-tran-den-giau-canh", "quat-tran-den-trang-tri", "den-op-quat-trang-tri"],
  },
  {
    id: "ket-sat-thong-minh",
    name: "Két Sắt An Toàn & Thông Minh",
    slugs: ["ket-sat", "Smart", "ket-mini", "ket-gia-dinh", "ket-van-phong"],
  },
  {
    id: "may-loc-nuoc",
    name: "Máy Lọc Nước & Điện Giải",
    slugs: ["may-dien-giai", "may-nong-lanh", "may-nong-nguoi", "may-ro-tu-dung", "may-de-gam", "cay-nuoc", "Water"],
  },
  {
    id: "cua-thong-phong",
    name: "Cửa & Nội Thất Thông Phòng",
    slugs: ["cua-phang", "cua-nep-kim-loai", "cua-o-kinh", "cua-chi-noi", "cua-hut-huynh", "cua-vom", "cua-canh-lech", "cua-son", "cua-nhom-kinh"],
  },
];

export async function getAdminStats(forceRefresh = false) {
  const products = await getMergedProducts(forceRefresh);

  const totalProducts = products.length;
  const brands = new Set(products.map((p) => p.brand).filter(Boolean));
  const onSale = products.filter((p) => {
    const discount = calculateProductDiscount(
      p.price,
      p.originalPrice,
      p.priceRange,
      p.id,
    );
    return discount.hasDiscount;
  }).length;

  const categoryBreakdown: Record<string, number> = {};
  const brandBreakdown: Record<string, number> = {};

  products.forEach((p) => {
    const rawCat = p.category || "khac";
    const cat =
      CATEGORY_LABELS[rawCat] ||
      p.categoryName ||
      p.category ||
      "Khác";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

    const br = p.brand || "Khác";
    brandBreakdown[br] = (brandBreakdown[br] || 0) + 1;
  });

  // Sort breakdowns descending by count
  const sortedCategoryBreakdown = Object.fromEntries(
    Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]),
  );

  const sortedBrandBreakdown = Object.fromEntries(
    Object.entries(brandBreakdown).sort((a, b) => b[1] - a[1]),
  );

  // Compute 6 major sector breakdowns
  const sectorBreakdown: SectorBreakdown[] = PRODUCT_SECTORS.map((sector) => {
    const matchedProducts = products.filter((p) =>
      sector.slugs.includes(p.category || ""),
    );
    const subMap: Record<string, { name: string; slug: string; count: number }> = {};

    matchedProducts.forEach((p) => {
      const slug = p.category || "khac";
      const name = CATEGORY_LABELS[slug] || p.categoryName || slug;
      if (!subMap[slug]) {
        subMap[slug] = { name, slug, count: 0 };
      }
      subMap[slug].count += 1;
    });

    const subcategories = Object.values(subMap).sort((a, b) => b.count - a.count);
    const count = matchedProducts.length;
    const percentage = totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : "0";

    return {
      id: sector.id,
      name: sector.name,
      count,
      percentage,
      slugs: sector.slugs,
      subcategories,
    };
  });

  return {
    totalProducts,
    totalBrands: brands.size,
    totalCategories: Object.keys(sortedCategoryBreakdown).length,
    onSaleProducts: onSale,
    categoryBreakdown: sortedCategoryBreakdown,
    brandBreakdown: sortedBrandBreakdown,
    sectorBreakdown,
  };
}
