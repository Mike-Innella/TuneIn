import { useState } from 'react'
import { useGlobalAudio } from '../audio/GlobalAudioProvider'
import { usePlayer } from '../player/PlayerContext'
import { formatTime } from '../player/time'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, X } from 'lucide-react'
import PlayerModal from './player/PlayerModal'

export default function PlayerBar() {
  const { state, play: htmlPlay, pause: htmlPause, seek: htmlSeek, setVolume: htmlSetVolume, setMuted: htmlSetMuted, load } = useGlobalAudio()
  const yt = usePlayer()
  const [modalOpen, setModalOpen] = useState(false)
  
  // Determine active backend
  const usingYT = state.sourceType === 'youtube'
  const isPlaying = usingYT ? yt.isPlaying : state.playing
  
  // Unified progress values
  const maxDuration = usingYT ? (yt.duration || 0) : (state.duration || 0)
  const currentTime = usingYT ? (yt.currentTime || 0) : (state.currentTime || 0)
  
  // Function to start a focus session when play is pressed
  const startFocusSession = () => {
    // Dispatch event to start focus session
    window.dispatchEvent(new CustomEvent('session:start'))
  }

  // Function to close player and stop all audio
  const onClose = () => {
    // Stop both backends
    yt.pause()
    htmlPause()
    
    // Clear global audio state to hide PlayerBar
    load({
      src: '',
      title: '',
      artist: '',
      artwork: '',
      sourceType: 'html'
    })
    
    // Dispatch event to stop any active session
    window.dispatchEvent(new CustomEvent('session:stop'))
  }

  const onPlayPause = async () => {
    // If we're starting playback, also start a focus session
    const shouldStartSession = !isPlaying
    
    if (usingYT) {
      // Handle YouTube playback
      if (yt.isPlaying) {
        yt.pause()
      } else {
        yt.play() // User gesture here
        if (shouldStartSession) {
          startFocusSession()
        }
      }
    } else {
      // Handle HTML audio playback
      if (state.playing) {
        htmlPause()
      } else {
        await htmlPlay() // User gesture here
        if (shouldStartSession) {
          startFocusSession()
        }
      }
    }
  }

  const onSeek = (e) => {
    const t = Number(e.target.value)
    if (usingYT) {
      yt.seek(t)
    } else {
      htmlSeek(t)
    }
  }

  const onVolumeChange = (e) => {
    const v = Number(e.target.value)
    if (usingYT) {
      yt.setVol(Math.round(v * 100)) // YT uses 0-100
    } else {
      htmlSetVolume(v) // HTML5 uses 0-1
    }
  }

  const onMuteToggle = () => {
    if (usingYT) {
      yt.mute(!yt.ytMuted)
    } else {
      htmlSetMuted(!state.muted)
    }
  }

  // Show player if any track is loaded (even if not playing)
  if (!state.src && !state.title) {
    return null
  }

  // Get current volume for display
  const currentVolume = usingYT ? (yt.ytMuted ? 0 : yt.volume / 100) : (state.muted ? 0 : state.volume)
  const isMuted = usingYT ? yt.ytMuted : state.muted

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
              onClick={() => usingYT ? yt.prev() : null}
              aria-label="Previous"
            >
              <SkipBack size={16} className="text-app-text" />
            </button>
            <button
              className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
              onClick={onPlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} className="text-app-text" /> : <Play size={18} className="text-app-text" />}
            </button>
            <button
              className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
              onClick={() => usingYT ? yt.next() : null}
              aria-label="Next"
            >
              <SkipForward size={16} className="text-app-text" />
            </button>
          </div>
          
          {/* Close button */}
          <button
            className="p-2 hover:bg-app-surface2 rounded-lg transition-colors"
            onClick={onClose}
            aria-label="Close player"
          >
            <X size={16} className="text-app-text" />
          </button>
        </div>

        {/* Progress bar - UNIFIED for both backends */}
        <input
          type="range"
          min={0}
          max={Math.max(0, Math.floor(maxDuration))}
          value={Math.floor(currentTime)}
          onChange={onSeek}
          className="w-full mt-3 h-1 bg-app-surface2 rounded-lg appearance-none cursor-pointer accent-app-primary"
        />

        {/* Bottom row - Volume + expand */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="p-1 hover:bg-app-surface2 rounded transition-colors"
              onClick={onMuteToggle}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={14} className="text-app-text" /> : <Volume2 size={14} className="text-app-text" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={currentVolume}
              onChange={onVolumeChange}
              className="w-20 h-1 bg-app-surface2 rounded-lg appearance-none cursor-pointer accent-app-primary"
            />
            <span className="text-xs text-app-text-muted min-w-[3ch]">
              {Math.round(currentVolume * 100)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-app-text-muted">
              {formatTime(currentTime)} / {formatTime(maxDuration)}
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
