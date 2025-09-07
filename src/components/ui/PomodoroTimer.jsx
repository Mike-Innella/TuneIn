import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePomodoro } from "../../hooks/usePomodoro";
import { useGlobalHotkeys } from "../../hooks/useGlobalHotkeys";
import { SessionTypeSelect } from "./SessionTypeSelect";

export function PomodoroPanel({ showToast, onToggleTheme, onShowHelp }) {
  const P = usePomodoro("Pomodoro");
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

  // Initialize hotkeys
  useGlobalHotkeys({
    onStartPause: handleStartPause,
    onReset: handleReset,
    onStop: handleStop,
    onSessionType: handleSessionType,
    onQuickStart: handleQuickStart,
    onToggleTheme: onToggleTheme,
    onShowHelp: onShowHelp,
    onToggleAutoAdvance: handleToggleAutoAdvance,
    onAdjustDuration: handleAdjustDuration,
    status: { currentType: P.kind }
  });

  return (
    <section className="rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold">Session</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={P.autoAdvance}
            onChange={(e) => P.setAutoAdvance(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Auto-advance
          <span className="text-xs text-gray-500 ml-1">(Ctrl+A)</span>
        </label>
      </div>

      <div className="mt-4">
        <SessionTypeSelect
          value={P.kind}
          onChange={(k) => { P.setKind(k); P.reset(); }}
        />
        <div className="mt-2 flex gap-2 text-xs text-gray-400 justify-center">
          <span>1: Pomodoro</span>
          <span>2: Short Break</span>
          <span>3: Long Break</span>
        </div>
      </div>

      <div className="mt-6 grid place-items-center">
        <div className="relative h-40 w-40">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="rgba(255,255,255,0.1)" 
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
              <div className="text-3xl font-semibold tabular-nums text-white">
                {P.display}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {P.kind}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        {P.status === "running" ? (
          <button
            onClick={P.pause}
            className="h-12 w-12 rounded-full grid place-items-center bg-white/10 border border-white/20 hover:bg-white/20 transition-colors group relative"
            aria-label="Pause (Space)"
            title="Pause (Space)"
          >
            <Pause className="h-5 w-5 text-white" />
          </button>
        ) : P.status === "paused" ? (
          <button
            onClick={P.resume}
            className="h-12 w-12 rounded-full grid place-items-center bg-white text-black shadow hover:bg-white/90 transition-colors group relative"
            aria-label="Resume (Space)"
            title="Resume (Space)"
          >
            <Play className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={P.start}
            className="h-12 w-12 rounded-full grid place-items-center bg-white text-black shadow hover:bg-white/90 transition-colors group relative"
            aria-label="Start (Space)"
            title="Start (Space)"
          >
            <Play className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={P.reset}
          className="h-12 w-12 rounded-full grid place-items-center bg-white/10 border border-white/20 hover:bg-white/20 transition-colors group relative"
          aria-label="Reset (Ctrl+R)"
          title="Reset (Ctrl+R)"
        >
          <RotateCcw className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="mt-4 text-center">
        <div className="text-xs text-gray-400">
          Completed Pomodoros: {P.completedPomodoros}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press <kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Space</kbd> to start/pause, 
          <kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs ml-1">+/-</kbd> to adjust time
        </div>
      </div>
    </section>
  );
}
