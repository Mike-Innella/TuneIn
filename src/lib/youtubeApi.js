export async function searchYouTube(query, maxResults = 25) {
  const q = String(query || "").trim();
  if (!q) return { items: [] };

  const url = new URL('/api/youtubeSearch', window.location.origin);
  url.searchParams.set('q', q);
  url.searchParams.set('max', String(maxResults));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`youtubeSearch failed (${res.status}): ${detail}`);
  }
  return res.json();
}