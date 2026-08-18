/**
 * Compact ASCII model codes like "KL - 989 F" → "KL-989F".
 * Cleans up loose spacing around model identifiers while preserving Vietnamese product titles.
 */
export function formatProductName(name: string): string {
  if (!name) return "";
  let result = name.trim();

  // 1. Collapse spaces around dashes: "KL - 989" -> "KL-989"
  result = result.replace(/([A-Za-z0-9])\s*-\s*([A-Za-z0-9])/g, "$1-$2");

  // 2. Collapse trailing suffix letters separated by space: "KL-989 F" -> "KL-989F", "KL-989 FP" -> "KL-989FP"
  result = result.replace(/([A-Za-z0-9]+-\d+)\s+([A-Za-z0-9]{1,3})\b/g, "$1$2");

  // 3. Collapse space between letter prefix and number if separated by space: "KL 989 F" -> "KL-989F"
  result = result.replace(/\b([A-Za-z]{2,4})\s+(\d{3,4})\s*([A-Za-z]{1,3})?\b/g, (_match, p1, p2, p3) => {
    return `${p1}-${p2}${p3 || ""}`;
  });

  return result;
}
