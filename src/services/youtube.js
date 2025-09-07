export async function fetchMoodPlaylist(mood, pageToken) {
  const url = new URL('/api/youtubeSearch', window.location.origin)
  url.searchParams.set('mood', mood)
  if (pageToken) url.searchParams.set('pageToken', pageToken)
  const r = await fetch(url.toString())
  if (!r.ok) throw new Error('YouTube search failed')
  return r.json()
}
