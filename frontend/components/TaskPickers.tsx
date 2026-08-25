'use client';

import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from '@/lib/types';
import { Popover, PopoverItem } from './Popover';
import { PriorityBadge, StatusDot } from './badges';

export function PriorityPicker({
  value,
  onChange,
}: {
  value: TaskPriority;
  onChange: (p: TaskPriority) => void;
}) {
  return (
    <Popover
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-[var(--color-canvas-subtle)]"
        >
          <PriorityBadge priority={value} />
        </button>
      )}
    >
      {(close) => (
        <>
          {TASK_PRIORITIES.map((p) => (
            <PopoverItem
              key={p}
              active={p === value}
              onClick={() => {
                onChange(p);
                close();
              }}
            >
              <PriorityBadge priority={p} />
            </PopoverItem>
          ))}
        </>
      )}
    </Popover>
  );
}

export function StatusPicker({
  value,
  onChange,
}: {
  value: TaskStatus;
  onChange: (s: TaskStatus) => void;
}) {
  return (
    <Popover
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-[var(--color-canvas-subtle)]"
        >
          <StatusDot status={value} />
          {value}
        </button>
      )}
    >
      {(close) => (
        <>
          {TASK_STATUSES.map((s) => (
            <PopoverItem
              key={s}
              active={s === value}
              onClick={() => {
                onChange(s);
                close();
              }}
            >
              <StatusDot status={s} />
              <span className="ml-2">{s}</span>
            </PopoverItem>
          ))}
        </>
      )}
    </Popover>
  );
}
