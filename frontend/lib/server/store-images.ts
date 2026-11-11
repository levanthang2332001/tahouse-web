import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "store-images.json");
const FALLBACK_STORE_IMAGES = [
  "/store/2.jpg",
  "/store/1.jpg",
  "/store/3.jpg",
  "/store/4.jpg",
];

export async function getSavedStoreImages(): Promise<string[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      return data.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
    }
  } catch {
    // If file does not exist, return fallback
  }
  return FALLBACK_STORE_IMAGES;
}

export async function saveStoreImages(images: string[]): Promise<string[]> {
  const sanitized = (Array.isArray(images) ? images : [])
    .filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    )
    .slice(0, 20);

  const toSave = sanitized.length > 0 ? sanitized : FALLBACK_STORE_IMAGES;

  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  } catch (error) {
    console.error("[saveStoreImages] Error writing store-images.json:", error);
  }

  return toSave;
}
