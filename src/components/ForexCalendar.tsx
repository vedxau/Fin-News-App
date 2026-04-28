import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, RefreshCw, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

interface ForexEvent {
  title: string;
  country: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  forecast: string;
  previous: string;
}

const impactConfig = {
  High: { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', dot: 'bg-rose-500', icon: <TrendingUp className="w-3 h-3" /> },
  Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-500', icon: <Minus className="w-3 h-3" /> },
  Low: { color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', dot: 'bg-slate-500', icon: <TrendingDown className="w-3 h-3" /> },
  Holiday: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', dot: 'bg-purple-500', icon: <Globe className="w-3 h-3" /> },
};

const currencyFlags: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦',
  AUD: '🇦🇺', NZD: '🇳🇿', CHF: '🇨🇭', CNY: '🇨🇳', HKD: '🇭🇰',
};

export default function ForexCalendar() {
  const [events, setEvents] = useState<ForexEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string[]>(['High', 'Medium', 'Low']);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources/forex-calendar');
      const data = await res.json();
      setEvents(data);
      setLastFetched(new Date());
    } catch (err) {
      console.error('Failed to load ForexFactory calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(); }, []);

  const toggleFilter = (impact: string) => {
    setFilter(prev => prev.includes(impact) ? prev.filter(f => f !== impact) : [...prev, impact]);
  };

  const filtered = events.filter(e => filter.includes(e.impact));

  // Group by day
  const grouped: Record<string, ForexEvent[]> = {};
  filtered.forEach(e => {
    const day = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f0f11] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs uppercase font-mono tracking-[0.3em] text-amber-500">ForexFactory Economic Calendar</h2>
          <p className="text-[10px] font-mono text-slate-600 mt-1">
            {lastFetched ? `Last updated: ${lastFetched.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={fetchCalendar}
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-[#262629] text-slate-400 hover:text-amber-400 hover:border-amber-500/40 rounded-lg transition-all"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Impact Filters */}
      <div className="flex gap-2 mb-6">
        {(['High', 'Medium', 'Low'] as const).map(impact => {
          const cfg = impactConfig[impact];
          const active = filter.includes(impact);
          return (
            <button
              key={impact}
              onClick={() => toggleFilter(impact)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest border transition-all",
                active ? cn(cfg.bg, cfg.color) : "border-[#262629] text-slate-600 hover:text-slate-400"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", active ? cfg.dot : "bg-slate-600")} />
              {impact}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-600">Fetching Calendar Data...</span>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-600 font-mono">
          <Clock className="w-8 h-8 opacity-30" />
          <span className="text-xs uppercase tracking-widest opacity-50">No events for selected filters</span>
        </div>
      ) : (
        Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{day}</span>
              <div className="flex-1 h-px bg-[#262629]" />
            </div>
            <div className="space-y-2">
              {dayEvents.map((event, idx) => {
                const cfg = impactConfig[event.impact] || impactConfig.Low;
                const eventTime = new Date(event.date);
                const isPast = eventTime < new Date();
                const flag = currencyFlags[event.country] || '🌐';
                return (
                  <div
                    key={`${event.country}-${event.title}-${idx}`}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl border transition-all",
                      "bg-[#1a1a1c] border-[#262629] hover:border-[#3a3a3c]",
                      isPast && "opacity-50"
                    )}
                  >
                    {/* Time */}
                    <div className="w-16 flex-shrink-0 text-center">
                      <span className="text-[11px] font-mono text-slate-400">
                        {eventTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>

                    {/* Impact dot */}
                    <div className="flex-shrink-0">
                      <span className={cn("w-2 h-2 rounded-full block", cfg.dot)} />
                    </div>

                    {/* Currency */}
                    <div className="w-16 flex-shrink-0 flex items-center gap-1.5">
                      <span className="text-base leading-none">{flag}</span>
                      <span className="text-[11px] font-mono font-bold text-slate-300">{event.country}</span>
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-mono text-slate-200 truncate block">{event.title}</span>
                    </div>

                    {/* Forecast / Previous */}
                    <div className="flex gap-6 flex-shrink-0">
                      {event.forecast && (
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Forecast</p>
                          <p className="text-[11px] font-mono text-amber-400">{event.forecast}</p>
                        </div>
                      )}
                      {event.previous && (
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Previous</p>
                          <p className="text-[11px] font-mono text-slate-300">{event.previous}</p>
                        </div>
                      )}
                    </div>

                    {/* Impact badge */}
                    <div className={cn("px-2 py-1 rounded-md border text-[9px] font-mono uppercase tracking-widest flex-shrink-0 flex items-center gap-1", cfg.bg, cfg.color)}>
                      {cfg.icon}
                      {event.impact}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
