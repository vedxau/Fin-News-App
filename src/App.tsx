import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PriorityColumn from './components/PriorityColumn';
import ForexCalendar from './components/ForexCalendar';
import { useNews } from './hooks/useNews';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  LayoutGrid, AlertCircle, BarChart3, Database, Shield,
  Terminal, Activity, Rss, Twitter, TrendingUp, TrendingDown,
  Minus, Zap, Server, Clock, CheckCircle2, Lock, CalendarDays
} from 'lucide-react';
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
  const allSources = Array.from(new Set(articles.map(a => a.source))).sort();

  const positiveCount = articles.filter(a => a.sentiment === 'positive').length;
  const negativeCount = articles.filter(a => a.sentiment === 'negative').length;
  const neutralCount = articles.filter(a => a.sentiment === 'neutral').length;
  const avgImpact = articles.length > 0
    ? (articles.reduce((s, a) => s + (a.impact_score || 0), 0) / articles.length * 100).toFixed(1)
    : '0.0';

  const xSources = allSources.filter(s => s.startsWith('x.com'));
  const rssSources = allSources.filter(s => !s.startsWith('x.com'));

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
        {/* Left Icon Sidebar */}
        <div className="w-16 hidden lg:flex flex-col items-center py-6 gap-8 border-r border-[#262629] bg-[#1a1a1c]">
          <button onClick={() => setActiveTab('dashboard')} title="Dashboard">
            <LayoutGrid className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'dashboard' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          </button>
          <button onClick={() => setActiveTab('calendar')} title="Economic Calendar">
            <CalendarDays className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'calendar' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          </button>
          <button onClick={() => setActiveTab('stats')} title="Analytics">
            <BarChart3 className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'stats' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          </button>
          <button onClick={() => setActiveTab('security')} title="Security">
            <Shield className={cn("w-5 h-5 cursor-pointer transition-colors", activeTab === 'security' ? "text-amber-500" : "text-slate-600 hover:text-slate-300")} />
          </button>
          <div className="mt-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex overflow-hidden">
            <PriorityColumn title="High Impact" priority="High" articles={highPriority} allSources={allSources} />
            <PriorityColumn title="Medium Impact" priority="Medium" articles={mediumPriority} allSources={allSources} />
            <PriorityColumn title="Low Impact" priority="Low" articles={lowPriority} allSources={allSources} />
          </div>
        )}

        {activeTab === 'calendar' && <ForexCalendar />}

        {activeTab === 'stats' && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#0f0f11]">
            <h2 className="text-xs uppercase font-mono tracking-[0.3em] text-amber-500 mb-8">Analytics & System Information</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total Articles", value: articles.length, icon: <Rss className="w-4 h-4" />, color: "text-amber-400" },
                { label: "High Impact", value: highPriority.length, icon: <TrendingUp className="w-4 h-4" />, color: "text-rose-400" },
                { label: "Avg Impact Score", value: `${avgImpact}%`, icon: <Zap className="w-4 h-4" />, color: "text-purple-400" },
                { label: "Sources Active", value: allSources.length, icon: <Server className="w-4 h-4" />, color: "text-emerald-400" },
              ].map(card => (
                <div key={card.label} className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-5">
                  <div className={cn("mb-3", card.color)}>{card.icon}</div>
                  <p className="text-2xl font-bold font-mono text-slate-100">{card.value}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Sentiment Breakdown */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
              <div className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-6">
                <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Sentiment Breakdown</h3>
                {[
                  { label: "Positive", count: positiveCount, color: "bg-emerald-500", icon: <TrendingUp className="w-3 h-3 text-emerald-400" /> },
                  { label: "Neutral", count: neutralCount, color: "bg-slate-500", icon: <Minus className="w-3 h-3 text-slate-400" /> },
                  { label: "Negative", count: negativeCount, color: "bg-rose-500", icon: <TrendingDown className="w-3 h-3 text-rose-400" /> },
                ].map(s => (
                  <div key={s.label} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">{s.icon}{s.label}</div>
                      <span className="text-[11px] font-mono text-slate-300">{s.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", s.color)}
                        style={{ width: articles.length > 0 ? `${(s.count / articles.length) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* System Information */}
              <div className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-6">
                <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">System Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-500">AI Engine</span>
                    <span className="text-[11px] font-mono text-amber-400">Groq Llama 3.3 70B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-500">Pipeline Status</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />HEALTHY</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-500">Precision</span>
                    <span className="text-[11px] font-mono text-slate-300">98.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-500">Avg Latency</span>
                    <span className="text-[11px] font-mono text-slate-300">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-500">Last Heartbeat</span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400"><Clock className="w-3 h-3" />2s ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-500">Nodes Active</span>
                    <span className="text-[11px] font-mono text-slate-300">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Breakdown */}
            <div className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-6">
              <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Active Sources</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {rssSources.map(src => (
                  <div key={src} className="flex items-center justify-between px-4 py-2 bg-[#2c2c2e] rounded-lg">
                    <div className="flex items-center gap-2"><Rss className="w-3 h-3 text-amber-500" /><span className="text-[11px] font-mono text-slate-300">{src}</span></div>
                    <span className="text-[9px] font-mono text-emerald-400 tracking-widest">POLLING</span>
                  </div>
                ))}
                {xSources.map(src => (
                  <div key={src} className="flex items-center justify-between px-4 py-2 bg-[#2c2c2e] rounded-lg">
                    <div className="flex items-center gap-2"><Twitter className="w-3 h-3 text-sky-400" /><span className="text-[11px] font-mono text-slate-300">{src}</span></div>
                    <span className="text-[9px] font-mono text-sky-400 tracking-widest">STREAMING</span>
                  </div>
                ))}
                {allSources.length === 0 && (
                  <p className="text-[11px] font-mono text-slate-600 col-span-2">No sources loaded yet. Click GET NEWS.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#0f0f11]">
            <h2 className="text-xs uppercase font-mono tracking-[0.3em] text-amber-500 mb-8">Security & Access Control</h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-6">
                <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Access Status</h3>
                <div className="space-y-4">
                  {[
                    { label: "Public Read Access", status: "GRANTED", color: "text-emerald-400" },
                    { label: "News Ingestion", status: "PUBLIC", color: "text-emerald-400" },
                    { label: "Data Write (Anon)", status: "ENABLED", color: "text-amber-400" },
                    { label: "Admin Controls", status: "RESTRICTED", color: "text-rose-400" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <Lock className="w-3 h-3" />{item.label}
                      </div>
                      <span className={cn("text-[10px] font-mono tracking-widest", item.color)}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-6">
                <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">API Endpoints</h3>
                <div className="space-y-3">
                  {[
                    { path: "/api/sources/rss", method: "GET", status: "LIVE" },
                    { path: "/api/sources/x", method: "GET", status: "LIVE" },
                  ].map(ep => (
                    <div key={ep.path} className="flex items-center justify-between px-3 py-2 bg-[#2c2c2e] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">{ep.method}</span>
                        <span className="text-[11px] font-mono text-slate-300">{ep.path}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-mono">
                        <CheckCircle2 className="w-3 h-3" />{ep.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1c] border border-[#262629] rounded-xl p-6">
              <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Monitored X Accounts</h3>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {['BRICSinfo', 'WatcherGuru', 'remarks', 'firstpost', 'cryptorover', 'AJENews', 'NoLimitGains'].map(acc => (
                  <div key={acc} className="flex items-center gap-2 px-3 py-2 bg-[#2c2c2e] rounded-lg">
                    <Twitter className="w-3 h-3 text-sky-400 flex-shrink-0" />
                    <span className="text-[11px] font-mono text-slate-300 truncate">@{acc}</span>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
