'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import type { Task } from '@/lib/types';
import { AvatarStack } from './Avatar';
import { LabelChip, PriorityBadge } from './badges';

function dueDateTone(dueDate: string | null) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  if (due < today) return 'text-[var(--color-priority-urgent)] bg-red-50';
  if (due.getTime() === today.getTime()) return 'text-[var(--color-priority-high)] bg-orange-50';
  return 'text-[var(--color-ink-muted)] bg-[var(--color-canvas-subtle)]';
}

function formatShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskCard({
  task,
  draggable = true,
  onDragStart,
}: {
  task: Task;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const router = useRouter();
  const tone = dueDateTone(task.dueDate);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="group cursor-pointer rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-sm shadow-black/[0.02] transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-md hover:shadow-black/5"
    >
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} className="!gap-1" />
        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tone}`}
          >
            <CalendarDays size={11} />
            {formatShort(task.dueDate)}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium text-[var(--color-ink)]">
        {task.title}
      </h3>

      {(task.labels?.length > 0 || task.members?.length > 0) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {task.labels?.slice(0, 2).map((l) => (
              <LabelChip key={l} label={l} />
            ))}
            {task.labels?.length > 2 && (
              <span className="text-[11px] text-[var(--color-ink-faint)]">
                +{task.labels.length - 2}
              </span>
            )}
          </div>
          <AvatarStack users={task.members ?? []} />
        </div>
      )}
    </div>
  );
}
