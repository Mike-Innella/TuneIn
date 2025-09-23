import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { HotkeyOverlay } from "./HotkeyOverlay";
import { MobileShortcutsOverlay } from "./MobileShortcutsOverlay";
import { User, Keyboard, Smartphone, Palette, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import AccountPanel from "../AccountPanel";
import OptionsMenu from "./OptionsMenu";
import { supabase } from "../../lib/supabaseClient";

export function Header() {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showMobileShortcuts, setShowMobileShortcuts] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const signOut = async () => {
    console.log('🚪 Starting signout process...');

    try {
      // End any active session first - stop all audio immediately
      window.dispatchEvent(new CustomEvent('session:stop'));

      // Also directly stop YouTube player if it exists
      try {
        const ytController = await import('../../player/ytController');
        if (ytController.isReady()) {
          ytController.stop();
          ytController.pause();
        }
      } catch (e) {
        console.warn('Could not stop YouTube player:', e);
      }

      // Force close the player bar by clearing its state
      window.dispatchEvent(new CustomEvent('player:clear'));

      // Step 1: Try normal Supabase signout
      console.log('📤 Attempting Supabase signout...');
      const { error } = await supabase.auth.signOut();

      if (!error) {
        console.log('✅ Supabase signout successful');
        navigate('/auth', { replace: true });
        return;
      }

      console.warn('⚠️ Supabase signout failed:', error.message);

      // Step 2: Nuclear option - clear everything manually
      console.log('💥 Nuclear signout: clearing all auth data...');

      // Force stop any audio again
      try {
        const ytController = await import('../../player/ytController');
        if (ytController.isReady()) {
          ytController.stop();
          ytController.destroy();
        }
      } catch (e) {
        console.warn('Could not force stop YouTube player:', e);
      }

      // Force close the player bar again
      window.dispatchEvent(new CustomEvent('player:clear'));

      // Clear all possible localStorage keys
      const keysToRemove = [
        `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`,
        'supabase.auth.token',
        'sb-auth-token',
        'supabase_auth_token',
        'sb-gevzvrgcspcqmteoqjuw-auth-token'
      ];

      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          console.log(`🗑️ Removing localStorage key: ${key}`);
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage as well
      keysToRemove.forEach(key => {
        if (sessionStorage.getItem(key)) {
          console.log(`🗑️ Removing sessionStorage key: ${key}`);
          sessionStorage.removeItem(key);
        }
      });

      console.log('🔄 Forcing page reload to clear session state...');
      window.location.href = '/auth';

    } catch (err) {
      console.error('💥 Critical signout error:', err);
      // Last resort: just redirect and reload
      window.location.href = '/auth';
    }
  };

  const optionItems = [
    {
      label: isMobile ? "Gestures" : "Shortcuts",
      icon: isMobile ? Smartphone : Keyboard,
      onSelect: () => isMobile ? setShowMobileShortcuts(true) : setShowHotkeys(true)
    },
    {
      label: "Profile",
      icon: User,
      onSelect: () => window.dispatchEvent(new CustomEvent("navigate:account"))
    },
    {
      label: "Theme",
      icon: Palette,
      onSelect: () => {
        const themeButton = document.querySelector('[aria-label*="Switch to"]');
        if (themeButton) themeButton.click();
      }
    },
    {
      label: "Sign out",
      icon: LogOut,
      onSelect: signOut
    },
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

      <MobileShortcutsOverlay
        isOpen={showMobileShortcuts}
        onClose={() => setShowMobileShortcuts(false)}
      />
    </>
  );
}
