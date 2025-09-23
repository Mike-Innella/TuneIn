import { useState } from 'react';
import { MOOD_QUERIES } from '../config/moods';
import { MOOD_DURATIONS } from '../lib/focusConfig';
import { Loader2 } from 'lucide-react';
import { searchYouTube } from '../lib/youtubeApi';
import { log, warn, error } from '../lib/logger';

export default function MoodPicker() {
  const [loading, setLoading] = useState(null);
  const [searchError, setSearchError] = useState("");

  const handleMoodSelect = async (mood) => {
    if (loading) return;
    setSearchError("");
    setLoading(mood);

    try {
      log('[mood] clicked', mood);

      // 1) Build query from mood mapping
      const query = MOOD_QUERIES[mood] || `${mood} instrumental focus music`;

      // 2) Search YouTube using new backend
      const { items: raw = [] } = await searchYouTube(query);
      const items = raw
        .map(v => ({ ...v, videoId: v.videoId || v.id }))
        .filter(v => !!v.videoId);

      if (items.length === 0) {
        setSearchError("No valid videos found.");
        return;
      }

      const first = items[0];

      // 3) Dispatch player load event with videoId and playlist
      window.dispatchEvent(new CustomEvent("player:load", {
        detail: {
          sourceType: "youtube",
          videoId: first.videoId,
          playlist: items
        }
      }));

      // Dispatch mood selection event for Pomodoro integration
      const duration = MOOD_DURATIONS[mood] || 25;
      window.dispatchEvent(new CustomEvent('mood:selected', {
        detail: { mood, duration }
      }));

    } catch (e) {
      error('Failed to load mood:', e);
      setSearchError("Search failed. Check backend/api key.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6">
      {searchError && (
        <div className="text-sm text-red-400 mb-4 text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {searchError}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.keys(MOOD_QUERIES).map((mood) => (
        <button
          key={mood}
          onClick={() => handleMoodSelect(mood)}
          disabled={loading === mood}
          className="relative group p-6 rounded-2xl bg-app-surface border border-app-border text-app-text
                     hover:border-app-primary/50 hover:bg-app-surface2 transition-all duration-300
                     hover:scale-105 hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading === mood ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="w-6 h-6 animate-spin text-app-primary" />
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-2">
                {getMoodIcon(mood)}
              </div>
              <h3 className="text-app-text font-medium text-sm">
                {mood}
              </h3>
            </div>
          )}
        </button>
        ))}
      </div>
    </div>
  );
}

function getMoodIcon(mood) {
  const icons = {
    'Deep Work': '🎯',
    'Creative Flow': '🎨',
    'Light Focus': '☁️',
    'Learning': '📚',
    'Meditation': '🧘',
    'Energy Boost': '⚡',
    'Break': '☕',
  };
  return icons[mood] || '🎵';
}

