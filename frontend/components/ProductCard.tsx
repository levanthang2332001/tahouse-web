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
        <div className="absolute left-3 top-3 flex h-6 items-center justify-center rounded-full bg-rose-600/95 px-2.5 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
          <span className="text-[10px] font-black tracking-wider text-cream leading-none">
            -{Math.round(((Math.round((product.price * 1.18) / 100000) * 100000 - product.price) / (Math.round((product.price * 1.18) / 100000) * 100000)) * 100)}%
          </span>
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-6 text-center">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-green/80">
          {getCategoryLabel(product.category)}
        </span>
        <Link href={`/product/${product.id}`} className="flex-grow flex justify-center">
          <h3 className="mb-1.5 min-h-[3.5rem] font-serif text-lg font-bold leading-tight text-navy transition-colors group-hover:text-brand-green text-center">
            {product.name}
          </h3>
        </Link>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          MD: {product.code}
        </p>
        <div className="mt-auto flex flex-col items-center justify-center border-t border-gray-light pt-4 w-full">
          <span className="text-[11px] font-medium text-zinc-400 line-through">
            {formatCurrency(Math.round((product.price * 1.18) / 100000) * 100000)}
          </span>
          <span className="text-sm font-black text-rose-600 mt-0.5">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
