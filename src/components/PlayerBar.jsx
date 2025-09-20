import { useState, useEffect } from 'react'
import { useGlobalAudio } from '../audio/GlobalAudioProvider'
import { usePlayer } from '../player/PlayerContext'
import { formatTime } from '../player/time'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, X } from 'lucide-react'
import PlayerModal from './player/PlayerModal'
import * as yt from '../player/ytController'
import { log } from '../lib/logger'

export default function PlayerBar() {
  const { state, play: htmlPlay, pause: htmlPause, seek: htmlSeek, setVolume: htmlSetVolume, setMuted: htmlSetMuted } = useGlobalAudio()
  const [modalOpen, setModalOpen] = useState(false)
  const [ytState, setYtState] = useState({ currentTime: 0, duration: 0, playing: false })

  const usingYT = (typeof window !== 'undefined') && yt.isReady() && state.sourceType === 'youtube'

  useEffect(() => {
    const unsub = yt.subscribe?.((s) => {
      setYtState(s)
    })
    return () => yt.subscribe?.(null) // clear subscription on unmount
  }, [])

  const isPlaying = usingYT ? ytState.playing : state.playing
  const duration = usingYT ? ytState.duration : state.duration
  const currentTime = usingYT ? ytState.currentTime : state.currentTime

  // Event bridges for external control
  useEffect(() => {
    function onOpen() { setModalOpen(true); }
    window.addEventListener('player:open', onOpen);
    return () => window.removeEventListener('player:open', onOpen);
  }, []);

  const startFocusSession = () => {
    window.dispatchEvent(new CustomEvent('session:start'))
  }

  const onPlayPause = async () => {
    const shouldStartSession = !isPlaying
    if (usingYT) {
      if (ytState.playing) yt.pause()
      else yt.play() // must be called from user click handler for autoplay policy
    } else {
      if (state.playing) htmlPause()
      else await htmlPlay()
    }
    if (shouldStartSession) startFocusSession()
  }

  const onSeek = (e) => {
    const val = Number(e.target.value)
    if (Number.isFinite(val)) {
      if (usingYT) yt.seek(val)
      else htmlSeek(val)
    }
  }


  const closeAll = () => {
    if (usingYT) yt.pause()
    else htmlPause()
    setModalOpen(false)
  }

  // Show player if there's content to play - either HTML source or YouTube ready with content
  const hasContent = usingYT ? true : Boolean(state.src);
  log('[playerbar] sourceType:', state.sourceType, 'usingYT:', usingYT, 'ytReady:', yt.isReady(), 'src:', state.src, 'hasContent:', hasContent);

  if (!hasContent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/70 text-white backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-5xl flex items-center gap-3 px-4 py-2">
        <button aria-label="Play/Pause" onClick={onPlayPause}>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <input
          aria-label="Seek"
          type="range"
          min={0}
          max={Math.max(0, Math.floor(duration))}
          step={1}
          value={Math.min(Math.floor(currentTime), Math.floor(duration))}
          onChange={onSeek}
          className="flex-1"
        />
        <div className="w-16 text-right tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</div>

        <button aria-label="Expand" onClick={() => setModalOpen(true)}><Maximize2 size={18} /></button>
        <button aria-label="Close" onClick={closeAll}><X size={18} /></button>
      </div>

      {modalOpen && (
        <PlayerModal
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onClose={() => setModalOpen(false)}
          onPlayPause={onPlayPause}
          onSeek={onSeek}
        />
      )}
    </div>
  )
}
