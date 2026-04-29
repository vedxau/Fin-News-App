import React from "react";
import { PageHeader } from "../components/finpulse/PageHeader";
import { PriorityCard } from "../components/finpulse/PriorityCard";
import { Filter, Layers, RefreshCw } from "lucide-react";
import type { Article } from "../types";
import type { NewsItem } from "../lib/finpulse-data";
import { StatusPill } from "../components/finpulse/StatusPill";
import { useOutletContext } from "react-router-dom";

export function Dashboard() {
  const { articles, onFetch } = useOutletContext<{ articles: Article[], onFetch: () => void }>();

  // Map real articles to the expected UI format
  const mappedArticles: NewsItem[] = articles.map(a => {
    return {
      id: a.id,
      title: a.title,
      source: a.source,
      category: a.categories?.[0] || "General",
      priority: (a.priority?.toLowerCase() || "low") as "high" | "medium" | "low",
      sentiment: a.sentiment,
      impactScore: Math.round((a.impact_score || 0) * 100),
      time: "recent", // We can improve relative time logic
      summary: a.body?.substring(0, 150) + "...",
      tickers: a.entities?.slice(0, 3) || []
    };
  });

  const highPriority = mappedArticles.filter(a => a.priority === "high");
  const mediumPriority = mappedArticles.filter(a => a.priority === "medium");
  const lowPriority = mappedArticles.filter(a => a.priority === "low");
  const bullishCount = mappedArticles.filter(a => ["bullish", "positive"].includes(a.sentiment)).length;
  const bullishPercent = mappedArticles.length > 0 ? Math.round((bullishCount / mappedArticles.length) * 100) : 0;
  
  const avgImpact = mappedArticles.length > 0 
    ? Math.round(mappedArticles.reduce((acc, curr) => acc + curr.impactScore, 0) / mappedArticles.length)
    : 0;

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        eyebrow="LIVE · AI TRIAGE" 
        title="Market Intelligence Dashboard" 
        description="Real-time RSS + social streams, prioritized and categorized by Groq Llama 3."
      >
        <button className="glass px-3 py-1.5 rounded flex items-center gap-2 text-[12px] text-white hover:bg-white/5 transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
        <button className="glass px-3 py-1.5 rounded flex items-center gap-2 text-[12px] text-white hover:bg-white/5 transition-colors">
          <Layers className="w-3.5 h-3.5" /> Sources · 5
        </button>
        <button onClick={onFetch} className="glass border-[var(--color-cyber-blue)]/50 bg-[var(--color-cyber-blue)]/10 px-3 py-1.5 rounded flex items-center gap-2 text-[12px] text-[var(--color-cyber-blue)] hover:bg-[var(--color-cyber-blue)]/20 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Articles · 24h", val: mappedArticles.length.toString(), delta: "+12%", color: "emerald", dColor: "text-[var(--color-cyber-emerald)]" },
          { label: "High Priority", val: highPriority.length.toString(), delta: "+3", color: "rose", dColor: "text-[var(--color-cyber-rose)]" },
          { label: "Bullish Bias", val: `${bullishPercent}%`, delta: "+4.1pt", color: "emerald", dColor: "text-[var(--color-cyber-emerald)]" },
          { label: "Avg Latency", val: "312ms", delta: "-42ms", color: "blue", dColor: "text-[var(--color-cyber-blue)]" }
        ].map((kpi, i) => (
          <div key={i} className="glass rounded-xl p-4 relative overflow-hidden">
            <span className="mono text-[9px] uppercase text-[var(--color-muted-foreground)] tracking-widest">{kpi.label}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold text-white">{kpi.val}</span>
              <span className={cn("mono text-[11px] font-bold", kpi.dColor)}>{kpi.delta}</span>
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-[1px] opacity-40 bg-gradient-to-r from-transparent via-[var(--color-cyber-${kpi.color})] to-transparent`} />
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Priority Column */}
        <div className="glass rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[var(--color-cyber-rose)]/20 via-[var(--color-cyber-rose)]/5 to-transparent pointer-events-none" />
          <div className="p-4 border-b border-[var(--color-border)] relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-cyber-rose)] shadow-[0_0_8px_var(--color-cyber-rose)]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">High Impact</h2>
              <div className="ml-auto">
                <StatusPill label="N" value={highPriority.length.toString()} dotColor="rose" />
              </div>
            </div>
            <p className="mono text-[9px] text-[var(--color-muted-foreground)]">Market-moving · LLM score ≥ 80</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {highPriority.map(a => <PriorityCard key={a.id} article={a} />)}
          </div>
        </div>

        {/* Medium Priority Column */}
        <div className="glass rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[var(--color-cyber-amber)]/20 via-[var(--color-cyber-amber)]/5 to-transparent pointer-events-none" />
          <div className="p-4 border-b border-[var(--color-border)] relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-cyber-amber)] shadow-[0_0_8px_var(--color-cyber-amber)]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Medium Impact</h2>
              <div className="ml-auto">
                <StatusPill label="N" value={mediumPriority.length.toString()} dotColor="amber" />
              </div>
            </div>
            <p className="mono text-[9px] text-[var(--color-muted-foreground)]">Notable · score 50–79</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {mediumPriority.map(a => <PriorityCard key={a.id} article={a} />)}
          </div>
        </div>

        {/* Low Priority Column */}
        <div className="glass rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[var(--color-cyber-blue)]/10 via-transparent to-transparent pointer-events-none" />
          <div className="p-4 border-b border-[var(--color-border)] relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Low Impact</h2>
              <div className="ml-auto">
                <StatusPill label="N" value={lowPriority.length.toString()} dotColor="muted" />
              </div>
            </div>
            <p className="mono text-[9px] text-[var(--color-muted-foreground)]">Background · score &lt; 50</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {lowPriority.map(a => <PriorityCard key={a.id} article={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
