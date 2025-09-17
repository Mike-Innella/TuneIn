import { useState } from 'react'
import { useGlobalAudio } from '../audio/GlobalAudioProvider'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import PlayerModal from './player/PlayerModal'

export default function PlayerBar() {
  const { state, play, pause, seek, setVolume, setMuted } = useGlobalAudio()
  const [modalOpen, setModalOpen] = useState(false)

  const onPlayPause = () => (state.playing ? pause() : play())

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Don't show if no track is loaded
  if (!state.src && !state.title) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(900px,92vw)] rounded-2xl border border-app-border bg-app-surface/90 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Artwork + metadata */}
          <div className="h-10 w-10 rounded-lg bg-app-surface2/40 overflow-hidden flex-shrink-0">
            {state.artwork ? (
              <img src={state.artwork} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-app-text-muted text-xs">
                🎵
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-app-text text-sm font-medium">
              {state.title || 'No track'}
            </div>
            <div className="truncate text-app-text-muted text-xs">
              {state.artist || ''}
            </div>
          </div>

          {/* Main controls */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
              aria-label="Previous"
            >
              <SkipBack size={16} className="text-app-text" />
            </button>
            <button
              className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
              onClick={onPlayPause}
              disabled={!state.canPlay && state.sourceType !== 'youtube'}
              aria-label={state.playing ? "Pause" : "Play"}
            >
              {state.playing ? <Pause size={18} className="text-app-text" /> : <Play size={18} className="text-app-text" />}
            </button>
            <button
              className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
              aria-label="Next"
            >
              <SkipForward size={16} className="text-app-text" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={state.duration || 0}
          value={state.currentTime || 0}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full mt-3 h-1 bg-app-surface2 rounded-lg appearance-none cursor-pointer accent-app-primary"
          disabled={state.sourceType === 'youtube'}
        />

        {/* Bottom row - Volume + expand */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="p-1 hover:bg-app-surface2 rounded transition-colors"
              onClick={() => setMuted(!state.muted)}
              aria-label={state.muted ? "Unmute" : "Mute"}
            >
              {state.muted ? <VolumeX size={14} className="text-app-text" /> : <Volume2 size={14} className="text-app-text" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.muted ? 0 : state.volume}
              onChange={(e) => {
                const newVolume = Number(e.target.value)
                setVolume(newVolume)
                if (newVolume > 0 && state.muted) {
                  setMuted(false)
                }
              }}
              className="w-20 h-1 bg-app-surface2 rounded-lg appearance-none cursor-pointer accent-app-primary"
            />
            <span className="text-xs text-app-text-muted min-w-[3ch]">
              {Math.round((state.muted ? 0 : state.volume) * 100)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-app-text-muted">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </span>
            <button
              className="px-3 py-1 bg-app-primary text-app-primary-fg hover:brightness-110 rounded-lg text-sm transition-all"
              onClick={() => setModalOpen(true)}
              aria-haspopup="dialog"
            >
              <Maximize2 size={14} className="inline mr-1" />
              Expand
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <PlayerModal onClose={() => setModalOpen(false)} />}
    </>
  )
}