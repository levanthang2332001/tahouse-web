import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import content from "@/data/content.json";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-neutral text-navy">
      <Header />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pb-24 pt-40 text-center">
        <h1 className="mb-4 text-2xl font-bold">{content.detail.notFound.title}</h1>
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[#3f741b] hover:underline"
        >
          {content.detail.notFound.backLink}
        </Link>
      </div>
      <Footer />
    </div>
  );
}
