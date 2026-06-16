import { Flame, LayoutGrid, Lock, Shield, ShieldCheck, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Category / Service cards (home categories section)
// ---------------------------------------------------------------------------
export type Service = {
  title: string;
  desc: string;
  catId: string;
  icon: LucideIcon;
  img: string;
  imgClass: string;
};

export const SERVICES: Service[] = [
  {
    title: "Khóa điện tử - khóa vân tay",
    desc: "+ 150 sản phẩm",
    catId: "lock-parent",
    icon: Lock,
    img: "/pic/khoa.jpg",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Két sắt thông minh",
    desc: "+ 150 sản phẩm",
    catId: "Smart",
    icon: Shield,
    img: "/pic/ket.webp",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Thiết bị bếp",
    desc: "+ 150 sản phẩm",
    catId: "Kitchen",
    icon: Flame,
    img: "/pic/bep.webp",
    imgClass: "object-cover",
  },
  {
    title: "Phụ kiện tủ bếp",
    desc: "+ 150 sản phẩm",
    catId: "Cabinet",
    icon: LayoutGrid,
    img: "/pic/phukienbep.webp",
    imgClass: "object-cover",
  },
];

// ---------------------------------------------------------------------------
// Brand marquee (partners section)
// ---------------------------------------------------------------------------
export type Brand = {
  name: string;
  style: string;
};

export const BRANDS: Brand[] = [
  { name: "BOSCH",   style: "font-sans font-bold tracking-tighter" },
  { name: "YALE",    style: "font-serif italic tracking-wider" },
  { name: "HAFELE",  style: "font-sans font-extrabold tracking-widest" },
  { name: "SAMSUNG", style: "font-sans font-semibold tracking-normal" },
  { name: "KAADAS",  style: "font-sans font-black tracking-tight" },
  { name: "PHILIPS", style: "font-sans font-black tracking-wide" },
];

// ---------------------------------------------------------------------------
// Solutions section — static image + icon, titles/desc come from content.json
// ---------------------------------------------------------------------------
export type SolutionMeta = {
  img: string;
  icon: LucideIcon;
};

export const SOLUTION_META: SolutionMeta[] = [
  { img: "/pic/khoa2.jpg", icon: ShieldCheck },
  { img: "/pic/bep2.webp", icon: Utensils },
];

// ---------------------------------------------------------------------------
// News article images (indexed in the same order as content.json articles)
// ---------------------------------------------------------------------------
export const NEWS_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80",
];
