import YouTube from 'react-youtube'
import { useEffect } from 'react'

export default function YouTubePlayer({ videoId, onReady, onEnded }) {
  // Some browsers block autoplay; ensure user clicks "Start Session" in your UI first.
  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0, // let your timer Start button call player.playVideo()
      modestbranding: 1,
      rel: 0,
      controls: 0,
      iv_load_policy: 3,
      fs: 0,
      cc_load_policy: 0,
      showinfo: 0,
      disablekb: 1
    }
  }

  useEffect(() => {
    // When videoId changes, YouTube component loads the new one automatically.
  }, [videoId])

  if (!videoId) return null

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={(e) => onReady?.(e.target)}   // pass back the player instance
        onEnd={onEnded}
      />
    </div>
  )
}
