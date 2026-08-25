'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Project } from './types';

export function useProjects(workspaceId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      setProjects(await api.listProjects(workspaceId));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const patchProject = useCallback(async (id: string, data: Record<string, unknown>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } as Project : p)));
    const updated = await api.updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const removeProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await api.deleteProject(id);
  }, []);

  const addProject = useCallback(
    async (name: string) => {
      if (!workspaceId) return;
      const created = await api.createProject({ workspaceId, name });
      setProjects((prev) => [created, ...prev]);
      return created;
    },
    [workspaceId],
  );

  return { projects, loading, reload, patchProject, removeProject, addProject };
}
