import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend/config";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;
    const assetPath = path.join("/");
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/${assetPath}`, { cache: "force-cache" });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[GET /api/media]", error);
    return new NextResponse(null, { status: 502 });
  }
}
