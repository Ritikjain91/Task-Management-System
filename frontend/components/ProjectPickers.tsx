'use client';

import { PROJECT_PRIORITIES, PROJECT_STATUSES, type ProjectPriority, type ProjectStatus, type User } from '@/lib/types';
import { Popover, PopoverItem } from './Popover';
import { ProjectPriorityBadge, ProjectStatusPill } from './badges';
import { Avatar } from './Avatar';
import { UserPlus } from 'lucide-react';

export function ProjectStatusPicker({
  value,
  onChange,
}: {
  value: ProjectStatus;
  onChange: (s: ProjectStatus) => void;
}) {
  return (
    <Popover
      trigger={({ toggle }) => (
        <button type="button" onClick={toggle} className="rounded-md hover:opacity-80">
          <ProjectStatusPill status={value} />
        </button>
      )}
    >
      {(close) => (
        <>
          {PROJECT_STATUSES.map((s) => (
            <PopoverItem
              key={s}
              active={s === value}
              onClick={() => {
                onChange(s);
                close();
              }}
            >
              <ProjectStatusPill status={s} />
            </PopoverItem>
          ))}
        </>
      )}
    </Popover>
  );
}

export function ProjectPriorityPicker({
  value,
  onChange,
}: {
  value: ProjectPriority;
  onChange: (p: ProjectPriority) => void;
}) {
  return (
    <Popover
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="rounded-md px-1.5 py-1 hover:bg-[var(--color-canvas-subtle)]"
        >
          <ProjectPriorityBadge priority={value} />
        </button>
      )}
    >
      {(close) => (
        <>
          {PROJECT_PRIORITIES.map((p) => (
            <PopoverItem
              key={p}
              active={p === value}
              onClick={() => {
                onChange(p);
                close();
              }}
            >
              <ProjectPriorityBadge priority={p} />
            </PopoverItem>
          ))}
        </>
      )}
    </Popover>
  );
}

export function LeadPicker({
  value,
  workspaceMembers,
  onChange,
}: {
  value: User | null;
  workspaceMembers: User[];
  onChange: (user: User | null) => void;
}) {
  return (
    <Popover
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-[var(--color-canvas-subtle)]"
        >
          {value ? (
            <>
              <Avatar user={value} size="xs" />
              <span className="text-sm">{value.name}</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
              <UserPlus size={14} /> No lead
            </span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div className="w-48">
          {workspaceMembers.map((m) => (
            <PopoverItem
              key={m.id}
              active={value?.id === m.id}
              onClick={() => {
                onChange(m);
                close();
              }}
            >
              <Avatar user={m} size="xs" />
              <span className="truncate">{m.name}</span>
            </PopoverItem>
          ))}
          {value && (
            <>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <PopoverItem
                onClick={() => {
                  onChange(null);
                  close();
                }}
              >
                Clear lead
              </PopoverItem>
            </>
          )}
        </div>
      )}
    </Popover>
  );
}
