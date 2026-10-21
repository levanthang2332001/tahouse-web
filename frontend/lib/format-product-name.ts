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

  return normalizeToneMarks(result);
}

// New-style tone placement ("khoá", "thuỷ") → the traditional style used across site copy ("khóa", "thủy")
const TONE_SHIFT: Record<string, string> = {
  "oá": "óa", "oà": "òa", "oả": "ỏa", "oã": "õa", "oạ": "ọa",
  "oé": "óe", "oè": "òe", "oẻ": "ỏe", "oẽ": "õe", "oẹ": "ọe",
  "uý": "úy", "uỳ": "ùy", "uỷ": "ủy", "uỹ": "ũy", "uỵ": "ụy",
};

function normalizeToneMarks(text: string): string {
  // Only open syllables ("khoá" but not "hoàn"), and not "qu" clusters ("quý" stays)
  return text.replace(/(?<![qQ])([oOuU])([áàảãạéèẻẽẹýỳỷỹỵÁÀẢÃẠÉÈẺẼẸÝỲỶỸỴ])(?!\p{L})/gu, (match, v: string, toned: string) => {
    const shifted = TONE_SHIFT[`${v.toLowerCase()}${toned.toLowerCase()}`];
    if (!shifted) return match;
    const first = v === v.toUpperCase() ? shifted[0].toUpperCase() : shifted[0];
    const second = toned === toned.toUpperCase() ? shifted[1].toUpperCase() : shifted[1];
    return first + second;
  });
}
