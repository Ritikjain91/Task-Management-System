'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/lib/types';
import type { FieldKey } from './FieldsMenu';
import { StatusDot } from './badges';
import { PriorityPicker } from './TaskPickers';
import { MembersPicker } from './MembersPicker';
import { DatePicker, formatDate } from './DatePicker';
import { AvatarStack } from './Avatar';
import { LabelChip } from './badges';
import { Popover, PopoverItem } from './Popover';
import type { User } from '@/lib/types';

export function TaskListView({
  tasks,
  fields,
  workspaceMembers,
  onUpdate,
  onDelete,
}: {
  tasks: Task[];
  fields: Record<FieldKey, boolean>;
  workspaceMembers: User[];
  onUpdate: (taskId: string, data: Record<string, unknown>) => void;
  onDelete: (taskId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 sm:px-6">
      {TASK_STATUSES.map((status) => {
        const rows = tasks.filter((t) => t.status === status);
        if (rows.length === 0) return null;
        const isCollapsed = collapsed[status];
        return (
          <div key={status}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [status]: !c[status] }))}
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]"
            >
              <ChevronDown
                size={14}
                className={`text-[var(--color-ink-faint)] transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              />
              <StatusDot status={status} />
              {status}
              <span className="text-xs font-medium text-[var(--color-ink-faint)]">
                {rows.length}
              </span>
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas-subtle)] text-left text-xs font-medium text-[var(--color-ink-faint)]">
                      <th className="px-3 py-2 font-medium">Task</th>
                      {fields.priority && <th className="w-32 px-3 py-2 font-medium">Priority</th>}
                      {fields.members && <th className="w-28 px-3 py-2 font-medium">Members</th>}
                      {fields.dueDate && <th className="w-32 px-3 py-2 font-medium">Due Date</th>}
                      {fields.labels && <th className="w-40 px-3 py-2 font-medium">Labels</th>}
                      {fields.reporter && <th className="w-32 px-3 py-2 font-medium">Reporter</th>}
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        fields={fields}
                        workspaceMembers={workspaceMembers}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {tasks.length === 0 && (
        <p className="py-16 text-center text-sm text-[var(--color-ink-faint)]">
          No tasks yet. Create your first one from the board or list.
        </p>
      )}
    </div>
  );
}

function TaskRow({
  task,
  fields,
  workspaceMembers,
  onUpdate,
  onDelete,
}: {
  task: Task;
  fields: Record<FieldKey, boolean>;
  workspaceMembers: User[];
  onUpdate: (taskId: string, data: Record<string, unknown>) => void;
  onDelete: (taskId: string) => void;
}) {
  const router = useRouter();
  return (
    <tr className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-canvas-subtle)]/60">
      <td
        onClick={() => router.push(`/tasks/${task.id}`)}
        className="cursor-pointer px-3 py-2.5 font-medium text-[var(--color-ink)]"
      >
        {task.title}
      </td>
      {fields.priority && (
        <td className="px-3 py-2.5">
          <PriorityPicker
            value={task.priority}
            onChange={(p) => onUpdate(task.id, { priority: p })}
          />
        </td>
      )}
      {fields.members && (
        <td className="px-3 py-2.5">
          <MembersPicker
            value={task.members ?? []}
            workspaceMembers={workspaceMembers}
            onChange={(users) => onUpdate(task.id, { memberIds: users.map((u) => u.id) })}
          />
        </td>
      )}
      {fields.dueDate && (
        <td className="px-3 py-2.5">
          <DatePicker
            value={task.dueDate}
            onChange={(iso) => onUpdate(task.id, { dueDate: iso })}
            trigger={({ toggle, display }) => (
              <button
                type="button"
                onClick={toggle}
                className="rounded-md px-1.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-white"
              >
                {task.dueDate ? formatDate(task.dueDate) : display}
              </button>
            )}
          />
        </td>
      )}
      {fields.labels && (
        <td className="px-3 py-2.5">
          <div className="flex flex-wrap gap-1">
            {task.labels?.length ? (
              task.labels.map((l) => <LabelChip key={l} label={l} />)
            ) : (
              <span className="text-xs text-[var(--color-ink-faint)]">—</span>
            )}
          </div>
        </td>
      )}
      {fields.reporter && (
        <td className="px-3 py-2.5">
          {task.reporter ? (
            <AvatarStack users={[task.reporter]} />
          ) : (
            <span className="text-xs text-[var(--color-ink-faint)]">—</span>
          )}
        </td>
      )}
      <td className="px-3 py-2.5 text-right">
        <Popover
          align="right"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink-faint)] hover:bg-white"
            >
              <MoreHorizontal size={15} />
            </button>
          )}
        >
          {(close) => (
            <PopoverItem
              onClick={() => {
                close();
                onDelete(task.id);
              }}
            >
              <Trash2 size={13} />
              Delete task
            </PopoverItem>
          )}
        </Popover>
      </td>
    </tr>
  );
}

export type { TaskStatus };
