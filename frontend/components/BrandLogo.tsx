"use client";

import type { Brand } from "@/lib/types/product";

export default function BrandLogo({ brand }: { brand: Brand }) {
  if (brand.logoHtml) {
    return <span dangerouslySetInnerHTML={{ __html: brand.logoHtml }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={brand.logo} alt={brand.name} className="h-4 w-auto object-contain" />
  );
}
