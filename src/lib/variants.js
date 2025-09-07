import { dur, ease } from "./motion";

export const fadeIn = (y=8) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0, transition: { duration: dur.s, ease: ease.out } },
  exit:    { opacity: 0, y,   transition: { duration: dur.xs, ease: ease.in } },
});

export const scaleCard = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: dur.m, ease: ease.io } },
  whileHover: { scale: 1.02, transition: { duration: dur.xs, ease: ease.out } },
  whileTap: { scale: 0.995, transition: { duration: dur.xs, ease: ease.in } },
};

export const slideUp = (dist=12) => ({
  initial: { y: dist, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: dur.s, ease: ease.out } },
  exit:    { y: dist, opacity: 0, transition: { duration: dur.xs, ease: ease.in } },
});

export const listParent = { 
  initial: {}, 
  animate: { transition: { staggerChildren: 0.04 } } 
};
