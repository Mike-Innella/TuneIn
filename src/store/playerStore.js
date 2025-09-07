import { useState, useCallback, useRef } from 'react'
import { fetchMoodPlaylist } from '../services/youtube'

/**
 * Integrates with your Pomodoro:
 * - call start() when a session starts (after user interaction)
 * - call pause() on timer pause, resume() on resume, stop() on session end
 */
export function usePlayerStore() {
  const [mood, setMood] = useState('Deep Work')
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const playerRef = useRef(null) // holds the iframe player instance

  const loadMood = useCallback(async (m) => {
    setLoading(true)
    try {
      const data = await fetchMoodPlaylist(m)
      const fallback = [
        { videoId: 'jfKfPfyJRdk', title: 'lofi hip hop radio', channel: 'Lofi Girl', thumb: '' },
        { videoId: 'DWcJFNfaw9c', title: 'Ambient Study Music', channel: 'MyNoise', thumb: '' }
      ]
      setMood(m)
      setQueue(data.items?.length ? data.items : fallback)
      setIndex(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const current = queue[index] || null
  const next = useCallback(() =>
    setIndex(i => (i + 1 < queue.length ? i + 1 : 0)), [queue.length])
  const prev = useCallback(() =>
    setIndex(i => (i - 1 >= 0 ? i - 1 : queue.length - 1)), [queue.length])

  // attach/detach player instance (from Player component)
  const attach = (p) => { playerRef.current = p }
  const detach = () => { playerRef.current = null }

  // session controls
  const start = () => playerRef.current?.playVideo?.()
  const pause = () => playerRef.current?.pauseVideo?.()
  const resume = () => playerRef.current?.playVideo?.()
  const stop = () => {
    try { playerRef.current?.stopVideo?.() } catch {}
  }

  const onEnded = () => next()

  return {
    mood, setMood, queue, index, current,
    loading, loadMood, next, prev, onEnded,
    attach, detach, start, pause, resume, stop
  }
}
