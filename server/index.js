// server/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Expect env YT_API_KEY (server-side, NOT prefixed with VITE_)
const YT_API_KEY = process.env.YT_API_KEY;
if (!YT_API_KEY) {
  console.warn("[server] Missing YT_API_KEY in .env");
}

app.get("/api/youtubeSearch", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ error: "Missing q" });
    if (!YT_API_KEY) return res.status(500).json({ error: "Missing YT_API_KEY" });

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("key", YT_API_KEY);

    const r = await fetch(url.toString());
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "YouTube error", detail: text });
    }
    const data = await r.json();

    const items = (data.items || []).map((it) => ({
      videoId: it.id?.videoId,
      title: it.snippet?.title,
      channel: it.snippet?.channelTitle,
      thumb: it.snippet?.thumbnails?.medium?.url,
    })).filter(x => x.videoId);

    return res.json({ items });
  } catch (err) {
    console.error("[server] /api/youtubeSearch", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});