"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-xl border border-gray-light bg-white px-3.5 py-2 text-sm text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:border-brand-green disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className,
        )}
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
