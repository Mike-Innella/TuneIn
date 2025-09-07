import { motion } from "framer-motion";
import { scaleCard } from "../lib/variants";

export function TrackCard({ title, desc, icon: IconComponent, onClick, isSelected }) {
  return (
    <motion.article
      variants={scaleCard}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      whileTap="whileTap"
      onClick={onClick}
      className={`
        group w-full text-left rounded-xl2 border border-border 
        shadow-card transition-all duration-300 cursor-pointer
        transform-gpu will-change-transform
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2
        ${isSelected 
          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-cardHover' 
          : 'bg-bg-subtle hover:shadow-cardHover hover:bg-bg-hover dark:bg-card/60 dark:hover:bg-card/70'
        }
      `}
    >
      <div className="flex flex-col items-center text-center space-y-4 p-6 md:p-8">
        <div 
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isSelected 
              ? 'bg-brand-200 text-brand-700 dark:bg-brand-700 dark:text-brand-200' 
              : 'bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-300'
            }
          `}
        >
          <IconComponent size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </motion.article>
  );
}
