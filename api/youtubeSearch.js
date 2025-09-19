// api/youtubeSearch.js
export default async function handler(req, res) {
  try {
    const { mood = '', q: directQuery, pageToken } = req.query;
    const q = directQuery || (mood ? `${mood} lofi beats instrumental -lyrics` : 'lofi hip hop beats');

    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '25',
      q,
      key: process.env.YT_API_KEY,           // ← make sure this exists!
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      safeSearch: 'moderate'
    });
    if (pageToken) params.set('pageToken', pageToken);

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: 'upstream_error', details: txt });
    }
    const data = await r.json();

    const items = (data.items || []).map(it => ({
      id: it.id?.videoId,
      title: it.snippet?.title,
      artist: it.snippet?.channelTitle,
      artwork: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url
    })).filter(x => x.id);

    const videoIds = items.map(i => i.id);
    res.json({ videoIds, items, nextPageToken: data.nextPageToken || null });
  } catch (e) {
    res.status(500).json({ error: 'server_error', details: String(e) });
  }
}