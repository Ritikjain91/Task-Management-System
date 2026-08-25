'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Task } from './types';

export function useTasks(workspaceId: string | undefined, projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await api.listTasks(workspaceId, projectId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Optimistically patch a task in local state, then persist to the API.
  const patchTask = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } as Task : t)));
      try {
        const updated = await api.updateTask(id, data);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch {
        reload();
      }
    },
    [reload],
  );

  const removeTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
  }, []);

  const addTask = useCallback(
    async (title: string, extra?: Record<string, unknown>) => {
      if (!workspaceId) return;
      const created = await api.createTask({
        workspaceId,
        title,
        ...(projectId ? { projectId } : {}),
        ...extra,
      });
      setTasks((prev) => [created, ...prev]);
      return created;
    },
    [workspaceId, projectId],
  );

  return { tasks, loading, reload, patchTask, removeTask, addTask };
}
