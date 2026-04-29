import React, { useState, useEffect } from "react";
import { Activity, Search, RefreshCw, Sparkles, Wifi } from "lucide-react";
import { cn } from "../../lib/utils";
import { StatusPill } from "./StatusPill";
import { TICKER_TAPE } from "../../lib/finpulse-data";

export function TopNav({ onFetch, loading }: { onFetch: () => void, loading: boolean }) {
  const [timeStr, setTimeStr] = useState("--:--:--");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toISOString().substr(11, 8)); // UTC time
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full">
      {/* Header Row */}
      <header className="h-14 glass-strong border-b border-[var(--color-border)] px-4 lg:px-6 flex items-center gap-4">
        {/* Logo block */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[var(--color-cyber-blue)] to-[var(--color-cyber-emerald)] flex items-center justify-center ring-1 ring-inset ring-[var(--color-cyber-blue)]/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold tracking-tight text-white">
              Fin<span className="text-[var(--color-cyber-emerald)]">Pulse</span>
            </span>
            <span className="mono text-[8px] text-[var(--color-muted-foreground)]">v2.4 · Terminal</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex ml-4 relative w-64 glass rounded-md items-center px-3 h-8">
          <Search className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
          <input 
            type="text" 
            placeholder="Search tickers, headlines..." 
            className="bg-transparent border-none outline-none text-[11px] ml-2 w-full text-white placeholder-[var(--color-muted-foreground)]"
          />
          <span className="mono text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-[var(--color-muted-foreground)] ml-auto">⌘K</span>
        </div>

        {/* Status Pills */}
        <div className="hidden lg:flex items-center ml-auto gap-2">
          <StatusPill label="UTC" value={timeStr} dotColor="blue" />
          <StatusPill label="FEED" value="LIVE" dotColor="emerald" pulse />
          <StatusPill label="LLM" value="GROQ" dotColor="amber" />
          <StatusPill label="LAT" value="312ms" dotColor="muted" />
        </div>

        {/* GET NEWS Button */}
        <button
          onClick={onFetch}
          disabled={loading}
          className={cn(
            "relative overflow-hidden ml-auto lg:ml-2 h-8 px-4 rounded-md flex items-center gap-2 border transition-all active:scale-95",
            loading ? "opacity-70 cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted-foreground)]" :
            "bg-gradient-to-r from-[var(--color-cyber-blue)]/20 via-[var(--color-cyber-blue)]/10 to-[var(--color-cyber-emerald)]/20 border-[var(--color-cyber-blue)]/40 text-white shadow-[0_0_24px_-6px_rgba(59,130,246,0.6)] hover:border-[var(--color-cyber-blue)]/60"
          )}
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-cyber-blue)]" />
          )}
          <span className="mono text-[10px] uppercase font-bold tracking-widest">{loading ? "Fetching" : "Get News"}</span>
          
          {/* Shimmer effect */}
          {!loading && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full skew-x-12 animate-[shimmer_2.4s_infinite]" />
          )}
        </button>
      </header>

      {/* Ticker Tape */}
      <div className="h-7 border-b border-[var(--color-border)] bg-[var(--color-background)]/40 flex items-center overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-[ticker_60s_linear_infinite]">
          {[...TICKER_TAPE, ...TICKER_TAPE].map((item, i) => {
            const isUp = item.change.startsWith('+');
            return (
              <div key={i} className="flex items-center gap-2 px-4 border-r border-[var(--color-border)]">
                <Wifi className="w-3 h-3 text-[var(--color-muted-foreground)]" />
                <span className="mono text-[11px] font-bold text-white">{item.sym}</span>
                <span className="mono text-[11px] text-[var(--color-muted-foreground)]">{item.price}</span>
                <span className={cn("mono text-[10px] font-bold", isUp ? "text-[var(--color-cyber-emerald)]" : "text-[var(--color-cyber-rose)]")}>
                  {isUp ? '▲' : '▼'} {item.change}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Fade gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--color-background)] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--color-background)] to-transparent z-10 flex items-center justify-end pr-2">
          <span className="mono text-[8px] text-[var(--color-muted-foreground)]">▣ tape</span>
        </div>
      </div>
    </div>
  );
}
