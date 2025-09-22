import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { HotkeyOverlay } from "./HotkeyOverlay";
import { User, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import AccountPanel from "../AccountPanel";
import OptionsMenu from "./OptionsMenu";

export function Header() {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const isMobile = useIsMobile();

  const optionItems = [
    { label: "Settings", onSelect: () => setShowHotkeys(true) },
    { label: "Profile", onSelect: () => window.dispatchEvent(new CustomEvent("navigate:account")) },
    { label: "Theme", onSelect: () => {
      const themeButton = document.querySelector('[aria-label*="Switch to"]');
      if (themeButton) themeButton.click();
    }},
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-app-border surface">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-app-text flex items-center gap-3 group transition-all duration-300 hover:scale-105 overflow-visible">
            <img
              src="/logo.png"
              alt="TuneIn logo"
              className="h-8 w-auto block object-contain align-middle pointer-events-none"
              style={{ maxWidth: '140px', minWidth: '80px' }}
            />
            <span className="text-2xl font-cursive text-app-text transition-all duration-300 group-hover:text-app-primary group-hover:drop-shadow-sm">TuneIn</span>
          </Link>
          <nav className="flex items-center gap-3">
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-3">
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
            </div>
            {/* Mobile options menu */}
            <OptionsMenu items={optionItems} />
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
