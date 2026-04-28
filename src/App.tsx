import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PriorityColumn from './components/PriorityColumn';
import ForexCalendar from './components/ForexCalendar';
import { useNews } from './hooks/useNews';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  LayoutGrid, BarChart3, Database, Shield,
  Terminal, Rss, Twitter, TrendingUp, TrendingDown,
  Minus, Zap, Server, Clock, CheckCircle2, Lock,
  CalendarDays, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'stats', label: 'Analytics', icon: BarChart3 },
  { id: 'security', label: 'Security', icon: Shield },
];

// Glassmorphism card wrapper
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-xl p-5 ${className}`}
    style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}
  >
    {children}
  </div>
);

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
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center font-mono gap-4">
        <Database className="w-8 h-8 animate-bounce text-blue-400" />
        <span className="text-xs uppercase tracking-[0.5em] animate-pulse text-slate-500">Initializing News Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh text-slate-100 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar onIngest={triggerIngestion} ingesting={ingesting} />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — labeled nav like reference image */}
        <div
          className="hidden lg:flex flex-col py-6 gap-1 flex-shrink-0"
          style={{
            width: '200px',
            background: 'rgba(255,255,255,0.015)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="px-4 mb-4">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600">Navigation</p>
          </div>

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "mx-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                  active
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                )}
                style={active ? {
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  color: '#93c5fd',
                } : { border: '1px solid transparent' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
            );
          })}

          {/* Bottom status */}
          <div className="mt-auto mx-3 px-3 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              System Online
            </div>
            <p className="text-[9px] font-mono text-slate-600 mt-1">3 nodes active</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex overflow-hidden">
              <PriorityColumn title="High Impact" priority="High" articles={highPriority} allSources={allSources} />
              <PriorityColumn title="Medium Impact" priority="Medium" articles={mediumPriority} allSources={allSources} />
              <PriorityColumn title="Low Impact" priority="Low" articles={lowPriority} allSources={allSources} />
            </div>
          )}

          {/* Calendar */}
          {activeTab === 'calendar' && <ForexCalendar />}

          {/* Analytics */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-xs uppercase font-mono tracking-[0.3em] text-blue-400 mb-8">Analytics & System Information</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Articles", value: articles.length, icon: <Rss className="w-4 h-4" />, color: "text-blue-400" },
                  { label: "High Impact", value: highPriority.length, icon: <TrendingUp className="w-4 h-4" />, color: "text-rose-400" },
                  { label: "Avg Impact", value: `${avgImpact}%`, icon: <Zap className="w-4 h-4" />, color: "text-purple-400" },
                  { label: "Sources", value: allSources.length, icon: <Server className="w-4 h-4" />, color: "text-emerald-400" },
                ].map(card => (
                  <GlassCard key={card.label}>
                    <div className={cn("mb-3", card.color)}>{card.icon}</div>
                    <p className="text-2xl font-bold text-slate-100">{card.value}</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">{card.label}</p>
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Sentiment */}
                <GlassCard>
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
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className={cn("h-full rounded-full", s.color)}
                          style={{ width: articles.length > 0 ? `${(s.count / articles.length) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </GlassCard>

                {/* System Info */}
                <GlassCard>
                  <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">System Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: "AI Engine", value: "Groq Llama 3.3 70B", highlight: true },
                      { label: "Pipeline Status", value: "● HEALTHY", green: true },
                      { label: "Precision", value: "98.4%" },
                      { label: "Avg Latency", value: "1.2s" },
                      { label: "Last Heartbeat", value: "2s ago" },
                      { label: "Nodes Active", value: "3" },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                        <span className="text-[11px] font-mono text-slate-500">{row.label}</span>
                        <span className={cn("text-[11px] font-mono", row.green ? "text-emerald-400" : row.highlight ? "text-blue-400" : "text-slate-300")}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Sources */}
              <GlassCard>
                <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Active Sources</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {rssSources.map(src => (
                    <div key={src} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-2"><Rss className="w-3 h-3 text-blue-400" /><span className="text-[11px] font-mono text-slate-300">{src}</span></div>
                      <span className="text-[9px] font-mono text-emerald-400 tracking-widest">POLLING</span>
                    </div>
                  ))}
                  {xSources.map(src => (
                    <div key={src} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-2"><Twitter className="w-3 h-3 text-sky-400" /><span className="text-[11px] font-mono text-slate-300">{src}</span></div>
                      <span className="text-[9px] font-mono text-sky-400 tracking-widest">STREAMING</span>
                    </div>
                  ))}
                  {allSources.length === 0 && <p className="text-[11px] font-mono text-slate-600 col-span-2">No sources yet. Click GET NEWS.</p>}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-xs uppercase font-mono tracking-[0.3em] text-blue-400 mb-8">Security & Access Control</h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <GlassCard>
                  <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Access Status</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Public Read Access", status: "GRANTED", color: "text-emerald-400" },
                      { label: "News Ingestion", status: "PUBLIC", color: "text-emerald-400" },
                      { label: "Data Write (Anon)", status: "ENABLED", color: "text-amber-400" },
                      { label: "Admin Controls", status: "RESTRICTED", color: "text-rose-400" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <Lock className="w-3 h-3" />{item.label}
                        </div>
                        <span className={cn("text-[10px] font-mono tracking-widest", item.color)}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">API Endpoints</h3>
                  <div className="space-y-3">
                    {[
                      { path: "/api/sources/rss", method: "GET" },
                      { path: "/api/sources/x", method: "GET" },
                      { path: "/api/sources/forex-news", method: "GET" },
                      { path: "/api/sources/forex-calendar", method: "GET" },
                    ].map(ep => (
                      <div key={ep.path} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{ep.method}</span>
                          <span className="text-[11px] font-mono text-slate-300">{ep.path}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-mono">
                          <CheckCircle2 className="w-3 h-3" />LIVE
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <GlassCard>
                <h3 className="text-[9px] uppercase font-mono text-slate-500 mb-5 tracking-widest">Monitored X Accounts</h3>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {['BRICSinfo', 'WatcherGuru', 'remarks', 'firstpost', 'cryptorover', 'AJENews', 'NoLimitGains'].map(acc => (
                    <div key={acc} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Twitter className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      <span className="text-[11px] font-mono text-slate-300 truncate">@{acc}</span>
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>

      {/* Ingestion Toast */}
      <AnimatePresence>
        {ingesting && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-full text-xs font-mono font-semibold text-blue-300"
              style={{ background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 0 30px rgba(59,130,246,0.2)' }}
            >
              <Activity className="w-4 h-4 animate-pulse text-blue-400" />
              INGESTION IN PROGRESS — ANALYZING MARKET DATA...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
