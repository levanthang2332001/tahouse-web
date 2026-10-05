import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyPageLayout from "@/components/PolicyPageLayout";
import { POLICY_BY_SLUG, POLICY_DOCUMENTS } from "@/data/policies";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return POLICY_DOCUMENTS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICY_BY_SLUG[slug];
  if (!policy) return { title: "Không tìm thấy | TA HOUSE" };

  return {
    title: `${policy.title} | TA HOUSE`,
    description: policy.description,
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = POLICY_BY_SLUG[slug];
  if (!policy) notFound();

  return <PolicyPageLayout policy={policy} />;
}
