import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGlobalHotkeys({
  onStartPause,
  onReset,
  onStop,
  onSessionType,
  onQuickStart,
  onToggleTheme,
  onShowHelp,
  onToggleAutoAdvance,
  onAdjustDuration,
  status = 'idle'
}) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event) => {
    // Don't trigger hotkeys when user is typing in inputs
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) ||
                     event.target.contentEditable === 'true';
    
    if (isTyping) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;
    const cmdOrCtrl = ctrlKey || metaKey;

    // Prevent default for handled hotkeys
    const preventDefault = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (key) {
      // Primary Controls
      case ' ': // Spacebar - Start/Pause
        preventDefault();
        onStartPause?.();
        break;
        
      case 'Escape': // Stop session
        preventDefault();
        onStop?.();
        break;

      case 'r':
      case 'R':
        if (cmdOrCtrl) {
          preventDefault();
          if (shiftKey) {
            // Ctrl+Shift+R - Force reset
            onReset?.(true);
          } else {
            // Ctrl+R - Normal reset
            onReset?.(false);
          }
        }
        break;

      // Session Types (1, 2, 3)
      case '1':
        preventDefault();
        if (cmdOrCtrl) {
          onQuickStart?.('Pomodoro');
        } else {
          onSessionType?.('Pomodoro');
        }
        break;
        
      case '2':
        preventDefault();
        if (cmdOrCtrl) {
          onQuickStart?.('ShortBreak');
        } else {
          onSessionType?.('ShortBreak');
        }
        break;
        
      case '3':
        preventDefault();
        if (cmdOrCtrl) {
          onQuickStart?.('LongBreak');
        } else {
          onSessionType?.('LongBreak');
        }
        break;

      // Duration Adjustment
      case '+':
      case '=':
        preventDefault();
        onAdjustDuration?.(5);
        break;
        
      case '-':
        preventDefault();
        onAdjustDuration?.(-5);
        break;

      // Navigation & UI
      case '/':
        if (cmdOrCtrl) {
          preventDefault();
          onShowHelp?.();
        }
        break;

      case 't':
      case 'T':
        if (cmdOrCtrl && shiftKey) {
          preventDefault();
          onToggleTheme?.();
        }
        break;

      case 'a':
      case 'A':
        if (cmdOrCtrl) {
          preventDefault();
          onToggleAutoAdvance?.();
        }
        break;

      case 'k':
      case 'K':
        if (cmdOrCtrl) {
          preventDefault();
          navigate('/account');
        }
        break;

      // Tab for cycling session types
      case 'Tab':
        if (!cmdOrCtrl && !shiftKey) {
          preventDefault();
          const types = ['Pomodoro', 'ShortBreak', 'LongBreak'];
          const currentIndex = types.indexOf(status?.currentType || 'Pomodoro');
          const nextIndex = (currentIndex + 1) % types.length;
          onSessionType?.(types[nextIndex]);
        }
        break;

      // F11 for fullscreen (let browser handle this)
      case 'F11':
        // Don't prevent default, let browser handle fullscreen
        break;

      default:
        break;
    }
  }, [navigate, onStartPause, onReset, onStop, onSessionType, onQuickStart, 
      onToggleTheme, onShowHelp, onToggleAutoAdvance, onAdjustDuration, status]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}

// Helper function to get hotkey display text
export const getHotkeyText = (keys) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdText = isMac ? '⌘' : 'Ctrl';
  
  return keys.replace(/Ctrl\+/g, `${cmdText}+`);
};

// Hotkey definitions for help display
export const HOTKEY_GROUPS = [
  {
    title: 'Timer Controls',
    icon: '⏱️',
    shortcuts: [
      { keys: 'Space', description: 'Start/Pause timer' },
      { keys: 'Ctrl+R', description: 'Reset timer' },
      { keys: 'Ctrl+Shift+R', description: 'Force reset (clear progress)' },
      { keys: 'Esc', description: 'Stop session' }
    ]
  },
  {
    title: 'Session Types',
    icon: '🔄',
    shortcuts: [
      { keys: '1', description: 'Switch to Pomodoro (25min)' },
      { keys: '2', description: 'Switch to Short Break (5min)' },
      { keys: '3', description: 'Switch to Long Break (15min)' },
      { keys: 'Ctrl+1/2/3', description: 'Quick start session type' },
      { keys: 'Tab', description: 'Cycle through session types' }
    ]
  },
  {
    title: 'Duration & Settings',
    icon: '⚙️',
    shortcuts: [
      { keys: '+/-', description: 'Adjust duration (±5 minutes)' },
      { keys: 'Ctrl+A', description: 'Toggle auto-advance' },
      { keys: 'Ctrl+Shift+T', description: 'Toggle theme' }
    ]
  },
  {
    title: 'Navigation',
    icon: '🧭',
    shortcuts: [
      { keys: 'Ctrl+/', description: 'Show keyboard shortcuts' },
      { keys: 'Ctrl+K', description: 'Go to Account page' },
      { keys: 'F11', description: 'Toggle fullscreen' }
    ]
  }
];
