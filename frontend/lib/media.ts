/** Rewrite backend asset paths to same-origin proxy (hides BE URL from the client). */
export function resolveMediaUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `/api/media/${normalized}`;
}

export function resolveMediaUrls(paths: string[] | undefined): string[] {
  return paths?.map(resolveMediaUrl) ?? [];
}
