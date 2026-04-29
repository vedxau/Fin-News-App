import React from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-[var(--color-border)] gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-[6px] h-[2px] bg-[var(--color-cyber-blue)]" />
          <span className="mono text-[10px] text-[var(--color-cyber-blue)] uppercase tracking-[0.22em] font-semibold">{eyebrow}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-1">{title}</h1>
        {description && (
          <p className="text-[13px] text-[var(--color-muted-foreground)]">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
