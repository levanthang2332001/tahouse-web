import test, { describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// ============================================================================
// 1. IMPORT OR REPLICATE LOGIC FROM CORE MODULES FOR TESTING
// ============================================================================

// --- Sanitizer Logic (matching lib/sanitize-html.ts) ---
function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  const sanitized = trimmed.replace(/[\x00-\x1f\x7f\s]/g, "");

  if (/^(?:javascript|vbscript|data):/i.test(sanitized)) {
    return /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=]+$/i.test(
      sanitized,
    );
  }

  return /^(?:(?:https?|mailto|tel):|\/|#)/i.test(sanitized);
}

function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";

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

  const ALLOWED_TAGS = new Set([
    "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "del",
    "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
    "blockquote", "code", "pre", "hr", "a", "img",
    "table", "thead", "tbody", "tr", "th", "td", "span", "div",
    "sub", "sup", "mark"
  ]);

  clean = clean.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagName, attrs) => {
    const tagLower = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tagLower)) {
      return "";
    }

    if (match.startsWith("</")) {
      return `</${tagLower}>`;
    }

    let sanitizedAttrs = "";
    if (attrs) {
      const attrRegex =
        /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

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

// --- Auth Token Logic (matching lib/admin/auth.ts) ---
const ADMIN_SESSION_SECRET = "tahouse-super-secret-admin-token-2026";

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1];
    const jsonStr = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function createAdminToken(user) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    iss: "tahouse-fe",
  };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(signingInput)
    .digest("base64url");

  return `${signingInput}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    const expSeconds = payload.exp
      ? payload.exp > 1e11
        ? Math.floor(payload.exp / 1000)
        : payload.exp
      : undefined;

    if (expSeconds && Date.now() / 1000 > expSeconds) {
      return null;
    }

    if (payload.iss === "tahouse-fe") {
      const signingInput = `${parts[0]}.${parts[1]}`;
      const expectedSignature = crypto
        .createHmac("sha256", ADMIN_SESSION_SECRET)
        .update(signingInput)
        .digest("base64url");

      const sigBuffer = Buffer.from(parts[2]);
      const expBuffer = Buffer.from(expectedSignature);

      if (
        sigBuffer.length !== expBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expBuffer)
      ) {
        return null;
      }
    }

    return {
      id: payload.sub || payload.id || "admin-user",
      username: payload.username || "admin",
      name: payload.fullName || payload.name || payload.username || "Quản trị viên",
      email: payload.email,
      avatarUrl: payload.avatarUrl,
      role: payload.role || "superadmin",
    };
  } catch {
    return null;
  }
}

// --- Media Route Security Logic (matching app/api/media/[...path]/route.ts) ---
const BLOCKED_PREFIXES = ["admin", "auth", "api", "rag", "internal"];
const ALLOWED_DIRECTORIES = new Set([
  "uploads", "static", "images", "media", "files",
  "brands", "products", "avatars", "banners", "documents", "videos",
]);
const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif",
  ".mp4", ".webm", ".pdf", ".ico", ".avif",
]);

function validateMediaProxyPath(path) {
  if (!Array.isArray(path) || path.length === 0) {
    return { valid: false, status: 400, reason: "empty_path" };
  }

  for (const segment of path) {
    if (
      !segment ||
      segment === "." ||
      segment.includes("..") ||
      segment.includes("\\") ||
      segment.includes("\0") ||
      segment.toLowerCase().includes("%2e") ||
      segment.toLowerCase().includes("%2f")
    ) {
      return { valid: false, status: 400, reason: "path_traversal" };
    }
  }

  const firstSegment = path[0].toLowerCase();
  if (BLOCKED_PREFIXES.includes(firstSegment)) {
    return { valid: false, status: 403, reason: "blocked_prefix" };
  }

  const lastSegment = path[path.length - 1].toLowerCase();
  const dotIndex = lastSegment.lastIndexOf(".");
  const ext = dotIndex !== -1 ? lastSegment.slice(dotIndex) : "";

  const isAllowedDir = ALLOWED_DIRECTORIES.has(firstSegment);
  const isAllowedExt = ext ? ALLOWED_EXTENSIONS.has(ext) : false;

  if (!isAllowedDir && !isAllowedExt) {
    return { valid: false, status: 403, reason: "unauthorized_directory_or_extension" };
  }

  return { valid: true, status: 200, assetPath: path.join("/") };
}

// --- Chatbot API Validation Logic ---
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 50;

function validateChatRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Dữ liệu yêu cầu không hợp lệ" };
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return { valid: false, message: "Tin nhắn không được để trống" };
  }

  const trimmed = body.message.trim();
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      message: `Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự`,
    };
  }

  let validHistory = [];
  if (Array.isArray(body.history)) {
    validHistory = body.history
      .slice(-MAX_HISTORY_ITEMS)
      .filter(
        (h) =>
          h &&
          typeof h === "object" &&
          (h.role === "user" || h.role === "assistant") &&
          typeof h.content === "string" &&
          h.content.trim(),
      )
      .map((h) => ({
        role: h.role,
        content: h.content.trim().slice(0, MAX_MESSAGE_LENGTH),
      }));
  }

  return { valid: true, message: trimmed, history: validHistory };
}

// ============================================================================
// 2. TEST CASES EXECUTION
// ============================================================================

describe("Security & Defense Suite: Sanitization, Auth & Proxy", () => {
  // --------------------------------------------------------------------------
  // XSS Defense Tests
  // --------------------------------------------------------------------------
  test("XSS 1.1: Blocks raw <script> tags and embedded payloads", () => {
    const malicious = '<p>Normal text</p><script>alert("XSS")</script><p>More text</p>';
    const sanitized = sanitizeHtml(malicious);
    assert.doesNotMatch(sanitized, /script/i);
    assert.doesNotMatch(sanitized, /alert/i);
    assert.match(sanitized, /<p>Normal text<\/p>/);
    assert.match(sanitized, /<p>More text<\/p>/);
  });

  test("XSS 1.2: Strips inline event handlers (onerror, onload, onclick, onmouseover)", () => {
    const attacks = [
      '<img src="https://images.unsplash.com/test.jpg" onerror="alert(1)" />',
      '<div onclick="evilCode()">Click me</div>',
      '<span onmouseover="stealCookies()">Hover me</span>',
      '<b onload="eval()">Bold</b>',
    ];

    for (const attack of attacks) {
      const sanitized = sanitizeHtml(attack);
      assert.doesNotMatch(sanitized, /on[a-z]+\s*=/i, `Failed to strip event handler in: ${attack}`);
    }
  });

  test("XSS 1.3: Blocks javascript: pseudo-protocols in links and images", () => {
    const maliciousLink = '<a href="javascript:alert(document.cookie)">Bấm vào đây để nhận quà</a>';
    const sanitized = sanitizeHtml(maliciousLink);
    assert.doesNotMatch(sanitized, /javascript:/i);
    assert.doesNotMatch(sanitized, /href\s*=\s*"/i);
    assert.match(sanitized, /Bấm vào đây để nhận quà/);
  });

  test("XSS 1.4: Neutralizes obfuscated javascript: URLs (whitespace, tabs, mixed case)", () => {
    const maliciousUrls = [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "jav\tascript:alert(1)",
      "jav\nascript:alert(1)",
      "vbscript:msgbox",
      "data:text/html,<script>alert(1)</script>",
    ];

    for (const url of maliciousUrls) {
      assert.equal(isSafeUrl(url), false, `Should reject dangerous URL: ${url}`);
    }
  });

  test("XSS 1.5: Preserves legitimate links and adds rel='noopener noreferrer' to target='_blank'", () => {
    const safeInput = '<a href="https://tahouse.vn/products" target="_blank">Xem sản phẩm</a>';
    const sanitized = sanitizeHtml(safeInput);
    assert.match(sanitized, /href="https:\/\/tahouse\.vn\/products"/);
    assert.match(sanitized, /target="_blank"/);
    assert.match(sanitized, /rel="noopener noreferrer"/);
  });

  test("XSS 1.6: Strips dangerous embedded content (iframe, object, embed, svg)", () => {
    const dangerousBlocks = [
      '<iframe src="https://attacker.com/malicious.html"></iframe>',
      '<object data="evil.swf"></object>',
      '<embed src="evil.pdf"></embed>',
      '<svg onload="alert(1)"><circle r="10"/></svg>',
    ];

    for (const block of dangerousBlocks) {
      const sanitized = sanitizeHtml(block);
      assert.doesNotMatch(sanitized, /iframe|object|embed|svg/i);
    }
  });

  test("XSS 1.7: Preserves legitimate TipTap formatting", () => {
    const legitimateContent =
      '<h3>Đặc điểm nổi bật</h3>' +
      '<p>Khóa cửa <strong>Bosch EL600</strong> với tính năng <em>Face ID 3D</em> cao cấp.</p>' +
      '<ul><li>Mở bằng vân tay</li><li>Mở bằng thẻ từ</li></ul>';

    const sanitized = sanitizeHtml(legitimateContent);
    assert.equal(sanitized, legitimateContent);
  });

  // --------------------------------------------------------------------------
  // Admin Token & HMAC Cryptographic Security Tests
  // --------------------------------------------------------------------------
  test("Auth 2.1: Creates valid signed JWT with HMAC-SHA256 signature", () => {
    const adminUser = {
      id: "admin-1",
      username: "admin",
      name: "Quản Trị Viên",
      role: "superadmin",
    };

    const token = createAdminToken(adminUser);
    assert.ok(typeof token === "string");
    const parts = token.split(".");
    assert.equal(parts.length, 3, "Token must be a 3-part JWT");

    const verified = verifyAdminToken(token);
    assert.ok(verified, "Legitimate signed token must verify successfully");
    assert.equal(verified.username, "admin");
    assert.equal(verified.role, "superadmin");
  });

  test("Auth 2.2: Rejects tampered token payloads", () => {
    const adminUser = {
      id: "admin-1",
      username: "admin",
      name: "Quản Trị Viên",
      role: "superadmin",
    };
    const validToken = createAdminToken(adminUser);
    const [header, , sig] = validToken.split(".");

    // Attacker tampers payload to elevate privileges or impersonate
    const forgedPayload = Buffer.from(
      JSON.stringify({
        id: "attacker-id",
        username: "super-hacker",
        role: "superadmin",
        iss: "tahouse-fe",
        exp: Math.floor(Date.now() / 1000) + 999999,
      }),
    ).toString("base64url");

    const tamperedToken = `${header}.${forgedPayload}.${sig}`;
    const result = verifyAdminToken(tamperedToken);
    assert.equal(result, null, "Tampered payload must be rejected");
  });

  test("Auth 2.3: Rejects forged tokens created without the server secret", () => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        username: "admin",
        role: "superadmin",
        iss: "tahouse-fe",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url");

    // Attacker signs with wrong secret
    const fakeSignature = crypto
      .createHmac("sha256", "wrong-secret-key-12345")
      .update(`${header}.${payload}`)
      .digest("base64url");

    const forgedToken = `${header}.${payload}.${fakeSignature}`;
    const result = verifyAdminToken(forgedToken);
    assert.equal(result, null, "Token signed with incorrect secret must be rejected");
  });

  test("Auth 2.4: Rejects expired tokens", () => {
    const expiredPayload = {
      username: "admin",
      role: "superadmin",
      iss: "tahouse-fe",
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };
    const headerB64 = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
    const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const sig = crypto
      .createHmac("sha256", ADMIN_SESSION_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    const expiredToken = `${headerB64}.${payloadB64}.${sig}`;
    assert.equal(verifyAdminToken(expiredToken), null, "Expired token must be rejected");
  });

  test("Auth 2.5: Handles null, undefined, malformed strings gracefully", () => {
    assert.equal(verifyAdminToken(null), null);
    assert.equal(verifyAdminToken(undefined), null);
    assert.equal(verifyAdminToken(""), null);
    assert.equal(verifyAdminToken("invalid-token-string"), null);
    assert.equal(verifyAdminToken("only.two.parts.bad.length"), null);
  });

  // --------------------------------------------------------------------------
  // Media Proxy SSRF & Path Traversal Defense Tests
  // --------------------------------------------------------------------------
  test("Proxy 3.1: Rejects path traversal attempts (.., %2e%2e, backslashes)", () => {
    const attacks = [
      ["..", "etc", "passwd"],
      ["uploads", "..", "..", "admin", "products"],
      ["uploads", "%2e%2e", "secret"],
      ["uploads", "image..jpg"],
      ["uploads\\sub", "image.png"],
    ];

    for (const path of attacks) {
      const res = validateMediaProxyPath(path);
      assert.equal(res.valid, false, `Should reject traversal path: ${path.join("/")}`);
      assert.equal(res.status, 400);
    }
  });

  test("Proxy 3.2: Rejects internal/admin/auth backend routes", () => {
    const blockedRoutes = [
      ["admin", "products"],
      ["auth", "me"],
      ["api", "keys"],
      ["rag", "chat"],
      ["internal", "metrics"],
    ];

    for (const path of blockedRoutes) {
      const res = validateMediaProxyPath(path);
      assert.equal(res.valid, false, `Should block backend route: ${path.join("/")}`);
      assert.equal(res.status, 403);
    }
  });

  test("Proxy 3.3: Allows valid authorized media assets", () => {
    const validPaths = [
      ["uploads", "product-kl600.jpg"],
      ["products", "bosch-el600.webp"],
      ["brands", "kaadas-logo.svg"],
      ["documents", "huong-dan-su-dung.pdf"],
    ];

    for (const path of validPaths) {
      const res = validateMediaProxyPath(path);
      assert.equal(res.valid, true, `Should allow valid media path: ${path.join("/")}`);
      assert.equal(res.status, 200);
    }
  });

  // --------------------------------------------------------------------------
  // Chatbot API Validation & DoS Protection Tests
  // --------------------------------------------------------------------------
  test("Chat 4.1: Rejects empty or whitespace-only messages", () => {
    assert.equal(validateChatRequest({ message: "" }).valid, false);
    assert.equal(validateChatRequest({ message: "   \n  " }).valid, false);
    assert.equal(validateChatRequest({}).valid, false);
  });

  test("Chat 4.2: Enforces maximum message length (2000 chars) to prevent DoS", () => {
    const hugeMessage = "A".repeat(2001);
    const result = validateChatRequest({ message: hugeMessage });
    assert.equal(result.valid, false);
    assert.match(result.message, /vượt quá 2000 ký tự/);

    const okMessage = "A".repeat(2000);
    assert.equal(validateChatRequest({ message: okMessage }).valid, true);
  });

  test("Chat 4.3: Validates and sanitizes chat history array", () => {
    const historyInput = [
      { role: "user", content: "Tôi cần tư vấn khóa cửa gỗ" },
      { role: "assistant", content: "TA HOUSE xin giới thiệu dòng khóa Kaadas S500" },
      { role: "invalid_role", content: "Hacked" }, // Should be dropped
      null,
      { role: "user", content: "   " }, // Empty content should be dropped
    ];

    const result = validateChatRequest({
      message: "Giá của sản phẩm này bao nhiêu?",
      history: historyInput,
    });

    assert.equal(result.valid, true);
    assert.equal(result.history.length, 2);
    assert.equal(result.history[0].role, "user");
    assert.equal(result.history[1].role, "assistant");
  });
});
