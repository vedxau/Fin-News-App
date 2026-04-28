import React from 'react';
import { Terminal, Activity, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar({ onIngest, ingesting }: { onIngest: () => void, ingesting: boolean }) {
  return (
    <nav className="h-14 border-b border-[#262629] bg-[#1a1a1c] px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-[#262629]">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Activity className="w-4 h-4 text-black" />
          </div>
          <span className="font-mono text-sm tracking-[0.3em] font-bold text-slate-100 hidden sm:inline">FINPULSE AI</span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-mono uppercase tracking-widest leading-none">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pipeline: Healthy</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            <span>Nodes: 3 Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onIngest}
          disabled={ingesting}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all border",
            ingesting 
              ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" 
              : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 active:scale-95"
          )}
        >
          <Terminal className={cn("w-3 h-3", ingesting && "animate-spin")} />
          {ingesting ? "Ingesting..." : "Force Sync"}
        </button>
      </div>
    </nav>
  );
}
