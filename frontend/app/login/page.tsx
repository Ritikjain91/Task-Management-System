'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Triangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.62 8.62 0 0 0 9 0 9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function LoginCard() {
  const { loginAsGuest } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const params = useSearchParams();
  const showGoogleError = params.get('error') === 'google_not_configured';

  async function handleGuest() {
    setSubmitting(true);
    try {
      await loginAsGuest();
    } catch {
      setSubmitting(false);
    }
  }

  function handleGoogle() {
    window.location.href = api.googleLoginUrl();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas-subtle)] px-4">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
          <Triangle size={15} fill="currentColor" />
        </span>
        <span className="text-base font-semibold tracking-tight">Pyramid</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm shadow-black/[0.03]">
        <h1 className="text-center text-lg font-semibold text-[var(--color-ink)]">
          Let&rsquo;s get back on track
        </h1>
        <p className="mt-1.5 text-center text-sm text-[var(--color-ink-muted)]">
          Continue as a guest, or sign in with Google to sync your workspace.
        </p>

        {showGoogleError && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Google sign-in isn&rsquo;t configured on this server yet. Continue as a guest instead,
            or add Google OAuth credentials to the backend&rsquo;s .env file.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGuest}
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Continue as Guest'}
          </button>
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas-subtle)]"
          >
            <GoogleIcon />
            Login with Google
          </button>
        </div>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-[var(--color-ink-faint)]">
        By clicking continue, you agree to our{' '}
        <a href="#" className="underline underline-offset-2 hover:text-[var(--color-ink-muted)]">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="underline underline-offset-2 hover:text-[var(--color-ink-muted)]">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  );
}
