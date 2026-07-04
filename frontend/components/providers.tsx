'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session, created lazily so it isn't shared
  // across requests during SSR (Next.js App Router gotcha).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#f6f3f1',
              border: '1px solid #cecac8',
              color: '#242424',
              fontFamily: 'var(--font-mono)',
              borderRadius: '16px',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
