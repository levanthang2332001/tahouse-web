/**
 * Compact ASCII model codes like "KL - 989 F" → "KL-989F".
 * Leaves descriptive Vietnamese / multi-word titles unchanged.
 */
export function formatProductName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  // Only touch plain model-code style names (no Vietnamese / punctuation-heavy titles).
  if (!/^[A-Za-z0-9][A-Za-z0-9\s\-./+]*$/.test(trimmed)) {
    return trimmed;
  }

  const withTightDashes = trimmed.replace(/\s*-\s*/g, "-");
  const tokens = withTightDashes.split(/\s+/).filter(Boolean);

  // Short fragments (KL, 989, F) → stick together; keep spaced brand words (PHILIPS VALIS…).
  if (
    tokens.length > 1 &&
    tokens.every((token) => token.replace(/-/g, "").length <= 5)
  ) {
    return tokens.join("");
  }

  return withTightDashes;
}
