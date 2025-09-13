import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
import { Sheet } from "./Sheet";
import { usePlayerStore } from "../store/playerStore";
import { useUIState } from "../state/ui";
import { useIsMobile } from "../hooks/use-mobile";
import { useEffect, useRef } from "react";

export function PlayerSheet() {
  const isMobile = useIsMobile();
  const [uiState, updateUIState] = useUIState();
  const playerStore = usePlayerStore();
  const gestureRef = useRef(null);

  const isOpen = isMobile && uiState.playerExpanded;

  const handleClose = () => {
    updateUIState({ playerExpanded: false });
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    playerStore.setVolumeLevel(percentage);
    updateUIState({ volume: percentage });
  };

  // Gesture handling for track navigation
  useEffect(() => {
    if (!isOpen || !uiState.gesturesEnabled || !gestureRef.current) return;

    let startX = 0;
    let startY = 0;
    let threshold = 50;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Only trigger if horizontal swipe is more pronounced than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        e.preventDefault();
        if (deltaX > 0) {
          // Swipe right - previous track
          playerStore.prev();
        } else {
          // Swipe left - next track
          playerStore.next();
        }
      }
    };

    const element = gestureRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, uiState.gesturesEnabled, playerStore]);

  if (!isMobile) return null;

  const current = playerStore.current;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Now Playing"
      allowSwipeClose={true}
      className="max-h-[80vh]"
    >
      <div className="p-4 space-y-6" ref={gestureRef}>
        {/* Album Art */}
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-lg flex items-center justify-center">
            {current?.thumb ? (
              <img
                src={current.thumb}
                alt={current.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="text-white/80 text-center">
                <Heart className="h-16 w-16 mx-auto mb-2" />
                <span className="text-sm">No Artwork</span>
              </div>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-app line-clamp-2">
            {current?.title || "No track selected"}
          </h3>
          <p className="text-app-muted">
            {current?.channel || "Unknown artist"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-1 bg-app-border/40 rounded-full">
            <div className="h-1 bg-app-primary rounded-full w-1/3" />
          </div>
          <div className="flex justify-between text-xs text-app-muted">
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={playerStore.prev}
            className="tap-target p-3 rounded-full bg-app-surface2/80 hover:bg-app-surface2 transition-colors border border-app-border"
            aria-label="Previous track"
          >
            <SkipBack className="h-6 w-6 text-app-muted" />
          </button>

          <button
            onClick={() => {
              // Toggle play/pause based on current state
              // This would need to be connected to actual player state
              console.log('Toggle play/pause');
            }}
            className="tap-target p-4 rounded-full primary hover:bg-app-primary/90 transition-colors shadow-lg"
            aria-label="Play/Pause"
          >
            <Play className="h-8 w-8" />
          </button>

          <button
            onClick={playerStore.next}
            className="tap-target p-3 rounded-full bg-app-surface2/80 hover:bg-app-surface2 transition-colors border border-app-border"
            aria-label="Next track"
          >
            <SkipForward className="h-6 w-6 text-app-muted" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-5 w-5 text-app-muted" />
            <div 
              className="flex-1 h-2 bg-app-border/40 rounded-full cursor-pointer"
              onClick={handleVolumeChange}
            >
              <div 
                className="h-2 bg-app-primary rounded-full"
                style={{ width: `${playerStore.volume}%` }}
              />
            </div>
            <span className="text-sm text-app-muted min-w-[3ch]">
              {Math.round(playerStore.volume)}
            </span>
          </div>
        </div>

        {/* Queue Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-app-muted">
            Up Next
          </h4>
          <div className="space-y-2">
            {playerStore.queue.slice(playerStore.index + 1, playerStore.index + 4).map((track, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg bg-app-surface2/50 border border-app-border">
                <div className="w-10 h-10 bg-app-border/40 rounded flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-app truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-app-muted truncate">
                    {track.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gesture hint */}
        {uiState.gesturesEnabled && (
          <div className="text-center">
            <p className="text-xs text-app-muted">
              Swipe left/right to change tracks
            </p>
          </div>
        )}
      </div>
    </Sheet>
  );
}