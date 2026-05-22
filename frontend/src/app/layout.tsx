import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import SmoothScroll from "@/components/SmoothScroll";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cursiveFont = Great_Vibes({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${sansFont.variable} ${serifFont.variable} ${cursiveFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppProvider>
          <SmoothScroll />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
