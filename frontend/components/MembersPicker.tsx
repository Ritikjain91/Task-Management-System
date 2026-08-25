'use client';

import { useState } from 'react';
import type { User } from '@/lib/types';
import { Popover, PopoverItem } from './Popover';
import { Avatar, AvatarStack } from './Avatar';

export function MembersPicker({
  value,
  workspaceMembers,
  onChange,
  trigger,
}: {
  value: User[];
  workspaceMembers: User[];
  onChange: (users: User[]) => void;
  trigger?: (opts: { toggle: () => void }) => React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const filtered = workspaceMembers.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );

  function toggle(user: User) {
    const isSelected = value.some((v) => v.id === user.id);
    onChange(isSelected ? value.filter((v) => v.id !== user.id) : [...value, user]);
  }

  return (
    <Popover
      trigger={({ toggle: t }) =>
        trigger ? (
          trigger({ toggle: t })
        ) : (
          <button
            type="button"
            onClick={t}
            className="rounded-md px-1 py-0.5 hover:bg-[var(--color-canvas-subtle)]"
          >
            <AvatarStack users={value} />
          </button>
        )
      }
    >
      {() => (
        <div className="w-56">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="mb-1 w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-2.5 py-2 text-sm text-[var(--color-ink-faint)]">No members found</p>
            )}
            {filtered.map((m) => {
              const selected = value.some((v) => v.id === m.id);
              return (
                <PopoverItem key={m.id} active={selected} onClick={() => toggle(m)}>
                  <Avatar user={m} size="xs" />
                  <span className="flex-1 truncate">{m.name}</span>
                  {selected && <span className="text-[var(--color-accent)]">✓</span>}
                </PopoverItem>
              );
            })}
          </div>
        </div>
      )}
    </Popover>
  );
}
