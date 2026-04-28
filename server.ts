import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import RSSParser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const parser = new RSSParser();

  app.use(express.json());

  // API Route to fetch news from RSS sources
  app.get("/api/sources/rss", async (req, res) => {
    try {
      const sources = [
        { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml" },
        { name: "CNN Business", url: "http://rss.cnn.com/rss/money_latest.rss" },
        { name: "Al Jazeera Business", url: "https://www.aljazeera.com/xml/rss/all.xml" } // Note: Al Jazeera might have specific business ones, using all for now
      ];

      const allItems = [];
      for (const source of sources) {
        try {
          const feed = await parser.parseURL(source.url);
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
          console.error(`Error fetching ${source.name}:`, err);
        }
      }

      res.json(allItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSS feeds" });
    }
  });

  // Mock endpoint for X.com accounts as per PDF requirements
  app.get("/api/sources/x", async (req, res) => {
    res.json([
      {
        id: "x-1",
        title: "Fed expected to hold rates according to latest Bloomberg report",
        body: "Inside sources suggest the FOMC is leaning towards a pause.",
        url: "https://x.com/BreakingNews/status/123",
        published_at: new Date().toISOString(),
        source: "x.com (@BreakingNews)",
      },
      {
        id: "x-2",
        title: "Apple reports record earnings for Q2, stock up 5% pre-market",
        body: "$AAPL beats expectations on iPhone sales and services growth.",
        url: "https://x.com/WallStreetMojo/status/456",
        published_at: new Date().toISOString(),
        source: "x.com (@WallStreetMojo)",
      }
    ]);
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
