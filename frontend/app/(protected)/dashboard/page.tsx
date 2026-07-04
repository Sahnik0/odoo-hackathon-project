'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Users, Clock, CalendarCheck, IndianRupee, ArrowUpRight, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMyProfile } from '@/hooks/use-employees';
import { useMyAttendance } from '@/hooks/use-attendance';
import { useMyLeaveBalance } from '@/hooks/use-leave';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { RevealGroup, RevealItem } from '@/components/ui/reveal';

const CARDS = [
  { href: '/profile', icon: Users, title: 'Profile', body: 'View and edit your details' },
  { href: '/attendance', icon: Clock, title: 'Attendance', body: 'Check in / check out' },
  { href: '/leave', icon: CalendarCheck, title: 'Leave', body: 'Apply and track status' },
  { href: '/payroll', icon: IndianRupee, title: 'Payroll', body: 'View your payslips' },
];

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const { data: attendance } = useMyAttendance('daily');
  const { data: balances } = useMyLeaveBalance();

  useEffect(() => {
    if (user?.role === 'ADMIN') router.replace('/admin/dashboard');
  }, [user, router]);

  const today = new Date().toISOString().slice(0, 10);
  const todayRow = attendance?.data.find((r) => r.date.slice(0, 10) === today);
  const paidLeft = useMemo(() => balances?.find((b) => b.type === 'PAID')?.remaining ?? null, [balances]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">
          Welcome back{profile ? `, ${profile.firstName}` : ''}
        </h1>
        <p className="mt-1.5 text-[15px] text-graphite">{user?.email}</p>
      </div>

      {/* Summary strip */}
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RevealItem>
          <Card className="flex items-center justify-between p-6">
            <div>
              <p className="text-[12px] uppercase tracking-[0.04em] text-smoke">Today</p>
              <p className="mt-1.5 text-[16px] text-off-black">
                {todayRow?.checkIn
                  ? `In at ${new Date(todayRow.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Not checked in'}
              </p>
            </div>
            {todayRow ? (
              <StatusBadge status={todayRow.status} />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint/40 text-off-black">
                <LogIn size={18} />
              </span>
            )}
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="flex items-center justify-between p-6">
            <div>
              <p className="text-[12px] uppercase tracking-[0.04em] text-smoke">Paid leave left</p>
              <p className="mt-1.5 font-serif text-[26px] leading-none tracking-tight text-off-black">
                {paidLeft === null ? '—' : paidLeft}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/40 text-off-black">
              <CalendarCheck size={18} />
            </span>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="flex items-center justify-between p-6">
            <div>
              <p className="text-[12px] uppercase tracking-[0.04em] text-smoke">Status</p>
              <p className="mt-1.5 text-[16px] text-off-black">{profile?.designation ?? 'Employee'}</p>
            </div>
            {profile && <StatusBadge status={profile.employmentStatus} />}
          </Card>
        </RevealItem>
      </RevealGroup>

      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <RevealItem key={c.href}>
            <Link href={c.href}>
              <Card interactive className="group flex h-full flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-off-black/[0.05] text-off-black transition-colors group-hover:bg-off-black group-hover:text-white">
                  <c.icon size={19} />
                </span>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-[19px] tracking-tight text-off-black">{c.title}</h3>
                    <p className="mt-0.5 text-[13px] text-graphite">{c.body}</p>
                  </div>
                  <ArrowUpRight size={16} className="mt-1 text-smoke transition-colors group-hover:text-off-black" />
                </div>
              </Card>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
