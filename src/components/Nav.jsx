import { motion } from "framer-motion";
import { dur, ease } from "../lib/motion";

export default function Nav({ activeTab = "Focus", onTabChange, onHomeClick }) {
  const tabs = ["Focus", "Relax", "Energy"];
  
  return (
    <motion.nav
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: dur.s, ease: ease.out } }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <button 
          onClick={onHomeClick}
          className="font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
        >
          TuneIn
        </button>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange && onTabChange(tab)}
              className="relative rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              {tab}
              <span 
                className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] bg-foreground/70 transition-all duration-200 rounded-full ${
                  activeTab === tab ? 'w-6' : 'w-0 group-hover:w-6'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
