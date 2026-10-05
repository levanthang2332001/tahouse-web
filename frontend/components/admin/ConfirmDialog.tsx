"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Xác nhận xóa",
  cancelText = "Hủy bỏ",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-start gap-4 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200">
          <AlertTriangle size={20} />
        </div>
        <DialogHeader className="mb-0">
          <DialogTitle className="text-base text-navy">{title}</DialogTitle>
          <DialogDescription className="text-xs text-navy/70 mt-1.5 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="text-xs"
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          className="text-xs font-bold"
        >
          {loading ? "Đang xử lý..." : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
