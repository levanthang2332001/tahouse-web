import {
  GROUP_BRAND_FILTERS,
  LOCK_CATEGORY_SLUGS,
  SMART_SUBCATEGORY_SLUGS,
  buildSidebarSectionsFromBrands,
} from "@/data/catalog-taxonomy";
import type { Brand } from "@/lib/types/product";

/** Category slugs that belong to the kitchen product group. */
export const KITCHEN_CATEGORY_SLUGS = [
  "bep-tu",
  "bep-dien-tu",
  "bep-gas-am",
  "bep-tu-ket-hop-may-hut",
  "may-hut-mui",
  "may-hut-ap-tuong",
  "may-hut-dao",
  "may-hut-am-tu",
  "may-hut-am-tran",
  "may-hut-classic",
  "may-hut-am-ban",
  "lo-nuong",
  "lo-vi-song",
  "combo-lo-nuong-lo-vi-song",
  "may-rua-chen",
  "thiet-bi-nha-bep",
  "chau-voi-bep",
  "phu-kien-nha-bep",
] as const;

const NON_KITCHEN_CATEGORY_SLUGS = new Set([
  "lock-parent",
  "Lock",
  "dai-sanh",
  "cua-go",
  "cua-kinh",
  "xingfa-sat",
  "cua-cong",
  "khach-san",
  "Smart",
  "ket-sat",
  "ket-mini",
  "ket-gia-dinh",
  "ket-van-phong",
  "quat-tran-den-hien-dai",
  "quat-tran-den-giau-canh",
  "quat-tran-den-trang-tri",
  "den-op-quat-trang-tri",
  "may-dien-giai",
  "may-nong-lanh",
  "may-nong-nguoi",
  "may-ro-tu-dung",
  "may-de-gam",
  "cay-nuoc",
  "cua-phang",
  "cua-nep-kim-loai",
  "cua-o-kinh",
  "cua-chi-noi",
  "cua-hut-huynh",
  "cua-vom",
  "cua-canh-lech",
  "cua-son",
  "cua-nhom-kinh",
]);

type BrandCategorySource = {
  categories?: { slug: string; name?: string }[];
};

/**
 * Expand kitchen merge list with any new BE categories that belong to
 * brands already selling kitchen items (auto-picks up new catalog data).
 */
export function resolveKitchenCategorySlugs(
  brands: BrandCategorySource[] = [],
): string[] {
  const slugs = new Set<string>(KITCHEN_CATEGORY_SLUGS);
  if (brands.length === 0) return [...slugs];

  for (const brand of brands) {
    const categories = brand.categories ?? [];
    const sellsKitchen = categories.some((category) =>
      slugs.has(category.slug),
    );
    if (!sellsKitchen) continue;
    for (const category of categories) {
      const slug = category.slug?.trim();
      if (!slug || NON_KITCHEN_CATEGORY_SLUGS.has(slug)) continue;
      slugs.add(slug);
    }
  }

  return [...slugs];
}

export type ApiFilterParams = {
  category?: string;
  subcategory?: string;
  brand?: string;
  /** Expands to multiple BE category queries and merges results. */
  group?: "kitchen" | "extras";
};

/** Map FE sidebar filter slug to backend query params. */
export function mapFilterToApiParams(filter: string): ApiFilterParams {
  if (!filter || filter === "all") return {};

  if (filter === "kitchen-group") {
    return { group: "kitchen" };
  }

  if (filter === "extras-group") {
    return { group: "extras" };
  }

  const groupBrand = GROUP_BRAND_FILTERS[filter];
  if (groupBrand) {
    return { brand: groupBrand };
  }

  if (filter === "lock-parent" || filter === "Lock") {
    return { category: "lock-parent" };
  }

  if (filter === "Smart") {
    return { category: "Smart" };
  }

  if (LOCK_CATEGORY_SLUGS.has(filter)) {
    return { category: filter };
  }

  if (SMART_SUBCATEGORY_SLUGS.has(filter)) {
    return { category: "Smart", subcategory: filter };
  }

  // Any other known slug (bếp, quạt, nước, cửa, két-sat, …) maps 1:1 to BE category.
  return { category: filter };
}

/** Category slugs used to decide which brands appear for the current menu filter. */
export function getBrandMatchCategorySlugs(
  filter: string,
  brands: Brand[] = [],
): string[] | null {
  if (!filter || filter === "all") return null;

  if (filter === "lock-parent" || filter === "Lock") {
    return [...LOCK_CATEGORY_SLUGS];
  }

  if (
    filter === "Smart" ||
    filter === "ket-sat" ||
    SMART_SUBCATEGORY_SLUGS.has(filter)
  ) {
    return ["Smart", "ket-sat"];
  }

  if (filter === "kitchen-group") {
    return resolveKitchenCategorySlugs(brands);
  }

  if (filter === "extras-group") {
    const extras = buildSidebarSectionsFromBrands(brands).find(
      (section) => section.id === "danh-muc-moi",
    );
    return extras?.subcategories.map((sub) => sub.id) ?? [];
  }

  const sections = buildSidebarSectionsFromBrands(brands);
  const section = sections.find(
    (item) =>
      item.categoryId === filter ||
      item.subcategories.some((sub) => sub.id === filter),
  );

  if (section && filter === section.categoryId) {
    return section.subcategories.map((sub) => sub.id);
  }

  return [filter];
}

/** Brands relevant to the active product category (locks, kitchen, fans, …). */
export function filterBrandsForCategory(
  brands: Brand[],
  filter: string,
): Brand[] {
  const slugs = getBrandMatchCategorySlugs(filter, brands);
  if (!slugs) return brands;

  const slugSet = new Set(slugs);
  const groupBrand = GROUP_BRAND_FILTERS[filter];

  return brands.filter((brand) => {
    if (groupBrand && brand.slug === groupBrand) return true;
    return (brand.categories ?? []).some((category) =>
      slugSet.has(category.slug),
    );
  });
}
