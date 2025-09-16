import { motion } from "framer-motion";
import { Home, Music, Timer, Play, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { useUIState } from "../state/ui";
import { usePlayerStore } from "../store/playerStore";
import { useState } from "react";

const MOODS = [
  { name: 'Deep Work', duration: 50 },
  { name: 'Creative Flow', duration: 45 },
  { name: 'Light Focus', duration: 25 },
  { name: 'Learning', duration: 30 },
];

export function MobileNav({ onNavigate }) {
  const isMobile = useIsMobile();
  const [uiState, updateUIState] = useUIState();
  const playerStore = usePlayerStore();
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  if (!isMobile) return null;


  const handleMoodSelect = (mood) => {
    updateUIState({ lastMood: mood.name, lastTimerDuration: mood.duration });
    
    // Dispatch mood selection event
    window.dispatchEvent(new CustomEvent("mood:selected", {
      detail: { 
        mood: mood.name, 
        duration: mood.duration 
      }
    }));
    
    setShowMoodPicker(false);
  };

  const handlePlayerToggle = () => {
    updateUIState({ playerExpanded: !uiState.playerExpanded });
  };

  const handleMoodsSheet = () => {
    updateUIState({ moodSheetOpen: true });
  };

  const handleMoreSheet = () => {
    updateUIState({ moreSheetOpen: true });
  };


  return (
    <>
      {/* Mini Player Bar */}
      {playerStore.current && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-20 left-0 right-0 z-30 mx-4 mb-2"
          onClick={handlePlayerToggle}
        >
          <div className="surface rounded-lg p-3 shadow-lg border border-app-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-400 dark:from-slate-700 dark:to-slate-500 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-app-text truncate">
                  {playerStore.current.title}
                </p>
                <p className="text-xs text-app-text-muted truncate">
                  {playerStore.current.channel}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle play/pause via player store
                  if (playerStore.current) {
                    const isPlaying = playerStore.current.playing || false;
                    if (isPlaying) {
                      playerStore.pause();
                    } else {
                      playerStore.resume();
                    }
                  }
                }}
                className="tap-target p-2 rounded-full primary"
                aria-label="Play/Pause"
              >
                <Play className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-40 surface-2 border-t border-app-border pb-safe shadow-lg">
        <div className="mx-auto max-w-screen-sm flex justify-between items-center px-4 py-2 relative">
          
          {/* Home */}
          <button
            onClick={() => {
              onNavigate?.('home');
              // Close any open sheets
              updateUIState({
                moodSheetOpen: false,
                moreSheetOpen: false,
                playerExpanded: false
              });
            }}
            className="tap-target flex flex-col items-center justify-center p-2 rounded-lg hover:bg-app-surface2/50 active:bg-app-surface2 transition-colors"
            aria-label="Home"
          >
            <Home className="h-6 w-6 text-app-text-muted" />
            <span className="text-xs text-app-text-muted mt-1">Home</span>
          </button>

          {/* Moods */}
          <button
            onClick={handleMoodsSheet}
            className="tap-target flex flex-col items-center justify-center p-2 rounded-lg hover:bg-app-surface2/50 active:bg-app-surface2 transition-colors"
            aria-label="Moods"
          >
            <Music className="h-6 w-6 text-app-text-muted" />
            <span className="text-xs text-app-text-muted mt-1">Moods</span>
          </button>


          {/* Timer */}
          <button
            onClick={() => {
              onNavigate?.('timer');
              // Close any open sheets
              updateUIState({
                moodSheetOpen: false,
                moreSheetOpen: false,
                playerExpanded: false
              });
            }}
            className="tap-target flex flex-col items-center justify-center p-2 rounded-lg hover:bg-app-surface2/50 active:bg-app-surface2 transition-colors"
            aria-label="Timer"
          >
            <Timer className="h-6 w-6 text-app-text-muted" />
            <span className="text-xs text-app-text-muted mt-1">Timer</span>
          </button>

          {/* More */}
          <button
            onClick={handleMoreSheet}
            className="tap-target flex flex-col items-center justify-center p-2 rounded-lg hover:bg-app-surface2/50 active:bg-app-surface2 transition-colors"
            aria-label="More"
          >
            <MoreHorizontal className="h-6 w-6 text-app-text-muted" />
            <span className="text-xs text-app-text-muted mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Mood Picker Overlay */}
      {showMoodPicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowMoodPicker(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="surface rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-app-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-app-text mb-4 text-center">
              Quick Mood Switch
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood)}
                  className="tap-target p-3 rounded-lg bg-app-surface2/80 hover:bg-app-surface2 transition-colors text-center border border-app-border"
                >
                  <div className="text-sm font-medium text-app-text">
                    {mood.name}
                  </div>
                  <div className="text-xs text-app-text-muted">
                    {mood.duration}m
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodPicker(false)}
              className="w-full mt-4 py-2 text-app-text-muted text-sm"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}