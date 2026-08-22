"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Bold,
  ClipboardList,
  Sparkles,
  Check,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DynamicListInputProps {
  label: string;
  placeholder?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addButtonText?: string;
  description?: string;
  multiline?: boolean;
}

export function DynamicListInput({
  label,
  placeholder = "Nhập nội dung và nhấn Thêm...",
  items = [],
  onChange,
  addButtonText = "Thêm",
  description,
}: DynamicListInputProps) {
  const [newItem, setNewItem] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const next = [...items];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      onChange(next);
    } else if (direction === "down" && index < items.length - 1) {
      const next = [...items];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      onChange(next);
    }
  };

  const handleApplyBulk = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .map((l) => l.replace(/^[•\-*✓✔\d+.]\s*/, "")) // remove leading bullets like -, *, 1.
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      onChange([...items, ...lines]);
      setBulkText("");
      setBulkMode(false);
    }
  };

  const handleWrapBold = (index: number) => {
    const current = items[index] || "";
    if (current.startsWith("**") && current.endsWith("**")) {
      handleUpdate(index, current.slice(2, -2));
    } else {
      handleUpdate(index, `**${current}**`);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-navy flex items-center gap-1.5">
            {label}
            <span className="text-[10px] font-normal text-navy/40">({items.length} mục)</span>
          </label>
          {description && (
            <span className="text-[11px] text-navy/50">{description}</span>
          )}
        </div>

        {/* Bulk Paste Toggle */}
        <button
          type="button"
          onClick={() => setBulkMode(!bulkMode)}
          className="text-[11px] font-bold text-brand-green hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <ClipboardList size={12} />
          <span>{bulkMode ? "Đóng dán nhanh" : "Dán nhiều dòng"}</span>
        </button>
      </div>

      {/* Bulk Paste Box */}
      {bulkMode && (
        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-brand-green/30 space-y-2.5 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-navy">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-green" /> Dán danh sách nhiều dòng:
            </span>
            <span className="text-[10.5px] text-navy/40 font-normal">Mỗi dòng sẽ là 1 mục</span>
          </div>
          <Textarea
            placeholder="Dán các gạch đầu dòng vào đây...&#10;• Nhận diện Face ID 3D siêu nhạy&#10;• Thân khóa hợp kim đúc nguyên khối&#10;• Kết nối app Wifi thoại đàm"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="min-h-[100px] text-xs bg-white"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkText("");
                setBulkMode(false);
              }}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleApplyBulk}
              className="text-xs font-bold gap-1"
            >
              <Check size={13} />
              <span>Thêm vào danh sách</span>
            </Button>
          </div>
        </div>
      )}

      {/* Single Input row */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="text-xs font-bold shrink-0 h-10 px-4"
        >
          <Plus size={14} />
          <span>{addButtonText}</span>
        </Button>
      </div>

      {/* List of current items */}
      {items.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-xl bg-[#FAF9F5] border border-gray-light/60 p-1.5 text-xs group hover:border-gray-300 transition-colors"
            >
              <span className="h-5 w-5 rounded-md bg-white border border-gray-light/60 flex items-center justify-center text-[10px] font-bold text-navy/60 shrink-0">
                {idx + 1}
              </span>

              <Input
                type="text"
                value={item}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                className="h-8 text-xs bg-white flex-1 font-medium"
              />

              {/* Bold Wrapper Button */}
              <button
                type="button"
                onClick={() => handleWrapBold(idx)}
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  item.startsWith("**") && item.endsWith("**")
                    ? "bg-brand-green text-navy font-black shadow-xs"
                    : "bg-white text-navy/60 hover:text-navy border border-gray-200"
                }`}
                title="Tô đậm (Bold) toàn bộ mục này"
              >
                <Bold size={12} />
              </button>

              {/* Move Up/Down Buttons */}
              <button
                type="button"
                onClick={() => handleMove(idx, "up")}
                disabled={idx === 0}
                className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-navy/50 hover:text-navy disabled:opacity-30 cursor-pointer"
                title="Di chuyển lên"
              >
                <ArrowUp size={12} />
              </button>

              <button
                type="button"
                onClick={() => handleMove(idx, "down")}
                disabled={idx === items.length - 1}
                className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-navy/50 hover:text-navy disabled:opacity-30 cursor-pointer"
                title="Di chuyển xuống"
              >
                <ArrowDown size={12} />
              </button>

              {/* Delete Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(idx)}
                className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0 cursor-pointer"
                title="Xóa mục này"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
