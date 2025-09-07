import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { spring } from "../lib/motion";

export function Player({ playing, onTogglePlay, onPrevious, onNext }) {
  const Btn = ({ children, onClick, className = "" }) => (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={spring.subtle}
      className={`size-12 rounded-full bg-secondary border border-border grid place-items-center hover:bg-secondary/80 transition-colors ${className}`}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="flex items-center gap-4">
      <Btn onClick={onPrevious}>
        <SkipBack className="size-5 text-foreground" />
      </Btn>
      
      <motion.button
        onClick={onTogglePlay}
        whileTap={{ scale: 0.95 }}
        transition={spring.subtle}
        className="size-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-[var(--shadow)] hover:bg-primary/90 transition-colors"
      >
        {playing ? <Pause className="size-6" /> : <Play className="size-6 ml-0.5" />}
      </motion.button>
      
      <Btn onClick={onNext}>
        <SkipForward className="size-5 text-foreground" />
      </Btn>
    </div>
  );
}
