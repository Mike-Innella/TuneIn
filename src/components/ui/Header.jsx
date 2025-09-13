import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { HotkeyOverlay } from "./HotkeyOverlay";
import { User, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";

export function Header() {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-app-border surface">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-app">
            TuneIn
          </Link>
          <nav className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowHotkeys(true)}
              className="h-9 w-9 rounded-full border border-app-border bg-app-surface2/80 grid place-items-center hover:bg-app-surface2 transition-colors"
              aria-label="Keyboard shortcuts (Ctrl + /)"
              title="Keyboard shortcuts (Ctrl + /)"
            >
              <Keyboard className="h-4 w-4 text-app-muted" />
            </button>
            <ThemeToggle />
            <Link
              to="/account"
              className="h-9 px-3 rounded-full border border-app-border bg-app-surface2/80 flex items-center gap-2 text-sm hover:bg-app-surface2 transition-colors"
              aria-label="Account"
            >
              <User className="h-4 w-4 text-app-muted" />
              <span className="hidden sm:inline text-app">Account</span>
            </Link>
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
