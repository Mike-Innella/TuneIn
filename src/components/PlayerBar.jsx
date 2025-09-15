import { usePlayer } from '../player/PlayerContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export default function PlayerBar() {
  const player = usePlayer();
  const { current, isPlaying, play, pause, prev, next, volume, setVol } = player;

  // Enable keyboard shortcuts
  useKeyboardShortcuts(player);

  if (!current) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(680px,95vw)] z-[9997]
                    rounded-2xl shadow-lg backdrop-blur-xl bg-app-surface/95 border border-app-border
                    text-app-text px-4 py-3 flex items-center gap-3">
      {current.thumb && (
        <img
          src={current.thumb}
          alt=""
          className="w-10 h-10 rounded-lg object-cover hover:scale-110 transition-all duration-300 cursor-pointer"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium text-app-text">{current.title}</div>
        <div className="truncate text-xs text-app-muted">{current.channel}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="p-2 hover:bg-app-surface2 hover:scale-110 hover:shadow-lg rounded-lg transition-all duration-300 transform-gpu text-app-text"
          aria-label="Previous"
        >
          <SkipBack size={18} />
        </button>

        {isPlaying ? (
          <button
            onClick={pause}
            className="p-2 hover:bg-app-surface2 hover:scale-110 hover:shadow-lg rounded-lg transition-all duration-300 transform-gpu text-app-text"
            aria-label="Pause"
          >
            <Pause size={20} />
          </button>
        ) : (
          <button
            onClick={play}
            className="p-2 hover:bg-app-surface2 hover:scale-110 hover:shadow-lg rounded-lg transition-all duration-300 transform-gpu text-app-text"
            aria-label="Play"
          >
            <Play size={20} />
          </button>
        )}

        <button
          onClick={next}
          className="p-2 hover:bg-app-surface2 hover:scale-110 hover:shadow-lg rounded-lg transition-all duration-300 transform-gpu text-app-text"
          aria-label="Next"
        >
          <SkipForward size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <Volume2 size={16} className="text-app-muted flex-shrink-0 hover:text-app-primary transition-colors duration-300" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVol(Number(e.target.value))}
          className="w-20 accent-app-primary hover:scale-105 transition-transform duration-300"
          aria-label="Volume"
        />
        <span className="text-xs text-app-muted w-8 text-right">{volume}</span>
      </div>
    </div>
  );
}