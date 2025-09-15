import { createContext, useContext } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';

const PlayerCtx = createContext(null);

export function PlayerProvider({ children }) {
  const api = useYouTubePlayer();
  return (
    <PlayerCtx.Provider value={api}>
      {/* hidden iframe host */}
      <div ref={api.elRef} style={{ position:'fixed', bottom:0, right:0, width:0, height:0 }} />
      {children}
    </PlayerCtx.Provider>
  );
}

export const usePlayer = () => {
  const v = useContext(PlayerCtx);
  if (!v) throw new Error('usePlayer must be used within PlayerProvider');
  return v;
};