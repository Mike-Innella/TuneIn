// server/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from local .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Expect env YT_API_KEY (server-side, NOT prefixed with VITE_)
const YT_API_KEY = process.env.YT_API_KEY;
console.log("[server] YT_API_KEY loaded:", YT_API_KEY ? `${YT_API_KEY.substring(0, 10)}...` : "MISSING");
if (!YT_API_KEY) {
  console.warn("[server] Missing YT_API_KEY in .env");
}

app.get("/api/youtubeSearch", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const maxResults = Math.min(Math.max(parseInt(req.query.max) || 25, 5), 50);

    if (!q) return res.status(400).json({ error: "Missing q" });
    if (!YT_API_KEY) return res.status(500).json({ error: "Missing YT_API_KEY" });

    console.log(`[server] YouTube search: "${q}", max: ${maxResults}`);

    // Step 1: Search for videos - add "short" to avoid ultra-long ambient tracks
    const enhancedQuery = `${q} short -8hours -10hours -12hours -long -sleep -meditation -relaxation`;
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", enhancedQuery);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(maxResults));
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("videoDuration", "medium"); // 4-20 minutes
    searchUrl.searchParams.set("key", YT_API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      const text = await searchRes.text();
      return res.status(searchRes.status).json({ error: "YouTube search error", detail: text });
    }
    const searchData = await searchRes.json();

    const videoIds = (searchData.items || [])
      .map(it => it.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return res.json({ items: [] });
    }

    // Step 2: Get video details including duration
    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.set("part", "contentDetails,snippet,status");
    detailsUrl.searchParams.set("id", videoIds.join(","));
    detailsUrl.searchParams.set("key", YT_API_KEY);

    const detailsRes = await fetch(detailsUrl.toString());
    if (!detailsRes.ok) {
      const text = await detailsRes.text();
      return res.status(detailsRes.status).json({ error: "YouTube details error", detail: text });
    }
    const detailsData = await detailsRes.json();

    // Helper function to convert ISO 8601 duration to seconds
    const ISO8601toSeconds = (dur) => {
      const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!m) return 0;
      const h = parseInt(m[1] || '0', 10);
      const mn = parseInt(m[2] || '0', 10);
      const s = parseInt(m[3] || '0', 10);
      return h * 3600 + mn * 60 + s;
    };

    // Step 3: Filter and format results
    const items = (detailsData.items || [])
      .filter(v => {
        const duration = ISO8601toSeconds(v?.contentDetails?.duration || 'PT0S');
        const embeddable = v?.status?.embeddable !== false;
        const valid = embeddable && duration >= 30 && duration <= 30 * 60; // 30s-30 minutes (relaxed)

        if (!valid) {
          console.log(`[server] Filtered out: ${v?.snippet?.title} (${duration}s, embeddable: ${embeddable})`);
        }

        return valid;
      })
      .map(v => ({
        id: v.id,
        videoId: v.id,
        title: v.snippet?.title || '',
        artist: v.snippet?.channelTitle || '',
        channelTitle: v.snippet?.channelTitle || '',
        duration: v.contentDetails?.duration || 'PT0S',
        seconds: ISO8601toSeconds(v.contentDetails?.duration || 'PT0S'),
        embeddable: v.status?.embeddable !== false,
        artwork: v.snippet?.thumbnails?.medium?.url,
        thumbnails: v.snippet?.thumbnails || {}
      }));

    console.log(`[server] Returning ${items.length} valid videos`);
    return res.json({ items });

  } catch (err) {
    console.error("[server] /api/youtubeSearch", err);
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});