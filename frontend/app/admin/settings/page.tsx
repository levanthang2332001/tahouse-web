"use client";

import React, { useState } from "react";
import {
  User,
  Key,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { user, login, logout } = useAdminAuth();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [prevUserId, setPrevUserId] = useState(user?.id);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Security Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // System Ping State
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setFullName(user.name || "");
    setEmail(user.email || "");
    setAvatarUrl(user.avatarUrl || "");
  }

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "avatars");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Tải ảnh avatar thất bại");
      }

      const uploadedUrl = data.data?.url;
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        toast.success("Tải ảnh đại diện lên Cloudflare R2 thành công!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Không thể cập nhật hồ sơ");
      }

      if (data.user) {
        login(data.user);
      }

      toast.success("Cập nhật thông tin quản trị viên thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi cập nhật hồ sơ");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu mới không trùng khớp");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }

      toast.success("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (
      !confirm(
        "Bạn có chắc muốn đăng xuất khỏi TẤT CẢ các thiết bị? Mọi phiên làm việc khác sẽ bị thu hồi.",
      )
    ) {
      return;
    }

    try {
      await fetch("/api/auth/logout-all", { method: "POST" });
      toast.success("Đã đăng xuất khỏi tất cả thiết bị thành công");
      logout();
    } catch {
      toast.error("Không thể hoàn tất đăng xuất toàn bộ");
    }
  };

  const testBackendConnection = async () => {
    setPingStatus("testing");
    const start = Date.now();
    try {
      const res = await fetch("/api/brands", { cache: "no-store" });
      const latency = Date.now() - start;
      if (res.ok) {
        setPingLatency(latency);
        setPingStatus("ok");
        toast.success(`Kết nối Backend thành công! Độ trễ: ${latency}ms`);
      } else {
        setPingStatus("error");
        toast.error("Không thể kết nối đến máy chủ Backend");
      }
    } catch {
      setPingStatus("error");
      toast.error("Lỗi mạng khi kiểm tra kết nối Backend");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
            Cài đặt & Tài khoản Quản trị
          </h1>
          <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 font-bold">
            {user?.role || "superadmin"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-navy/60 mt-1">
          Quản lý hồ sơ cá nhân, đổi mật khẩu bảo mật và kiểm tra kết nối hệ thống Backend
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-white border border-gray-light/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-light/60">
            <div className="h-10 w-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-navy">Thông tin tài khoản</h2>
              <p className="text-xs text-navy/50">Họ tên hiển thị và email liên kết</p>
            </div>
          </div>

          {/* Avatar Area */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-2xl bg-[#FAF9F5] border border-gray-light overflow-hidden flex items-center justify-center shadow-xs">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-black text-brand-green">
                  {fullName.charAt(0) || "A"}
                </span>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              )}
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-light bg-[#FAF9F5] hover:bg-white text-xs font-bold text-navy shadow-2xs transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      handleAvatarUpload(f);
                      e.target.value = "";
                    }
                  }}
                />
                <Camera size={13} className="text-brand-green" />
                <span>Đổi ảnh đại diện R2</span>
              </label>
              <p className="text-[10px] text-navy/40 mt-1">Ảnh PNG, JPG tối đa 5MB</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy">Tên tài khoản (Username)</label>
              <Input
                type="text"
                value={user?.username || "admin"}
                disabled
                className="text-xs bg-slate-50 cursor-not-allowed font-mono text-navy/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy">Họ và tên hiển thị</label>
              <Input
                type="text"
                placeholder="VD: Quản Trị Viên TA House"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy">Email liên hệ</label>
              <Input
                type="email"
                placeholder="admin@tahouse.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs font-medium"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="brand"
                size="sm"
                disabled={savingProfile}
                className="text-xs font-bold gap-1.5 w-full sm:w-auto"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thông tin hồ sơ</span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="rounded-3xl bg-white border border-gray-light/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-light/60">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-navy">Bảo mật & Đổi mật khẩu</h2>
              <p className="text-xs text-navy/50">Cập nhật mật khẩu tài khoản quản trị</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy">Mật khẩu hiện tại</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy">Xác nhận mật khẩu mới</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="brand"
                size="sm"
                disabled={changingPassword}
                className="text-xs font-bold gap-1.5 w-full sm:w-auto"
              >
                {changingPassword ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <span>Cập nhật mật khẩu mới</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Backend & Sessions Management Card */}
      <div className="rounded-3xl bg-white border border-gray-light/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-light/60">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Server size={20} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-navy">Hệ thống Backend & Phiên đăng nhập</h2>
            <p className="text-xs text-navy/50">Trạng thái kết nối máy chủ REST API và quản lý phiên</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Health check */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-light/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy">Kết nối Backend API:</span>
              {pingStatus === "ok" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-green">
                  <CheckCircle2 size={13} /> {pingLatency}ms (Online)
                </span>
              ) : pingStatus === "error" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600">
                  <AlertCircle size={13} /> Lỗi kết nối
                </span>
              ) : (
                <span className="text-[11px] text-navy/50">Chưa kiểm tra</span>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testBackendConnection}
              disabled={pingStatus === "testing"}
              className="text-xs font-semibold gap-1.5 w-full bg-white h-8"
            >
              <RefreshCw size={13} className={pingStatus === "testing" ? "animate-spin" : ""} />
              <span>Kiểm tra độ trễ máy chủ</span>
            </Button>
          </div>

          {/* Session Revoke */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-light/80 space-y-3">
            <div>
              <span className="text-xs font-bold text-navy block">Phiên đăng nhập đa thiết bị:</span>
              <span className="text-[11px] text-navy/50">
                Thu hồi toàn bộ Refresh Token trên các trình duyệt và thiết bị khác.
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogoutAll}
              className="text-xs font-bold gap-1.5 w-full bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-8"
            >
              <LogOut size={13} />
              <span>Đăng xuất tất cả thiết bị</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
