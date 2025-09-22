import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Music, Timer, Home, MoreHorizontal, User } from "lucide-react";

export function MobileShortcutsOverlay({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-app-border surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-app-surface border-b border-app-border px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-app-text">Mobile Gestures</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-app-surface2 transition-colors"
                  aria-label="Close gestures guide"
                >
                  <X className="h-5 w-5 text-app-muted" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Navigation */}
              <div>
                <h3 className="text-lg font-medium text-app-text mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-app-primary" />
                  Navigation
                </h3>
                <div className="space-y-3">
                  <GestureItem icon={Home} gesture="Tap home icon" description="Return to main screen" />
                  <GestureItem icon={MoreHorizontal} gesture="Tap options (⋯)" description="Open this menu" />
                  <GestureItem icon={User} gesture="Options → Profile" description="Access account settings" />
                </div>
              </div>

              {/* Audio Controls */}
              <div>
                <h3 className="text-lg font-medium text-app-text mb-4 flex items-center gap-2">
                  <Music className="h-5 w-5 text-app-primary" />
                  Music & Audio
                </h3>
                <div className="space-y-3">
                  <GestureItem gesture="Tap mini player" description="Expand full player controls" />
                  <GestureItem gesture="Tap play button" description="Play/pause current track" />
                  <GestureItem gesture="Volume buttons" description="Adjust audio volume" />
                  <GestureItem gesture="Swipe player down" description="Minimize player" />
                </div>
              </div>

              {/* Timer & Sessions */}
              <div>
                <h3 className="text-lg font-medium text-app-text mb-4 flex items-center gap-2">
                  <Timer className="h-5 w-5 text-app-primary" />
                  Focus Sessions
                </h3>
                <div className="space-y-3">
                  <GestureItem gesture="Tap mood card" description="Select focus mood" />
                  <GestureItem gesture="Tap timer ring" description="Start/pause focus session" />
                  <GestureItem gesture="Long press timer" description="Reset current session" />
                  <GestureItem gesture="Swipe up on sheet" description="Dismiss bottom sheets" />
                </div>
              </div>

              {/* General */}
              <div>
                <h3 className="text-lg font-medium text-app-text mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-app-primary" />
                  General
                </h3>
                <div className="space-y-3">
                  <GestureItem gesture="Tap outside overlay" description="Close modals and menus" />
                  <GestureItem gesture="Pull to refresh" description="Refresh content" />
                  <GestureItem gesture="Options → Theme" description="Toggle dark/light mode" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GestureItem({ icon: Icon, gesture, description }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 text-app-primary flex-shrink-0" />}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-app-muted">{description}</span>
          <span className="px-2 py-1 text-xs font-medium bg-app-surface2 border border-app-border rounded-md text-app-text ml-2">
            {gesture}
          </span>
        </div>
      </div>
    </div>
  );
}