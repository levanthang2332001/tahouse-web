"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let toastEmitter: ((toast: Omit<ToastItem, "id">) => void) | null = null;

export const toast = {
  success: (message: string, title?: string) => {
    toastEmitter?.({ message, title, type: "success" });
  },
  error: (message: string, title?: string) => {
    toastEmitter?.({ message, title, type: "error" });
  },
  info: (message: string, title?: string) => {
    toastEmitter?.({ message, title, type: "info" });
  },
  warning: (message: string, title?: string) => {
    toastEmitter?.({ message, title, type: "warning" });
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: ToastItem = { ...item, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  React.useEffect(() => {
    toastEmitter = addToast;
    return () => {
      toastEmitter = null;
    };
  }, [addToast]);

  const success = React.useCallback(
    (message: string, title?: string) =>
      addToast({ message, title, type: "success" }),
    [addToast],
  );
  const error = React.useCallback(
    (message: string, title?: string) =>
      addToast({ message, title, type: "error" }),
    [addToast],
  );
  const info = React.useCallback(
    (message: string, title?: string) =>
      addToast({ message, title, type: "info" }),
    [addToast],
  );
  const warning = React.useCallback(
    (message: string, title?: string) =>
      addToast({ message, title, type: "warning" }),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-300",
              t.type === "success" &&
                "bg-white/95 border-brand-green/30 text-navy shadow-brand-green/10",
              t.type === "error" &&
                "bg-white/95 border-rose-500/30 text-navy shadow-rose-500/10",
              t.type === "warning" &&
                "bg-white/95 border-amber-500/30 text-navy shadow-amber-500/10",
              t.type === "info" &&
                "bg-white/95 border-blue-500/30 text-navy shadow-blue-500/10",
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && (
                <CheckCircle2 size={18} className="text-brand-green" />
              )}
              {t.type === "error" && (
                <AlertCircle size={18} className="text-rose-600" />
              )}
              {t.type === "warning" && (
                <AlertCircle size={18} className="text-amber-500" />
              )}
              {t.type === "info" && <Info size={18} className="text-blue-600" />}
            </div>
            <div className="flex-1 text-xs">
              {t.title && <div className="font-bold text-navy mb-0.5">{t.title}</div>}
              <div className="text-navy/80 leading-relaxed font-medium">
                {t.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-lg p-1 text-navy/40 hover:bg-black/5 hover:text-navy transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
