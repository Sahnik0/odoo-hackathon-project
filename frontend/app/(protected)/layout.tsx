'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AppNav } from '@/components/app-nav';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  // Gate rendering until the silent-refresh bootstrap resolves — otherwise a
  // logged-in user briefly flashes a redirect to /login on every hard reload.
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-parchment" />;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-parchment">
      <AppNav />
      <main className="mx-auto max-w-[1200px] px-6 py-10">{children}</main>
    </div>
  );
}
