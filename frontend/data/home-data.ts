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
// Brand partners grid (home brands section)
// ---------------------------------------------------------------------------
export type PartnerBrand = {
  name: string;
  logo?: string;
  className: string;
};

export const PARTNER_BRANDS: PartnerBrand[] = [
  {
    name: "BOSCH",
    logo: "/brands/bosch.svg",
    className: "font-sans font-bold tracking-tighter text-[#E31C23]",
  },
  {
    name: "HÄFELE",
    logo: "/brands/hafele.png",
    className: "font-sans font-extrabold tracking-[0.18em] text-navy/55",
  },
  {
    name: "KASSLER",
    logo: "/brands/kassler.png",
    className: "font-sans font-bold tracking-wide text-[#2E7D32]",
  },
  {
    name: "KAFF",
    logo: "/brands/kaff.jpg",
    className: "font-sans font-black tracking-tight text-[#C41230]",
  },
  {
    name: "MALLOCA",
    className: "font-sans font-bold tracking-wide text-[#C9A227]",
  },
  {
    name: "eurosun",
    logo: "/brands/eurosun.png",
    className: "font-serif italic font-semibold tracking-wide text-[#2E7D32]",
  },
  {
    name: "EUROGOLD",
    className: "font-sans font-extrabold tracking-wide text-[#1E3A8A]",
  },
  {
    name: "GRÖB",
    logo: "/brands/grob.png",
    className: "font-sans font-black tracking-tight text-[#15803D]",
  },
];

/** @deprecated kept for any leftover imports */
export type Brand = {
  name: string;
  style: string;
};

export const BRANDS: Brand[] = PARTNER_BRANDS.map((brand) => ({
  name: brand.name,
  style: brand.className,
}));

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
// Showroom / store photos (frontend/public/store)
// ---------------------------------------------------------------------------
export const STORE_IMAGES: string[] = [
  "/store/2.jpg",
  "/store/1.jpg",
  "/store/3.jpg",
  "/store/4.jpg",
];
