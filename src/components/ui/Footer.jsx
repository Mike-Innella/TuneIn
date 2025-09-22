import { Heart, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";

export function Footer() {
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-app-border surface mt-auto pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>

          {/* Brand Section */}
          <div className={`${isMobile ? 'text-center' : 'md:col-span-2'} space-y-4`}>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img
                src="/logo.png"
                alt="TuneIn logo"
                className="h-8 w-auto block object-contain"
                style={{ maxWidth: '140px', minWidth: '80px' }}
              />
              <span className="text-2xl font-cursive text-app-text">TuneIn</span>
            </div>
            <p className="text-app-muted text-sm max-w-md">
              Focus better with mood-based music curation and productivity timers.
              Built to help you achieve deep work and creative flow states.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-app-text">Product</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200"
              >
                Focus Timer
              </Link>
              <Link
                to="/"
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200"
              >
                Mood Selection
              </Link>
              <Link
                to="/account"
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200"
              >
                Account Settings
              </Link>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-app-text">Support</h3>
            <div className="flex flex-col space-y-2">
              <a
                href="mailto:support@tunein-focus.com"
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200 flex items-center gap-2"
              >
                <Mail size={14} />
                Contact
              </a>
              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: '/',
                    ctrlKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }}
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200 text-left"
              >
                Keyboard Shortcuts
              </button>
              <a
                href="/policy"
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm text-app-muted hover:text-app-text transition-colors duration-200"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`mt-8 pt-8 border-t border-app-border/50 flex ${isMobile ? 'flex-col gap-4 text-center' : 'flex-row justify-between items-center'}`}>
          <div className="flex items-center gap-2 text-sm text-app-muted">
            <span>© {currentYear} TuneIn.</span>
            <span className="flex items-center gap-1">
              Built with <Heart size={14} className="text-red-500" /> for focus
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Mike-Innella"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full border border-app-border bg-app-surface2/80 grid place-items-center hover:bg-app-surface2 hover:border-app-primary/50 hover:scale-110 transition-all duration-300"
              aria-label="GitHub Repository"
            >
              <Github className="h-4 w-4 text-app-muted hover:text-app-primary transition-colors duration-300" />
            </a>
            <a
              href="https://www.linkedin.com/in/mainnella/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full border border-app-border bg-app-surface2/80 grid place-items-center hover:bg-app-surface2 hover:border-app-primary/50 hover:scale-110 transition-all duration-300"
              aria-label="Follow on LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-app-muted hover:text-app-primary transition-colors duration-300" />
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}