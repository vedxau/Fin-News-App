import { useState, useEffect } from 'react';
import { Article } from '../types';
import { analyzeNewsItem } from '../services/geminiService';

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem('finpulse_articles');
    if (stored) {
      try {
        setArticles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored articles");
      }
    }
    setLoading(false);
  }, []);

  // Save to local storage whenever articles change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('finpulse_articles', JSON.stringify(articles));
    }
  }, [articles, loading]);

  const triggerIngestion = async () => {
    setIngesting(true);
    try {
      const rssResponse = await fetch('/api/sources/rss');
      const rawArticles = await rssResponse.json();

      const xResponse = await fetch('/api/sources/x');
      const xArticles = await xResponse.json();

      const combined = [...rawArticles, ...xArticles];

      const existingIds = new Set(articles.map(a => a.id));
      
      const rawToProcess = combined.filter(raw => !existingIds.has(raw.id));

      const analysisPromises = rawToProcess.map(async (raw) => {
        const analysis = await analyzeNewsItem(raw.title, raw.body);
        return {
          ...raw,
          ...analysis,
          ingested_at: new Date().toISOString(),
          published_at: raw.published_at ? new Date(raw.published_at).toISOString() : new Date().toISOString()
        } as Article;
      });

      const newArticles = await Promise.all(analysisPromises);

      if (newArticles.length > 0) {
        setArticles(prev => {
          const updated = [...newArticles, ...prev];
          return updated.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        });
      }

    } catch (error) {
      console.error("Ingestion failed:", error);
    } finally {
      setIngesting(false);
    }
  };

  return { articles, loading, ingesting, triggerIngestion };
}
