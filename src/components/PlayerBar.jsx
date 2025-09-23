import { useState, useEffect } from 'react'
import { useGlobalAudio } from '../audio/GlobalAudioProvider'
import { usePlayer } from '../player/PlayerContext'
import { formatTime } from '../player/time'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, X } from 'lucide-react'
import PlayerModal from './player/PlayerModal'
import * as yt from '../player/ytController'
import { log } from '../lib/logger'
import { getGlobalQueueManager } from '../lib/queueManager'

export default function PlayerBar() {
  const { state, play: htmlPlay, pause: htmlPause, seek: htmlSeek, setVolume: htmlSetVolume, setMuted: htmlSetMuted } = useGlobalAudio()
  const { state: playerState, ui, load } = usePlayer()
  const [modalOpen, setModalOpen] = useState(false)
  const [ytState, setYtState] = useState({ currentTime: 0, duration: 0, playing: false })
  const [currentVideoId, setCurrentVideoId] = useState(null)
  const [queueInfo, setQueueInfo] = useState({ current: 0, total: 0, track: null })

  const usingYT =
    typeof window !== 'undefined' &&
    (state.sourceType === 'youtube' || playerState?.sourceType === 'youtube') &&
    yt.isReady();

  useEffect(() => {
    // Initialize YouTube player if not already done
    if (!yt.isInitialized()) {
      // Create hidden div for YouTube player
      let ytHost = document.getElementById('yt-player-host');
      if (!ytHost) {
        ytHost = document.createElement('div');
        ytHost.id = 'yt-player-host';
        ytHost.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;';
        document.body.appendChild(ytHost);

        // Mount YouTube player
        yt.mount('yt-player-host').catch(err => {
          console.warn('Failed to mount YouTube player:', err);
        });
      }
    }

    const unsub = yt.subscribe?.((s) => {
      setYtState(s)
    })

    // Set up YouTube player event listener for queue management
    const setupYouTubeListener = () => {
      if (yt.isReady() && window.YT && window.YT.Player) {
        try {
          const player = yt.getPlayer?.();
          if (player && player.addEventListener) {
            const onStateChange = (event) => {
              const qm = getGlobalQueueManager();
              if (qm) {
                qm.onPlayerStateChange(event);
                // Update queue info when track changes
                const info = qm.getQueueInfo();
                const currentTrack = qm.getCurrentTrack();
                setQueueInfo({
                  current: info.current,
                  total: info.total,
                  track: currentTrack
                });
              }
            };
            player.addEventListener('onStateChange', onStateChange);
            console.log('[PlayerBar] YouTube event listener set up successfully');
          }
        } catch (error) {
          console.warn('[PlayerBar] Error setting up YouTube event listener:', error);
        }
      }
    };

    // Try to set up listener immediately, and also on a delay for YouTube readiness
    setupYouTubeListener();
    const setupTimer = setTimeout(setupYouTubeListener, 1000);

    return () => {
      clearTimeout(setupTimer);
      yt.subscribe?.(null);
    };
  }, [])

  const isPlaying = usingYT ? ytState.playing : state.playing
  const duration = usingYT ? ytState.duration : state.duration
  const currentTime = usingYT ? ytState.currentTime : state.currentTime

  // Event bridges for external control
  useEffect(() => {
    function onOpen() { setModalOpen(true); }
    function onLoad(e) {
      const { sourceType, videoId, playlist, queue, isPlaylist } = e.detail || {};
      if (sourceType !== "youtube" || !videoId) return;

      // Set audio source to YouTube
      window.dispatchEvent(new CustomEvent('audio:set_source', { detail: 'youtube' }));

      // Update player context
      load({ sourceType: 'youtube', src: videoId });

      // Update queue info if this is a playlist
      if (isPlaylist && queue && queue.length > 0) {
        setQueueInfo({
          current: 0,
          total: queue.length,
          track: queue[0]
        });
      } else {
        setQueueInfo({ current: 0, total: 1, track: null });
      }

      // Only load if we have a valid videoId and player is ready
      if (yt.isReady()) {
        yt.cue(videoId);
        setCurrentVideoId(videoId);
        log('[playerbar] cued video', videoId);
      } else {
        // Wait for YouTube player to be ready, then cue the video
        const checkReady = setInterval(() => {
          if (yt.isReady()) {
            clearInterval(checkReady);
            yt.cue(videoId);
            setCurrentVideoId(videoId);
            log('[playerbar] cued video after wait', videoId);
          }
        }, 100);
        // Give up after 5 seconds
        setTimeout(() => clearInterval(checkReady), 5000);
      }
    }

    function onQueueStart(e) {
      const { queue } = e.detail || {};
      const qm = getGlobalQueueManager();
      if (qm && queue) {
        log('[playerbar] Starting queue with', queue.length, 'tracks');
        qm.startQueue(queue);
        setQueueInfo({
          current: 0,
          total: queue.length,
          track: queue[0]
        });
      }
    }

    function onClear() {
      // Clear all player state to hide the player bar
      setCurrentVideoId(null);
      load({ src: null, sourceType: null });
      setModalOpen(false);
      setQueueInfo({ current: 0, total: 0, track: null });

      // Destroy queue manager
      const qm = getGlobalQueueManager();
      if (qm) {
        qm.destroy();
      }
    }

    window.addEventListener('player:open', onOpen);
    window.addEventListener('player:load', onLoad);
    window.addEventListener('queue:start', onQueueStart);
    window.addEventListener('player:clear', onClear);
    return () => {
      window.removeEventListener('player:open', onOpen);
      window.removeEventListener('player:load', onLoad);
      window.removeEventListener('queue:start', onQueueStart);
      window.removeEventListener('player:clear', onClear);
    };
  }, [load]);

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

  const endSession = () => {
    // Stop all audio playback
    if (usingYT) {
      yt.stop()
    } else {
      htmlPause()
    }

    // Clear current video/audio
    setCurrentVideoId(null)

    // Clear player context state
    load({ src: null, sourceType: null })

    // Clear queue info
    setQueueInfo({ current: 0, total: 0, track: null });

    // Destroy queue manager
    const qm = getGlobalQueueManager();
    if (qm) {
      qm.destroy();
    }

    // Dispatch session end event
    window.dispatchEvent(new CustomEvent('session:stop'))

    // Close modal if open
    setModalOpen(false)
  }

  // Show player if there's content to play - either HTML source or YouTube ready with content
  const hasContent = usingYT ? Boolean(currentVideoId) : Boolean(state.src || playerState?.src);

  if (!hasContent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-app-surface/95 border-t border-app-border backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-5xl flex items-center gap-4 px-4 py-3">
        {/* Left controls group */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Play/Pause"
            onClick={onPlayPause}
            className="h-10 w-10 rounded-full bg-app-primary text-app-primary-fg hover:bg-app-primary/90 transition-all duration-200 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            aria-label="End Session"
            onClick={endSession}
            className="h-8 w-8 rounded-lg border border-app-border bg-app-surface2/80 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center text-app-muted hover:text-red-400"
            title="End Session"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress section - takes remaining space */}
        <div className="flex-1 flex items-center gap-3">
          <input
            aria-label="Seek"
            type="range"
            min={0}
            max={Math.max(0, Math.floor(duration))}
            step={1}
            value={Math.min(Math.floor(currentTime), Math.floor(duration))}
            onChange={onSeek}
            className="flex-1 h-2 bg-app-surface2 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-app-primary [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-app-surface2"
          />
          <div className="text-sm text-app-muted tabular-nums whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
            {queueInfo.total > 1 && (
              <span className="ml-2 text-xs">
                ({queueInfo.current + 1}/{queueInfo.total})
              </span>
            )}
          </div>
        </div>

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
