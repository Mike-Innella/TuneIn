import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const GlobalAudioContext = createContext(null);

export function GlobalAudioProvider({ children }) {
  const audioRef = useRef(null);
  const [state, setState] = useState({
    sourceType: 'html',
    src: '',
    title: '',
    artist: '',
    artwork: '',
    playing: false,
    muted: false,
    volume: 0.8, // 0..1
    currentTime: 0,
    duration: 0,
    canPlay: false
  });

  useEffect(() => {
    const a = new Audio();
    a.preload = 'metadata';
    a.crossOrigin = 'anonymous';

    const onLoaded = () => setState(s => ({ ...s, duration: a.duration || 0, canPlay: true }));
    const onTime = () => setState(s => ({ ...s, currentTime: a.currentTime || 0 }));
    const onEnded = () => setState(s => ({ ...s, playing: false }));
    const onPlay = () => setState(s => ({ ...s, playing: true }));
    const onPause = () => setState(s => ({ ...s, playing: false }));

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnded);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);

    audioRef.current = a;
    return () => {
      a.pause();
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = state.muted;
    audioRef.current.volume = state.volume;
  }, [state.muted, state.volume]);

  const load = useCallback(({ src, title, artist, artwork, sourceType = 'html' }) => {
    const a = audioRef.current;
    if (!a) return;
    setState(s => ({
      ...s,
      sourceType,
      src: src || '',
      title: title || '',
      artist: artist || '',
      artwork: artwork || '',
      playing: false,
      canPlay: false,
      currentTime: 0,
      duration: 0
    }));
    a.src = src || '';
    a.load(); // do not autoplay here
  }, []);

  const play = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    console.log('[HTML5] Play called');
    try {
      await a.play(); // must be from user gesture
    } catch (err) {
      console.warn('HTML5 play() blocked:', err?.message);
    }
  }, []);

  const pause = useCallback(() => {
    console.log('[HTML5] Pause called');
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((seconds) => {
    const a = audioRef.current;
    if (!a) return;
    const s = Math.max(0, Number(seconds) || 0);
    console.log(`[HTML5] Seek to ${s}s`);
    a.currentTime = Math.min(s, Number.isFinite(a.duration) ? a.duration : s);
  }, []);

  const setVolume = useCallback((v) => {
    const vv = Math.max(0, Math.min(1, Number(v)));
    console.log(`[HTML5] Volume set to ${vv}`);
    setState(s => ({ ...s, volume: vv }));
  }, []);

  const setMuted = useCallback((m) => {
    setState(s => ({ ...s, muted: !!m }));
  }, []);

  const value = useMemo(() => ({
    state,
    load,
    play,
    pause,
    seek,
    setVolume,
    setMuted
  }), [state, load, play, pause, seek, setVolume, setMuted]);

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
