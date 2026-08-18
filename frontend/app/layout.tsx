import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/components/ui/toast";
import SmoothScroll from "@/components/SmoothScroll";
import AgentationProvider from "@/components/AgentationProvider";

const sansFont = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
      className={`${sansFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
        suppressHydrationWarning
      >
        <AppProvider>
          <ToastProvider>
            <SmoothScroll />
            {children}
            <AgentationProvider />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
