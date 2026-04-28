import React, { useState, useRef, useEffect } from 'react';
import { Article, Priority } from '../types';
import NewsCard from './NewsCard';
import { Circle, Filter, ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriorityColumnProps {
  title: string;
  priority: Priority;
  articles: Article[];
  allSources: string[];
}

export default function PriorityColumn({ title, priority, articles, allSources }: PriorityColumnProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const clearFilters = () => setSelectedSources([]);

  const filtered = selectedSources.length > 0
    ? articles.filter(a => selectedSources.includes(a.source))
    : articles;

  const dotConfig = {
    High: { dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]", text: "text-rose-400", accent: "bg-rose-500/10 border-rose-500/25 text-rose-400" },
    Medium: { dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]", text: "text-amber-400", accent: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
    Low: { dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]", text: "text-blue-400", accent: "bg-blue-500/10 border-blue-500/25 text-blue-400" },
  };

  const cfg = dotConfig[priority];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex justify-between items-center sticky top-0 z-10"
        style={{ background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
          <h2 className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", cfg.text)} style={{ fontFamily: 'Inter' }}>
            {title}
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {filtered.length}
          </span>
        </div>

        {/* Filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setFilterOpen(prev => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all border",
              selectedSources.length > 0
                ? cfg.accent
                : "border-transparent text-slate-600 hover:text-slate-400 hover:border-white/10"
            )}
          >
            <Filter className="w-3 h-3" />
            {selectedSources.length > 0 ? `${selectedSources.length} active` : "Filter"}
            <ChevronDown className={cn("w-3 h-3 transition-transform", filterOpen && "rotate-180")} />
          </button>

          {filterOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ background: 'rgba(10,18,40,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Sources</span>
                {selectedSources.length > 0 && (
                  <button onClick={clearFilters} className="text-[9px] font-mono text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {allSources.length === 0 ? (
                  <p className="text-[10px] text-slate-600 font-mono px-3 py-3">No sources yet.</p>
                ) : (
                  allSources.map(source => (
                    <button
                      key={source}
                      onClick={() => toggleSource(source)}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-[11px] font-mono transition-colors hover:bg-white/[0.04]"
                      style={{ color: selectedSources.includes(source) ? '#e2e8f0' : '#64748b' }}
                    >
                      <span
                        className={cn("w-2 h-2 rounded-sm border flex-shrink-0 transition-colors",
                          selectedSources.includes(source)
                            ? cn("border-transparent", { High: "bg-rose-500", Medium: "bg-amber-400", Low: "bg-blue-500" }[priority])
                            : "border-slate-600"
                        )}
                      />
                      <span className="truncate">{source}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ background: 'transparent' }}>
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
            <Circle className="w-10 h-10 mb-3 animate-pulse text-slate-600" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
              {selectedSources.length > 0 ? "No matches" : "Waiting for stream..."}
            </span>
          </div>
        ) : (
          filtered.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  );
}
