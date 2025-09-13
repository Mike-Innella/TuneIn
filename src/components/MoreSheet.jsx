import { Sheet } from "./Sheet";
import { useUIState } from "../state/ui";
import { useIsMobile } from "../hooks/use-mobile";
import { Settings, HelpCircle, User, Volume2, Smartphone, BarChart3, Keyboard, Moon, Sun } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useTheme } from "./ThemeProvider";

export function MoreSheet({ onToggleTheme, onShowHelp }) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [uiState, updateUIState] = useUIState();

  if (!isMobile) return null;

  const isOpen = uiState.moreSheetOpen;

  const handleClose = () => {
    updateUIState({ moreSheetOpen: false });
  };

  const toggleGestures = () => {
    updateUIState({ gesturesEnabled: !uiState.gesturesEnabled });
  };

  const menuItems = [
    {
      icon: User,
      label: "Account",
      action: () => {
        handleClose();
        // Navigate to account
        window.location.href = '/account';
      }
    },
    {
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      action: () => {
        handleClose();
        onShowHelp?.();
      }
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => {
        handleClose();
        // TODO: Add help/support functionality
        console.log('Help & Support not implemented yet');
      }
    },
    {
      icon: Smartphone,
      label: `Gestures ${uiState.gesturesEnabled ? 'On' : 'Off'}`,
      action: toggleGestures,
      description: "Enable swipe gestures for navigation"
    },
    {
      icon: BarChart3,
      label: "Session Statistics",
      action: () => {
        // TODO: Implement stats view
        console.log('Stats view not implemented yet');
      }
    }
  ];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="More Options"
      allowSwipeClose={true}
    >
      <div className="p-4 space-y-2">
        {/* Theme Toggle */}
        <ThemeToggle mobile={true} />
        
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className="tap-target w-full p-4 rounded-xl bg-app-surface2/50 hover:bg-app-surface2 transition-colors text-left border border-app-border"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-app-border/40 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-app-muted" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-app">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-sm text-app-muted">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.label.includes('Gestures') && (
                  <div className={`w-4 h-4 rounded-full ${
                    uiState.gesturesEnabled ? 'bg-app-primary' : 'bg-app-border'
                  }`} />
                )}
              </div>
            </button>
          );
        })}

        {/* Volume Control */}
        <div className="p-4 rounded-xl bg-app-surface2/50 border border-app-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-app-border/40 flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-app-muted" />
            </div>
            <div className="flex-1">
              <div className="text-base font-medium text-app">
                Master Volume
              </div>
            </div>
            <span className="text-sm text-app-muted">
              {Math.round(uiState.volume)}%
            </span>
          </div>
          <div 
            className="w-full h-2 bg-app-border/40 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
              updateUIState({ volume: percentage });
            }}
          >
            <div 
              className="h-2 bg-app-primary rounded-full transition-all duration-200"
              style={{ width: `${uiState.volume}%` }}
            />
          </div>
        </div>

        {/* App Info */}
        <div className="pt-4 border-t border-app-border text-center">
          <p className="text-xs text-app-muted">
            TuneIn v1.0.0 • Focus Timer & Music
          </p>
          <p className="text-xs text-app-muted/80 mt-1">
            Built for productive focus sessions
          </p>
        </div>
      </div>
    </Sheet>
  );
}