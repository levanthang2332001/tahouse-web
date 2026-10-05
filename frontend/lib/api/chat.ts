import type { ChatMessage } from "@/lib/types/chat";

export async function streamChat(
  message: string,
  history: ChatMessage[],
  onChunk: (content: string) => void,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Không thể kết nối chatbot tư vấn");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      full = appendSseChunk(full, line, onChunk);
    }
  }

  if (buffer.trim()) {
    full = appendSseChunk(full, buffer, onChunk);
  }

  return full;
}

function appendSseChunk(
  full: string,
  line: string,
  onChunk: (content: string) => void,
): string {
  if (!line.startsWith("data: ")) return full;

  const payload = line.slice(6).trim();
  if (!payload || payload === "[DONE]") return full;

  try {
    const parsed = JSON.parse(payload) as { content?: string };
    if (parsed.content) {
      const next = full + parsed.content;
      onChunk(next);
      return next;
    }
  } catch {
    // Skip malformed SSE chunks
  }

  return full;
}
