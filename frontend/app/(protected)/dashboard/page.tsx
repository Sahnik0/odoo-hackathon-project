'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Clock, CalendarCheck, IndianRupee } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const CARDS = [
  { href: '/profile', icon: Users, title: 'Profile', body: 'View and edit your details', tone: 'from-sky-blue/40' },
  { href: '/attendance', icon: Clock, title: 'Attendance', body: 'Check in / check out', tone: 'from-mint/40' },
  {
    href: '/leave',
    icon: CalendarCheck,
    title: 'Leave Requests',
    body: 'Apply and track status',
    tone: 'from-gold/40',
  },
  { href: '/payroll', icon: IndianRupee, title: 'Payroll', body: 'View your payslips', tone: 'from-coral/30' },
];

// Phase 3 delivers the auth shell only — these cards already link to their
// real feature pages (Phase 4-8), each fully wired to the backend.
export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') router.replace('/admin/dashboard');
  }, [user, router]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[40px] font-normal text-off-black">Welcome back</h1>
        <p className="mt-2 text-[16px] text-graphite">{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="relative overflow-hidden rounded-[40px] border border-ash p-10 transition-colors hover:border-off-black"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.tone} to-transparent opacity-60 blur-2xl`} />
            <div className="relative">
              <c.icon size={20} className="text-off-black" />
              <h3 className="mt-4 font-serif text-[24px] font-normal text-off-black">{c.title}</h3>
              <p className="mt-2 text-[16px] text-graphite">{c.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
