// DeepShot Animation System
// Healthcare-optimized animations with accessibility support

import confetti from "canvas-confetti";

// Transition presets
export const transitions = {
  fast: { duration: 0.1, ease: "easeOut" },
  normal: { duration: 0.2, ease: "easeInOut" },
  slow: { duration: 0.3, ease: "easeInOut" },
  spring: { type: "spring" as const, stiffness: 400, damping: 25 },
  bounce: { type: "spring" as const, stiffness: 500, damping: 15 },
};

// Animation variants for Framer Motion
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
};

// Stagger children animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// Calendar month transition
export const monthTransition = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -50 : 50,
    transition: { duration: 0.2, ease: "easeInOut" },
  }),
};

// Button tap animation
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.15 },
};

// Card hover animation
export const cardHover = {
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" },
};

// Celebration effects
export function celebrateMilestone(
  type: "injection" | "streak" | "cycle" | "perfect-week",
) {
  const colors = {
    injection: ["#22D3EE", "#06B6D4", "#0891B2"], // Cyan
    streak: ["#F97316", "#FB923C", "#FDBA74"], // Amber
    cycle: ["#A3E635", "#84CC16", "#65A30D"], // Lime
    "perfect-week": ["#F97316", "#22D3EE", "#A3E635"], // Mixed
  };

  const configs = {
    injection: {
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: colors.injection,
      ticks: 100,
    },
    streak: {
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors.streak,
      ticks: 150,
    },
    cycle: {
      particleCount: 150,
      spread: 120,
      origin: { y: 0.5 },
      colors: colors.cycle,
      ticks: 200,
    },
    "perfect-week": {
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: colors["perfect-week"],
      ticks: 150,
    },
  };

  confetti(configs[type]);
}

// Simple toast animation
export const toastAnimation = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// Dialog animation
export const dialogAnimation = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  },
};

// Skeleton pulse animation
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Progress ring animation
export const progressRing = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

// Number count-up animation config
export const countUpConfig = {
  duration: 0.5,
  ease: "easeOut",
};

// Reduced motion helpers
export function getAccessibleAnimation(
  prefersReducedMotion: boolean,
  animation: object,
): object {
  if (prefersReducedMotion) {
    // Return simplified version with opacity only
    return {
      ...animation,
      transform: undefined,
      x: undefined,
      y: undefined,
      scale: undefined,
    };
  }
  return animation;
}
