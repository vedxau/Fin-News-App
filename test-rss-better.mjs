import RSSParser from 'rss-parser';

const parser = new RSSParser();
const sources = [
  { name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "NYT Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml" }
];

async function run() {
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      console.log(`\n=== ${source.name} ===`);
      console.log(`Total items: ${feed.items.length}`);
      if (feed.items.length > 0) {
        console.log(`Latest: ${feed.items[0].title} - ${feed.items[0].pubDate}`);
      }
    } catch (e) {
      console.log(`Failed to fetch ${source.name}: ${e.message}`);
    }
  }
}

run();
