import React from "react";
import { PageHeader } from "../components/finpulse/PageHeader";
import { StatusPill } from "../components/finpulse/StatusPill";
import { useOutletContext } from "react-router-dom";
import type { Article } from "../types";
import { cn } from "../lib/utils";

export function Analytics() {
  const { articles } = useOutletContext<{ articles: Article[] }>();

  const total = articles.length || 1; // prevent div by zero
  const bullishCount = articles.filter(a => ["bullish", "positive"].includes(a.sentiment)).length;
  const neutralCount = articles.filter(a => a.sentiment === "neutral").length;
  const bearishCount = articles.filter(a => ["bearish", "negative"].includes(a.sentiment)).length;
  const avgImpact = articles.reduce((acc, curr) => acc + (curr.impact_score || 0), 0) / total * 100;

  const sparklineData = [12,18,14,22,28,26,31,24,29,36,41,38,44,50,47,53,60,55,62,68,64,71,78,74];
  const maxSpark = Math.max(...sparklineData);

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader eyebrow="INSIGHTS · 24h" title="Stream Analytics">
        <StatusPill label="REFRESH" value="60s" dotColor="blue" pulse />
      </PageHeader>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Articles", val: articles.length.toString(), delta: "+12.4%", color: "blue" },
          { label: "Avg Impact Score", val: avgImpact.toFixed(1), delta: "+3.1", color: "emerald" },
          { label: "P95 Latency", val: "412ms", delta: "-18ms", color: "amber" }
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 relative overflow-hidden">
            <span className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest">{stat.label}</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-2xl font-bold text-white">{stat.val}</span>
              <span className={cn("mono text-[11px] font-bold pb-1", `text-[var(--color-cyber-${stat.color})]`)}>{stat.delta}</span>
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-[1px] opacity-40 bg-[var(--color-cyber-${stat.color})]`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment */}
        <div className="glass rounded-xl p-5">
          <h3 className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest mb-6">Sentiment Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Bullish", count: bullishCount, color: "bg-[var(--color-cyber-emerald)]" },
              { label: "Neutral", count: neutralCount, color: "bg-[var(--color-cyber-blue)]" },
              { label: "Bearish", count: bearishCount, color: "bg-[var(--color-cyber-rose)]" }
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="mono text-[11px] text-[var(--color-muted-foreground)]">{s.label}</span>
                  <span className="mono text-[11px] text-white">{s.count} / {articles.length}</span>
                </div>
                <div className="h-[1.5px] w-full bg-white/10 overflow-hidden">
                  <div className={cn("h-full", s.color)} style={{ width: `${(s.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Throughput */}
        <div className="glass rounded-xl p-5">
          <h3 className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest mb-4">Ingestion Throughput</h3>
          <svg viewBox="0 0 240 100" className="w-full h-24 overflow-visible">
            <defs>
              <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-cyber-blue)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--color-cyber-blue)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline 
              points={sparklineData.map((d, i) => `${(i / (sparklineData.length - 1)) * 240},${100 - (d / maxSpark) * 100}`).join(" ")}
              fill="none" 
              stroke="var(--color-cyber-blue)" 
              strokeWidth="2"
            />
            <polygon 
              points={`0,100 ${sparklineData.map((d, i) => `${(i / (sparklineData.length - 1)) * 240},${100 - (d / maxSpark) * 100}`).join(" ")} 240,100`}
              fill="url(#spark-fill)"
            />
          </svg>
          <div className="flex justify-between mt-2 mono text-[9px] text-[var(--color-muted-foreground)]">
            <span>00:00</span>
            <span>12:00</span>
            <span>now</span>
          </div>
        </div>

        {/* Health */}
        <div className="glass rounded-xl p-5">
          <h3 className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest mb-5">System Health</h3>
          <div className="space-y-4">
            {[
              { label: "LLM Queue", val: "14/50", color: "text-[var(--color-cyber-emerald)]" },
              { label: "RSS Lag", val: "2.1s/5s", color: "text-[var(--color-cyber-blue)]" },
              { label: "Cache Hit", val: "94%", color: "text-[var(--color-cyber-emerald)]" },
              { label: "Errors/hr", val: "3", color: "text-[var(--color-cyber-amber)]" }
            ].map(h => (
              <div key={h.label} className="flex justify-between items-center pb-2 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                <span className="mono text-[11px] text-[var(--color-muted-foreground)]">{h.label}</span>
                <span className={cn("mono text-[11px]", h.color)}>{h.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
