// playlistBuilder.js
// Input: raw YouTube search results with { id, title, seconds, ... }
// Output: ordered tracks totaling >= sessionSec, with a final 'trimTo' on last item if overshoot

export function buildPlaylistToDuration(tracks, sessionSec) {
  // Input validation
  if (!Array.isArray(tracks) || tracks.length === 0) {
    console.warn('[playlistBuilder] No tracks provided');
    return { queue: [], total: 0 };
  }

  if (typeof sessionSec !== 'number' || sessionSec <= 0) {
    console.warn('[playlistBuilder] Invalid session duration:', sessionSec);
    return { queue: [], total: 0 };
  }

  // Filter out tracks with invalid duration
  const validTracks = tracks.filter(track =>
    track &&
    typeof track.seconds === 'number' &&
    track.seconds > 0 &&
    track.id
  );

  if (validTracks.length === 0) {
    console.warn('[playlistBuilder] No valid tracks after filtering');
    return { queue: [], total: 0 };
  }

  // Defensive: sort by duration ascending for smoother fills
  const sorted = [...validTracks].sort((a, b) => a.seconds - b.seconds);

  const queue = [];
  let total = 0;

  for (const t of sorted) {
    // If one track already meets/exceeds, choose it and trim
    if (queue.length === 0 && t.seconds >= sessionSec) {
      queue.push({
        ...t,
        startAt: 0,
        trimTo: sessionSec,
        durationSec: t.seconds
      }); // trim
      total = sessionSec;
      return { queue, total };
    }

    // Otherwise keep filling
    queue.push({
      ...t,
      startAt: 0,
      trimTo: null,
      durationSec: t.seconds
    });
    total += t.seconds;

    if (total >= sessionSec) {
      // Trim the last item so we exactly match the session length
      const overshoot = total - sessionSec;
      const last = queue[queue.length - 1];
      const trimmedLastDur = Math.max(1, last.seconds - overshoot); // min 1s
      queue[queue.length - 1] = {
        ...last,
        trimTo: trimmedLastDur,
        durationSec: last.seconds
      };
      total = sessionSec;
      return { queue, total };
    }
  }

  // If we still didn't reach session length (rare if you pass enough results),
  // loop smallest tracks until filled (fallback)
  const smallest = sorted[0];
  while (total < sessionSec && smallest) {
    const remaining = sessionSec - total;
    if (smallest.seconds >= remaining) {
      queue.push({
        ...smallest,
        startAt: 0,
        trimTo: remaining,
        durationSec: smallest.seconds
      });
      total = sessionSec;
      break;
    } else {
      queue.push({
        ...smallest,
        startAt: 0,
        trimTo: null,
        durationSec: smallest.seconds
      });
      total += smallest.seconds;
    }
  }

  return { queue, total };
}

// Helper function to normalize YouTube API results to ensure consistent format
export function normalizeYouTubeResults(apiItems) {
  return apiItems.map(item => ({
    id: item.videoId || item.id,
    videoId: item.videoId || item.id,
    title: item.title || item.snippet?.title || '',
    artist: item.artist || item.channelTitle || item.snippet?.channelTitle || '',
    seconds: item.seconds || item.durationSec || 0,
    artwork: item.artwork || item.thumbnails?.medium?.url || item.snippet?.thumbnails?.medium?.url,
    embeddable: item.embeddable !== false,
    duration: item.duration // Keep original duration string for reference
  })).filter(item => item.id && item.seconds > 0);
}