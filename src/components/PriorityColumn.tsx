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

  // Close dropdown when clicking outside
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

  const dotColor = {
    High: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    Medium: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    Low: "bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.6)]",
  };

  const accentColor = {
    High: "border-rose-500/50 text-rose-400",
    Medium: "border-amber-500/50 text-amber-400",
    Low: "border-slate-500/50 text-slate-400",
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151517] border-r border-[#262629] last:border-r-0 overflow-hidden">
      {/* Column Header */}
      <div className="p-4 border-b border-[#262629] bg-[#1a1a1c] sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", dotColor[priority])} />
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
              {title}
            </h2>
            <span className="bg-[#2c2c2e] text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {filtered.length}
            </span>
          </div>

          {/* Filter Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFilterOpen(prev => !prev)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all border",
                selectedSources.length > 0
                  ? cn("bg-[#2c2c2e]", accentColor[priority])
                  : "border-transparent text-slate-600 hover:text-slate-300"
              )}
            >
              <Filter className="w-3 h-3" />
              {selectedSources.length > 0 ? `${selectedSources.length} active` : "Filter"}
              <ChevronDown className={cn("w-3 h-3 transition-transform", filterOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e1e20] border border-[#333336] rounded-lg shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#333336]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Sources</span>
                  {selectedSources.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] font-mono text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {allSources.length === 0 ? (
                    <p className="text-[10px] text-slate-600 font-mono px-3 py-3">No sources yet. Click GET NEWS.</p>
                  ) : (
                    allSources.map(source => (
                      <button
                        key={source}
                        onClick={() => toggleSource(source)}
                        className={cn(
                          "w-full text-left px-3 py-2 flex items-center gap-2 text-[11px] font-mono transition-colors hover:bg-[#2c2c2e]",
                          selectedSources.includes(source) ? "text-slate-200" : "text-slate-500"
                        )}
                      >
                        <span className={cn(
                          "w-2 h-2 rounded-sm border transition-colors flex-shrink-0",
                          selectedSources.includes(source)
                            ? cn("border-transparent", {
                                High: "bg-rose-500",
                                Medium: "bg-amber-500",
                                Low: "bg-slate-400",
                              }[priority])
                            : "border-slate-600"
                        )} />
                        <span className="truncate">{source}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
            <Circle className="w-12 h-12 mb-4 animate-pulse text-slate-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-600">
              {selectedSources.length > 0 ? "No matches for filter" : "Waiting for stream..."}
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
