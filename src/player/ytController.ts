let player: YT.Player | null = null;
let ready = false;
let onState: ((s:{currentTime:number;duration:number;playing:boolean})=>void) | null = null;
let pollId: number | null = null;

function ensureApi(cb: ()=>void) {
  if ((window as any).YT?.Player) return cb();
  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const s = document.createElement('script');
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }
  (window as any).onYouTubeIframeAPIReady = cb;
}

export async function mount(elId: string, initialVideoId?: string) {
  if (player) return; // already mounted once
  await new Promise<void>((resolve) => {
    ensureApi(() => {
      player = new YT.Player(elId, {
        videoId: initialVideoId,
        playerVars: { playsinline: 1, origin: window.location.origin },
        events: { onReady: () => { ready = true; resolve(); } }
      });
    });
  });

  if (pollId) window.clearInterval(pollId);
  pollId = window.setInterval(() => {
    if (!player || !ready) return;
    onState?.({
      currentTime: player.getCurrentTime?.() || 0,
      duration: player.getDuration?.() || 0,
      playing: player.getPlayerState?.() === YT.PlayerState.PLAYING
    });
  }, 1000);
}

export function isReady(){ return !!ready; }
export function subscribe(cb: typeof onState){ onState = cb; }

export function cue(id: string){ if (ready && player) player.cueVideoById(id); }
export function play(){ if (ready && player) player.playVideo(); }
export function pause(){ if (ready && player) player.pauseVideo(); }
export function seek(sec:number){ if (ready && player) player.seekTo(sec, true); }

export function destroy(){
  if (pollId) { window.clearInterval(pollId); pollId = null; }
  if (player) { player.destroy(); player = null; ready = false; }
}