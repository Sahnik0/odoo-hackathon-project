'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else {
      router.replace(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, isLoading, router]);

  return <div className="min-h-screen bg-parchment" />;
}
