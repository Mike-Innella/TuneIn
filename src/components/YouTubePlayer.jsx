import YouTube from 'react-youtube'
import { useEffect } from 'react'

export default function YouTubePlayer({ videoId, onReady, onEnded }) {
  // Some browsers block autoplay; ensure user clicks "Start Session" in your UI first.
  const opts = {
    playerVars: {
      autoplay: 0, // let your timer Start button call player.playVideo()
      modestbranding: 1,
      rel: 0,
      controls: 1,
      iv_load_policy: 3
    }
  }

  useEffect(() => {
    // When videoId changes, YouTube component loads the new one automatically.
  }, [videoId])

  if (!videoId) return <div className="text-sm text-neutral-500">Select a mood to begin.</div>

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={(e) => onReady?.(e.target)}   // pass back the player instance
        onEnd={onEnded}
      />
    </div>
  )
}
