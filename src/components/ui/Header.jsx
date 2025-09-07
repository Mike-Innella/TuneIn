import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { HotkeyOverlay } from "./HotkeyOverlay";
import { User, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  const [showHotkeys, setShowHotkeys] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-gray-900 dark:text-white">
            TuneIn
          </Link>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setShowHotkeys(true)}
              className="h-9 w-9 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 grid place-items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Keyboard shortcuts (Ctrl + /)"
              title="Keyboard shortcuts (Ctrl + /)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <Link
              to="/account"
              className="h-9 px-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
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
