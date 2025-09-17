import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q required' });

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=10&q=${encodeURIComponent(q)}&key=${process.env.YT_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return res.status(502).json({ error: 'youtube_failed', status: r.status });

  const data = await r.json();
  const videoIds = (data.items || []).map((it: any) => it?.id?.videoId).filter(Boolean);
  return res.status(200).json({ videoIds });
}