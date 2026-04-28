import React from 'react';
import { Article, Priority } from '../types';
import NewsCard from './NewsCard';
import { Circle, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriorityColumnProps {
  title: string;
  priority: Priority;
  articles: Article[];
}

export default function PriorityColumn({ title, priority, articles }: PriorityColumnProps) {
  const dotColor = {
    High: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    Medium: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    Low: "bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.6)]",
  };

  return (
    <div className="flex flex-col h-full bg-[#151517] border-r border-[#262629] last:border-r-0 overflow-hidden">
      <div className="p-4 border-b border-[#262629] bg-[#1a1a1c] sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", dotColor[priority])} />
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
            {title}
          </h2>
          <span className="bg-[#2c2c2e] text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {articles.length}
          </span>
        </div>
        <Filter className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {articles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
            <Circle className="w-12 h-12 mb-4 animate-pulse text-slate-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-600">Waiting for stream...</span>
          </div>
        ) : (
          articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  );
}
