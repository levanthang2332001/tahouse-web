import { adminBackendFetch, BackendError } from "@/lib/admin/api-client";
import { findBrand, type BrandTaxonomy } from "@/lib/types/brand-taxonomy";

/** Brand as returned by the backend `/admin/brands` (ids are UUID strings). */
export type AdminBrand = BrandTaxonomy & { id: string };

const BRAND_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_LABEL_LENGTH = 100;
let brandCache: { at: number; brands: AdminBrand[] } | null = null;

/**
 * Admin brand list (with category trees), cached briefly. Product saves pass `forceRefresh`
 * so a category added or removed elsewhere is never judged against a stale tree.
 */
export async function getAdminBrands(forceRefresh = false): Promise<AdminBrand[]> {
  if (!forceRefresh && brandCache && Date.now() - brandCache.at < BRAND_CACHE_TTL_MS) return brandCache.brands;
  const brands = await adminBackendFetch<AdminBrand[]>("/admin/brands");
  brandCache = { at: Date.now(), brands: Array.isArray(brands) ? brands : [] };
  return brandCache.brands;
}

export function invalidateAdminBrands() {
  brandCache = null;
}

/** Finds the brand by UUID first, then by name/slug (case-insensitive). */
export function resolveAdminBrand(
  brands: AdminBrand[],
  ref: { brandId?: unknown; brand?: unknown },
): AdminBrand | null {
  if (typeof ref.brandId === "string" && ref.brandId.trim()) {
    const byId = brands.find((b) => b.id === ref.brandId);
    if (byId) return byId;
  }
  return typeof ref.brand === "string" ? findBrand(brands, ref.brand) : null;
}

/** Same rules as the backend `slugify` (common/utils/string.util.ts), so slugs we send are stored unchanged. */
export function toBackendSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TAXONOMY_FIELDS = ["brand", "category", "categoryName", "subcategory", "subcategoryName"] as const;

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
  if (typeof body.category === "string" && body.category.trim() && !toBackendSlug(body.category)) {
    return "Mã danh mục chính không hợp lệ";
  }
  if (typeof body.subcategory === "string" && body.subcategory.trim() && !toBackendSlug(body.subcategory)) {
    return "Mã danh mục phụ không hợp lệ";
  }
  return null;
}

type TreeCategory = NonNullable<BrandTaxonomy["categories"]>[number];
type TreeSubcategory = NonNullable<TreeCategory["subcategories"]>[number];

/** Matches a typed value against tree nodes by slug or name, ignoring case (like the backend lookup). */
function findNode<N extends { slug: string; name: string }>(nodes: N[] | undefined, input: string): N | undefined {
  const key = input.trim().toLowerCase();
  const slugKey = toBackendSlug(input);
  return nodes?.find(
    (n) => n.slug.toLowerCase() === key || n.name.trim().toLowerCase() === key || n.slug.toLowerCase() === slugKey,
  );
}

function describeError(error: unknown) {
  return error instanceof Error && error.message ? error.message : "lỗi không xác định";
}

/** Keeps the upstream status (400/401/404/409…) so the route can pass it through; anything else is a 502. */
function taxonomyError(error: unknown, message: string): BackendError {
  const status = error instanceof BackendError ? error.status : 502;
  return new BackendError(status, message);
}

export interface EnsureTaxonomyResult<T> {
  /** Payload with canonical category/subcategory slugs and names from the brand tree */
  payload: T;
  /** Labels that were added to the brand tree */
  added: string[];
}

/**
 * Makes sure the brand's category tree contains the product's category (and subcategory) *before*
 * the product is saved, because the backend rejects products whose category is not in the brand tree.
 * - existing nodes are matched by slug or name (case-insensitive) and their exact slug/name are used;
 * - missing nodes are created through the brands admin API (a 409 means someone else just added it);
 * - an empty subcategory is sent as "" (not dropped), so clearing it actually clears it on the backend.
 * Throws a `BackendError` with a Vietnamese message when the tree cannot be updated; the caller must
 * not save the product then. Call `validateTaxonomyFields` first.
 */
export async function ensureBrandTaxonomy<T extends Record<string, unknown>>(
  payload: T,
  brand: AdminBrand | null,
): Promise<EnsureTaxonomyResult<T>> {
  const next: T = { ...payload };
  const added: string[] = [];

  const categoryInput = typeof payload.category === "string" ? payload.category.trim() : "";
  const subcategoryInput = typeof payload.subcategory === "string" ? payload.subcategory.trim() : undefined;
  const categoryLabel = (typeof payload.categoryName === "string" && payload.categoryName.trim()) || categoryInput;
  const subcategoryLabel =
    (typeof payload.subcategoryName === "string" && payload.subcategoryName.trim()) || subcategoryInput || "";

  if (subcategoryInput === "") Object.assign(next, { subcategory: "", subcategoryName: "" });
  if (!brand || !categoryInput) return { payload: next, added };

  const base = `/admin/brands/${encodeURIComponent(brand.slug)}/categories`;
  let category: TreeCategory | undefined = findNode(brand.categories, categoryInput);

  if (!category) {
    const slug = toBackendSlug(categoryInput);
    if (!slug) throw new BackendError(400, "Mã danh mục chính không hợp lệ");
    try {
      await adminBackendFetch(base, {
        method: "POST",
        body: JSON.stringify({ name: categoryLabel, slug, subcategories: [] }),
      });
      added.push(categoryLabel);
    } catch (error) {
      if (!(error instanceof BackendError && error.status === 409)) {
        throw taxonomyError(
          error,
          `Chưa lưu sản phẩm: không thêm được danh mục "${categoryLabel}" vào thương hiệu ${brand.name}. ${describeError(error)}`,
        );
      }
    } finally {
      invalidateAdminBrands();
    }
    category = { name: categoryLabel, slug, subcategories: [] };
  }
  Object.assign(next, { category: category.slug, categoryName: category.name });

  if (subcategoryInput) {
    let subcategory: TreeSubcategory | undefined = findNode(category.subcategories, subcategoryInput);
    if (!subcategory) {
      const slug = toBackendSlug(subcategoryInput);
      if (!slug) throw new BackendError(400, "Mã danh mục phụ không hợp lệ");
      try {
        await adminBackendFetch(`${base}/${encodeURIComponent(category.slug)}/subcategories`, {
          method: "POST",
          body: JSON.stringify({ name: subcategoryLabel, slug }),
        });
        added.push(subcategoryLabel);
      } catch (error) {
        if (!(error instanceof BackendError && error.status === 409)) {
          throw taxonomyError(
            error,
            `Chưa lưu sản phẩm: không thêm được danh mục phụ "${subcategoryLabel}" vào danh mục ${category.name} (${brand.name}). ${describeError(error)}`,
          );
        }
      } finally {
        invalidateAdminBrands();
      }
      subcategory = { name: subcategoryLabel, slug };
    }
    Object.assign(next, { subcategory: subcategory.slug, subcategoryName: subcategory.name });
  }

  return { payload: next, added };
}
