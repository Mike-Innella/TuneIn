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
        group w-full text-left rounded-xl border-2 transition-all duration-300 cursor-pointer
        transform-gpu will-change-transform surface border-app-border
        focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2
        ${isSelected 
          ? 'border-app-primary bg-app-primary/5 shadow-lg' 
          : 'hover:border-app-border/70 hover:shadow-lg hover:bg-app-surface/90'
        }
      `}
    >
      <div className="flex flex-col items-center text-center space-y-4 p-6 md:p-8">
        <div 
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isSelected 
              ? 'bg-app-primary/20 text-app-text-primary' 
              : 'bg-app-primary/10 text-app-text-primary'
            }
          `}
        >
          <IconComponent size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-app-text mb-2">{title}</h3>
          <p className="text-sm text-app-text-muted">{desc}</p>
        </div>
      </div>
    </motion.article>
  );
}
