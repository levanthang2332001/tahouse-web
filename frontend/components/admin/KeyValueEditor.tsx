"use client";

import React, { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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

// Borderless cells inside one table; the row divider does the separating
const CELL_INPUT =
  "h-9 w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2.5 text-sm text-navy placeholder:text-navy/40 hover:border-gray-light focus:border-brand-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20";

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

  // Sync state if specKey changes without remount
  const [prevSpecKey, setPrevSpecKey] = useState(specKey);
  if (specKey !== prevSpecKey) {
    setPrevSpecKey(specKey);
    setKeyInput(specKey);
  }

  const commitKey = () => {
    if (keyInput.trim() && keyInput !== specKey) onUpdateKey(specKey, keyInput.trim());
    else setKeyInput(specKey);
  };

  return (
    <div className="group grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-1 px-1.5 py-1">
      <input
        type="text"
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        onBlur={commitKey}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitKey();
          }
        }}
        placeholder="Tên thông số"
        aria-label="Tên thông số"
        className={`${CELL_INPUT} font-semibold`}
      />
      <input
        type="text"
        value={specValue}
        onChange={(e) => onUpdateValue(specKey, e.target.value)}
        placeholder="Giá trị"
        aria-label={`Giá trị ${specKey}`}
        className={CELL_INPUT}
      />
      <button
        type="button"
        onClick={() => onRemove(specKey)}
        title="Xóa thông số"
        aria-label={`Xóa ${specKey}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy/40 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function KeyValueEditor({ label, specs = {}, onChange, description }: KeyValueEditorProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const newKeyRef = useRef<HTMLInputElement>(null);
  const newValueRef = useRef<HTMLInputElement>(null);

  const entries = Object.entries(specs);
  const suggestions = COMMON_SPEC_KEYS.filter((k) => specs[k] === undefined);

  const handleAdd = () => {
    const key = newKey.trim();
    if (!key) return;
    onChange({ ...specs, [key]: newValue.trim() });
    setNewKey("");
    setNewValue("");
    newKeyRef.current?.focus();
  };

  // A suggestion fills the new-row name and jumps to its value, so the admin only types the value
  const handlePickSuggestion = (key: string) => {
    setNewKey(key);
    newValueRef.current?.focus();
  };

  const handleRemove = (keyToRemove: string) => {
    const next = { ...specs };
    delete next[keyToRemove];
    onChange(next);
  };

  const handleUpdateValue = (key: string, val: string) => onChange({ ...specs, [key]: val });

  const handleUpdateKey = (oldKey: string, nextKey: string) => {
    if (!nextKey.trim() || oldKey === nextKey) return;
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(specs)) next[k === oldKey ? nextKey.trim() : k] = v;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-bold text-navy">
          {label} <span className="font-normal text-navy/50">({entries.length})</span>
        </label>
        {description && <span className="hidden truncate text-xs text-navy/50 sm:block">{description}</span>}
      </div>

      <div className="divide-y divide-gray-light/60 overflow-hidden rounded-xl border border-gray-light/80 bg-white">
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

        {/* Always-present empty row: type a name and value, press Enter */}
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-1 bg-[#FAF9F5] px-1.5 py-1">
          <input
            ref={newKeyRef}
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newKey.trim()) newValueRef.current?.focus();
              }
            }}
            placeholder="Thêm thông số..."
            aria-label="Tên thông số mới"
            className={`${CELL_INPUT} font-semibold`}
          />
          <input
            ref={newValueRef}
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Giá trị, Enter để thêm"
            aria-label="Giá trị thông số mới"
            className={CELL_INPUT}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newKey.trim()}
            title="Thêm thông số"
            aria-label="Thêm thông số"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3f741b] transition-colors hover:bg-brand-green/15 disabled:cursor-not-allowed disabled:text-navy/25 disabled:hover:bg-transparent cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-navy/50">Gợi ý:</span>
          {suggestions.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handlePickSuggestion(k)}
              className="rounded-md border border-gray-light/80 bg-white px-2 py-0.5 text-xs text-navy/70 transition-colors hover:border-brand-green/50 hover:bg-brand-green/10 hover:text-[#3f741b] cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
