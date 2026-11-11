/**
 * Upload một tệp lên thư viện media qua `/api/admin/upload`.
 * Trả về URL công khai, hoặc ném Error với thông báo tiếng Việt rõ ràng (không bao giờ "thành công" khi thiếu URL).
 */
export async function uploadAdminFile(
  file: File,
  fields: Record<string, string | undefined> = {},
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  for (const [key, value] of Object.entries(fields)) {
    if (value) fd.append(key, value);
  }

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  } catch {
    throw new Error(`${file.name}: không kết nối được máy chủ`);
  }

  // Phản hồi lỗi có thể là trang HTML (vd. 413 từ proxy) → không gọi res.json() trực tiếp
  const raw = await res.text();
  let data: { message?: string; url?: string; data?: { url?: string } } = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const reason =
      res.status === 413
        ? "tệp quá lớn"
        : res.status === 401
          ? "phiên đăng nhập đã hết hạn, hãy đăng nhập lại"
          : data.message || `lỗi máy chủ (${res.status})`;
    throw new Error(`${file.name}: ${reason}`);
  }

  const url = data.data?.url || data.url;
  if (!url) throw new Error(`${file.name}: máy chủ không trả về đường dẫn ảnh`);
  return url;
}

/** Gộp lỗi của nhiều tệp thành một thông báo ngắn gọn */
export function summarizeUploadErrors(errors: string[], max = 3): string {
  const shown = errors.slice(0, max).join("; ");
  return errors.length > max ? `${shown}; và ${errors.length - max} tệp khác` : shown;
}
