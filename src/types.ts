export type Priority = "High" | "Medium" | "Low";
export type Sentiment = "positive" | "neutral" | "negative";

export interface Article {
  id: string;
  source: string;
  url: string;
  title: string;
  body: string;
  published_at: string;
  ingested_at: string;
  priority: Priority;
  categories: string[];
  entities: string[];
  sentiment: Sentiment;
  impact_score: number;
}

export interface MonitoredAccount {
  id: string;
  username: string;
  platform: string;
  added_at: string;
  precision: number;
  avg_latency: number;
  status: "active" | "candidate" | "watchlisted";
}
