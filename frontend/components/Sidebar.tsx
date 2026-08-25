'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CheckSquare,
  ChevronsUpDown,
  FolderKanban,
  LogOut,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from './Avatar';
import { Popover, PopoverItem } from './Popover';
import { api } from '@/lib/api';

const NAV = [
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
];

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspaces, activeWorkspace, setActiveWorkspaceId, refreshWorkspaces, logout } =
    useAuth();
  const [creating, setCreating] = useState(false);

  async function handleCreateWorkspace() {
    const name = window.prompt('Name your new workspace');
    if (!name) return;
    setCreating(true);
    try {
      const ws = await api.createWorkspace(name);
      await refreshWorkspaces();
      setActiveWorkspaceId(ws.id);
    } finally {
      setCreating(false);
    }
  }

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
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-canvas-subtle)] transition-transform duration-200 ease-out md:static md:z-auto md:w-60 md:max-w-none md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-3">
          <Popover
            className="min-w-0 flex-1"
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent)] text-white">
                  <Sparkles size={13} />
                </span>
                <span className="flex-1 truncate text-sm font-semibold">
                  {activeWorkspace?.name ?? 'Workspace'}
                </span>
                <ChevronsUpDown size={14} className="shrink-0 text-[var(--color-ink-faint)]" />
              </button>
            )}
          >
            {(close) => (
              <div className="w-56">
                {workspaces.map((w) => (
                  <PopoverItem
                    key={w.id}
                    active={w.id === activeWorkspace?.id}
                    onClick={() => {
                      setActiveWorkspaceId(w.id);
                      close();
                      onMobileClose?.();
                    }}
                  >
                    <span className="truncate">{w.name}</span>
                  </PopoverItem>
                ))}
                <div className="my-1 h-px bg-[var(--color-border)]" />
                <PopoverItem
                  onClick={() => {
                    close();
                    handleCreateWorkspace();
                  }}
                >
                  <Plus size={14} />
                  {creating ? 'Creating…' : 'New workspace'}
                </PopoverItem>
              </div>
            )}
          </Popover>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-ink-faint)] hover:bg-white md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
          Workspace
        </div>

        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
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
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--color-border)] p-2">
          <Popover
            align="left"
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white"
              >
                {user && <Avatar user={user} size="sm" />}
                <span className="flex-1 truncate text-sm font-medium">{user?.name}</span>
              </button>
            )}
          >
            {(close) => (
              <div className="w-48">
                <PopoverItem
                  onClick={() => {
                    close();
                    onMobileClose?.();
                    router.push('/profile');
                  }}
                >
                  Profile settings
                </PopoverItem>
                <PopoverItem
                  onClick={() => {
                    close();
                    logout();
                  }}
                >
                  <LogOut size={14} />
                  Log out
                </PopoverItem>
              </div>
            )}
          </Popover>
        </div>
      </aside>
    </>
  );
}
