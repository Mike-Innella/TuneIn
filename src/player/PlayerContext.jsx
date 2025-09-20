import { createContext, useContext } from 'react';

const PlayerCtx = createContext(null);

export function PlayerProvider({ children }) {
  return <PlayerCtx.Provider value={{}}>{children}</PlayerCtx.Provider>;
}

export const usePlayer = () => {
  const v = useContext(PlayerCtx);
  if (!v) throw new Error('usePlayer must be used within PlayerProvider');
  return v;
};
