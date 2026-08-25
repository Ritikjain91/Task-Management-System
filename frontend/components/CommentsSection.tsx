'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { Comment, User } from '@/lib/types';
import { Avatar } from './Avatar';
import { api } from '@/lib/api';

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommentsSection({
  taskId,
  comments,
  currentUser,
  onChange,
}: {
  taskId: string;
  comments: Comment[];
  currentUser: User;
  onChange: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const content = draft.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await api.addComment(taskId, content);
      setDraft('');
      onChange();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2.5">
          <Avatar user={c.author} size="sm" />
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{c.author.name}</span>
              <span className="text-xs text-[var(--color-ink-faint)]">
                {timeAgo(c.createdAt)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{c.content}</p>
          </div>
        </div>
      ))}

      <div className="flex items-start gap-2.5">
        <Avatar user={currentUser} size="sm" />
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Leave a reply…"
            className="flex-1 text-sm outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !draft.trim()}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink-faint)] hover:bg-[var(--color-canvas-subtle)] hover:text-[var(--color-accent)] disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { timeAgo };
