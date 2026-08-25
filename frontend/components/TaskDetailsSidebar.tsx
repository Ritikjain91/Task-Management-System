'use client';

import { CalendarDays, User as UserIcon } from 'lucide-react';
import type { Activity, Task, User } from '@/lib/types';
import { StatusPicker, PriorityPicker } from './TaskPickers';
import { MembersPicker } from './MembersPicker';
import { DatePicker, formatDate } from './DatePicker';
import { Avatar, AvatarStack } from './Avatar';
import { timeAgo } from './CommentsSection';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs font-medium text-[var(--color-ink-faint)]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function TaskDetailsSidebar({
  task,
  workspaceMembers,
  onUpdate,
}: {
  task: Task;
  workspaceMembers: User[];
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  return (
    <aside className="w-full shrink-0 border-t border-[var(--color-border)] p-4 md:w-72 md:overflow-y-auto md:border-l md:border-t-0">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
        Details
      </h3>
      <div className="divide-y divide-[var(--color-border)]/60">
        <Row label="Status">
          <StatusPicker value={task.status} onChange={(s) => onUpdate({ status: s })} />
        </Row>
        <Row label="Priority">
          <PriorityPicker value={task.priority} onChange={(p) => onUpdate({ priority: p })} />
        </Row>
        <Row label="Members">
          <MembersPicker
            value={task.members ?? []}
            workspaceMembers={workspaceMembers}
            onChange={(users) => onUpdate({ memberIds: users.map((u) => u.id) })}
          />
        </Row>
        <Row label="Due date">
          <DatePicker
            value={task.dueDate}
            onChange={(iso) => onUpdate({ dueDate: iso })}
            trigger={({ toggle, display }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-[var(--color-canvas-subtle)]"
              >
                <CalendarDays size={13} className="text-[var(--color-ink-faint)]" />
                {task.dueDate ? formatDate(task.dueDate) : display}
              </button>
            )}
          />
        </Row>
        <Row label="Reporter">
          {task.reporter ? (
            <div className="flex items-center gap-1.5">
              <Avatar user={task.reporter} size="xs" />
              <span className="text-sm">{task.reporter.name}</span>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
              <UserIcon size={13} /> None
            </span>
          )}
        </Row>
      </div>

      <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
        Updates
      </h3>
      <ActivityList activity={task.activity ?? []} />
    </aside>
  );
}

function ActivityList({ activity }: { activity: Activity[] }) {
  if (activity.length === 0) {
    return <p className="text-xs text-[var(--color-ink-faint)]">No activity yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {activity.map((a) => (
        <li key={a.id} className="flex gap-2 text-xs">
          <Avatar user={a.user} size="xs" />
          <p className="text-[var(--color-ink-muted)]">
            <span className="font-medium text-[var(--color-ink)]">{a.user.name}</span>{' '}
            {a.message}
            <span className="ml-1.5 text-[var(--color-ink-faint)]">{timeAgo(a.createdAt)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
