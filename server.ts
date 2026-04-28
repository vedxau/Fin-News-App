import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import RSSParser from "rss-parser";
import { Scraper } from 'agent-twitter-client';
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

  // Endpoint for X.com accounts as per PDF requirements
const scraper = new Scraper();
let isScraperLoggedIn = false;

  app.get("/api/sources/x", async (req, res) => {
    try {
      if (!isScraperLoggedIn) {
        await scraper.login('Vedxau', 'Vedika!1');
        isScraperLoggedIn = true;
      }

      const accounts = ['BRICSinfo', 'WatcherGuru', 'remarks', 'firstpost', 'cryptorover', 'AJENews', 'NoLimitGains'];
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const allTweets = [];

      for (const account of accounts) {
        try {
          const tweetIterator = scraper.getTweets(account, 10);
          for await (const tweet of tweetIterator) {
            const tweetDate = tweet.timeParsed ? new Date(tweet.timeParsed) : new Date(tweet.timestamp ? tweet.timestamp * 1000 : Date.now());
            if (tweetDate > twentyFourHoursAgo && tweet.text) {
              allTweets.push({
                id: tweet.id || Math.random().toString(),
                title: `Update from @${account}`,
                body: tweet.text,
                url: `https://x.com/${account}/status/${tweet.id}`,
                published_at: tweetDate.toISOString(),
                source: `x.com (@${account})`,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching tweets for ${account}:`, err);
        }
      }

      res.json(allTweets);
    } catch (error) {
      console.error("Twitter Scraper Error:", error);
      res.status(500).json({ error: "Failed to fetch X feeds" });
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
