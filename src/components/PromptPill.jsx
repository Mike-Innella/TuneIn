import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, MoreHorizontal } from 'lucide-react';
import { dur, ease } from '../lib/motion';

export function PromptPill({ 
  prompt, 
  isVisible, 
  onExpand, 
  onHide, 
  className = '' 
}) {
  if (!prompt || !isVisible) return null;

  // Truncate text for pill display (≤140 chars as per spec)
  const truncatedText = prompt.prompt.text.length > 140 
    ? prompt.prompt.text.substring(0, 137) + '...' 
    : prompt.prompt.text;

  // Remove markdown formatting for pill display
  const plainText = truncatedText.replace(/\*\*(.*?)\*\*/g, '$1');

  // Get badge color based on prompt type
  const getBadgeColor = (type) => {
    switch (type) {
      case 'manual': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'emergent': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'guided': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: dur.m, ease: ease.out }}
        className={`prompt-pill relative ${className}`}
        role="region"
        aria-label="Focus prompt"
        aria-live="polite"
      >
        <div className="rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md p-4 shadow-[var(--shadow)]">
          <div className="flex items-start gap-3">
            {/* Type badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(prompt.prompt.type)}`}>
              {prompt.prompt.type === 'manual' && 'Manual'}
              {prompt.prompt.type === 'emergent' && 'Emergent'}
              {prompt.prompt.type === 'guided' && 'Guided'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {prompt.prompt.title && (
                <div className="text-sm font-medium text-white mb-1">
                  {prompt.prompt.title}
                </div>
              )}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {plainText}
              </p>
              
              {/* Tags */}
              {prompt.prompt.tags && prompt.prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {prompt.prompt.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-zinc-400 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                  {prompt.prompt.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-zinc-400 border border-white/10">
                      +{prompt.prompt.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <motion.button
                onClick={onExpand}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/10"
                aria-label="Expand prompt"
                title="Expand prompt"
              >
                <ChevronDown size={16} />
              </motion.button>

              <motion.button
                onClick={onHide}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors border border-white/10 hover:border-red-500/30"
                aria-label="Hide prompt"
                title="Hide prompt"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>

          {/* Expand hint */}
          {truncatedText !== prompt.prompt.text && (
            <motion.div 
              className="mt-3 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: dur.s, ease: ease.out }}
            >
              <button
                onClick={onExpand}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <MoreHorizontal size={12} />
                Expand to read more
                <ChevronDown size={12} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Position indicator */}
        <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/20 text-xs text-zinc-400">
          {prompt.position === 'start' && '🚀 Session Start'}
          {prompt.position === 'mid' && '⚡ Midway Check'}
          {prompt.position === 'distraction' && '🎯 Refocus'}
          {prompt.position === 'end' && '✨ Complete'}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Keyboard navigation support
export function PromptPillKeyboardHandler({
  isVisible,
  onExpand,
  onHide,
  onNext
}) {
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event) => {
      // Only handle if prompt is visible and no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'p':
        case 'P':
          event.preventDefault();
          onExpand();
          break;
        case 'Escape':
          event.preventDefault();
          onHide();
          break;
        case 'n':
        case 'N':
          if (onNext) {
            event.preventDefault();
            onNext();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onExpand, onHide, onNext]);

  return null;
}
