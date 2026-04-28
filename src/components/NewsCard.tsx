import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Briefcase, Zap } from 'lucide-react';
import { Article } from '../types';
import { cn, formatDate } from '../lib/utils';

interface NewsCardProps {
  article: Article;
  onEdit?: (article: Article) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onEdit }) => {
  const sentimentIcon = {
    positive: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    negative: <TrendingDown className="w-4 h-4 text-rose-500" />,
    neutral: <Minus className="w-4 h-4 text-slate-400" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-[#1c1c1e] border border-[#2c2c2e] hover:border-[#3a3a3c] transition-all p-4 rounded-xl mb-3 shadow-lg"
      id={`article-${article.id}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500">
          {article.source} • {formatDate(article.published_at)}
        </span>
        <div className="flex gap-2">
          {sentimentIcon[article.sentiment]}
          <span className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize",
            article.priority === "High" ? "border-rose-500/20 text-rose-400" :
            article.priority === "Medium" ? "border-amber-500/20 text-amber-400" :
            "border-slate-500/20 text-slate-400"
          )}>
            {article.priority}
          </span>
        </div>
      </div>

      <h3 className="text-slate-100 font-medium leading-tight mb-2 group-hover:text-amber-400 transition-colors">
        {article.title}
      </h3>

      <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
        {article.body}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {article.entities.slice(0, 3).map((entity) => (
          <span key={entity} className="bg-slate-800/50 text-slate-300 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 border border-slate-700/50">
            <Zap className="w-2.5 h-2.5 text-amber-500" />
            {entity}
          </span>
        ))}
        {article.categories.slice(0, 2).map((cat) => (
          <span key={cat} className="bg-slate-800/50 text-slate-400 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
            <Briefcase className="w-2.5 h-2.5" />
            {cat}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-2">
           <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-amber-500" 
               style={{ width: `${article.impact_score * 100}%` }}
             />
           </div>
           <span className="text-[9px] font-mono text-slate-500 uppercase">Impact {Math.round(article.impact_score * 100)}</span>
        </div>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

export default NewsCard;
