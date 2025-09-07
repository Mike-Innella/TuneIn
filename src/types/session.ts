export type SessionKind = "Pomodoro" | "ShortBreak" | "LongBreak";

export interface SessionConfig {
  kind: SessionKind;
  label: string;
  minutes: number;
}

export const SESSION_PRESETS: SessionConfig[] = [
  { kind: "Pomodoro",   label: "Focus (25)",     minutes: 25 },
  { kind: "ShortBreak", label: "Short Break (5)",minutes: 5  },
  { kind: "LongBreak",  label: "Long Break (15)",minutes: 15 },
];

export const getConfig = (kind: SessionKind) =>
  SESSION_PRESETS.find((s) => s.kind === kind)!;
