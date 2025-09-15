import { useEffect, useRef, useState, useCallback } from 'react';

export function useYouTubePlayer() {
  const playerRef = useRef(null);
  const elRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem('player.volume');
    return v ? Number(v) : 40;
  });

  // Load YT script once
  useEffect(() => {
    if (window.YT?.Player) return;
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(s);
    window.onYouTubeIframeAPIReady = () => { /* no-op here, we init later */ };
  }, []);

  // Initialize player when container arrives + script ready
  useEffect(() => {
    let interval;
    if (!elRef.current) return;

    const init = () => {
      if (playerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(elRef.current, {
        height: '0', width: '0', // invisible but controllable
        playerVars: {
          playsinline: 1, controls: 0, disablekb: 1, rel: 0, modestbranding: 1,
        },
        events: {
          onReady: () => {
            playerRef.current.setVolume(volume);
            setReady(true);
          },
          onStateChange: (e) => {
            // 1=playing, 2=paused, 0=ended
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2) setIsPlaying(false);
            if (e.data === 0) next(); // auto advance
          }
        },
      });
    };

    // Poll until YT is ready
    interval = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(interval);
        init();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [volume]);

  const load = useCallback((tracks, startAt = 0) => {
    setQueue(tracks);
    setIndex(startAt);
    if (tracks[startAt]) {
      playerRef.current?.loadVideoById(tracks[startAt].id);
      playerRef.current?.setVolume(volume);
      setIsPlaying(true);
    }
  }, [volume]);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const seek = useCallback((seconds) => {
    const t = Math.max(0, (playerRef.current?.getCurrentTime?.() ?? 0) + seconds);
    playerRef.current?.seekTo(t, true);
  }, []);

  const setVol = useCallback((v) => {
    const clamped = Math.min(100, Math.max(0, v));
    localStorage.setItem('player.volume', String(clamped));
    setVolume(clamped);
    playerRef.current?.setVolume(clamped);
  }, []);

  const next = useCallback(() => {
    const nxt = index + 1;
    if (nxt < queue.length) {
      setIndex(nxt);
      playerRef.current?.loadVideoById(queue[nxt].id);
      setIsPlaying(true);
    }
  }, [index, queue]);

  const prev = useCallback(() => {
    const p = Math.max(0, index - 1);
    setIndex(p);
    if (queue[p]) {
      playerRef.current?.loadVideoById(queue[p].id);
      setIsPlaying(true);
    }
  }, [index, queue]);

  return {
    elRef,
    ready,
    queue, index, isPlaying, volume,
    load, play, pause, next, prev, seek, setVol,
    current: queue[index],
  };
}