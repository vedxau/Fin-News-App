import React, { useMemo, useState } from 'react';
import { Article } from '../types';

// ── Equirectangular projection ───────────────────────────────────────────────
// x% = (lng + 180) / 360 * 100
// y% = (90 - lat) / 180 * 100
const toXY = (lat: number, lng: number) => ({
  x: ((lng + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
});

// ── Keyword → [lat, lng] lookup ──────────────────────────────────────────────
const KEYWORD_COORDS: Record<string, [number, number]> = {
  'USD': [37.09, -95.71], 'Federal Reserve': [38.90, -77.03], 'Fed': [38.90, -77.03],
  'GBP': [51.51, -0.12], 'BOE': [51.51, -0.12], 'Bank of England': [51.51, -0.12],
  'EUR': [48.85, 2.35], 'ECB': [50.11, 8.68], 'Eurozone': [50.11, 8.68],
  'JPY': [35.68, 139.69], 'BOJ': [35.68, 139.69], 'Bank of Japan': [35.68, 139.69],
  'CAD': [56.13, -106.34], 'CNY': [39.90, 116.40], 'PBOC': [39.90, 116.40],
  'AUD': [-25.27, 133.77], 'RBA': [-25.27, 133.77], 'NZD': [-36.86, 174.76],
  'CHF': [46.94, 7.44], 'SNB': [46.94, 7.44], 'INR': [28.61, 77.21],
  'RUB': [55.75, 37.62], 'BRL': [-15.77, -47.92], 'ZAR': [-25.74, 28.18],
  'US': [37.09, -95.71], 'USA': [37.09, -95.71], 'United States': [37.09, -95.71], 'America': [37.09, -95.71],
  'UK': [51.51, -0.12], 'Britain': [51.51, -0.12], 'England': [51.51, -0.12],
  'Germany': [52.52, 13.40], 'France': [48.85, 2.35], 'Italy': [41.89, 12.48], 'Spain': [40.41, -3.70],
  'Japan': [35.68, 139.69], 'China': [39.90, 116.40], 'India': [28.61, 77.21],
  'Russia': [55.75, 37.62], 'Canada': [56.13, -106.34], 'Australia': [-25.27, 133.77],
  'Brazil': [-15.77, -47.92], 'Mexico': [23.63, -102.55], 'Turkey': [38.96, 35.24],
  'Saudi': [23.88, 45.08], 'UAE': [23.42, 53.85], 'Iran': [32.42, 53.68],
  'Israel': [31.77, 35.21], 'Pakistan': [30.37, 69.34], 'Korea': [35.90, 127.76],
  'Taiwan': [23.69, 120.96], 'Singapore': [1.35, 103.82], 'Indonesia': [-0.78, 113.92],
  'OPEC': [23.88, 45.08], 'NATO': [50.85, 4.35], 'BRICS': [28.61, 77.21],
  'IMF': [38.90, -77.03], 'World Bank': [38.90, -77.03], 'UN': [40.74, -73.98],
  'Bitcoin': [37.09, -95.71], 'Crypto': [37.09, -95.71], 'Gold': [40.71, -74.01],
  'Oil': [23.88, 45.08], 'Gas': [55.75, 37.62], 'Middle East': [29.31, 47.48],
};

const SOURCE_COORDS: Record<string, [number, number]> = {
  'BBC': [51.51, -0.12],
  'CNN': [40.76, -73.98],
  'Al Jazeera': [25.28, 51.49],
};

const PRIORITY_COLORS = {
  High:   { fill: '#ff4444', glow: 'rgba(255,68,68,0.8)',   ring: 'rgba(255,68,68,0.25)' },
  Medium: { fill: '#ffc107', glow: 'rgba(255,193,7,0.8)',   ring: 'rgba(255,193,7,0.2)'  },
  Low:    { fill: '#3b82f6', glow: 'rgba(59,130,246,0.8)',  ring: 'rgba(59,130,246,0.2)' },
};

function getCoords(article: Article): [number, number] | null {
  const text = `${article.title} ${article.body} ${(article.entities || []).join(' ')}`;
  for (const [kw, coords] of Object.entries(KEYWORD_COORDS)) {
    if (text.includes(kw)) return coords;
  }
  for (const [srcKey, coords] of Object.entries(SOURCE_COORDS)) {
    if (article.source?.includes(srcKey)) return coords;
  }
  return null;
}

interface Tooltip { title: string; source: string; count: number; x: number; y: number; }

export default function WorldMap({ articles }: { articles: Article[] }) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const pins = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; articles: Article[] }>();
    articles.forEach(a => {
      const coords = getCoords(a);
      if (!coords) return;
      const [lat, lng] = coords;
      const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
      if (!map.has(key)) map.set(key, { lat, lng, articles: [] });
      map.get(key)!.articles.push(a);
    });
    return Array.from(map.values()).map(({ lat, lng, articles: arts }) => {
      const top = arts.sort((a, b) => {
        const rank = { High: 0, Medium: 1, Low: 2 };
        return (rank[a.priority] ?? 2) - (rank[b.priority] ?? 2);
      })[0];
      return { xy: toXY(lat, lng), top, count: arts.length };
    });
  }, [articles]);

  return (
    <div
      className="relative mx-4 mb-4 rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        height: '260px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">Live News Map</span>
        <span className="text-[9px] font-mono text-slate-600">
          {pins.length} location{pins.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-4">
        {(['High', 'Medium', 'Low'] as const).map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: PRIORITY_COLORS[p].fill, boxShadow: `0 0 6px ${PRIORITY_COLORS[p].glow}` }}
            />
            <span className="text-[9px] font-mono text-slate-500">{p}</span>
          </div>
        ))}
      </div>

      {/* World map background image — equirectangular, CSS-filtered to dark navy */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
        alt="world map"
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'fill',
          filter: 'invert(1) sepia(1) saturate(0.4) hue-rotate(175deg) brightness(0.18) contrast(1.4)',
          opacity: 0.9,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />

      {/* Pins */}
      {pins.map((pin, i) => {
        const colors = PRIORITY_COLORS[pin.top.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Low;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${pin.xy.x}%`,
              top: `${pin.xy.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setTooltip({ title: pin.top.title, source: pin.top.source, count: pin.count, x: r.left, y: r.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Pulse ring */}
            <div
              className="absolute rounded-full animate-ping"
              style={{
                width: 16, height: 16,
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                background: colors.ring,
                animationDuration: '2s',
              }}
            />
            {/* Dot */}
            <div
              className="relative cursor-pointer rounded-full"
              style={{
                width: 10, height: 10,
                background: colors.fill,
                boxShadow: `0 0 8px ${colors.glow}, 0 0 16px ${colors.ring}`,
              }}
            />
            {/* Count badge */}
            {pin.count > 1 && (
              <div
                className="absolute font-mono font-bold"
                style={{
                  top: -10, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 7, color: colors.fill,
                  textShadow: `0 0 6px ${colors.glow}`,
                }}
              >
                {pin.count}
              </div>
            )}
          </div>
        );
      })}

      {/* No articles message */}
      {articles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">Click GET NEWS to populate the map</p>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl p-3"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 60,
            maxWidth: 260,
            background: 'rgba(6,13,26,0.96)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-[12px] text-slate-200 font-medium leading-snug">{tooltip.title}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">{tooltip.source}</p>
          {tooltip.count > 1 && (
            <p className="text-[9px] font-mono text-blue-400 mt-0.5">+{tooltip.count - 1} more articles here</p>
          )}
        </div>
      )}
    </div>
  );
}
