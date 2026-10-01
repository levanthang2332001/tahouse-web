"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-navy text-white",
    secondary: "bg-[#FAF9F5] text-navy border border-gray-light",
    destructive: "bg-rose-600 text-white",
    outline: "text-navy border border-gray-light",
    success: "bg-brand-green/15 text-[#437920] border border-brand-green/30",
    warning: "bg-amber-500/15 text-amber-800 border border-amber-500/30",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors",
        variantStyles,
        className,
      )}
      {...props}
    />
  );
}
