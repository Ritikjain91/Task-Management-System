import type { User } from '@/lib/types';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-[11px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
} as const;

export function Avatar({
  user,
  size = 'sm',
  className = '',
}: {
  user: User;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        title={user.name}
        className={`inline-block shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    );
  }

  return (
    <span
      title={user.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white ${SIZES[size]} ${className}`}
      style={{ backgroundColor: user.avatarColor }}
    >
      {initials(user.name)}
    </span>
  );
}

export function AvatarStack({ users, max = 3 }: { users: User[]; max?: number }) {
  if (!users.length) {
    return <span className="text-sm text-[var(--color-ink-faint)]">—</span>;
  }
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((u) => (
        <Avatar key={u.id} user={u} size="sm" className="ring-2 ring-white" />
      ))}
      {extra > 0 && (
        <span className="ml-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-canvas-subtle)] text-[11px] font-medium text-[var(--color-ink-muted)] ring-2 ring-white">
          +{extra}
        </span>
      )}
    </div>
  );
}
