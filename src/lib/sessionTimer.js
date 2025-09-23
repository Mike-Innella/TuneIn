// sessionTimer.js
// Global session timer that integrates with queue manager and Pomodoro timer

let sessionRemaining = 0;
let sessionActive = false;

export function setSessionRemaining(seconds) {
  if (typeof seconds === 'number' && !isNaN(seconds)) {
    sessionRemaining = Math.max(0, seconds);
  } else {
    console.warn('[SessionTimer] Invalid seconds value:', seconds);
  }
}

export function getSessionRemaining() {
  return sessionRemaining;
}

export function setSessionActive(active) {
  sessionActive = active;
}

export function isSessionActive() {
  return sessionActive;
}

// Initialize session timer integration
export function initializeSessionTimer() {
  // Listen for session events from Pomodoro timer
  window.addEventListener('session:start', (e) => {
    sessionActive = true;
    console.log('[SessionTimer] Session started');
  });

  window.addEventListener('session:pause', (e) => {
    console.log('[SessionTimer] Session paused');
  });

  window.addEventListener('session:resume', (e) => {
    console.log('[SessionTimer] Session resumed');
  });

  window.addEventListener('session:end', (e) => {
    sessionActive = false;
    sessionRemaining = 0;
    console.log('[SessionTimer] Session ended');
  });

  window.addEventListener('session:stop', (e) => {
    sessionActive = false;
    sessionRemaining = 0;
    console.log('[SessionTimer] Session stopped');
  });

  // Listen for mood selection to set initial session duration
  window.addEventListener('mood:selected', (e) => {
    const { duration } = e.detail;
    if (duration) {
      sessionRemaining = duration * 60; // Convert minutes to seconds
      console.log('[SessionTimer] Session duration set to', sessionRemaining, 'seconds');
    }
  });

  // Listen for session time updates (from Pomodoro timer)
  window.addEventListener('pomodoro:tick', (e) => {
    const { secondsLeft } = e.detail || {};
    if (typeof secondsLeft === 'number') {
      sessionRemaining = secondsLeft;
    }
  });

  console.log('[SessionTimer] Initialized');
}

// Cleanup function
export function cleanupSessionTimer() {
  sessionRemaining = 0;
  sessionActive = false;
}