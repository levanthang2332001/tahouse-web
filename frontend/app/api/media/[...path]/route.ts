import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend/config";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const BLOCKED_PREFIXES = ["admin", "auth", "api", "rag", "internal"];

const ALLOWED_DIRECTORIES = new Set([
  "uploads",
  "static",
  "images",
  "media",
  "files",
  "brands",
  "products",
  "avatars",
  "banners",
  "documents",
  "videos",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".svg",
  ".gif",
  ".mp4",
  ".webm",
  ".pdf",
  ".ico",
  ".avif",
]);

const DANGEROUS_MIME_TYPES = new Set([
  "text/html",
  "application/javascript",
  "text/javascript",
  "application/x-javascript",
  "application/ecmascript",
]);

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;

    if (!Array.isArray(path) || path.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    // 1. Path traversal & null byte validation
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
        return new NextResponse(null, { status: 400 });
      }
    }

    const firstSegment = path[0].toLowerCase();
    if (BLOCKED_PREFIXES.includes(firstSegment)) {
      return new NextResponse(null, { status: 403 });
    }

    const assetPath = path.join("/");
    const lastSegment = path[path.length - 1].toLowerCase();
    const dotIndex = lastSegment.lastIndexOf(".");
    const ext = dotIndex !== -1 ? lastSegment.slice(dotIndex) : "";

    // 2. Whitelist: allowed directory or allowed media extension
    const isAllowedDir = ALLOWED_DIRECTORIES.has(firstSegment);
    const isAllowedExt = ext ? ALLOWED_EXTENSIONS.has(ext) : false;

    if (!isAllowedDir && !isAllowedExt) {
      return new NextResponse(null, { status: 403 });
    }

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/${assetPath}`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    let contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const baseMime = contentType.split(";")[0].trim().toLowerCase();

    // 3. Security headers to prevent XSS and MIME sniffing
    const responseHeaders = new Headers({
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    });

    // Disallow serving executable web content from asset proxy
    if (DANGEROUS_MIME_TYPES.has(baseMime)) {
      contentType = "application/octet-stream";
      responseHeaders.set("Content-Disposition", 'attachment; filename="download.bin"');
    } else if (baseMime === "image/svg+xml") {
      responseHeaders.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
    }

    responseHeaders.set("Content-Type", contentType);

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[GET /api/media]", error);
    return new NextResponse(null, { status: 502 });
  }
}
