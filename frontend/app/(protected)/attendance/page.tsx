'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LogIn, LogOut, Clock3 } from 'lucide-react';
import { useMyAttendance, useCheckIn, useCheckOut } from '@/hooks/use-attendance';
import { apiErrorMessage } from '@/lib/axios';
import { isoToDateKey } from '@/lib/date';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Calendar, CalendarLegend, type CalendarMarkerTone } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { AttendanceView } from '@/types/attendance';

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatHours(minutes: number | null) {
  if (minutes === null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

const VIEWS: { value: AttendanceView; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This week' },
  { value: 'monthly', label: 'This month' },
];

export default function AttendancePage() {
  const [view, setView] = useState<AttendanceView>('monthly');
  const { data, isLoading } = useMyAttendance(view);
  const { data: monthData } = useMyAttendance('monthly');
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const today = new Date().toISOString().slice(0, 10);
  const todayRow = monthData?.data.find((r) => r.date.slice(0, 10) === today);

  const markers = useMemo(() => {
    const m: Record<string, CalendarMarkerTone> = {};
    for (const rec of monthData?.data ?? []) {
      const key = isoToDateKey(rec.date);
      m[key] =
        rec.status === 'PRESENT'
          ? 'present'
          : rec.status === 'ABSENT'
            ? 'absent'
            : rec.status === 'HALF_DAY'
              ? 'half'
              : 'leave';
    }
    return m;
  }, [monthData]);

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, HALF_DAY: 0, LEAVE: 0 };
    for (const rec of monthData?.data ?? []) c[rec.status] += 1;
    return c;
  }, [monthData]);

  async function handleCheckIn() {
    try {
      await checkInMutation.mutateAsync();
      toast.success('Checked in');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCheckOut() {
    try {
      await checkOutMutation.mutateAsync();
      toast.success('Checked out');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">Attendance</h1>
        <p className="mt-1.5 text-[15px] text-graphite">Check in and out, and review your history.</p>
      </div>

      {/* Today check-in / check-out */}
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Metric icon={LogIn} label="Check-in" value={formatTime(todayRow?.checkIn ?? null)} />
            <Metric icon={LogOut} label="Check-out" value={formatTime(todayRow?.checkOut ?? null)} />
            <Metric icon={Clock3} label="Worked" value={formatHours(todayRow?.workedMinutes ?? null)} />
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] uppercase tracking-[0.04em] text-smoke">Status</span>
              {todayRow ? <StatusBadge status={todayRow.status} /> : <span className="text-[15px] text-smoke">—</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleCheckIn}
              disabled={!!todayRow?.checkIn || checkInMutation.isPending}
            >
              {checkInMutation.isPending ? 'Checking in…' : 'Check in'}
            </Button>
            <Button
              variant="default"
              onClick={handleCheckOut}
              disabled={!todayRow?.checkIn || !!todayRow?.checkOut || checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? 'Checking out…' : 'Check out'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Monthly calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly view</CardTitle>
            <CardDescription>Present / absent markers for each day.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-[18px] border border-line bg-surface-raised p-4">
              <Calendar markers={markers} />
            </div>
            <CalendarLegend
              items={[
                { tone: 'present', label: 'Present' },
                { tone: 'absent', label: 'Absent' },
                { tone: 'half', label: 'Half-day' },
                { tone: 'leave', label: 'Leave' },
              ]}
            />
            <div className="grid grid-cols-4 gap-2 border-t border-line pt-4">
              <Count label="Present" value={counts.PRESENT} tone="text-[#1f9d57]" />
              <Count label="Absent" value={counts.ABSENT} tone="text-coral" />
              <Count label="Half" value={counts.HALF_DAY} tone="text-crimson" />
              <Count label="Leave" value={counts.LEAVE} tone="text-lake-blue" />
            </div>
          </CardContent>
        </Card>

        {/* History list */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>History</CardTitle>
            <div className="flex gap-1 rounded-full border border-line bg-surface-raised p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setView(v.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[12px] font-medium uppercase tracking-tight transition-colors',
                    view === v.value ? 'bg-off-black text-white' : 'text-graphite hover:text-off-black',
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : !data || data.data.length === 0 ? (
              <EmptyState title="No records" description="Nothing checked in for this period yet." icon={Clock3} />
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {data.data.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="w-28 text-[14px] text-off-black">
                      {new Date(row.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex-1 text-[13px] text-graphite">
                      {formatTime(row.checkIn)} – {formatTime(row.checkOut)}
                    </span>
                    <span className="w-16 text-right text-[13px] text-graphite">{formatHours(row.workedMinutes)}</span>
                    <StatusBadge status={row.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.04em] text-smoke">
        <Icon size={13} className="text-smoke" />
        {label}
      </span>
      <span className="text-[19px] tabular-nums text-off-black">{value}</span>
    </div>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn('font-serif text-[24px] leading-none', tone)}>{value}</span>
      <span className="text-[11px] uppercase tracking-tight text-smoke">{label}</span>
    </div>
  );
}
