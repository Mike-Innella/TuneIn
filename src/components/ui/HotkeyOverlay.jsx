import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { HOTKEY_GROUPS, getHotkeyText } from '../../hooks/useGlobalHotkeys';

export function HotkeyOverlay({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(HOTKEY_GROUPS);

  useEffect(() => {
    if (searchTerm) {
      const filtered = HOTKEY_GROUPS.map(group => ({
        ...group,
        shortcuts: group.shortcuts.filter(shortcut =>
          shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.shortcuts.length > 0);
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(HOTKEY_GROUPS);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Use these shortcuts to navigate TuneIn faster
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close shortcuts"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="space-y-4"
                  >
                    <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
                      <span className="text-xl">{group.icon}</span>
                      {group.title}
                    </h3>
                    <div className="space-y-3">
                      {group.shortcuts.map((shortcut, shortcutIndex) => (
                        <div
                          key={shortcutIndex}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {getHotkeyText(shortcut.keys).split('+').map((key, keyIndex, arr) => (
                              <span key={keyIndex} className="flex items-center gap-1">
                                <kbd className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                  {key.trim()}
                                </kbd>
                                {keyIndex < arr.length - 1 && (
                                  <span className="text-gray-400">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredGroups.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No shortcuts found for "{searchTerm}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Press <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredGroups.reduce((acc, group) => acc + group.shortcuts.length, 0)} shortcuts
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
