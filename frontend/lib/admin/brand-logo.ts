import { getLocalBrandLogo } from "@/lib/brand-logos";
import { resolveMediaUrl } from "@/lib/media";

/**
 * Seeded backend logos point at `/brand/*.png`, which this app does not serve.
 * Treat them like an empty logo so the bundled `/brands/*` asset is used instead.
 */
function isSeededBrandLogo(logo: string): boolean {
  return logo.replace(/^\/+/, "").startsWith("brand/");
}

/**
 * Logo URL to display for a brand, shared by the admin page and the public `/api/brands`
 * so both show the same image:
 * - a real stored logo (uploaded media, external `https://…` URL) wins;
 * - an empty or seeded `/brand/…` logo falls back to the bundled local asset.
 * Client-safe (no server imports).
 */
export function resolveBrandLogo(
  logo: string | null | undefined,
  slug?: string | null,
  name?: string | null,
): string {
  const stored = (logo || "").trim();
  if (!stored || isSeededBrandLogo(stored)) return getLocalBrandLogo(slug, name) || "";

  // Absolute URLs, data URIs and already-proxied media are used as-is
  if (/^(https?:)?\/\//i.test(stored) || stored.startsWith("data:") || stored.startsWith("/api/media/")) {
    return stored;
  }
  // A bundled asset in /public/brands (e.g. "/brands/bosch.svg") is served by this app
  if (/^\/brands\/[^/]+$/.test(stored)) return stored;
  // Otherwise it is an uploaded media key/path stored by the backend
  return resolveMediaUrl(stored);
}
