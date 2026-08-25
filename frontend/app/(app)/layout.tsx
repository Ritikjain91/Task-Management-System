'use client';

import { useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { RequireAuth } from '@/components/RequireAuth';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { activeWorkspace } = useAuth();

  return (
    <RequireAuth>
      <div className="flex h-screen flex-col overflow-hidden md:flex-row">
        <header className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-white px-3 py-2.5 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
          >
            <Menu size={18} />
          </button>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent)] text-white">
            <Sparkles size={13} />
          </span>
          <span className="truncate text-sm font-semibold">
            {activeWorkspace?.name ?? 'Pyramid'}
          </span>
        </header>

        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        <main className="min-w-0 flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </RequireAuth>
  );
}
