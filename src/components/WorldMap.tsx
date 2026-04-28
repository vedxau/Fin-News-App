import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Article } from '../types';

// ── Equirectangular projection ────────────────────────────────────────────
const toXY = (lat: number, lng: number, w: number, h: number) => ({
  x: ((lng + 180) / 360) * w,
  y: ((90 - lat) / 180) * h,
});

// ── Keyword → [lat, lng] ─────────────────────────────────────────────────
const KEYWORD_COORDS: Record<string, [number, number]> = {
  'USD': [37.09, -95.71], 'Federal Reserve': [38.90, -77.03], 'Fed': [38.90, -77.03],
  'GBP': [51.51, -0.12], 'BOE': [51.51, -0.12], 'Bank of England': [51.51, -0.12],
  'EUR': [48.85, 2.35], 'ECB': [50.11, 8.68], 'Eurozone': [50.11, 8.68],
  'JPY': [35.68, 139.69], 'BOJ': [35.68, 139.69], 'Bank of Japan': [35.68, 139.69],
  'CAD': [56.13, -106.34], 'CNY': [39.90, 116.40], 'PBOC': [39.90, 116.40],
  'AUD': [-25.27, 133.77], 'RBA': [-25.27, 133.77], 'NZD': [-36.86, 174.76],
  'CHF': [46.94, 7.44], 'INR': [28.61, 77.21],
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
  High:   { fill: '#ff4444', glow: '#ff4444', ring: 'rgba(255,68,68,0.3)'   },
  Medium: { fill: '#ffc107', glow: '#ffc107', ring: 'rgba(255,193,7,0.3)'   },
  Low:    { fill: '#3b82f6', glow: '#3b82f6', ring: 'rgba(59,130,246,0.3)'  },
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 260 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
        const r: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        return (r[a.priority] ?? 2) - (r[b.priority] ?? 2);
      })[0];
      return { pos: toXY(lat, lng, dims.w, dims.h), top, count: arts.length };
    });
  }, [articles, dims]);

  return (
    <div
      ref={containerRef}
      className="relative mx-4 mb-4 rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        height: '260px',
        background: 'rgba(5, 15, 35, 0.85)',
        border: '1px solid rgba(59,130,246,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header overlay */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-blue-400/80">Live News Map</span>
        <span className="text-[9px] font-mono text-slate-600">{pins.length} location{pins.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-4">
        {(['High', 'Medium', 'Low'] as const).map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[p].fill, boxShadow: `0 0 6px ${PRIORITY_COLORS[p].glow}` }} />
            <span className="text-[9px] font-mono text-slate-500">{p}</span>
          </div>
        ))}
      </div>

      {/* SVG Canvas — world grid + pins */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      >
        <defs>
          {/* Grid pattern for map feel */}
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d={`M 40 0 L 0 0 0 20`} fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
          </pattern>
          {/* Glow filters */}
          {(['High', 'Medium', 'Low'] as const).map(p => (
            <filter key={p} id={`glow-${p}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
        </defs>

        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Longitude lines */}
        {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map(lng => {
          const x = ((lng + 180) / 360) * dims.w;
          return <line key={lng} x1={x} y1={0} x2={x} y2={dims.h} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />;
        })}

        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const y = ((90 - lat) / 180) * dims.h;
          return <line key={lat} x1={0} y1={y} x2={dims.w} y2={y} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />;
        })}

        {/* Equator highlight */}
        <line
          x1={0} y1={dims.h / 2} x2={dims.w} y2={dims.h / 2}
          stroke="rgba(59,130,246,0.15)" strokeWidth="1" strokeDasharray="4,4"
        />

        {/* Simplified continent blobs — approximate rectangle regions */}
        {[
          // North America
          { x: 50, y: 40, w: 180, h: 120, label: 'N.America' },
          // South America  
          { x: 120, y: 170, w: 100, h: 90, label: 'S.America' },
          // Europe
          { x: 370, y: 30, w: 90, h: 80, label: 'Europe' },
          // Africa
          { x: 370, y: 120, w: 100, h: 120, label: 'Africa' },
          // Asia
          { x: 460, y: 20, w: 200, h: 130, label: 'Asia' },
          // Australia
          { x: 580, y: 190, w: 90, h: 55, label: 'Australia' },
        ].map(({ x, y, w, h, label }) => {
          // Scale to container size
          const sx = (x / 800) * dims.w;
          const sy = (y / 260) * dims.h;
          const sw = (w / 800) * dims.w;
          const sh = (h / 260) * dims.h;
          return (
            <rect
              key={label}
              x={sx} y={sy} width={sw} height={sh}
              rx={8} ry={8}
              fill="rgba(99,130,180,0.08)"
              stroke="rgba(99,130,180,0.18)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Continent labels */}
        {[
          { lat: 50, lng: -100, label: 'N.AMERICA' },
          { lat: -15, lng: -55,  label: 'S.AMERICA' },
          { lat: 50, lng: 15,    label: 'EUROPE'    },
          { lat: 5,  lng: 20,    label: 'AFRICA'    },
          { lat: 40, lng: 90,    label: 'ASIA'      },
          { lat: -25, lng: 135,  label: 'AUSTRALIA' },
        ].map(({ lat, lng, label }) => {
          const { x, y } = toXY(lat, lng, dims.w, dims.h);
          return (
            <text key={label} x={x} y={y} textAnchor="middle"
              style={{ fontSize: 7, fill: 'rgba(148,163,184,0.3)', fontFamily: 'JetBrains Mono', letterSpacing: '0.15em', fontWeight: 600 }}>
              {label}
            </text>
          );
        })}

        {/* News pins */}
        {pins.map((pin, i) => {
          const colors = PRIORITY_COLORS[pin.top.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Low;
          return (
            <g key={i} style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                const r = (e.currentTarget as SVGGElement).getBoundingClientRect();
                setTooltip({ title: pin.top.title, source: pin.top.source, count: pin.count, x: r.left, y: r.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Outer glow ring */}
              <circle cx={pin.pos.x} cy={pin.pos.y} r={10} fill={colors.ring} />
              {/* Inner glow */}
              <circle cx={pin.pos.x} cy={pin.pos.y} r={6} fill={colors.ring} />
              {/* Main dot */}
              <circle cx={pin.pos.x} cy={pin.pos.y} r={4} fill={colors.fill}
                filter={`url(#glow-${pin.top.priority})`} />
              {/* Count */}
              {pin.count > 1 && (
                <text x={pin.pos.x} y={pin.pos.y - 8} textAnchor="middle"
                  style={{ fontSize: 7, fill: colors.fill, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                  {pin.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">Click GET NEWS to populate map</p>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none rounded-xl p-3"
          style={{ left: tooltip.x + 14, top: tooltip.y - 70, maxWidth: 280,
            background: 'rgba(5,13,30,0.97)', border: '1px solid rgba(59,130,246,0.3)',
            backdropFilter: 'blur(16px)' }}>
          <p className="text-[12px] text-slate-200 font-medium leading-snug">{tooltip.title}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">{tooltip.source}</p>
          {tooltip.count > 1 && <p className="text-[9px] font-mono text-blue-400 mt-0.5">+{tooltip.count - 1} more here</p>}
        </div>
      )}
    </div>
  );
}
