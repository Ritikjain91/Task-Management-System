'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Search, Sun, User, X } from 'lucide-react';

const NAV = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/profile/theme', label: 'Theme', icon: Sun },
  { href: '/profile/color', label: 'Color', icon: null },
];

export function SettingsSidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = NAV.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-canvas-subtle)] p-4 transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onMobileClose?.();
              router.push('/tasks');
            }}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-ink-muted)]"
          >
            <ArrowLeft size={15} />
            Back to app
          </button>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-ink-faint)] hover:bg-white md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-lg border border-[var(--color-border)] bg-white py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <nav className="flex flex-col gap-0.5">
          {filtered.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white text-[var(--color-ink)] shadow-sm shadow-black/5'
                    : 'text-[var(--color-ink-muted)] hover:bg-white/60'
                }`}
              >
                {Icon ? (
                  <Icon size={16} strokeWidth={2} />
                ) : (
                  // "Color" shows the current accent swatch instead of a generic icon.
                  <span
                    className="block h-3.5 w-3.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: 'var(--color-ink)' }}
                    aria-hidden
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
