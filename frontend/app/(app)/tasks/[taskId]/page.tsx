'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Link2, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Task } from '@/lib/types';
import { LabelChip } from '@/components/badges';
import { SubtasksTable } from '@/components/SubtasksTable';
import { CommentsSection } from '@/components/CommentsSection';
import { TaskDetailsSidebar } from '@/components/TaskDetailsSidebar';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const { user, activeWorkspace } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labelDraft, setLabelDraft] = useState('');
  const [resourceDraft, setResourceDraft] = useState('');
  const [addingLabel, setAddingLabel] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

  const load = useCallback(async () => {
    const data = await api.getTask(taskId);
    setTask(data);
    setTitle(data.title);
    setDescription(data.description);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(data: Record<string, unknown>) {
    if (!task) return;
    setTask({ ...task, ...data } as Task);
    const updated = await api.updateTask(task.id, data);
    setTask(updated);
  }

  async function handleDelete() {
    if (!task) return;
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    await api.deleteTask(task.id);
    router.push('/tasks');
  }

  async function addLabel() {
    const label = labelDraft.trim();
    setAddingLabel(false);
    setLabelDraft('');
    if (!label || !task) return;
    if (task.labels.includes(label)) return;
    await patch({ labels: [...task.labels, label] });
  }

  async function removeLabel(label: string) {
    if (!task) return;
    await patch({ labels: task.labels.filter((l) => l !== label) });
  }

  async function addResource() {
    const resource = resourceDraft.trim();
    setAddingResource(false);
    setResourceDraft('');
    if (!resource || !task) return;
    await patch({ resources: [...task.resources, resource] });
  }

  async function removeResource(resource: string) {
    if (!task) return;
    await patch({ resources: task.resources.filter((r) => r !== resource) });
  }

  if (loading || !task || !user) {
    return <div className="p-6 text-sm text-[var(--color-ink-faint)]">Loading task…</div>;
  }

  const workspaceMembers = activeWorkspace?.members ?? [];

  return (
    <div className="flex h-full flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <div className="min-w-0 flex-1 md:overflow-y-auto">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={15} />
            Tasks
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-ink-faint)] hover:bg-red-50 hover:text-[var(--color-priority-urgent)]"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </header>

        <div className="max-w-2xl px-4 py-6 sm:px-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && patch({ title: title.trim() })}
            className="w-full text-xl font-semibold outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== task.description && patch({ description })}
            placeholder="Add a description…"
            rows={3}
            className="mt-2 w-full resize-none text-sm text-[var(--color-ink-muted)] outline-none"
          />

          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
              Labels
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {task.labels.map((l) => (
                <span key={l} className="group relative">
                  <LabelChip label={l} />
                  <button
                    type="button"
                    onClick={() => removeLabel(l)}
                    className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-ink)] text-white group-hover:flex"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
              {addingLabel ? (
                <input
                  autoFocus
                  value={labelDraft}
                  onChange={(e) => setLabelDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                  onBlur={addLabel}
                  placeholder="Label name…"
                  className="w-28 rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingLabel(true)}
                  className="flex items-center gap-1 rounded-md border border-dashed border-[var(--color-border-strong)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
                >
                  <Plus size={11} /> Add
                </button>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
              Resources
            </h3>
            <div className="flex flex-col gap-1">
              {task.resources.map((r) => (
                <div
                  key={r}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm"
                >
                  <span className="flex items-center gap-2 truncate text-[var(--color-ink-muted)]">
                    <Link2 size={13} />
                    {r}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeResource(r)}
                    className="text-[var(--color-ink-faint)] hover:text-[var(--color-priority-urgent)]"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {addingResource ? (
                <input
                  autoFocus
                  value={resourceDraft}
                  onChange={(e) => setResourceDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addResource()}
                  onBlur={addResource}
                  placeholder="Link or file name…"
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingResource(true)}
                  className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-medium text-[var(--color-ink-faint)] hover:bg-[var(--color-canvas-subtle)]"
                >
                  <Plus size={12} /> Add document or link…
                </button>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
              Subtasks
            </h3>
            <SubtasksTable
              taskId={task.id}
              subtasks={task.subtasks ?? []}
              workspaceMembers={workspaceMembers}
              onChange={load}
            />
          </section>

          <section className="mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
              Comments
            </h3>
            <CommentsSection
              taskId={task.id}
              comments={task.comments ?? []}
              currentUser={user}
              onChange={load}
            />
          </section>
        </div>
      </div>

      <TaskDetailsSidebar task={task} workspaceMembers={workspaceMembers} onUpdate={patch} />
    </div>
  );
}
