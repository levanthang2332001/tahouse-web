"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KeyValueEditorProps {
  label: string;
  specs: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
  description?: string;
}

const COMMON_SPEC_KEYS = [
  "Xuất xứ",
  "Kích thước",
  "Chất liệu",
  "Công suất",
  "Nguồn điện",
  "Bảo hành",
  "Màu sắc",
  "Phương thức mở",
  "Dung lượng pin",
  "Đố cửa",
  "Độ dày cửa",
  "Độ ồn",
  "Dung tích",
  "Trọng lượng",
];

function SpecRow({
  specKey,
  specValue,
  onUpdateKey,
  onUpdateValue,
  onRemove,
}: {
  specKey: string;
  specValue: string;
  onUpdateKey: (oldKey: string, nextKey: string) => void;
  onUpdateValue: (key: string, val: string) => void;
  onRemove: (key: string) => void;
}) {
  const [keyInput, setKeyInput] = useState(specKey);

  useEffect(() => {
    setKeyInput(specKey);
  }, [specKey]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl bg-white border border-gray-light/60 p-2 text-xs">
      <div className="sm:col-span-4">
        <Input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onBlur={() => {
            if (keyInput.trim() && keyInput !== specKey) {
              onUpdateKey(specKey, keyInput.trim());
            }
          }}
          placeholder="Tên thông số"
          className="h-8 text-xs font-bold text-navy"
        />
      </div>
      <div className="sm:col-span-7">
        <Input
          type="text"
          value={specValue}
          onChange={(e) => onUpdateValue(specKey, e.target.value)}
          placeholder="Nhập giá trị thông số..."
          className="h-8 text-xs"
        />
      </div>
      <div className="sm:col-span-1 text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(specKey)}
          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          title="Xóa thông số"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}

export function KeyValueEditor({
  label,
  specs = {},
  onChange,
  description,
}: KeyValueEditorProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (!newKey.trim()) return;
    onChange({
      ...specs,
      [newKey.trim()]: newValue.trim(),
    });
    setNewKey("");
    setNewValue("");
  };

  const handleAddSuggestedKey = (key: string) => {
    if (specs[key] !== undefined) return;
    onChange({
      ...specs,
      [key]: "",
    });
  };

  const handleRemove = (keyToRemove: string) => {
    const next = { ...specs };
    delete next[keyToRemove];
    onChange(next);
  };

  const handleUpdateValue = (key: string, val: string) => {
    onChange({
      ...specs,
      [key]: val,
    });
  };

  const handleUpdateKey = (oldKey: string, nextKey: string) => {
    if (!nextKey.trim() || oldKey === nextKey) return;
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(specs)) {
      if (k === oldKey) {
        next[nextKey.trim()] = v;
      } else {
        next[k] = v;
      }
    }
    onChange(next);
  };

  const entries = Object.entries(specs);

  return (
    <div className="space-y-3">
      <div className="flex flex-col">
        <label className="text-xs font-bold text-navy">{label}</label>
        {description && (
          <span className="text-[11px] text-navy/50">{description}</span>
        )}
      </div>

      {/* Suggested quick chips */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-navy/50 flex items-center gap-1">
          <Sparkles size={12} className="text-brand-green" /> Thêm nhanh thông số phổ biến:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SPEC_KEYS.map((k) => {
            const isAdded = specs[k] !== undefined;
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleAddSuggestedKey(k)}
                disabled={isAdded}
                className={`text-[10.5px] font-medium rounded-lg px-2 py-0.5 border transition-all cursor-pointer ${
                  isAdded
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-[#FAF9F5] text-navy/70 border-gray-light/70 hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/40"
                }`}
              >
                + {k}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add custom Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
        <div className="sm:col-span-4">
          <Input
            type="text"
            placeholder="Tên thông số (VD: Kích thước)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="text-xs h-10"
          />
        </div>
        <div className="sm:col-span-6">
          <Input
            type="text"
            placeholder="Giá trị (VD: 380 x 75 x 25 mm)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="text-xs h-10"
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="w-full text-xs font-bold h-10"
          >
            <Plus size={14} />
            <span>Thêm</span>
          </Button>
        </div>
      </div>

      {/* Existing Specs List */}
      {entries.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-gray-light/70 bg-[#FAF9F5]/60 p-3">
          <div className="text-[11px] font-bold text-navy/60 uppercase tracking-wider mb-2">
            Danh sách thông số đã cấu hình ({entries.length})
          </div>
          <div className="space-y-1.5">
            {entries.map(([key, val]) => (
              <SpecRow
                key={key}
                specKey={key}
                specValue={val}
                onUpdateKey={handleUpdateKey}
                onUpdateValue={handleUpdateValue}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
