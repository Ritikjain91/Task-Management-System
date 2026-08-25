'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Subtask, User } from '@/lib/types';
import { PriorityPicker } from './TaskPickers';
import { MembersPicker } from './MembersPicker';
import { DatePicker, formatDate } from './DatePicker';
import { api } from '@/lib/api';

export function SubtasksTable({
  taskId,
  subtasks,
  workspaceMembers,
  onChange,
}: {
  taskId: string;
  subtasks: Subtask[];
  workspaceMembers: User[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  async function handleAdd() {
    const title = draft.trim();
    if (!title) {
      setAdding(false);
      return;
    }
    await api.addSubtask(taskId, { title });
    setDraft('');
    setAdding(false);
    onChange();
  }

  async function update(id: string, data: Record<string, unknown>) {
    await api.updateSubtask(id, data);
    onChange();
  }

  async function remove(id: string) {
    await api.deleteSubtask(id);
    onChange();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas-subtle)] text-left text-xs font-medium text-[var(--color-ink-faint)]">
            <th className="px-3 py-2 font-medium">Task</th>
            <th className="w-32 px-3 py-2 font-medium">Priority</th>
            <th className="w-24 px-3 py-2 font-medium">Members</th>
            <th className="w-32 px-3 py-2 font-medium">Due Date</th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {subtasks.map((s, i) => (
            <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-3 py-2.5">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={(e) => update(s.id, { done: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-[var(--color-border-strong)] accent-[var(--color-accent)]"
                  />
                  <span className={s.done ? 'text-[var(--color-ink-faint)] line-through' : ''}>
                    Subtask {i + 1}: {s.title}
                  </span>
                </label>
              </td>
              <td className="px-3 py-2.5">
                <PriorityPicker value={s.priority} onChange={(p) => update(s.id, { priority: p })} />
              </td>
              <td className="px-3 py-2.5">
                <MembersPicker
                  value={s.members ?? []}
                  workspaceMembers={workspaceMembers}
                  onChange={(users) => update(s.id, { memberIds: users.map((u) => u.id) })}
                />
              </td>
              <td className="px-3 py-2.5">
                <DatePicker
                  value={s.dueDate}
                  onChange={(iso) => update(s.id, { dueDate: iso })}
                  trigger={({ toggle, display }) => (
                    <button
                      type="button"
                      onClick={toggle}
                      className="rounded-md px-1.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
                    >
                      {s.dueDate ? formatDate(s.dueDate) : display}
                    </button>
                  )}
                />
              </td>
              <td className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink-faint)] hover:bg-[var(--color-canvas-subtle)] hover:text-[var(--color-priority-urgent)]"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
          {adding && (
            <tr className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-3 py-2.5" colSpan={5}>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  onBlur={handleAdd}
                  placeholder="Subtask title…"
                  className="w-full text-sm outline-none"
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex w-full items-center gap-1.5 border-t border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-ink-faint)] hover:bg-[var(--color-canvas-subtle)] hover:text-[var(--color-ink-muted)]"
      >
        <Plus size={13} />
        Add Subtask
      </button>
    </div>
  );
}
