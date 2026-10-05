import { NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/backend/config";
import type { ChatRequest } from "@/lib/types/chat";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message?.trim()) {
      return Response.json(
        { message: "Tin nhắn không được để trống" },
        { status: 400 },
      );
    }

    const res = await fetch(`${getBackendUrl()}/rag/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: body.message,
        history: body.history ?? [],
      }),
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      return Response.json(
        { message: "Không thể kết nối chatbot tư vấn" },
        { status: 502 },
      );
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[POST /api/chat]", error);
    return Response.json(
      { message: "Không thể kết nối chatbot tư vấn" },
      { status: 502 },
    );
  }
}
