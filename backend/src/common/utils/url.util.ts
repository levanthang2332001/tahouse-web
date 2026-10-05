export function resolveMediaUrl(path: string, baseUrl = ''): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!baseUrl) return path;

  const base = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function resolveMediaUrls(paths: string[], baseUrl = ''): string[] {
  return paths.map((path) => resolveMediaUrl(path, baseUrl));
}
