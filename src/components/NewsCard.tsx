import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { Article } from '../types';
import { cn, formatDate } from '../lib/utils';

interface NewsCardProps {
  article: Article;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const sentimentIcon = {
    positive: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
    negative: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
    neutral: <Minus className="w-3.5 h-3.5 text-slate-500" />,
  };

  const priorityBadge = {
    High: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    Medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    Low: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  const impactColor = {
    High: "bg-rose-500",
    Medium: "bg-amber-400",
    Low: "bg-blue-500",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl p-4 transition-all duration-200 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.09)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
      }}
      id={`article-${article.id}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[10px] font-mono text-slate-600 truncate max-w-[60%]">
          {article.source} • {formatDate(article.published_at)}
        </span>
        <div className="flex items-center gap-1.5">
          {sentimentIcon[article.sentiment]}
          <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-md border capitalize tracking-wide", priorityBadge[article.priority])}>
            {article.priority}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-medium text-slate-200 leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
        {article.title}
      </h3>

      {/* Body */}
      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 mb-3">
        {article.body}
      </p>

      {/* Entities */}
      {article.entities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.entities.slice(0, 3).map((entity) => (
            <span
              key={entity}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Zap className="w-2.5 h-2.5 text-blue-400" />
              {entity}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className={cn("h-full rounded-full", impactColor[article.priority])}
              style={{ width: `${(article.impact_score || 0) * 100}%`, opacity: 0.8 }}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-600 uppercase">
            {Math.round((article.impact_score || 0) * 100)}%
          </span>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-blue-400 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
};

export default NewsCard;
