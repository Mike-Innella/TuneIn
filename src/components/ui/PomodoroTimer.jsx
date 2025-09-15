import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePomodoro } from "../../hooks/usePomodoro";
import { useGlobalHotkeys } from "../../hooks/useGlobalHotkeys";
import { useIsMobile } from "../../hooks/use-mobile";
import { SessionTypeSelect } from "./SessionTypeSelect";

export function PomodoroPanel({ showToast, onToggleTheme, onShowHelp }) {
  const P = usePomodoro("Pomodoro");
  const isMobile = useIsMobile();
  const ringDash = 283; // ~2πr for r≈45
  const dash = Math.max(0.001, P.progress) * ringDash;

  // Hotkey handlers
  const handleStartPause = () => {
    if (P.status === "running") {
      P.pause();
      showToast?.("Timer paused");
    } else if (P.status === "paused") {
      P.resume();
      showToast?.("Timer resumed");
    } else {
      P.start();
      showToast?.("Timer started");
    }
  };

  const handleReset = (forceReset = false) => {
    P.reset();
    if (forceReset) {
      // Reset completed pomodoros count for force reset
      showToast?.("Timer force reset - all progress cleared");
    } else {
      showToast?.("Timer reset");
    }
  };

  const handleStop = () => {
    if (P.status !== "idle") {
      P.reset();
      showToast?.("Session stopped");
    }
  };

  const handleSessionType = (sessionKind) => {
    P.setKind(sessionKind);
    P.reset();
    showToast?.(`Switched to ${sessionKind}`);
  };

  const handleQuickStart = (sessionKind) => {
    P.setKind(sessionKind);
    P.reset();
    setTimeout(() => {
      P.start();
      showToast?.(`${sessionKind} session started`);
    }, 100);
  };

  const handleToggleAutoAdvance = () => {
    P.setAutoAdvance(!P.autoAdvance);
    showToast?.(`Auto-advance ${!P.autoAdvance ? 'enabled' : 'disabled'}`);
  };

  const handleAdjustDuration = (minutes) => {
    const currentMinutes = Math.floor(P.secondsLeft / 60);
    const newMinutes = Math.max(1, currentMinutes + minutes);
    P.setMinutes(newMinutes);
    showToast?.(`Duration ${minutes > 0 ? 'increased' : 'decreased'} to ${newMinutes} minutes`);
  };

  // Initialize hotkeys (disabled on mobile)
  useGlobalHotkeys({
    onStartPause: !isMobile ? handleStartPause : () => {},
    onReset: !isMobile ? handleReset : () => {},
    onStop: !isMobile ? handleStop : () => {},
    onSessionType: !isMobile ? handleSessionType : () => {},
    onQuickStart: !isMobile ? handleQuickStart : () => {},
    onToggleTheme: !isMobile ? onToggleTheme : () => {},
    onShowHelp: !isMobile ? onShowHelp : () => {},
    onToggleAutoAdvance: !isMobile ? handleToggleAutoAdvance : () => {},
    onAdjustDuration: !isMobile ? handleAdjustDuration : () => {},
    status: { currentType: P.kind }
  });

  return (
    <section className={`rounded-2xl surface border border-app-border shadow-md ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className={`font-semibold text-app-text ${isMobile ? 'text-lg' : 'text-base'}`}>Session</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer text-app-muted hover:text-app-text transition-colors">
          <input
            type="checkbox"
            checked={P.autoAdvance}
            onChange={(e) => P.setAutoAdvance(e.target.checked)}
            className="rounded border-app-border text-app-primary focus:ring-app-primary focus:border-app-primary"
          />
          Auto-advance
          {!isMobile && <span className="kbd-shortcut hidden md:inline ml-1">(Ctrl+A)</span>}
        </label>
      </div>

      <div className="mt-4">
        <SessionTypeSelect
          value={P.kind}
          onChange={(k) => { P.setKind(k); P.reset(); }}
        />
        {!isMobile && (
          <div className="mt-2 flex gap-2 text-xs text-app-muted justify-center md:flex hidden">
            <span className="kbd-shortcut">1: Pomodoro</span>
            <span className="kbd-shortcut">2: Short Break</span>
            <span className="kbd-shortcut">3: Long Break</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid place-items-center">
        <div className={`relative ${isMobile ? 'h-48 w-48' : 'h-40 w-40'}`}>
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              className="stroke-gray-300 dark:stroke-slate-700"
              strokeWidth="6"
            />
            <motion.circle
              cx="50" cy="50" r="45" 
              fill="none"
              stroke="rgb(59, 130, 246)" 
              strokeWidth="6" 
              strokeLinecap="round"
              strokeDasharray={`${dash} ${ringDash}`}
              initial={false}
              animate={{ strokeDasharray: `${dash} ${ringDash}` }}
              transition={{ duration: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className={`font-semibold tabular-nums text-app-text ${isMobile ? 'text-4xl' : 'text-3xl'}`}>
                {P.display}
              </div>
              <div className={`text-app-muted mt-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                {P.syncedMood ? `${P.syncedMood.mood} (${P.syncedMood.duration}m)` : P.kind}
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="mt-4 text-center">
        <div className="text-sm text-app-text">
          Completed Pomodoros: {P.completedPomodoros}
        </div>
        {!isMobile && (
          <div className="text-xs text-app-muted mt-1 hidden md:block">
            Press <kbd className="kbd-shortcut">Space</kbd> to start/pause, 
            <kbd className="kbd-shortcut ml-1">+/-</kbd> to adjust time
          </div>
        )}
      </div>
    </section>
  );
}
