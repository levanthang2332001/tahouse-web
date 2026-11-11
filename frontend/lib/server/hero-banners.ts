import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "hero-banners.json");
const FALLBACK_BANNERS = ["/parner.jpg"];

export async function getSavedHeroBanners(): Promise<string[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      return data.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // If file does not exist, return fallback
  }
  return FALLBACK_BANNERS;
}

export async function saveHeroBanners(banners: string[]): Promise<string[]> {
  const sanitized = (Array.isArray(banners) ? banners : [])
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 10);

  const toSave = sanitized.length > 0 ? sanitized : FALLBACK_BANNERS;

  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  } catch (error) {
    console.error("[saveHeroBanners] Error writing hero-banners.json:", error);
  }

  return toSave;
}
