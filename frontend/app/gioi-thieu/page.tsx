import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { ABOUT_PAGE } from "@/data/site-pages";

export const metadata: Metadata = {
  title: `${ABOUT_PAGE.title} | TA HOUSE`,
  description: ABOUT_PAGE.description,
};

export default function AboutPage() {
  return <InfoPageLayout page={ABOUT_PAGE} breadcrumbLabel="Giới thiệu" />;
}
