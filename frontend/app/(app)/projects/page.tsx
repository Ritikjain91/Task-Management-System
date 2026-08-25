'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useProjects } from '@/lib/useProjects';
import type { ProjectPriority } from '@/lib/types';
import { DatePicker, formatDate } from '@/components/DatePicker';
import { ProjectFieldsMenu, PriorityFilter, type ProjectFieldKey } from '@/components/ProjectFieldsMenu';
import { ProjectStatusPicker, ProjectPriorityPicker, LeadPicker } from '@/components/ProjectPickers';
import { Popover, PopoverItem } from '@/components/Popover';

const DEFAULT_FIELDS: Record<ProjectFieldKey, boolean> = {
  status: true,
  priority: true,
  lead: true,
  dueDate: true,
};

export default function ProjectsPage() {
  const router = useRouter();
  const { activeWorkspace } = useAuth();
  const { projects, loading, patchProject, removeProject, addProject } = useProjects(
    activeWorkspace?.id,
  );

  const [fields, setFields] = useState<Record<ProjectFieldKey, boolean>>(DEFAULT_FIELDS);
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | null>(null);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('pyramid_project_fields');
    if (stored) {
      try {
        setFields(JSON.parse(stored));
      } catch {
        // ignore malformed value
      }
    }
  }, []);

  function toggleField(key: ProjectFieldKey) {
    setFields((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      window.localStorage.setItem('pyramid_project_fields', JSON.stringify(next));
      return next;
    });
  }

  const workspaceMembers = activeWorkspace?.members ?? [];

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (priorityFilter && p.priority !== priorityFilter) return false;
      if (query.trim() && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [projects, priorityFilter, query]);

  async function submitDraft() {
    const name = draft.trim();
    setAdding(false);
    setDraft('');
    if (name) await addProject(name);
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-sm text-[var(--color-ink-faint)]">
            {activeWorkspace?.name ?? 'Workspace'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full rounded-lg border border-[var(--color-border)] py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)] sm:w-52"
            />
          </div>
          <ProjectFieldsMenu fields={fields} onToggleField={toggleField} />
          <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            <Plus size={14} />
            Add Project
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {loading ? (
          <p className="text-sm text-[var(--color-ink-faint)]">Loading projects…</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas-subtle)] text-left text-xs font-medium text-[var(--color-ink-faint)]">
                  <th className="px-3 py-2 font-medium">Projects</th>
                  {fields.status && <th className="w-28 px-3 py-2 font-medium">Status</th>}
                  {fields.priority && <th className="w-32 px-3 py-2 font-medium">Priority</th>}
                  {fields.lead && <th className="w-36 px-3 py-2 font-medium">Lead</th>}
                  {fields.dueDate && <th className="w-32 px-3 py-2 font-medium">Due Date</th>}
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-canvas-subtle)]/60"
                  >
                    <td
                      onClick={() => router.push(`/projects/${p.id}`)}
                      className="cursor-pointer px-3 py-2.5 font-medium text-[var(--color-ink)]"
                    >
                      {p.name}
                    </td>
                    {fields.status && (
                      <td className="px-3 py-2.5">
                        <ProjectStatusPicker
                          value={p.status}
                          onChange={(status) => patchProject(p.id, { status })}
                        />
                      </td>
                    )}
                    {fields.priority && (
                      <td className="px-3 py-2.5">
                        <ProjectPriorityPicker
                          value={p.priority}
                          onChange={(priority) => patchProject(p.id, { priority })}
                        />
                      </td>
                    )}
                    {fields.lead && (
                      <td className="px-3 py-2.5">
                        <LeadPicker
                          value={p.lead}
                          workspaceMembers={workspaceMembers}
                          onChange={(lead) => patchProject(p.id, { leadId: lead?.id ?? null })}
                        />
                      </td>
                    )}
                    {fields.dueDate && (
                      <td className="px-3 py-2.5">
                        <DatePicker
                          value={p.dueDate}
                          onChange={(iso) => patchProject(p.id, { dueDate: iso })}
                          trigger={({ toggle, display }) => (
                            <button
                              type="button"
                              onClick={toggle}
                              className="rounded-md px-1.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas-subtle)]"
                            >
                              {p.dueDate ? formatDate(p.dueDate) : display}
                            </button>
                          )}
                        />
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
                              removeProject(p.id);
                            }}
                          >
                            <Trash2 size={13} />
                            Delete project
                          </PopoverItem>
                        )}
                      </Popover>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={6} className="px-3 py-2">
                    {adding ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitDraft()}
                        onBlur={submitDraft}
                        placeholder="Project name…"
                        className="w-full text-sm outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
                      >
                        <Plus size={13} />
                        Add Project
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
