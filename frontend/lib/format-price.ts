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

export interface ProductDiscountInfo {
  hasDiscount: boolean;
  discountPercent: number;
  savedAmount: number;
  formattedCurrentPrice: string;
  formattedOriginalPrice?: string;
  formattedSavedAmount?: string;
}

export function calculateProductDiscount(
  price: unknown,
  originalPrice?: unknown,
  priceRange?: string | null,
  productId?: string,
): ProductDiscountInfo {
  const current = parseProductPrice(price);
  let original = parseProductPrice(originalPrice);

  const formattedCurrentPrice = formatProductPrice(price, priceRange);

  if (current !== null && current > 0) {
    if (original === null || original <= current) {
      // Deterministically derive a realistic, natural original price based on productId or price
      const seed = (productId || String(current))
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const discountRates = [0.15, 0.18, 0.2, 0.22, 0.25];
      const rate = discountRates[seed % discountRates.length];

      // Round to natural numbers (nearest 50k or 100k)
      const rawOriginal = current / (1 - rate);
      const roundUnit = current >= 5_000_000 ? 100_000 : current >= 1_000_000 ? 50_000 : 10_000;
      original = Math.ceil(rawOriginal / roundUnit) * roundUnit;
    }

    if (original > current) {
      const savedAmount = original - current;
      const discountPercent = Math.round((savedAmount / original) * 100);
      return {
        hasDiscount: true,
        discountPercent,
        savedAmount,
        formattedCurrentPrice: `${current.toLocaleString("vi-VN")} đ`,
        formattedOriginalPrice: `${original.toLocaleString("vi-VN")} đ`,
        formattedSavedAmount: `${savedAmount.toLocaleString("vi-VN")} đ`,
      };
    }
  }

  return {
    hasDiscount: false,
    discountPercent: 0,
    savedAmount: 0,
    formattedCurrentPrice,
  };
}

