import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getConfig } from "../types/session.ts";
import { DURATION_BY_MOOD, DEFAULT_POMODORO_DURATION } from "../lib/focusConfig.js";

export function usePomodoro(initial = "Pomodoro") {
  const [kind, setKind] = useState(initial);
  const [status, setStatus] = useState("idle"); // "idle" | "running" | "paused" | "done"
  const [syncedMood, setSyncedMood] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const tickRef = useRef(null);

  // Calculate initial duration safely
  const initialDuration = useMemo(() => {
    return getConfig(initial).minutes * 60;
  }, [initial]);

  const [secondsLeft, setSecondsLeft] = useState(initialDuration);

  // sync duration when kind changes in idle/done
  useEffect(() => {
    if (status === "idle" || status === "done") {
      // Clear mood sync if switching away from Pomodoro
      if (kind !== "Pomodoro") {
        setSyncedMood(null);
      }
      const duration = (kind === "Pomodoro" && syncedMood) 
        ? syncedMood.duration * 60 
        : getConfig(kind).minutes * 60;
      setSecondsLeft(duration);
    }
  }, [kind, status, syncedMood]);

  const start = useCallback(() => {
    if (status !== "running") setStatus("running");
    window.dispatchEvent(new CustomEvent("session:start", { detail: { kind } }));
  }, [status, kind]);

  // Listen for mood selection events to sync timer duration
  useEffect(() => {
    const handleMoodSelected = (event) => {
      const { mood, duration } = event.detail;
      if (mood && duration && kind === "Pomodoro") {
        setSecondsLeft(duration * 60);
        setSyncedMood({ mood, duration });
        window.dispatchEvent(new CustomEvent("pomodoro:mood-synced", { 
          detail: { mood, duration, kind } 
        }));
      }
    };

    window.addEventListener("mood:selected", handleMoodSelected);
    return () => window.removeEventListener("mood:selected", handleMoodSelected);
  }, [kind]);

  const pause = useCallback(() => {
    if (status === "running") {
      setStatus("paused");
      window.dispatchEvent(new CustomEvent("session:pause", { detail: { kind } }));
    }
  }, [status, kind]);

  const resume = useCallback(() => {
    if (status === "paused") {
      setStatus("running");
      window.dispatchEvent(new CustomEvent("session:resume", { detail: { kind } }));
    }
  }, [status, kind]);

  const reset = useCallback(() => {
    setStatus("idle");
    // Reset to mood duration if synced, otherwise use default pomodoro duration
    const duration = syncedMood ? syncedMood.duration * 60 : getConfig(kind).minutes * 60;
    setSecondsLeft(duration);
  }, [kind, syncedMood]);

  const setMinutes = useCallback((m) => {
    setSecondsLeft(Math.max(1, Math.round(m * 60)));
  }, []);

  // ticker
  useEffect(() => {
    if (status !== "running") {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          tickRef.current = null;
          setStatus("done");
          window.dispatchEvent(new CustomEvent("session:end", { detail: { kind } }));

          // Stop playlist/queue when session ends
          window.dispatchEvent(new CustomEvent("playlist:ended"));

          // update counters, decide next kind
          if (kind === "Pomodoro") {
            setCompletedPomodoros((n) => n + 1);
          }

          return 0;
        }
        // midpoint signal (for prompts later)
        const total = syncedMood ? syncedMood.duration * 60 : getConfig(kind).minutes * 60;
        const nextVal = s - 1;
        if (nextVal === Math.floor(total / 2)) {
          window.dispatchEvent(new CustomEvent("session:midpoint", { detail: { kind } }));
        }

        // Dispatch tick event for session timer integration
        window.dispatchEvent(new CustomEvent("pomodoro:tick", {
          detail: { secondsLeft: nextVal, kind }
        }));

        return nextVal;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [status, kind]);

  // auto-advance logic
  useEffect(() => {
    if (status !== "done" || !autoAdvance) return;
    const decideNext = () => {
      if (kind === "Pomodoro") {
        // every 4th Pomodoro → LongBreak
        const next = ((completedPomodoros + 1) % 4 === 0) ? "LongBreak" : "ShortBreak";
        setKind(next);
        setStatus("idle");
        setSecondsLeft(getConfig(next).minutes * 60);
        return;
      }
      // from breaks → back to work
      setKind("Pomodoro");
      setStatus("idle");
      setSecondsLeft(getConfig("Pomodoro").minutes * 60);
    };
    decideNext();
  }, [status, autoAdvance, kind, completedPomodoros]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = useMemo(() => `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`, [mins, secs]);
  const progress = useMemo(() => {
    const total = syncedMood ? syncedMood.duration * 60 : getConfig(kind).minutes * 60;
    return Math.max(0, Math.min(1, 1 - secondsLeft / total)); // 0..1
  }, [kind, secondsLeft, syncedMood]);

  return {
    kind, setKind,
    status, start, pause, resume, reset,
    autoAdvance, setAutoAdvance,
    secondsLeft, setMinutes,
    mins, secs, display, progress,
    completedPomodoros,
    syncedMood
  };
}
