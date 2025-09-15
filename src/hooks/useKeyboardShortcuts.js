import { useEffect } from 'react';

export function useKeyboardShortcuts(player) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts if not typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case ' ': // Spacebar - Play/Pause
          e.preventDefault();
          if (player.isPlaying) {
            player.pause();
          } else {
            player.play();
          }
          break;

        case 'ArrowLeft': // Previous track
          e.preventDefault();
          player.prev();
          break;

        case 'ArrowRight': // Next track
          e.preventDefault();
          player.next();
          break;

        case 'ArrowUp': // Volume up
          e.preventDefault();
          player.setVol(Math.min(100, player.volume + 5));
          break;

        case 'ArrowDown': // Volume down
          e.preventDefault();
          player.setVol(Math.max(0, player.volume - 5));
          break;

        case 'm':
        case 'M': // Mute/Unmute
          e.preventDefault();
          if (player.volume > 0) {
            player.setVol(0);
          } else {
            player.setVol(40); // Restore to default volume
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [player]);
}