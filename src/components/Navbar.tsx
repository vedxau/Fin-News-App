import React from 'react';
import { Terminal, Activity, Database, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar({ onIngest, ingesting }: { onIngest: () => void, ingesting: boolean }) {
  return (
    <nav className="h-14 glass border-b border-white/[0.05] px-6 flex items-center justify-between z-20 relative">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <span className="font-bold text-sm tracking-widest text-white hidden sm:inline" style={{ fontFamily: 'Inter' }}>
          FIN<span className="text-blue-400">PULSE</span>
        </span>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 glass rounded-full text-[10px] font-mono tracking-widest text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          Pipeline: Healthy
        </div>
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 glass rounded-full text-[10px] font-mono tracking-widest text-slate-400">
          <Database className="w-3 h-3" />
          Nodes: 3 Active
        </div>
      </div>

      {/* GET NEWS button */}
      <button
        onClick={onIngest}
        disabled={ingesting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] uppercase tracking-widest font-semibold transition-all duration-200 border",
          ingesting
            ? "bg-white/[0.03] border-white/[0.06] text-slate-500 cursor-not-allowed"
            : "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95"
        )}
      >
        <Terminal className={cn("w-3 h-3", ingesting && "animate-spin")} />
        {ingesting ? "Ingesting..." : "GET NEWS"}
      </button>
    </nav>
  );
}
