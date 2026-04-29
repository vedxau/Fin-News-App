import React from "react";
import { cn } from "../../lib/utils";

interface StatusPillProps {
  label: string;
  value: string;
  dotColor?: "blue" | "emerald" | "rose" | "amber" | "muted";
  pulse?: boolean;
}

export function StatusPill({ label, value, dotColor = "muted", pulse = false }: StatusPillProps) {
  const colorMap = {
    blue: "bg-[var(--color-cyber-blue)] text-[var(--color-cyber-blue)]",
    emerald: "bg-[var(--color-cyber-emerald)] text-[var(--color-cyber-emerald)]",
    rose: "bg-[var(--color-cyber-rose)] text-[var(--color-cyber-rose)]",
    amber: "bg-[var(--color-cyber-amber)] text-[var(--color-cyber-amber)]",
    muted: "bg-slate-500 text-slate-500",
  };

  const bgClass = colorMap[dotColor].split(' ')[0];
  const textClass = colorMap[dotColor].split(' ')[1];

  return (
    <div className="glass mono text-[10px] uppercase tracking-[0.18em] rounded-full px-3 py-1 flex items-center gap-2 text-slate-300">
      <div className="relative w-1.5 h-1.5 flex items-center justify-center flex-shrink-0">
        {pulse && (
          <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", bgClass)} />
        )}
        <span className={cn("relative inline-flex rounded-full w-1.5 h-1.5", bgClass, pulse && "animate-pulse-dot")} />
      </div>
      <span>
        {label} <span className={cn("font-bold ml-1", textClass)}>{value}</span>
      </span>
    </div>
  );
}
