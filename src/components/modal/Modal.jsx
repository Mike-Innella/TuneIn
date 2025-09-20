import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "./useFocusTrap";

export default function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, open);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const root = document.getElementById("modal-root");
  if (!root) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden="false"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-[101] mx-4 w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        ref={panelRef}
      >
        <header className="flex items-center justify-between border-b border-black/5 dark:border-white/10 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 px-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
          {children}
        </div>
        <footer className="flex justify-end gap-3 border-t border-black/5 dark:border-white/10 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          >
            Close
          </button>
        </footer>
      </div>
    </div>,
    root
  );
}