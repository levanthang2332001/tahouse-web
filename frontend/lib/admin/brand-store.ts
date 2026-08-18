import fs from "fs";
import path from "path";
import { backendFetch } from "@/lib/backend/client";
import { resolveMediaUrl } from "@/lib/media";
import { slugify } from "@/lib/utils";
import { getLocalBrandLogo } from "@/lib/brand-logos";
import { getMergedProducts } from "@/lib/admin/product-store";
import type { Brand } from "@/lib/types/product";

export interface CustomBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  country?: string;
  updatedAt?: string;
}

interface LocalBrandStore {
  customBrands: Record<string, CustomBrand>;
  deletedSlugs: string[];
}

const BRAND_STORE_FILE = path.join(process.cwd(), "data", "custom-brands.json");

// Default initial brand database with known local logo assets
export const DEFAULT_BRAND_PRESETS: Record<string, Partial<CustomBrand>> = {
  kassler: { name: "Kassler", slug: "kassler", logo: "/brands/kassler.png", country: "Đức" },
  bosch: { name: "Bosch", slug: "bosch", logo: "/brands/bosch.svg", country: "Đức" },
  philips: { name: "Philips", slug: "philips", logo: "/brands/philips.svg", country: "Hà Lan" },
  eurogold: { name: "Eurogold", slug: "eurogold", logo: "/brands/eurogold.svg", country: "Châu Âu" },
  malloca: { name: "Malloca", slug: "malloca", logo: "/brands/malloca.svg", country: "Tây Ban Nha" },
  karofi: { name: "Karofi", slug: "karofi", logo: "/brands/karofi.png", country: "Việt Nam" },
  hubert: { name: "Hubert", slug: "hubert", logo: "/brands/hubert.svg", country: "Đức" },
  kaadas: { name: "Kaadas", slug: "kaadas", logo: "/brands/kaadas.svg", country: "Đức" },
  demax: { name: "Demax", slug: "demax", logo: "/brands/demax.svg", country: "Đức" },
  panasonic: { name: "Panasonic", slug: "panasonic", logo: "/brands/panasonic.svg", country: "Nhật Bản" },
  hyundai: { name: "Hyundai", slug: "hyundai", logo: "/brands/hyundai.png", country: "Hàn Quốc" },
  sharp: { name: "Sharp", slug: "sharp", logo: "/brands/sharp.png", country: "Nhật Bản" },
  fanlight: { name: "Fanlight", slug: "fanlight", logo: "/brands/fanlight.png", country: "Đài Loan" },
  hafele: { name: "Hafele", slug: "hafele", logo: "/brands/hafele.png", country: "Đức" },
  kaff: { name: "Kaff", slug: "kaff", logo: "/brands/kaff.jpg", country: "Đức" },
  grob: { name: "Grob", slug: "grob", logo: "/brands/grob.png", country: "Châu Âu" },
  "hd-door": { name: "HD Door", slug: "hd-door", logo: "/brands/hd-door.svg", country: "Việt Nam" },
  grandx: { name: "GrandX", slug: "grandx", logo: "/brands/grandx.svg", country: "Việt Nam" },
  nobinox: { name: "Nobinox", slug: "nobinox", logo: "/brands/nobinox.svg", country: "Việt Nam" },
};

function readBrandStore(): LocalBrandStore {
  try {
    if (!fs.existsSync(BRAND_STORE_FILE)) {
      return { customBrands: {}, deletedSlugs: [] };
    }
    const content = fs.readFileSync(BRAND_STORE_FILE, "utf-8").trim();
    if (!content) return { customBrands: {}, deletedSlugs: [] };
    return JSON.parse(content) as LocalBrandStore;
  } catch {
    return { customBrands: {}, deletedSlugs: [] };
  }
}

function writeBrandStore(store: LocalBrandStore): void {
  try {
    const dir = path.dirname(BRAND_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BRAND_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("[writeBrandStore] Error saving brand file:", error);
  }
}

/**
 * Get unified list of all brands with their product counts and logos.
 */
export async function getAllBrandsWithStats(): Promise<
  Array<CustomBrand & { productCount: number }>
> {
  const store = readBrandStore();
  const products = await getMergedProducts();

  // Count products by brand
  const productCountMap: Record<string, number> = {};
  const productBrandNames: Record<string, string> = {};

  products.forEach((p) => {
    if (p.brand) {
      const slug = p.brandSlug || slugify(p.brand);
      productCountMap[slug] = (productCountMap[slug] || 0) + 1;
      productBrandNames[slug] = p.brand;
    }
  });

  // Map to hold merged brands
  const brandMap = new Map<string, CustomBrand>();

  // 1. Add Default Presets
  for (const [slug, preset] of Object.entries(DEFAULT_BRAND_PRESETS)) {
    if (!store.deletedSlugs.includes(slug)) {
      brandMap.set(slug, {
        id: slug,
        name: preset.name || slug,
        slug,
        logo: preset.logo || getLocalBrandLogo(slug, preset.name) || "",
        country: preset.country || "Chính hãng",
        description: preset.description || "",
      });
    }
  }

  // 2. Add Remote Backend Brands (if reachable)
  try {
    const remoteBrands = await backendFetch<Brand[]>("/brands");
    if (Array.isArray(remoteBrands)) {
      remoteBrands.forEach((rb) => {
        const slug = rb.slug || slugify(rb.name);
        if (!store.deletedSlugs.includes(slug)) {
          const existing = brandMap.get(slug);
          const localAsset = getLocalBrandLogo(slug, rb.name);
          const logo =
            localAsset ||
            existing?.logo ||
            resolveMediaUrl(rb.logo) ||
            "";
          brandMap.set(slug, {
            id: String(rb.id || slug),
            name: rb.name || existing?.name || slug,
            slug,
            logo,
            description: existing?.description || "",
            country: existing?.country || "Chính hãng",
          });
        }
      });
    }
  } catch {
    // remote fetch optional
  }

  const EXCLUDED_BRAND_SLUGS = ["ta-house", "tahouse"];

  // 3. Add any brands discovered from current products
  for (const [slug, rawName] of Object.entries(productBrandNames)) {
    if (
      !store.deletedSlugs.includes(slug) &&
      !EXCLUDED_BRAND_SLUGS.includes(slug) &&
      !brandMap.has(slug)
    ) {
      brandMap.set(slug, {
        id: slug,
        name: rawName,
        slug,
        logo: getLocalBrandLogo(slug, rawName) || "",
        country: "Chính hãng",
      });
    }
  }

  // 4. Overlay user custom/edited brands
  for (const [slug, custom] of Object.entries(store.customBrands)) {
    if (!store.deletedSlugs.includes(slug) && !EXCLUDED_BRAND_SLUGS.includes(slug)) {
      const existing = brandMap.get(slug);
      brandMap.set(slug, {
        ...existing,
        ...custom,
        id: custom.id || slug,
        slug,
        logo: custom.logo || existing?.logo || getLocalBrandLogo(slug, custom.name) || "",
      });
    }
  }

  // Convert to array and attach productCount
  const list = Array.from(brandMap.values()).map((b) => ({
    ...b,
    productCount: productCountMap[b.slug] || 0,
  }));

  // Sort descending by productCount, then alphabetical
  list.sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name, "vi"));

  return list;
}

export async function saveBrand(data: Partial<CustomBrand>): Promise<CustomBrand> {
  const store = readBrandStore();
  const name = (data.name || "Thương hiệu mới").trim();
  const slug = (data.slug?.trim() || slugify(name)).toLowerCase();

  const brand: CustomBrand = {
    id: data.id?.trim() || slug,
    name,
    slug,
    logo: data.logo?.trim() || getLocalBrandLogo(slug, name) || "",
    description: data.description?.trim() || "",
    website: data.website?.trim() || "",
    country: data.country?.trim() || "Chính hãng",
    updatedAt: new Date().toISOString(),
  };

  store.customBrands[slug] = brand;
  store.deletedSlugs = store.deletedSlugs.filter((s) => s !== slug);
  writeBrandStore(store);

  return brand;
}

export async function deleteBrand(slug: string): Promise<boolean> {
  const store = readBrandStore();
  const cleanSlug = slug.trim().toLowerCase();

  if (!store.deletedSlugs.includes(cleanSlug)) {
    store.deletedSlugs.push(cleanSlug);
  }
  delete store.customBrands[cleanSlug];
  writeBrandStore(store);

  return true;
}
