import { CookingPot, DoorClosed, Droplets, Fan, Lock, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Category / Service cards (home categories section)
// ---------------------------------------------------------------------------
export type Service = {
  title: string;
  catId: string;
  icon: LucideIcon;
  img: string;
  imgClass: string;
};

export const SERVICES: Service[] = [
  {
    title: "Khóa điện tử - khóa vân tay",
    catId: "lock-parent",
    icon: Lock,
    img: "/pic/khoa.jpg",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Két sắt thông minh",
    catId: "Smart",
    icon: Shield,
    img: "/pic/ket.webp",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Thiết bị bếp",
    catId: "kitchen-group",
    icon: CookingPot,
    img: "/pic/bep2.webp",
    imgClass: "object-cover",
  },
  {
    title: "Quạt trần đèn",
    catId: "fanlight-group",
    icon: Fan,
    img: "/pic/quat.jpg",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Máy lọc nước",
    catId: "water-group",
    icon: Droplets,
    img: "/pic/maylocnuoc.webp",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Cửa",
    catId: "door-group",
    icon: DoorClosed,
    img: "/pic/khoa2.jpg",
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
  { img: "/pic/khoa2.jpg", icon: Shield },
  { img: "/pic/bep2.webp", icon: CookingPot },
];

// ---------------------------------------------------------------------------
// News article images (indexed in the same order as content.json articles)
// ---------------------------------------------------------------------------
export const NEWS_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80",
];
