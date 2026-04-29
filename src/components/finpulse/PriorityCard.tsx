import React from "react";
import { TrendingUp, TrendingDown, Minus, Flame, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { NewsItem } from "../../lib/finpulse-data";

export function PriorityCard({ article }: { article: NewsItem }) {
  const pColors = {
    high: "var(--color-cyber-rose)",
    medium: "var(--color-cyber-amber)",
    low: "var(--color-border)",
  };

  const pColor = pColors[article.priority] || "var(--color-border)";
  const isHigh = article.priority === "high";
  const isMedium = article.priority === "medium";

  const sIcons = {
    bullish: <TrendingUp className="w-3.5 h-3.5" />,
    bearish: <TrendingDown className="w-3.5 h-3.5" />,
    neutral: <Minus className="w-3.5 h-3.5" />,
    positive: <TrendingUp className="w-3.5 h-3.5" />,
    negative: <TrendingDown className="w-3.5 h-3.5" />,
  };
  
  const sColors = {
    bullish: "text-[var(--color-cyber-emerald)]",
    bearish: "text-[var(--color-cyber-rose)]",
    neutral: "text-[var(--color-cyber-blue)]",
    positive: "text-[var(--color-cyber-emerald)]",
    negative: "text-[var(--color-cyber-rose)]",
  };

  return (
    <div 
      className="glass rounded-xl p-4 transition-all duration-300 group cursor-pointer relative overflow-hidden"
      style={{ 
        borderColor: pColor,
        // Optional subtle glow for high priority on hover
      }}
    >
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Top row */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="mono text-[9px] uppercase tracking-widest bg-white/10 text-white px-1.5 py-0.5 rounded">
            {article.category}
          </span>
          <span className="text-[10px] text-[var(--color-muted-foreground)] font-medium">
            {article.source}
          </span>
        </div>
        <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
          {article.time || "now"}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-semibold text-white leading-snug mb-2 group-hover:text-[var(--color-cyber-blue)] transition-colors relative z-10">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-2 mb-3 relative z-10">
        {article.summary}
      </p>

      {/* Tickers */}
      {article.tickers && article.tickers.length > 0 && (
        <div className="flex gap-1.5 mb-4 relative z-10">
          {article.tickers.map(t => (
            <span key={t} className="mono text-[9px] bg-[var(--color-background)]/50 border border-[var(--color-border)] text-slate-300 px-1.5 py-0.5 rounded">
              ${t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] relative z-10">
        <div className={cn("flex items-center gap-1.5 mono text-[10px] uppercase font-bold tracking-widest", sColors[article.sentiment])}>
          {sIcons[article.sentiment]} {article.sentiment}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mono text-[10px] text-[var(--color-muted-foreground)]">
            <Flame className={cn("w-3.5 h-3.5", isHigh ? "text-[var(--color-cyber-rose)]" : isMedium ? "text-[var(--color-cyber-amber)]" : "text-slate-500")} />
            {article.impactScore}
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Bottom Impact Bar */}
      <div className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-cyber-emerald)]" style={{ width: `${article.impactScore}%` }} />
    </div>
  );
}
