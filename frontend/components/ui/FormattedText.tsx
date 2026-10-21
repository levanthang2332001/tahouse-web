"use client";

import React from "react";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface FormattedTextProps {
  content?: string | null;
  className?: string;
}

/**
 * Renders both TipTap HTML output and plain Markdown formatted text with XSS protection.
 */
export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content || typeof content !== "string" || !content.trim()) {
    return null;
  }

  // Content pasted into the editor often stores every space as &nbsp;, which blocks line wrapping
  const normalized = content.replace(/&nbsp;|&#160;|&#xa0;| /gi, " ");

  // If content contains HTML tags (from TipTap WYSIWYG Editor)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(normalized);
  if (isHtml) {
    const cleanHtml = sanitizeHtml(normalized);
    return (
      <div
        className={`prose max-w-none break-words leading-relaxed text-navy/90 prose-headings:font-bold prose-headings:text-navy prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-lg sm:prose-h2:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-base sm:prose-h3:text-lg prose-h4:mt-4 prose-h4:mb-1.5 prose-h4:text-base prose-h4:font-semibold prose-p:my-2.5 prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1 [&_li::marker]:text-brand-green prose-strong:font-semibold prose-strong:text-navy prose-a:text-brand-green prose-a:underline-offset-2 prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-brand-green prose-blockquote:bg-brand-green/10 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-navy/90 prose-img:max-w-full prose-img:rounded-xl prose-pre:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  const hasCustomTextColor = Boolean(className && /(^|\s)text-/.test(className));
  const defaultTextColor = hasCustomTextColor ? "" : "text-navy/85";

  // Parse inline styles: bold, italic, underline, checkmarks for plain markdown
  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|<b>([^<]+)<\/b>|\*([^*]+)\*|<i>([^<]+)<\/i>|<u>([^<]+)<\/u>|`([^`]+)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[2] || match[3]) {
        parts.push(
          <strong key={match.index} className={`font-bold ${hasCustomTextColor ? "" : "text-navy"}`}>
            {match[2] || match[3]}
          </strong>,
        );
      } else if (match[4] || match[5]) {
        parts.push(
          <em key={match.index} className={`italic ${hasCustomTextColor ? "opacity-90" : "text-navy/90"}`}>
            {match[4] || match[5]}
          </em>,
        );
      } else if (match[6]) {
        parts.push(
          <span key={match.index} className="underline underline-offset-2">
            {match[6]}
          </span>,
        );
      } else if (match[7]) {
        parts.push(
          <span
            key={match.index}
            className="rounded bg-brand-green/10 text-brand-green border border-brand-green/20 px-1.5 py-0.5 text-xs font-mono font-bold"
          >
            {match[7]}
          </span>,
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Split into block paragraphs separated by double newlines
  const rawParagraphs = normalized.split(/\r?\n\r?\n/);

  return (
    <div className={`space-y-3.5 leading-relaxed break-words ${className}`}>
      {rawParagraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={pIdx}
              className="text-base sm:text-lg font-bold text-navy pt-2 pb-1 border-b border-gray-light/60 flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-brand-green inline-block" />
              {parseInline(trimmed.substring(4))}
            </h3>
          );
        }

        if (trimmed.startsWith("#### ")) {
          return (
            <h4
              key={pIdx}
              className="text-sm sm:text-base font-bold text-navy tracking-tight pt-1.5"
            >
              {parseInline(trimmed.substring(5))}
            </h4>
          );
        }

        if (trimmed.startsWith("> ")) {
          return (
            <div
              key={pIdx}
              className="p-3.5 rounded-2xl bg-brand-green/10 border-l-4 border-brand-green text-navy/90 my-2"
            >
              {parseInline(trimmed.substring(2))}
            </div>
          );
        }

        const lines = trimmed.split(/\r?\n/);
        const isList = lines.every(
          (l) =>
            l.trim().startsWith("•") ||
            l.trim().startsWith("- ") ||
            l.trim().startsWith("* ") ||
            l.trim().startsWith("✓") ||
            l.trim().startsWith("✔") ||
            /^\d+\.\s/.test(l.trim()),
        );

        if (isList) {
          return (
            <ul key={pIdx} className="space-y-2 my-2">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim();
                let bulletContent = cleanLine;
                let isCheck = false;

                if (cleanLine.startsWith("✓") || cleanLine.startsWith("✔")) {
                  bulletContent = cleanLine.substring(1).trim();
                  isCheck = true;
                } else if (cleanLine.startsWith("•") || cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
                  bulletContent = cleanLine.substring(1).trim();
                } else if (/^\d+\.\s/.test(cleanLine)) {
                  bulletContent = cleanLine.replace(/^\d+\.\s/, "").trim();
                }

                return (
                  <li key={lIdx} className={`flex items-start gap-2.5 ${defaultTextColor}`}>
                    <span
                      className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                        isCheck
                          ? "bg-brand-green text-navy font-black"
                          : "bg-brand-green/20 text-[#2d5a15]"
                      }`}
                    >
                      {isCheck ? "✓" : "•"}
                    </span>
                    <span className="flex-1 leading-relaxed">{parseInline(bulletContent)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className={`leading-relaxed ${defaultTextColor}`}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {parseInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
