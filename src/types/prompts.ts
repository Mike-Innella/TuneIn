export type Mood = "DeepWork" | "CreativeFlow" | "LightFocus" | "Learning" | "Meditation" | "EnergyBoost";

export type PromptType = "manual" | "emergent" | "guided";

export type SessionEvent = 
  | "session:start" 
  | "session:tick" 
  | "session:pause" 
  | "session:resume" 
  | "session:midpoint" 
  | "session:end" 
  | "player:skip" 
  | "visibility:hidden" 
  | "visibility:visible";

export type PromptPosition = "start" | "mid" | "distraction" | "end";

export interface Prompt {
  id: string;
  type: PromptType;
  mood?: Mood[];           // which moods it applies to
  title?: string;
  text: string;            // markdown allowed
  tags?: string[];         // e.g., ["breathing","single-task"]
  weight?: number;         // for weighted random selection (default: 1)
}

export interface PromptPack {
  id: string;
  name: string;
  type: PromptType;        // all items share type
  items: Prompt[];
  enabled: boolean;
  defaultFor?: Mood[];     // auto-on for these moods
}

export interface PromptSettings {
  manualEnabled: boolean;
  emergentEnabled: boolean;
  guidedEnabled: boolean;
  emergentIntensity: "low" | "standard" | "high";
  ttsEnabled: boolean;
  defaultTechniques: Partial<Record<Mood, string>>; // technique ID per mood
}

export interface PromptContext {
  mood: Mood;
  sessionDuration: number; // in minutes
  elapsedTime: number;     // in seconds
  isPaused: boolean;
  interruptionCount: number;
  skipCount: number;
  recentPrompts: string[]; // recent prompt IDs for cooldown
}

export interface ActivePrompt {
  prompt: Prompt;
  position: PromptPosition;
  timestamp: number;
  snoozedUntil?: number;
}

export interface PromptTelemetry {
  type: PromptType;
  id: string;
  mood: Mood;
  position: PromptPosition;
  action: "shown" | "next" | "snooze" | "tts" | "copy";
  timestamp: number;
}
