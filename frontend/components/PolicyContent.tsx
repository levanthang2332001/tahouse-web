import React from "react";
import { Check, Phone, Mail, MapPin, Building, ShieldCheck, FileCheck } from "lucide-react";
import type { PolicyBlock } from "@/lib/policy-types";
import { COMPANY_LEGAL } from "@/data/company-legal";

/** Check if text is a major section heading (e.g. "1. Giá bán", "I. ...", "Điều 1...") */
function extractHeadingNumber(text: string): { num: string | null; title: string } {
  const t = text.trim();
  const matchNum = t.match(/^(\d+|[IVX]+)\.\s*(.*)$/);
  if (matchNum) {
    return { num: matchNum[1], title: matchNum[2] };
  }
  return { num: null, title: t };
}

function isContactHeading(text: string) {
  const t = text.trim().toLowerCase();
  return t.includes("thông tin liên hệ") || t.includes("liên hệ giải đáp");
}

/** In đậm phần nhãn trước dấu ':' trong mục danh sách (ví dụ Hotline:, Email:) */
function ListItemText({ item }: { item: string }) {
  const colon = item.indexOf(":");
  if (colon > 0 && colon <= 48) {
    const label = item.slice(0, colon + 1);
    const value = item.slice(colon + 1);

    // Auto-link phone numbers
    if (label.toLowerCase().includes("hotline") || label.toLowerCase().includes("điện thoại")) {
      return (
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="font-bold text-navy">{label}</span>
          <a href={`tel:${COMPANY_LEGAL.phoneTel}`} className="font-extrabold text-rose-600 hover:underline">
            {value.trim()}
          </a>
        </div>
      );
    }

    // Auto-link emails
    if (label.toLowerCase().includes("email")) {
      return (
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="font-bold text-navy">{label}</span>
          <a href={`mailto:${COMPANY_LEGAL.email}`} className="font-semibold text-brand-green hover:underline">
            {value.trim()}
          </a>
        </div>
      );
    }

    return (
      <>
        <span className="font-bold text-navy">{label}</span>
        <span className="font-normal text-navy/80">{value}</span>
      </>
    );
  }
  return <span className="font-normal text-navy/80">{item}</span>;
}

export function PolicyContent({ sections }: { sections: PolicyBlock[] }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-navy/85">
      {sections.map((block, index) => {
        // Render Headings
        if (block.type === "heading") {
          const { num, title } = extractHeadingNumber(block.text);

          if (isContactHeading(block.text)) {
            return (
              <div key={index} className="mt-8 rounded-2xl bg-gradient-to-br from-[#FAF9F5] to-brand-green/5 border border-brand-green/30 p-5 sm:p-6 shadow-xs">
                <h2 className="text-base font-bold uppercase tracking-tight text-navy mb-4 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-brand-green" />
                  {block.text}
                </h2>
                <div className="space-y-2.5 text-xs sm:text-sm text-navy/80">
                  <p className="flex items-start gap-2.5">
                    <Building size={16} className="text-brand-green shrink-0 mt-0.5" />
                    <span><strong>Đơn vị:</strong> {COMPANY_LEGAL.legalName}</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-brand-green shrink-0 mt-0.5" />
                    <span><strong>Địa chỉ:</strong> {COMPANY_LEGAL.address}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone size={16} className="text-brand-green shrink-0" />
                    <span>
                      <strong>Hotline:</strong>{" "}
                      <a href={`tel:${COMPANY_LEGAL.phoneTel}`} className="font-extrabold text-rose-600 hover:underline">
                        {COMPANY_LEGAL.phone}
                      </a>
                    </span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail size={16} className="text-brand-green shrink-0" />
                    <span>
                      <strong>Email:</strong>{" "}
                      <a href={`mailto:${COMPANY_LEGAL.email}`} className="font-semibold text-brand-green hover:underline">
                        {COMPANY_LEGAL.email}
                      </a>
                    </span>
                  </p>
                </div>
              </div>
            );
          }

          if (num) {
            return (
              <div key={index} className="pt-6 first:pt-0 border-t border-gray-light/60 first:border-t-0">
                <h2 className="text-base sm:text-lg font-bold text-navy flex items-center gap-3">
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green font-black text-xs sm:text-sm shadow-2xs">
                    {num.padStart(2, "0")}
                  </span>
                  <span>{title}</span>
                </h2>
              </div>
            );
          }

          return (
            <h2 key={index} className="pt-4 text-base font-bold text-navy first:pt-0">
              {block.text}
            </h2>
          );
        }

        // Render Lists
        if (block.type === "list") {
          return (
            <div key={index} className="my-3 space-y-2 rounded-2xl bg-[#FAF9F5]/70 border border-gray-light/50 p-4">
              {block.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  {block.ordered ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-brand-green font-bold text-[10px] mt-0.5">
                      {itemIdx + 1}
                    </span>
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green mt-0.5">
                      <Check size={12} strokeWidth={2.6} />
                    </div>
                  )}
                  <div className="flex-1 leading-relaxed">
                    <ListItemText item={item} />
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // Render Paragraphs - Special highlight for important notes
        const text = block.text;
        const isImportant =
          text.includes("thuế giá trị gia tăng (VAT)") ||
          text.includes("hóa đơn điện tử") ||
          text.includes("ưu tiên áp dụng");

        if (isImportant) {
          return (
            <div key={index} className="flex items-start gap-3 rounded-2xl bg-brand-green/8 border border-brand-green/25 p-4 my-2">
              <FileCheck size={18} className="text-brand-green shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-semibold text-navy/95 leading-relaxed">
                {text}
              </p>
            </div>
          );
        }

        return (
          <p key={index} className="text-xs sm:text-sm font-normal leading-relaxed text-navy/85">
            {text}
          </p>
        );
      })}
    </div>
  );
}
