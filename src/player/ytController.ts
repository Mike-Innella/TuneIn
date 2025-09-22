// src/player/ytController.ts
// A small, robust singleton wrapper around the YouTube IFrame API.

import { warn } from '../lib/logger';

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

  const host = document.getElementById(elId);
  if (!host) {
    throw new Error(`YouTube host element '${elId}' not found`);
  }

  return new Promise<void>((resolve, reject) => {
    try {
      player = new YT.Player(elId, {
        width: '1',
        height: '1',
        // Use a silent 1-second video for initialization if no initial video provided
        videoId: initialVideoId || 'GJLlxj_dtq8',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ready = true;
            console.log('YouTube audio player ready');
            // Mute initially to avoid any sound from initialization
            if (player && !initialVideoId) {
              try {
                player.mute();
              } catch (e) {
                console.warn('Could not mute player on init:', e);
              }
            }
            pushState();
            resolve();
          },
          onStateChange: () => {
            pushState();
          },
          onError: (e) => {
            warn("YouTube player error:", e?.data);
            // Don't reject on error - just log it
          },
        },
      });
    } catch (err) {
      console.error('Failed to create YouTube player:', err);
      reject(err);
    }
  }).then(() => {
    if (pollId) window.clearInterval(pollId);
    pollId = window.setInterval(() => {
      if (!player || !ready) return; // prevent polling when not ready
      const dur = safe(() => player!.getDuration()) ?? 0;
      if (dur > 0) {
        pushState();
      }
    }, 500);
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
  // Unmute for actual playback
  try {
    player!.unMute();
  } catch (e) {
    console.warn('Could not unmute player:', e);
  }
  player!.cueVideoById(videoId);
}

export function load(videoId: string) {
  // For cases where you want to immediately load (still won't autoplay without user gesture)
  if (!isReady()) return;
  // Unmute for actual playback
  try {
    player!.unMute();
  } catch (e) {
    console.warn('Could not unmute player:', e);
  }
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

export function stop() {
  if (!isReady()) return;
  player!.stopVideo();
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