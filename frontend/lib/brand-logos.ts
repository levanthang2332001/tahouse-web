/** Local brand logo assets under `/public/brands`. */
export const LOCAL_BRAND_LOGOS: Record<string, string> = {
  bosch: "/brands/bosch.svg",
  philips: "/brands/philips.svg",
  kassler: "/brands/kassler.png",
  eurogold: "/brands/eurogold.svg",
  malloca: "/brands/malloca.svg",
  hafele: "/brands/hafele.png",
  kaff: "/brands/kaff.jpg",
  eurosun: "/brands/eurosun.png",
  grob: "/brands/grob.png",
  karofi: "/brands/karofi.png",
  sharp: "/brands/sharp.png",
  hyundai: "/brands/hyundai.png",
  fanlight: "/brands/fanlight.png",
  hubert: "/brands/hubert.svg",
  kaadas: "/brands/kaadas.svg",
  demax: "/brands/demax.svg",
  panasonic: "/brands/panasonic.svg",
  "hd-door": "/brands/hd-door.svg",
  grandx: "/brands/grandx.svg",
  nobinox: "/brands/nobinox.svg",
};

/** Text-only brand marks when no image logo is provided. */
export const LOCAL_BRAND_LABELS: Record<string, string> = {
  "hd-door": "HDOOR®",
};

export function getLocalBrandLogo(
  slug?: string | null,
  name?: string | null,
): string | undefined {
  if (slug && LOCAL_BRAND_LOGOS[slug]) return LOCAL_BRAND_LOGOS[slug];
  const key = (name || "").trim().toLowerCase();
  if (!key) return undefined;
  for (const [slugKey, src] of Object.entries(LOCAL_BRAND_LOGOS)) {
    if (key === slugKey || key.replace(/\s+/g, "-") === slugKey) return src;
  }
  return undefined;
}

export function getLocalBrandLabel(
  slug?: string | null,
  name?: string | null,
): string | undefined {
  if (slug && LOCAL_BRAND_LABELS[slug]) return LOCAL_BRAND_LABELS[slug];
  const key = (name || "").trim().toLowerCase().replace(/\s+/g, "-");
  return LOCAL_BRAND_LABELS[key];
}
