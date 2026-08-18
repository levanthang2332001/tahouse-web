"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin@tahouse.vn");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Đăng nhập thất bại");
        return;
      }

      login(data.user);
      toast.success("Đăng nhập quản trị thành công!");
      router.push("/admin/products");
    } catch {
      toast.error("Không thể kết nối máy chủ, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1EA] p-4 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-green/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-navy/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white border border-gray-light/80 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative">
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-navy text-white mb-4 shadow-md shadow-navy/20">
              <span className="font-extrabold text-2xl tracking-tighter text-brand-green">TA</span>
            </div>
            <h1 className="text-2xl font-black text-navy tracking-tight">
              Quản Trị TA HOUSE
            </h1>
            <p className="text-xs text-navy/60 mt-1.5 font-medium">
              Đăng nhập để quản lý danh mục & thông tin sản phẩm
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Mail size={14} className="text-brand-green" /> Tài khoản / Email
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="admin@tahouse.vn hoặc admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-3.5"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Lock size={14} className="text-brand-green" /> Mật khẩu
                </label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full mt-2 font-bold text-sm h-11"
              disabled={loading}
            >
              {loading ? (
                <span>Đang xử lý đăng nhập...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Đăng nhập hệ thống <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Demo account hint */}
          <div className="mt-6 p-3.5 rounded-2xl bg-[#FAF9F5] border border-gray-light/60 text-xs text-navy/70 space-y-1">
            <div className="font-bold text-navy flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles size={13} className="text-brand-green" /> Tài khoản mặc định:
            </div>
            <div className="flex justify-between font-mono text-[11.5px] pt-1">
              <span>Tài khoản: <strong className="text-navy">admin@tahouse.vn</strong></span>
              <span>Mật khẩu: <strong className="text-navy">admin123</strong></span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-navy/60 hover:text-brand-green transition-colors inline-flex items-center gap-1"
            >
              ← Quay lại trang chủ website
            </Link>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-navy/50">
          <ShieldCheck size={14} className="text-brand-green" />
          <span>Bảo mật dữ liệu quản trị TA HOUSE</span>
        </div>
      </div>
    </div>
  );
}
