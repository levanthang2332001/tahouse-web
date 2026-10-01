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
    img: "/pic/khoa-kassler.jpg",
    imgClass: "object-contain bg-white p-3",
  },
  {
    title: "Két sắt thông minh",
    catId: "Smart",
    icon: Shield,
    img: "/pic/ket.jpg",
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
    img: "/pic/cua.jpg",
    imgClass: "object-cover",
  },
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
// Showroom / store photos (frontend/public/store)
// ---------------------------------------------------------------------------
export const STORE_IMAGES: string[] = [
  "/store/2.jpg",
  "/store/1.jpg",
  "/store/3.jpg",
  "/store/4.jpg",
];

export const STORE_COPY = {
  prefix: "Showroom",
  title: "Ghé thăm cửa hàng TA HOUSE",
  desc: "Trải nghiệm khóa thông minh, két sắt và thiết bị bếp trực tiếp tại showroom — tư vấn tận nơi, xem mẫu thật trước khi quyết định.",
  showroomName: "Showroom Linh Xuân",
  ctaDirections: "Chỉ đường",
  ctaCall: "Gọi ngay",
  ctaZalo: "Chat Zalo",
} as const;
