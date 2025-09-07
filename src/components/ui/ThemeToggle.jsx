import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const stored = localStorage.getItem("theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (sysDark ? "dark" : "light");
    const isInitiallyDark = theme === "dark";
    
    setIsDark(isInitiallyDark);
    
    // Apply theme
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (isInitiallyDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? "dark" : "light";
    
    setIsDark(newIsDark);
    
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    root.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="h-9 w-9 rounded-full border grid place-items-center border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
