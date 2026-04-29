import React from "react";
import { PageHeader } from "../components/finpulse/PageHeader";
import { Clock } from "lucide-react";
import { CALENDAR } from "../lib/finpulse-data";
import { cn } from "../lib/utils";

export function Calendar() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        eyebrow="MACRO · 24h" 
        title="Economic Calendar" 
      />

      <div className="glass rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_70px_1fr_70px_90px_90px_90px] px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50">
          {["Time", "Region", "Event", "Impact", "Forecast", "Previous", "Actual"].map(h => (
            <div key={h} className={cn("mono text-[10px] uppercase text-[var(--color-muted-foreground)]", ["Forecast", "Previous", "Actual"].includes(h) && "text-right")}>
              {h}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="divide-y divide-[var(--color-border)]">
          {CALENDAR.map((ev, i) => {
            const isHigh = ev.impact === "high";
            const isMedium = ev.impact === "medium";
            const iColor = isHigh ? "bg-[var(--color-cyber-rose)]" : isMedium ? "bg-[var(--color-cyber-amber)]" : "bg-[var(--color-cyber-blue)]";
            const bars = isHigh ? 3 : isMedium ? 2 : 1;
            
            // Actual coloring logic
            let actualColor = "text-[var(--color-foreground)]";
            if (ev.actual && ev.forecast) {
              const act = parseFloat(ev.actual);
              const forc = parseFloat(ev.forecast);
              if (!isNaN(act) && !isNaN(forc)) {
                if (act > forc) actualColor = "text-[var(--color-cyber-emerald)]";
                else if (act < forc) actualColor = "text-[var(--color-cyber-rose)]";
              }
            }

            return (
              <div key={i} className="grid grid-cols-[80px_70px_1fr_70px_90px_90px_90px] px-4 py-3 items-center hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-1.5 mono text-[11px] text-[var(--color-muted-foreground)]">
                  <Clock className="w-3.5 h-3.5" />
                  {ev.time}
                </div>
                <div className="flex items-center gap-1.5 mono text-[11px]">
                  <span>{ev.flag}</span>
                  <span>{ev.country}</span>
                </div>
                <div className="text-[13px] font-medium text-white">{ev.event}</div>
                <div className="flex gap-[2px]">
                  {[1,2,3].map(bar => (
                    <div key={bar} className={cn("w-[2px] h-3 rounded-full", bar <= bars ? iColor : "bg-[var(--color-border)]")} />
                  ))}
                </div>
                <div className="mono text-[11px] text-[var(--color-muted-foreground)] text-right">{ev.forecast || "-"}</div>
                <div className="mono text-[11px] text-[var(--color-muted-foreground)] text-right">{ev.previous || "-"}</div>
                <div className={cn("mono text-[11px] font-bold text-right", !ev.actual && "text-[var(--color-muted-foreground)] font-normal", actualColor)}>
                  {ev.actual || "-"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
