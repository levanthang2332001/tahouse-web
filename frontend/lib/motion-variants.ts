import type { Variants } from "framer-motion";

/** Fade up — used for individual child items inside a stagger container */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
};

/** Subtle fade up — slightly less vertical travel, used for headings */
export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
};

/** Stagger container — wraps multiple fadeUp children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.03 },
  },
};

/** Stagger container with slightly longer child interval */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.03 },
  },
};

/** Slide in from the left — used in Solutions left panel */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] } },
};

/** Slide in from the right — used in Solutions right image */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] } },
};
