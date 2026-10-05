import type { LucideIcon } from "lucide-react";
import {
  Box,
  Briefcase,
  Columns,
  CookingPot,
  DoorClosed,
  Droplets,
  Fan,
  Fingerprint,
  Flame,
  Hotel,
  Crown,
  Home,
  Microwave,
  Refrigerator,
  Shield,
  Soup,
  Vault,
  Waves,
} from "lucide-react";

export type CatalogSubcategory = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export type CatalogSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Value stored in URL/filter when the section header is clicked. */
  categoryId: string;
  subcategories: CatalogSubcategory[];
};

/** Human-readable labels for every known backend category slug. */
export const CATEGORY_LABELS: Record<string, string> = {
  "lock-parent": "Khóa thông minh",
  Lock: "Khóa thông minh",
  "dai-sanh": "Khóa đại sảnh",
  "cua-go": "Khóa cửa gỗ",
  "cua-kinh": "Khóa cửa kính",
  "xingfa-sat": "Khóa nhôm kính",
  "cua-cong": "Khóa cửa cổng",
  "khach-san": "Khóa khách sạn",
  Smart: "Két sắt thông minh",
  "ket-sat": "Két sắt Philips",
  "ket-mini": "Két mini",
  "ket-gia-dinh": "Két gia đình",
  "ket-van-phong": "Két văn phòng",
  "bep-tu": "Bếp từ",
  "bep-dien-tu": "Bếp điện - từ",
  "bep-gas-am": "Bếp gas âm",
  "bep-tu-ket-hop-may-hut": "Bếp từ kết hợp máy hút",
  "may-hut-mui": "Máy hút mùi",
  "may-hut-ap-tuong": "Máy hút áp tường",
  "may-hut-dao": "Máy hút đảo",
  "may-hut-am-tu": "Máy hút âm tủ",
  "may-hut-am-tran": "Máy hút âm trần",
  "may-hut-classic": "Máy hút classic",
  "may-hut-am-ban": "Máy hút âm bàn",
  "lo-nuong": "Lò nướng",
  "lo-vi-song": "Lò vi sóng",
  "combo-lo-nuong-lo-vi-song": "Combo lò nướng, lò vi sóng",
  "may-rua-chen": "Máy rửa chén",
  "thiet-bi-nha-bep": "Thiết bị nhà bếp",
  "phu-kien-nha-bep": "Phụ kiện nhà bếp",
  "chau-voi-bep": "Chậu vòi bếp",
  "chau-da": "Chậu đá",
  "chau-rua-chen-inox": "Chậu rửa chén inox",
  "voi-chau-rua-chen": "Vòi chậu rửa chén",
  "quat-tran-den-giau-canh": "Quạt trần đèn giấu cánh",
  "quat-tran-den-trang-tri": "Quạt trần đèn trang trí",
  "quat-tran-den-hien-dai": "Quạt trần đèn hiện đại",
  "den-op-quat-trang-tri": "Đèn ốp quạt trang trí",
  "may-dien-giai": "Máy điện giải Hydro-ion",
  "may-nong-lanh": "Máy lọc nước nóng lạnh",
  "may-nong-nguoi": "Máy lọc nước nóng nguội",
  "may-ro-tu-dung": "Máy lọc nước RO",
  "may-de-gam": "Máy lọc nước để gầm",
  "cay-nuoc": "Cây nước nóng lạnh",
  "cua-phang": "Cửa phẳng",
  "cua-nep-kim-loai": "Cửa nẹp kim loại",
  "cua-o-kinh": "Cửa ô kính",
  "cua-chi-noi": "Cửa chỉ nổi",
  "cua-hut-huynh": "Cửa hút huỳnh",
  "cua-vom": "Cửa vòm",
  "cua-canh-lech": "Cửa cánh lệch",
  "cua-son": "Cửa sơn",
  "cua-nhom-kinh": "Cửa nhôm kính",
  Kitchen: "Thiết bị bếp",
  Water: "Máy lọc nước",
  Cabinet: "Phụ kiện tủ bếp",
};

export const SIDEBAR_SECTIONS: CatalogSection[] = [
  {
    id: "khoa-dien-tu",
    title: "KHÓA ĐIỆN TỬ",
    icon: Fingerprint,
    categoryId: "lock-parent",
    subcategories: [
      { id: "dai-sanh", name: "Khóa đại sảnh", icon: Crown },
      { id: "cua-go", name: "Khóa cửa gỗ", icon: DoorClosed },
      { id: "cua-kinh", name: "Khóa cửa kính", icon: DoorClosed },
      { id: "xingfa-sat", name: "Khóa nhôm kính", icon: Columns },
      { id: "cua-cong", name: "Khóa cửa cổng", icon: Shield },
      { id: "khach-san", name: "Khóa khách sạn", icon: Hotel },
    ],
  },
  {
    id: "ket-sat-thong-minh",
    title: "KÉT SẮT THÔNG MINH",
    icon: Vault,
    categoryId: "Smart",
    subcategories: [
      { id: "Smart", name: "Két Kassler", icon: Vault },
      { id: "ket-sat", name: "Két Philips", icon: Vault },
      { id: "ket-mini", name: "Két mini", icon: Box },
      { id: "ket-gia-dinh", name: "Két gia đình", icon: Home },
      { id: "ket-van-phong", name: "Két văn phòng", icon: Briefcase },
    ],
  },
  {
    id: "thiet-bi-bep",
    title: "THIẾT BỊ BẾP",
    icon: CookingPot,
    categoryId: "kitchen-group",
    subcategories: [
      { id: "bep-tu", name: "Bếp từ", icon: Flame },
      { id: "bep-dien-tu", name: "Bếp điện - từ", icon: Flame },
      { id: "bep-gas-am", name: "Bếp gas âm", icon: Flame },
      { id: "bep-tu-ket-hop-may-hut", name: "Bếp từ + máy hút", icon: Waves },
      { id: "may-hut-mui", name: "Máy hút mùi", icon: Waves },
      { id: "may-hut-ap-tuong", name: "Máy hút áp tường", icon: Waves },
      { id: "may-hut-dao", name: "Máy hút đảo", icon: Waves },
      { id: "may-hut-am-tu", name: "Máy hút âm tủ", icon: Waves },
      { id: "may-hut-am-tran", name: "Máy hút âm trần", icon: Waves },
      { id: "may-hut-classic", name: "Máy hút classic", icon: Waves },
      { id: "may-hut-am-ban", name: "Máy hút âm bàn", icon: Waves },
      { id: "lo-nuong", name: "Lò nướng", icon: Microwave },
      { id: "lo-vi-song", name: "Lò vi sóng", icon: Microwave },
      { id: "combo-lo-nuong-lo-vi-song", name: "Combo lò nướng / vi sóng", icon: Microwave },
      { id: "may-rua-chen", name: "Máy rửa chén", icon: Soup },
      { id: "thiet-bi-nha-bep", name: "Thiết bị nhà bếp", icon: CookingPot },
      { id: "chau-voi-bep", name: "Chậu vòi bếp", icon: Droplets },
      { id: "phu-kien-nha-bep", name: "Phụ kiện nhà bếp", icon: Box },
    ],
  },
  {
    id: "quat-tran-den",
    title: "QUẠT TRẦN ĐÈN",
    icon: Fan,
    categoryId: "fanlight-group",
    subcategories: [
      { id: "quat-tran-den-hien-dai", name: "Quạt trần đèn hiện đại", icon: Fan },
      { id: "quat-tran-den-giau-canh", name: "Quạt trần đèn giấu cánh", icon: Fan },
      { id: "quat-tran-den-trang-tri", name: "Quạt trần đèn trang trí", icon: Fan },
      { id: "den-op-quat-trang-tri", name: "Đèn ốp quạt trang trí", icon: Fan },
    ],
  },
  {
    id: "may-loc-nuoc",
    title: "MÁY LỌC NƯỚC",
    icon: Droplets,
    categoryId: "water-group",
    subcategories: [
      { id: "may-ro-tu-dung", name: "Máy lọc nước RO", icon: Droplets },
      { id: "may-dien-giai", name: "Máy điện giải Hydro-ion", icon: Droplets },
      { id: "may-nong-lanh", name: "Máy lọc nước nóng lạnh", icon: Droplets },
      { id: "may-nong-nguoi", name: "Máy lọc nước nóng nguội", icon: Droplets },
      { id: "may-de-gam", name: "Máy lọc nước để gầm", icon: Droplets },
      { id: "cay-nuoc", name: "Cây nước nóng lạnh", icon: Refrigerator },
    ],
  },
  {
    id: "cua",
    title: "CỬA",
    icon: DoorClosed,
    categoryId: "door-group",
    subcategories: [
      { id: "cua-phang", name: "Cửa phẳng", icon: DoorClosed },
      { id: "cua-nep-kim-loai", name: "Cửa nẹp kim loại", icon: DoorClosed },
      { id: "cua-o-kinh", name: "Cửa ô kính", icon: DoorClosed },
      { id: "cua-chi-noi", name: "Cửa chỉ nổi", icon: DoorClosed },
      { id: "cua-hut-huynh", name: "Cửa hút huỳnh", icon: DoorClosed },
      { id: "cua-vom", name: "Cửa vòm", icon: DoorClosed },
      { id: "cua-canh-lech", name: "Cửa cánh lệch", icon: DoorClosed },
      { id: "cua-son", name: "Cửa sơn", icon: DoorClosed },
      { id: "cua-nhom-kinh", name: "Cửa nhôm kính", icon: DoorClosed },
    ],
  },
];

/** Parent menu ids that map to a brand filter (BE has no parent category slug). */
export const GROUP_BRAND_FILTERS: Record<string, string> = {
  "fanlight-group": "fanlight",
  "water-group": "karofi",
  "door-group": "hd-door",
};

export const LOCK_CATEGORY_SLUGS = new Set([
  "dai-sanh",
  "cua-go",
  "cua-kinh",
  "xingfa-sat",
  "cua-cong",
  "khach-san",
]);

export const SMART_SUBCATEGORY_SLUGS = new Set([
  "ket-mini",
  "ket-gia-dinh",
  "ket-van-phong",
]);

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** Every curated sidebar slug (section parents + leaves). */
export function collectKnownSidebarSlugs(
  sections: CatalogSection[] = SIDEBAR_SECTIONS,
): Set<string> {
  const known = new Set<string>();
  for (const section of sections) {
    known.add(section.categoryId);
    known.add(section.id);
    for (const sub of section.subcategories) {
      known.add(sub.id);
    }
  }
  for (const slug of Object.keys(GROUP_BRAND_FILTERS)) {
    known.add(slug);
  }
  known.add("lock-parent");
  known.add("Lock");
  known.add("Kitchen");
  known.add("Water");
  known.add("Cabinet");
  return known;
}

type BrandCategorySource = {
  categories?: { slug: string; name: string }[];
};

/**
 * Keep curated menu order, then append any BE categories not yet in the sidebar
 * so new catalog data shows up without a code deploy.
 */
export function buildSidebarSectionsFromBrands(
  brands: BrandCategorySource[],
  baseSections: CatalogSection[] = SIDEBAR_SECTIONS,
): CatalogSection[] {
  const known = collectKnownSidebarSlugs(baseSections);
  const extras: CatalogSubcategory[] = [];
  const seen = new Set<string>();

  for (const brand of brands) {
    for (const category of brand.categories ?? []) {
      const slug = category.slug?.trim();
      if (!slug || known.has(slug) || seen.has(slug)) continue;
      seen.add(slug);
      extras.push({
        id: slug,
        name: category.name?.trim() || getCategoryLabel(slug),
        icon: Box,
      });
    }
  }

  if (extras.length === 0) return baseSections;

  return [
    ...baseSections,
    {
      id: "danh-muc-moi",
      title: "DANH MỤC MỚI",
      icon: Box,
      categoryId: "extras-group",
      subcategories: extras,
    },
  ];
}
