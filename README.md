# Pyramid

A Kanban-style task manager: Next.js (App Router) + Tailwind CSS frontend,
NestJS + TypeORM (SQLite) backend, JWT auth with guest login and optional
Google OAuth.

## Status

**Working (verified end-to-end):** guest login, Google OAuth (needs your own
credentials), workspaces, tasks (board + list views, drag-and-drop, subtasks,
comments, activity log), task detail page, **projects** (list with inline
status/priority/lead/due-date editing, priority filter, project-scoped task
board/list with breadcrumb navigation), and **profile settings** (name,
title, username, email, leave-workspace with an owner-can't-leave guard).

**Known gaps / simplifications:**
- No profile picture upload — the avatar is always the colored-initials
  circle, there's no file storage in this scaffold.
- The Projects "Fields" menu only covers Status/Priority/Lead/Due Date.
  Members, Teams, Labels, and Reporter aren't modeled on the Project entity
  yet (Tasks already support Members/Labels/Reporter — extending those to
  Projects would mean adding a Team entity and a project-members join table).
- `/profile/theme` and `/profile/color` are placeholder pages (present in
  the settings nav, not wired to any actual theming yet).
- No real-time collaboration (no websockets).

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # already present; edit if needed
npm run start:dev
```

Runs on `http://localhost:4000`, all routes under `/api` (e.g.
`http://localhost:4000/api/auth/guest`). Uses a local SQLite file
(`pyramid.sqlite`, created automatically) — no external database needed.

To enable **Login with Google**, create OAuth credentials at
https://console.cloud.google.com/apis/credentials (authorized redirect URI:
`http://localhost:4000/api/auth/google/callback`), then fill in
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `backend/.env`. Without it,
the button shows a friendly "not configured" message instead of crashing —
guest login always works.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # already present; edit if needed
npm run dev
```

Runs on `http://localhost:3000`.

**Important — deployment:** `NEXT_PUBLIC_API_URL` in `.env.local` must be the
**full URL** of your backend (e.g. `https://your-backend.onrender.com/api`),
never a relative `/api` path. If you deploy the frontend and backend to
different origins (e.g. frontend on Vercel, backend on Render), a relative
path resolves against the frontend's own domain and silently 404s — every
API call in `lib/api.ts` is built from this env var for that reason.

## 3. Try it

1. Start the backend, then the frontend.
2. Open `http://localhost:3000` → redirects to `/login`.
3. Click **Continue as Guest** — creates a guest user + a default workspace.
4. You land on `/tasks`. Toggle Board/List from the **Fields** menu, drag
   cards between columns, click a card to open its detail page (subtasks,
   comments, activity log, due date, priority, members).
5. Visit `/projects` to create projects, then click one to see its
   project-scoped task board/list with a "Projects › Name" breadcrumb.
6. Click your name at the bottom of the sidebar → **Profile settings** to
   edit your name/title/username/email or leave the workspace.

## Project structure

```
backend/            NestJS API (TypeORM + SQLite)
  src/
    auth/            guest + Google OAuth, JWT
    users/           profile fields + PATCH /users/me
    workspaces/      including POST /workspaces/:id/leave
    projects/        full CRUD
    tasks/           tasks (optionally scoped to a project), subtasks,
                     comments, activity log

frontend/            Next.js App Router + Tailwind CSS
  app/
    login/
    auth/callback/   handles the Google OAuth redirect
    (app)/           protected shell (main Sidebar + auth guard)
      tasks/          board/list view
      tasks/[taskId]/ task detail page
      projects/       projects list
      projects/[projectId]/  tasks scoped to one project
    profile/          separate settings shell (its own sidebar)
      theme/, color/  placeholder pages
  components/         Sidebar, SettingsSidebar, TaskBoard, pickers, etc.
  lib/                api client, auth context, shared types
```

## Extending it

- **Profile picture upload**: would need an object-storage endpoint (S3/R2/
  local disk) plus a `PATCH /users/me` multipart route — the `avatarUrl`
  column already exists on `User`, it's just never set today.
- **Theme / Color pages**: currently static placeholders; wiring up an actual
  theme toggle would mean adding a CSS class switch + persisting the choice
  (e.g. another field on `User`, or just `localStorage`).
- **Real-time / multiplayer**: none of this is wired up yet (no websockets).
