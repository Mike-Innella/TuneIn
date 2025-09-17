import { useGlobalAudio } from '../../audio/GlobalAudioProvider'
import { SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, X } from 'lucide-react'

export default function PlayerModal({ onClose }) {
  const { state, play, pause, seek, setVolume, setMuted } = useGlobalAudio()
  const onPlayPause = () => (state.playing ? pause() : play())

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md" onClick={onClose} />
      {/* Dialog */}
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-[min(780px,92vw)] rounded-3xl border border-app-border bg-app-surface p-6 shadow-2xl">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-app-text-muted" />
            </button>
          </div>

          <div className="flex items-start gap-6">
            {/* Artwork */}
            <div className="h-48 w-48 rounded-2xl bg-app-surface2/40 overflow-hidden flex-shrink-0">
              {state.artwork ? (
                <img src={state.artwork} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-app-text-muted">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎵</div>
                    <div className="text-sm">No artwork</div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls and info */}
            <div className="min-w-0 flex-1">
              <div className="text-2xl font-semibold text-app-text truncate mb-2">
                {state.title || 'No track selected'}
              </div>
              <div className="text-lg text-app-text-muted mb-6">
                {state.artist || ''}
              </div>

              {/* Main controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  className="p-3 hover:bg-app-surface2 rounded-full transition-colors"
                  aria-label="Previous"
                >
                  <SkipBack size={24} className="text-app-text" />
                </button>

                <button
                  onClick={onPlayPause}
                  disabled={!state.canPlay && state.sourceType !== 'youtube'}
                  className="p-4 bg-app-primary text-app-primary-fg hover:brightness-110 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={state.playing ? "Pause" : "Play"}
                >
                  {state.playing ? <Pause size={28} /> : <Play size={28} />}
                </button>

                <button
                  className="p-3 hover:bg-app-surface2 rounded-full transition-colors"
                  aria-label="Next"
                >
                  <SkipForward size={24} className="text-app-text" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <input
                  type="range"
                  className="w-full h-2 bg-app-surface2 rounded-lg appearance-none cursor-pointer accent-app-primary"
                  min={0}
                  max={state.duration || 0}
                  value={state.currentTime || 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  disabled={state.sourceType === 'youtube'}
                />
                <div className="flex justify-between text-xs text-app-text-muted mt-1">
                  <span>{formatTime(state.currentTime)}</span>
                  <span>{formatTime(state.duration)}</span>
                </div>
              </div>

              {/* Volume controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMuted(!state.muted)}
                  className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
                  aria-label={state.muted ? "Unmute" : "Mute"}
                >
                  {state.muted ? <VolumeX size={20} className="text-app-text" /> : <Volume2 size={20} className="text-app-text" />}
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
                  className="flex-1 h-2 bg-app-surface2 rounded-lg appearance-none cursor-pointer accent-app-primary"
                />

                <span className="text-sm text-app-text-muted min-w-[3ch]">
                  {Math.round((state.muted ? 0 : state.volume) * 100)}
                </span>
              </div>

              {/* Source type indicator */}
              {state.sourceType === 'youtube' && (
                <div className="mt-4 text-sm text-app-text-muted text-center">
                  YouTube content - some controls may be limited
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}