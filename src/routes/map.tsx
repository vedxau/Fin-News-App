import React, { useState } from "react";
import { PageHeader } from "../components/finpulse/PageHeader";
import { StatusPill } from "../components/finpulse/StatusPill";
import { useOutletContext } from "react-router-dom";
import type { Article } from "../types";
import { cn } from "../lib/utils";
import { MapPin } from "lucide-react";

export function Map() {
  const { articles } = useOutletContext<{ articles: Article[] }>();
  const [activeItem, setActiveItem] = useState<Article | null>(null);

  // Use the live articles but assign fake coordinates to ones without them,
  // or we can use the prompt's SVG map structure
  const mappedNodes = articles.slice(0, 15).map((a, i) => {
    // Generate deterministic fake coordinates for visually distributed pins
    const lat = 20 + (Math.sin(i * 1.5) * 40);
    const lon = -100 + (Math.cos(i * 0.8) * 160);
    const x = ((lon + 180) / 360) * 960;
    const y = ((90 - lat) / 180) * 480;
    
    return { ...a, x, y, priority: a.priority.toLowerCase() };
  });

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <PageHeader eyebrow="GEO · LIVE EVENTS" title="Live Market Map" />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 min-h-[500px]">
        {/* Left Map */}
        <div className="glass rounded-xl relative overflow-hidden flex items-center justify-center p-4">
          <div className="scanlines z-10" />
          
          <svg viewBox="0 0 960 480" className="w-full h-full opacity-80 z-0">
            {/* Grid lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={480} stroke="oklch(1 0 0 / 0.05)" strokeWidth="1" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 80} x2={960} y2={i * 80} stroke="oklch(1 0 0 / 0.05)" strokeWidth="1" />
            ))}
            
            {/* Very rough stylized continent blobs */}
            <path d="M200,100 Q250,50 300,80 T320,150 T280,220 T200,200 Z" fill="oklch(0.30 0.04 260 / 0.55)" stroke="var(--color-cyber-blue)" strokeOpacity="0.35" />
            <path d="M280,250 Q320,280 300,350 T250,420 T220,380 Z" fill="oklch(0.30 0.04 260 / 0.55)" stroke="var(--color-cyber-blue)" strokeOpacity="0.35" />
            <path d="M450,80 Q520,40 550,90 T500,160 T420,120 Z" fill="oklch(0.30 0.04 260 / 0.55)" stroke="var(--color-cyber-blue)" strokeOpacity="0.35" />
            <path d="M460,180 Q520,160 550,220 T500,320 T440,280 Z" fill="oklch(0.30 0.04 260 / 0.55)" stroke="var(--color-cyber-blue)" strokeOpacity="0.35" />
            <path d="M580,60 Q650,20 750,80 T800,200 T650,150 Z" fill="oklch(0.30 0.04 260 / 0.55)" stroke="var(--color-cyber-blue)" strokeOpacity="0.35" />
            <path d="M750,250 Q850,250 820,350 T720,320 Z" fill="oklch(0.30 0.04 260 / 0.55)" stroke="var(--color-cyber-blue)" strokeOpacity="0.35" />

            {/* Nodes */}
            {mappedNodes.map((node, i) => {
              const isActive = activeItem?.id === node.id;
              const isDim = activeItem && !isActive;
              const pColor = node.priority === "high" ? "var(--color-cyber-rose)" : node.priority === "medium" ? "var(--color-cyber-amber)" : "var(--color-cyber-blue)";
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className={cn("cursor-pointer transition-opacity duration-300", isDim ? "opacity-30" : "opacity-100", isActive && "drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]")}
                  onClick={() => setActiveItem(node)}
                  onMouseEnter={() => setActiveItem(node)}
                >
                  <circle r="28" fill={`url(#glow-${node.priority})`} opacity="0.4" />
                  <circle r="4" fill={pColor} />
                  <circle r="4" fill="transparent" stroke={pColor} strokeWidth="1.5">
                    <animate attributeName="r" values="4;22" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
            
            <defs>
              <radialGradient id="glow-high">
                <stop offset="0%" stopColor="var(--color-cyber-rose)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="glow-medium">
                <stop offset="0%" stopColor="var(--color-cyber-amber)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="glow-low">
                <stop offset="0%" stopColor="var(--color-cyber-blue)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-20 flex gap-2">
            <StatusPill label="H" value="" dotColor="rose" />
            <StatusPill label="M" value="" dotColor="amber" />
            <StatusPill label="L" value="" dotColor="blue" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          <div className="glass rounded-xl p-4 flex-1">
            <h3 className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest mb-4">Event Detail</h3>
            {activeItem ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h4 className="text-sm font-semibold text-white mb-2">{activeItem.title}</h4>
                <p className="text-[11px] text-[var(--color-muted-foreground)] mb-4 line-clamp-3">{activeItem.body}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Source", val: activeItem.source },
                    { label: "Category", val: activeItem.categories?.[0] || "General" },
                    { label: "Sentiment", val: activeItem.sentiment },
                    { label: "Impact", val: Math.round(activeItem.impact_score * 100) },
                  ].map(d => (
                    <div key={d.label}>
                      <div className="mono text-[9px] text-[var(--color-muted-foreground)] uppercase">{d.label}</div>
                      <div className="mono text-[11px] text-white truncate">{d.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-[var(--color-muted-foreground)] border border-dashed border-[var(--color-border)] rounded-lg">
                <MapPin className="w-6 h-6 mb-2 opacity-50" />
                <span className="mono text-[10px] uppercase">Select a node</span>
              </div>
            )}

            <h3 className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest mb-3 border-t border-[var(--color-border)] pt-4">Recent Pings</h3>
            <div className="flex flex-col gap-2">
              {mappedNodes.slice(0, 6).map(node => (
                <div 
                  key={node.id} 
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                    activeItem?.id === node.id ? "bg-white/10" : "hover:bg-white/5"
                  )}
                  onClick={() => setActiveItem(node)}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", node.priority === 'high' ? "bg-[var(--color-cyber-rose)]" : node.priority === 'medium' ? "bg-[var(--color-cyber-amber)]" : "bg-[var(--color-cyber-blue)]")} />
                  <span className="text-[11px] text-white truncate flex-1">{node.title}</span>
                  <span className="mono text-[9px] text-[var(--color-muted-foreground)]">now</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
