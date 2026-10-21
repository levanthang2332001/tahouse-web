/** Parse BE price field (may be null, number, or numeric string with thousand separators). */
export function parseProductPrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    let clean = value.trim().replace(/[^\d.,-]/g, "");
    if (!clean) return null;

    if ((clean.match(/\./g) || []).length > 1) {
      clean = clean.replace(/\./g, "");
    } else if ((clean.match(/,/g) || []).length > 1) {
      clean = clean.replace(/,/g, "");
    } else if (clean.includes(".") && clean.includes(",")) {
      if (clean.indexOf(".") < clean.indexOf(",")) {
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else {
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.includes(".") && !clean.includes(",")) {
      const parts = clean.split(".");
      if (parts[1] && parts[1].length === 3) {
        clean = clean.replace(/\./g, "");
      }
    } else if (clean.includes(",") && !clean.includes(".")) {
      const parts = clean.split(",");
      if (parts[1] && parts[1].length === 3) {
        clean = clean.replace(/,/g, "");
      }
    }

    const parsed = Number(clean);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _productId?: string,
): ProductDiscountInfo {
  const current = parseProductPrice(price);
  const original = parseProductPrice(originalPrice);

  const formattedCurrentPrice = formatProductPrice(price, priceRange);

  // Only show a discount backed by a real original price; never derive one
  if (current !== null && current > 0 && original !== null) {
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

