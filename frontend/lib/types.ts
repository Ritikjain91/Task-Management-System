export type TaskStatus = 'To Do' | 'Doing' | 'Completed' | 'On Hold';
export type TaskPriority = 'No Priority' | 'Low' | 'Medium' | 'High' | 'Urgent';
export type ProjectStatus = 'Todo' | 'Doing' | 'Done';
export type ProjectPriority = 'No priority' | 'Low' | 'Medium' | 'High' | 'Urgent';

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'Doing', 'Completed', 'On Hold'];
export const TASK_PRIORITIES: TaskPriority[] = [
  'No Priority',
  'Low',
  'Medium',
  'High',
  'Urgent',
];
export const PROJECT_STATUSES: ProjectStatus[] = ['Todo', 'Doing', 'Done'];
export const PROJECT_PRIORITIES: ProjectPriority[] = [
  'No priority',
  'Low',
  'Medium',
  'High',
  'Urgent',
];

export interface User {
  id: string;
  name: string;
  title: string | null;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  avatarColor: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  owner: User;
  members: User[];
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  lead: User | null;
  leadId: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  priority: TaskPriority;
  members: User[];
  dueDate: string | null;
  done: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  author: User;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  taskId: string;
  user: User;
  userId: string;
  message: string;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string | null;
  project: Project | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  resources: string[];
  members: User[];
  reporter: User | null;
  reporterId: string | null;
  dueDate: string | null;
  order: number;
  subtasks?: Subtask[];
  comments?: Comment[];
  activity?: Activity[];
  createdAt: string;
  updatedAt: string;
}
