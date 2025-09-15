import { useState } from 'react';
import { usePlayer } from '../player/PlayerContext';
import { MOOD_QUERIES } from '../config/moods';
import { MOOD_DURATIONS } from '../lib/focusConfig';
import { Loader2 } from 'lucide-react';

export default function MoodPicker() {
  const { load } = usePlayer();
  const [loading, setLoading] = useState(null);

  const handleMoodSelect = async (mood) => {
    setLoading(mood);
    try {
      const query = MOOD_QUERIES[mood];
      const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}&maxResults=20`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        load(data.items, 0);
      } else {
        // Fallback to mock data for development
        const mockTracks = generateMockTracks(mood);
        load(mockTracks, 0);
      }

      // Dispatch mood selection event for Pomodoro integration
      const duration = MOOD_DURATIONS[mood] || 25;
      window.dispatchEvent(new CustomEvent('mood:selected', {
        detail: { mood, duration }
      }));

    } catch (error) {
      console.error('Failed to load mood, using mock data:', error);
      // Use mock data as fallback
      const mockTracks = generateMockTracks(mood);
      load(mockTracks, 0);

      // Still dispatch the mood selection event
      const duration = MOOD_DURATIONS[mood] || 25;
      window.dispatchEvent(new CustomEvent('mood:selected', {
        detail: { mood, duration }
      }));
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