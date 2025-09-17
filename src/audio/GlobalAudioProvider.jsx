import { createContext, useContext, useMemo, useRef, useState, useEffect, useCallback } from 'react'

const AudioCtx = createContext(null)

export function GlobalAudioProvider({ children }) {
  const audioRef = useRef(null)
  const [state, setState] = useState({
    src: '',
    title: '',
    artist: '',
    artwork: '',
    duration: 0,
    currentTime: 0,
    volume: 0.8,
    muted: false,
    playing: false,
    canPlay: false,
    sourceType: 'html', // 'html' | 'youtube'
  })

  // create singleton <audio> once
  useEffect(() => {
    const el = document.createElement('audio')
    el.preload = 'metadata'
    el.crossOrigin = 'anonymous'
    el.volume = state.volume
    el.muted = state.muted
    audioRef.current = el

    const onLoaded = () => setState(s => ({ ...s, duration: el.duration || 0, canPlay: true }))
    const onTime = () => setState(s => ({ ...s, currentTime: el.currentTime }))
    const onEnd = () => setState(s => ({ ...s, playing: false }))
    const onPlay = () => setState(s => ({ ...s, playing: true }))
    const onPause = () => setState(s => ({ ...s, playing: false }))

    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)

    return () => {
      el.pause()
      el.src = ''
      el.removeAttribute('src')
      el.load()
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [])

  const load = useCallback(async ({ src, title, artist, artwork, sourceType = 'html' }) => {
    setState(s => ({ ...s, canPlay: false, playing: false }))
    if (sourceType === 'youtube') {
      // HTMLAudio cannot play YouTube URLs. Let UI show a message or switch to IFrame path.
      setState(s => ({ ...s, src, title, artist, artwork, sourceType, canPlay: false, playing: false }))
      return
    }
    const el = audioRef.current
    if (el) {
      el.src = src
      try {
        await new Promise((resolve, reject) => {
          const onLoad = () => {
            el.removeEventListener('loadedmetadata', onLoad)
            el.removeEventListener('error', onError)
            resolve()
          }
          const onError = (e) => {
            el.removeEventListener('loadedmetadata', onLoad)
            el.removeEventListener('error', onError)
            reject(e)
          }
          el.addEventListener('loadedmetadata', onLoad)
          el.addEventListener('error', onError)
          el.load()
        })
      } catch (e) {
        console.warn('Failed to load audio:', e)
      }
      setState(s => ({ ...s, src, title, artist, artwork, sourceType }))
    }
  }, [])

  const play = useCallback(async () => {
    const el = audioRef.current
    if (el) {
      try {
        await el.play() // must be called from a user gesture
        setState(s => ({ ...s, playing: true }))
      } catch (e) {
        console.warn('play() blocked by policy or bad src', e)
      }
    }
  }, [])

  const pause = useCallback(() => {
    const el = audioRef.current
    if (el) {
      el.pause()
      setState(s => ({ ...s, playing: false }))
    }
  }, [])

  const seek = useCallback((t) => {
    const el = audioRef.current
    if (el) {
      el.currentTime = Math.max(0, Math.min(t, el.duration || 0))
    }
  }, [])

  const setVolume = useCallback((v) => {
    const el = audioRef.current
    if (el) {
      el.volume = v
      setState(s => ({ ...s, volume: v }))
    }
  }, [])

  const setMuted = useCallback((m) => {
    const el = audioRef.current
    if (el) {
      el.muted = m
      setState(s => ({ ...s, muted: m }))
    }
  }, [])

  const value = useMemo(() => ({
    audio: audioRef.current,
    state, load, play, pause, seek, setVolume, setMuted
  }), [state, load, play, pause, seek, setVolume, setMuted])

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}

export const useGlobalAudio = () => useContext(AudioCtx)