'use client';

import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Popover, PopoverItem } from './Popover';

export type FieldKey = 'priority' | 'members' | 'dueDate' | 'labels' | 'reporter';

export const FIELD_LABELS: Record<FieldKey, string> = {
  priority: 'Priority',
  members: 'Members',
  dueDate: 'Due Date',
  labels: 'Labels',
  reporter: 'Reporter',
};

export function FieldsMenu({
  view,
  onViewChange,
  fields,
  onToggleField,
}: {
  view: 'list' | 'board';
  onViewChange: (v: 'list' | 'board') => void;
  fields: Record<FieldKey, boolean>;
  onToggleField: (key: FieldKey) => void;
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
        <div className="w-52">
          <div className="mb-1 flex gap-1 rounded-lg bg-[var(--color-canvas-subtle)] p-1">
            <button
              type="button"
              onClick={() => onViewChange('list')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors ${
                view === 'list' ? 'bg-white shadow-sm' : 'text-[var(--color-ink-faint)]'
              }`}
            >
              <List size={13} /> List
            </button>
            <button
              type="button"
              onClick={() => onViewChange('board')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors ${
                view === 'board' ? 'bg-white shadow-sm' : 'text-[var(--color-ink-faint)]'
              }`}
            >
              <LayoutGrid size={13} /> Board
            </button>
          </div>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          {(Object.keys(FIELD_LABELS) as FieldKey[]).map((key) => (
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
              {FIELD_LABELS[key]}
            </PopoverItem>
          ))}
        </div>
      )}
    </Popover>
  );
}
