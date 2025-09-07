import { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  Prompt, 
  PromptPack, 
  PromptSettings, 
  ActivePrompt, 
  PromptPosition, 
  PromptType, 
  Mood,
  PromptContext 
} from '../types/prompts';
import { promptStorage } from '../lib/prompt-storage';
import { promptSelector } from '../lib/prompt-selector';
import { initializeSeedData } from '../data/seed-prompts';

interface UsePromptsOptions {
  mood: Mood;
  sessionDuration: number; // in minutes
  isSessionActive: boolean;
  isPlaying: boolean;
  timeRemaining: number; // in seconds
}

interface UsePromptsReturn {
  // State
  currentPrompt: ActivePrompt | null;
  isVisible: boolean;
  isExpanded: boolean;
  
  // Actions
  show: () => void;
  hide: () => void;
  expand: () => void;
  collapse: () => void;
  next: () => Promise<void>;
  snooze: (minutes?: number) => void;
  copy: () => Promise<void>;
  speakPrompt: () => Promise<void>;
  
  // Settings
  settings: PromptSettings;
  updateSettings: (newSettings: Partial<PromptSettings>) => Promise<void>;
  
  // Data
  packs: PromptPack[];
  reloadPacks: () => Promise<void>;
}

export function usePrompts(options: UsePromptsOptions): UsePromptsReturn {
  const { mood, sessionDuration, isSessionActive, isPlaying, timeRemaining } = options;

  // State
  const [currentPrompt, setCurrentPrompt] = useState<ActivePrompt | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<PromptSettings>({
    manualEnabled: true,
    emergentEnabled: true,
    guidedEnabled: true,
    emergentIntensity: "standard",
    ttsEnabled: false,
    defaultTechniques: {},
  });
  const [packs, setPacks] = useState<PromptPack[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  // Refs for tracking
  const lastMidpointTriggered = useRef<boolean>(false);
  const distractionTimeout = useRef<NodeJS.Timeout | null>(null);
  const visibilityHiddenTime = useRef<number | null>(null);
  const interruptionCount = useRef<number>(0);
  const skipCount = useRef<number>(0);

  // Initialize data on mount
  useEffect(() => {
    const initialize = async () => {
      await initializeSeedData();
      await loadSettings();
      await loadPacks();
      await loadRecentPrompts();
    };
    initialize();
  }, []);

  // Load data functions
  const loadSettings = async () => {
    try {
      const loadedSettings = await promptStorage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load prompt settings:', error);
    }
  };

  const loadPacks = async () => {
    try {
      const loadedPacks = await promptStorage.getPromptPacks();
      setPacks(loadedPacks);
    } catch (error) {
      console.error('Failed to load prompt packs:', error);
    }
  };

  const loadRecentPrompts = async () => {
    try {
      const recent = await promptStorage.getRecentPrompts();
      setRecentPrompts(recent);
    } catch (error) {
      console.error('Failed to load recent prompts:', error);
    }
  };

  // Session lifecycle effects
  useEffect(() => {
    if (!isSessionActive) {
      lastMidpointTriggered.current = false;
      interruptionCount.current = 0;
      skipCount.current = 0;
      setCurrentPrompt(null);
      setIsVisible(false);
      setIsExpanded(false);
      return;
    }

    // Session start prompt
    if (isSessionActive && timeRemaining === sessionDuration * 60) {
      triggerPrompt('start');
    }
  }, [isSessionActive, sessionDuration, timeRemaining]);

  // Midpoint detection
  useEffect(() => {
    if (!isSessionActive) return;

    const totalSeconds = sessionDuration * 60;
    const elapsedSeconds = totalSeconds - timeRemaining;
    const midpoint = totalSeconds / 2;

    if (elapsedSeconds >= midpoint && !lastMidpointTriggered.current) {
      lastMidpointTriggered.current = true;
      triggerPrompt('mid');
    }
  }, [timeRemaining, sessionDuration, isSessionActive]);

  // Session end detection
  useEffect(() => {
    if (!isSessionActive && lastMidpointTriggered.current) {
      // Session just ended
      triggerPrompt('end');
      lastMidpointTriggered.current = false;
    }
  }, [isSessionActive]);

  // Pause detection for distraction prompts
  useEffect(() => {
    if (!isSessionActive) return;

    if (!isPlaying) {
      // Started pausing
      const pauseStart = Date.now();
      const timeout = setTimeout(() => {
        triggerPrompt('distraction');
        interruptionCount.current += 1;
      }, 30000); // 30 seconds

      distractionTimeout.current = timeout;
    } else {
      // Resumed playing
      if (distractionTimeout.current) {
        clearTimeout(distractionTimeout.current);
        distractionTimeout.current = null;
      }
    }

    return () => {
      if (distractionTimeout.current) {
        clearTimeout(distractionTimeout.current);
        distractionTimeout.current = null;
      }
    };
  }, [isPlaying, isSessionActive]);

  // Document visibility tracking for distraction detection
  useEffect(() => {
    if (!isSessionActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityHiddenTime.current = Date.now();
      } else if (visibilityHiddenTime.current) {
        const hiddenDuration = Date.now() - visibilityHiddenTime.current;
        if (hiddenDuration > 10000) { // 10 seconds
          triggerPrompt('distraction');
          interruptionCount.current += 1;
        }
        visibilityHiddenTime.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSessionActive]);

  // Core prompt selection and triggering
  const triggerPrompt = useCallback(async (position: PromptPosition) => {
    // Check if current prompt is snoozed
    if (currentPrompt?.snoozedUntil && Date.now() < currentPrompt.snoozedUntil) {
      return;
    }

    // Build context
    const context: PromptContext = {
      mood,
      sessionDuration,
      elapsedTime: sessionDuration * 60 - timeRemaining,
      isPaused: !isPlaying,
      interruptionCount: interruptionCount.current,
      skipCount: skipCount.current,
      recentPrompts
    };

    // Try to get prompt for each enabled type
    let selectedPrompt: Prompt | null = null;
    const enabledTypes: PromptType[] = [];
    
    if (settings.manualEnabled) enabledTypes.push('manual');
    if (settings.emergentEnabled) enabledTypes.push('emergent');
    if (settings.guidedEnabled) enabledTypes.push('guided');

    // Try each type in priority order
    for (const type of enabledTypes) {
      const selectionOptions = {
        type,
        mood,
        position,
        recentPrompts,
        packs,
        settings
      };

      selectedPrompt = promptSelector.selectPrompt(selectionOptions);
      if (selectedPrompt) break;
    }

    // Fallback to built-in prompts
    if (!selectedPrompt) {
      selectedPrompt = promptSelector.getFallbackPrompt(position, mood);
    }

    if (selectedPrompt) {
      const activePrompt: ActivePrompt = {
        prompt: selectedPrompt,
        position,
        timestamp: Date.now()
      };

      setCurrentPrompt(activePrompt);
      setIsVisible(true);
      
      // Update recent prompts
      const updatedRecent = [selectedPrompt.id, ...recentPrompts.filter(id => id !== selectedPrompt.id)].slice(0, 5);
      setRecentPrompts(updatedRecent);
      await promptStorage.addRecentPrompt(selectedPrompt.id);

      // Log telemetry
      await promptStorage.logTelemetry({
        type: selectedPrompt.type,
        id: selectedPrompt.id,
        mood,
        position,
        action: 'shown',
        timestamp: Date.now()
      });

      // Auto-show for 10 seconds, then fade to pill view
      setTimeout(() => {
        if (isExpanded) setIsExpanded(false);
      }, 10000);
    }
  }, [mood, sessionDuration, timeRemaining, isPlaying, recentPrompts, packs, settings, currentPrompt, isExpanded]);

  // Actions
  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setIsExpanded(false);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const next = useCallback(async () => {
    if (!currentPrompt) return;

    skipCount.current += 1;
    
    // Log telemetry
    await promptStorage.logTelemetry({
      type: currentPrompt.prompt.type,
      id: currentPrompt.prompt.id,
      mood,
      position: currentPrompt.position,
      action: 'next',
      timestamp: Date.now()
    });

    // Get another prompt of the same position
    await triggerPrompt(currentPrompt.position);
  }, [currentPrompt, mood, triggerPrompt]);

  const snooze = useCallback(async (minutes: number = 10) => {
    if (!currentPrompt) return;

    const snoozedPrompt: ActivePrompt = {
      ...currentPrompt,
      snoozedUntil: Date.now() + (minutes * 60 * 1000)
    };

    setCurrentPrompt(snoozedPrompt);
    setIsVisible(false);
    setIsExpanded(false);

    // Log telemetry
    await promptStorage.logTelemetry({
      type: currentPrompt.prompt.type,
      id: currentPrompt.prompt.id,
      mood,
      position: currentPrompt.position,
      action: 'snooze',
      timestamp: Date.now()
    });
  }, [currentPrompt, mood]);

  const copy = useCallback(async () => {
    if (!currentPrompt) return;

    try {
      await navigator.clipboard.writeText(currentPrompt.prompt.text);
      
      // Log telemetry
      await promptStorage.logTelemetry({
        type: currentPrompt.prompt.type,
        id: currentPrompt.prompt.id,
        mood,
        position: currentPrompt.position,
        action: 'copy',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to copy prompt text:', error);
    }
  }, [currentPrompt, mood]);

  const speakPrompt = useCallback(async () => {
    if (!currentPrompt || !settings.ttsEnabled) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    try {
      // Cancel any existing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(currentPrompt.prompt.text);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;

      speechSynthesis.speak(utterance);

      // Log telemetry
      await promptStorage.logTelemetry({
        type: currentPrompt.prompt.type,
        id: currentPrompt.prompt.id,
        mood,
        position: currentPrompt.position,
        action: 'tts',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to speak prompt:', error);
    }
  }, [currentPrompt, settings.ttsEnabled, mood]);

  const updateSettings = useCallback(async (newSettings: Partial<PromptSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      await promptStorage.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save prompt settings:', error);
    }
  }, [settings]);

  const reloadPacks = useCallback(async () => {
    await loadPacks();
  }, []);

  return {
    // State
    currentPrompt,
    isVisible,
    isExpanded,
    
    // Actions
    show,
    hide,
    expand,
    collapse,
    next,
    snooze,
    copy,
    speakPrompt,
    
    // Settings
    settings,
    updateSettings,
    
    // Data
    packs,
    reloadPacks
  };
}
