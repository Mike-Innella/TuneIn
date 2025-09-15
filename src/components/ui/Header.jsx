import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { HotkeyOverlay } from "./HotkeyOverlay";
import { User, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import AccountPanel from "../AccountPanel";

export function Header() {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-app-border surface">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-app-text flex items-center gap-3 group transition-all duration-300 hover:scale-105">
            <img src="/image.png" alt="TuneIn Logo" className="h-20 w-20 object-contain rounded-full transition-all duration-300 group-hover:rotate-12 group-hover:shadow-lg" />
            <span className="text-2xl font-cursive text-app-text transition-all duration-300 group-hover:text-app-primary group-hover:drop-shadow-sm">TuneIn</span>
          </Link>
          <nav className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowHotkeys(true)}
              className="h-9 w-9 rounded-full border border-app-border bg-app-surface2/80 grid place-items-center hover:bg-app-surface2 hover:border-app-primary/50 hover:scale-110 hover:shadow-lg transition-all duration-300 transform-gpu"
              aria-label="Keyboard shortcuts (Ctrl + /)"
              title="Keyboard shortcuts (Ctrl + /)"
            >
              <Keyboard className="h-4 w-4 text-app-muted hover:text-app-primary transition-colors duration-300" />
            </button>
            <ThemeToggle />
            <AccountPanel />
          </nav>
        </div>
      </header>

      <HotkeyOverlay 
        isOpen={showHotkeys} 
        onClose={() => setShowHotkeys(false)} 
      />
    </>
  );
}
