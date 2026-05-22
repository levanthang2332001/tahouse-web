"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Product, formatCurrency } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
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
      className="group bg-warm-cream dark:bg-graphite border border-graphite/5 dark:border-warm-light/5 rounded-2xl overflow-hidden hover:border-lime/40 dark:hover:border-lime/40 transition-all duration-500 shadow-sm flex flex-col h-full"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-warm-cream/40 dark:bg-graphite-dark shrink-0">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-warm-light/90 dark:bg-graphite-dark/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-graphite/5 dark:border-warm-light/5 shadow-sm">
          <span className="text-[9px] font-bold text-lime uppercase tracking-widest">
            {getCategoryLabel(product.category)}
          </span>
        </div>
        {product.price > 20000000 && (
          <div className="absolute top-4 right-4 bg-terracotta text-white text-[8px] uppercase tracking-wider px-2 py-1 rounded font-bold">
            Luxury Choice
          </div>
        )}
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`} className="flex-grow">
          <h3 className="font-serif text-lg font-bold text-graphite dark:text-warm-light mb-1.5 group-hover:text-lime transition-colors leading-tight min-h-[3.5rem]">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
          MD: {product.code}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.technologies.slice(0, 2).map((tech) => (
            <span key={tech} className="text-[9px] bg-graphite/5 dark:bg-warm-light/5 border border-graphite/5 dark:border-warm-light/5 px-2.5 py-1 rounded-md text-graphite-light dark:text-warm-dark font-medium">
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-graphite/5 dark:border-warm-light/5 mt-auto">
          <span className="text-lime font-black text-sm">
            {formatCurrency(product.price)}
          </span>
          <Link 
            href={`/product/${product.id}`}
            className="w-9 h-9 bg-graphite/5 dark:bg-warm-light/5 text-graphite dark:text-warm-light rounded-full hover:bg-lime hover:text-white dark:hover:text-white flex items-center justify-center transition-all"
          >
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
