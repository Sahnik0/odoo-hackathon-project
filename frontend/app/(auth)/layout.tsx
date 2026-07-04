import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Link href="/">
            <Logo />
          </Link>
          <p className="mt-2 text-[16px] text-graphite">Every workday, perfectly aligned.</p>
        </div>
        {children}
      </div>
    </main>
  );
}
