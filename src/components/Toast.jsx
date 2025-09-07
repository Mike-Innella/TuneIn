import { AnimatePresence, motion } from "framer-motion";
import { slideUp } from "../lib/variants";

export function Toast({ show, text }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]">
      <AnimatePresence>
        {show && (
          <motion.div 
            {...slideUp(10)} 
            className="rounded-full px-4 py-2 bg-white text-black shadow-[var(--shadow)] font-medium"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
