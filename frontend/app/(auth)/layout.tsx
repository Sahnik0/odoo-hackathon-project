import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-parchment px-4 py-16">
      {/* Ambient corner washes for depth */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-periwinkle-mist/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />

      <div className="relative w-full max-w-[480px]">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <p className="mt-3 text-[15px] text-graphite">Every workday, perfectly aligned.</p>
        </div>
        {children}
      </div>
    </main>
  );
}
