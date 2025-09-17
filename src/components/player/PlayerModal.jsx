import { useGlobalAudio } from '../../audio/GlobalAudioProvider'
import { SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import * as yt from '../../player/ytController'

export default function PlayerModal({ onClose, isPlaying, currentTime, duration, onPlayPause, onSeek }) {
  const { state } = useGlobalAudio()

  const usingYT = state.sourceType === 'youtube'

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Modal Overlay with Page Backdrop Blur */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md pointer-events-none" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-[min(920px,92vw)] bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video Container with Blur Layer */}
          {usingYT ? (
            <div className="relative aspect-video overflow-hidden rounded-t-2xl">
              {/* This node is just a visible frame area – the real iframe sits offscreen; we're visually representing it blurred */}
              <div className="[filter:blur(6px)] w-full h-full bg-neutral-800" />
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_60%,rgba(0,0,0,0.35)_100%)]" />
            </div>
          ) : (
            /* Fallback artwork for non-YouTube content */
            <div className="aspect-video bg-app-surface2/40 overflow-hidden flex items-center justify-center">
              {state.artwork ? (
                <img src={state.artwork} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-app-text-muted">
                  <div className="text-6xl mb-4">🎵</div>
                  <div className="text-lg">No artwork</div>
                </div>
              )}
            </div>
          )}

          {/* Controls Container - Stays Crisp */}
          <div className="p-4 flex items-center gap-3 text-white relative z-10">
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-2"
              aria-label="Close"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Playback controls */}
            <button
              onClick={onPlayPause}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
            </button>

            {/* Progress bar */}
            <input
              type="range"
              className="flex-1 mx-4"
              min={0}
              max={Math.max(0, Math.floor(duration))}
              value={Math.min(Math.floor(currentTime), Math.floor(duration))}
              onChange={onSeek}
            />

            {/* Time display */}
            <span className="text-sm tabular-nums min-w-[5rem] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}