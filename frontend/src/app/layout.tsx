import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kassler Smart Lock | Khóa Cửa Thông Minh Đức Nhập Khẩu Chính Hãng",
  description: "Thương hiệu khóa cửa thông minh Kassler hàng đầu châu Âu. Chuyên phân phối khóa vân tay đại sảnh, khóa cửa gỗ, khóa cửa nhôm Xingfa cao cấp, két sắt thông minh. An toàn - Sang trọng - Công nghệ AI đột phá.",
  keywords: "khóa thông minh, khóa cửa vân tay, khóa đại sảnh, khóa cửa gỗ, khóa cửa nhôm, két sắt thông minh, kassler",
  openGraph: {
    title: "Kassler Smart Lock | Khóa Cửa Thông Minh Đức Chính Hãng",
    description: "Khám phá các dòng khóa cửa thông minh cao cấp chính hãng từ Kassler Đức. Tích hợp Face ID 3D, vân tay bán dẫn FPC, bảo mật tuyệt đối.",
    type: "website",
    locale: "vi_VN",
    url: "https://kassler-vietnam.vn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })()`
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
