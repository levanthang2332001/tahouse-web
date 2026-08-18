import fs from "fs";
import path from "path";
import { backendFetch } from "@/lib/backend/client";
import { mapProductDetail, mapProductListItem } from "@/lib/backend/map-product";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";
import { calculateProductDiscount, parseProductPrice } from "@/lib/format-price";
import { formatProductName } from "@/lib/format-product-name";
import { slugify } from "@/lib/utils";
import type { Product, ProductsListResponse } from "@/lib/types/product";

interface LocalStoreData {
  created: Record<string, Product>;
  updated: Record<string, Product>;
  deleted: string[];
}

const STORE_FILE_PATH = path.join(process.cwd(), "data", "custom-products.json");

function readStoreFile(): LocalStoreData {
  try {
    if (!fs.existsSync(STORE_FILE_PATH)) {
      return { created: {}, updated: {}, deleted: [] };
    }
    const content = fs.readFileSync(STORE_FILE_PATH, "utf-8");
    return JSON.parse(content) as LocalStoreData;
  } catch (error) {
    console.error("[readStoreFile] Error reading store file:", error);
    return { created: {}, updated: {}, deleted: [] };
  }
}

function writeStoreFile(data: LocalStoreData): void {
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[writeStoreFile] Error writing store file:", error);
  }
}

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
    // Fetch full catalog (backend currently has ~1233 items, use 2500 for headroom)
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

export async function getMergedProducts(forceRefresh = false): Promise<Product[]> {
  const store = readStoreFile();
  const remoteItems = await fetchRemoteProducts(forceRefresh);

  const productMap = new Map<string, Product>();

  // 1. Add newly created local products FIRST so they appear at the top
  for (const [id, item] of Object.entries(store.created)) {
    if (!store.deleted.includes(id)) {
      if (store.updated[id]) {
        productMap.set(id, mapProductListItem(store.updated[id]));
      } else {
        productMap.set(id, mapProductListItem(item));
      }
    }
  }

  // 2. Add remote products that are not deleted
  for (const item of remoteItems) {
    if (!store.deleted.includes(item.id) && !productMap.has(item.id)) {
      // If updated locally, use updated version
      if (store.updated[item.id]) {
        productMap.set(item.id, mapProductListItem(store.updated[item.id]));
      } else {
        productMap.set(item.id, mapProductListItem(item));
      }
    }
  }

  return Array.from(productMap.values());
}

export async function getProductById(id: string): Promise<Product | null> {
  const store = readStoreFile();

  if (store.deleted.includes(id)) {
    return null;
  }

  if (store.created[id]) {
    return mapProductDetail(store.updated[id] || store.created[id]);
  }

  if (store.updated[id]) {
    return mapProductDetail(store.updated[id]);
  }

  try {
    const remote = await backendFetch<Product>(`/products/locks/${encodeURIComponent(id)}`);
    if (remote && !store.deleted.includes(remote.id)) {
      return mapProductDetail(remote);
    }
  } catch {
    // If not found in remote, check by code or slug in merged list
    const all = await getMergedProducts();
    const found = all.find(
      (p) => p.id === id || p.code?.toLowerCase() === id.toLowerCase(),
    );
    if (found) return mapProductDetail(found);
  }

  return null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const store = readStoreFile();

  const name = formatProductName((data.name || "").trim());
  if (!name) {
    throw new Error("Tên sản phẩm không được để trống");
  }

  const id = (data.id?.trim() || slugify(name) || `sp-${Date.now()}`).toLowerCase();
  const code = formatProductName((data.code?.trim() || id.toUpperCase().slice(0, 8)).toUpperCase());

  const price = data.price !== undefined && data.price !== null ? Math.max(0, parseProductPrice(data.price) ?? 0) : null;
  const originalPrice = data.originalPrice ? Math.max(0, parseProductPrice(data.originalPrice) ?? 0) : undefined;

  let priceRange = data.priceRange?.trim() || "";
  if (!priceRange && price) {
    priceRange = `${new Intl.NumberFormat("vi-VN").format(price)} đ`;
  } else if (!priceRange) {
    priceRange = "Liên hệ";
  }

  const brand = (data.brand?.trim() || "Chính hãng");
  const brandSlug = data.brandSlug?.trim() || slugify(brand);
  const category = data.category?.trim() || "khoa-dien-tu";
  const categoryName = data.categoryName?.trim() || category;

  // Sanitize specs
  const specs = typeof data.specs === "object" && data.specs !== null
    ? Object.fromEntries(
        Object.entries(data.specs).filter(
          ([k, v]) => typeof k === "string" && k.trim() && typeof v === "string" && v.trim(),
        ),
      )
    : {};

  // Sanitize FAQ
  const faq = Array.isArray(data.faq)
    ? data.faq
        .filter((f) => f && typeof f === "object" && (f.question?.trim() || f.answer?.trim()))
        .map((f) => ({
          question: f.question?.trim() || "",
          answer: f.answer?.trim() || "",
        }))
    : [];

  const cleanStringArray = (arr: unknown): string[] =>
    Array.isArray(arr)
      ? arr.filter((x): x is string => typeof x === "string" && Boolean(x.trim())).map((x) => x.trim())
      : [];

  const newProduct: Product = {
    id,
    code,
    name,
    brand,
    brandSlug,
    category,
    categoryName,
    subcategory: data.subcategory?.trim() || undefined,
    subcategoryName: data.subcategoryName?.trim() || undefined,
    imageUrl: data.imageUrl?.trim() || "/images/placeholder-product.png",
    price,
    originalPrice,
    priceRange,
    features: cleanStringArray(data.features),
    has_variants: Boolean(data.has_variants),
    description: (data.description || "").trim(),
    shortDescription: (data.shortDescription || "").trim(),
    images: cleanStringArray(data.images),
    specs,
    technologies: cleanStringArray(data.technologies),
    warranty: typeof data.warranty === "number" && data.warranty >= 0 ? data.warranty : 24,
    warrantyText: data.warrantyText?.trim() || "Chính hãng 24 tháng",
    colors: cleanStringArray(data.colors),
    installationManual: cleanStringArray(data.installationManual),
    faq,
    options: Array.isArray(data.options) ? data.options : [],
    variants: Array.isArray(data.variants) ? data.variants : [],
    installation_preview: cleanStringArray(data.installation_preview),
  };

  store.created[id] = newProduct;
  // If previously marked deleted, un-delete it
  store.deleted = store.deleted.filter((d) => d !== id);
  writeStoreFile(store);
  invalidateRemoteProductsCache();

  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const existing = await getProductById(id);
  if (!existing) {
    throw new Error(`Không tìm thấy sản phẩm với mã: ${id}`);
  }

  const store = readStoreFile();

  const name = data.name !== undefined ? formatProductName(data.name.trim()) : existing.name;
  if (data.name !== undefined && !name) {
    throw new Error("Tên sản phẩm không được để trống");
  }

  const price =
    data.price !== undefined
      ? (data.price !== null ? Math.max(0, parseProductPrice(data.price) ?? 0) : null)
      : existing.price;

  const originalPrice =
    data.originalPrice !== undefined
      ? (data.originalPrice ? Math.max(0, parseProductPrice(data.originalPrice) ?? 0) : undefined)
      : existing.originalPrice;

  let priceRange = data.priceRange !== undefined ? data.priceRange.trim() : existing.priceRange;
  if (!priceRange && price) {
    priceRange = `${new Intl.NumberFormat("vi-VN").format(price)} đ`;
  }

  const cleanStringArray = (arr: unknown, fallback: string[] = []): string[] =>
    Array.isArray(arr)
      ? arr.filter((x): x is string => typeof x === "string" && Boolean(x.trim())).map((x) => x.trim())
      : fallback;

  const specs =
    data.specs !== undefined
      ? typeof data.specs === "object" && data.specs !== null
        ? Object.fromEntries(
            Object.entries(data.specs).filter(
              ([k, v]) => typeof k === "string" && k.trim() && typeof v === "string" && v.trim(),
            ),
          )
        : {}
      : existing.specs;

  const faq =
    data.faq !== undefined
      ? Array.isArray(data.faq)
        ? data.faq
            .filter((f) => f && typeof f === "object" && (f.question?.trim() || f.answer?.trim()))
            .map((f) => ({
              question: f.question?.trim() || "",
              answer: f.answer?.trim() || "",
            }))
        : []
      : existing.faq;

  const updatedProduct: Product = {
    ...existing,
    ...data,
    id: existing.id, // Preserve ID
    code: data.code !== undefined ? formatProductName(data.code.trim()) : existing.code,
    name,
    brand: data.brand !== undefined ? data.brand.trim() : existing.brand,
    brandSlug: data.brand !== undefined ? slugify(data.brand) : existing.brandSlug,
    category: data.category !== undefined ? data.category.trim() : existing.category,
    categoryName: data.categoryName !== undefined ? data.categoryName.trim() : existing.categoryName,
    subcategory: data.subcategory !== undefined ? data.subcategory?.trim() || undefined : existing.subcategory,
    subcategoryName: data.subcategoryName !== undefined ? data.subcategoryName?.trim() || undefined : existing.subcategoryName,
    imageUrl: data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl,
    price,
    originalPrice,
    priceRange,
    features: data.features !== undefined ? cleanStringArray(data.features) : existing.features,
    has_variants: data.has_variants !== undefined ? Boolean(data.has_variants) : existing.has_variants,
    description: data.description !== undefined ? data.description.trim() : existing.description,
    shortDescription: data.shortDescription !== undefined ? data.shortDescription.trim() : existing.shortDescription,
    images: data.images !== undefined ? cleanStringArray(data.images) : existing.images,
    specs,
    technologies: data.technologies !== undefined ? cleanStringArray(data.technologies) : existing.technologies,
    warranty: data.warranty !== undefined && typeof data.warranty === "number" && data.warranty >= 0 ? data.warranty : existing.warranty,
    warrantyText: data.warrantyText !== undefined ? data.warrantyText.trim() : existing.warrantyText,
    colors: data.colors !== undefined ? cleanStringArray(data.colors) : existing.colors,
    installationManual: data.installationManual !== undefined ? cleanStringArray(data.installationManual) : existing.installationManual,
    faq,
    options: Array.isArray(data.options) ? data.options : existing.options,
    variants: Array.isArray(data.variants) ? data.variants : existing.variants,
    installation_preview: data.installation_preview !== undefined ? cleanStringArray(data.installation_preview) : existing.installation_preview,
  };

  if (store.created[id]) {
    store.created[id] = updatedProduct;
  } else {
    store.updated[id] = updatedProduct;
  }

  writeStoreFile(store);
  invalidateRemoteProductsCache();
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = readStoreFile();

  if (!store.deleted.includes(id)) {
    store.deleted.push(id);
  }

  delete store.created[id];
  delete store.updated[id];

  writeStoreFile(store);
  invalidateRemoteProductsCache();
  return true;
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

export async function getAdminStats() {
  const products = await getMergedProducts();

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
