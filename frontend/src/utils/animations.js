export const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

export const listItemMotion = {
  layout: true,
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.97 },
  transition: { duration: 0.26, ease: "easeOut" },
  whileHover: { y: -4, scale: 1.015 },
  whileTap: { scale: 0.992 }
};

export const modalMotion = {
  initial: { opacity: 0, scale: 0.94, y: 14 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.22, ease: "easeOut" }
};

export const backdropMotion = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(12px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
  transition: { duration: 0.2, ease: "easeOut" }
};

export const tooltipMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: { duration: 0.18, ease: "easeOut" }
};

export const shakeMotion = {
  initial: { x: 0 },
  animate: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.36, ease: "easeInOut" }
  }
};
