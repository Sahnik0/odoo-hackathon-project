'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Users, Clock, CalendarCheck, IndianRupee, ArrowUpRight, UserCheck, Hourglass, Plane } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEmployeeList } from '@/hooks/use-employees';
import { useAttendanceList } from '@/hooks/use-attendance';
import { useLeaveList, useReviewLeave } from '@/hooks/use-leave';
import { apiErrorMessage } from '@/lib/axios';
import { toDateKey } from '@/lib/date';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { RevealGroup, RevealItem } from '@/components/ui/reveal';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  const today = toDateKey(new Date());
  const { data: employees, isLoading: empLoading } = useEmployeeList({ pageSize: 6 });
  const { data: todayAttendance } = useAttendanceList({ pageSize: 50, dateFrom: today, dateTo: today });
  const { data: pendingLeaves } = useLeaveList({ pageSize: 5, status: 'PENDING' });
  const reviewMutation = useReviewLeave();

  const headcount = employees?.meta.total ?? 0;
  const presentToday = todayAttendance?.data.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length ?? 0;
  const onLeaveToday = todayAttendance?.data.filter((r) => r.status === 'LEAVE').length ?? 0;
  const pendingCount = pendingLeaves?.meta.total ?? 0;

  async function review(id: string, decision: 'APPROVED' | 'REJECTED') {
    try {
      await reviewMutation.mutateAsync({ id, status: decision });
      toast.success(`Leave ${decision.toLowerCase()}`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">Admin dashboard</h1>
          <p className="mt-1.5 text-[15px] text-graphite">Your organization at a glance — {user?.email}</p>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/employees">Add employee ▸</Link>
        </Button>
      </div>

      {/* Stat tiles */}
      <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} label="Employees" value={headcount} tone="bg-sky-blue/30" loading={empLoading} />
        <StatTile icon={UserCheck} label="Present today" value={presentToday} tone="bg-mint/40" />
        <StatTile icon={Hourglass} label="Pending leaves" value={pendingCount} tone="bg-gold/40" />
        <StatTile icon={Plane} label="On leave today" value={onLeaveToday} tone="bg-coral/30" />
      </RevealGroup>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Pending leave approvals */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Leave approvals</CardTitle>
              <CardDescription>Requests awaiting your decision.</CardDescription>
            </div>
            <Link
              href="/admin/leave"
              className="flex items-center gap-1 text-[13px] uppercase tracking-tight text-lake-blue hover:underline"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            {!pendingLeaves ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : pendingLeaves.data.length === 0 ? (
              <EmptyState title="All caught up" description="No leave requests pending review." icon={CalendarCheck} />
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {pendingLeaves.data.map((req) => (
                  <div key={req.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-off-black">
                        {req.employeeProfile?.firstName} {req.employeeProfile?.lastName}{' '}
                        <span className="text-graphite">· {req.type}</span>
                      </p>
                      <p className="text-[12px] text-graphite">
                        {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()} (
                        {req.days}d)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={reviewMutation.isPending}
                        onClick={() => review(req.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={reviewMutation.isPending}
                        onClick={() => review(req.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee switcher / roster */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Jump to a profile.</CardDescription>
            </div>
            <Link
              href="/admin/employees"
              className="flex items-center gap-1 text-[13px] uppercase tracking-tight text-lake-blue hover:underline"
            >
              All <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            {empLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !employees || employees.data.length === 0 ? (
              <EmptyState title="No employees yet" icon={Users} />
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {employees.data.map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/admin/employees/${emp.id}`}
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-periwinkle-mist/60 text-[13px] font-medium text-off-black">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-off-black group-hover:text-lake-blue">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="truncate text-[11px] uppercase tracking-tight text-smoke">
                          {emp.department || emp.companyName || 'No department'}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="shrink-0 text-smoke transition-colors group-hover:text-off-black" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/admin/employees', icon: Users, title: 'Employees', body: 'Manage accounts and profiles' },
          { href: '/admin/attendance', icon: Clock, title: 'Attendance', body: 'Records across the team' },
          { href: '/admin/leave', icon: CalendarCheck, title: 'Leave', body: 'Approve or reject requests' },
          { href: '/admin/payroll', icon: IndianRupee, title: 'Payroll', body: 'Salary structures & payslips' },
        ].map((c) => (
          <RevealItem key={c.href}>
            <Link href={c.href}>
              <Card interactive className="group flex h-full flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-off-black/[0.05] text-off-black transition-colors group-hover:bg-off-black group-hover:text-white">
                  <c.icon size={19} />
                </span>
                <div>
                  <h3 className="font-serif text-[19px] tracking-tight text-off-black">{c.title}</h3>
                  <p className="mt-0.5 text-[13px] text-graphite">{c.body}</p>
                </div>
              </Card>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  tone: string;
  loading?: boolean;
}) {
  return (
    <RevealItem>
      <Card className="flex flex-col gap-3 p-6">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${tone} text-off-black`}>
          <Icon size={18} />
        </span>
        <div>
          {loading ? (
            <Skeleton className="h-9 w-14" />
          ) : (
            <span className="font-serif text-[34px] font-normal leading-none tracking-tight text-off-black tabular-nums">
              {value}
            </span>
          )}
          <p className="mt-1.5 text-[12px] uppercase tracking-[0.04em] text-smoke">{label}</p>
        </div>
      </Card>
    </RevealItem>
  );
}
