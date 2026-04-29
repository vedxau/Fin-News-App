export type Priority = "high" | "medium" | "low";
export type Sentiment = "bullish" | "bearish" | "neutral" | "positive" | "negative";
export type Category = "Crypto" | "Markets" | "Macro" | "Tech" | "Geopolitics" | "Energy";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: Category | string;
  priority: Priority;
  sentiment: Sentiment;
  impactScore: number;
  time: string;
  summary: string;
  tickers?: string[];
  region?: string;
  lat?: number;
  lon?: number;
  url?: string;
  published_at?: string;
}

export const CALENDAR = [
  { time: "08:30", country: "USA", flag: "🇺🇸", event: "NFP", impact: "high", forecast: "185K", previous: "175K", actual: "212K" },
  { time: "08:30", country: "USA", flag: "🇺🇸", event: "Unemployment Rate", impact: "high", forecast: "4.0%", previous: "4.1%", actual: "3.9%" },
  { time: "10:00", country: "USA", flag: "🇺🇸", event: "ISM Mfg PMI", impact: "medium", forecast: "49.5", previous: "48.7", actual: "" },
  { time: "12:45", country: "EUR", flag: "🇪🇺", event: "ECB Rate Decision", impact: "high", forecast: "4.25%", previous: "4.25%", actual: "" },
  { time: "13:30", country: "EUR", flag: "🇪🇺", event: "ECB Press Conference", impact: "high", forecast: "", previous: "", actual: "" },
  { time: "14:00", country: "CAN", flag: "🇨🇦", event: "BoC Statement", impact: "medium", forecast: "4.50%", previous: "4.75%", actual: "" },
  { time: "16:00", country: "USA", flag: "🇺🇸", event: "Crude Oil Inventories", impact: "low", forecast: "-1.2M", previous: "-2.6M", actual: "" },
  { time: "19:00", country: "USA", flag: "🇺🇸", event: "FOMC Minutes", impact: "high", forecast: "", previous: "", actual: "" },
  { time: "23:50", country: "JPN", flag: "🇯🇵", event: "Core Machinery Orders", impact: "low", forecast: "0.8%", previous: "-2.9%", actual: "" }
];

export const ENDPOINTS = [
  { name: "RSS · CoinTelegraph", url: "https://cointelegraph.com/rss", status: "operational", latency: 142, uptime: 99.98 },
  { name: "RSS · TechCrunch", url: "https://techcrunch.com/feed/", status: "operational", latency: 188, uptime: 99.94 },
  { name: "RSS · NYT Markets", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", status: "degraded", latency: 612, uptime: 98.71 },
  { name: "Social · X Stream", url: "https://x.com", status: "operational", latency: 96, uptime: 99.99 },
  { name: "Social · Reddit r/wsb", url: "https://reddit.com/r/wallstreetbets", status: "operational", latency: 220, uptime: 99.82 },
  { name: "LLM · Groq Llama 3", url: "https://api.groq.com", status: "operational", latency: 312, uptime: 99.91 },
  { name: "Cache · Redis Edge", url: "internal", status: "operational", latency: 8, uptime: 100 },
  { name: "Webhook · Slack Alerts", url: "https://hooks.slack.com", status: "operational", latency: 154, uptime: 99.77 }
];

export const TICKER_TAPE = [
  { sym: "BTC", price: "112,480", change: "+3.41%" },
  { sym: "ETH", price: "4,128", change: "+2.18%" },
  { sym: "SPX", price: "5,684", change: "+0.42%" },
  { sym: "NDX", price: "20,317", change: "+0.71%" },
  { sym: "DXY", price: "104.21", change: "-0.18%" },
  { sym: "BZ", price: "84.12", change: "+3.82%" },
  { sym: "GOLD", price: "2,418", change: "+0.96%" },
  { sym: "NVDA", price: "138.20", change: "+1.74%" },
  { sym: "TSLA", price: "224.40", change: "-2.11%" },
  { sym: "SOL", price: "204.10", change: "+4.62%" },
  { sym: "JPY", price: "162.30", change: "+0.34%" },
  { sym: "EUR", price: "1.0742", change: "-0.12%" }
];
