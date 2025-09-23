'use strict'

// Vercel Node runtime
// env: YT_API_KEY (server-side only)
// GET /api/youtubeSearch?q=lofi%20study&max=25

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
      return res.status(500).json({ error: 'Missing YT_API_KEY' })
    }

    const { q = '', max = '25', region = 'US' } = req.query
    const maxResults = clampInt(max, 5, 50, 25)
    const query = String(q).trim()

    if (!query) {
      return res.status(400).json({ error: 'Missing query ?q=' })
    }

    console.log('[youtubeSearch] query:', query)

    // STEP 1: search
    const searchURL = new URL('https://www.googleapis.com/youtube/v3/search')
    searchURL.searchParams.set('part', 'snippet')
    searchURL.searchParams.set('type', 'video')
    searchURL.searchParams.set('maxResults', String(maxResults))
    searchURL.searchParams.set('q', query)
    searchURL.searchParams.set('safeSearch', 'moderate')
    searchURL.searchParams.set('videoEmbeddable', 'true')
    // videoSyndicated can be overly strict; leave OFF unless you must
    // searchURL.searchParams.set('videoSyndicated','true')
    searchURL.searchParams.set('regionCode', region)
    searchURL.searchParams.set('key', apiKey)

    const search = await fetchJson(searchURL.toString())
    const ids = (search.items || [])
      .map(it => it?.id?.videoId)
      .filter(Boolean)

    if (ids.length === 0) {
      console.warn('[youtubeSearch] search returned 0 items for:', query)
      return res.json({ items: [] })
    }

    // STEP 2: fetch details for duration/embeddable checks
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
    return res.status(500).json({ error: String(err.message || err) })
  }
}