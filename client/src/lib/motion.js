import { motion, useReducedMotion } from "framer-motion";

export { motion };

const ease = [0.16, 1, 0.3, 1];

export function usePrefersReducedMotion() {
  return useReducedMotion() ?? false;
}

export function sectionMotionProps(reduced, delay = 0) {
  if (reduced) {
    return { initial: false, animate: false };
  }
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease, delay },
  };
}

export function staggerContainerProps(reduced, stagger = 0.06) {
  if (reduced) return {};
  return {
    initial: "hidden",
    animate: "show",
    variants: {
      hidden: {},
      show: {
        transition: { staggerChildren: stagger, delayChildren: 0.04 },
      },
    },
  };
}

export function staggerItemProps(reduced) {
  if (reduced) return {};
  return {
    variants: {
      hidden: { opacity: 0, y: 8 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease },
      },
    },
  };
}

export function modalBackdropProps(reduced) {
  if (reduced) {
    return { initial: { opacity: 1 }, animate: { opacity: 1 } };
  }
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  };
}

export function modalPanelProps(reduced) {
  if (reduced) {
    return { initial: false, animate: false };
  }
  return {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 8 },
    transition: { duration: 0.28, ease },
  };
}
