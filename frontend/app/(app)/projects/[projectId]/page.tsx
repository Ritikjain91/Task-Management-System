'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTasks } from '@/lib/useTasks';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskListView } from '@/components/TaskListView';
import { FieldsMenu, type FieldKey } from '@/components/FieldsMenu';
import { AddTaskModal } from '@/components/AddTaskModal';

const DEFAULT_FIELDS: Record<FieldKey, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  reporter: false,
};

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { activeWorkspace } = useAuth();
  const { tasks, loading, patchTask, removeTask, addTask } = useTasks(
    activeWorkspace?.id,
    projectId,
  );

  const [project, setProject] = useState<Project | null>(null);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [fields, setFields] = useState<Record<FieldKey, boolean>>(DEFAULT_FIELDS);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      setProject(await api.getProject(projectId));
    } catch {
      router.replace('/projects');
    }
  }, [projectId, router]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    const storedView = window.localStorage.getItem('pyramid_task_view');
    if (storedView === 'list' || storedView === 'board') setView(storedView);
    const storedFields = window.localStorage.getItem('pyramid_task_fields');
    if (storedFields) {
      try {
        setFields(JSON.parse(storedFields));
      } catch {
        // ignore malformed value
      }
    }
  }, []);

  function changeView(v: 'list' | 'board') {
    setView(v);
    window.localStorage.setItem('pyramid_task_view', v);
  }

  function toggleField(key: FieldKey) {
    setFields((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      window.localStorage.setItem('pyramid_task_fields', JSON.stringify(next));
      return next;
    });
  }

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, query]);

  const workspaceMembers = activeWorkspace?.members ?? [];

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
        <div className="mb-2 flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
          <Link href="/projects" className="hover:text-[var(--color-ink-muted)]">
            Projects
          </Link>
          <ChevronRight size={13} />
          <span className="truncate text-[var(--color-ink)]">{project?.name ?? '…'}</span>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-lg font-semibold">Tasks</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks…"
                className="w-full rounded-lg border border-[var(--color-border)] py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)] sm:w-52"
              />
            </div>
            <FieldsMenu
              view={view}
              onViewChange={changeView}
              fields={fields}
              onToggleField={toggleField}
            />
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden pt-4">
        {loading ? (
          <p className="px-4 text-sm text-[var(--color-ink-faint)] sm:px-6">Loading tasks…</p>
        ) : view === 'board' ? (
          <div className="h-full overflow-y-auto">
            <TaskBoard
              tasks={filteredTasks}
              onStatusChange={(id, status) => patchTask(id, { status })}
              onQuickAdd={(status, title) => addTask(title, { status })}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <TaskListView
              tasks={filteredTasks}
              fields={fields}
              workspaceMembers={workspaceMembers}
              onUpdate={(id, data) => patchTask(id, data)}
              onDelete={(id) => removeTask(id)}
            />
          </div>
        )}
      </div>

      <AddTaskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={async ({ title, status, priority }) => {
          await addTask(title, { status, priority });
        }}
      />
    </div>
  );
}
