import type { PolicyBlock } from "@/lib/policy-types";

/** Tiêu đề lớn (I. II. III. …) hoặc khối liên hệ */
function isMajorHeading(text: string) {
  const t = text.trim();
  return /^[IVX]+\.\s/.test(t) || /^Thông tin liên hệ/i.test(t);
}

/** In đậm phần nhãn trước dấu ':' trong mục danh sách (ví dụ Hotline:, Email:) */
function ListItemText({ item }: { item: string }) {
  const colon = item.indexOf(":");
  if (colon > 0 && colon <= 48) {
    return (
      <>
        <span className="font-semibold text-navy">{item.slice(0, colon + 1)}</span>
        <span className="font-normal text-navy/80">{item.slice(colon + 1)}</span>
      </>
    );
  }
  return <span className="font-normal text-navy/80">{item}</span>;
}

/**
 * Quy tắc chữ:
 * - Tiêu đề mục: in đậm, chữ thường (không viết hoa toàn bộ)
 * - Đoạn văn / danh sách: chữ thường (font-normal)
 * - Nhãn trong list (trước dấu :): semi-bold
 */
export function PolicyContent({ sections }: { sections: PolicyBlock[] }) {
  return (
    <div className="space-y-4 text-[15px] font-normal leading-relaxed text-navy/80">
      {sections.map((block, index) => {
        if (block.type === "heading") {
          const major = isMajorHeading(block.text);
          return (
            <h2
              key={index}
              className={
                major
                  ? "pt-5 text-base font-bold leading-snug text-navy first:pt-0 sm:text-[17px]"
                  : "pt-3 text-[15px] font-bold leading-snug text-navy first:pt-0"
              }
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={index}
              className={
                block.ordered
                  ? "list-decimal space-y-2.5 pl-5 font-normal"
                  : "list-disc space-y-2.5 pl-5 font-normal"
              }
            >
              {block.items.map((item) => (
                <li key={item} className="pl-1">
                  <ListItemText item={item} />
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={index} className="text-[15px] font-normal leading-relaxed text-navy/80">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
