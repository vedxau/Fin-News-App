import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, RefreshCw, Globe, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

interface ForexEvent {
  title: string;
  country: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  forecast: string;
  previous: string;
}

// Much more visible, vibrant impact colors
const impactConfig = {
  High: {
    label: 'text-red-300 font-bold',
    badgeBg: 'rgba(239,68,68,0.2)',
    badgeBorder: 'rgba(239,68,68,0.6)',
    badgeText: '#fca5a5',
    rowBorder: 'rgba(239,68,68,0.25)',
    rowBg: 'rgba(239,68,68,0.05)',
    dot: '#ef4444',
    dotShadow: '0 0 8px rgba(239,68,68,0.9)',
    icon: <Flame className="w-3 h-3" />,
    stripColor: '#ef4444',
  },
  Medium: {
    label: 'text-amber-300 font-semibold',
    badgeBg: 'rgba(245,158,11,0.2)',
    badgeBorder: 'rgba(245,158,11,0.6)',
    badgeText: '#fcd34d',
    rowBorder: 'rgba(245,158,11,0.2)',
    rowBg: 'rgba(245,158,11,0.03)',
    dot: '#f59e0b',
    dotShadow: '0 0 8px rgba(245,158,11,0.9)',
    icon: <Minus className="w-3 h-3" />,
    stripColor: '#f59e0b',
  },
  Low: {
    label: 'text-slate-300',
    badgeBg: 'rgba(100,116,139,0.2)',
    badgeBorder: 'rgba(100,116,139,0.5)',
    badgeText: '#94a3b8',
    rowBorder: 'rgba(255,255,255,0.06)',
    rowBg: 'rgba(255,255,255,0.01)',
    dot: '#64748b',
    dotShadow: '0 0 6px rgba(100,116,139,0.7)',
    icon: <TrendingDown className="w-3 h-3" />,
    stripColor: '#64748b',
  },
  Holiday: {
    label: 'text-purple-300',
    badgeBg: 'rgba(139,92,246,0.2)',
    badgeBorder: 'rgba(139,92,246,0.5)',
    badgeText: '#c4b5fd',
    rowBorder: 'rgba(139,92,246,0.2)',
    rowBg: 'rgba(139,92,246,0.03)',
    dot: '#8b5cf6',
    dotShadow: '0 0 6px rgba(139,92,246,0.7)',
    icon: <Globe className="w-3 h-3" />,
    stripColor: '#8b5cf6',
  },
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
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" style={{ background: 'transparent' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white" style={{ fontFamily: 'Inter' }}>
            ForexFactory <span style={{ color: '#f59e0b' }}>Economic Calendar</span>
          </h2>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            {lastFetched ? `Updated: ${lastFetched.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={fetchCalendar}
          className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-lg transition-all text-slate-300 hover:text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-widest transition-all"
              style={{
                background: active ? cfg.badgeBg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? cfg.badgeBorder : 'rgba(255,255,255,0.08)'}`,
                color: active ? cfg.badgeText : '#64748b',
                boxShadow: active ? `0 0 12px ${cfg.badgeBg}` : 'none',
              }}
            >
              <span
                className="w-2 h-2 rounded-full block flex-shrink-0"
                style={{ background: active ? cfg.dot : '#334155', boxShadow: active ? cfg.dotShadow : 'none' }}
              />
              {impact}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#f59e0b' }} />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Fetching Calendar Data...</span>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-600 font-mono">
          <Clock className="w-8 h-8 opacity-30" />
          <span className="text-xs uppercase tracking-widest opacity-50">No events for selected filters</span>
        </div>
      ) : (
        Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day} className="mb-8">
            {/* Day Separator */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300" style={{ fontFamily: 'Inter' }}>{day}</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-[10px] font-mono text-slate-600">{dayEvents.length} events</span>
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
                    className="flex items-center gap-4 px-0 py-0 rounded-xl transition-all overflow-hidden"
                    style={{
                      background: cfg.rowBg,
                      border: `1px solid ${cfg.rowBorder}`,
                      opacity: isPast ? 0.55 : 1,
                    }}
                  >
                    {/* Left color strip */}
                    <div className="w-1 self-stretch flex-shrink-0 rounded-l-xl" style={{ background: cfg.stripColor, minHeight: '44px' }} />

                    {/* Time */}
                    <div className="w-16 flex-shrink-0 text-center py-3">
                      <span className="text-[11px] font-mono" style={{ color: isPast ? '#475569' : '#94a3b8' }}>
                        {eventTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>

                    {/* Impact dot */}
                    <div className="flex-shrink-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full block"
                        style={{ background: cfg.dot, boxShadow: cfg.dotShadow }}
                      />
                    </div>

                    {/* Currency */}
                    <div className="w-20 flex-shrink-0 flex items-center gap-2">
                      <span className="text-lg leading-none">{flag}</span>
                      <span className="text-[11px] font-mono font-bold text-white">{event.country}</span>
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0 py-3">
                      <span className={cn("text-[12px] font-medium truncate block", cfg.label)}>
                        {event.title}
                      </span>
                    </div>

                    {/* Forecast / Previous */}
                    <div className="flex gap-6 flex-shrink-0 pr-2">
                      {event.forecast && (
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-0.5">Forecast</p>
                          <p className="text-[12px] font-mono font-bold" style={{ color: '#fcd34d' }}>{event.forecast}</p>
                        </div>
                      )}
                      {event.previous && (
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-0.5">Previous</p>
                          <p className="text-[12px] font-mono text-slate-300">{event.previous}</p>
                        </div>
                      )}
                    </div>

                    {/* Impact badge */}
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-mono uppercase tracking-widest flex-shrink-0 mr-3 font-bold"
                      style={{
                        background: cfg.badgeBg,
                        border: `1px solid ${cfg.badgeBorder}`,
                        color: cfg.badgeText,
                      }}
                    >
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
