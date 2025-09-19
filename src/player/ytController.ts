// src/player/ytController.ts
// A small, robust singleton wrapper around the YouTube IFrame API.

type SubFn = (s: { currentTime: number; duration: number; playing: boolean }) => void;

let player: YT.Player | null = null;
let ready = false;
let pollId: number | null = null;
let sub: SubFn | null = null;

function ensureApi(): Promise<void> {
  return new Promise((resolve) => {
    const w = window as any;
    if (w.YT?.Player) return resolve();

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement('script');
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    w.onYouTubeIframeAPIReady = () => resolve();
  });
}

export async function mount(elId: string, initialVideoId?: string) {
  await ensureApi();

  return new Promise<void>((resolve) => {
    player = new YT.Player(elId, {
      width: 0,
      height: 0,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        // Do NOT set autoplay; we respect user gesture.
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          ready = true;
          // Initialize first duration if available
          pushState();
          resolve();
        },
        onStateChange: () => {
          pushState();
        },
        onError: (e) => {
          console.warn("YouTube error:", e?.data);
        },
      },
      videoId: initialVideoId || undefined,
    });
  }).then(() => {
    if (pollId) window.clearInterval(pollId);
    pollId = window.setInterval(() => {
      pushState();
    }, 250);
  });
}

function pushState() {
  if (!player || !ready) return;
  const currentTime = safe(() => player!.getCurrentTime()) ?? 0;
  const duration = safe(() => player!.getDuration()) ?? 0;
  const state = safe(() => player!.getPlayerState()) ?? -1;
  const playing = state === YT.PlayerState.PLAYING;

  sub?.({ currentTime, duration, playing });
}

function safe<T>(fn: () => T): T | null {
  try { return fn(); } catch { return null as any; }
}

export function subscribe(fn: SubFn) {
  sub = fn;
}

export function isReady() {
  return ready && !!player;
}

export function isInitialized() {
  return !!player;
}

export function cue(videoId: string) {
  if (!isReady()) return;
  player!.cueVideoById(videoId);
}

export function load(videoId: string) {
  // For cases where you want to immediately load (still won't autoplay without user gesture)
  if (!isReady()) return;
  player!.loadVideoById(videoId);
}

export function play() {
  if (!isReady()) return;
  player!.playVideo(); // call from a user click handler
}

export function pause() {
  if (!isReady()) return;
  player!.pauseVideo();
}

export function seek(seconds: number) {
  if (!isReady()) return;
  player!.seekTo(seconds, true);
}

export function destroy() {
  if (pollId) { window.clearInterval(pollId); pollId = null; }
  if (player) { player.destroy(); }
  player = null;
  ready = false;
  sub = null;
}