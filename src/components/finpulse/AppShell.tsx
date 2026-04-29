import React from "react";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";

interface AppShellProps {
  children: React.ReactNode;
  onFetch: () => void;
  loading: boolean;
}

export function AppShell({ children, onFetch, loading }: AppShellProps) {
  return (
    <div className="relative min-h-screen text-[var(--color-foreground)]">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-[0.35]" />
      <div className="relative z-10">
        <TopNav onFetch={onFetch} loading={loading} />
        <div className="flex">
          <SideNav />
          <main className="min-w-0 flex-1 p-4 lg:p-6 custom-scrollbar h-[calc(100vh-5.25rem)] overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
