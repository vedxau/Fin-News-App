import RSSParser from 'rss-parser';

const parser = new RSSParser();
const sources = [
  { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml" },
  { name: "CNN Business", url: "http://rss.cnn.com/rss/money_latest.rss" },
  { name: "Al Jazeera Business", url: "https://www.aljazeera.com/xml/rss/all.xml" }
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
