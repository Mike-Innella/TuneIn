'use strict'

// Vercel Node runtime - Combined YouTube Search API
// env: YT_API_KEY (server-side only)
// Supports both detailed search with duration filtering and simple search
// GET /api/youtubeSearch?q=lofi%20study&max=25 (detailed mode)
// GET /api/youtubeSearch?mood=relaxing (simple mode for TS compatibility)

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`YouTube API error ${res.status}: ${text}`)
  }
  return res.json()
}

const clampInt = (n, min, max, fallback) => {
  const x = parseInt(n, 10)
  if (Number.isNaN(x)) return fallback
  return Math.max(min, Math.min(max, x))
}

const ISO8601toSeconds = (dur) => {
  // PTxHxMxS
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  const h = parseInt(m[1] || '0', 10)
  const mn = parseInt(m[2] || '0', 10)
  const s = parseInt(m[3] || '0', 10)
  return h * 3600 + mn * 60 + s
}

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'server_error', details: 'Missing YT_API_KEY' })
    }

    // Support both query modes: direct query (q) and mood-based (mood)
    const { q: directQuery, mood = '', max = '25', region = 'US', pageToken } = req.query

    // If mood is provided, construct a lofi-focused query; otherwise use direct query
    const query = (directQuery || (mood ? `${mood} lofi beats instrumental -lyrics` : 'lofi hip hop beats')).trim()
    const maxResults = clampInt(max, 5, 50, 25)

    if (!query) {
      return res.status(400).json({ error: 'Missing query ?q=' })
    }

    console.log('[youtubeSearch] query:', query)

    // Determine response mode based on whether detailed info is needed
    const useDetailedMode = directQuery && !mood

    // STEP 1: search
    const searchURL = new URL('https://www.googleapis.com/youtube/v3/search')
    searchURL.searchParams.set('part', 'snippet')
    searchURL.searchParams.set('type', 'video')
    searchURL.searchParams.set('maxResults', String(maxResults))
    searchURL.searchParams.set('q', query)
    searchURL.searchParams.set('safeSearch', 'moderate')
    searchURL.searchParams.set('videoEmbeddable', 'true')

    // Include videoSyndicated for mood-based queries (TS mode)
    if (mood) {
      searchURL.searchParams.set('videoSyndicated', 'true')
    }

    if (region) {
      searchURL.searchParams.set('regionCode', region)
    }
    if (pageToken) {
      searchURL.searchParams.set('pageToken', pageToken)
    }
    searchURL.searchParams.set('key', apiKey)

    const search = await fetchJson(searchURL.toString())
    const searchItems = search.items || []

    if (searchItems.length === 0) {
      console.warn('[youtubeSearch] search returned 0 items for:', query)
      return res.json({ items: [], videoIds: [], nextPageToken: null })
    }

    const ids = searchItems
      .map(it => it?.id?.videoId)
      .filter(Boolean)

    // Simple mode (TS compatibility): return basic info without duration filtering
    if (!useDetailedMode) {
      const items = searchItems.map(it => ({
        id: it?.id?.videoId,
        title: it?.snippet?.title,
        artist: it?.snippet?.channelTitle,
        artwork: it?.snippet?.thumbnails?.medium?.url || it?.snippet?.thumbnails?.default?.url,
      })).filter(x => x.id)

      const videoIds = items.map(i => i.id)
      return res.status(200).json({
        videoIds,
        items,
        nextPageToken: search.nextPageToken || null
      })
    }

    // Detailed mode (JS compatibility): fetch details for duration/embeddable checks
    const detailsURL = new URL('https://www.googleapis.com/youtube/v3/videos')
    detailsURL.searchParams.set('part', 'contentDetails,statistics,status,snippet')
    detailsURL.searchParams.set('id', ids.join(','))
    detailsURL.searchParams.set('key', apiKey)

    const details = await fetchJson(detailsURL.toString())
    const MIN_SEC = 60        // >= 1 min
    const MAX_SEC = 30 * 60   // <= 30 min

    const filtered = (details.items || []).filter(v => {
      const dur = ISO8601toSeconds(v?.contentDetails?.duration || 'PT0S')
      const emb = v?.status?.embeddable !== false // treat undefined as true
      return emb && dur >= MIN_SEC && dur <= MAX_SEC
    })

    // shape response that client expects
    const items = filtered.map(v => ({
      id: v.id,
      title: v?.snippet?.title || '',
      channelTitle: v?.snippet?.channelTitle || '',
      duration: v?.contentDetails?.duration || 'PT0S',
      seconds: ISO8601toSeconds(v?.contentDetails?.duration || 'PT0S'),
      embeddable: v?.status?.embeddable !== false,
      thumbnails: v?.snippet?.thumbnails || {},
    }))

    if (items.length === 0) {
      console.warn('[youtubeSearch] 0 after filtering; relaxing rules and retrying once...')
      // Retry once with relaxed duration caps
      const relaxed = (details.items || []).filter(v => {
        const dur = ISO8601toSeconds(v?.contentDetails?.duration || 'PT0S')
        const emb = v?.status?.embeddable !== false
        return emb && dur >= 30 && dur <= (2 * 60 * 60) // 30s–2h
      }).map(v => ({
        id: v.id,
        title: v?.snippet?.title || '',
        channelTitle: v?.snippet?.channelTitle || '',
        duration: v?.contentDetails?.duration || 'PT0S',
        seconds: ISO8601toSeconds(v?.contentDetails?.duration || 'PT0S'),
        embeddable: v?.status?.embeddable !== false,
        thumbnails: v?.snippet?.thumbnails || {},
      }))
      return res.json({ items: relaxed })
    }

    return res.json({ items })
  } catch (err) {
    console.error('[youtubeSearch] fatal:', err)
    return res.status(500).json({ error: 'server_error', details: String(err.message || err) })
  }
}