"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "brand";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-navy text-white hover:bg-navy/90 shadow-sm",
      brand:
        "bg-brand-green text-white hover:bg-[#68a83a] shadow-sm shadow-brand-green/20",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20",
      outline:
        "border border-gray-light bg-white text-navy hover:bg-[#FAF9F5] hover:border-navy/30",
      secondary:
        "bg-[#FAF9F5] text-navy hover:bg-[#F0EEE6] border border-gray-light/60",
      ghost: "hover:bg-black/5 text-navy",
      link: "text-brand-green underline-offset-4 hover:underline",
    }[variant];

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-xl px-8 text-base",
      icon: "h-9 w-9 p-0",
    }[size];

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
          variantStyles,
          sizeStyles,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
