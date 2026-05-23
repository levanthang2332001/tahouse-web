import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
  Great_Vibes,
} from "next/font/google";
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
  title: "TA HOUSE | Giải pháp khóa thông minh và nội thất cao cấp",
  description:
    "Giải pháp khóa thông minh, phụ kiện cửa và thiết bị nội thất cho không gian sống hiện đại.",
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
      <body
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
        suppressHydrationWarning
      >
        <AppProvider>
          <SmoothScroll />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
