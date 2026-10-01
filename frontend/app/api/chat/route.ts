import { NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/backend/config";
import type { ChatRequest } from "@/lib/types/chat";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 50;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ChatRequest>;

    if (!body || typeof body !== "object") {
      return Response.json(
        { message: "Dữ liệu yêu cầu không hợp lệ" },
        { status: 400 },
      );
    }

    if (
      typeof body.message !== "string" ||
      !body.message.trim()
    ) {
      return Response.json(
        { message: "Tin nhắn không được để trống" },
        { status: 400 },
      );
    }

    const trimmedMessage = body.message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        {
          message: `Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự`,
        },
        { status: 400 },
      );
    }

    // Validate and sanitize history
    let validHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
    if (Array.isArray(body.history)) {
      validHistory = body.history
        .slice(-MAX_HISTORY_ITEMS)
        .filter(
          (h) =>
            h &&
            typeof h === "object" &&
            (h.role === "user" || h.role === "assistant") &&
            typeof h.content === "string" &&
            h.content.trim(),
        )
        .map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content.trim().slice(0, MAX_MESSAGE_LENGTH),
        }));
    }

    const res = await fetch(`${getBackendUrl()}/rag/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: trimmedMessage,
        history: validHistory,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
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
