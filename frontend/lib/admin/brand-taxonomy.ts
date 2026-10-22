import { adminBackendFetch, BackendError } from "@/lib/admin/api-client";
import { findBrand, type BrandTaxonomy } from "@/lib/types/brand-taxonomy";
import { slugify } from "@/lib/utils";

type AdminBrand = BrandTaxonomy & { id?: number };

const BRAND_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_LABEL_LENGTH = 100;
let brandCache: { at: number; brands: AdminBrand[] } | null = null;

/** Admin brand list (with category trees), cached briefly; shared by brand-id resolution and taxonomy sync. */
export async function getAdminBrands(): Promise<AdminBrand[]> {
  if (brandCache && Date.now() - brandCache.at < BRAND_CACHE_TTL_MS) return brandCache.brands;
  const brands = await adminBackendFetch<AdminBrand[]>("/admin/brands");
  brandCache = { at: Date.now(), brands: Array.isArray(brands) ? brands : [] };
  return brandCache.brands;
}

export function invalidateAdminBrands() {
  brandCache = null;
}

export async function resolveBrandId(brand?: string): Promise<number | undefined> {
  if (!brand) return undefined;
  try {
    return findBrand(await getAdminBrands(), brand)?.id;
  } catch {
    return undefined;
  }
}

export interface TaxonomySyncResult {
  /** Labels added to the brand tree */
  added: string[];
  /** Set when the brand tree could not be updated; the product itself is still saved */
  warning?: string;
}

const TAXONOMY_FIELDS = ["brand", "category", "categoryName", "subcategory", "subcategoryName"] as const;
type TaxonomyField = (typeof TAXONOMY_FIELDS)[number];

/** Rejects non-string taxonomy fields before anything calls string methods on them. */
export function validateTaxonomyFields(body: Record<string, unknown>): string | null {
  for (const field of TAXONOMY_FIELDS) {
    const value = body[field];
    if (value !== undefined && value !== null && typeof value !== "string") {
      return `Trường "${field}" phải là chuỗi ký tự`;
    }
  }
  for (const field of ["categoryName", "subcategoryName"] as const) {
    const value = body[field];
    if (typeof value === "string" && value.trim().length > MAX_LABEL_LENGTH) {
      return `Tên danh mục tối đa ${MAX_LABEL_LENGTH} ký tự`;
    }
  }
  if (typeof body.category === "string" && body.category.trim() && !slugify(body.category)) {
    return "Mã danh mục chính không hợp lệ";
  }
  if (typeof body.subcategory === "string" && body.subcategory.trim() && !slugify(body.subcategory)) {
    return "Mã danh mục phụ không hợp lệ";
  }
  return null;
}

const isConflict = (error: unknown) => error instanceof BackendError && error.status === 409;

// Existing data has legacy slugs such as "Lock" or "Smart": keep URL-safe values verbatim, only clean up the rest
const toSlug = (value: string) => {
  const trimmed = value.trim();
  return /^[A-Za-z0-9-]+$/.test(trimmed) ? trimmed : slugify(trimmed);
};

/**
 * Normalizes a product payload against its brand's category tree and returns a `sync` to run
 * *after* the product is saved (so a rejected save never leaves an orphan category behind):
 * - slugs are made URL-safe (existing safe slugs, including legacy mixed-case ones, are kept as they are);
 * - names come from the tree when the slug already exists, so labels never drift;
 * - an empty subcategory is sent as "" (not dropped), so clearing it actually clears it on the backend.
 * Call `validateTaxonomyFields` first.
 */
export async function prepareBrandTaxonomy<T extends Partial<Record<TaxonomyField, string | null>>>(
  payload: T,
): Promise<{ payload: T; sync: () => Promise<TaxonomySyncResult> }> {
  const noop = async (): Promise<TaxonomySyncResult> => ({ added: [] });
  const next: T = { ...payload };

  const categorySlug = typeof payload.category === "string" ? toSlug(payload.category) : "";
  if (categorySlug) Object.assign(next, { category: categorySlug });
  if (typeof payload.subcategory === "string") {
    const sub = toSlug(payload.subcategory);
    Object.assign(next, sub ? { subcategory: sub } : { subcategory: "", subcategoryName: "" });
  }
  for (const field of ["categoryName", "subcategoryName"] as const) {
    const value = next[field];
    if (typeof value === "string") Object.assign(next, { [field]: value.trim() });
  }

  if (typeof payload.brand !== "string" || !payload.brand.trim() || !categorySlug) return { payload: next, sync: noop };

  let brand: AdminBrand | null;
  try {
    brand = findBrand(await getAdminBrands(), payload.brand);
  } catch (error) {
    const message = error instanceof Error ? error.message : "lỗi không xác định";
    return { payload: next, sync: async () => ({ added: [], warning: `Không đọc được danh mục của hãng: ${message}` }) };
  }
  // Custom brands that do not exist on the backend have no tree to update
  if (!brand) return { payload: next, sync: noop };

  const subcategorySlug = (next.subcategory as string | undefined) || undefined;
  // Backend slugs compare case-insensitively; reuse the tree's exact slug when one matches
  const category = brand.categories?.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());
  const subcategory = category?.subcategories?.find((s) => s.slug.toLowerCase() === subcategorySlug?.toLowerCase());
  if (category) Object.assign(next, { category: category.slug, categoryName: category.name });
  if (subcategory) Object.assign(next, { subcategory: subcategory.slug, subcategoryName: subcategory.name });

  const categoryName = (next.categoryName as string | undefined) || categorySlug;
  const subcategoryName = (next.subcategoryName as string | undefined) || subcategorySlug;
  const base = `/admin/brands/${encodeURIComponent(brand.slug)}/categories`;
  const brandName = brand.name;

  const sync = async (): Promise<TaxonomySyncResult> => {
    try {
      if (!category) {
        await adminBackendFetch(base, {
          method: "POST",
          body: JSON.stringify({
            name: categoryName,
            slug: categorySlug,
            subcategories: subcategorySlug ? [{ name: subcategoryName, slug: subcategorySlug }] : [],
          }),
        });
        invalidateAdminBrands();
        return { added: [categoryName, ...(subcategorySlug && subcategoryName ? [subcategoryName] : [])] };
      }
      if (subcategorySlug && !subcategory) {
        await adminBackendFetch(`${base}/${encodeURIComponent(category.slug)}/subcategories`, {
          method: "POST",
          body: JSON.stringify({ name: subcategoryName, slug: subcategorySlug }),
        });
        invalidateAdminBrands();
        return { added: subcategoryName ? [subcategoryName] : [] };
      }
      return { added: [] };
    } catch (error) {
      // Someone else added it since the cached tree was read: the end state is what we wanted
      if (isConflict(error)) {
        invalidateAdminBrands();
        return { added: [] };
      }
      const message = error instanceof Error ? error.message : "lỗi không xác định";
      return { added: [], warning: `Chưa thêm được danh mục vào hãng ${brandName}: ${message}` };
    }
  };

  return { payload: next, sync };
}
