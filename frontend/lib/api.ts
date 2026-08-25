import type { Comment, Project, Subtask, Task, User, Workspace } from './types';

// IMPORTANT: always call the backend via its full URL from an env var.
// Never use a relative "/api/..." path here — if the frontend (e.g. Vercel)
// and backend (e.g. Render) are deployed to different origins, a relative
// path resolves against the frontend's own domain and silently 404s.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const TOKEN_KEY = 'pyramid_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  loginGuest: (name?: string) =>
    request<{ token: string; user: User; workspaceId: string }>('/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  me: () => request<User>('/auth/me'),
  updateMe: (
    data: Partial<Pick<User, 'name' | 'title' | 'username' | 'email' | 'avatarUrl'>>,
  ) => request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  googleLoginUrl: () => `${API_URL}/auth/google`,

  // Users
  searchUsers: (q: string) => request<User[]>(`/users/search?q=${encodeURIComponent(q)}`),

  // Workspaces
  listWorkspaces: () => request<Workspace[]>('/workspaces'),
  createWorkspace: (name: string) =>
    request<Workspace>('/workspaces', { method: 'POST', body: JSON.stringify({ name }) }),
  getWorkspace: (id: string) => request<Workspace>(`/workspaces/${id}`),
  leaveWorkspace: (id: string) => request<{ success: boolean }>(`/workspaces/${id}/leave`, { method: 'POST' }),

  // Projects
  listProjects: (workspaceId: string) =>
    request<Project[]>(`/projects?workspaceId=${workspaceId}`),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project> & { workspaceId: string; name: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  listTasks: (workspaceId: string, projectId?: string) =>
    request<Task[]>(
      `/tasks?workspaceId=${workspaceId}${projectId ? `&projectId=${projectId}` : ''}`,
    ),
  getTask: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (data: {
    workspaceId: string;
    projectId?: string;
    title: string;
    status?: string;
    priority?: string;
  }) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Record<string, unknown>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Subtasks
  addSubtask: (taskId: string, data: { title: string; priority?: string }) =>
    request<Subtask>(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSubtask: (subtaskId: string, data: Record<string, unknown>) =>
    request<Subtask>(`/tasks/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteSubtask: (subtaskId: string) =>
    request(`/tasks/subtasks/${subtaskId}`, { method: 'DELETE' }),

  // Comments
  addComment: (taskId: string, content: string) =>
    request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};
