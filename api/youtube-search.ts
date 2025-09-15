import type { VercelRequest, VercelResponse } from '@vercel/node';

const YT_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const q = (req.query.q as string) || '';
    const maxResults = Number(req.query.maxResults ?? 15);
    if (!q) return res.status(400).json({ error: 'Missing q' });

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });

    const url = new URL(YT_ENDPOINT);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', q);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoCategoryId', '10'); // Music
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('key', key);

    const r = await fetch(url.toString());
    const data = await r.json();

    // Normalize
    const items = (data.items || []).map((it: any) => ({
      id: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      thumb: it.snippet.thumbnails?.medium?.url,
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    return res.status(200).json({ items });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}