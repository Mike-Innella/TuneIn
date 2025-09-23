import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const GlobalAudioContext = createContext(null);

export function GlobalAudioProvider({ children }) {
  const audioRef = useRef(null);
  const userInteractedRef = useRef(false);
  const audioCtxRef = useRef(null);
  const [state, setState] = useState({
    sourceType: 'html',       // 'html' | 'youtube'
    src: '',
    title: '',
    artist: '',
    artwork: '',
    playing: false,
    muted: false,
    volume: 0.8,              // 0..1 for HTML5
    currentTime: 0,
    duration: 0
  });

  // Create audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const el = document.createElement('audio');
      el.preload = 'auto';
      el.crossOrigin = 'anonymous'; // safe default
      el.addEventListener('timeupdate', () =>
        setState(s => ({ ...s, currentTime: el.currentTime || 0 }))
      );
      el.addEventListener('durationchange', () =>
        setState(s => ({ ...s, duration: isFinite(el.duration) ? el.duration : 0 }))
      );
      el.addEventListener('ended', () =>
        setState(s => ({ ...s, playing: false }))
      );
      el.addEventListener('pause', () =>
        setState(s => ({ ...s, playing: false }))
      );
      el.addEventListener('play', () =>
        setState(s => ({ ...s, playing: true }))
      );
      audioRef.current = el;
      document.body.appendChild(el); // keep off-DOM UI
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onFirstGesture = async () => {
      userInteractedRef.current = true;
      try {
        if (!audioCtxRef.current) {
          const C = window.AudioContext || window.webkitAudioContext;
          if (C) audioCtxRef.current = new C();
        }
        await audioCtxRef.current?.resume?.();
      } catch {}
      window.removeEventListener('pointerdown', onFirstGesture, { capture: true });
      window.removeEventListener('keydown', onFirstGesture, { capture: true });
      window.removeEventListener('touchstart', onFirstGesture, { capture: true });
    };
    window.addEventListener('pointerdown', onFirstGesture, { capture: true, once: true });
    window.addEventListener('keydown', onFirstGesture, { capture: true, once: true });
    window.addEventListener('touchstart', onFirstGesture, { capture: true, once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture, { capture: true });
      window.removeEventListener('keydown', onFirstGesture, { capture: true });
      window.removeEventListener('touchstart', onFirstGesture, { capture: true });
    };
  }, []);

  const load = useCallback((src, meta = {}) => {
    const el = audioRef.current;
    if (!el) return;

    // Pause YouTube when loading HTML audio
    window.dispatchEvent(new CustomEvent('yt:pause'));

    el.src = src || '';
    el.load();
    setState(s => ({
      ...s,
      sourceType: 'html',
      src,
      title: meta.title || '',
      artist: meta.artist || '',
      artwork: meta.artwork || '',
      currentTime: 0,
      duration: 0,
      playing: false
    }));
  }, []);

  const play = useCallback(async () => {
    if (!userInteractedRef.current) return; // wait for a gesture (autoplay policy)
    const el = audioRef.current;
    if (!el) return;
    // Must be called from a user gesture to satisfy autoplay rules
    await el.play().catch(() => {}); // swallow DOMException if blocked
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setState(s => ({ ...s, playing: false, currentTime: 0 }));
  }, []);

  const seek = useCallback((seconds) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(seconds, el.duration || seconds));
    setState(s => ({ ...s, currentTime: el.currentTime }));
  }, []);

  const setVolume = useCallback((vol01) => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, vol01));
    setState(s => ({ ...s, volume: el.volume, muted: el.muted }));
  }, []);

  const setMuted = useCallback((m) => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !!m;
    setState(s => ({ ...s, muted: el.muted }));
  }, []);

  const setSourceType = useCallback((sourceType) => {
    setState(s => ({ ...s, sourceType }));
  }, []);

  // Enforce single active source - pause HTML when switching to YouTube
  useEffect(() => {
    if (state.sourceType === 'youtube') {
      audioRef.current?.pause();
    }
  }, [state.sourceType]);

  // Listen for source type changes from external events
  useEffect(() => {
    function onSetSource(e) {
      const srcType = e.detail; // 'youtube' | 'html'
      setSourceType(srcType);
      if (srcType === 'youtube') {
        // Pause HTML audio when switching to YouTube
        audioRef.current?.pause();
      }
    }
    window.addEventListener('audio:set_source', onSetSource);
    return () => window.removeEventListener('audio:set_source', onSetSource);
  }, [setSourceType]);

  // Listen for audio control events (like stop)
  useEffect(() => {
    function onAudioControl(e) {
      const { action } = e.detail;
      if (action === 'stop') {
        stop();
      }
    }
    window.addEventListener('audio:control', onAudioControl);
    return () => window.removeEventListener('audio:control', onAudioControl);
  }, [stop]);

  const value = useMemo(() => ({
    state, load, play, pause, stop, seek, setVolume, setMuted, setSourceType
  }), [state, load, play, pause, stop, seek, setVolume, setMuted, setSourceType]);

  return (
    <GlobalAudioContext.Provider value={value}>
      {children}
    </GlobalAudioContext.Provider>
  );
}

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within GlobalAudioProvider');
  }
  return context;
};
