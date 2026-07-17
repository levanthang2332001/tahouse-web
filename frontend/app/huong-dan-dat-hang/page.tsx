import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { ORDER_GUIDE_PAGE } from "@/data/site-pages";

export const metadata: Metadata = {
  title: `${ORDER_GUIDE_PAGE.title} | TA HOUSE`,
  description: ORDER_GUIDE_PAGE.description,
};

export default function OrderGuidePage() {
  return (
    <InfoPageLayout page={ORDER_GUIDE_PAGE} breadcrumbLabel="Hướng dẫn đặt hàng" />
  );
}
