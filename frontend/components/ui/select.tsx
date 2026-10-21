"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
}

// Custom chevron so it sits inset like the text padding instead of hugging the native edge
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23062B3D' stroke-opacity='0.6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, style, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-xl border border-gray-light bg-white py-2 pl-3.5 pr-10 text-sm text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:border-brand-green disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className,
        )}
        style={{
          backgroundImage: CHEVRON,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.875rem center",
          backgroundSize: "16px 16px",
          ...style,
        }}
        ref={ref}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    );
  },
);
Select.displayName = "Select";
