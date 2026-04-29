import RSSParser from 'rss-parser';

const parser = new RSSParser();
const sources = [
  { name: "CNBC", url: "https://search.cnbc.com/rs/search/view.html?partnerId=2000&id=10000664" },
  { name: "Yahoo", url: "https://finance.yahoo.com/news/rss" },
  { name: "WSJ", url: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml" }
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
