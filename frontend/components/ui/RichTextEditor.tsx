"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Link as LinkIcon,
  ExternalLink,
  X,
  Check,
  Globe,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import with SSR disabled for Next.js App Router compatibility
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[220px] rounded-2xl border border-gray-light/80 bg-white p-6 flex flex-col items-center justify-center gap-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      <span className="text-xs text-navy/50 font-medium">Đang tải bộ soạn thảo văn bản...</span>
    </div>
  ),
});

interface QuillInstance {
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  getText: (index?: number, length?: number) => string;
  deleteText: (index: number, length: number) => void;
  insertText: (index: number, text: string, format?: string, value?: unknown) => void;
  formatText: (index: number, length: number, format: string, value: unknown) => void;
  setSelection: (index: number, length: number) => void;
  getLength: () => number;
  focus: () => void;
}

interface RichTextEditorProps {
  label?: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  required?: boolean;
}

export function RichTextEditor({
  label,
  description,
  placeholder = "",
  value,
  onChange,
  required = false,
}: RichTextEditorProps) {
  const activeQuillRef = useRef<QuillInstance | null>(null);
  // Custom Link Dialog State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [savedRange, setSavedRange] = useState<{ index: number; length: number } | null>(null);

  // Pre-configured full-featured WYSIWYG toolbar with custom link handler
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          [{ align: [] }],
          ["link", "clean"],
        ],
        handlers: {
          link: function () {
            const toolbarContext = this as unknown as { quill?: QuillInstance };
            const quill = toolbarContext.quill;
            if (!quill) return;
            activeQuillRef.current = quill;
            const range = quill.getSelection(true);
            if (range && range.length > 0) {
              const selectedText = quill.getText(range.index, range.length);
              setLinkText(selectedText);
              setSavedRange(range);
            } else {
              setLinkText("");
              setSavedRange(range || { index: quill.getLength() - 1, length: 0 });
            }

            setLinkUrl("");
            setLinkModalOpen(true);
          },
        },
      },
    }),
    [],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "blockquote",
    "code-block",
    "align",
    "link",
  ];

  // Save Link Handler
  const handleConfirmLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!linkUrl.trim()) {
      toast.error("Vui lòng nhập đường dẫn liên kết URL");
      return;
    }

    let cleanUrl = linkUrl.trim();
    // Auto prefix https:// if protocol is missing
    if (
      !cleanUrl.startsWith("http://") &&
      !cleanUrl.startsWith("https://") &&
      !cleanUrl.startsWith("/") &&
      !cleanUrl.startsWith("mailto:") &&
      !cleanUrl.startsWith("tel:")
    ) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const quill = activeQuillRef.current;
    if (quill) {
      quill.focus();

      if (savedRange && savedRange.length > 0) {
        const textToUse = linkText.trim() || quill.getText(savedRange.index, savedRange.length);
        if (textToUse !== quill.getText(savedRange.index, savedRange.length)) {
          quill.deleteText(savedRange.index, savedRange.length);
          quill.insertText(savedRange.index, textToUse, "link", cleanUrl);
          quill.setSelection(savedRange.index + textToUse.length, 0);
        } else {
          quill.formatText(savedRange.index, savedRange.length, "link", cleanUrl);
        }
      } else if (savedRange) {
        const textToInsert = linkText.trim() || cleanUrl;
        quill.insertText(savedRange.index, textToInsert, "link", cleanUrl);
        quill.setSelection(savedRange.index + textToInsert.length, 0);
      }
    }

    toast.success("Đã chèn liên kết thành công");
    setLinkModalOpen(false);
    setLinkText("");
    setLinkUrl("");
    setSavedRange(null);
  };

  const handleRemoveLink = () => {
    const quill = activeQuillRef.current;
    if (quill && savedRange) {
      quill.formatText(savedRange.index, savedRange.length || 1, "link", false);
      toast.info("Đã gỡ liên kết");
    }
    setLinkModalOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Header Label & Description */}
      {(label || description) && (
        <div className="flex items-center justify-between">
          <div>
            {label && (
              <label className="text-xs font-bold text-navy flex items-center gap-1">
                {label} {required && <span className="text-rose-600">*</span>}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-navy/50 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Full-featured Quill WYSIWYG Editor Container */}
      <div className="quill-editor-wrapper relative rounded-2xl border border-brand-green/30 bg-white shadow-xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={(content, delta, source, editor) => {
            const html = editor.getHTML();
            if (html === "<p><br></p>" || !editor.getText().trim()) {
              onChange("");
            } else {
              onChange(html);
            }
          }}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>

      {/* Custom Link Modal / Dialog */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-light space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-light/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-[#2d5a15]">
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-navy">Chèn / Sửa Đường Dẫn Liên Kết</h3>
                  <p className="text-[11px] text-navy/50">Tạo liên kết website cho văn bản</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="rounded-lg p-1.5 text-navy/40 hover:bg-gray-100 hover:text-navy transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="space-y-3.5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmLink();
                }
              }}
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Type size={13} className="text-brand-green" /> Văn bản hiển thị
                </label>
                <Input
                  type="text"
                  placeholder="VD: Xem thêm tại Facebook / Tên liên kết"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="text-xs font-semibold"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Globe size={13} className="text-brand-green" /> Đường dẫn liên kết (URL)
                </label>
                <Input
                  type="text"
                  placeholder="VD: facebook.com/tahouse hoặc https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
                <span className="text-[10.5px] text-navy/40">
                  Tự động thêm tiền tố <strong>https://</strong> nếu bạn chỉ gõ tên miền.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-light/60">
                {savedRange && savedRange.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Gỡ liên kết
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLinkModalOpen(false)}
                    className="text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    onClick={() => handleConfirmLink()}
                    className="text-xs font-bold gap-1.5"
                  >
                    <Check size={14} />
                    <span>Xác nhận chèn link</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
