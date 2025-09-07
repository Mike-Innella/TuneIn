// Motion tokens: consistent timing + curves
export const dur = {
  xs: 0.16, 
  s: 0.22, 
  m: 0.32, 
  l: 0.44
};

export const ease = {
  out: [0.22, 1, 0.36, 1],       // swift-out
  in:  [0.36, 0, 1, 0.22],       // swift-in
  io:  [0.65, 0, 0.35, 1],       // standard in-out
};

export const spring = {
  subtle: { type: "spring", stiffness: 320, damping: 40, mass: 0.6 },  // crisp, no wobble
  soft:   { type: "spring", stiffness: 220, damping: 36, mass: 0.8 },  // gentle
};

// Staggers for lists
export const stagger = (delay=0.04) => ({ staggerChildren: delay, delayChildren: delay });
