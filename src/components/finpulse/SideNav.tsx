import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Globe2, CalendarDays, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", badge: "12" },
  { path: "/map", icon: Globe2, label: "Live Map", badge: "8" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar", badge: "9" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/security", icon: ShieldCheck, label: "Security" },
];

const WATCHLISTS = ["Mega Caps", "Crypto · Top 10", "EU Banks", "AI Infra"];

export function SideNav() {
  const location = useLocation();

  return (
    <div className="hidden md:flex flex-col w-60 flex-shrink-0 glass border-r border-t-0 border-b-0 border-l-0 min-h-[calc(100vh-5.25rem)]">
      <div className="p-4 py-6 flex-1 flex flex-col gap-6">
        
        {/* Workspace Nav */}
        <div>
          <div className="px-3 mb-3">
            <span className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest">Workspace</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group",
                    active ? "text-white bg-gradient-to-r from-[var(--color-cyber-blue)]/15 to-transparent" : "text-[var(--color-muted-foreground)] hover:text-white hover:bg-white/5"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/4 bg-[var(--color-cyber-blue)] rounded-r shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                  )}
                  <Icon className={cn("w-4 h-4", active && "text-[var(--color-cyber-blue)]")} />
                  {item.label}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto mono text-[9px] px-1.5 py-0.5 rounded",
                      active ? "bg-[var(--color-cyber-blue)]/20 text-[var(--color-cyber-blue)]" : "bg-white/5 text-[var(--color-muted-foreground)]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Watchlists */}
        <div>
          <div className="px-3 mb-3">
            <span className="mono text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest">Watchlists</span>
          </div>
          <nav className="flex flex-col gap-1">
            {WATCHLISTS.map((list) => (
              <button key={list} className="flex items-center justify-between px-3 py-1.5 rounded-md text-[12px] text-[var(--color-muted-foreground)] hover:text-white hover:bg-white/5 transition-all text-left">
                {list}
                <Zap className="w-3 h-3 opacity-30" />
              </button>
            ))}
          </nav>
        </div>

      </div>

      {/* System Status Footer */}
      <div className="p-4 mt-auto">
        <div className="glass rounded-md p-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">System</span>
            <div className="ml-auto flex items-center gap-1.5 mono text-[9px] text-[var(--color-cyber-emerald)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyber-emerald)] animate-pulse-dot" />
              Online
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "CPU", val: 42, color: "bg-[var(--color-cyber-blue)]" },
              { label: "Mem", val: 68, color: "bg-[var(--color-cyber-emerald)]" },
              { label: "Net", val: 87, color: "bg-[var(--color-cyber-amber)]" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex justify-between items-end mb-1">
                  <span className="mono text-[9px] text-[var(--color-muted-foreground)]">{stat.label}</span>
                  <span className="mono text-[9px] text-white">{stat.val}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", stat.color)} style={{ width: `${stat.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
