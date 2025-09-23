import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// YouTube Search API endpoint
app.get('/api/youtubeSearch', async (req, res) => {
  try {
    // Check if API key is available
    if (!process.env.YT_API_KEY) {
      return res.status(500).json({
        error: 'API key not configured',
        details: 'YouTube API key is missing from environment variables'
      });
    }

    const { mood = '', q: directQuery, pageToken } = req.query;
    const q = directQuery || (mood ? `${mood} lofi beats instrumental -lyrics` : 'lofi hip hop beats');

    console.log('YouTube search request for:', q);


    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '25',
      q,
      key: process.env.YT_API_KEY,
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      safeSearch: 'moderate'
    });
    if (pageToken) params.set('pageToken', pageToken);

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

    // For development - if API key has referrer restrictions, we might need to handle this differently
    const headers = {
      'User-Agent': 'TuneIn-Frontend/1.0'
    };

    // Try to set appropriate referrer for production vs development
    if (process.env.NODE_ENV === 'production') {
      headers['Referer'] = 'https://your-production-domain.com';
    }

    console.log('Making YouTube API request to:', url.replace(process.env.YT_API_KEY, 'HIDDEN'));
    const r = await fetch(url, { headers });
    if (!r.ok) {
      const txt = await r.text();
      console.error('YouTube API error:', r.status, txt);

      // If it's a 403 error due to referrer restrictions, provide API key guidance
      if (r.status === 403 && txt.includes('referer')) {
        return res.status(500).json({
          error: 'YouTube API referrer restriction',
          details: 'API key has referrer restrictions. For development, you can:\n1. Add localhost:5173 to API key restrictions in Google Cloud Console\n2. Create an unrestricted API key for development',
          suggestion: 'Configure your API key restrictions in Google Cloud Console'
        });
      }

      return res.status(r.status).json({ error: 'YouTube API error', details: txt });
    }
    const data = await r.json();

    const items = (data.items || []).map(it => ({
      id: it.id.videoId,
      title: it.snippet.title,
      artist: it.snippet.channelTitle,
      artwork: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url
    }));

    const videoIds = items.map(item => item.id);
    res.json({ videoIds, items, nextPageToken: data.nextPageToken || null });
  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ error: 'server_error', details: String(e) });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});