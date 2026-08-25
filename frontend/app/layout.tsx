import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Pyramid',
  description: 'Let\u2019s get back on track.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-[var(--color-ink)] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
