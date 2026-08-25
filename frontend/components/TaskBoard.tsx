'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { StatusDot } from './badges';

export function TaskBoard({
  tasks,
  onStatusChange,
  onQuickAdd,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onQuickAdd: (status: TaskStatus, title: string) => void;
}) {
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [addingIn, setAddingIn] = useState<TaskStatus | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  function handleDrop(status: TaskStatus, e: React.DragEvent) {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData('text/task-id');
    if (taskId) onStatusChange(taskId, status);
  }

  function submitDraft(status: TaskStatus) {
    const title = draftTitle.trim();
    if (title) onQuickAdd(status, title);
    setDraftTitle('');
    setAddingIn(null);
  }

  return (
    <div className="flex h-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 sm:px-6">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(status, e)}
            className={`flex w-[82vw] shrink-0 snap-start flex-col rounded-xl transition-colors sm:w-72 ${
              dragOverStatus === status ? 'bg-[var(--color-accent-soft)]' : ''
            }`}
          >
            <div className="flex items-center justify-between px-1 py-2">
              <div className="flex items-center gap-2">
                <StatusDot status={status} />
                <span className="text-sm font-semibold">{status}</span>
                <span className="text-xs font-medium text-[var(--color-ink-faint)]">
                  {columnTasks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAddingIn(status)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink-faint)] hover:bg-white hover:text-[var(--color-ink)]"
                aria-label={`Add task to ${status}`}
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
                />
              ))}

              {addingIn === status && (
                <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-2">
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitDraft(status);
                      if (e.key === 'Escape') {
                        setAddingIn(null);
                        setDraftTitle('');
                      }
                    }}
                    onBlur={() => submitDraft(status)}
                    placeholder="Task title…"
                    className="w-full text-sm outline-none"
                  />
                </div>
              )}

              {!addingIn && columnTasks.length === 0 && (
                <button
                  type="button"
                  onClick={() => setAddingIn(status)}
                  className="rounded-xl border border-dashed border-[var(--color-border)] px-3 py-4 text-left text-xs text-[var(--color-ink-faint)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-ink-muted)]"
                >
                  No tasks yet — add one
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAddingIn(status)}
              className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-[var(--color-ink-faint)] hover:bg-white hover:text-[var(--color-ink-muted)]"
            >
              <Plus size={13} />
              Add Task
            </button>
          </div>
        );
      })}
    </div>
  );
}
