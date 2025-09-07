import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  X, 
  RefreshCw, 
  Clock, 
  Copy, 
  Volume2, 
  VolumeX,
  Check,
  AlertCircle
} from 'lucide-react';
import { dur, ease } from '../lib/motion';

export function PromptDrawer({ 
  prompt, 
  isVisible, 
  isExpanded,
  settings,
  onCollapse, 
  onHide, 
  onNext,
  onSnooze,
  onCopy,
  onSpeak,
  className = '' 
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);
  const drawerRef = useRef(null);

  // Reset states when drawer closes
  useEffect(() => {
    if (!isVisible || !isExpanded) {
      setCopySuccess(false);
      setIsSpeaking(false);
      setSnoozeMenuOpen(false);
    }
  }, [isVisible, isExpanded]);

  // Listen for speech synthesis events
  useEffect(() => {
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);
    const handleSpeechError = () => setIsSpeaking(false);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Note: These events don't work reliably across browsers
      // We'll use a timeout instead for better UX
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Markdown-like text rendering
  const renderText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br />');
  };

  const handleCopy = async () => {
    try {
      await onCopy();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      // Stop speaking
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      // Start speaking
      setIsSpeaking(true);
      try {
        await onSpeak();
        // Auto-stop after reasonable time
        setTimeout(() => setIsSpeaking(false), 15000);
      } catch (error) {
        console.error('Speak failed:', error);
        setIsSpeaking(false);
      }
    }
  };

  const handleSnooze = (minutes) => {
    onSnooze(minutes);
    setSnoozeMenuOpen(false);
  };

  if (!prompt || !isVisible || !isExpanded) return null;

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
        ref={drawerRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: dur.m, ease: ease.out }}
        className={`prompt-drawer ${className}`}
        role="dialog"
        aria-label="Expanded prompt"
        aria-live="polite"
        tabIndex={-1}
      >
        <div className="rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-[var(--shadow)] max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getBadgeColor(prompt.prompt.type)}`}>
                {prompt.prompt.type === 'manual' && 'Manual'}
                {prompt.prompt.type === 'emergent' && 'Emergent'}
                {prompt.prompt.type === 'guided' && 'Guided'}
              </div>
              
              <div className="px-2 py-1 rounded-full bg-white/5 border border-white/20 text-xs text-zinc-400">
                {prompt.position === 'start' && '🚀 Session Start'}
                {prompt.position === 'mid' && '⚡ Midway Check'}
                {prompt.position === 'distraction' && '🎯 Refocus'}
                {prompt.position === 'end' && '✨ Complete'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={onCollapse}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/10"
                aria-label="Collapse prompt"
                title="Collapse to pill view"
              >
                <ChevronUp size={20} />
              </motion.button>

              <motion.button
                onClick={onHide}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors border border-white/10 hover:border-red-500/30"
                aria-label="Hide prompt"
                title="Hide prompt completely"
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {prompt.prompt.title && (
              <h3 className="text-xl font-semibold text-white mb-4">
                {prompt.prompt.title}
              </h3>
            )}

            <div 
              className="text-zinc-200 text-base leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderText(prompt.prompt.text) }}
            />

            {/* Tags */}
            {prompt.prompt.tags && prompt.prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {prompt.prompt.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-white/5 text-zinc-300 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/2">
            <div className="flex items-center gap-2">
              {/* Show Another Button */}
              <motion.button
                onClick={onNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-colors"
                aria-label="Show another prompt"
              >
                <RefreshCw size={16} />
                Show Another
              </motion.button>

              {/* Snooze Button */}
              <div className="relative">
                <motion.button
                  onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 hover:border-white/20 transition-colors"
                  aria-label="Snooze prompt"
                >
                  <Clock size={16} />
                  Snooze
                </motion.button>

                {/* Snooze Menu */}
                <AnimatePresence>
                  {snoozeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 bg-zinc-800/95 backdrop-blur border border-white/20 rounded-lg shadow-lg overflow-hidden"
                    >
                      {[5, 10, 15, 30].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => handleSnooze(minutes)}
                          className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                          {minutes} minutes
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Button */}
              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg border transition-colors ${
                  copySuccess 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/10'
                }`}
                aria-label={copySuccess ? "Copied!" : "Copy prompt text"}
                title={copySuccess ? "Copied!" : "Copy to clipboard"}
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
              </motion.button>

              {/* TTS Button */}
              {settings.ttsEnabled && (
                <motion.button
                  onClick={handleSpeak}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg border transition-colors ${
                    isSpeaking 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/10'
                  }`}
                  aria-label={isSpeaking ? "Stop speaking" : "Read prompt aloud"}
                  title={isSpeaking ? "Stop speaking" : "Text-to-speech"}
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: dur.s }}
        >
          <p className="text-xs text-zinc-500">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-zinc-400">Esc</kbd> to hide • 
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-zinc-400 ml-1">N</kbd> for next
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Focus management for accessibility
export function useDrawerFocus(isExpanded, drawerRef) {
  useEffect(() => {
    if (isExpanded && drawerRef.current) {
      // Focus the drawer when it opens
      drawerRef.current.focus();
    }
  }, [isExpanded]);
}
