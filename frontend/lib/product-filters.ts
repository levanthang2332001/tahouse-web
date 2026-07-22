import {
  GROUP_BRAND_FILTERS,
  LOCK_CATEGORY_SLUGS,
  SIDEBAR_SECTIONS,
  SMART_SUBCATEGORY_SLUGS,
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
] as const;

export type ApiFilterParams = {
  category?: string;
  subcategory?: string;
  brand?: string;
  /** Expands to multiple BE category queries and merges results. */
  group?: "kitchen";
};

/** Map FE sidebar filter slug to backend query params. */
export function mapFilterToApiParams(filter: string): ApiFilterParams {
  if (!filter || filter === "all") return {};

  if (filter === "kitchen-group") {
    return { group: "kitchen" };
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
export function getBrandMatchCategorySlugs(filter: string): string[] | null {
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
    return [...KITCHEN_CATEGORY_SLUGS];
  }

  const section = SIDEBAR_SECTIONS.find(
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
  const slugs = getBrandMatchCategorySlugs(filter);
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
