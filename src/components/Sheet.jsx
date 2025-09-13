import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0.6,
  allowSwipeClose = true,
  showHandle = true,
  className = "",
  ...props
}) {
  const sheetRef = useRef(null);
  const lastTouchY = useRef(0);
  const initialTouchY = useRef(0);
  const isDragging = useRef(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const focusableElements = sheetRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => {
    if (!allowSwipeClose) return;
    initialTouchY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!allowSwipeClose || !isDragging.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - lastTouchY.current;
    
    // Only allow downward swipes to close
    if (deltaY > 0 && currentY > initialTouchY.current + 50) {
      // Prevent default to avoid pull-to-refresh
      e.preventDefault();
    }
    
    lastTouchY.current = currentY;
  };

  const handleTouchEnd = (e) => {
    if (!allowSwipeClose || !isDragging.current) return;
    
    const finalY = e.changedTouches[0].clientY;
    const deltaY = finalY - initialTouchY.current;
    
    // Close if swiped down more than 100px
    if (deltaY > 100) {
      onClose();
    }
    
    isDragging.current = false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 z-50 surface border-t border-app-border rounded-t-2xl shadow-2xl max-h-[90vh] ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...props}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-app-border rounded-full" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-app-border">
                <h2 className="text-lg font-semibold text-app">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="tap-target p-2 rounded-full hover:bg-app-surface2/50 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-app-muted" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}