"use client";

import React, { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <label className="text-xs font-bold text-navy">{label}</label>
        {description && (
          <span className="text-[11px] text-navy/50">{description}</span>
        )}
      </div>

      {/* Input row */}
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
              className="flex items-center gap-2 rounded-xl bg-[#FAF9F5] border border-gray-light/60 p-1.5 text-xs group"
            >
              <span className="h-5 w-5 rounded-md bg-white border border-gray-light/60 flex items-center justify-center text-[10px] font-bold text-navy/60 shrink-0">
                {idx + 1}
              </span>
              <Input
                type="text"
                value={item}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                className="h-8 text-xs bg-white flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(idx)}
                className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0"
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
