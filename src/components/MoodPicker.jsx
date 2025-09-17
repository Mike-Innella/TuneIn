import { useState } from 'react';
import { MOOD_QUERIES } from '../config/moods';
import { MOOD_DURATIONS } from '../lib/focusConfig';
import { Loader2 } from 'lucide-react';
import * as yt from '../player/ytController';

export default function MoodPicker() {
  const [loading, setLoading] = useState(null);

  const handleMoodSelect = async (mood) => {
    setLoading(mood);
    try {
      console.log('[mood] clicked', mood);

      // 1) Build query from mood mapping
      const q = MOOD_QUERIES[mood] || `${mood} music`;

      // 2) Call serverless search
      const response = await fetch(`/api/youtubeSearch?q=${encodeURIComponent(q)}`);

      if (!response.ok) {
        console.error('youtubeSearch failed', response.status);
        return;
      }

      const data = await response.json(); // { videoIds: string[] }

      const firstId = data?.videoIds?.[0];
      if (!firstId) return;

      // 3) Cue the first result (no autoplay)
      if (yt.isReady()) yt.cue(firstId);

      // 4) Set source type to YouTube
      window.dispatchEvent(new CustomEvent('audio:set_source', { detail: 'youtube' }));

      // Dispatch mood selection event for Pomodoro integration
      const duration = MOOD_DURATIONS[mood] || 25;
      window.dispatchEvent(new CustomEvent('mood:selected', {
        detail: { mood, duration }
      }));

    } catch (error) {
      console.error('Failed to load mood:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
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

