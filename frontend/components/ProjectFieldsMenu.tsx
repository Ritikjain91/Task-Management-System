'use client';

import { SlidersHorizontal, Filter } from 'lucide-react';
import { Popover, PopoverItem } from './Popover';
import { PROJECT_PRIORITIES, type ProjectPriority } from '@/lib/types';
import { ProjectPriorityBadge } from './badges';

export type ProjectFieldKey = 'status' | 'priority' | 'lead' | 'dueDate';

export const PROJECT_FIELD_LABELS: Record<ProjectFieldKey, string> = {
  status: 'Status',
  priority: 'Priority',
  lead: 'Lead',
  dueDate: 'Due Date',
};

export function ProjectFieldsMenu({
  fields,
  onToggleField,
}: {
  fields: Record<ProjectFieldKey, boolean>;
  onToggleField: (key: ProjectFieldKey) => void;
}) {
  return (
    <Popover
      align="right"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
        >
          <SlidersHorizontal size={13} />
          Fields
        </button>
      )}
    >
      {() => (
        <div className="w-48">
          {(Object.keys(PROJECT_FIELD_LABELS) as ProjectFieldKey[]).map((key) => (
            <PopoverItem key={key} onClick={() => onToggleField(key)}>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  fields[key]
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border-strong)]'
                }`}
              >
                {fields[key] && '✓'}
              </span>
              {PROJECT_FIELD_LABELS[key]}
            </PopoverItem>
          ))}
        </div>
      )}
    </Popover>
  );
}

export function PriorityFilter({
  value,
  onChange,
}: {
  value: ProjectPriority | null;
  onChange: (p: ProjectPriority | null) => void;
}) {
  return (
    <Popover
      align="right"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
            value
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]'
          }`}
        >
          <Filter size={13} />
          {value ?? 'Filter'}
        </button>
      )}
    >
      {(close) => (
        <div className="w-40">
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
          {value && (
            <>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <PopoverItem
                onClick={() => {
                  onChange(null);
                  close();
                }}
              >
                Clear filter
              </PopoverItem>
            </>
          )}
        </div>
      )}
    </Popover>
  );
}
