import React from "react";
import { PageHeader } from "../components/finpulse/PageHeader";
import { StatusPill } from "../components/finpulse/StatusPill";
import { ENDPOINTS } from "../lib/finpulse-data";
import { ShieldCheck, Lock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

export function Security() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader eyebrow="POSTURE · LIVE" title="Security & Endpoints">
        <StatusPill label="HEALTHY" value="7" dotColor="emerald" pulse />
        <StatusPill label="DEGRADED" value="1" dotColor="amber" />
      </PageHeader>

      {/* Top Posture Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: "TLS Posture", val: "A+", desc: "HSTS · TLS 1.3 · OCSP stapling", color: "border-[var(--color-cyber-emerald)]/50", text: "text-[var(--color-cyber-emerald)]", Icon: ShieldCheck },
          { label: "Secret Rotation", val: "14d", desc: "Last rotation 4 days ago", color: "border-[var(--color-cyber-blue)]/50", text: "text-[var(--color-cyber-blue)]", Icon: Lock },
          { label: "Anomalies · 24h", val: "2", desc: "Both auto-mitigated by WAF", color: "border-[var(--color-cyber-amber)]/50", text: "text-[var(--color-cyber-amber)]", Icon: ShieldAlert }
        ].map((card, i) => {
          const Icon = card.Icon;
          return (
            <div key={i} className={cn("glass rounded-xl p-5 border-t-2", card.color)}>
              <div className="flex justify-between items-start mb-2">
                <span className="mono text-[10px] uppercase text-[var(--color-muted-foreground)] tracking-widest">{card.label}</span>
                <Icon className={cn("w-4 h-4", card.text)} />
              </div>
              <div className={cn("text-2xl font-bold mb-1", card.text)}>{card.val}</div>
              <p className="mono text-[9px] text-[var(--color-muted-foreground)]">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Endpoints Table */}
      <div className="glass rounded-xl mb-8 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-[13px] font-semibold text-white">API Endpoints</h3>
            <p className="mono text-[9px] text-[var(--color-muted-foreground)]">8 targets monitored</p>
          </div>
          <StatusPill label="PROBE" value="30s" dotColor="muted" />
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {ENDPOINTS.map((ep, i) => {
            const isOp = ep.status === "operational";
            return (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-[var(--color-background)]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", isOp ? "bg-[var(--color-cyber-emerald)] text-[var(--color-cyber-emerald)] animate-pulse-dot" : "bg-[var(--color-cyber-amber)] text-[var(--color-cyber-amber)]")} />
                  <div>
                    <div className="text-[12px] font-medium text-white">{ep.name}</div>
                    <div className="mono text-[9px] text-[var(--color-muted-foreground)] truncate max-w-[200px] md:max-w-md">{ep.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={cn("hidden md:inline-block mono text-[9px] px-1.5 py-0.5 rounded", isOp ? "bg-[var(--color-cyber-emerald)]/10 text-[var(--color-cyber-emerald)]" : "bg-[var(--color-cyber-amber)]/10 text-[var(--color-cyber-amber)]")}>
                    {ep.status}
                  </span>
                  <span className="mono text-[11px] text-white w-12 text-right">{ep.latency}ms</span>
                  <span className="mono text-[11px] text-[var(--color-cyber-emerald)] w-12 text-right">{ep.uptime}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">Active Mitigations</h3>
          <div className="space-y-3">
            {[
              { title: "Rate limiting", desc: "1000 req / min per IP" },
              { title: "WAF rules", desc: "OWASP Core Set 4.x" },
              { title: "DDoS Shield", desc: "Cloudflare L7 active" },
              { title: "Webhook HMAC", desc: "SHA-256 verified" },
              { title: "Secret scanning", desc: "Hourly sweeps" }
            ].map(m => (
              <div key={m.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-cyber-emerald)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[12px] font-medium text-white">{m.title}</div>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)]">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">Recent Audit Log</h3>
          <div className="space-y-2">
            {[
              { time: "12:04:21", level: "INFO", text: "Key rotation complete · key_id=ak_92f1", c: "text-[var(--color-cyber-blue)]" },
              { time: "11:58:03", level: "WARN", text: "RSS · NYT latency 612ms (>500ms threshold)", c: "text-[var(--color-cyber-amber)]" },
              { time: "11:42:11", level: "INFO", text: "WAF blocked request from 185.220.x.x", c: "text-[var(--color-cyber-blue)]" },
              { time: "11:30:00", level: "INFO", text: "Cron · ingestion sweep ok (1,212 items)", c: "text-[var(--color-cyber-blue)]" },
              { time: "11:14:38", level: "WARN", text: "Burst on /api/llm/groq — backoff applied", c: "text-[var(--color-cyber-amber)]" },
            ].map((log, i) => (
              <div key={i} className="grid grid-cols-[60px_40px_1fr] gap-3 items-baseline border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <span className="mono text-[10px] text-[var(--color-muted-foreground)]">{log.time}</span>
                <span className={cn("mono text-[9px] font-bold", log.c)}>{log.level}</span>
                <span className="mono text-[10px] text-white truncate">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
