import type { ProjectPriority, ProjectStatus, TaskPriority, TaskStatus } from '@/lib/types';

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  'No Priority': 'var(--color-priority-none)',
  Low: 'var(--color-priority-low)',
  Medium: 'var(--color-priority-medium)',
  High: 'var(--color-priority-high)',
  Urgent: 'var(--color-priority-urgent)',
};

// Three ascending bars, like a signal-strength icon — filled proportionally
// to priority. Reads at a glance without relying on color alone.
function PriorityIcon({ priority }: { priority: TaskPriority }) {
  const level = { 'No Priority': 0, Low: 1, Medium: 2, High: 3, Urgent: 3 }[priority];
  const color = PRIORITY_COLOR[priority];
  const heights = [4, 7, 10];
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden className="shrink-0">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={10 - h}
          width="3"
          height={h}
          rx="0.5"
          fill={i < level ? color : 'var(--color-border-strong)'}
        />
      ))}
      {priority === 'Urgent' && (
        <rect x="0" y="0" width="12" height="10" fill="none" />
      )}
    </svg>
  );
}

export function PriorityBadge({
  priority,
  className = '',
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}
      style={{ color: priority === 'No Priority' ? 'var(--color-ink-faint)' : PRIORITY_COLOR[priority] }}
    >
      <PriorityIcon priority={priority} />
      {priority}
    </span>
  );
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  'To Do': 'var(--color-status-todo)',
  Doing: 'var(--color-status-doing)',
  Completed: 'var(--color-status-completed)',
  'On Hold': 'var(--color-status-onhold)',
};

export function StatusDot({ status }: { status: TaskStatus }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: STATUS_COLOR[status] }}
    />
  );
}

export function LabelChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-ink-muted)]">
      {label}
    </span>
  );
}

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  Todo: 'bg-[var(--color-canvas-subtle)] text-[var(--color-ink-muted)]',
  Doing: 'bg-blue-50 text-blue-700',
  Done: 'bg-green-50 text-green-700',
};

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PROJECT_STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

const PROJECT_PRIORITY_COLOR: Record<ProjectPriority, string> = {
  'No priority': 'var(--color-priority-none)',
  Low: 'var(--color-priority-low)',
  Medium: 'var(--color-priority-medium)',
  High: 'var(--color-priority-high)',
  Urgent: 'var(--color-priority-urgent)',
};

export function ProjectPriorityBadge({ priority }: { priority: ProjectPriority }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{
        color:
          priority === 'No priority' ? 'var(--color-ink-faint)' : PROJECT_PRIORITY_COLOR[priority],
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor:
            priority === 'No priority'
              ? 'var(--color-border-strong)'
              : PROJECT_PRIORITY_COLOR[priority],
        }}
      />
      {priority}
    </span>
  );
}
