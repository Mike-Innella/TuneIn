import { motion } from "framer-motion";
import { dur, ease } from "../lib/motion";

export function PageFade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: dur.m, ease: ease.io } }}
      exit={{ opacity: 0, y: -6, transition: { duration: dur.s, ease: ease.in } }}
    >
      {children}
    </motion.div>
  );
}
