import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PriorityColumn from './components/PriorityColumn';
import { useNews } from './hooks/useNews';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './lib/firebase';
import { LayoutGrid, AlertCircle, BarChart3, Database, Shield, Terminal, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
  }, []);

  const { articles, loading, ingesting, triggerIngestion } = useNews();

  const highPriority = articles.filter(a => a.priority === "High");
  const mediumPriority = articles.filter(a => a.priority === "Medium");
  const lowPriority = articles.filter(a => a.priority === "Low");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center font-mono text-slate-500 gap-4">
        <Database className="w-8 h-8 animate-bounce text-amber-500" />
        <span className="text-xs uppercase tracking-[0.5em] animate-pulse">Initializing News Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-slate-100 flex flex-col selection:bg-amber-500/30">
      <Navbar onIngest={triggerIngestion} ingesting={ingesting} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar / Stats */}
        <div className="w-16 hidden lg:flex flex-col items-center py-6 gap-8 border-r border-[#262629] bg-[#1a1a1c]">
          <LayoutGrid onClick={() => setActiveTab('dashboard')} className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'dashboard' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          <BarChart3 onClick={() => setActiveTab('stats')} className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'stats' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          <Shield onClick={() => setActiveTab('security')} className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'security' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          <div className="mt-auto">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="flex-1 flex overflow-hidden">
            <PriorityColumn title="High Impact" priority="High" articles={highPriority} />
            <PriorityColumn title="Medium Impact" priority="Medium" articles={mediumPriority} />
            <PriorityColumn title="Low Impact" priority="Low" articles={lowPriority} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono tracking-widest bg-[#0f0f11]">
            <Activity className="w-8 h-8 mb-4 opacity-50" />
            <span className="text-xs uppercase opacity-50">MODULE '{activeTab}' PENDING ACTIVATION</span>
          </div>
        )}

        {/* Right Sidebar - System Logs / Admin View Mock */}
        <div className="w-64 hidden xl:flex flex-col bg-[#1a1a1c] border-l border-[#262629]">
           <div className="p-4 border-b border-[#262629] bg-[#151517]">
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-slate-400">System Information</h3>
           </div>
           
           <div className="flex-1 p-4 overflow-y-auto space-y-6">
              <section>
                <h4 className="text-[9px] uppercase font-mono text-slate-500 mb-3 tracking-widest">Active Sources</h4>
                <ul className="space-y-2 text-[11px] font-mono">
                  <li className="flex justify-between items-center text-slate-300">
                    <span>X.com (5)</span>
                    <span className="text-emerald-500 text-[9px]">STREAMING</span>
                  </li>
                  <li className="flex justify-between items-center text-slate-300">
                    <span>BBC News</span>
                    <span className="text-emerald-500 text-[9px]">POLLING</span>
                  </li>
                  <li className="flex justify-between items-center text-slate-300">
                    <span>Bloomberg</span>
                    <span className="text-amber-500 text-[9px]">CACHED</span>
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="text-[9px] uppercase font-mono text-slate-500 mb-3 tracking-widest">Pipeline Health</h4>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px]">
                     <span className="text-slate-500">Latency</span>
                     <span className="text-slate-300">1.2s</span>
                   </div>
                   <div className="w-full h-1 bg-[#2c2c2e] rounded-full overflow-hidden">
                     <div className="w-[85%] h-full bg-emerald-500" />
                   </div>
                   <div className="flex justify-between text-[10px]">
                     <span className="text-slate-500">Precision</span>
                     <span className="text-slate-300">98.4%</span>
                   </div>
                   <div className="w-full h-1 bg-[#2c2c2e] rounded-full overflow-hidden">
                     <div className="w-[98%] h-full bg-emerald-500" />
                   </div>
                </div>
              </section>
           </div>

           <div className="p-4 bg-[#151517] border-t border-[#262629]">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono italic">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span>Last heartbeat: 2s ago</span>
              </div>
           </div>
        </div>
      </main>

      {/* Global Ingestion Notification */}
      <AnimatePresence>
        {ingesting && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-amber-500 text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-mono text-xs font-bold ring-4 ring-black/20">
              <Terminal className="w-4 h-4 animate-bounce" />
              INGESTION IN PROGRESS: ANALYZING MARKET DATA...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
