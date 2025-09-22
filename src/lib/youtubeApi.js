export async function searchYouTube(query) {
  const q = String(query || "").trim();
  if (!q) return { items: [] };

  const res = await fetch(`/api/youtubeSearch?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`youtubeSearch failed (${res.status}): ${detail}`);
  }
  return res.json();
}