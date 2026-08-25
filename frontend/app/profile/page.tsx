'use client';

import { useRef, useState } from 'react';
import { Camera, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { Avatar } from '@/components/Avatar';

const MAX_AVATAR_DIMENSION = 256;

// Reads an image file, downsizes it to keep the payload small, and returns
// a JPEG data URL we can store directly on the user (no file storage/CDN yet).
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that image'));
      img.onload = () => {
        const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(img.width, img.height));
        const size = Math.round(Math.max(img.width, img.height) * scale);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not process that image'));
        // Crop to a centered square so the circular avatar isn't stretched.
        const cropDim = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - cropDim) / 2,
          (img.height - cropDim) / 2,
          cropDim,
          cropDim,
          0,
          0,
          size,
          size,
        );
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
        {hint && <p className="text-xs text-[var(--color-ink-faint)]">{hint}</p>}
      </div>
      <div className="w-full shrink-0 sm:w-64">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser, activeWorkspace, refreshWorkspaces, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await save({ avatarUrl: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that image');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setUploadingAvatar(true);
    try {
      await save({ avatarUrl: null });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function save(data: Partial<Pick<NonNullable<typeof user>, 'name' | 'title' | 'username' | 'email' | 'avatarUrl'>>) {
    setError(null);
    try {
      await api.updateMe(data);
      await refreshUser();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
    }
  }

  async function handleLeaveWorkspace() {
    if (!activeWorkspace) return;
    if (!window.confirm(`Leave "${activeWorkspace.name}"?`)) return;
    setLeaving(true);
    try {
      await api.leaveWorkspace(activeWorkspace.id);
      await refreshWorkspaces();
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="max-w-2xl px-4 py-6 sm:px-10 sm:py-10">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-priority-urgent)]">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-[var(--color-border)]">
        <FieldRow label="Profile picture" hint="JPG or PNG, square images look best">
          <div className="flex items-center justify-end gap-3">
            {user.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-xs text-[var(--color-ink-faint)] underline underline-offset-2 hover:text-[var(--color-ink-muted)] disabled:opacity-50"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
              title="Change profile picture"
            >
              <Avatar user={user} size="lg" />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={14} className="text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              className="hidden"
            />
          </div>
        </FieldRow>

        <FieldRow label="Email">
          <div className="flex items-center justify-end gap-2">
            {editingEmail ? (
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (setEditingEmail(false), save({ email }))}
                onBlur={() => {
                  setEditingEmail(false);
                  if (email !== user.email) save({ email });
                }}
                className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            ) : (
              <>
                <span className="truncate text-sm text-[var(--color-ink-muted)]">
                  {user.email ?? 'Add an email'}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingEmail(true)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-canvas-subtle)] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
                >
                  <Pencil size={12} />
                </button>
              </>
            )}
          </div>
        </FieldRow>

        <FieldRow label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name !== user.name && save({ name: name.trim() })}
            className="w-full rounded-lg bg-[var(--color-canvas-subtle)] px-2.5 py-1.5 text-sm text-[var(--color-ink-muted)] outline-none focus:bg-white focus:text-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </FieldRow>

        <FieldRow label="Title" hint="Your job title or role">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== (user.title ?? '') && save({ title })}
            placeholder="Designer"
            className="w-full rounded-lg bg-[var(--color-canvas-subtle)] px-2.5 py-1.5 text-sm text-[var(--color-ink-muted)] outline-none placeholder:text-[var(--color-ink-faint)] focus:bg-white focus:text-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </FieldRow>

        <FieldRow label="Username" hint="One word, like a nickname or first name">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
            onBlur={() => username !== (user.username ?? '') && save({ username })}
            placeholder="username"
            className="w-full rounded-lg bg-[var(--color-canvas-subtle)] px-2.5 py-1.5 text-sm text-[var(--color-ink-muted)] outline-none placeholder:text-[var(--color-ink-faint)] focus:bg-white focus:text-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </FieldRow>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Workspace access</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-4 sm:px-5">
        <p className="text-sm text-[var(--color-ink-faint)]">
          Remove yourself from the workspace
        </p>
        <button
          type="button"
          onClick={handleLeaveWorkspace}
          disabled={leaving}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-[var(--color-priority-urgent)] hover:bg-red-100 disabled:opacity-50"
        >
          {leaving ? 'Leaving…' : 'Leave Workspace'}
        </button>
      </div>

      {user.isGuest && (
        <p className="mt-6 text-xs text-[var(--color-ink-faint)]">
          You&rsquo;re signed in as a guest — this profile only persists on this device.{' '}
          <button
            type="button"
            onClick={logout}
            className="underline underline-offset-2 hover:text-[var(--color-ink-muted)]"
          >
            Sign out
          </button>{' '}
          and use &ldquo;Login with Google&rdquo; to keep it permanently.
        </p>
      )}
    </div>
  );
}
