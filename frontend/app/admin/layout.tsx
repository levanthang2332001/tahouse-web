"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

function AdminLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [loading, user, pathname, router]);

  // If on login page, render directly without admin sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          <span className="text-xs font-bold text-navy/70 uppercase tracking-wider">
            {loading ? "Đang xác thực phiên quản trị..." : "Đang chuyển hướng tới trang đăng nhập..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-navy">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onToggleMobileSidebar={() => setMobileOpen(true)}
          title="Hệ Thống Quản Trị TA HOUSE"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutGuard>{children}</AdminLayoutGuard>
    </AdminAuthProvider>
  );
}
