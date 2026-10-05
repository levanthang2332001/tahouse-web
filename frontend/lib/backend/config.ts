export function getBackendUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return url.replace(/\/$/, "");
}
