import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, User, Home, Timer as TimerIcon, MoreHorizontal, Music2 } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function MobileCommandBar({ onSetMood, onSetDuration, onOpenProfile }) {
  const [sheet, setSheet] = useState(null); // "moods" | "timer" | "more"
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Spacer so content doesn't hide behind the bar */}
      <div className="h-20 md:hidden" />

      {/* Bottom Command Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[9998] md:hidden">
        <div className="mx-4 mb-4 rounded-2xl border border-app-border bg-app-surface/90 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-around py-2">
            <CommandButton icon={Home} label="Home" onClick={() => setSheet(null)} />
            <CommandButton icon={Music2} label="Moods" onClick={() => setSheet("moods")} />
            <CommandButton icon={TimerIcon} label="Timer" onClick={() => setSheet("timer")} />
            <CommandButton icon={MoreHorizontal} label="More" onClick={() => setSheet("more")} />
          </div>
        </div>
      </div>

      {/* Bottom Sheets */}
      <AnimatePresence>
        {sheet && (
          <BottomSheet onClose={() => setSheet(null)}>
            {sheet === "moods" && (
              <MoodPicker
                onPick={(mood) => {
                  onSetMood?.(mood);
                  setSheet("timer");
                }}
              />
            )}
            {sheet === "timer" && (
              <TimerPicker
                onPick={(duration) => {
                  onSetDuration?.(duration);
                  setSheet(null);
                }}
              />
            )}
            {sheet === "more" && (
              <MoreMenu
                theme={theme}
                onToggleTheme={toggleTheme}
                onOpenProfile={() => {
                  onOpenProfile?.();
                  setSheet(null);
                }}
              />
            )}
          </BottomSheet>
        )}
      </AnimatePresence>
    </>
  );
}

function CommandButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 p-2">
      <Icon className="h-5 w-5 text-app-text" aria-hidden />
      <span className="text-xs text-app-muted">{label}</span>
    </button>
  );
}

function BottomSheet({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] md:hidden"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-app-border bg-app-surface/95 backdrop-blur-xl shadow-2xl"
        style={{ zIndex: 10000 }}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-app-border" />
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function MoodPicker({ onPick }) {
  const moods = [
    { name: "Deep Work", emoji: "🎯" },
    { name: "Creative Flow", emoji: "🎨" },
    { name: "Light Focus", emoji: "☁️" },
    { name: "Learning", emoji: "📚" },
    { name: "Meditation", emoji: "🧘" },
    { name: "Energy Boost", emoji: "⚡" },
    { name: "Break", emoji: "☕" },
  ];

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-app-text">Choose your mood</h3>
      <div className="grid grid-cols-2 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => onPick?.(mood.name)}
            className="rounded-2xl border border-app-border bg-app-surface2 p-4 text-center hover:border-app-primary/50 hover:bg-app-surface2/80"
          >
            <div className="text-2xl mb-2">{mood.emoji}</div>
            <div className="text-sm font-medium text-app-text">{mood.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TimerPicker({ onPick }) {
  const presets = [15, 25, 45, 60, 90];
  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-app-text">Set timer duration</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {presets.map((min) => (
            <button
              key={min}
              onClick={() => onPick?.(min)}
              className="rounded-2xl border border-app-border bg-app-surface2 py-4 text-center hover:border-app-primary/50 hover:bg-app-surface2/80"
            >
              <div className="text-xl font-bold text-app-text">{min}m</div>
            </button>
          ))}
        </div>
        <CustomDuration onPick={onPick} />
      </div>
    </div>
  );
}

function CustomDuration({ onPick }) {
  const [value, setValue] = useState(30);
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={240}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-24 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text"
      />
      <button
        onClick={() => onPick?.(value)}
        className="px-4 py-2 rounded-xl bg-app-primary text-app-primary-fg font-medium hover:bg-app-primary/90"
      >
        Set
      </button>
    </div>
  );
}

function MoreMenu({ theme, onToggleTheme, onOpenProfile }) {
  return (
    <div className="p-4 space-y-3">
      <h3 className="mb-4 text-lg font-semibold text-app-text">More options</h3>
      <QuickTile
        icon={theme === "dark" ? Sun : Moon}
        label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={onToggleTheme}
      />
      <QuickTile
        icon={User}
        label="Profile"
        onClick={onOpenProfile}
      />
    </div>
  );
}

function QuickTile({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface2 p-4 hover:border-app-primary/50 hover:bg-app-surface2/80 w-full"
    >
      <Icon className="h-5 w-5 text-app-text" aria-hidden />
      <span className="text-sm font-medium text-app-text">{label}</span>
    </button>
  );
}

