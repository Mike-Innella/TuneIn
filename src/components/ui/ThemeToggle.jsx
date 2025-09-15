import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export function ThemeToggle({ mobile = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={mobile
        ? "tap-target w-full p-4 rounded-xl bg-app-surface2/50 hover:bg-app-surface2 hover:shadow-lg hover:scale-105 transition-all duration-300 transform-gpu text-left border border-app-border hover:border-app-primary/50"
        : "h-9 w-9 rounded-full border grid place-items-center border-app-border bg-app-surface2/80 hover:bg-app-surface2 hover:scale-110 hover:shadow-lg hover:border-app-primary/50 hover:rotate-180 transition-all duration-300 transform-gpu"
      }
    >
      {mobile ? (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-app-border/40 flex items-center justify-center">
            {isDark ? <Sun className="h-5 w-5 text-app-muted transition-all duration-300 group-hover:text-app-primary" /> : <Moon className="h-5 w-5 text-app-muted transition-all duration-300 group-hover:text-app-primary" />}
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-app-text">
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </div>
          </div>
        </div>
      ) : (
        isDark ? <Sun className="h-4 w-4 text-app-muted transition-all duration-300 hover:text-app-primary" /> : <Moon className="h-4 w-4 text-app-muted transition-all duration-300 hover:text-app-primary" />
      )}
    </button>
  );
}
