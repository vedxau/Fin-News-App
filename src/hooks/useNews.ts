import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, addDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, Priority } from '../types';
import { analyzeNewsItem } from '../services/geminiService';

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'articles'),
      orderBy('published_at', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Article[];
      setArticles(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const triggerIngestion = async () => {
    setIngesting(true);
    try {
      // 1. Fetch raw news from our Express server
      const rssResponse = await fetch('/api/sources/rss');
      const rawArticles = await rssResponse.json();

      const xResponse = await fetch('/api/sources/x');
      const xArticles = await xResponse.json();

      const combined = [...rawArticles, ...xArticles];

      // 2. Process each new article (deduplication check simplified here)
      // For demo, we'll just check if the ID already exists in our current state
      const existingIds = new Set(articles.map(a => a.id));
      
      for (const raw of combined) {
        if (existingIds.has(raw.id)) continue;

        // 3. Analyze with Gemini
        const analysis = await analyzeNewsItem(raw.title, raw.body);

        // 4. Save to Firestore
        await addDoc(collection(db, 'articles'), {
          ...raw,
          ...analysis,
          ingested_at: new Date().toISOString(),
          // Use original pub date if possible
          published_at: raw.published_at ? new Date(raw.published_at).toISOString() : new Date().toISOString()
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
