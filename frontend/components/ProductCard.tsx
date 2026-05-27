"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Product, formatCurrency } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "dai-sanh":
        return "Khóa đại sảnh";
      case "cua-go":
        return "Khóa cửa gỗ";
      case "cua-kinh":
        return "Khóa cửa kính";
      case "xingfa-sat":
        return "Khóa nhôm, cửa sắt";
      case "cua-cong":
        return "Khóa cửa cổng";
      case "khach-san":
        return "Khóa khách sạn";
      case "lock-parent":
        return "Khóa thông minh";
      case "Lock":
        return "Khóa thông minh";
      case "Kitchen":
        return "Thiết bị bếp";
      case "Water":
        return "Lọc nước";
      case "Cabinet":
        return "Phụ kiện tủ bếp";
      case "Smart":
        return "Thiết bị thông minh";
      default:
        return "Phụ kiện";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-light bg-cream shadow-sm transition-all duration-500 hover:border-brand-green/40"
    >
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-neutral">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute left-4 top-4 rounded-full border border-gray-light bg-cream/90 px-3.5 py-1 shadow-sm backdrop-blur-md">
          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-green">
            {getCategoryLabel(product.category)}
          </span>
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-6">
        <Link href={`/product/${product.id}`} className="flex-grow">
          <h3 className="mb-1.5 min-h-[3.5rem] font-serif text-lg font-bold leading-tight text-navy transition-colors group-hover:text-brand-green">
            {product.name}
          </h3>
        </Link>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          MD: {product.code}
        </p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {product.technologies.slice(0, 2).map((tech) => (
            <span key={tech} className="rounded-md border border-gray-light bg-neutral px-2.5 py-1 text-[9px] font-medium text-navy/70">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-gray-light pt-4">
          <span className="text-sm font-black text-brand-green">{formatCurrency(product.price)}</span>
          <Link
            href={`/product/${product.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral text-navy transition-all hover:bg-brand-green hover:text-white"
          >
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
