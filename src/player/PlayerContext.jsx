import { createContext, useContext, useState } from 'react';

const PlayerCtx = createContext({
  state: { src: null, sourceType: null, playing: false },
  ui: { open: false, setOpen: () => {} },
  load: () => {}
});

export function PlayerProvider({ children }) {
  const [state, setState] = useState({
    src: null,
    sourceType: null,
    playing: false
  });

  const [isOpen, setIsOpen] = useState(false);

  const ui = {
    open: isOpen,
    setOpen: setIsOpen
  };

  const load = (source) => {
    setState(prev => ({ ...prev, ...source }));
    setIsOpen(true); // Auto-open when content loads
  };

  const value = { state, ui, load };

  return (
    <PlayerCtx.Provider value={value}>
      {children}
    </PlayerCtx.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerCtx);
  return context;
};
