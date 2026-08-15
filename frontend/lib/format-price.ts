/** Parse BE price field (may be null, number, or numeric string). */
export function parseProductPrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function formatProductPrice(
  price: unknown,
  priceRange?: string | null,
): string {
  const numeric = parseProductPrice(price);
  if (numeric !== null && numeric > 0) {
    return `${numeric.toLocaleString("vi-VN")} đ`;
  }
  if (
    priceRange?.trim() &&
    priceRange.trim() !== "0" &&
    priceRange.trim() !== "0 VNĐ" &&
    priceRange.trim() !== "0đ"
  ) {
    return priceRange.trim();
  }
  return "Liên hệ";
}

