const LOCK_CATEGORIES = new Set([
  "dai-sanh",
  "cua-go",
  "cua-kinh",
  "xingfa-sat",
  "cua-cong",
  "khach-san",
]);

const SMART_SUBCATEGORIES = new Set(["ket-mini", "ket-gia-dinh", "ket-van-phong"]);

const KITCHEN_SUBCATEGORIES = new Set([
  "bep-tu",
  "may-hut-mui",
  "chau-rua",
  "voi-rua",
  "lo-nuong",
  "may-rua-chen",
  "thiet-bi-bep-khac",
]);

const CABINET_SUBCATEGORIES = new Set([
  "gia-bat-nang-ha",
  "ke-goc-lien-hoan",
  "thung-gao",
  "thung-rac-am-tu",
  "ray-truot",
  "phu-kien-khac",
]);

const WATER_SUBCATEGORIES = new Set([
  "may-loc-nuoc-ro",
  "may-loc-nuoc-ion-kiem",
  "loc-tong-sinh-hoat",
  "loi-loc-phu-kien",
]);

/** Map FE sidebar filter slug to backend query params. */
export function mapFilterToApiParams(
  filter: string,
): { category?: string; subcategory?: string } {
  if (filter === "all") return {};

  if (filter === "lock-parent" || filter === "Lock") {
    return { category: "lock-parent" };
  }

  if (filter === "Smart" || filter === "Kitchen" || filter === "Cabinet" || filter === "Water") {
    return { category: filter };
  }

  if (LOCK_CATEGORIES.has(filter)) {
    return { category: filter };
  }

  if (SMART_SUBCATEGORIES.has(filter)) {
    return { category: "Smart", subcategory: filter };
  }

  if (KITCHEN_SUBCATEGORIES.has(filter)) {
    return { category: "Kitchen", subcategory: filter };
  }

  if (CABINET_SUBCATEGORIES.has(filter)) {
    return { category: "Cabinet", subcategory: filter };
  }

  if (WATER_SUBCATEGORIES.has(filter)) {
    return { category: "Water", subcategory: filter };
  }

  return { category: filter };
}
