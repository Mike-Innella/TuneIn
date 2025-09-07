import { AnimatePresence, motion } from "framer-motion";
import { slideUp } from "../lib/variants";
import { dur } from "../lib/motion";

export function Modal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className="fixed inset-0 z-[60]" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: dur.s } }}
            exit={{ opacity: 0, transition: { duration: dur.xs } }}
          />
          <motion.div
            {...slideUp(16)}
            className="relative mx-auto mt-24 w-full max-w-md rounded-2xl bg-zinc-900/95 border border-white/10 p-6 shadow-[var(--shadow)]"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
