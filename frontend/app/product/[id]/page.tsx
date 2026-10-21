import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPANY_LEGAL } from "@/data/company-legal";
import { formatProductName } from "@/lib/format-product-name";
import { getProductDetail } from "@/lib/server/product-detail";
import type { Product } from "@/lib/types/product";
import ProductDetailView from "./ProductDetailView";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Resolves the product on the server so the HTML carries its content for search engines and link previews.
 * `undefined` means the backend failed: the client view retries instead of showing a 404.
 */
async function loadProduct(id: string): Promise<Product | null | undefined> {
  try {
    return await getProductDetail(id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) return null;
    console.error("[product page] server fetch failed, falling back to client fetch", error);
    return undefined;
  }
}

function plainText(html?: string, maxLength = 160): string {
  const text = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;| /gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

function productImages(product: Product): string[] {
  return Array.from(new Set([product.imageUrl, ...(product.images ?? [])].filter(Boolean)));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) {
    return { title: `Sản phẩm | ${COMPANY_LEGAL.tradeName}` };
  }

  const name = formatProductName(product.name);
  const description =
    plainText(product.shortDescription || product.description || product.content) ||
    `${name} chính hãng ${product.brand}, khảo sát và lắp đặt tận nơi bởi ${COMPANY_LEGAL.tradeName}.`;
  const title = `${name}${product.brand ? ` ${product.brand}` : ""} chính hãng | ${COMPANY_LEGAL.tradeName}`;
  const url = `/product/${encodeURIComponent(id)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: COMPANY_LEGAL.tradeName,
      locale: "vi_VN",
      images: productImages(product).slice(0, 4),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (product === null) notFound();

  const jsonLd = product
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: formatProductName(product.name),
          sku: product.code,
          image: productImages(product),
          description: plainText(product.shortDescription || product.description || product.content, 500),
          ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
          ...(typeof product.price === "number" && product.price > 0
            ? {
                offers: {
                  "@type": "Offer",
                  url: `${COMPANY_LEGAL.website}/product/${encodeURIComponent(id)}`,
                  priceCurrency: "VND",
                  price: product.price,
                  seller: { "@type": "Organization", name: COMPANY_LEGAL.tradeName },
                },
              }
            : {}),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Trang chủ", item: COMPANY_LEGAL.website },
            { "@type": "ListItem", position: 2, name: "Sản phẩm", item: `${COMPANY_LEGAL.website}/products` },
            ...(product.categoryName
              ? [
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: product.categoryName,
                    item: `${COMPANY_LEGAL.website}/products?category=${encodeURIComponent(product.category)}`,
                  },
                ]
              : []),
            {
              "@type": "ListItem",
              position: product.categoryName ? 4 : 3,
              name: formatProductName(product.name),
            },
          ],
        },
      ]
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ProductDetailView key={id} id={id} initialProduct={product ?? null} />
    </>
  );
}
