export async function searchYouTubeRaw(query, { maxResults = 25 } = {}) {
  const url = `/api/youtubeSearch?q=${encodeURIComponent(query)}&max=${maxResults}`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`YouTube search failed: ${res.status} ${txt}`)
  }
  return res.json()
}

export async function searchYouTubePlayable(query, opts) {
  const data = await searchYouTubeRaw(query, opts)
  const items = (data.items || [])
    .map(v => ({
      id: v.id,
      title: v.title,
      channelTitle: v.channelTitle,
      duration: v.duration,
      seconds: v.seconds,
      embeddable: v.embeddable !== false,
      thumbnail: v.thumbnails?.medium?.url || v.thumbnails?.default?.url || null,
    }))
    .filter(v => v.embeddable && v.seconds >= 60 && v.seconds <= 1800)

  if (!items.length) {
    const err = new Error('NO_VALID_VIDEOS')
    err.code = 'NO_VALID_VIDEOS'
    throw err
  }
  return items
}

export async function fetchMoodPlaylist(mood, pageToken) {
  try {
    const query = `${mood} lofi instrumental chill`
    const results = await searchYouTubePlayable(query, { maxResults: 25 })
    return { items: results }
  } catch (e) {
    console.warn('[mood] youtube search failed; using fallback', e)
    return {
      items: [
        { id: '5qap5aO4i9A', title: 'lofi hip hop – relax/study', seconds: 0, embeddable: true },
        { id: 'DWcJFNfaw9c', title: 'lofi hip hop – sleep/chill', seconds: 0, embeddable: true },
        { id: 'jfKfPfyJRdk', title: 'lofi hip hop – relax/study 2', seconds: 0, embeddable: true },
      ]
    }
  }
}
