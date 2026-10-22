import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/components/ui/toast";
import SmoothScroll from "@/components/SmoothScroll";
import AgentationProvider from "@/components/AgentationProvider";
import { COMPANY_LEGAL } from "@/data/company-legal";
import { StoreInfoProvider } from "@/context/StoreInfoContext";
import { getStoreInfo } from "@/lib/server/store-info";

const sansFont = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_LEGAL.website),
  title: "TA HOUSE | Giải pháp khóa thông minh và nội thất cao cấp",
  description:
    "Giải pháp khóa thông minh, phụ kiện cửa và thiết bị nội thất cho không gian sống hiện đại.",
};

// Store contact details come from the settings API; refresh prerendered pages at most once a minute
export const revalidate = 60;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeInfo = await getStoreInfo();
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
        <StoreInfoProvider value={storeInfo}>
          <AppProvider>
            <ToastProvider>
              <SmoothScroll />
              {children}
              <AgentationProvider />
            </ToastProvider>
          </AppProvider>
        </StoreInfoProvider>
      </body>
    </html>
  );
}
