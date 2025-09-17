import { useCallback, useEffect, useRef, useState } from 'react';

function loadIframeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve();
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    window.onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(tag);
  });
}

export default function useYouTubePlayer() {
  const elRef = useRef(null);         // host div (hidden)
  const playerRef = useRef(null);     // YT.Player instance
  const pollRef = useRef(null);
  const lastVolRef = useRef(60);

  const [apiReady, setApiReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [queue, setQueue] = useState([]);     // [{id,title,artist,artwork}]
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);   // 0..100 for YT
  const [ytMuted, setYtMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // init API
  useEffect(() => {
    let mounted = true;
    loadIframeAPI().then(() => mounted && setApiReady(true));
    return () => { mounted = false; };
  }, []);

  // create player
  useEffect(() => {
    if (!apiReady || !elRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(elRef.current, {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0, // NEVER autoplay; require gesture
        controls: 0,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => setReady(true),
        onStateChange: (e) => {
          // 1=playing, 2=paused, 0=ended
          if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
          if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          if (e.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            next();
          }
        }
      }
    });

    return () => {
      clearInterval(pollRef.current);
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
  }, [apiReady]);

  // progress polling
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!ready || !playerRef.current) return;

    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      const d = p.getDuration?.() || 0;
      const t = p.getCurrentTime?.() || 0;
      if (Number.isFinite(d)) setDuration(d);
      if (Number.isFinite(t)) setCurrentTime(t);
    }, 250);

    return () => clearInterval(pollRef.current);
  }, [ready]);

  const load = useCallback((list, startAt = 0) => {
    setQueue(Array.isArray(list) ? list : []);
    setIndex(startAt || 0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // internal: actually cue current index
  const cueCurrent = useCallback(() => {
    const p = playerRef.current;
    const cur = queue[index];
    if (!p || !cur) return;
    // cue video; do NOT play (gesture needed)
    p.cueVideoById(cur.id);
    // set initial volume/mute
    p.setVolume(volume);
    ytMuted ? p.mute() : p.unMute();
  }, [queue, index, volume, ytMuted]);

  useEffect(() => {
    if (ready) cueCurrent();
  }, [ready, queue, index, cueCurrent]);

  const play = useCallback(() => {
    const p = playerRef.current;
    if (!p || !queue[index]) return;
    // Must be called from a user gesture; browsers will otherwise block
    const st = p.getPlayerState?.();
    if (st === window.YT.PlayerState.UNSTARTED || st === window.YT.PlayerState.CUED) {
      p.playVideo(); // allowed after gesture
    } else {
      p.playVideo();
    }
  }, [index, queue]);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const seek = useCallback((seconds) => {
    const p = playerRef.current;
    if (!p) return;
    const d = p.getDuration?.() || 0;
    const clamped = Math.max(0, Math.min(seconds, d || seconds));
    p.seekTo(clamped, true);
    setCurrentTime(clamped);
  }, []);

  const next = useCallback(() => {
    setIndex(i => {
      const ni = i + 1;
      return ni < queue.length ? ni : 0;
    });
  }, [queue.length]);

  const prev = useCallback(() => {
    setIndex(i => (i > 0 ? i - 1 : Math.max(queue.length - 1, 0)));
  }, [queue.length]);

  const setVol = useCallback((v) => {
    const p = playerRef.current;
    const vv = Math.max(0, Math.min(100, Math.round(v)));
    setVolume(vv);
    lastVolRef.current = vv || lastVolRef.current;
    if (p) p.setVolume(vv);
  }, []);

  const mute = useCallback((m) => {
    const p = playerRef.current;
    setYtMuted(!!m);
    if (!p) return;
    if (m) p.mute();
    else p.unMute();
  }, []);

  // Listen for external pause events (when switching to HTML audio)
  useEffect(() => {
    const handler = () => playerRef.current?.pauseVideo();
    window.addEventListener('yt:pause', handler);
    return () => window.removeEventListener('yt:pause', handler);
  }, []);

  return {
    // host for the player
    elRef,
    // state
    ready,
    apiReady,
    queue,
    index,
    isPlaying,
    volume,
    currentTime,
    duration,
    ytMuted,
    // controls
    load,
    play,
    pause,
    next,
    prev,
    seek,
    setVol,
    mute,
  };
}
