// Mobile UI state persistence
const STORAGE_KEY = 'tunein-mobile-ui-state';

const defaultState = {
  gesturesEnabled: true,
  lastMood: 'Deep Work',
  lastTimerDuration: 25,
  volume: 50,
  playerExpanded: false,
  moodSheetOpen: false,
  moreSheetOpen: false,
};

// Safe localStorage access
const getStoredState = () => {
  if (typeof window === 'undefined') return defaultState;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
  } catch (error) {
    console.warn('Failed to load UI state:', error);
    return defaultState;
  }
};

const setStoredState = (state) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save UI state:', error);
  }
};

// State management hook
import { useState, useCallback, useEffect } from 'react';

export function useUIState() {
  const [state, setState] = useState(getStoredState);

  const updateState = useCallback((updates) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      setStoredState(newState);
      return newState;
    });
  }, []);

  // Hydrate state on mount to avoid SSR issues
  useEffect(() => {
    setState(getStoredState());
  }, []);

  return [state, updateState];
}

export const UI_ACTIONS = {
  SET_GESTURES_ENABLED: 'SET_GESTURES_ENABLED',
  SET_LAST_MOOD: 'SET_LAST_MOOD',
  SET_LAST_TIMER_DURATION: 'SET_LAST_TIMER_DURATION',
  SET_VOLUME: 'SET_VOLUME',
  SET_PLAYER_EXPANDED: 'SET_PLAYER_EXPANDED',
  SET_MOOD_SHEET_OPEN: 'SET_MOOD_SHEET_OPEN',
  SET_MORE_SHEET_OPEN: 'SET_MORE_SHEET_OPEN',
};