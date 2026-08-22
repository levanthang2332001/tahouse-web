"use client";

import React from "react";

interface FormattedTextProps {
  content?: string | null;
  className?: string;
}

/**
 * Renders both TipTap HTML output and plain Markdown formatted text.
 */
export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content || typeof content !== "string" || !content.trim()) {
    return null;
  }

  // If content contains HTML tags (from TipTap WYSIWYG Editor)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className={`prose max-w-none prose-sm sm:prose-base prose-p:my-2.5 prose-headings:text-navy prose-h3:text-base sm:prose-h3:text-lg prose-h3:font-black prose-h3:mt-5 prose-h3:mb-2 prose-h4:text-sm sm:prose-h4:text-base prose-h4:font-bold prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-brand-green prose-blockquote:bg-brand-green/10 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-navy/90 prose-strong:text-navy prose-strong:font-bold leading-relaxed text-navy/90 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

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
          <strong key={match.index} className="font-bold text-navy">
            {match[2] || match[3]}
          </strong>,
        );
      } else if (match[4] || match[5]) {
        parts.push(
          <em key={match.index} className="italic text-navy/90">
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
  const rawParagraphs = content.split(/\r?\n\r?\n/);

  return (
    <div className={`space-y-3.5 leading-relaxed ${className}`}>
      {rawParagraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={pIdx}
              className="text-base sm:text-lg font-black text-navy tracking-tight pt-2 pb-1 border-b border-gray-light/60 flex items-center gap-2"
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
              className="p-3.5 rounded-2xl bg-brand-green/10 border-l-4 border-brand-green text-xs sm:text-sm text-navy/90 font-medium my-2"
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
                  <li key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-navy/85 font-medium">
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
          <p key={pIdx} className="text-xs sm:text-sm text-navy/85 leading-relaxed font-medium">
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
