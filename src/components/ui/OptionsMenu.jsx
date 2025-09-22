import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OptionsMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click / ESC
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative">
      {/* Button lives in header (mobile only) */}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="md:hidden h-9 w-9 rounded-full border border-app-border bg-app-surface2/80 grid place-items-center hover:bg-app-surface2 hover:border-app-primary/50 hover:scale-110 hover:shadow-lg transition-all duration-300 transform-gpu z-50 relative"
        title="Options"
      >
        {/* Dots icon */}
        <span className="sr-only">Options</span>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-app-muted hover:text-app-primary transition-colors duration-300">
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* Pulldown: positioned directly under header, right-aligned to button */}
            <motion.div
              ref={menuRef}
              role="menu"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 mt-2 w-56 rounded-xl border border-app-border bg-app-surface shadow-xl backdrop-blur z-50 p-2"
            >
              {items.length === 0 ? (
                <div className="px-3 py-2 text-sm text-app-text-muted">No options</div>
              ) : (
                <ul className="flex flex-col">
                  {items.map((item, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-app-text hover:bg-app-surface2 transition-colors"
                        onClick={() => {
                          setOpen(false);
                          item.onSelect?.();
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}