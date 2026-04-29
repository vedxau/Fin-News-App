import { useState, useEffect } from 'react';
import { Article } from '../types';
import { analyzeNewsItem } from '../services/geminiService';

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    // v2 key: clears old cache that contained ForexFactory calendar articles
    const stored = localStorage.getItem('finpulse_articles_v2');
    if (stored) {
      try {
        setArticles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored articles");
      }
    }
    // Also remove old key if present
    localStorage.removeItem('finpulse_articles');
    setLoading(false);
  }, []);

  // Save to local storage whenever articles change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('finpulse_articles_v2', JSON.stringify(articles));
    }
  }, [articles, loading]);

  const triggerIngestion = async () => {
    setIngesting(true);
    try {
      // Add a timeout function to prevent UI hangs if the scraper gets blocked
      const fetchWithTimeout = async (url: string, ms: number) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
          const res = await fetch(url, { signal: controller.signal });
          return await res.json();
        } finally {
          clearTimeout(id);
        }
      };

      // Fetch RSS and X concurrently — ForexFactory calendar is ONLY for the Calendar tab
      const [rssResult, xResult] = await Promise.allSettled([
        fetchWithTimeout(`/api/sources/rss?t=${Date.now()}`, 6000),
        fetchWithTimeout(`/api/sources/x?t=${Date.now()}`, 18000),
      ]);

      const rawArticles = rssResult.status === 'fulfilled' ? rssResult.value : [];
      const xArticles = xResult.status === 'fulfilled' ? xResult.value : [];

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
