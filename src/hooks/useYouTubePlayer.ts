import { useEffect, useRef, useState } from 'react';
import * as yt from '../player/ytController';

export function useYouTubePlayer() {
  const mounted = useRef(false);
  const [state, setState] = useState({ currentTime: 0, duration: 0, playing: false });

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    yt.subscribe(setState);

    // Don't automatically destroy - let the singleton persist
    // return () => yt.destroy();
  }, []);

  // Only mount if not already initialized (singleton behavior)
  const mount = async (elId: string, initialVideoId?: string) => {
    if (!yt.isPlayerInitialized()) {
      await yt.mount(elId, initialVideoId);
    }
  };

  return {
    state,
    mount,
    cue: yt.cue,
    play: yt.play,
    pause: yt.pause,
    seek: yt.seek,
    isInitialized: yt.isPlayerInitialized
  };
}