import { cache } from "react";
import { getProductById } from "@/lib/admin/product-store";
import { backendFetch } from "@/lib/backend/client";
import { mapProductDetail } from "@/lib/backend/map-product";
import type { Product } from "@/lib/types/product";

/**
 * Product detail shared by the public API route and the server-rendered product page.
 * Memoized per request so generateMetadata and the page only hit the backend once.
 */
export const getProductDetail = cache(async (id: string): Promise<Product | null> => {
  const cleanId = id?.trim();
  if (!cleanId) return null;

  const data = await getProductById(cleanId);
  if (!data) return null;

  // If installation_preview is empty, check /installation sub-endpoint for real jobsite photos
  if (data.id && (!data.installation_preview || data.installation_preview.length === 0)) {
    try {
      const installData = await backendFetch<{
        items?: Array<{ url: string; type: string }>;
      }>(`/products/locks/${encodeURIComponent(data.id)}/installation`);
      if (installData?.items && installData.items.length > 0) {
        data.installation_preview = installData.items
          .filter((item) => item.type === "image" && Boolean(item.url))
          .map((item) => item.url);
      }
    } catch {
      // Soft-fail: product might not have an installation record
    }
  }

  return mapProductDetail(data);
});
