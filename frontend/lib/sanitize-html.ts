/**
 * SSR-safe, zero-dependency HTML sanitizer for TipTap output and user/AI generated content.
 * Prevents Stored and Reflected Cross-Site Scripting (XSS).
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
  "sub",
  "sup",
  "mark",
]);

/**
 * Validates that a URL does not contain dangerous protocols like javascript:, vbscript:, or data:text/html.
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  // Strip control characters, tabs, newlines, and null bytes
  const sanitized = trimmed.replace(/[\x00-\x1f\x7f\s]/g, "");

  // Detect script execution schemes
  if (/^(?:javascript|vbscript|data):/i.test(sanitized)) {
    // Only allow safe raster image data URIs
    return /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=]+$/i.test(
      sanitized,
    );
  }

  // Allow standard web protocols or relative paths/anchors
  return /^(?:(?:https?|mailto|tel):|\/|#)/i.test(sanitized);
}

/**
 * Sanitizes an HTML string by removing dangerous elements and stripping hazardous attributes.
 */
export function sanitizeHtml(html?: string | null): string {
  if (!html || typeof html !== "string") return "";

  // 1. Remove dangerous blocks and their contents completely
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<math\b[^<]*(?:(?!<\/math>)<[^<]*)*<\/math>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<base\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "");

  // 2. Parse and filter tags & attributes
  clean = clean.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagName, attrs) => {
    const tagLower = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tagLower)) {
      return "";
    }

    // Closing tag
    if (match.startsWith("</")) {
      return `</${tagLower}>`;
    }

    // Opening tag: parse allowed attributes
    let sanitizedAttrs = "";
    if (attrs) {
      const attrRegex =
        /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
      let attrMatch: RegExpExecArray | null;

      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

        // Disallow all event handlers (onload, onerror, onclick, etc.)
        if (attrName.startsWith("on")) continue;

        if (attrName === "href" && tagLower === "a") {
          if (isSafeUrl(attrVal)) {
            sanitizedAttrs += ` href="${attrVal.replace(/"/g, "&quot;")}"`;
          }
        } else if (attrName === "src" && tagLower === "img") {
          if (isSafeUrl(attrVal)) {
            sanitizedAttrs += ` src="${attrVal.replace(/"/g, "&quot;")}"`;
          }
        } else if (attrName === "target" && tagLower === "a") {
          if (attrVal === "_blank") {
            sanitizedAttrs += ` target="_blank" rel="noopener noreferrer"`;
          }
        } else if (attrName === "alt" && tagLower === "img") {
          sanitizedAttrs += ` alt="${attrVal.replace(/"/g, "&quot;")}"`;
        } else if (attrName === "title") {
          sanitizedAttrs += ` title="${attrVal.replace(/"/g, "&quot;")}"`;
        } else if (attrName === "class") {
          sanitizedAttrs += ` class="${attrVal.replace(/"/g, "&quot;")}"`;
        }
      }
    }

    if (tagLower === "img" || tagLower === "br" || tagLower === "hr") {
      return `<${tagLower}${sanitizedAttrs} />`;
    }
    return `<${tagLower}${sanitizedAttrs}>`;
  });

  return clean;
}
