import express from "express";
import RSSParser from "rss-parser";

const app = express();
const parser = new RSSParser();

app.use(express.json());

app.get("/api/sources/rss", async (req, res) => {
  try {
    const sources = [
      { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml" },
      { name: "CNN Business", url: "http://rss.cnn.com/rss/money_latest.rss" },
      { name: "Al Jazeera Business", url: "https://www.aljazeera.com/xml/rss/all.xml" }
    ];

    const allItems = [];
    await Promise.all(sources.map(async (source) => {
      try {
        // Set a 5-second timeout for RSS parser
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

import { Scraper } from 'agent-twitter-client';

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

    await Promise.all(accounts.map(async (account) => {
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
    }));

    res.json(allTweets);
  } catch (error) {
    console.error("Twitter Scraper Error:", error);
    res.status(500).json({ error: "Failed to fetch X feeds" });
  }
});

export default app;
