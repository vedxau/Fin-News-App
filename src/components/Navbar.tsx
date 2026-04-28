import React from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, LogOut, Terminal, Activity, ShieldAlert, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar({ onIngest, ingesting }: { onIngest: () => void, ingesting: boolean }) {
  const [user] = useAuthState(auth);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

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
        {user && (
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
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-mono text-slate-300">{user.displayName}</span>
                <span className="text-[9px] font-mono text-slate-500">ADMIN</span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-2 text-slate-500 hover:text-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-slate-300 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <LogIn className="w-4 h-4" />
            Login with Google
          </button>
        )}
      </div>
    </nav>
  );
}
