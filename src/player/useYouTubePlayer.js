import { useCallback, useEffect, useRef, useState } from 'react';

export default function useYouTubePlayer() {
  const playerRef = useRef(null);
  const elRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60); // 0..100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pollId, setPollId] = useState(null);
  const [ytMuted, setYtMuted] = useState(false);
  const lastVolRef = useRef(60);

  // Load YT script once and detect when API is ready
  useEffect(() => {
    // @ts-ignore
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }
    
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(s);
    
    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
    // apply initial volume
    try { playerRef.current?.setVolume?.(volume); } catch {}
    // progress polling
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime?.() ?? 0;
        const d = p.getDuration?.() ?? 0;
        setCurrentTime(Number(t) || 0);
        setDuration(Number(d) || 0);
      } catch {}
    }, 250);
    setPollId(id);
  }, [volume]);

  const onStateChange = useCallback((ev) => {
    const s = ev?.data;
    // 1 = playing, 2 = paused, 0 = ended
    if (s === 1) setIsPlaying(true);
    else if (s === 2) setIsPlaying(false);
    else if (s === 0) {
      setIsPlaying(false);
      next();
    }
  }, []);

  useEffect(() => {
    // Create YT iframe player when element mounts AND API is ready
    if (!elRef.current || playerRef.current || !apiReady) return;
    
    try {
      // @ts-ignore
      playerRef.current = new window.YT.Player(elRef.current, {
        height: '0',
        width: '0',
        playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
        events: { onReady: onReady, onStateChange }
      });
    } catch (error) {
      console.warn('[YT] Failed to create player:', error);
    }
    
    return () => {
      if (pollId) clearInterval(pollId);
      try { playerRef.current?.destroy?.(); } catch {}
      playerRef.current = null;
    };
  }, [onReady, onStateChange, pollId, apiReady]); // Use apiReady instead of ready

  const load = useCallback((items, startIndex = 0) => {
    setQueue(Array.isArray(items) ? items : []);
    setIndex(Math.max(0, startIndex));
    setIsPlaying(false); // queue only; no autoplay
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const ensureLoaded = useCallback(() => {
    const p = playerRef.current;
    const track = queue[index];
    if (!p || !track) return;
    const id = track.id || track.videoId || track.youtubeId;
    if (!id) return;
    // If not currently cued/loaded for this id, (re)load
    try { p.loadVideoById({ videoId: id, startSeconds: 0 }); } catch {}
  }, [queue, index]);

  const play = useCallback(() => {
    // User gesture handler should call this
    console.log('[YT] Play called');
    const p = playerRef.current;
    const track = queue[index];
    
    if (!p || !track) {
      console.warn('[YT] No player or track available');
      return;
    }
    
    const id = track.id || track.videoId || track.youtubeId;
    if (!id) {
      console.warn('[YT] No video ID found in track:', track);
      return;
    }
    
    console.log('[YT] Loading and playing video:', id);
    
    try {
      // Load the video and play immediately
      p.loadVideoById({
        videoId: id,
        startSeconds: 0
      });
      
      // The video should auto-play after loading due to user gesture
      // But we can also explicitly call playVideo() after a brief delay
      setTimeout(() => {
        try {
          p.playVideo();
        } catch (err) {
          console.warn('[YT] Failed to play after load:', err);
        }
      }, 100);
      
    } catch (error) {
      console.error('[YT] Failed to load/play video:', error);
    }
  }, [queue, index]);

  const pause = useCallback(() => {
    console.log('[YT] Pause called');
    try { playerRef.current?.pauseVideo?.(); } catch {}
  }, []);

  const seek = useCallback((seconds) => {
    const s = Math.max(0, Number(seconds) || 0);
    console.log(`[YT] Seek to ${s}s`);
    try { playerRef.current?.seekTo?.(s, true); } catch {}
    setCurrentTime(s);
  }, []);

  const setVol = useCallback((v) => {
    const vv = Math.max(0, Math.min(100, Math.floor(v)));
    console.log(`[YT] Volume set to ${vv}`);
    setVolume(vv);
    try { playerRef.current?.setVolume?.(vv); } catch {}
  }, []);

  const mute = useCallback((m) => {
    setYtMuted(!!m);
    if (m) {
      lastVolRef.current = volume || 60;
      setVol(0);
    } else {
      setVol(lastVolRef.current || 60);
    }
  }, [setVol, volume]);

  const next = useCallback(() => {
    setIndex((i) => {
      const ni = i + 1;
      if (ni < queue.length) {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        try {
          const id = queue[ni]?.id || queue[ni]?.videoId || queue[ni]?.youtubeId;
          if (id) playerRef.current?.loadVideoById?.({ videoId: id, startSeconds: 0 });
        } catch {}
        return ni;
      }
      return i; // no-op at end
    });
  }, [queue]);

  const prev = useCallback(() => {
    setIndex((i) => {
      const ni = Math.max(0, i - 1);
      if (ni !== i) {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        try {
          const id = queue[ni]?.id || queue[ni]?.videoId || queue[ni]?.youtubeId;
          if (id) playerRef.current?.loadVideoById?.({ videoId: id, startSeconds: 0 });
        } catch {}
      }
      return ni;
    });
  }, [queue]);

  const current = queue[index];

  return {
    elRef,
    ready,
    queue, index, current,
    isPlaying,
    volume,
    currentTime,
    duration,
    load,
    play,
    pause,
    next,
    prev,
    seek,
    setVol,
    mute,
    ytMuted
  };
}
