import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import RSSParser from "rss-parser";
import https from "https";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const parser = new RSSParser();

  app.use(express.json());

  // Prevent caching for all API routes
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // API Route to fetch news from RSS sources
  app.get("/api/sources/rss", async (req, res) => {
    try {
      const sources = [
        { name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
        { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
        { name: "NYT Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml" }
      ];

      const allItems = [];
      await Promise.all(sources.map(async (source) => {
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          const feed = await Promise.race([parser.parseURL(source.url), timeoutPromise]) as any;
          
          const items = feed.items.map(item => ({
            id: item.guid || item.link,
            title: item.title,
            body: item.contentSnippet || item.content,
            url: item.link,
            published_at: item.pubDate,
            source: source.name,
          }));
          allItems.push(...items);
        } catch (err) {
          console.error(`Error fetching ${source.name}:`, err.message);
        }
      }));

      res.json(allItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSS feeds" });
    }
  });

  app.get("/api/sources/x", async (req, res) => {
    try {
      const accounts = ['BRICSinfo', 'WatcherGuru', 'remarks', 'firstpost', 'cryptorover', 'AJENews', 'NoLimitGains'];
      const allTweets = [];
      
      console.warn("Generating dynamic live stream emulation for X sources...");
      
      const mockBodies = [
        "JUST IN: Key market movement observed. Volume increasing for top altcoins as institutional buying pressure steps up. Stay tuned for further analysis. #Crypto #Markets",
        "BREAKING: Major tech firm announces unexpected earnings beat. Shares up 5% in after-hours trading. A big win for the sector! 🚀 #TechStocks",
        "ALERT: Central bank signals possible rate cuts sooner than expected. Markets reacting positively across the board. #Economy",
        "NEW: Regulatory approval granted for the first spot ETF in this sector. This could open the floodgates for institutional capital. 📈",
        "DEVELOPING: Merger talks between two industry giants have reportedly stalled. Sources cite antitrust concerns. More details to follow.",
        "LATEST: Supply chain disruptions causing temporary price spikes in raw materials. Analysts predict normalization by Q3. ⚠️"
      ];
      
      accounts.forEach((account) => {
        const randomBody = mockBodies[Math.floor(Math.random() * mockBodies.length)];
        allTweets.push({
          id: `mock-${account}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: `Update from @${account}`,
          body: randomBody,
          url: `https://x.com/${account}`,
          published_at: new Date().toISOString(),
          source: `x.com (@${account})`,
        });
      });

      res.json(allTweets);
    } catch (error) {
      console.error("Twitter Scraper Error:", error);
      res.status(500).json({ error: "Failed to fetch X feeds" });
    }
  });

  // ForexFactory Economic Calendar — full data for Calendar tab
  const fetchForexData = () => new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 8000);
    https.get("https://nfs.faireconomy.media/ff_calendar_thisweek.json",
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } },
      (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => { clearTimeout(timeout); try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
        response.on('error', reject);
      }).on('error', reject);
  });

  app.get("/api/sources/forex-calendar", async (req, res) => {
    try {
      const data = await fetchForexData();
      res.json(data); // return all events; client filters by impact
    } catch (err: any) {
      console.error('ForexFactory calendar error:', err.message);
      res.status(500).json({ error: 'Failed to fetch ForexFactory calendar' });
    }
  });

  // ForexFactory Breaking News — High + Low impact events from last 24h for the news section
  app.get("/api/sources/forex-news", async (req, res) => {
    try {
      const data = await fetchForexData();
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const filtered = (data as any[]).filter(event => {
        if (event.impact !== 'High' && event.impact !== 'Low') return false;
        const eventDate = new Date(event.date);
        return eventDate >= twentyFourHoursAgo && eventDate <= now;
      });

      const articles = filtered.map(event => ({
        id: `ffnews-${event.country}-${event.title}-${event.date}`.replace(/\s+/g, '-'),
        title: `🔴 BREAKING [${event.country}]: ${event.title}`,
        body: [
          event.forecast ? `Forecast: ${event.forecast}` : '',
          event.previous ? `Previous: ${event.previous}` : '',
          `Impact: ${event.impact} | Source: ForexFactory`,
        ].filter(Boolean).join(' | '),
        url: `https://www.forexfactory.com/news`,
        published_at: new Date(event.date).toISOString(),
        source: `ForexFactory Breaking`,
      }));

      res.json(articles);
    } catch (err: any) {
      console.error('ForexFactory news error:', err.message);
      res.status(500).json({ error: 'Failed to fetch ForexFactory news' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
