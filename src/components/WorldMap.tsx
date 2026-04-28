import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Article } from '../types';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Entity/keyword → [latitude, longitude]
const KEYWORD_COORDS: Record<string, [number, number]> = {
  // Currencies / Central Banks
  'USD': [37.09, -95.71], 'Federal Reserve': [38.90, -77.03], 'Fed': [38.90, -77.03],
  'GBP': [51.51, -0.12], 'BOE': [51.51, -0.12], 'Bank of England': [51.51, -0.12],
  'EUR': [48.85, 2.35], 'ECB': [50.11, 8.68], 'Eurozone': [50.11, 8.68],
  'JPY': [35.68, 139.69], 'BOJ': [35.68, 139.69], 'Bank of Japan': [35.68, 139.69],
  'CAD': [45.42, -75.69], 'CNY': [39.90, 116.40], 'PBOC': [39.90, 116.40],
  'AUD': [-33.86, 151.20], 'RBA': [-33.86, 151.20], 'NZD': [-36.86, 174.76],
  'CHF': [46.94, 7.44], 'SNB': [46.94, 7.44], 'INR': [28.61, 77.21],
  'RUB': [55.75, 37.62], 'BRL': [-15.77, -47.92], 'ZAR': [-25.74, 28.18],
  // Countries
  'US': [37.09, -95.71], 'USA': [37.09, -95.71], 'United States': [37.09, -95.71], 'America': [37.09, -95.71],
  'UK': [51.51, -0.12], 'Britain': [51.51, -0.12], 'England': [51.51, -0.12], 'Scotland': [56.49, -4.20],
  'Germany': [52.52, 13.40], 'France': [48.85, 2.35], 'Italy': [41.89, 12.48], 'Spain': [40.41, -3.70],
  'Japan': [35.68, 139.69], 'China': [39.90, 116.40], 'India': [28.61, 77.21],
  'Russia': [55.75, 37.62], 'Canada': [56.13, -106.34], 'Australia': [-25.27, 133.77],
  'Brazil': [-15.77, -47.92], 'South Africa': [-25.74, 28.18], 'Mexico': [23.63, -102.55],
  'Turkey': [38.96, 35.24], 'Saudi': [23.88, 45.08], 'UAE': [23.42, 53.85],
  'Iran': [32.42, 53.68], 'Israel': [31.77, 35.21], 'Pakistan': [30.37, 69.34],
  'Korea': [35.90, 127.76], 'Taiwan': [23.69, 120.96], 'Singapore': [1.35, 103.82],
  'Indonesia': [-0.78, 113.92], 'Thailand': [15.87, 100.99], 'Vietnam': [14.05, 108.27],
  // Orgs / topics (map to dominant geography)
  'OPEC': [23.88, 45.08], 'NATO': [50.85, 4.35], 'BRICS': [28.61, 77.21],
  'G7': [38.90, -77.03], 'IMF': [38.90, -77.03], 'World Bank': [38.90, -77.03],
  'WTO': [46.22, 6.14], 'UN': [40.74, -73.98], 'WHO': [46.22, 6.14],
  'Bitcoin': [37.09, -95.71], 'Crypto': [37.09, -95.71], 'Ethereum': [37.09, -95.71],
  'Gold': [40.71, -74.01], 'Oil': [23.88, 45.08], 'Gas': [55.75, 37.62],
  'Middle East': [29.31, 47.48], 'Asia': [34.04, 100.62], 'Africa': [-8.78, 34.50],
  'Europe': [54.52, 15.25], 'Pacific': [-8.78, 160.00],
};

// Source → default pin location
const SOURCE_COORDS: Record<string, [number, number]> = {
  'BBC': [51.51, -0.12],
  'CNN': [40.76, -73.98],
  'Al Jazeera': [25.28, 51.49],
  'Reuters': [51.51, -0.12],
};

const PRIORITY_COLORS = {
  High: { fill: '#ef4444', shadow: 'rgba(239,68,68,0.8)', ring: 'rgba(239,68,68,0.3)' },
  Medium: { fill: '#f59e0b', shadow: 'rgba(245,158,11,0.8)', ring: 'rgba(245,158,11,0.3)' },
  Low: { fill: '#3b82f6', shadow: 'rgba(59,130,246,0.8)', ring: 'rgba(59,130,246,0.3)' },
};

function getCoords(article: Article): [number, number] | null {
  const text = `${article.title} ${article.body} ${article.entities?.join(' ')}`;
  for (const [keyword, coords] of Object.entries(KEYWORD_COORDS)) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) return coords;
  }
  for (const [srcKey, coords] of Object.entries(SOURCE_COORDS)) {
    if (article.source?.includes(srcKey)) return coords;
  }
  return null;
}

interface WorldMapProps {
  articles: Article[];
}

export default function WorldMap({ articles }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ article: Article; x: number; y: number } | null>(null);

  const pins = useMemo(() => {
    const seen = new Map<string, Article[]>();
    articles.forEach(a => {
      const coords = getCoords(a);
      if (!coords) return;
      const key = `${coords[0].toFixed(1)},${coords[1].toFixed(1)}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(a);
    });
    return Array.from(seen.entries()).map(([key, arts]) => {
      const [lat, lng] = key.split(',').map(Number);
      const topArticle = arts.sort((a, b) =>
        (a.priority === 'High' ? 0 : a.priority === 'Medium' ? 1 : 2) -
        (b.priority === 'High' ? 0 : b.priority === 'Medium' ? 1 : 2)
      )[0];
      return { coords: [lng, lat] as [number, number], articles: arts, top: topArticle };
    });
  }, [articles]);

  return (
    <div
      className="mx-4 mb-4 rounded-2xl overflow-hidden relative"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        height: '280px',
      }}
    >
      {/* Header */}
      <div className="absolute top-3 left-4 z-10">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">Live News Map</span>
        <span className="ml-3 text-[9px] font-mono text-slate-600">{pins.length} locations</span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-3">
        {(['High', 'Medium', 'Low'] as const).map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[p].fill, boxShadow: `0 0 6px ${PRIORITY_COLORS[p].shadow}` }} />
            <span className="text-[9px] font-mono text-slate-500">{p}</span>
          </div>
        ))}
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 0.4, outline: 'none' },
                    hover: { fill: 'rgba(59,130,246,0.1)', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {pins.map((pin, i) => {
            const colors = PRIORITY_COLORS[pin.top.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Low;
            return (
              <Marker key={i} coordinates={pin.coords}>
                {/* Pulse ring */}
                <circle r={8} fill={colors.ring} style={{ animation: 'pulse 2s infinite' }} />
                {/* Main dot */}
                <circle
                  r={4}
                  fill={colors.fill}
                  style={{ filter: `drop-shadow(0 0 4px ${colors.shadow})`, cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGCircleElement).getBoundingClientRect();
                    setTooltip({ article: pin.top, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                {pin.articles.length > 1 && (
                  <text
                    textAnchor="middle"
                    y={-8}
                    style={{ fontSize: '7px', fill: colors.fill, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
                  >
                    {pin.articles.length}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none max-w-xs rounded-xl p-3 text-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 60,
            background: 'rgba(6,13,26,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-slate-200 font-medium leading-tight">{tooltip.article.title}</p>
          <p className="text-slate-500 text-[10px] mt-1 font-mono">{tooltip.article.source}</p>
        </div>
      )}
    </div>
  );
}
