'use client';

import { useState } from 'react';
import { Popover } from './Popover';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatDisplay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DatePicker({
  value,
  onChange,
  trigger,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  trigger: (opts: { toggle: () => void; display: string }) => React.ReactNode;
}) {
  const initial = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const display = value ? formatDisplay(value) : 'No date';

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <Popover trigger={({ toggle }) => trigger({ toggle, display })}>
      {(close) => (
        <div className="w-64 p-1">
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="text-sm font-medium">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 px-1 text-center">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="text-[11px] font-medium text-[var(--color-ink-faint)]">
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (!day) return <span key={i} />;
              const iso = toISODate(new Date(viewYear, viewMonth, day));
              const selected = value === iso;
              const isToday = iso === toISODate(new Date());
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    close();
                  }}
                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors ${
                    selected
                      ? 'bg-[var(--color-accent)] text-white'
                      : isToday
                        ? 'text-[var(--color-accent)] font-semibold hover:bg-[var(--color-canvas-subtle)]'
                        : 'hover:bg-[var(--color-canvas-subtle)]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                close();
              }}
              className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}

export { formatDisplay as formatDate };
