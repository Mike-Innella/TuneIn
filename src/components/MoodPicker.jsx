import { useState } from 'react';
import { usePlayer } from '../player/PlayerContext';
import { useGlobalAudio } from '../audio/GlobalAudioProvider';
import { MOOD_QUERIES } from '../config/moods';
import { MOOD_DURATIONS } from '../lib/focusConfig';
import { Loader2 } from 'lucide-react';

export default function MoodPicker() {
  const { load } = usePlayer();
  const { load: loadGlobalAudio } = useGlobalAudio();
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
        // Map API response to expected format (videoId -> id)
        const mappedTracks = data.items.map(track => ({
          ...track,
          id: track.videoId || track.id // Ensure id property exists
        }));
        
        // Load tracks into YouTube player (queue only, no autoplay)
        load(mappedTracks, 0);
        
        // Load first track into global audio for UI display (no autoplay)
        const firstTrack = mappedTracks[0];
        if (firstTrack) {
          await loadGlobalAudio({
            src: '', // YouTube URLs can't be played directly in audio tag
            title: firstTrack.title,
            artist: firstTrack.channel,
            artwork: firstTrack.thumb,
            sourceType: 'youtube'
          });
        }
      } else {
        // Fallback to mock data for development
        const mockTracks = generateMockTracks(mood);
        // Map mock data to expected format (videoId -> id)
        const mappedMockTracks = mockTracks.map(track => ({
          ...track,
          id: track.videoId || track.id
        }));
        
        // Load mock tracks into YouTube player (queue only, no autoplay)
        load(mappedMockTracks, 0);
        
        // Load first mock track into global audio for UI display (no autoplay)
        const firstTrack = mappedMockTracks[0];
        if (firstTrack) {
          await loadGlobalAudio({
            src: '', // YouTube URLs can't be played directly in audio tag
            title: firstTrack.title,
            artist: firstTrack.channel,
            artwork: '',
            sourceType: 'youtube'
          });
        }
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

      // Load first mock track into global audio
      const firstTrack = mockTracks[0];
      if (firstTrack) {
        await loadGlobalAudio({
          src: '', // YouTube URLs can't be played directly in audio tag
          title: firstTrack.title,
          artist: firstTrack.channel,
          artwork: '',
          sourceType: 'youtube'
        });
      }

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

function generateMockTracks(mood) {
  const mockTracksByMood = {
    'Deep Work': [
      { videoId: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', duration: '00:00' },
      { videoId: '5qap5aO4i9A', title: 'Deep Focus - Music For Studying, Concentration and Work', channel: 'Greenred Productions', duration: '00:00' },
      { videoId: 'lTRiuFIWV54', title: 'Concentration Music for Work | Focus Instrumental Background Music', channel: 'Focus Music', duration: '00:00' }
    ],
    'Creative Flow': [
      { videoId: 'bM7SZ5SBzyY', title: 'Jazz Cafe - Relaxing Jazz Piano Music for Work, Study & Stress Relief', channel: 'Cafe Music BGM channel', duration: '00:00' },
      { videoId: '2gkBhN4A9Dw', title: 'Creative Boost | Chill Electronic Music Mix', channel: 'Electronic Gems', duration: '00:00' },
      { videoId: 'V1Nh6J6gHMk', title: 'Inspirational Background Music For Videos', channel: 'No Copyright Music', duration: '00:00' }
    ],
    'Light Focus': [
      { videoId: 'kgx4WGK0oNU', title: 'Calm Piano Music 24/7: study music, focus, think, meditation, relaxing music', channel: 'Yellow Brick Cinema', duration: '00:00' },
      { videoId: '6p0DAz_30qQ', title: 'Peaceful Music, Relaxing Music, Instrumental Music', channel: 'Soothing Relaxation', duration: '00:00' },
      { videoId: 'hHW1oY26kxQ', title: 'Background Music for Studying, Relaxation and Work', channel: 'Study Music', duration: '00:00' }
    ],
    'Learning': [
      { videoId: 'YE2iyBRmA_g', title: 'Classical Study Music for Reading & Concentration', channel: 'Halidon Music', duration: '00:00' },
      { videoId: 'o_4EX4dPppA', title: 'Mozart for Studying, Concentration, Relaxation', channel: 'Classical Music Only', duration: '00:00' },
      { videoId: 'IPZF2NLIukw', title: 'Bach for Brain Power - Classical Focus Music', channel: 'Classical Study Music', duration: '00:00' }
    ],
    'Meditation': [
      { videoId: 'inpok4MKVLM', title: 'Peaceful Music 24/7: Meditation, Sleep Music, Spa, Healing, Zen, Study Music', channel: 'Meditation Relax Music', duration: '00:00' },
      { videoId: 'lFcSrYw-ARY', title: 'Tibetan Meditation Music 24/7: Healing Music, Meditation Music, Spa Music, Study Music', channel: 'Meditation Relax Music', duration: '00:00' },
      { videoId: 'tEmt1Cxh8-w', title: 'Deep Meditation Music for Stress Relief & Healing', channel: 'Meditative Mind', duration: '00:00' }
    ],
    'Energy Boost': [
      { videoId: 'TUVcZfQe-Kw', title: 'Energetic Electronic Music 2024 | Gaming Mix', channel: 'NoCopyrightSounds', duration: '00:00' },
      { videoId: 'Jmv5pTyz--I', title: 'Upbeat Background Music | Energetic & Inspiring', channel: 'AShamaluevMusic', duration: '00:00' },
      { videoId: 'bKkz7b0cWcs', title: 'Motivational Music Mix | Epic & Uplifting Background Music', channel: 'Epic Music VN', duration: '00:00' }
    ],
    'Break': [
      { videoId: 'DWcJFNfaw9c', title: 'Chill Lounge Music | Relaxing Background Music for Work, Study, Reading', channel: 'Chillhop Music', duration: '00:00' },
      { videoId: 'bebuiaSKtU4', title: 'Coffee Shop Ambience ☕ Rain Sounds for Relaxing, Study, Sleep', channel: 'Relaxing White Noise', duration: '00:00' },
      { videoId: 'Dx5qFachd3A', title: 'Chillstep Music for Programming / Cyber / Coding', channel: 'Code Radio', duration: '00:00' }
    ]
  };

  return mockTracksByMood[mood] || mockTracksByMood['Deep Work'];
}
